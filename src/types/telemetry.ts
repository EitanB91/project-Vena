// =============================================================================
// Telemetry Types — Claude Code Session Data
// =============================================================================

// -----------------------------------------------------------------------------
// Raw JSONL Event Types (as written by Claude Code)
// -----------------------------------------------------------------------------

/** Token usage breakdown from an assistant event */
export interface RawTokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  service_tier?: string;
  inference_geo?: string;
}

/** An assistant event's message payload */
export interface RawAssistantMessage {
  model: string;
  usage: RawTokenUsage;
}

/** A single line/event from a session JSONL file */
export interface RawSessionEvent {
  type: 'queue-operation' | 'user' | 'assistant' | 'progress' | 'file-history-snapshot' | 'custom-title' | 'last-prompt';
  timestamp?: string;
  sessionId?: string;
  entrypoint?: string;
  version?: string;
  cwd?: string;
  gitBranch?: string;
  message?: RawAssistantMessage;
  customTitle?: string;
}

// -----------------------------------------------------------------------------
// Processed Telemetry Types
// -----------------------------------------------------------------------------

/** Aggregated token counts across messages */
export interface TokenBreakdown {
  input: number;
  output: number;
  cacheCreation: number;
  cacheRead: number;
  total: number;
}

/** Processed data for a single session */
export interface SessionTelemetry {
  sessionId: string;
  title: string | null;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  model: string;
  entrypoint: string;
  version: string;
  gitBranch: string;
  isActive: boolean;
  tokens: TokenBreakdown;
  messageCount: number;
  toolCallCount: number;
  subagentCount: number;
  subagentTokens: TokenBreakdown;
}

/** Daily usage aggregation */
export interface DailyUsage {
  date: string;
  sessions: number;
  durationMinutes: number;
  tokens: TokenBreakdown;
  messages: number;
  toolCalls: number;
}

/** Aggregated telemetry for an entire project */
export interface ProjectTelemetry {
  projectSlug: string;
  sessions: SessionTelemetry[];
  totals: TokenBreakdown;
  activeSessionCount: number;
  dailyUsage: DailyUsage[];
}
