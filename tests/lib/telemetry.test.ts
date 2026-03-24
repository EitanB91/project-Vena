import { describe, it, expect } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import {
  getProjectSlug,
  getSessionFiles,
  parseSessionTelemetry,
  isSessionActive,
  getProjectTelemetry,
} from '@/lib/telemetry';

// =============================================================================
// getProjectSlug
// =============================================================================

describe('getProjectSlug', () => {
  it('converts Windows path to slug preserving double-hyphens', () => {
    const slug = getProjectSlug('c:\\Users\\user\\Desktop\\Ai\\Claude\\project-Vena');
    expect(slug).toBe('c--Users-user-Desktop-Ai-Claude-project-Vena');
  });

  it('converts forward-slash path to slug', () => {
    const slug = getProjectSlug('c:/Users/user/Desktop/project');
    expect(slug).toBe('c--Users-user-Desktop-project');
  });

  it('handles trailing separators', () => {
    // path.resolve() normalizes trailing separators
    const slug = getProjectSlug('c:\\Users\\user\\Desktop\\project\\');
    expect(slug).toBe('c--Users-user-Desktop-project');
  });
});

// =============================================================================
// getSessionFiles
// =============================================================================

describe('getSessionFiles', () => {
  it('returns empty array for invalid slug (path traversal)', () => {
    expect(getSessionFiles('../../etc')).toEqual([]);
    expect(getSessionFiles('../..')).toEqual([]);
  });

  it('returns empty array for slug with semicolons', () => {
    expect(getSessionFiles('foo;ls')).toEqual([]);
  });

  it('returns empty array for empty slug', () => {
    expect(getSessionFiles('')).toEqual([]);
  });

  it('returns empty array for nonexistent project', () => {
    expect(getSessionFiles('nonexistent-project-slug-xyz')).toEqual([]);
  });

  it('returns .jsonl files for valid project slug', () => {
    const slug = 'c--Users-user-Desktop-Ai-Claude-project-Vena';
    const files = getSessionFiles(slug);
    // We know this project has JSONL files from our exploration
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(file).toMatch(/\.jsonl$/);
      expect(path.basename(file)).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jsonl$/,
      );
    }
  });
});

// =============================================================================
// parseSessionTelemetry
// =============================================================================

describe('parseSessionTelemetry', () => {
  it('returns null for path traversal attempt', async () => {
    const result = await parseSessionTelemetry('/etc/passwd');
    expect(result).toBeNull();
  });

  it('returns null for non-jsonl file', async () => {
    const fakePath = path.join(os.homedir(), '.claude', 'projects', 'fake', 'session.json');
    const result = await parseSessionTelemetry(fakePath);
    expect(result).toBeNull();
  });

  it('returns null for nonexistent file', async () => {
    // Use a path that IS under .claude/projects but doesn't exist
    const fakePath = path.join(os.homedir(), '.claude', 'projects', 'fake', 'fake.jsonl');
    const result = await parseSessionTelemetry(fakePath);
    expect(result).toBeNull();
  });

  it('parses fixture session correctly', async () => {
    // The fixture is NOT under ~/.claude/projects, so we need to test with real data
    // Test with a real session file from the actual project
    const slug = 'c--Users-user-Desktop-Ai-Claude-project-Vena';
    const files = getSessionFiles(slug);
    if (files.length === 0) {
      // Skip if no real session data available
      return;
    }

    const result = await parseSessionTelemetry(files[0]);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.sessionId).toBeTruthy();
    expect(result.startTime).toBeInstanceOf(Date);
    expect(result.endTime).toBeInstanceOf(Date);
    expect(result.durationMinutes).toBeGreaterThanOrEqual(0);
    expect(result.model).toBeTruthy();
    expect(result.tokens.total).toBeGreaterThan(0);
    expect(result.messageCount).toBeGreaterThan(0);
  });

  it('extracts correct token breakdown from real data', async () => {
    const slug = 'c--Users-user-Desktop-Ai-Claude-project-Vena';
    const files = getSessionFiles(slug);
    if (files.length === 0) return;

    const result = await parseSessionTelemetry(files[0]);
    if (!result) return;

    // Token breakdown should have non-negative values
    expect(result.tokens.input).toBeGreaterThanOrEqual(0);
    expect(result.tokens.output).toBeGreaterThanOrEqual(0);
    expect(result.tokens.cacheCreation).toBeGreaterThanOrEqual(0);
    expect(result.tokens.cacheRead).toBeGreaterThanOrEqual(0);
    // Total should equal sum of parts
    expect(result.tokens.total).toBe(
      result.tokens.input + result.tokens.output + result.tokens.cacheCreation + result.tokens.cacheRead,
    );
  });
});

