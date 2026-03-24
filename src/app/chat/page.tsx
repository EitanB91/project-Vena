"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { ConnectionStatus, TerminalHandle } from "@/components/Terminal";
import ChatInput from "@/components/ChatInput";

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
    label: "Connecting\u2026",
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
  const terminalRef = useRef<TerminalHandle>(null);

  const handleNewSession = useCallback(() => {
    // Remounting Terminal triggers a new WebSocket + PTY session
    setTerminalKey((k) => k + 1);
    setSessionId(null);
  }, []);

  const handleSend = useCallback((text: string) => {
    terminalRef.current?.send(text);
  }, []);

  const { label, dotClass } = statusConfig[status];
  const isConnected = status === "connected";

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8 gap-3 h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
            Chat
          </h1>
          <p className="mt-1 text-sm text-vena-text-secondary">
            Send commands to Claude CLI — output appears in the terminal below.
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

      {/* Terminal output — fills available space */}
      <div className="relative flex-1 min-h-0 rounded-lg border border-vena-border overflow-hidden">
        <Terminal
          ref={terminalRef}
          key={terminalKey}
          onStatusChange={setStatus}
          onSessionId={setSessionId}
        />
      </div>

      {/* Chat input bar */}
      <div className="shrink-0">
        <ChatInput onSend={handleSend} disabled={!isConnected} />
        <div className="mt-1.5 flex items-center gap-3 text-micro text-vena-text-muted">
          <span>
            <kbd className="rounded border border-vena-border bg-vena-surface-raised px-1 py-0.5 font-mono text-micro">
              Enter
            </kbd>{" "}
            send
          </span>
          <span className="text-vena-border">|</span>
          <span>
            <kbd className="rounded border border-vena-border bg-vena-surface-raised px-1 py-0.5 font-mono text-micro">
              Shift+Enter
            </kbd>{" "}
            newline
          </span>
          <span className="text-vena-border">|</span>
          <span>
            <kbd className="rounded border border-vena-border bg-vena-surface-raised px-1 py-0.5 font-mono text-micro">
              &uarr;&darr;
            </kbd>{" "}
            history
          </span>
        </div>
      </div>
    </div>
  );
}
