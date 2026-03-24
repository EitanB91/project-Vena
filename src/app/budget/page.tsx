import path from "node:path";
import {
  readBudgetLedger,
  computeBudgetSummary,
  getProjectSlug,
  getProjectTelemetry,
  formatTokens,
  formatDuration,
  formatRelativeTime,
  formatDateShort,
} from "@/lib";
import { BudgetChart } from "@/components/BudgetChart";
import { EmptyState } from "@/components/EmptyState";
import { BudgetClient } from "./BudgetClient";
import type { TelemetryData } from "./BudgetClient";
import type { AlertLevel } from "@/types";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const projectPath = process.cwd();
  const claudeDir = path.join(projectPath, ".claude");
  const ledger = readBudgetLedger(claudeDir);

  const slug = getProjectSlug(projectPath);
  const telemetry = await getProjectTelemetry(slug);

  // Telemetry panel data
  const totalDurationMinutes = telemetry.sessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0,
  );
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = telemetry.sessions.filter(
    (s) => s.startTime.toISOString().slice(0, 10) === today,
  );
  const todayDurationMinutes = todaySessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0,
  );
  const lastSession = telemetry.sessions[0]; // Already sorted newest first

  // Burn rate data (last 30 days — client toggles between 7d/30d view)
  const burnRateData = telemetry.dailyUsage.slice(-30).map((d) => ({
    label: formatDateShort(d.date),
    output: d.tokens.output,
  }));

  const telemetryData = {
    totalSessions: telemetry.sessions.length,
    totalTokens: telemetry.totals.total,
    totalOutputTokens: telemetry.totals.output,
    totalDurationMinutes,
    todayDurationMinutes,
    todayDurationHours: todayDurationMinutes / 60,
    lastSessionAgo: lastSession
      ? formatRelativeTime(lastSession.endTime)
      : null,
    burnRateData,
    activeSessionCount: telemetry.activeSessionCount,
  };

  if (!ledger) {
    return (
      <div className="flex flex-1 flex-col p-4 md:p-8">
        <PageHeader />
        {/* Show telemetry panel even without budget ledger */}
        <TelemetryPanel data={telemetryData} />
        <div className="mt-4">
          <EmptyState
            icon={<WalletEmptyIcon />}
            message="No API budget ledger found."
            hint="Place budget-ledger.json in .claude/vault-and-valve/."
          />
        </div>
      </div>
    );
  }

  const summary = computeBudgetSummary(ledger);
  const primaryApi = Object.values(ledger.apis)[0] ?? null;
  const monthlyBudget = primaryApi?.usableBudgetMonthly ?? 0;
  const spent = Math.max(0, monthlyBudget - summary.usableBudget);

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <PageHeader />

      {/* Dual Panels */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Panel 1 — Pro Plan Usage (Telemetry) */}
        <TelemetryPanel data={telemetryData} />

        {/* Panel 2 — API Budget (V&V Ledger) */}
        <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            API Budget (V&V Ledger)
          </h2>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <MetricCard
              label="Remaining"
              value={`$${summary.remainingBalance.toFixed(2)}`}
            />
            <MetricCard
              label="Usable"
              value={`$${summary.usableBudget.toFixed(2)}`}
              sub={`${summary.usablePercent.toFixed(0)}%`}
            />
            <MetricCard
              label="Floor"
              value={`$${summary.floor.toFixed(2)}`}
            />
            <AlertCard level={summary.alertLevel} />
          </div>

          <BudgetChart
            usable={summary.usableBudget}
            floor={summary.floor}
            spent={spent}
            currency={summary.currency}
          />
          <div className="mt-4 flex justify-center gap-6">
            <Legend color="bg-vena-success" label="Available" />
            <Legend color="bg-vena-warning" label="Floor" />
            {spent > 0 && <Legend color="bg-vena-error" label="Spent" />}
          </div>
          {primaryApi?.lastUpdated && (
            <p className="mt-3 text-center text-micro text-vena-text-muted">
              Last updated: {primaryApi.lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Telemetry Charts (Client) */}
      <BudgetClient telemetryData={telemetryData} />

      {/* Claude Code Usage */}
      <div className="mb-8 rounded-lg border border-vena-border bg-vena-surface p-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
          Claude Code Plan
        </h2>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-vena-text-secondary">Plan</span>
            <span className="rounded-full bg-vena-accent/10 px-3 py-0.5 text-sm font-medium capitalize text-vena-accent">
              {summary.claudeCode.plan}
            </span>
          </div>
          <UsageBar
            label="Session Usage"
            percent={summary.claudeCode.sessionUsagePercent}
          />
          <UsageBar
            label="Weekly Usage"
            percent={summary.claudeCode.weeklyUsagePercent}
          />
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
          Alert Thresholds &amp; Authority
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <span className="text-xs text-vena-text-muted">Warn</span>
            <p className="text-sm font-medium text-vena-warning">
              &le; {ledger.alertThresholds.warnAtPercent}% usable remaining
            </p>
          </div>
          <div>
            <span className="text-xs text-vena-text-muted">Critical</span>
            <p className="text-sm font-medium text-vena-error">
              &le; {ledger.alertThresholds.criticalAtPercent}% usable remaining
            </p>
          </div>
          <div>
            <span className="text-xs text-vena-text-muted">At Floor</span>
            <p className="text-sm font-medium text-vena-text">
              {ledger.authority.atFloor.replace(/_/g, " ")}
            </p>
            <p className="mt-1 text-xs text-vena-text-muted">
              {ledger.authority.note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Telemetry Panel ─────────────────────────────────────────────── */

function TelemetryPanel({ data }: { data: TelemetryData }) {
  const quotaHours = 5; // Soft reference for Pro plan
  const gaugePercent = Math.min(100, (data.todayDurationHours / quotaHours) * 100);

  return (
    <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
        Pro Plan Usage (Telemetry)
      </h2>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <MetricCard
          label="Sessions"
          value={String(data.totalSessions)}
        />
        <MetricCard
          label="Output Tokens"
          value={formatTokens(data.totalOutputTokens)}
        />
        <MetricCard
          label="Total Time"
          value={formatDuration(data.totalDurationMinutes)}
        />
        <MetricCard
          label="Active Now"
          value={String(data.activeSessionCount)}
        />
      </div>

      {/* F8 — Duration Quota Gauge */}
      <div className="mb-3">
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-vena-text-secondary">Today</span>
          <span className="font-mono text-vena-text">
            {data.todayDurationHours.toFixed(1)}h / ~{quotaHours}h
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-vena-surface-raised">
          <div
            className={`h-full rounded-full transition-all ${
              gaugePercent >= 80
                ? "bg-vena-error"
                : gaugePercent >= 50
                  ? "bg-vena-warning"
                  : "bg-vena-accent"
            }`}
            style={{ width: `${gaugePercent}%` }}
          />
        </div>
      </div>

      {data.lastSessionAgo && (
        <p className="text-micro text-vena-text-muted">
          Last session: {data.lastSessionAgo}
        </p>
      )}
    </div>
  );
}

/* ─── Local Components ───────────────────────────────────────────────── */

function PageHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
        Budget
      </h1>
      <p className="mt-1 text-sm text-vena-text-secondary">
        Vault &amp; Valve &mdash; Pro plan telemetry and API budget status.
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-md bg-vena-surface-raised p-3">
      <p className="text-micro text-vena-text-muted">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-vena-text">{value}</p>
      {sub && (
        <p className="text-micro text-vena-text-secondary">{sub}</p>
      )}
    </div>
  );
}

function AlertCard({ level }: { level: AlertLevel }) {
  const config: Record<AlertLevel, { text: string; textColor: string; dotColor: string }> = {
    normal: { text: "Normal", textColor: "text-vena-success", dotColor: "bg-vena-success" },
    warn: { text: "Warning", textColor: "text-vena-warning", dotColor: "bg-vena-warning" },
    critical: { text: "Critical", textColor: "text-vena-error", dotColor: "bg-vena-error" },
    locked: { text: "LOCKED", textColor: "text-vena-error", dotColor: "bg-vena-error" },
  };
  const c = config[level];

  return (
    <div className="rounded-md bg-vena-surface-raised p-3">
      <p className="text-micro text-vena-text-muted">Alert Level</p>
      <div className="mt-0.5 flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${c.dotColor}`} />
        <span className={`text-lg font-semibold ${c.textColor}`}>{c.text}</span>
      </div>
    </div>
  );
}

function UsageBar({ label, percent }: { label: string; percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const barColor =
    clamped >= 80
      ? "bg-vena-error"
      : clamped >= 50
        ? "bg-vena-warning"
        : "bg-vena-accent";

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-vena-text-secondary">{label}</span>
        <span className="font-mono text-vena-text">{clamped}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-vena-surface-raised">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-sm ${color}`} />
      <span className="text-xs text-vena-text-secondary">{label}</span>
    </div>
  );
}

function WalletEmptyIcon() {
  return (
    <svg className="h-5 w-5 text-vena-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="16" rx="2" ry="2" />
      <path d="M1 10h22" />
    </svg>
  );
}
