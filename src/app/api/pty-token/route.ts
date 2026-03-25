import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

/**
 * GET /api/pty-token
 *
 * Reads the PTY auth token from the .pty-auth-token file written by the PTY server.
 * This allows the client-side Terminal component to authenticate with the PTY server
 * without exposing the token in client-side environment variables.
 *
 * Security: This endpoint is only accessible from localhost (same-origin).
 * The token file is created with mode 0o600 (owner-read-write only).
 */
export async function GET() {
  const tokenPath = join(process.cwd(), ".pty-auth-token");

  try {
    const token = readFileSync(tokenPath, "utf-8").trim();
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "PTY server not running — token file not found" },
      { status: 503 }
    );
  }
}
