"use client";

import { usePolling } from "@/hooks/usePolling";
import { SessionPulse } from "@/components/SessionPulse";
import { TokenChart } from "@/components/TokenChart";
import { ModelDonut } from "@/components/ModelDonut";
import { formatTokens, formatDuration, formatDateShort } from "@/lib/format";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentInfo {
  name: string;
  role: string;
  colorToken: string;
  status: { label: string; color: string; dotClass: string };
  lastSeen: string;
}

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

interface StatusCardData {
  phase: { value: string; sub: string };
  budget: { value: string; sub: string; color: string };
  sessions: { value: string; sub: string };
}

interface DashboardApiResponse {
  agents: AgentInfo[];
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DashboardClientProps {
  initialData: TelemetryClientData;
  initialAgents: AgentInfo[];
  cards: StatusCardData;
}

export function DashboardClient({ initialData, initialAgents, cards }: DashboardClientProps) {
  const { data: apiData, lastUpdated } = usePolling<DashboardApiResponse>({
    url: "/api/dashboard",
    intervalMs: 30_000,
  });

  const d = apiData ? apiToClientData(apiData) : initialData;
  const agents = apiData?.agents ?? initialAgents;
  const activeCount = agents.filter((a) => a.status.label === "Active").length;

  return (
    <>
      {/* Status Cards — Agents card updates via polling */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard label="Phase" value={cards.phase.value} sub={cards.phase.sub} />
        <StatusCard label="Agents" value={String(agents.length)} sub={`${activeCount} active`} />
        <StatusCard label="API Budget" value={cards.budget.value} sub={cards.budget.sub} color={cards.budget.color} />
        <StatusCard label="Sessions" value={String(d.totalSessions)} sub={`${formatTokens(d.totalOutputTokens)} output tokens`} />
      </div>

      {/* Live Telemetry Row */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SessionPulse
            activeCount={d.activeSessionCount}
            activeDurationMinutes={d.activeDurationMinutes}
            activeOutputTokens={d.activeOutputTokens}
          />

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

          <div className="rounded-lg border border-vena-border bg-vena-surface p-5">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
              Totals
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-vena-text-secondary">Sessions</span>
                <span className="font-mono text-sm font-medium text-vena-text">{d.totalSessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-vena-text-secondary">Output Tokens</span>
                <span className="font-mono text-sm font-medium text-vena-text">{formatTokens(d.totalOutputTokens)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-vena-text-secondary">Total Tokens</span>
                <span className="font-mono text-sm font-medium text-vena-text">{formatTokens(d.totalTokens)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-vena-text-secondary">Total Time</span>
                <span className="font-mono text-sm font-medium text-vena-text">{formatDuration(d.totalDurationMinutes)}</span>
              </div>
            </div>
            {lastUpdated && (
              <p className="mt-3 border-t border-vena-border pt-2 text-micro text-vena-text-muted">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {d.tokenChartData.length > 0 && (
          <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
              Token Breakdown (Daily)
            </h2>
            <TokenChart data={d.tokenChartData} />
          </div>
        )}
      </div>

      {/* Team Panel — updates via polling */}
      <TeamPanel agents={agents} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-vena-border bg-vena-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-vena-text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${color ?? "text-vena-text"}`}>{value}</p>
      <p className="mt-0.5 text-xs text-vena-text-secondary">{sub}</p>
    </div>
  );
}

function TeamPanel({ agents }: { agents: AgentInfo[] }) {
  if (agents.length === 0) {
    return (
      <div className="rounded-lg border border-vena-border bg-vena-surface p-5">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-vena-text-muted">Team</h2>
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vena-surface-raised">
            <svg className="h-4 w-4 text-vena-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-xs text-vena-text-muted">No agents found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-vena-border bg-vena-surface p-5">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-vena-text-muted">Team</h2>
      <div className="space-y-2">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center gap-3">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: `var(--${agent.colorToken})` }}
            >
              {agent.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-vena-text">{agent.name}</p>
              <p className="truncate text-micro text-vena-text-muted">{agent.role}</p>
            </div>
            <span
              className={`inline-block h-2 w-2 shrink-0 rounded-full ${agent.status.label === "Active" ? "bg-vena-success animate-pulse" : "bg-vena-text-muted"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
