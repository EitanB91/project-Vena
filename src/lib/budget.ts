// =============================================================================
// Budget Reader — Parse budget-ledger.json and usage-log.jsonl
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import type {
  AlertLevel,
  ApiBudget,
  BudgetLedger,
  BudgetSummary,
  ClaudeCodeUsage,
  UsageEvent,
} from '@/types';

/** Raw JSON shape of the ledger file (snake_case keys) */
interface RawLedger {
  apis: Record<string, RawApiBudget>;
  claude_code: RawClaudeCodeUsage;
  alert_thresholds: { warn_at_percent: number; critical_at_percent: number; locked_at: string };
  authority: { at_floor: string; note: string };
}

interface RawApiBudget {
  name: string;
  remaining_balance: number;
  usable_budget_monthly: number;
  floor: number;
  currency: string;
  alert_level: string;
  last_updated: string;
  notes: string;
}

interface RawClaudeCodeUsage {
  plan: string;
  session_usage_percent: number;
  session_resets_at: string;
  weekly_usage_percent: number;
  weekly_resets_at: string;
  daily_soft_limit: number | null;
  weekly_soft_limit: number | null;
  last_updated: string;
  notes: string;
}

/**
 * Read and parse the budget ledger JSON file.
 */
export function readBudgetLedger(claudeDir: string): BudgetLedger | null {
  const filePath = path.join(claudeDir, 'vault-and-valve', 'budget-ledger.json');

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data: RawLedger = JSON.parse(raw);
    return transformLedger(data);
  } catch {
    return null;
  }
}

/**
 * Compute a display-friendly budget summary from the ledger.
 */
export function computeBudgetSummary(ledger: BudgetLedger): BudgetSummary {
  // Use the first API entry (typically anthropic_claude)
  const apiKeys = Object.keys(ledger.apis);
  const primaryApi = apiKeys.length > 0 ? ledger.apis[apiKeys[0]] : null;

  if (!primaryApi) {
    return {
      remainingBalance: 0,
      usableBudget: 0,
      floor: 0,
      alertLevel: 'locked',
      usablePercent: 0,
      currency: 'USD',
      claudeCode: ledger.claudeCode,
    };
  }

  const usableBudget = primaryApi.remainingBalance - primaryApi.floor;
  const usablePercent =
    primaryApi.usableBudgetMonthly > 0
      ? (usableBudget / primaryApi.usableBudgetMonthly) * 100
      : 0;

  return {
    remainingBalance: primaryApi.remainingBalance,
    usableBudget: Math.max(0, usableBudget),
    floor: primaryApi.floor,
    alertLevel: primaryApi.alertLevel,
    usablePercent: Math.max(0, usablePercent),
    currency: primaryApi.currency,
    claudeCode: ledger.claudeCode,
  };
}

/**
 * Read and parse the usage log JSONL file.
 * Returns events in chronological order.
 */
export function readUsageLog(claudeDir: string): UsageEvent[] {
  const filePath = path.join(claudeDir, 'vault-and-valve', 'usage-log.jsonl');

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return parseUsageLog(raw);
  } catch {
    return [];
  }
}

/**
 * Parse JSONL content into typed UsageEvent array.
 */
export function parseUsageLog(content: string): UsageEvent[] {
  const events: UsageEvent[] = [];
  const lines = content.split('\n').filter((line) => line.trim());

  for (const line of lines) {
    try {
      const raw = JSON.parse(line);
      events.push(transformUsageEvent(raw));
    } catch {
      // Skip malformed lines
    }
  }

  return events;
}

// ---------------------------------------------------------------------------
// Internal transformers (snake_case → camelCase)
// ---------------------------------------------------------------------------

function transformLedger(raw: RawLedger): BudgetLedger {
  const apis: Record<string, ApiBudget> = {};

  for (const [key, value] of Object.entries(raw.apis)) {
    apis[key] = {
      name: value.name,
      remainingBalance: value.remaining_balance,
      usableBudgetMonthly: value.usable_budget_monthly,
      floor: value.floor,
      currency: value.currency,
      alertLevel: value.alert_level as AlertLevel,
      lastUpdated: value.last_updated,
      notes: value.notes,
    };
  }

  const claudeCode: ClaudeCodeUsage = {
    plan: raw.claude_code.plan,
    sessionUsagePercent: raw.claude_code.session_usage_percent,
    sessionResetsAt: raw.claude_code.session_resets_at,
    weeklyUsagePercent: raw.claude_code.weekly_usage_percent,
    weeklyResetsAt: raw.claude_code.weekly_resets_at,
    dailySoftLimit: raw.claude_code.daily_soft_limit,
    weeklySoftLimit: raw.claude_code.weekly_soft_limit,
    lastUpdated: raw.claude_code.last_updated,
    notes: raw.claude_code.notes,
  };

  return {
    apis,
    claudeCode,
    alertThresholds: {
      warnAtPercent: raw.alert_thresholds.warn_at_percent,
      criticalAtPercent: raw.alert_thresholds.critical_at_percent,
      lockedAt: raw.alert_thresholds.locked_at,
    },
    authority: {
      atFloor: raw.authority.at_floor,
      note: raw.authority.note,
    },
  };
}

function transformUsageEvent(raw: Record<string, unknown>): UsageEvent {
  const ts = typeof raw.ts === 'string' ? raw.ts : '';
  const session =
    typeof raw.session === 'string'
      ? raw.session
      : `synthetic-${ts.replace(/\W/g, '')}`;
  const base = {
    ts,
    session,
    source: typeof raw.source === 'string' ? raw.source : 'unknown',
  };

  const event = raw.event as string;

  if (event === 'SessionSummary') {
    return {
      ...base,
      event: 'SessionSummary',
      phase: raw.phase as string | undefined,
      actors: raw.actors as string[] | undefined,
      categories: raw.categories as string[] | undefined,
      apiCostUsd: raw.api_cost_usd as number | undefined,
      summary: raw.summary as string | undefined,
    };
  }

  return {
    ...base,
    event: event as 'SessionStart' | 'SessionEnd',
  };
}
