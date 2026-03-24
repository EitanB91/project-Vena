import { describe, it, expect } from 'vitest';
import { buildPhaseTokenReport } from '@/lib/phase-tokens';
import type { RoadmapPhase } from '@/types';
import type { SessionTelemetry, TokenBreakdown } from '@/types/telemetry';

function emptyTokens(): TokenBreakdown {
  return { input: 0, output: 0, cacheCreation: 0, cacheRead: 0, total: 0 };
}

function makeSession(overrides: Partial<SessionTelemetry>): SessionTelemetry {
  return {
    sessionId: 'test-session',
    title: null,
    startTime: new Date('2026-03-01'),
    endTime: new Date('2026-03-01'),
    durationMinutes: 10,
    model: 'claude-sonnet-4-6',
    entrypoint: 'cli',
    version: '1.0.0',
    gitBranch: 'main',
    isActive: false,
    tokens: { input: 100, output: 200, cacheCreation: 50, cacheRead: 30, total: 380 },
    messageCount: 5,
    toolCallCount: 3,
    subagentCount: 0,
    subagentTokens: emptyTokens(),
    ...overrides,
  };
}

const phases: RoadmapPhase[] = [
  {
    id: '1',
    title: 'Phase 1 — Foundation',
    status: 'complete',
    goal: 'Scaffold',
    completedDate: '2026-03-10',
    tasks: [],
  },
  {
    id: '2',
    title: 'Phase 2 — Data Layer',
    status: 'complete',
    goal: 'Data',
    completedDate: '2026-03-15',
    tasks: [],
  },
  {
    id: '3',
    title: 'Phase 3 — Agents',
    status: 'next',
    goal: 'Agents',
    completedDate: null,
    tasks: [],
  },
];

describe('buildPhaseTokenReport', () => {
  it('returns empty reports when no sessions match', () => {
    const reports = buildPhaseTokenReport(phases, []);
    expect(reports).toHaveLength(3);
    expect(reports[0].sessionCount).toBe(0);
    expect(reports[0].outputTokens).toBe(0);
  });

  it('attributes sessions to the correct phase based on start time', () => {
    const sessions = [
      makeSession({ sessionId: 's1', startTime: new Date('2026-03-05') }),
      makeSession({ sessionId: 's2', startTime: new Date('2026-03-12') }),
      makeSession({ sessionId: 's3', startTime: new Date('2026-03-18') }),
    ];

    const reports = buildPhaseTokenReport(phases, sessions);

    // Phase 1: epoch → 2026-03-10, s1 (March 5) fits
    expect(reports[0].phaseId).toBe('1');
    expect(reports[0].sessionCount).toBe(1);

    // Phase 2: 2026-03-10 → 2026-03-15, s2 (March 12) fits
    expect(reports[1].phaseId).toBe('2');
    expect(reports[1].sessionCount).toBe(1);

    // Phase 3: 2026-03-15 → now, s3 (March 18) fits
    expect(reports[2].phaseId).toBe('3');
    expect(reports[2].sessionCount).toBe(1);
  });

  it('aggregates tokens including subagent tokens', () => {
    const sessions = [
      makeSession({
        sessionId: 's1',
        startTime: new Date('2026-03-05'),
        tokens: { input: 100, output: 200, cacheCreation: 50, cacheRead: 30, total: 380 },
        subagentTokens: { input: 10, output: 20, cacheCreation: 5, cacheRead: 3, total: 38 },
      }),
    ];

    const reports = buildPhaseTokenReport(phases, sessions);
    expect(reports[0].outputTokens).toBe(220); // 200 + 20
    expect(reports[0].cacheTokens).toBe(88); // 50 + 30 + 5 + 3
    expect(reports[0].totalTokens).toBe(418); // 380 + 38
  });

  it('handles phases with no completion dates', () => {
    const openPhases: RoadmapPhase[] = [
      {
        id: '1',
        title: 'Phase 1',
        status: 'next',
        goal: '',
        completedDate: null,
        tasks: [],
      },
    ];
    const sessions = [
      makeSession({ startTime: new Date('2026-03-10') }),
    ];
    const reports = buildPhaseTokenReport(openPhases, sessions);
    expect(reports).toHaveLength(1);
    expect(reports[0].sessionCount).toBe(1);
  });

  it('sorts phases numerically by id', () => {
    const unordered: RoadmapPhase[] = [
      { id: '3', title: 'Phase 3', status: 'planned', goal: '', completedDate: null, tasks: [] },
      { id: '1', title: 'Phase 1', status: 'complete', goal: '', completedDate: '2026-03-10', tasks: [] },
      { id: '2', title: 'Phase 2', status: 'complete', goal: '', completedDate: '2026-03-15', tasks: [] },
    ];
    const reports = buildPhaseTokenReport(unordered, []);
    expect(reports[0].phaseId).toBe('1');
    expect(reports[1].phaseId).toBe('2');
    expect(reports[2].phaseId).toBe('3');
  });
});
