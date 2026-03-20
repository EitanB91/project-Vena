import path from "node:path";
import { readSessionTimeline } from "@/lib";
import { SessionChart, type SessionChartData } from "@/components/SessionChart";
import type { Session } from "@/types";

export const dynamic = "force-dynamic";

export default function SessionsPage() {
  const claudeDir = path.join(process.cwd(), ".claude");
  const timeline = readSessionTimeline(claudeDir);

  // Build chart data from byDate grouping
  const chartData: SessionChartData[] = Object.entries(timeline.byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sessions]) => ({
      date,
      label: date.slice(5), // MM-DD
      sessions: sessions.length,
      minutes: Math.round(
        sessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0) * 10,
      ) / 10,
    }));

  const dates = Object.keys(timeline.byDate).sort().reverse();

  return (
    <div className="flex flex-1 flex-col p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
          Sessions
        </h1>
        <p className="mt-1 text-sm text-vena-text-secondary">
          Session history, timeline, and usage categories.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 flex gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-vena-text">
            {timeline.totalSessions}
          </span>
          <span className="text-sm text-vena-text-secondary">Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-vena-text">
            {timeline.totalMinutes.toFixed(1)}
          </span>
          <span className="text-sm text-vena-text-secondary">
            Total Minutes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-vena-text">
            {dates.length}
          </span>
          <span className="text-sm text-vena-text-secondary">Days Active</span>
        </div>
      </div>

      {/* Activity Chart */}
      {chartData.length > 0 && (
        <div className="mb-8 rounded-lg border border-vena-border bg-vena-surface p-6">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Daily Activity
          </h2>
          <SessionChart data={chartData} />
          <div className="mt-3 flex justify-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-vena-accent" />
              <span className="text-xs text-vena-text-secondary">Sessions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-vena-accent-hover" />
              <span className="text-xs text-vena-text-secondary">Minutes</span>
            </div>
          </div>
        </div>
      )}

      {/* Session List by Date */}
      {timeline.totalSessions === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-vena-border bg-vena-surface">
          <p className="text-sm text-vena-text-muted">
            No sessions found. Sessions are logged in
            .claude/vault-and-valve/usage-log.jsonl.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <DateGroup
              key={date}
              date={date}
              sessions={timeline.byDate[date]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Local Components ───────────────────────────────────────────────── */

function DateGroup({
  date,
  sessions,
}: {
  date: string;
  sessions: Session[];
}) {
  const totalMins = sessions.reduce(
    (sum, s) => sum + (s.durationMinutes ?? 0),
    0,
  );

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <h3 className="text-sm font-medium text-vena-text">{formatDate(date)}</h3>
        <span className="text-xs text-vena-text-muted">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} &middot;{" "}
          {totalMins.toFixed(1)} min
        </span>
        <div className="h-px flex-1 bg-vena-border" />
      </div>

      <div className="space-y-2">
        {sessions.map((session) => (
          <SessionRow key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: Session }) {
  const startTime = formatTime(session.startedAt);
  const endTime = session.endedAt ? formatTime(session.endedAt) : "running";
  const duration =
    session.durationMinutes !== null
      ? `${session.durationMinutes.toFixed(1)}m`
      : "active";
  const isActive = session.endedAt === null;
  const summary = session.summary;

  return (
    <div className="rounded-lg border border-vena-border bg-vena-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="inline-block h-2 w-2 rounded-full bg-vena-success animate-pulse" />
            )}
            <span className="font-mono text-xs text-vena-text-muted">
              {session.id.slice(0, 8)}
            </span>
            <span className="text-xs text-vena-text-secondary">
              {startTime} &rarr; {endTime}
            </span>
          </div>

          {summary && (
            <div className="mt-2">
              {summary.phase && (
                <span className="mr-2 inline-block rounded-full bg-vena-accent/10 px-2 py-0.5 text-micro font-medium text-vena-accent">
                  {summary.phase}
                </span>
              )}
              {summary.categories?.map((cat) => (
                <span
                  key={cat}
                  className="mr-1.5 inline-block rounded-full bg-vena-surface-raised px-2 py-0.5 text-micro text-vena-text-muted"
                >
                  {cat}
                </span>
              ))}
              {summary.summary && (
                <p className="mt-1.5 text-xs leading-relaxed text-vena-text-secondary">
                  {summary.summary}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`text-sm font-mono font-medium ${isActive ? "text-vena-success" : "text-vena-text"}`}
          >
            {duration}
          </span>
          <span className="text-micro text-vena-text-muted">
            {session.source}
          </span>
          {summary?.apiCostUsd !== undefined && summary.apiCostUsd > 0 && (
            <span className="text-micro text-vena-warning">
              ${summary.apiCostUsd.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
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
