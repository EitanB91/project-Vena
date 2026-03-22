// =============================================================================
// Telemetry Reader — Claude Code Session Data
// Security: S1 path confinement, S2 extension whitelist, S3 no credentials,
//           S5 server-only, S6 safe errors
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';

import type {
  RawSessionEvent,
  TokenBreakdown,
  SessionTelemetry,
  ProjectTelemetry,
  DailyUsage,
} from '@/types/telemetry';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** Base directory for Claude Code project telemetry */
const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects');

/** Session is considered active if modified within this window */
const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/** UUID pattern for session JSONL files */
const UUID_JSONL_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jsonl$/;

/** Line count threshold for streaming reads */
const STREAMING_THRESHOLD = 500;

// -----------------------------------------------------------------------------
// Security Helpers
// -----------------------------------------------------------------------------

/**
 * S1: Validate that a resolved path is confined within the allowed base directory.
 * Returns the resolved path if valid, null if path traversal detected.
 */
function confineToBase(targetPath: string, baseDir: string): string | null {
  const resolved = path.resolve(targetPath);
  const normalizedBase = path.resolve(baseDir);
  if (!resolved.startsWith(normalizedBase + path.sep) && resolved !== normalizedBase) {
    return null;
  }
  return resolved;
}

/**
 * S4: Validate a project slug — alphanumeric, hyphens, and underscores only.
 */
function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(slug) && slug.length > 0 && slug.length < 256;
}

/**
 * Runtime type guard for parsed JSONL lines.
 * Validates that the value is a non-null object with a string `type` field.
 */
function isSessionEvent(value: unknown): value is RawSessionEvent {
  return typeof value === 'object' && value !== null && typeof (value as Record<string, unknown>).type === 'string';
}

// -----------------------------------------------------------------------------
// Token Helpers
// -----------------------------------------------------------------------------

function emptyTokenBreakdown(): TokenBreakdown {
  return { input: 0, output: 0, cacheCreation: 0, cacheRead: 0, total: 0 };
}