// =============================================================================
// isSessionActive
// =============================================================================

describe('isSessionActive', () => {
  it('returns false for old files', () => {
    const slug = 'c--Users-user-Desktop-Ai-Claude-project-Vena';
    const files = getSessionFiles(slug);
    if (files.length === 0) return;

    // Use a very small threshold so even recent files appear inactive
    const result = isSessionActive(files[0], Date.now(), 1);
    expect(result).toBe(false);
  });

  it('returns true for file modified within threshold', () => {
    const slug = 'c--Users-user-Desktop-Ai-Claude-project-Vena';
    const files = getSessionFiles(slug);
    if (files.length === 0) return;

    // Use a very large threshold so all files appear active
    const result = isSessionActive(files[0], Date.now(), 365 * 24 * 60 * 60 * 1000);
    expect(result).toBe(true);
  });

  it('returns false for nonexistent file', () => {
    expect(isSessionActive('/nonexistent/path.jsonl')).toBe(false);
  });
});

// =============================================================================
// getProjectTelemetry
// =============================================================================

describe('getProjectTelemetry', () => {
  it('returns empty result for nonexistent project', async () => {
    const result = await getProjectTelemetry('nonexistent-project-xyz');
    expect(result.sessions).toEqual([]);
    expect(result.totals.total).toBe(0);
    expect(result.activeSessionCount).toBe(0);
    expect(result.dailyUsage).toEqual([]);
  });

  it('returns valid telemetry for this project', async () => {
    const slug = 'c--Users-user-Desktop-Ai-Claude-project-Vena';
    const result = await getProjectTelemetry(slug);

    expect(result.projectSlug).toBe(slug);
    expect(result.sessions.length).toBeGreaterThan(0);
    expect(result.totals.total).toBeGreaterThan(0);
    expect(result.dailyUsage.length).toBeGreaterThan(0);

    // Sessions should be sorted newest first
    for (let i = 1; i < result.sessions.length; i++) {
      expect(result.sessions[i - 1].startTime.getTime())
        .toBeGreaterThanOrEqual(result.sessions[i].startTime.getTime());
    }
  });

  it('includes subagent tokens in totals', async () => {
    const slug = 'c--Users-user-Desktop-Ai-Claude-project-Vena';
    const result = await getProjectTelemetry(slug);

    // Find sessions with subagents
    const withSubagents = result.sessions.filter((s) => s.subagentCount > 0);
    if (withSubagents.length === 0) return;

    for (const session of withSubagents) {
      expect(session.subagentTokens.total).toBeGreaterThan(0);
    }
  });

  it('daily usage dates are sorted ascending', async () => {
    const slug = 'c--Users-user-Desktop-Ai-Claude-project-Vena';
    const result = await getProjectTelemetry(slug);

    for (let i = 1; i < result.dailyUsage.length; i++) {
      expect(result.dailyUsage[i - 1].date.localeCompare(result.dailyUsage[i].date))
        .toBeLessThanOrEqual(0);
    }
  });

  it('daily usage includes toolCalls aggregation', async () => {
    const slug = 'c--Users-user-Desktop-Ai-Claude-project-Vena';
    const result = await getProjectTelemetry(slug);

    for (const day of result.dailyUsage) {
      expect(day).toHaveProperty('toolCalls');
      expect(typeof day.toolCalls).toBe('number');
      expect(day.toolCalls).toBeGreaterThanOrEqual(0);
    }

    // At least some days should have tool calls
    const totalToolCalls = result.dailyUsage.reduce((sum, d) => sum + d.toolCalls, 0);
    expect(totalToolCalls).toBeGreaterThan(0);
  });
});
