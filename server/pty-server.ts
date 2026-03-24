/**
 * PTY WebSocket Server — Phase 5
 *
 * Standalone Node process that bridges WebSocket connections to PTY sessions.
 * Runs on port 3001 alongside the Next.js dev server.
 *
 * Security hardening (S1–S8, Viktor QA Phase 5):
 *   S1 — Bound to 127.0.0.1 (localhost only, not network-exposed)
 *   S2 — MAX_SESSIONS cap prevents resource exhaustion
 *   S3 — Resize values validated (positive integers, bounded 1–500)
 *   S4 — Origin checking rejects cross-site WebSocket hijacking
 *   S5 — Connection rate limiting prevents flood attacks
 *   S6 — PTY_CWD validated (must exist, must be a directory)
 *   S7 — maxPayload limits incoming WebSocket message size
 *   S8 — Token authentication required on first message
 *
 * Protocol:
 *   - First message from client must be: { type: "auth", token: "<server-token>" }
 *   - Text frames from client → PTY stdin
 *   - Text frames from server → PTY stdout
 *   - JSON frames with { type: "resize", cols, rows } → PTY resize
 *   - JSON frames with { type: "ping" } → { type: "pong" } keepalive
 */

import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import * as pty from "node-pty";
import { platform } from "os";
import { randomBytes } from "crypto";
import { existsSync, statSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";

// ─── Configuration ───────────────────────────────────────────────────────────

const PORT = Number(process.env.PTY_PORT) || 3001;
const HOST = "127.0.0.1"; // S1: localhost only — never bind 0.0.0.0
const MAX_SESSIONS = Number(process.env.PTY_MAX_SESSIONS) || 5; // S2: session cap
const MAX_PAYLOAD = 1024 * 1024; // S7: 1 MB max incoming message
const ALLOWED_ORIGINS = (process.env.PTY_ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim()); // S4: allowed origins
const RATE_LIMIT_WINDOW_MS = 60_000; // S5: 1 minute window
const RATE_LIMIT_MAX = 10; // S5: max 10 connections per window per IP
const MIN_COLS = 1; // S3: resize bounds
const MAX_COLS = 500;
const MIN_ROWS = 1;
const MAX_ROWS = 500;

// ─── Shell setup ─────────────────────────────────────────────────────────────

const shell = platform() === "win32" ? "powershell.exe" : "bash";
const shellArgs = platform() === "win32" ? ["-NoLogo"] : [];

// S6: Validate PTY_CWD
function resolveWorkingDirectory(): string {
  const cwd = process.env.PTY_CWD || process.cwd();
  if (!existsSync(cwd)) {
    console.warn(`[pty-server] WARNING: PTY_CWD "${cwd}" does not exist, falling back to process.cwd()`);
    return process.cwd();
  }
  try {
    if (!statSync(cwd).isDirectory()) {
      console.warn(`[pty-server] WARNING: PTY_CWD "${cwd}" is not a directory, falling back to process.cwd()`);
      return process.cwd();
    }
  } catch {
    console.warn(`[pty-server] WARNING: Cannot stat PTY_CWD "${cwd}", falling back to process.cwd()`);
    return process.cwd();
  }
  if (process.env.PTY_CWD) {
    console.log(`[pty-server] PTY_CWD override: ${cwd}`);
  }
  return cwd;
}

const workingDirectory = resolveWorkingDirectory();

// ─── S8: Auth token ──────────────────────────────────────────────────────────

const AUTH_TOKEN = process.env.PTY_AUTH_TOKEN || randomBytes(24).toString("hex");
const TOKEN_FILE = join(process.cwd(), ".pty-auth-token");

// Write token to file so the Next.js client can read it via API route
writeFileSync(TOKEN_FILE, AUTH_TOKEN, { mode: 0o600 });

// ─── Session tracking ────────────────────────────────────────────────────────

interface Session {
  id: string;
  pty: pty.IPty;
  ws: WebSocket;
  authenticated: boolean;
  createdAt: Date;
}

const sessions = new Map<string, Session>();
let sessionCounter = 0;

function generateId(): string {
  return `pty-${++sessionCounter}-${Date.now().toString(36)}`;
}

// ─── S5: Rate limiting ──────────────────────────────────────────────────────

const connectionAttempts = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = connectionAttempts.get(ip) || [];
  const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  connectionAttempts.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempts] of connectionAttempts.entries()) {
    const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) {
      connectionAttempts.delete(ip);
    } else {
      connectionAttempts.set(ip, recent);
    }
  }
}, 5 * 60_000);

// ─── S3: Resize validation ──────────────────────────────────────────────────

function isValidResize(cols: unknown, rows: unknown): cols is number {
  return (
    typeof cols === "number" &&
    typeof rows === "number" &&
    Number.isInteger(cols) &&
    Number.isInteger(rows) &&
    cols >= MIN_COLS &&
    cols <= MAX_COLS &&
    (rows as number) >= MIN_ROWS &&
    (rows as number) <= MAX_ROWS
  );
}

// ─── Server ──────────────────────────────────────────────────────────────────

