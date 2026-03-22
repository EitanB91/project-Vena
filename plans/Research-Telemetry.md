# Research: Claude Code Local Telemetry

**Task:** 7.1 — Phase 7 (Sprint 2)
**Researcher:** Orchestrator + Silas
**Date:** 2026-03-21
**Verdict:** **YES — rich telemetry data exists locally and is readable in real-time.**

---

## Executive Summary

Claude Code writes detailed session data to `~/.claude/projects/` in plain JSONL format. Every assistant response includes full token usage breakdowns. Files are written in real-time during active sessions. Vena can build a telemetry reader using standard Node.js `fs` operations — no API, no database, no authentication needed.

---

## Data Sources Discovered

### 1. Session JSONL Files (PRIMARY SOURCE)

**Path:** `~/.claude/projects/{project-slug}/{session-uuid}.jsonl`

Each Claude Code session creates a JSONL file. One JSON object per line, each line is an event.

**Event types found:**
| Type | Description | Has usage data? |
|------|-------------|-----------------|
| `queue-operation` | Session start/end markers | No |
| `user` | User messages | No |
| `assistant` | Claude responses | **YES — full token breakdown** |
| `progress` | Hook/tool progress events | No |
| `file-history-snapshot` | File change tracking | No |
| `custom-title` | Session title (often "untitled") | No |
| `last-prompt` | Last user prompt text | No |

**Assistant event usage structure:**
```json
{
  "type": "assistant",
  "timestamp": "2026-03-20T13:39:07.852Z",
  "sessionId": "028a3bb8-3710-4cda-9c59-0468a8cc669a",
  "entrypoint": "claude-vscode",
  "version": "2.1.78",
  "cwd": "c:\\Users\\user\\Desktop\\Ai\\Claude\\project-Vena",
  "gitBranch": "master",
  "message": {
    "model": "claude-opus-4-6",
    "usage": {
      "input_tokens": 3,
      "output_tokens": 2,
      "cache_creation_input_tokens": 10301,
      "cache_read_input_tokens": 8662,
      "service_tier": "standard"
    }
  }
}
```

### 2. Subagent JSONL Files

**Path:** `~/.claude/projects/{project-slug}/{session-uuid}/subagents/agent-{id}.jsonl`

Same structure as parent sessions. Also contain `assistant` events with token usage. Must be included in totals.

### 3. Other Directories (less relevant)

| Directory | Contents | Useful for Vena? |
|-----------|----------|-------------------|
| `~/.claude/file-history/` | File versioning per session | Low — could show files changed |
| `~/.claude/session-env/` | Environment snapshots | Low |
| `~/.claude/shell-snapshots/` | Shell init scripts | No |
| `~/.claude/plans/` | Claude Code internal plans | No |
| `~/.claude/cache/` | Changelog cache | No |
| `~/.claude/debug/` | Debug logs | No |

---

## What Vena CAN Extract

| Data Point | Source | Complexity |
|------------|--------|------------|
| Session list per project | JSONL filenames in project dir | Easy |
| Session start/end timestamps | First/last event `timestamp` | Easy |
| Session duration | Computed from timestamps | Easy |
| Token usage per session | `assistant` event `message.usage` | Easy |
| Token usage per project | Sum across session + subagent files | Easy |
| Model used | `assistant` event `message.model` | Easy |
| Entry point (CLI/VSCode) | `assistant` event `entrypoint` | Easy |
| Subagent token usage | Subagent JSONL files | Easy |
| Message count per session | Count `user`/`assistant` events | Easy |
| Git branch | `assistant` event `gitBranch` | Easy |
| Claude Code version | `assistant` event `version` | Easy |
| Active session detection | File mtime is recent (< 5 min) | Easy |
| Session title | `custom-title` event, or first user message | Easy |
| Files changed per session | `file-history-snapshot` events | Medium |

## What Vena CANNOT Extract

| Data Point | Why | Workaround |
|------------|-----|------------|
| Dollar cost | Pro plan has no per-token pricing locally | Estimate using public API pricing as reference |
| Quota % (5hr/weekly) | Server-side only, not stored locally | Use session duration as proxy metric |
| Rate limit status | Server-side only | None |

---

## Project Vena — Telemetry Snapshot (2026-03-21)

| Metric | Value |
|--------|-------|
| JSONL files (sessions + subagents) | 33 |
| Main sessions | 13 |
| Input tokens | 259,656 |
| Output tokens | 797,313 |
| Cache creation tokens | 9,523,846 |
| Cache read tokens | 227,446,979 |
| **Total tokens** | **238,027,794** |
| Primary model | claude-opus-4-6 |
| Primary entrypoint | claude-vscode |

---

## Real-Time Capability

**Confirmed:** Session JSONL files are written in real-time. The current active session's file (`d1a37a50`) was observed growing during this research. Vena can detect active sessions by checking file `mtime` and read the latest token counts without waiting for session end.

---

## Project Slug Convention

Claude Code creates project directories using the working directory path with path separators replaced by dashes:
```
c:\Users\user\Desktop\Ai\Claude\project-Vena
→ c--Users-user-Desktop-Ai-Claude-project-Vena
```

This means Vena can locate its own project's telemetry by converting `process.cwd()` to this slug format.

---

## Recommended Architecture for Vena Telemetry Reader

```
src/lib/telemetry.ts
├── getProjectSlug(cwd: string): string
├── getSessionFiles(projectSlug: string): SessionFile[]
├── parseSessionTelemetry(filePath: string): SessionTelemetry
├── getProjectTelemetry(projectSlug?: string): ProjectTelemetry
└── isSessionActive(filePath: string, thresholdMs?: number): boolean
```

**Types needed:**
```typescript
interface SessionTelemetry {
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
  tokens: {
    input: number;
    output: number;
    cacheCreation: number;
    cacheRead: number;
    total: number;
  };
  messageCount: number;
  subagentCount: number;
  subagentTokens: TokenBreakdown;
}

interface ProjectTelemetry {
  projectSlug: string;
  sessions: SessionTelemetry[];
  totals: TokenBreakdown;
  activeSessionCount: number;
}
```

---

## Feasibility Matrix (for Gate Meeting)

| Question | Answer |
|----------|--------|
| Does local telemetry exist? | **YES** |
| Can Vena read it automatically? | **YES** — plain JSONL, standard fs |
| Is it real-time? | **YES** — files written during active sessions |
| Can we detect active sessions? | **YES** — file mtime check |
| Can we compute token usage? | **YES** — per-message, per-session, per-project |
| Can we get dollar cost? | **PARTIAL** — estimate only, no local pricing data |
| Can we get quota %? | **NO** — server-side only |
| Session logger hook still needed? | **NO** — telemetry reader replaces its purpose entirely |

---

## Impact on Sprint 2 Roadmap

1. **Phase 8.2 (Telemetry Reader):** FULL GO — build `src/lib/telemetry.ts` as described above
2. **Phase 8.3 (Session Logger Fix):** **DEPRIORITIZED** — the session logger hook was a workaround for missing telemetry. With real telemetry data available, the hook becomes redundant for session tracking. May still be useful for custom V&V logging.
3. **Budget page:** Can show real token usage instead of stale manual data
4. **Sessions page:** Can show real session list with actual timestamps and token counts
5. **Dashboard:** Active session count from live file mtime detection
6. **Agent status:** Can detect active agents from active sessions (entrypoint + cwd)
