// =============================================================================
// Phase Token Report — Cross-reference telemetry with roadmap phases
// =============================================================================

import type { RoadmapPhase } from '@/types';
import type { SessionTelemetry } from '@/types/telemetry';

/** Token report for a single phase */
export interface PhaseTokenReport {
  phaseId: string;
  phaseTitle: string;
  status: string;
  sessionCount: number;
  totalDurationMinutes: number;
  outputTokens: number;
  cacheTokens: number;
  totalTokens: number;
}

/**
 * Build a per-phase token report by cross-referencing session timestamps
 * with phase completion dates from the roadmap.
 *
 * Logic: Sessions are attributed to the phase that was active at their start time.
 * Phase date ranges are derived from consecutive completedDate values.
 */
export function buildPhaseTokenReport(
  phases: RoadmapPhase[],
  sessions: SessionTelemetry[],
): PhaseTokenReport[] {
  // Build date ranges: each phase runs from the previous phase's completedDate
  // to its own completedDate (or now, if incomplete)
  const sortedPhases = [...phases].sort((a, b) => {
    const aNum = parseInt(a.id, 10);
    const bNum = parseInt(b.id, 10);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return a.id.localeCompare(b.id);
  });

  const reports: PhaseTokenReport[] = [];

  for (let i = 0; i < sortedPhases.length; i++) {
    const phase = sortedPhases[i];

    // Start = previous phase's completed date, or epoch for first phase
    const prevDate = i > 0 ? sortedPhases[i - 1].completedDate : null;
    const rangeStart = prevDate ? new Date(prevDate) : new Date(0);

    // End = this phase's completed date, or now if in progress
    const rangeEnd = phase.completedDate
      ? new Date(phase.completedDate)
      : new Date();

    // Find sessions that started within this phase's date range
    const phaseSessions = sessions.filter((s) => {
      const start = s.startTime;
      return start >= rangeStart && start <= rangeEnd;
    });

    const outputTokens = phaseSessions.reduce(
      (sum, s) => sum + s.tokens.output + s.subagentTokens.output,
      0,
    );
    const cacheTokens = phaseSessions.reduce(
      (sum, s) =>
        sum +
        s.tokens.cacheCreation +
        s.tokens.cacheRead +
        s.subagentTokens.cacheCreation +
        s.subagentTokens.cacheRead,
      0,
    );
    const totalTokens = phaseSessions.reduce(
      (sum, s) => sum + s.tokens.total + s.subagentTokens.total,
      0,
    );
    const totalDuration = phaseSessions.reduce(
      (sum, s) => sum + s.durationMinutes,
      0,
    );

    reports.push({
      phaseId: phase.id,
      phaseTitle: phase.title,
      status: phase.status,
      sessionCount: phaseSessions.length,
      totalDurationMinutes: totalDuration,
      outputTokens,
      cacheTokens,
      totalTokens,
    });
  }

  return reports;
}
