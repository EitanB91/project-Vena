import { readProjectRoadmap, readPlanFiles } from "@/lib";
import type { PlanFile } from "@/lib";
import { EmptyState } from "@/components/EmptyState";
import type { FeatureEntry, PhaseStatus, RoadmapPhase } from "@/types";

export const dynamic = "force-dynamic";

export default function RoadmapPage() {
  const projectPath = process.cwd();
  const roadmap = readProjectRoadmap(projectPath);
  const planFiles = readPlanFiles(projectPath);

  if (!roadmap) {
    return (
      <div className="flex flex-1 flex-col p-4 md:p-8">
        <PageHeader />
        <EmptyState
          icon={<MapEmptyIcon />}
          message="No roadmap found."
          hint="Place a Roadmap-*.md file in plans/."
        />
      </div>
    );
  }

  const completedPhases = roadmap.phases.filter(
    (p) => p.status === "complete",
  ).length;

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <PageHeader />

      {/* Stats */}
      <div className="mb-6 flex flex-wrap gap-4 md:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-vena-text">
            {completedPhases}/{roadmap.phases.length}
          </span>
          <span className="text-sm text-vena-text-secondary">
            Phases Complete
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-vena-text">
            {roadmap.featureRegistry.length}
          </span>
          <span className="text-sm text-vena-text-secondary">Features</span>
        </div>
      </div>

      {/* Vision */}
      {roadmap.vision && (
        <div className="mb-8 rounded-lg border border-vena-border bg-vena-surface p-5">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Vision
          </h2>
          <p className="text-sm leading-relaxed text-vena-text-secondary">
            {roadmap.vision}
          </p>
        </div>
      )}

      {/* Phase Timeline */}
      <div className="mb-8">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
          Phases
        </h2>
        <div className="space-y-3">
          {roadmap.phases.map((phase) => (
            <PhaseCard key={phase.id} phase={phase} />
          ))}
        </div>
      </div>

      {/* Feature Registry */}
      {roadmap.featureRegistry.length > 0 && (
        <div className="mb-8 rounded-lg border border-vena-border bg-vena-surface p-6">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Feature Registry
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-vena-border text-left">
                  <th className="pb-2 pr-4 font-medium text-vena-text-secondary">
                    Feature
                  </th>
                  <th className="pb-2 pr-4 font-medium text-vena-text-secondary">
                    Phase
                  </th>
                  <th className="pb-2 pr-4 font-medium text-vena-text-secondary">
                    Priority
                  </th>
                  <th className="pb-2 font-medium text-vena-text-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {roadmap.featureRegistry.map((entry, i) => (
                  <FeatureRow key={i} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan Documents */}
      {planFiles.length > 0 && (
        <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Plan Documents
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {planFiles.map((file) => (
              <PlanCard key={file.name} file={file} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Local Components ───────────────────────────────────────────────── */

function PageHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
        Roadmap
      </h1>
      <p className="mt-1 text-sm text-vena-text-secondary">
        Phase tracker, plans, and milestone progress.
      </p>
    </div>
  );
}

function PhaseCard({ phase }: { phase: RoadmapPhase }) {
  const totalTasks = phase.tasks.length;
  const completedTasks = phase.tasks.filter((t) => t.completed).length;
  const percent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const statusConfig: Record<PhaseStatus, { label: string; color: string; barColor: string }> = {
    complete: {
      label: "Complete",
      color: "text-vena-success",
      barColor: "bg-vena-success",
    },
    next: {
      label: "In Progress",
      color: "text-vena-accent",
      barColor: "bg-vena-accent",
    },
    in_progress: {
      label: "In Progress",
      color: "text-vena-accent",
      barColor: "bg-vena-accent",
    },
    planned: {
      label: "Planned",
      color: "text-vena-text-muted",
      barColor: "bg-vena-text-muted",
    },
  };

  const config = statusConfig[phase.status];
  const isCurrent = phase.status === "next" || phase.status === "in_progress";

  return (
    <div
      className={`rounded-lg border bg-vena-surface p-4 ${isCurrent ? "border-vena-accent/40" : "border-vena-border"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StatusDot status={phase.status} />
            <h3 className="text-sm font-medium text-vena-text">
              {phase.title}
            </h3>
          </div>
          {phase.goal && (
            <p className="mt-1 text-xs text-vena-text-secondary">
              {phase.goal}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          {phase.completedDate && (
            <span className="text-micro text-vena-text-muted">
              {phase.completedDate}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-micro">
            <span className="text-vena-text-muted">
              {completedTasks}/{totalTasks} tasks
            </span>
            <span className="text-vena-text-muted">{Math.round(percent)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-vena-surface-raised">
            <div
              className={`h-full rounded-full transition-all ${config.barColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Task checklist (only for current/next phase) */}
      {isCurrent && totalTasks > 0 && (
        <div className="mt-3 space-y-1 border-t border-vena-border pt-3">
          {phase.tasks.map((task, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span
                className={
                  task.completed ? "text-vena-success" : "text-vena-text-muted"
                }
              >
                {task.completed ? "\u2713" : "\u25CB"}
              </span>
              <span
                className={
                  task.completed
                    ? "text-vena-text-muted line-through"
                    : "text-vena-text-secondary"
                }
              >
                {task.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: PhaseStatus }) {
  const colors: Record<PhaseStatus, string> = {
    complete: "bg-vena-success",
    next: "bg-vena-accent",
    in_progress: "bg-vena-accent",
    planned: "bg-vena-text-muted",
  };
  const animate =
    status === "next" || status === "in_progress" ? "animate-pulse" : "";

  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${colors[status]} ${animate}`}
    />
  );
}

function FeatureRow({ entry }: { entry: FeatureEntry }) {
  const statusColor =
    entry.status === "Complete"
      ? "text-vena-success"
      : entry.status === "Planned"
        ? "text-vena-text-muted"
        : "text-vena-accent";

  const priorityColor =
    entry.priority === "Critical"
      ? "text-vena-error"
      : entry.priority === "High"
        ? "text-vena-warning"
        : "text-vena-text-secondary";

  return (
    <tr className="border-b border-vena-border/50">
      <td className="py-2 pr-4 text-vena-text">{entry.feature}</td>
      <td className="py-2 pr-4 font-mono text-xs text-vena-text-muted">
        {entry.phase}
      </td>
      <td className={`py-2 pr-4 text-xs font-medium ${priorityColor}`}>
        {entry.priority}
      </td>
      <td className={`py-2 text-xs font-medium ${statusColor}`}>
        {entry.status}
      </td>
    </tr>
  );
}

/* ─── Plan Documents ─────────────────────────────────────────────────── */

function PlanCard({ file }: { file: PlanFile }) {
  const isRoadmap = file.name.startsWith("Roadmap");

  return (
    <div className="rounded-lg border border-vena-border bg-vena-surface-raised p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-vena-surface-overlay">
          <svg
            className={`h-4 w-4 ${isRoadmap ? "text-vena-accent" : "text-vena-text-muted"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-vena-text">{file.title}</p>
          <p className="mt-0.5 text-micro font-mono text-vena-text-muted">
            {file.name} &middot; {file.lines} lines
          </p>
        </div>
      </div>
    </div>
  );
}

function MapEmptyIcon() {
  return (
    <svg className="h-5 w-5 text-vena-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
