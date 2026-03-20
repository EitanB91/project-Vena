import path from "node:path";
import {
  readAllAgents,
  readBudgetLedger,
  computeBudgetSummary,
  readSessionTimeline,
  readProjectRoadmap,
  ACTIVE_THRESHOLD_MINUTES,
} from "@/lib";
import type { AlertLevel } from "@/types";

export const dynamic = "force-dynamic";

export default function Home() {
  const projectPath = process.cwd();
  const claudeDir = path.join(projectPath, ".claude");

  const profiles = readAllAgents(claudeDir);
  const ledger = readBudgetLedger(claudeDir);
  const summary = ledger ? computeBudgetSummary(ledger) : null;
  const timeline = readSessionTimeline(claudeDir);
  const roadmap = readProjectRoadmap(projectPath);

  const activeCount = profiles.filter((p) => {
    if (!p.memory?.lastModified) return false;
    return (
      Date.now() - p.memory.lastModified.getTime() <
      ACTIVE_THRESHOLD_MINUTES * 60_000
    );
  }).length;

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

  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-vena-text-secondary">
          Project overview and status at a glance.
        </p>
      </div>

      {/* Status Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          label="Phase"
          value={currentPhase ? currentPhase.id : String(completedPhases)}
          sub={
            currentPhase
              ? currentPhase.title.replace(/^Phase \d+\s*[—–-]\s*/, "")
              : "All phases complete"
          }
        />
        <StatusCard
          label="Agents"
          value={String(profiles.length)}
          sub={`${activeCount} active`}
        />
        <StatusCard
          label="API Budget"
          value={budgetDisplay}
          sub={alertLevel.charAt(0).toUpperCase() + alertLevel.slice(1)}
          color={alertColor[alertLevel]}
        />
        <StatusCard
          label="Sessions"
          value={String(timeline.totalSessions)}
          sub={`${timeline.totalMinutes.toFixed(0)} min total`}
        />
      </div>

      {/* Quick Glance Panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Roadmap Progress */}
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
            <p className="text-xs text-vena-text-muted">No roadmap found.</p>
          )}
        </div>

        {/* Team Status */}
        <div className="rounded-lg border border-vena-border bg-vena-surface p-5">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Team
          </h2>
          {profiles.length > 0 ? (
            <div className="space-y-2">
              {profiles.map((profile) => {
                const isActive =
                  profile.memory?.lastModified &&
                  Date.now() - profile.memory.lastModified.getTime() <
                    ACTIVE_THRESHOLD_MINUTES * 60_000;

                return (
                  <div
                    key={profile.identity.name}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{
                        backgroundColor: `var(--vena-agent-${profile.colorToken})`,
                      }}
                    >
                      {profile.identity.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-vena-text">
                        {profile.identity.name}
                      </p>
                      <p className="truncate text-micro text-vena-text-muted">
                        {profile.identity.role}
                      </p>
                    </div>
                    <span
                      className={`inline-block h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-vena-success animate-pulse" : "bg-vena-text-muted"}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-vena-text-muted">No agents found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Local Components ───────────────────────────────────────────────── */

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
      <p className="text-xs font-medium uppercase tracking-wider text-vena-text-muted">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-semibold ${color ?? "text-vena-text"}`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-vena-text-secondary">{sub}</p>
    </div>
  );
}
