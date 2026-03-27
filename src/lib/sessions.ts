// =============================================================================
// Session Reader — Parse usage-log.jsonl into session timeline
// =============================================================================

import type {
  Session,
  SessionSummaryEvent,
  SessionTimeline,
  UsageEvent,
} from '@/types';
import { readUsageLog } from './budget';

/**
 * Build a session timeline from usage log events.
 * Pairs SessionStart/SessionEnd events by session ID and computes durations.
 */
export function buildSessionTimeline(events: UsageEvent[]): SessionTimeline {
  const startMap = new Map<string, string>();
  const endMap = new Map<string, string>();
  const sourceMap = new Map<string, string>();
  const summaryMap = new Map<string, SessionSummaryEvent>();
  const sessionIds = new Set<string>();

  for (const event of events) {
    const sid = event.session;
    sessionIds.add(sid);
    sourceMap.set(sid, event.source);

    switch (event.event) {
      case 'SessionStart':
        // Use earliest start time for this session
        if (!startMap.has(sid) || event.ts < startMap.get(sid)!) {
          startMap.set(sid, event.ts);
        }
        break;
      case 'SessionEnd':
        // Use latest end time for this session
        if (!endMap.has(sid) || event.ts > endMap.get(sid)!) {
          endMap.set(sid, event.ts);
        }
        break;
      case 'SessionSummary':
        summaryMap.set(sid, event);
        break;
    }
  }

  const sessions: Session[] = [];

  for (const sid of sessionIds) {
    const startedAt = startMap.get(sid);
    const endedAt = endMap.get(sid) ?? null;

    // Skip sessions with no start event (summary-only entries use their own session ID)
    if (!startedAt && !summaryMap.has(sid)) continue;

    const durationMinutes = computeDuration(startedAt ?? null, endedAt);

    sessions.push({
      id: sid,
      startedAt: startedAt ?? summaryMap.get(sid)?.ts ?? '',
      endedAt,
      durationMinutes,
      source: sourceMap.get(sid) ?? 'unknown',
      summary: summaryMap.get(sid) ?? null,
    });
  }

  // Sort by start time, most recent first
  sessions.sort((a, b) =>
    b.startedAt > a.startedAt ? 1 : b.startedAt < a.startedAt ? -1 : 0,
  );

  // Filter out ultra-short sessions (< 3 seconds) that are likely hook noise
  const meaningfulSessions = sessions.filter((s) => {
    if (s.durationMinutes === null) return true; // Still running
    if (s.summary) return true; // Has a summary, always meaningful
    return s.durationMinutes >= 0.05; // At least ~3 seconds
  });

  const totalMinutes = meaningfulSessions.reduce(
    (sum, s) => sum + (s.durationMinutes ?? 0),
    0,
  );

  const byDate = groupByDate(meaningfulSessions);

  return {
    sessions: meaningfulSessions,
    totalSessions: meaningfulSessions.length,
    totalMinutes: Math.round(totalMinutes * 10) / 10,
    byDate,
  };
}

/**
 * Read the usage log and build a session timeline in one call.
 */
export function readSessionTimeline(claudeDir: string): SessionTimeline {
  const events = readUsageLog(claudeDir);
  return buildSessionTimeline(events);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeDuration(
  startedAt: string | null,
  endedAt: string | null,
): number | null {
  if (!startedAt || !endedAt) return null;

  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();

  if (isNaN(start) || isNaN(end)) return null;

  return Math.max(0, (end - start) / 60000); // minutes
}

// ---------------------------------------------------------------------------
// Session Enrichment — merge V&V usage-log data into telemetry sessions
// ---------------------------------------------------------------------------

export interface SessionEnrichment {
  categories: string[];
  phase: string | null;
}

/**
 * Read V&V usage-log summaries and return enrichment data keyed by session ID.
 * Used to add categories + phase tags to telemetry-based session views.
 */
export function getSessionEnrichment(claudeDir: string): Map<string, SessionEnrichment> {
  const events = readUsageLog(claudeDir);
  const map = new Map<string, SessionEnrichment>();

  for (const event of events) {
    if (event.event === 'SessionSummary') {
      const summary = event as SessionSummaryEvent;
      map.set(summary.session, {
        categories: summary.categories ?? [],
        phase: summary.phase ?? null,
      });
    }
  }

  return map;
}

function groupByDate(sessions: Session[]): Record<string, Session[]> {
  const groups: Record<string, Session[]> = {};

  for (const session of sessions) {
    const dateStr = session.startedAt.slice(0, 10); // YYYY-MM-DD
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(session);
  }

  return groups;
}
