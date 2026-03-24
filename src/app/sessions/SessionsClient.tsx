"use client";

import { usePolling } from "@/hooks/usePolling";
import {
  formatTokens,
  formatDuration,
  formatDate,
} from "@/lib/format";

interface SerializedSession {
  sessionId: string;
  title: string | null;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  model: string;
  isActive: boolean;
  tokens: { input: number; output: number; cacheCreation: number; cacheRead: number; total: number };
  messageCount: number;
  toolCallCount: number;
  subagentCount: number;
}

interface SessionsApiResponse {
  sessions: SerializedSession[];
  totalSessions: number;
  activeSessionCount: number;
}

interface SessionsClientProps {
  initialSessions: SerializedSession[];
}

function getModelColor(model: string): string {
  const lower = model.toLowerCase();
  if (lower.includes("opus")) return "bg-vena-accent";
  if (lower.includes("sonnet")) return "bg-vena-accent-hover";
  if (lower.includes("haiku")) return "bg-vena-info";
  return "bg-vena-text-muted";
}

function getModelLabel(model: string): string {
  const lower = model.toLowerCase();
  if (lower.includes("opus")) return "Opus";
  if (lower.includes("sonnet")) return "Sonnet";
  if (lower.includes("haiku")) return "Haiku";
  // Return last segment for unknown models
  return model.split("-").pop() ?? model;
}

function getModelBarColor(model: string): string {
  const lower = model.toLowerCase();
  if (lower.includes("opus")) return "#6366f1";
  if (lower.includes("sonnet")) return "#818cf8";
  if (lower.includes("haiku")) return "#38bdf8";
  return "#55556e";
}

export function SessionsClient({
  initialSessions,
}: SessionsClientProps) {
  const { data: apiData, lastUpdated } = usePolling<SessionsApiResponse>({
    url: "/api/sessions",
    intervalMs: 60_000,
  });

  const sessions = apiData?.sessions ?? initialSessions;

  // Rebuild date groups from current sessions
  const byDate = new Map<string, SerializedSession[]>();
  for (const session of sessions) {
    const dateKey = session.startTime.slice(0, 10);
    const group = byDate.get(dateKey) ?? [];
    group.push(session);
    byDate.set(dateKey, group);
  }
  const dates = Array.from(byDate.keys()).sort().reverse();
  const maxDuration = Math.max(
    ...sessions.map((s) => s.durationMinutes),
    1,
  );

  return (
    <div className="space-y-6">
      {lastUpdated && (
        <p className="text-micro text-vena-text-muted">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      )}
      {dates.map((date) => (
        <DateGroup
          key={date}
          date={date}
          sessions={byDate.get(date) ?? []}
          maxDuration={maxDuration}
        />
      ))}
    </div>
  );
}

/* ─── Date Group ─────────────────────────────────────────────────── */

function DateGroup({
  date,
  sessions,
  maxDuration,
}: {
  date: string;
  sessions: SerializedSession[];
  maxDuration: number;
}) {
  const totalTokens = sessions.reduce((sum, s) => sum + s.tokens.output, 0);

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <h3 className="text-sm font-medium text-vena-text">
          {formatDate(date)}
        </h3>
        <span className="text-xs text-vena-text-muted">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} &middot;{" "}
          {formatTokens(totalTokens)} output
        </span>
        <div className="h-px flex-1 bg-vena-border" />
      </div>

      <div className="space-y-2">
        {sessions.map((session) => (
          <SessionRow
            key={session.sessionId}
            session={session}
            maxDuration={maxDuration}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Session Row ────────────────────────────────────────────────── */

function SessionRow({
  session,
  maxDuration,
}: {
  session: SerializedSession;
  maxDuration: number;
}) {
  const barPercent = maxDuration > 0
    ? Math.max(2, (session.durationMinutes / maxDuration) * 100)
    : 2;
  const barColor = getModelBarColor(session.model);

  const startTime = formatTime(session.startTime);
  const endTime = session.isActive ? "running" : formatTime(session.endTime);
  const title = session.title ?? `Session ${session.sessionId.slice(0, 8)}`;

  return (
    <div className="rounded-lg border border-vena-border bg-vena-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Title + active indicator */}
          <div className="flex items-center gap-2">
            {session.isActive && (
              <span className="inline-block h-2 w-2 rounded-full bg-vena-success animate-pulse" />
            )}
            <span className="text-sm font-medium text-vena-text truncate">
              {title}
            </span>
            {/* F14 — Model Tag */}
            {session.model && (
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-micro font-medium text-white ${getModelColor(session.model)}`}
              >
                {getModelLabel(session.model)}
              </span>
            )}
          </div>

          {/* Time range */}
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-xs text-vena-text-muted">
              {session.sessionId.slice(0, 8)}
            </span>
            <span className="text-xs text-vena-text-secondary">
              {startTime} &rarr; {endTime}
            </span>
          </div>

          {/* F3 — Timeline Bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-vena-surface-raised">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${barPercent}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
        </div>

        {/* F13 — Token Display + Duration */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`font-mono text-sm font-medium ${session.isActive ? "text-vena-success" : "text-vena-text"}`}
          >
            {formatDuration(session.durationMinutes)}
          </span>
          <div className="flex items-center gap-2 text-micro text-vena-text-muted">
            <span title="Input tokens">&darr; {formatTokens(session.tokens.input)}</span>
            <span title="Output tokens">&uarr; {formatTokens(session.tokens.output)}</span>
          </div>
          <div className="flex items-center gap-2 text-micro text-vena-text-muted">
            <span>{session.messageCount} msg</span>
            {session.toolCallCount > 0 && (
              <span>{session.toolCallCount} tools</span>
            )}
            {session.subagentCount > 0 && (
              <span>{session.subagentCount} sub</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}
