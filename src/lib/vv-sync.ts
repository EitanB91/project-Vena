// =============================================================================
// V&V Sync — Automated Usage Log Entries from Telemetry (F9)
// Detects ended telemetry sessions and generates V&V-compatible usage-log
// entries. Runs lazily from the /api/telemetry route on each poll cycle.
// Security: Append-only writes confined to .claude/vault-and-valve/
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import type { SessionTelemetry } from '@/types/telemetry';
import { formatTokens } from '@/lib/format';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** Session must be stale for this long before syncing (10 minutes) */
const VV_SYNC_THRESHOLD_MS = 10 * 60 * 1000;

/** Source tag for telemetry-synced entries */
const SYNC_SOURCE = 'telemetry-sync';

/** Map git commit prefixes to V&V usage categories */
const COMMIT_CATEGORY_MAP: Record<string, string> = {
  feat: 'code_build',
  fix: 'code_build',
  refactor: 'code_build',
  test: 'tests',
  tests: 'tests',
  docs: 'admin',
  chore: 'admin',
  style: 'design',
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface VVSyncResult {
  /** Number of new sessions synced */
  synced: number;
  /** Number of sessions already in the log */
  skipped: number;
  /** Total ended sessions checked */
  total: number;
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Sync ended telemetry sessions to the V&V usage log.
 * Idempotent — skips sessions that already have telemetry-sync entries.
 * Generates SessionStart + SessionEnd + SessionSummary per new session.
 *
 * Note: No file locking. Safe for single-user local polling at 60s intervals.
 */
export function syncTelemetryToVV(
  claudeDir: string,
  sessions: SessionTelemetry[],
  now?: number,
): VVSyncResult {
  const currentTime = now ?? Date.now();
  const logPath = path.join(claudeDir, 'vault-and-valve', 'usage-log.jsonl');

  // Filter to ended sessions: not active AND stale > 10 minutes
  const endedSessions = sessions.filter(
    (s) => !s.isActive && (currentTime - s.endTime.getTime()) > VV_SYNC_THRESHOLD_MS,
  );

  if (endedSessions.length === 0) {
    return { synced: 0, skipped: 0, total: 0 };
  }

  // Read existing synced session IDs for deduplication
  const syncedIds = getSyncedSessionIds(logPath);

  // Generate entries for unsynced sessions
  const newLines: string[] = [];
  let skipped = 0;

  for (const session of endedSessions) {
    if (syncedIds.has(session.sessionId)) {
      skipped++;
      continue;
    }

    const categories = inferCategories(session);
    const entries = buildEntries(session, categories);
    newLines.push(...entries);
  }

  // Append to usage log
  if (newLines.length > 0) {
    try {
      const dir = path.dirname(logPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(logPath, newLines.join('\n') + '\n');
    } catch {
      // S6: No file paths in error output — silent failure
      return { synced: 0, skipped, total: endedSessions.length };
    }
  }

  const synced = endedSessions.length - skipped;
  return { synced, skipped, total: endedSessions.length };
}

// -----------------------------------------------------------------------------
// Internal Helpers
// -----------------------------------------------------------------------------

/**
 * Read existing usage-log and extract session IDs with telemetry-sync source.
 */
function getSyncedSessionIds(logPath: string): Set<string> {
  const ids = new Set<string>();

  try {
    const content = fs.readFileSync(logPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const entry = JSON.parse(trimmed);
        if (
          typeof entry === 'object' &&
          entry !== null &&
          entry.source === SYNC_SOURCE &&
          typeof entry.session === 'string'
        ) {
          ids.add(entry.session);
        }
      } catch {
        // Skip malformed lines
      }
    }
  } catch {
    // File doesn't exist yet — no synced IDs
  }

  return ids;
}

/**
 * Infer V&V usage categories from git commits during the session window.
 * Falls back to ["uncategorized"] if no commits found or git unavailable.
 */
function inferCategories(session: SessionTelemetry): string[] {
  try {
    const after = session.startTime.toISOString();
    const before = session.endTime.toISOString();

    const output = execSync(
      `git log --format="%s" --after="${after}" --before="${before}"`,
      { encoding: 'utf-8', timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] },
    ).trim();

    if (!output) return ['uncategorized'];

    const categories = new Set<string>();
    for (const line of output.split('\n')) {
      const match = line.match(/^(\w+):/);
      if (match) {
        const mapped = COMMIT_CATEGORY_MAP[match[1].toLowerCase()];
        if (mapped) categories.add(mapped);
      }
    }

    return categories.size > 0 ? Array.from(categories) : ['uncategorized'];
  } catch {
    return ['uncategorized'];
  }
}

/**
 * Extract a short model name from the full model string.
 * "claude-opus-4-6" → "opus", "claude-sonnet-4-6" → "sonnet"
 */
function shortModelName(model: string): string {
  if (!model) return 'unknown';
  const lower = model.toLowerCase();
  if (lower.includes('opus')) return 'opus';
  if (lower.includes('sonnet')) return 'sonnet';
  if (lower.includes('haiku')) return 'haiku';
  return model;
}

/**
 * Build V&V-compatible JSONL entries for a telemetry session.
 * Generates: SessionStart + SessionEnd + SessionSummary.
 */
function buildEntries(session: SessionTelemetry, categories: string[]): string[] {
  const sid = session.sessionId;

  const start = JSON.stringify({
    ts: session.startTime.toISOString(),
    event: 'SessionStart',
    session: sid,
    source: SYNC_SOURCE,
  });

  const end = JSON.stringify({
    ts: session.endTime.toISOString(),
    event: 'SessionEnd',
    session: sid,
    source: SYNC_SOURCE,
  });

  const model = shortModelName(session.model);
  const duration = session.durationMinutes.toFixed(1);
  const outputTokens = formatTokens(session.tokens.output);
  const totalTokens = formatTokens(session.tokens.total);

  const summary = JSON.stringify({
    ts: session.endTime.toISOString(),
    event: 'SessionSummary',
    session: sid,
    source: SYNC_SOURCE,
    categories,
    summary: `Auto: ${duration}min, ${outputTokens} output (${totalTokens} total), ${model}, ${session.messageCount} msgs, ${session.toolCallCount} tool calls`,
  });

  return [start, end, summary];
}