function addTokens(target: TokenBreakdown, usage: { input_tokens?: number; output_tokens?: number; cache_creation_input_tokens?: number; cache_read_input_tokens?: number }): void {
  target.input += usage.input_tokens ?? 0;
  target.output += usage.output_tokens ?? 0;
  target.cacheCreation += usage.cache_creation_input_tokens ?? 0;
  target.cacheRead += usage.cache_read_input_tokens ?? 0;
  target.total = target.input + target.output + target.cacheCreation + target.cacheRead;
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Convert a working directory path to Claude Code's project slug format.
 * Example: "c:\Users\user\Desktop\project" → "c--Users-user-Desktop-project"
 */
export function getProjectSlug(cwd: string): string {
  let normalized = path.resolve(cwd);
  // On Windows, path.resolve() uppercases drive letter (C:\) but
  // Claude Code uses lowercase (c--). Lowercase the drive letter.
  if (/^[A-Z]:/.test(normalized)) {
    normalized = normalized[0].toLowerCase() + normalized.slice(1);
  }
  // Claude Code replaces path separators and colons with hyphens but
  // preserves consecutive hyphens (e.g. "c:\" → "c--")
  return normalized
    .replace(/\\/g, '-')   // backslashes → hyphens
    .replace(/\//g, '-')   // forward slashes → hyphens
    .replace(/:/g, '-');   // colons → hyphens
}

/**
 * List all session JSONL file paths for a project.
 * S1: Path confinement, S2: Extension whitelist (.jsonl only).
 */
export function getSessionFiles(projectSlug: string): string[] {
  if (!isValidSlug(projectSlug)) return [];

  const projectDir = path.join(CLAUDE_PROJECTS_DIR, projectSlug);
  const confined = confineToBase(projectDir, CLAUDE_PROJECTS_DIR);
  if (!confined) return [];

  try {
    const entries = fs.readdirSync(confined);
    return entries
      .filter((entry) => UUID_JSONL_PATTERN.test(entry))
      .map((entry) => path.join(confined, entry));
  } catch {
    return [];
  }
}

/**
 * Parse a single session JSONL file into structured telemetry.
 * C3: Race condition handling — malformed lines are skipped.
 * C4: Streaming readline for large files.
 */
export async function parseSessionTelemetry(
  filePath: string,
  now?: number,
): Promise<SessionTelemetry | null> {
  // S1: Validate path confinement
  const confined = confineToBase(filePath, CLAUDE_PROJECTS_DIR);
  if (!confined) return null;

  // S2: Extension whitelist
  if (!confined.endsWith('.jsonl')) return null;

  try {
    const stat = fs.statSync(confined);
    const lineCount = estimateLineCount(confined, stat.size);
    const events = lineCount > STREAMING_THRESHOLD
      ? await readLinesStreaming(confined)
      : readLinesSync(confined);

    if (events.length === 0) return null;

    // Extract data from events
    const tokens = emptyTokenBreakdown();
    let title: string | null = null;
    let model = '';
    let entrypoint = '';
    let version = '';
    let gitBranch = '';
    let startTime: Date | null = null;
    let endTime: Date | null = null;
    let messageCount = 0;
    let toolCallCount = 0;

    for (const event of events) {
      // Track timestamps for start/end
      if (event.timestamp) {
        const ts = new Date(event.timestamp);
        if (!startTime || ts < startTime) startTime = ts;
        if (!endTime || ts > endTime) endTime = ts;
      }

      if (event.type === 'assistant' && event.message?.usage) {
        addTokens(tokens, event.message.usage);
        messageCount++;

        // Capture metadata from first assistant event
        if (!model && event.message.model) model = event.message.model;
        if (!entrypoint && event.entrypoint) entrypoint = event.entrypoint;
        if (!version && event.version) version = event.version;
        if (!gitBranch && event.gitBranch) gitBranch = event.gitBranch;
      }

      if (event.type === 'progress') {
        toolCallCount++;
      }

      if (event.type === 'custom-title' && event.customTitle) {
        title = event.customTitle;
      }
    }

    if (!startTime) return null;
    if (!endTime) endTime = startTime;

    const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60_000;
    const isActive = isSessionActive(confined, now);

    // Parse subagent data
    const sessionUuid = path.basename(confined, '.jsonl');
    const subagentDir = path.join(path.dirname(confined), sessionUuid, 'subagents');
    const { count: subagentCount, tokens: subagentTokens } = await parseSubagents(subagentDir);

    const sessionId = events.find((e) => e.sessionId)?.sessionId ?? sessionUuid;

    return {
      sessionId,
      title,
      startTime,
      endTime,
      durationMinutes,
      model,
      entrypoint,
      version,
      gitBranch,
      isActive,
      tokens,
      messageCount,
      toolCallCount,
      subagentCount,
      subagentTokens,
    };
  } catch {
    // S6: No paths in error output
    return null;
  }
}

/**
 * Check if a session file is currently active based on mtime.
 */
export function isSessionActive(filePath: string, now?: number, thresholdMs?: number): boolean {
  try {
    const stat = fs.statSync(filePath);
    return ((now ?? Date.now()) - stat.mtimeMs) < (thresholdMs ?? ACTIVE_THRESHOLD_MS);
  } catch {
    return false;
  }
}

/**
 * Aggregate telemetry across all sessions for a project.
 */
export async function getProjectTelemetry(projectSlug?: string): Promise<ProjectTelemetry> {
  const slug = projectSlug ?? getProjectSlug(process.cwd());
  const files = getSessionFiles(slug);
  const now = Date.now();

  const sessions: SessionTelemetry[] = [];
  for (const file of files) {
    const session = await parseSessionTelemetry(file, now);
    if (session) sessions.push(session);
  }

  // Sort by start time (newest first)
  sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  // Aggregate totals
  const totals = emptyTokenBreakdown();
  let activeSessionCount = 0;

  for (const session of sessions) {
    totals.input += session.tokens.input + session.subagentTokens.input;
    totals.output += session.tokens.output + session.subagentTokens.output;
    totals.cacheCreation += session.tokens.cacheCreation + session.subagentTokens.cacheCreation;
    totals.cacheRead += session.tokens.cacheRead + session.subagentTokens.cacheRead;
    if (session.isActive) activeSessionCount++;
  }
  totals.total = totals.input + totals.output + totals.cacheCreation + totals.cacheRead;

  // Build daily usage
  const dailyUsage = buildDailyUsage(sessions);

  return {
    projectSlug: slug,
    sessions,
    totals,
    activeSessionCount,
    dailyUsage,
  };
}

// -----------------------------------------------------------------------------
// Internal Helpers
// -----------------------------------------------------------------------------

/** Estimate line count from file size (avg ~200 bytes/line for JSONL) */
function estimateLineCount(filePath: string, fileSize: number): number {
  if (fileSize < 100_000) return Math.ceil(fileSize / 200);
  // For larger files, count newlines in first 10KB to estimate
  try {
    const buf = Buffer.alloc(10_240);
    const fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, buf, 0, 10_240, 0);
    fs.closeSync(fd);
    let newlines = 0;
    for (let i = 0; i < bytesRead; i++) {
      if (buf[i] === 0x0A) newlines++;
    }
    if (newlines === 0) return 1;
    const avgLineLength = bytesRead / newlines;
    return Math.ceil(fileSize / avgLineLength);
  } catch {
    return Math.ceil(fileSize / 200);
  }
}

/** Read and parse JSONL lines synchronously (for small files) */
function readLinesSync(filePath: string): RawSessionEvent[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const events: RawSessionEvent[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (isSessionEvent(parsed)) events.push(parsed);
    } catch {
      // C3: Skip malformed lines
    }
  }
  return events;
}

