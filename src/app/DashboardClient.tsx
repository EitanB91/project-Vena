"use client";

import { usePolling } from "@/hooks/usePolling";
import { SessionPulse } from "@/components/SessionPulse";
import { TokenChart } from "@/components/TokenChart";
import { ModelDonut } from "@/components/ModelDonut";
import { formatTokens, formatDuration, formatDateShort } from "@/lib/format";

interface TelemetryClientData {
  activeSessionCount: number;
  activeDurationMinutes: number;
  activeOutputTokens: number;
  modelTokens: Record<string, number>;
  tokenChartData: { label: string; input: number; output: number; cache: number }[];
  totalSessions: number;
  totalTokens: number;
  totalOutputTokens: number;
  totalDurationMinutes: number;
}

interface DashboardApiResponse {
  telemetry: {
    activeSessionCount: number;
    totalSessions: number;
    totals: { input: number; output: number; cacheCreation: number; cacheRead: number; total: number };
    dailyUsage: { date: string; sessions: number; durationMinutes: number; tokens: { input: number; output: number; cacheCreation: number; cacheRead: number; total: number }; messages: number }[];
    sessions: { model: string; isActive: boolean; durationMinutes: number; tokens: { output: number } }[];
  };
}

function apiToClientData(api: DashboardApiResponse): TelemetryClientData {
  const t = api.telemetry;
  const activeSessions = t.sessions.filter((s) => s.isActive);
  const modelTokens: Record<string, number> = {};
  for (const s of t.sessions) {
    if (s.model) {
      modelTokens[s.model] = (modelTokens[s.model] ?? 0) + s.tokens.output;
    }
  }
  return {
    activeSessionCount: t.activeSessionCount,
    activeDurationMinutes: activeSessions.reduce((sum, s) => sum + s.durationMinutes, 0),
    activeOutputTokens: activeSessions.reduce((sum, s) => sum + s.tokens.output, 0),
    modelTokens,
    tokenChartData: t.dailyUsage.map((d) => ({
      label: formatDateShort(d.date),
      input: d.tokens.input,
      output: d.tokens.output,
      cache: d.tokens.cacheCreation + d.tokens.cacheRead,
    })),
    totalSessions: t.totalSessions,
    totalTokens: t.totals.total,
    totalOutputTokens: t.totals.output,
    totalDurationMinutes: t.sessions.reduce((sum, s) => sum + s.durationMinutes, 0),
  };
}

interface DashboardClientProps {
  initialData: TelemetryClientData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { data: apiData, lastUpdated } = usePolling<DashboardApiResponse>({
    url: "/api/dashboard",
    intervalMs: 30_000,
  });

  const d = apiData ? apiToClientData(apiData) : initialData;

  return (
    <div className="mb-8 space-y-4">
      {/* Live Telemetry Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* F1 — Session Pulse */}
        <SessionPulse
          activeCount={d.activeSessionCount}
          activeDurationMinutes={d.activeDurationMinutes}
          activeOutputTokens={d.activeOutputTokens}
        />

        {/* F4 — Model Donut */}
        <div className="rounded-lg border border-vena-border bg-vena-surface p-5">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Model Usage
          </h2>
          {Object.keys(d.modelTokens).length > 0 ? (
            <ModelDonut modelTokens={d.modelTokens} />
          ) : (
            <p className="text-xs text-vena-text-muted">No model data yet.</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="rounded-lg border border-vena-border bg-vena-surface p-5">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Totals
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-vena-text-secondary">Sessions</span>
              <span className="font-mono text-sm font-medium text-vena-text">
                {d.totalSessions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-vena-text-secondary">Output Tokens</span>
              <span className="font-mono text-sm font-medium text-vena-text">
                {formatTokens(d.totalOutputTokens)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-vena-text-secondary">Total Tokens</span>
              <span className="font-mono text-sm font-medium text-vena-text">
                {formatTokens(d.totalTokens)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-vena-text-secondary">Total Time</span>
              <span className="font-mono text-sm font-medium text-vena-text">
                {formatDuration(d.totalDurationMinutes)}
              </span>
            </div>
          </div>
          {lastUpdated && (
            <p className="mt-3 border-t border-vena-border pt-2 text-micro text-vena-text-muted">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* F2 — Token Breakdown Chart */}
      {d.tokenChartData.length > 0 && (
        <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Token Breakdown (Daily)
          </h2>
          <TokenChart data={d.tokenChartData} />
        </div>
      )}
    </div>
  );
}
