// =============================================================================
// Project Vena — Data Model Types
// Phase 2: File Readers & Data Layer
// =============================================================================

// -----------------------------------------------------------------------------
// Project Scanner
// -----------------------------------------------------------------------------

/** A discovered .claude/ project directory */
export interface VenaProject {
  /** Absolute path to the project root (parent of .claude/) */
  path: string;
  /** Project name derived from directory name */
  name: string;
  /** Absolute path to the .claude/ directory */
  claudeDir: string;
  /** Whether a CLAUDE.md file exists at project root */
  hasClaudeMd: boolean;
  /** Discovered agent directories within .claude/ */
  agentDirs: string[];
}

// -----------------------------------------------------------------------------
// Agents
// -----------------------------------------------------------------------------

/** Parsed agent identity from a markdown file */
export interface AgentIdentity {
  /** Agent display name (e.g. "Nova", "Viktor") */
  name: string;
  /** Agent role/title (e.g. "Visual Design Lead") */
  role: string;
  /** Path to the identity file */
  filePath: string;
  /** Raw markdown content */
  rawContent: string;
  /** Extracted sections (heading → content) */
  sections: Record<string, string>;
  /** Active projects listed in the Scope table */
  projects: AgentProject[];
  /** Key phrases extracted from identity */
  keyPhrases: string[];
}

/** A project listed in an agent's Scope table */
export interface AgentProject {
  name: string;
  role: string;
}

/** Parsed agent memory from a markdown file */
export interface AgentMemory {
  /** Agent name this memory belongs to */
  agentName: string;
  /** Path to the memory file */
  filePath: string;
  /** Raw markdown content */
  rawContent: string;
  /** Extracted sections (heading → content) */
  sections: Record<string, string>;
  /** Last modified timestamp of the file */
  lastModified: Date;
}

/** Agent status indicator */
export interface AgentStatus {
  label: string;
  color: string;
  dotClass: string;
}

/** Combined agent profile (identity + memory + computed status) */
export interface AgentProfile {
  identity: AgentIdentity;
  memory: AgentMemory | null;
  /** Agent color token from design system */
  colorToken: string;
  /** Pre-computed status from memory lastModified */
  status: AgentStatus;
  /** Pre-computed relative time string */
  lastSeen: string;
}

// -----------------------------------------------------------------------------
// Budget (V&V)
// -----------------------------------------------------------------------------

/** The full budget ledger structure */
export interface BudgetLedger {
  apis: Record<string, ApiBudget>;
  claudeCode: ClaudeCodeUsage;
  alertThresholds: AlertThresholds;
  authority: BudgetAuthority;
}

/** Budget for a single API service */
export interface ApiBudget {
  name: string;
  remainingBalance: number;
  usableBudgetMonthly: number;
  floor: number;
  currency: string;
  alertLevel: AlertLevel;
  lastUpdated: string;
  notes: string;
}

/** Claude Code plan usage */
export interface ClaudeCodeUsage {
  plan: string;
  sessionUsagePercent: number;
  sessionResetsAt: string;
  weeklyUsagePercent: number;
  weeklyResetsAt: string;
  dailySoftLimit: number | null;
  weeklySoftLimit: number | null;
  lastUpdated: string;
  notes: string;
}

/** Alert threshold configuration */
export interface AlertThresholds {
  warnAtPercent: number;
  criticalAtPercent: number;
  lockedAt: string;
}

/** Authority rules at floor */
export interface BudgetAuthority {
  atFloor: string;
  note: string;
}

export type AlertLevel = 'normal' | 'warn' | 'critical' | 'locked';

/** Computed budget summary for display */
export interface BudgetSummary {
  /** Primary API remaining balance */
  remainingBalance: number;
  /** Usable budget (remaining - floor) */
  usableBudget: number;
  /** Floor (untouchable) */
  floor: number;
  /** Current alert level */
  alertLevel: AlertLevel;
  /** Percentage of usable budget remaining */
  usablePercent: number;
  /** Currency code */
  currency: string;
  /** Claude Code plan info */
  claudeCode: ClaudeCodeUsage;
}

// -----------------------------------------------------------------------------
// Usage Log / Sessions
// -----------------------------------------------------------------------------

export type UsageEventType = 'SessionStart' | 'SessionEnd' | 'SessionSummary';

/** Base fields for all usage log events */
interface UsageEventBase {
  ts: string;
  event: UsageEventType;
  session: string;
  source: string;
}

/** Session start event */
export interface SessionStartEvent extends UsageEventBase {
  event: 'SessionStart';
}

/** Session end event */
export interface SessionEndEvent extends UsageEventBase {
  event: 'SessionEnd';
}

/** Session summary event (logged by Orchestrator) */
export interface SessionSummaryEvent extends UsageEventBase {
  event: 'SessionSummary';
  phase?: string;
  actors?: string[];
  categories?: string[];
  apiCostUsd?: number;
  summary?: string;
}

export type UsageEvent = SessionStartEvent | SessionEndEvent | SessionSummaryEvent;

/** A computed session with start/end paired */
export interface Session {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  source: string;
  /** Associated summary event, if any */
  summary: SessionSummaryEvent | null;
}

/** Session timeline for display */
export interface SessionTimeline {
  sessions: Session[];
  totalSessions: number;
  totalMinutes: number;
  /** Sessions grouped by date (YYYY-MM-DD → sessions) */
  byDate: Record<string, Session[]>;
}

// -----------------------------------------------------------------------------
// Roadmap
// -----------------------------------------------------------------------------

export type PhaseStatus = 'complete' | 'next' | 'planned' | 'in_progress';

/** A parsed roadmap phase */
export interface RoadmapPhase {
  id: string;
  title: string;
  status: PhaseStatus;
  goal: string;
  completedDate: string | null;
  tasks: RoadmapTask[];
}

/** A single task within a phase */
export interface RoadmapTask {
  text: string;
  completed: boolean;
}

/** The full parsed roadmap */
export interface Roadmap {
  title: string;
  vision: string;
  phases: RoadmapPhase[];
  featureRegistry: FeatureEntry[];
}

/** A row in the Feature Registry table */
export interface FeatureEntry {
  feature: string;
  phase: string;
  priority: string;
  status: string;
}