/** Read and parse JSONL lines via streaming readline (for large files) */
async function readLinesStreaming(filePath: string): Promise<RawSessionEvent[]> {
  return new Promise((resolve) => {
    const events: RawSessionEvent[] = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: 'utf-8' }),
      crlfDelay: Infinity,
    });
    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (isSessionEvent(parsed)) events.push(parsed);
      } catch {
        // C3: Skip malformed lines
      }
    });
    rl.on('close', () => resolve(events));
    rl.on('error', () => resolve(events));
  });
}

/** Parse all subagent JSONL files for a session */
async function parseSubagents(
  subagentDir: string,
): Promise<{ count: number; tokens: TokenBreakdown }> {
  const tokens = emptyTokenBreakdown();
  let count = 0;

  // S1: Validate confinement
  const confined = confineToBase(subagentDir, CLAUDE_PROJECTS_DIR);
  if (!confined) return { count, tokens };

  try {
    if (!fs.existsSync(confined)) return { count, tokens };
    const entries = fs.readdirSync(confined);

    for (const entry of entries) {
      // S2: Only .jsonl files
      if (!entry.endsWith('.jsonl')) continue;

      const agentFile = path.join(confined, entry);
      const agentConfined = confineToBase(agentFile, CLAUDE_PROJECTS_DIR);
      if (!agentConfined) continue;

      try {
        const content = fs.readFileSync(agentConfined, 'utf-8');
        let hasAssistantEvent = false;
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed: unknown = JSON.parse(trimmed);
            if (isSessionEvent(parsed) && parsed.type === 'assistant' && parsed.message?.usage) {
              addTokens(tokens, parsed.message.usage);
              hasAssistantEvent = true;
            }
          } catch {
            // C3: Skip malformed lines
          }
        }
        if (hasAssistantEvent) count++;
      } catch {
        // Skip unreadable subagent files
      }
    }
  } catch {
    // Directory doesn't exist or not readable
  }

  return { count, tokens };
}

/** Group sessions by date and aggregate daily usage */
function buildDailyUsage(sessions: SessionTelemetry[]): DailyUsage[] {
  const byDate = new Map<string, DailyUsage>();

  for (const session of sessions) {
    const dateKey = session.startTime.toISOString().slice(0, 10); // YYYY-MM-DD

    let daily = byDate.get(dateKey);
    if (!daily) {
      daily = {
        date: dateKey,
        sessions: 0,
        durationMinutes: 0,
        tokens: emptyTokenBreakdown(),
        messages: 0,
      };
      byDate.set(dateKey, daily);
    }

    daily.sessions++;
    daily.durationMinutes += session.durationMinutes;
    daily.messages += session.messageCount;

    // Include subagent tokens in daily totals
    daily.tokens.input += session.tokens.input + session.subagentTokens.input;
    daily.tokens.output += session.tokens.output + session.subagentTokens.output;
    daily.tokens.cacheCreation += session.tokens.cacheCreation + session.subagentTokens.cacheCreation;
    daily.tokens.cacheRead += session.tokens.cacheRead + session.subagentTokens.cacheRead;
    daily.tokens.total = daily.tokens.input + daily.tokens.output + daily.tokens.cacheCreation + daily.tokens.cacheRead;
  }

  // Sort by date ascending
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}
