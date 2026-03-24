"use client";

import { formatDuration, formatTokens } from "@/lib/format";

interface SessionPulseProps {
  activeCount: number;
  /** Duration of the most recent active session in minutes */
  activeDurationMinutes: number;
  /** Output tokens of current active sessions */
  activeOutputTokens: number;
}

/**
 * F1 — Live Session Pulse card.
 * Breathing indigo animation when active, gray when idle.
 */
export function SessionPulse({
  activeCount,
  activeDurationMinutes,
  activeOutputTokens,
}: SessionPulseProps) {
  const isActive = activeCount > 0;

  return (
    <div
      className={`relative overflow-hidden rounded-lg border p-5 ${
        isActive
          ? "border-vena-accent/40 bg-vena-surface"
          : "border-vena-border bg-vena-surface"
      }`}
    >
      {/* Breathing glow background */}
      {isActive && (
        <div className="pointer-events-none absolute inset-0 animate-pulse bg-vena-accent/5" />
      )}

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              isActive
                ? "bg-vena-accent animate-pulse"
                : "bg-vena-text-muted"
            }`}
          />
          <span className="text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Session Pulse
          </span>
        </div>

        <p className="text-3xl font-bold text-vena-text">
          {activeCount}
        </p>
        <p className="mt-0.5 text-sm text-vena-text-secondary">
          {isActive
            ? `active session${activeCount !== 1 ? "s" : ""}`
            : "No active sessions"}
        </p>

        {isActive && (
          <div className="mt-3 flex gap-4 border-t border-vena-border pt-3">
            <div>
              <p className="text-micro text-vena-text-muted">Duration</p>
              <p className="font-mono text-sm font-medium text-vena-text">
                {formatDuration(activeDurationMinutes)}
              </p>
            </div>
            <div>
              <p className="text-micro text-vena-text-muted">Output</p>
              <p className="font-mono text-sm font-medium text-vena-text">
                {formatTokens(activeOutputTokens)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
