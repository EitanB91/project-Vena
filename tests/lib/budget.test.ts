import { describe, it, expect } from 'vitest';
import { parseUsageLog, computeBudgetSummary } from '@/lib/budget';
import type { BudgetLedger } from '@/types';

// ---------------------------------------------------------------------------
// parseUsageLog
// ---------------------------------------------------------------------------

describe('parseUsageLog', () => {
  it('parses SessionStart and SessionEnd events', () => {
    const jsonl = [
      '{"ts":"2026-03-17T10:00:00Z","event":"SessionStart","session":"abc-123","source":"hook"}',
      '{"ts":"2026-03-17T10:30:00Z","event":"SessionEnd","session":"abc-123","source":"hook"}',
    ].join('\n');

    const events = parseUsageLog(jsonl);
    expect(events).toHaveLength(2);
    expect(events[0].event).toBe('SessionStart');
    expect(events[0].session).toBe('abc-123');
    expect(events[1].event).toBe('SessionEnd');
  });

  it('parses SessionSummary events with all fields', () => {
    const jsonl =
      '{"ts":"2026-03-17T12:00:00Z","event":"SessionSummary","session":"abc-123","source":"orchestrator","phase":"P1","actors":["Orchestrator"],"categories":["code_build"],"api_cost_usd":0.05,"summary":"Built things."}';

    const events = parseUsageLog(jsonl);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('SessionSummary');
    if (events[0].event === 'SessionSummary') {
      expect(events[0].phase).toBe('P1');
      expect(events[0].actors).toEqual(['Orchestrator']);
      expect(events[0].apiCostUsd).toBe(0.05);
      expect(events[0].summary).toBe('Built things.');
    }
  });

  it('generates synthetic session ID for SessionSummary without session field (B1 fix)', () => {
    const jsonl =
      '{"ts":"2026-03-18T00:00:00Z","event":"SessionSummary","source":"orchestrator","phase":"O6-1","actors":["Orchestrator"],"categories":["code_build"],"api_cost_usd":0.00,"summary":"Phase complete."}';

    const events = parseUsageLog(jsonl);
    expect(events).toHaveLength(1);
    expect(events[0].session).toMatch(/^synthetic-/);
    expect(events[0].session).not.toBe('undefined');
  });

  it('skips malformed lines', () => {
    const jsonl = [
      '{"ts":"2026-03-17T10:00:00Z","event":"SessionStart","session":"abc","source":"hook"}',
      'this is not json',
      '{"ts":"2026-03-17T10:30:00Z","event":"SessionEnd","session":"abc","source":"hook"}',
    ].join('\n');

    const events = parseUsageLog(jsonl);
    expect(events).toHaveLength(2);
  });

  it('handles empty content', () => {
    expect(parseUsageLog('')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// computeBudgetSummary
// ---------------------------------------------------------------------------

describe('computeBudgetSummary', () => {
  const baseLedger: BudgetLedger = {
    apis: {
      anthropic_claude: {
        name: 'Claude API',
        remainingBalance: 4.87,
        usableBudgetMonthly: 4.0,
        floor: 0.87,
        currency: 'USD',
        alertLevel: 'normal',
        lastUpdated: '2026-03-17T00:00:00Z',
        notes: '',
      },
    },
    claudeCode: {
      plan: 'pro',
      sessionUsagePercent: 10,
      sessionResetsAt: '2026-03-17T03:00:00Z',
      weeklyUsagePercent: 55,
      weeklyResetsAt: '2026-03-17T20:00:00Z',
      dailySoftLimit: null,
      weeklySoftLimit: null,
      lastUpdated: '2026-03-17T00:00:00Z',
      notes: '',
    },
    alertThresholds: { warnAtPercent: 30, criticalAtPercent: 10, lockedAt: 'floor' },
    authority: { atFloor: 'director_only', note: '' },
  };

  it('computes usable budget correctly', () => {
    const summary = computeBudgetSummary(baseLedger);
    expect(summary.remainingBalance).toBe(4.87);
    expect(summary.floor).toBe(0.87);
    expect(summary.usableBudget).toBe(4.0);
  });

  it('computes usable percent relative to monthly budget', () => {
    const summary = computeBudgetSummary(baseLedger);
    // usable = 4.87 - 0.87 = 4.0, monthly = 4.0 → 100%
    expect(summary.usablePercent).toBe(100);
  });

  it('returns alert level from the primary API', () => {
    const summary = computeBudgetSummary(baseLedger);
    expect(summary.alertLevel).toBe('normal');
  });

  it('handles empty APIs gracefully', () => {
    const emptyLedger: BudgetLedger = {
      ...baseLedger,
      apis: {},
    };
    const summary = computeBudgetSummary(emptyLedger);
    expect(summary.remainingBalance).toBe(0);
    expect(summary.alertLevel).toBe('locked');
  });

  it('clamps usable budget to zero when at floor', () => {
    const atFloor: BudgetLedger = {
      ...baseLedger,
      apis: {
        test: {
          ...baseLedger.apis['anthropic_claude'],
          remainingBalance: 0.87,
          floor: 0.87,
        },
      },
    };
    const summary = computeBudgetSummary(atFloor);
    expect(summary.usableBudget).toBe(0);
    expect(summary.usablePercent).toBe(0);
  });
});
