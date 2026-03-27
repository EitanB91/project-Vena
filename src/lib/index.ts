// =============================================================================
// Data Layer — Barrel Export
// =============================================================================

export { scanProject, scanProjects } from './scanner';
export { readAgentIdentity, readAgentMemory, readAllAgents } from './agents';
export {
  readBudgetLedger,
  computeBudgetSummary,
  readUsageLog,
  parseUsageLog,
} from './budget';
export { readRoadmap, parseRoadmap, readProjectRoadmap, readPlanFiles } from './roadmap';
export type { PlanFile } from './roadmap';
export { buildSessionTimeline, readSessionTimeline, getSessionEnrichment } from './sessions';
export type { SessionEnrichment } from './sessions';
export { slugify } from './slugify';
export {
  ACTIVE_THRESHOLD_MINUTES,
  RECENT_THRESHOLD_MINUTES,
  getAgentStatus,
  formatLastSeen,
  enhanceAgentProfiles,
} from './agent-status';
export type { AgentStatus } from './agent-status';
export {
  formatTokens,
  formatDuration,
  formatRelativeTime,
  formatDate,
  formatDateShort,
} from './format';
export {
  getProjectSlug,
  getSessionFiles,
  parseSessionTelemetry,
  isSessionActive,
  getProjectTelemetry,
} from './telemetry';
export { buildPhaseTokenReport } from './phase-tokens';
export type { PhaseTokenReport } from './phase-tokens';
export { syncTelemetryToVV } from './vv-sync';
export type { VVSyncResult } from './vv-sync';
