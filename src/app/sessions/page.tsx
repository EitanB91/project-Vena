import {
  getProjectSlug,
  getProjectTelemetry,
  formatTokens,
  formatDuration,
} from "@/lib";
import { EmptyState } from "@/components/EmptyState";
import { SessionsClient } from "./SessionsClient";
import type { SessionTelemetry } from "@/types/telemetry";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const slug = getProjectSlug(process.cwd());
  const telemetry = await getProjectTelemetry(slug);

  // Group sessions by date
  const byDate = new Map<string, SessionTelemetry[]>();
  for (const session of telemetry.sessions) {
    const dateKey = session.startTime.toISOString().slice(0, 10);
    const group = byDate.get(dateKey) ?? [];
    group.push(session);
    byDate.set(dateKey, group);
  }

  const dates = Array.from(byDate.keys()).sort().reverse();

  // Serialize for client
  const serializedSessions = telemetry.sessions.map((s) => ({
    sessionId: s.sessionId,
    title: s.title,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime.toISOString(),
    durationMinutes: s.durationMinutes,
    model: s.model,
    isActive: s.isActive,
    tokens: s.tokens,
    messageCount: s.messageCount,
    toolCallCount: s.toolCallCount,
    subagentCount: s.subagentCount,
  }));

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
          Sessions
        </h1>
        <p className="mt-1 text-sm text-vena-text-secondary">
          Telemetry-powered session history with token usage and model data.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 flex flex-wrap gap-4 md:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-vena-text">
            {telemetry.sessions.length}
          </span>
          <span className="text-sm text-vena-text-secondary">Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-vena-text">
            {formatTokens(telemetry.totals.output)}
          </span>
          <span className="text-sm text-vena-text-secondary">Output Tokens</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-vena-text">
            {formatDuration(
              telemetry.sessions.reduce((sum, s) => sum + s.durationMinutes, 0),
            )}
          </span>
          <span className="text-sm text-vena-text-secondary">Total Time</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-vena-text">
            {dates.length}
          </span>
          <span className="text-sm text-vena-text-secondary">Days Active</span>
        </div>
      </div>

      {/* Client Component for polling + session list */}
      {telemetry.sessions.length === 0 ? (
        <EmptyState
          icon={<ClockEmptyIcon />}
          message="No sessions found."
          hint="Sessions are read from ~/.claude/projects/ telemetry data."
        />
      ) : (
        <SessionsClient
          initialSessions={serializedSessions}
        />
      )}
    </div>
  );
}

function ClockEmptyIcon() {
  return (
    <svg className="h-5 w-5 text-vena-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
