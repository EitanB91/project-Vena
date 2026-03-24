import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { syncTelemetryToVV } from '@/lib/vv-sync';
import type { SessionTelemetry, TokenBreakdown } from '@/types/telemetry';

// =============================================================================
// Helpers
// =============================================================================

const emptyTokens: TokenBreakdown = {
  input: 0, output: 0, cacheCreation: 0, cacheRead: 0, total: 0,
};

function mockSession(overrides: Partial<SessionTelemetry> = {}): SessionTelemetry {
  return {
    sessionId: 'test-session-001',
    title: 'Test Session',
    startTime: new Date('2026-03-20T10:00:00Z'),
    endTime: new Date('2026-03-20T10:30:00Z'),
    durationMinutes: 30,
    model: 'claude-opus-4-6',
    entrypoint: 'cli',
    version: '1.0.0',
    gitBranch: 'master',
    isActive: false,
    tokens: { input: 1000, output: 2000, cacheCreation: 500, cacheRead: 300, total: 3800 },
    messageCount: 12,
    toolCallCount: 8,
    subagentCount: 0,
    subagentTokens: { ...emptyTokens },
    ...overrides,
  };
}

// Temp directory for test isolation
let testDir: string;
let vvDir: string;
let logPath: string;

beforeEach(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vena-vv-sync-'));
  vvDir = path.join(testDir, 'vault-and-valve');
  logPath = path.join(vvDir, 'usage-log.jsonl');
  fs.mkdirSync(vvDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

// Fixed "now" = 2026-03-20T11:00:00Z (30 min after session end, well past 10-min threshold)
const NOW = new Date('2026-03-20T11:00:00Z').getTime();

// =============================================================================
// syncTelemetryToVV — core logic
// =============================================================================

describe('syncTelemetryToVV', () => {
  it('syncs an ended session to usage-log.jsonl', () => {
    const session = mockSession();
    const result = syncTelemetryToVV(testDir, [session], NOW);

    expect(result.synced).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.total).toBe(1);

    // Verify file was written
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(3); // Start + End + Summary
  });

  it('generates SessionStart, SessionEnd, and SessionSummary entries', () => {
    const session = mockSession();
    syncTelemetryToVV(testDir, [session], NOW);

    const content = fs.readFileSync(logPath, 'utf-8');
    const entries = content.trim().split('\n').map((l) => JSON.parse(l));

    expect(entries[0].event).toBe('SessionStart');
    expect(entries[0].session).toBe('test-session-001');
    expect(entries[0].source).toBe('telemetry-sync');
    expect(entries[0].ts).toBe('2026-03-20T10:00:00.000Z');

    expect(entries[1].event).toBe('SessionEnd');
    expect(entries[1].ts).toBe('2026-03-20T10:30:00.000Z');

    expect(entries[2].event).toBe('SessionSummary');
    expect(entries[2].source).toBe('telemetry-sync');
    expect(entries[2].categories).toBeDefined();
    expect(entries[2].summary).toContain('30.0min');
    expect(entries[2].summary).toContain('opus');
    expect(entries[2].summary).toContain('12 msgs');
    expect(entries[2].summary).toContain('8 tool calls');
  });

  it('skips active sessions', () => {
    const activeSession = mockSession({ isActive: true });
    const result = syncTelemetryToVV(testDir, [activeSession], NOW);

    expect(result.synced).toBe(0);
    expect(result.total).toBe(0);
    expect(fs.existsSync(logPath)).toBe(false);
  });

  it('skips sessions within the 10-minute stale threshold', () => {
    // Session ended 5 minutes ago — below 10-minute threshold
    const recentEnd = new Date(NOW - 5 * 60 * 1000);
    const session = mockSession({
      endTime: recentEnd,
      isActive: false,
    });
    const result = syncTelemetryToVV(testDir, [session], NOW);

    expect(result.synced).toBe(0);
    expect(result.total).toBe(0);
  });

  it('is idempotent — skips already-synced sessions', () => {
    const session = mockSession();

    // First sync
    const result1 = syncTelemetryToVV(testDir, [session], NOW);
    expect(result1.synced).toBe(1);

    // Second sync — same session
    const result2 = syncTelemetryToVV(testDir, [session], NOW);
    expect(result2.synced).toBe(0);
    expect(result2.skipped).toBe(1);

    // File should still have exactly 3 lines
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(3);
  });

  it('handles multiple sessions — syncs new, skips existing', () => {
    const session1 = mockSession({ sessionId: 'session-aaa' });
    const session2 = mockSession({ sessionId: 'session-bbb' });

    // Sync session 1
    syncTelemetryToVV(testDir, [session1], NOW);

    // Sync both — session 1 should be skipped, session 2 synced
    const result = syncTelemetryToVV(testDir, [session1, session2], NOW);
    expect(result.synced).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.total).toBe(2);

    // File should have 6 lines (3 per session)
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(6);
  });

  it('appends to existing log content without overwriting', () => {
    // Pre-populate log with a hook entry
    const hookEntry = '{"ts":"2026-03-17T10:00:00Z","event":"SessionStart","session":"hook-001","source":"hook"}\n';
    fs.writeFileSync(logPath, hookEntry);

    const session = mockSession();
    syncTelemetryToVV(testDir, [session], NOW);

    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(4); // 1 existing + 3 new
    expect(lines[0]).toContain('hook-001'); // Original preserved
  });

  it('creates vault-and-valve directory if missing', () => {
    // Remove the vv directory
    fs.rmSync(vvDir, { recursive: true });

    const session = mockSession();
    const result = syncTelemetryToVV(testDir, [session], NOW);

    expect(result.synced).toBe(1);
    expect(fs.existsSync(logPath)).toBe(true);
  });

  it('returns zero results for empty session list', () => {
    const result = syncTelemetryToVV(testDir, [], NOW);
    expect(result).toEqual({ synced: 0, skipped: 0, total: 0 });
  });
});

