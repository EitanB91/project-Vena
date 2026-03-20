import path from "node:path";
import { readBudgetLedger, computeBudgetSummary } from "@/lib";
import { BudgetChart } from "@/components/BudgetChart";
import { EmptyState } from "@/components/EmptyState";
import type { AlertLevel } from "@/types";

export const dynamic = "force-dynamic";

export default function BudgetPage() {
  const claudeDir = path.join(process.cwd(), ".claude");
  const ledger = readBudgetLedger(claudeDir);

  if (!ledger) {
    return (
      <div className="flex flex-1 flex-col p-4 md:p-8">
        <PageHeader />
        <EmptyState
          icon={<WalletEmptyIcon />}
          message="No budget ledger found."
          hint="Place budget-ledger.json in .claude/vault-and-valve/."
        />
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

      {/* Status Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Remaining Balance"
          value={`$${summary.remainingBalance.toFixed(2)}`}
        />
        <MetricCard
          label="Usable Budget"
          value={`$${summary.usableBudget.toFixed(2)}`}
          sub={`${summary.usablePercent.toFixed(0)}% of monthly cap`}
        />
        <MetricCard
          label="Floor (Reserved)"
          value={`$${summary.floor.toFixed(2)}`}
          sub="Untouchable"
        />
        <AlertCard level={summary.alertLevel} />
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Budget Breakdown */}
        <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Budget Breakdown
          </h2>
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
        </div>

        {/* Claude Code Usage */}
        <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Claude Code Usage
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

            <div className="space-y-1 border-t border-vena-border pt-4 text-xs text-vena-text-muted">
              <p>
                Session resets:{" "}
                {formatDate(summary.claudeCode.sessionResetsAt)}
              </p>
              <p>
                Weekly resets: {formatDate(summary.claudeCode.weeklyResetsAt)}
              </p>
              {summary.claudeCode.notes && (
                <p className="mt-2 italic">{summary.claudeCode.notes}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Thresholds & Authority */}
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

/* ─── Local Components ───────────────────────────────────────────────── */

function PageHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
        Budget
      </h1>
      <p className="mt-1 text-sm text-vena-text-secondary">
        Vault &amp; Valve &mdash; balance, usage, and alert status.
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
    <div className="rounded-lg border border-vena-border bg-vena-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-vena-text-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-vena-text">{value}</p>
      {sub && (
        <p className="mt-0.5 text-xs text-vena-text-secondary">{sub}</p>
      )}
    </div>
  );
}

function AlertCard({ level }: { level: AlertLevel }) {
  const config: Record<AlertLevel, { text: string; textColor: string; dotColor: string }> = {
    normal: {
      text: "Normal",
      textColor: "text-vena-success",
      dotColor: "bg-vena-success",
    },
    warn: {
      text: "Warning",
      textColor: "text-vena-warning",
      dotColor: "bg-vena-warning",
    },
    critical: {
      text: "Critical",
      textColor: "text-vena-error",
      dotColor: "bg-vena-error",
    },
    locked: {
      text: "LOCKED",
      textColor: "text-vena-error",
      dotColor: "bg-vena-error",
    },
  };

  const c = config[level];

  return (
    <div className="rounded-lg border border-vena-border bg-vena-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-vena-text-muted">
        Alert Level
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${c.dotColor} ${level === "normal" ? "animate-pulse" : ""}`}
        />
        <span className={`text-2xl font-semibold ${c.textColor}`}>{c.text}</span>
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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function WalletEmptyIcon() {
  return (
    <svg className="h-5 w-5 text-vena-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="16" rx="2" ry="2" />
      <path d="M1 10h22" />
    </svg>
  );
}
