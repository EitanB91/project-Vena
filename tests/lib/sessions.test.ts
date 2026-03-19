import { describe, it, expect } from 'vitest';
import { buildSessionTimeline } from '@/lib/sessions';
import type { UsageEvent } from '@/types';

describe('buildSessionTimeline', () => {
  it('pairs start and end events into sessions', () => {
    const events: UsageEvent[] = [
      { ts: '2026-03-17T10:00:00Z', event: 'SessionStart', session: 'a', source: 'hook' },
      { ts: '2026-03-17T10:30:00Z', event: 'SessionEnd', session: 'a', source: 'hook' },
    ];

    const timeline = buildSessionTimeline(events);
    expect(timeline.sessions).toHaveLength(1);
    expect(timeline.sessions[0].id).toBe('a');
    expect(timeline.sessions[0].startedAt).toBe('2026-03-17T10:00:00Z');
    expect(timeline.sessions[0].endedAt).toBe('2026-03-17T10:30:00Z');
    expect(timeline.sessions[0].durationMinutes).toBe(30);
  });

  it('handles sessions with no end event (still running)', () => {
    const events: UsageEvent[] = [
      { ts: '2026-03-17T10:00:00Z', event: 'SessionStart', session: 'b', source: 'hook' },
    ];

    const timeline = buildSessionTimeline(events);
    expect(timeline.sessions).toHaveLength(1);
    expect(timeline.sessions[0].endedAt).toBeNull();
    expect(timeline.sessions[0].durationMinutes).toBeNull();
  });

  it('filters out ultra-short sessions (hook noise)', () => {
    const events: UsageEvent[] = [
      // 1-second session — should be filtered
      { ts: '2026-03-17T10:00:00Z', event: 'SessionStart', session: 'short', source: 'hook' },
      { ts: '2026-03-17T10:00:01Z', event: 'SessionEnd', session: 'short', source: 'hook' },
      // 10-minute session — should be kept
      { ts: '2026-03-17T11:00:00Z', event: 'SessionStart', session: 'long', source: 'hook' },
      { ts: '2026-03-17T11:10:00Z', event: 'SessionEnd', session: 'long', source: 'hook' },
    ];

    const timeline = buildSessionTimeline(events);
    expect(timeline.sessions).toHaveLength(1);
    expect(timeline.sessions[0].id).toBe('long');
  });

  it('attaches summary events to their sessions', () => {
    const events: UsageEvent[] = [
      { ts: '2026-03-17T10:00:00Z', event: 'SessionStart', session: 'c', source: 'hook' },
      { ts: '2026-03-17T10:30:00Z', event: 'SessionEnd', session: 'c', source: 'hook' },
      {
        ts: '2026-03-17T10:30:00Z',
        event: 'SessionSummary',
        session: 'c',
        source: 'orchestrator',
        phase: 'P1',
        actors: ['Orchestrator'],
        categories: ['code_build'],
        apiCostUsd: 0,
        summary: 'Built Phase 1.',
      },
    ];

    const timeline = buildSessionTimeline(events);
    expect(timeline.sessions).toHaveLength(1);
    expect(timeline.sessions[0].summary).not.toBeNull();
    expect(timeline.sessions[0].summary?.phase).toBe('P1');
  });

  it('sorts sessions most recent first', () => {
    const events: UsageEvent[] = [
      { ts: '2026-03-17T08:00:00Z', event: 'SessionStart', session: 'early', source: 'hook' },
      { ts: '2026-03-17T08:30:00Z', event: 'SessionEnd', session: 'early', source: 'hook' },
      { ts: '2026-03-17T14:00:00Z', event: 'SessionStart', session: 'late', source: 'hook' },
      { ts: '2026-03-17T14:30:00Z', event: 'SessionEnd', session: 'late', source: 'hook' },
    ];

    const timeline = buildSessionTimeline(events);
    expect(timeline.sessions[0].id).toBe('late');
    expect(timeline.sessions[1].id).toBe('early');
  });

  it('groups sessions by date', () => {
    const events: UsageEvent[] = [
      { ts: '2026-03-17T10:00:00Z', event: 'SessionStart', session: 'd1', source: 'hook' },
      { ts: '2026-03-17T10:30:00Z', event: 'SessionEnd', session: 'd1', source: 'hook' },
      { ts: '2026-03-18T10:00:00Z', event: 'SessionStart', session: 'd2', source: 'hook' },
      { ts: '2026-03-18T10:30:00Z', event: 'SessionEnd', session: 'd2', source: 'hook' },
    ];

    const timeline = buildSessionTimeline(events);
    expect(Object.keys(timeline.byDate)).toHaveLength(2);
    expect(timeline.byDate['2026-03-17']).toHaveLength(1);
    expect(timeline.byDate['2026-03-18']).toHaveLength(1);
  });

  it('computes total minutes across all sessions', () => {
    const events: UsageEvent[] = [
      { ts: '2026-03-17T10:00:00Z', event: 'SessionStart', session: 'x', source: 'hook' },
      { ts: '2026-03-17T10:15:00Z', event: 'SessionEnd', session: 'x', source: 'hook' },
      { ts: '2026-03-17T11:00:00Z', event: 'SessionStart', session: 'y', source: 'hook' },
      { ts: '2026-03-17T11:45:00Z', event: 'SessionEnd', session: 'y', source: 'hook' },
    ];

    const timeline = buildSessionTimeline(events);
    expect(timeline.totalMinutes).toBe(60);
    expect(timeline.totalSessions).toBe(2);
  });

  it('handles empty events array', () => {
    const timeline = buildSessionTimeline([]);
    expect(timeline.sessions).toHaveLength(0);
    expect(timeline.totalSessions).toBe(0);
    expect(timeline.totalMinutes).toBe(0);
  });

  it('uses earliest start and latest end for duplicate events (same session ID)', () => {
    const events: UsageEvent[] = [
      { ts: '2026-03-17T10:00:00Z', event: 'SessionStart', session: 'dup', source: 'hook' },
      { ts: '2026-03-17T10:05:00Z', event: 'SessionStart', session: 'dup', source: 'hook' },
      { ts: '2026-03-17T10:25:00Z', event: 'SessionEnd', session: 'dup', source: 'hook' },
      { ts: '2026-03-17T10:30:00Z', event: 'SessionEnd', session: 'dup', source: 'hook' },
    ];

    const timeline = buildSessionTimeline(events);
    expect(timeline.sessions).toHaveLength(1);
    expect(timeline.sessions[0].startedAt).toBe('2026-03-17T10:00:00Z');
    expect(timeline.sessions[0].endedAt).toBe('2026-03-17T10:30:00Z');
    expect(timeline.sessions[0].durationMinutes).toBe(30);
  });
});
