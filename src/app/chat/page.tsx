"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { ConnectionStatus } from "@/components/Terminal";

// Dynamic import — xterm.js requires browser APIs (no SSR)
const Terminal = dynamic(() => import("@/components/Terminal"), { ssr: false });

const statusConfig: Record<
  ConnectionStatus,
  { label: string; dotClass: string }
> = {
  disconnected: {
    label: "Disconnected",
    dotClass: "bg-vena-error",
  },
  connecting: {
    label: "Connecting…",
    dotClass: "bg-vena-warning animate-pulse",
  },
  connected: {
    label: "Connected",
    dotClass: "bg-vena-success",
  },
};

export default function ChatPage() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [terminalKey, setTerminalKey] = useState(0);

  const handleNewSession = useCallback(() => {
    // Remounting Terminal triggers a new WebSocket + PTY session
    setTerminalKey((k) => k + 1);
    setSessionId(null);
  }, []);

  const { label, dotClass } = statusConfig[status];

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8 gap-4 h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
            Chat
          </h1>
          <p className="mt-1 text-sm text-vena-text-secondary">
            CLI passthrough — embedded terminal for Claude interaction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Session ID */}
          {sessionId && (
            <span className="hidden sm:inline font-mono text-micro text-vena-text-muted">
              {sessionId}
            </span>
          )}

          {/* Connection status */}
          <div className="flex items-center gap-2 rounded-full border border-vena-border bg-vena-surface px-3 py-1.5">
            <span className={`h-2 w-2 rounded-full ${dotClass}`} />
            <span className="text-xs text-vena-text-secondary">{label}</span>
          </div>

          {/* New session button */}
          <button
            onClick={handleNewSession}
            className="rounded-md border border-vena-border bg-vena-surface-raised px-3 py-1.5 text-xs text-vena-text-secondary transition-colors hover:border-vena-accent hover:text-vena-text"
          >
            New Session
          </button>
        </div>
      </div>

      {/* Terminal container */}
      <div className="relative flex-1 min-h-0 rounded-lg border border-vena-border overflow-hidden">
        <Terminal
          key={terminalKey}
          onStatusChange={setStatus}
          onSessionId={setSessionId}
        />
      </div>

      {/* Footer hint */}
      <div className="flex items-center gap-4 text-micro text-vena-text-muted">
        <span>
          <kbd className="rounded border border-vena-border bg-vena-surface-raised px-1.5 py-0.5 font-mono text-micro">
            claude
          </kbd>{" "}
          to start a Claude CLI session
        </span>
        <span className="text-vena-border">|</span>
        <span>PTY server must be running on port 3001</span>
      </div>
    </div>
  );
}
