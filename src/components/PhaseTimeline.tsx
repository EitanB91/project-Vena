"use client";

import { useState } from "react";
import type { RoadmapPhase, PhaseStatus } from "@/types";
import { formatTokens, formatDuration } from "@/lib/format";

interface PhaseTokenData {
  sessionCount: number;
  totalDurationMinutes: number;
  outputTokens: number;
  totalTokens: number;
}

interface PhaseTimelineProps {
  phases: RoadmapPhase[];
  tokenData: Record<string, PhaseTokenData>;
}

export default function PhaseTimeline({ phases, tokenData }: PhaseTimelineProps) {
  // Start with current/in-progress phase expanded
  const initialExpanded = new Set<string>();
  for (const p of phases) {
    if (p.status === "next" || p.status === "in_progress") {
      initialExpanded.add(p.id);
    }
  }

  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {phases.map((phase) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          isExpanded={expanded.has(phase.id)}
          onToggle={() => toggle(phase.id)}
          tokenData={tokenData[phase.id]}
        />
      ))}
    </div>
  );
}

/* ─── PhaseCard ────────────────────────────────────────────────────── */

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

function PhaseCard({
  phase,
  isExpanded,
  onToggle,
  tokenData,
}: {
  phase: RoadmapPhase;
  isExpanded: boolean;
  onToggle: () => void;
  tokenData?: PhaseTokenData;
}) {
  const totalTasks = phase.tasks.length;
  const completedTasks = phase.tasks.filter((t) => t.completed).length;
  const percent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const config = statusConfig[phase.status];
  const isCurrent = phase.status === "next" || phase.status === "in_progress";

  return (
    <div
      className={`rounded-lg border bg-vena-surface transition-colors ${isCurrent ? "border-vena-accent/40" : "border-vena-border"}`}
    >
      {/* Clickable header */}
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StatusDot status={phase.status} />
            <ChevronIcon expanded={isExpanded} />
            <h3 className="text-sm font-medium text-vena-text">
              {phase.title}
            </h3>
          </div>
          {!isExpanded && phase.goal && (
            <p className="mt-1 ml-8 text-xs text-vena-text-secondary line-clamp-1">
              {phase.goal}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          {totalTasks > 0 && (
            <span className="text-micro text-vena-text-muted">
              {completedTasks}/{totalTasks}
            </span>
          )}
        </div>
      </button>

      {/* Progress bar (always visible) */}
      {totalTasks > 0 && (
        <div className="px-4 pb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-vena-surface-raised">
            <div
              className={`h-full rounded-full transition-all ${config.barColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Expandable content */}
      {isExpanded && (
        <div className="border-t border-vena-border px-4 py-3 space-y-4">
          {/* Goal */}
          {phase.goal && (
            <p className="text-xs text-vena-text-secondary">
              {phase.goal}
            </p>
          )}

          {/* Metadata panel — always show all fields, N/A for missing */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <MetaStat label="Completed" value={phase.completedDate ?? "N/A"} />
            <MetaStat label="Sessions" value={tokenData && tokenData.sessionCount > 0 ? String(tokenData.sessionCount) : "N/A"} />
            <MetaStat label="Duration" value={tokenData && tokenData.sessionCount > 0 ? formatDuration(tokenData.totalDurationMinutes) : "N/A"} />
            <MetaStat label="Output" value={tokenData && tokenData.sessionCount > 0 ? formatTokens(tokenData.outputTokens) : "N/A"} />
            <MetaStat label="Total" value={tokenData && tokenData.sessionCount > 0 ? formatTokens(tokenData.totalTokens) : "N/A"} />
          </div>

          {/* Task checklist */}
          {totalTasks > 0 && (
            <div className="space-y-1">
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
      )}
    </div>
  );
}

/* ─── Small helpers ────────────────────────────────────────────────── */

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-micro text-vena-text-muted">{label}</span>
      <span className="text-xs font-mono text-vena-text-secondary">{value}</span>
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

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-vena-text-muted transition-transform ${expanded ? "rotate-90" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