const wss = new WebSocketServer({
  port: PORT,
  host: HOST, // S1: localhost only
  maxPayload: MAX_PAYLOAD, // S7: limit message size
  verifyClient: (info: { origin: string; req: IncomingMessage }, callback: (res: boolean, code?: number, message?: string) => void) => {
    // S4: Origin checking
    const origin = info.origin || info.req.headers.origin || "";
    if (!ALLOWED_ORIGINS.includes(origin)) {
      console.warn(`[pty-server] rejected connection from origin: ${origin}`);
      callback(false, 403, "Origin not allowed");
      return;
    }

    // S5: Rate limiting
    const ip = info.req.socket.remoteAddress || "unknown";
    if (isRateLimited(ip)) {
      console.warn(`[pty-server] rate limited: ${ip}`);
      callback(false, 429, "Too many connections");
      return;
    }

    callback(true);
  },
});

// Handle server errors (e.g., port already in use)
wss.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[pty-server] ERROR: Port ${PORT} is already in use.`);
    console.error(`[pty-server] Kill the stale process or set PTY_PORT=<other port>`);
    process.exit(1);
  }
  console.error(`[pty-server] ERROR:`, err.message);
  process.exit(1);
});

console.log(`[pty-server] listening on ws://${HOST}:${PORT}`);
console.log(`[pty-server] auth token: ${AUTH_TOKEN}`);
console.log(`[pty-server] allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
console.log(`[pty-server] max sessions: ${MAX_SESSIONS}`);

wss.on("connection", (ws: WebSocket) => {
  // S2: Check session limit before spawning PTY
  if (sessions.size >= MAX_SESSIONS) {
    console.warn(`[pty-server] session limit reached (${MAX_SESSIONS}), rejecting connection`);
    ws.send(JSON.stringify({ type: "error", message: `Session limit reached (max ${MAX_SESSIONS})` }));
    ws.close(1013, "Session limit reached");
    return;
  }

  const id = generateId();

  // S8: Connection starts unauthenticated — no PTY spawned until auth succeeds
  const session: Session = {
    id,
    pty: null as unknown as pty.IPty, // Set after auth
    ws,
    authenticated: false,
    createdAt: new Date(),
  };
  sessions.set(id, session);

  // S8: Auth timeout — disconnect if not authenticated within 5 seconds
  const authTimeout = setTimeout(() => {
    if (!session.authenticated) {
      console.warn(`[pty-server] session ${id} auth timeout`);
      ws.send(JSON.stringify({ type: "error", message: "Authentication timeout" }));
      ws.close(1008, "Authentication timeout");
      sessions.delete(id);
    }
  }, 5000);

  ws.on("message", (raw: Buffer | string) => {
    const msg = raw.toString();

    // S8: First message must be auth
    if (!session.authenticated) {
      try {
        const ctrl = JSON.parse(msg);
        if (ctrl.type === "auth" && ctrl.token === AUTH_TOKEN) {
          clearTimeout(authTimeout);
          session.authenticated = true;

          // Now spawn the PTY
          const ptyProcess = pty.spawn(shell, shellArgs, {
            name: "xterm-256color",
            cols: 120,
            rows: 30,
            cwd: workingDirectory,
          });

          session.pty = ptyProcess;
          console.log(`[pty-server] session ${id} authenticated + started (pid ${ptyProcess.pid})`);

          ws.send(JSON.stringify({ type: "session", id }));

          // PTY stdout → WebSocket
          ptyProcess.onData((data: string) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(data);
            }
          });

          ptyProcess.onExit(({ exitCode }) => {
            console.log(`[pty-server] session ${id} exited (code ${exitCode})`);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "exit", code: exitCode }));
              ws.close();
            }
            sessions.delete(id);
          });
        } else {
          console.warn(`[pty-server] session ${id} invalid auth`);
          ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
          ws.close(1008, "Invalid token");
          clearTimeout(authTimeout);
          sessions.delete(id);
        }
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Auth message must be valid JSON" }));
        ws.close(1008, "Invalid auth message");
        clearTimeout(authTimeout);
        sessions.delete(id);
      }
      return;
    }

    // Authenticated — handle normal messages
    if (msg.startsWith("{")) {
      try {
        const ctrl = JSON.parse(msg);
        if (ctrl.type === "resize") {
          // S3: Validate resize dimensions
          if (isValidResize(ctrl.cols, ctrl.rows)) {
            session.pty.resize(ctrl.cols, ctrl.rows);
          }
          return;
        }
        if (ctrl.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
          return;
        }
      } catch {
        // Not valid JSON — treat as regular input
      }
    }

    // Regular terminal input
    session.pty.write(msg);
  });

  ws.on("close", () => {
    clearTimeout(authTimeout);
    console.log(`[pty-server] session ${id} disconnected`);
    if (session.pty) session.pty.kill();
    sessions.delete(id);
  });

  ws.on("error", (err: Error) => {
    clearTimeout(authTimeout);
    console.error(`[pty-server] session ${id} error:`, err.message);
    if (session.pty) session.pty.kill();
    sessions.delete(id);
  });
});

// ─── Graceful shutdown ───────────────────────────────────────────────────────

function shutdown() {
  console.log("\n[pty-server] shutting down...");
  for (const session of sessions.values()) {
    if (session.pty) session.pty.kill();
    session.ws.close();
  }
  wss.close();
  // Clean up token file
  try { unlinkSync(TOKEN_FILE); } catch { /* already gone */ }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
