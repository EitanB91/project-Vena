import path from "node:path";
import {
  readAllAgents,
  readBudgetLedger,
  computeBudgetSummary,
  readProjectRoadmap,
  getProjectSlug,
  getProjectTelemetry,
  enhanceAgentProfiles,
  formatTokens,
  formatDateShort,
} from "@/lib";
import type { AlertLevel } from "@/types";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projectPath = process.cwd();
  const claudeDir = path.join(projectPath, ".claude");

  const rawProfiles = readAllAgents(claudeDir);
  const ledger = readBudgetLedger(claudeDir);
  const summary = ledger ? computeBudgetSummary(ledger) : null;
  const roadmap = readProjectRoadmap(projectPath);

  const slug = getProjectSlug(projectPath);
  const telemetry = await getProjectTelemetry(slug);

  // Enhance agent status with telemetry session activity
  const mostRecentSession = telemetry.sessions[0] ?? null;
  const profiles = enhanceAgentProfiles(rawProfiles, {
    activeSessionCount: telemetry.activeSessionCount,
    mostRecentSessionEnd: mostRecentSession?.endTime ?? null,
  });

  const currentPhase = roadmap?.phases.find(
    (p) => p.status === "next" || p.status === "in_progress",
  );
  const completedPhases =
    roadmap?.phases.filter((p) => p.status === "complete").length ?? 0;

  const budgetDisplay = summary
    ? `$${summary.remainingBalance.toFixed(2)}`
    : "—";
  const alertLevel = summary?.alertLevel ?? "normal";

  const alertColor: Record<AlertLevel, string> = {
    normal: "text-vena-success",
    warn: "text-vena-warning",
    critical: "text-vena-error",
    locked: "text-vena-error",
  };

  // Compute active session metrics
  const activeSessions = telemetry.sessions.filter((s) => s.isActive);
  const activeDurationMinutes = activeSessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0,
  );
  const activeOutputTokens = activeSessions.reduce(
    (sum, s) => sum + s.tokens.output,
    0,
  );

  // Build model usage map from all sessions
  const modelTokens: Record<string, number> = {};
  for (const session of telemetry.sessions) {
    if (session.model) {
      modelTokens[session.model] =
        (modelTokens[session.model] ?? 0) + session.tokens.output;
    }
  }

  // Build token chart data from daily usage
  const tokenChartData = telemetry.dailyUsage.map((d) => ({
    label: formatDateShort(d.date),
    input: d.tokens.input,
    output: d.tokens.output,
    cache: d.tokens.cacheCreation + d.tokens.cacheRead,
  }));

  // Initial client data for polling
  const initialClientData = {
    activeSessionCount: telemetry.activeSessionCount,
    activeDurationMinutes,
    activeOutputTokens,
    modelTokens,
    tokenChartData,
    totalSessions: telemetry.sessions.length,
    totalTokens: telemetry.totals.total,
    totalOutputTokens: telemetry.totals.output,
    totalDurationMinutes: telemetry.sessions.reduce(
      (sum, s) => sum + s.durationMinutes,
      0,
    ),
  };

  // Serialize agents for client component
  const serializedAgents = profiles.map((p) => ({
    name: p.identity.name,
    role: p.identity.role,
    colorToken: p.colorToken,
    status: p.status,
    lastSeen: p.lastSeen,
  }));

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-vena-text-secondary">
          Project overview and status at a glance.
        </p>
      </div>

      {/* Client Component: status cards + telemetry + team panel (all poll-refreshed) */}
      <DashboardClient
        initialData={initialClientData}
        initialAgents={serializedAgents}
        cards={{
          phase: {
            value: currentPhase ? currentPhase.id : String(completedPhases),
            sub: currentPhase
              ? currentPhase.title.replace(/^Phase \d+\s*[—–-]\s*/, "")
              : "All phases complete",
          },
          budget: {
            value: budgetDisplay,
            sub: alertLevel.charAt(0).toUpperCase() + alertLevel.slice(1),
            color: alertColor[alertLevel],
          },
          sessions: {
            value: String(telemetry.sessions.length),
            sub: `${formatTokens(telemetry.totals.output)} output tokens`,
          },
        }}
      />

      {/* Roadmap Progress (static — no live data needed) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-vena-border bg-vena-surface p-5">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Roadmap Progress
          </h2>
          {roadmap ? (
            <div className="space-y-2">
              {roadmap.phases.map((phase) => {
                const total = phase.tasks.length;
                const done = phase.tasks.filter((t) => t.completed).length;
                const pct = total > 0 ? (done / total) * 100 : 0;
                const isCurrent =
                  phase.status === "next" || phase.status === "in_progress";

                return (
                  <div key={phase.id} className="flex items-center gap-3">
                    <span
                      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                        phase.status === "complete"
                          ? "bg-vena-success"
                          : isCurrent
                            ? "bg-vena-accent animate-pulse"
                            : "bg-vena-text-muted"
                      }`}
                    />
                    <span
                      className={`w-16 shrink-0 text-xs ${isCurrent ? "font-medium text-vena-accent" : "text-vena-text-secondary"}`}
                    >
                      P{phase.id}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-vena-surface-raised">
                      <div
                        className={`h-full rounded-full ${
                          phase.status === "complete"
                            ? "bg-vena-success"
                            : isCurrent
                              ? "bg-vena-accent"
                              : "bg-vena-text-muted"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-mono text-micro text-vena-text-muted">
                      {Math.round(pct)}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vena-surface-raised">
                <svg className="h-4 w-4 text-vena-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
              </div>
              <p className="text-xs text-vena-text-muted">No roadmap found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
