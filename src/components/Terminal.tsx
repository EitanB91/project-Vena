"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { venaTerminalTheme, PTY_WS_URL } from "@/lib/terminal-theme";
import "@xterm/xterm/css/xterm.css";

export type ConnectionStatus = "disconnected" | "connecting" | "connected";

interface TerminalProps {
  onStatusChange?: (status: ConnectionStatus) => void;
  onSessionId?: (id: string | null) => void;
}

async function fetchAuthToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/pty-token");
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (typeof data === "object" && data !== null && "token" in data) {
      const token = (data as Record<string, unknown>).token;
      return typeof token === "string" ? token : null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function Terminal({ onStatusChange, onSessionId }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  const updateStatus = useCallback(
    (s: ConnectionStatus) => {
      setStatus(s);
      onStatusChange?.(s);
    },
    [onStatusChange]
  );

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const term = termRef.current;
    if (!term) return;

    updateStatus("connecting");

    // S8: Fetch auth token before connecting
    const token = await fetchAuthToken();
    if (!token) {
      term.writeln(
        "\r\n\x1b[31m[Could not fetch auth token — is the PTY server running?]\x1b[0m"
      );
      term.writeln("\x1b[90mStart it with: npm run pty-server\x1b[0m\r\n");
      updateStatus("disconnected");
      return;
    }

    const ws = new WebSocket(PTY_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      // S8: Send auth token as first message
      ws.send(JSON.stringify({ type: "auth", token }));
    };

    ws.onmessage = (event: MessageEvent) => {
      // N1 fix: typeof check instead of 'as string' cast
      const data = event.data;
      if (typeof data !== "string") return;

      // Try parsing control messages
      if (data.startsWith("{")) {
        try {
          const msg: unknown = JSON.parse(data);
          if (typeof msg !== "object" || msg === null) throw new Error();
          const ctrl = msg as Record<string, unknown>;

          if (ctrl.type === "session" && typeof ctrl.id === "string") {
            updateStatus("connected");
            onSessionId?.(ctrl.id);
            // Send initial size after auth succeeds
            const fitAddon = fitAddonRef.current;
            if (fitAddon) {
              fitAddon.fit();
              ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
            }
            return;
          }
          if (ctrl.type === "exit" && typeof ctrl.code === "number") {
            term.writeln(`\r\n\x1b[90m[Process exited with code ${ctrl.code}]\x1b[0m`);
            updateStatus("disconnected");
            onSessionId?.(null);
            return;
          }
          if (ctrl.type === "error" && typeof ctrl.message === "string") {
            term.writeln(`\r\n\x1b[31m[Server: ${ctrl.message}]\x1b[0m`);
            updateStatus("disconnected");
            onSessionId?.(null);
            return;
          }
          if (ctrl.type === "pong") return;
        } catch {
          // Not JSON — render as terminal output
        }
      }

      term.write(data);
    };

    ws.onclose = () => {
      updateStatus("disconnected");
      onSessionId?.(null);
    };

    ws.onerror = () => {
      term.writeln(
        "\r\n\x1b[31m[Connection error — is the PTY server running?]\x1b[0m"
      );
      term.writeln("\x1b[90mStart it with: npm run pty-server\x1b[0m\r\n");
      updateStatus("disconnected");
      onSessionId?.(null);
    };
  }, [updateStatus, onSessionId]);

  // Initialize xterm.js
  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      theme: venaTerminalTheme,
      fontFamily: "var(--font-geist-mono), 'Cascadia Code', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: "block",
      allowTransparency: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(containerRef.current);

    fitAddon.fit();
    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Terminal input → WebSocket
    term.onData((data: string) => {
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
      }
    });
    resizeObserver.observe(containerRef.current);

    // Auto-connect on mount
    const timer = setTimeout(() => {
      connect();
    }, 100);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      wsRef.current?.close();
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, [connect]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-lg overflow-hidden"
      style={{ backgroundColor: venaTerminalTheme.background }}
    />
  );
}