// =============================================================================
// Entry format — model names and token formatting
// =============================================================================

describe('entry format', () => {
  it('extracts short model name: opus', () => {
    const session = mockSession({ model: 'claude-opus-4-6' });
    syncTelemetryToVV(testDir, [session], NOW);

    const entries = fs.readFileSync(logPath, 'utf-8').trim().split('\n').map((l) => JSON.parse(l));
    const summary = entries.find((e: { event: string }) => e.event === 'SessionSummary');
    expect(summary.summary).toContain('opus');
  });

  it('extracts short model name: sonnet', () => {
    const session = mockSession({ model: 'claude-sonnet-4-6', sessionId: 'sonnet-test' });
    syncTelemetryToVV(testDir, [session], NOW);

    const entries = fs.readFileSync(logPath, 'utf-8').trim().split('\n').map((l) => JSON.parse(l));
    const summary = entries.find((e: { event: string }) => e.event === 'SessionSummary');
    expect(summary.summary).toContain('sonnet');
  });

  it('handles unknown model gracefully', () => {
    const session = mockSession({ model: '', sessionId: 'no-model' });
    syncTelemetryToVV(testDir, [session], NOW);

    const entries = fs.readFileSync(logPath, 'utf-8').trim().split('\n').map((l) => JSON.parse(l));
    const summary = entries.find((e: { event: string }) => e.event === 'SessionSummary');
    expect(summary.summary).toContain('unknown');
  });

  it('formats large token counts with K/M suffixes', () => {
    const session = mockSession({
      sessionId: 'big-tokens',
      tokens: { input: 500000, output: 1200000, cacheCreation: 0, cacheRead: 0, total: 1700000 },
    });
    syncTelemetryToVV(testDir, [session], NOW);

    const entries = fs.readFileSync(logPath, 'utf-8').trim().split('\n').map((l) => JSON.parse(l));
    const summary = entries.find((e: { event: string }) => e.event === 'SessionSummary');
    expect(summary.summary).toContain('1.2M output');
    expect(summary.summary).toContain('1.7M total');
  });
});

// =============================================================================
// Category inference (via git mock)
// =============================================================================

describe('category inference', () => {
  it('defaults to uncategorized for sessions with no matching git commits', () => {
    // Sessions in test have dates that won't match any real git commits
    const session = mockSession({ sessionId: 'no-commits' });
    syncTelemetryToVV(testDir, [session], NOW);

    const entries = fs.readFileSync(logPath, 'utf-8').trim().split('\n').map((l) => JSON.parse(l));
    const summary = entries.find((e: { event: string }) => e.event === 'SessionSummary');
    expect(summary.categories).toEqual(['uncategorized']);
  });
});

// =============================================================================
// Edge cases
// =============================================================================

describe('edge cases', () => {
  it('handles malformed existing log lines gracefully', () => {
    fs.writeFileSync(logPath, 'not json\n{"broken\n');

    const session = mockSession();
    const result = syncTelemetryToVV(testDir, [session], NOW);

    // Should still sync successfully (malformed lines are skipped during dedup read)
    expect(result.synced).toBe(1);
  });

  it('does not duplicate entries from hook source during dedup', () => {
    // Hook entries for same session ID should NOT prevent sync
    // (dedup only checks telemetry-sync source)
    const hookEntry = JSON.stringify({
      ts: '2026-03-20T10:00:00Z',
      event: 'SessionStart',
      session: 'test-session-001',
      source: 'hook',
    });
    fs.writeFileSync(logPath, hookEntry + '\n');

    const session = mockSession();
    const result = syncTelemetryToVV(testDir, [session], NOW);

    // Should sync because hook source doesn't count as telemetry-sync
    expect(result.synced).toBe(1);
  });

  it('entries are parseable by existing parseUsageLog', async () => {
    const { parseUsageLog } = await import('@/lib/budget');

    const session = mockSession();
    syncTelemetryToVV(testDir, [session], NOW);

    const content = fs.readFileSync(logPath, 'utf-8');
    const events = parseUsageLog(content);

    expect(events).toHaveLength(3);
    expect(events[0].event).toBe('SessionStart');
    expect(events[1].event).toBe('SessionEnd');
    expect(events[2].event).toBe('SessionSummary');
    if (events[2].event === 'SessionSummary') {
      expect(events[2].categories).toBeDefined();
      expect(events[2].summary).toBeDefined();
    }
  });
});
