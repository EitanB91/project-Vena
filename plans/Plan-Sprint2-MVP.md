# Plan: Sprint 2 — MVP

**Sprint:** 2 (Phases 7–10)
**Type:** MVP — fix fundamental issues, prove vision is viable
**Status:** In Progress (Phase 8 active)
**Team:** Director (Eitan), Orchestrator (Claude), Nova, Viktor, Silas Sterling
**Created:** 2026-03-21
**Revised:** 2026-03-22 — expanded scope after telemetry research findings + full team feature discussion

---

## Why Sprint 2 Exists

Vena v1.0 (Sprint 1, Phases 0–6) was tested by the Director on 2026-03-21. **Verdict: FAIL.**

The UX/UI and design are spot on, but data doesn't update in real time. Agent statuses are stale, sessions stop logging after 2026-03-18, budget numbers don't reflect reality. The Director declared v1.0 won't release publicly. Sprint 2 is an MVP sprint — fix the data pipeline and prove the vision is viable.

**Director's core concern:** "If we won't find solutions the project's future is dire."

**Resolution (2026-03-22):** Telemetry research (Task 7.1) confirmed rich local data exists. Claude Code writes full token usage, session data, and model info to `~/.claude/projects/` in real-time JSONL files. The vision is viable. Full findings: `plans/Research-Telemetry.md`.

---

## Sprint 2 Overview

| Field | Value |
|-------|-------|
| **Goal** | Make Vena's data live — real-time telemetry, token tracking, session history, interactive charts |
| **Phases** | 7 (Research & Fixes) → 8 (Live Telemetry Pipeline) → 9 (Chat, History & UX) → 10 (QA & Release) |
| **Top Priority** | ~~Research Claude Code local telemetry~~ **DONE** — telemetry exists and is readable |
| **Key Decision** | Keep CLI terminal + add chatbox UI alongside it (split view). Add session history viewer |
| **Critical Gate** | ~~Full team meeting after Phase 7 research~~ Held informally 2026-03-22 — scope expanded |
| **Security Mandate** | "Security above all" — Director standing order. All `~/.claude/` access hardened per Viktor's 6-point checklist |
| **Target Version** | v0.2.0-mvp |

---

## Sprint 2 Feature Registry

All features approved for Sprint 2, with origin and phase assignment.

| # | Feature | Proposed By | Phase | Description |
|---|---------|-------------|-------|-------------|
| F1 | Live Session Pulse Card | Nova | 8 | Dashboard card showing active session with real-time duration, token count, breathing pulse |
| F2 | Token Breakdown Stacked Chart | Nova | 8 | Input vs output vs cache per session — stacked bar visualization |
| F3 | Session Timeline Bars | Nova | 8 | Horizontal duration bars color-coded by model replacing session list |
| F4 | Model Usage Chart | Nova + Director | 8 | Donut chart showing % of sessions by model |
| F6 | Phase-by-Phase Token Report | Silas | 8 | Map sessions to phases via roadmap dates, show token usage per phase |
| F7 | Daily/Weekly Burn Rate | Silas | 8 | Output tokens per day/week over time, trend line |
| F8 | Session Duration Quota Proxy | Silas | 8 | Cumulative session time per day/week — soft gauge for Pro plan limits |
| F9 | Automated V&V Log Entries | Silas | 8 | Telemetry reader generates usage-log entries when sessions end (stale mtime) |
| F10 | Chat History Viewer | Director | 9 | Read-only past session viewer — scrollable message list from JSONL |
| F13 | Per-Session Token Display | Director | 8 | Show input/output tokens per session. Per-message display tied to F10 |
| F14 | Model Tag on Sessions | Director | 8 | Show which model was used per session |
| F17 | Usage Over Time Graph | Director | 8 | Time-series graph switchable by: messages, sessions, or tool calls |
| F19 | Smart Token Formatting | Nova | 8 | Display "238M" not "238,027,794" — human-readable large numbers |
| F20 | Budget Page Dual Panel | Silas | 8 | Separate "Pro Plan Usage (telemetry)" panel from "API Budget (V&V ledger)" panel |

---

## Concern Resolution Map

Every concern raised during the team discussion, with resolution phase.

| # | Concern | Raised By | Resolved In | How |
|---|---------|-----------|-------------|-----|
| C1 | Subagent double-counting | Silas + Viktor | Phase 7 | Verify parent JSONL doesn't include subagent tokens before building reader |
| C2 | Cache tokens misleading totals | Nova | Phase 8 | F19 smart formatting + visual separation in charts (output vs cache distinct) |
| C3 | File race conditions | Viktor | Phase 8 | try/catch every JSON.parse(), skip malformed last lines |
| C4 | Large file performance | Viktor | Phase 8 | Streaming readline for large files, async reads, no blocking |
| C5 | Session categorization lost | Viktor | Phase 8 | Keep hook for categories. Telemetry reader handles session/token data |
| C6 | Token numbers need context | Silas | Phase 8 | F6 phase report provides baselines. Show averages and deltas |
| C7 | Security: ~/.claude/ access | Viktor | Phase 8 | Viktor's 6-point checklist — all findings block. See Security section |
| C8 | Future online security | Director | Future | Full security audit before any network exposure. Separate initiative |
| C9 | Remote session feasibility | Director | Future | Research needed — check if Claude Code exposes IPC/socket for control |

---

## Prerequisites (before Phase 7 starts)

| # | Task | Owner | Done? |
|---|------|-------|-------|
| P.1 | Update `Roadmap-Project-Vena.md` — Phase 6 → `status="complete"` with date `2026-03-21` | Orchestrator | [x] |
| P.2 | Add Phase 7–10 stubs to roadmap with `status="planned"` | Orchestrator | [x] |
| P.3 | Update `plans/INDEX.md` to include this file | Orchestrator | [x] |
| P.4 | Confirm all team memory files are current | All | [x] |
| P.5 | Run `npm run build` and `npm test` — confirm green baseline | Orchestrator | [x] |
| P.6 | Git commit: `chore: Sprint 2 kickoff — update roadmap, add plans and docs` | Orchestrator | [x] `48ed29a` |

---

## Phase 7 — Research & Foundation Fixes

> *"Can we build what we envision?"*

**Goal:** Answer the existential questions before building features on shaky ground.
**Duration:** 1–2 sessions
**Status:** **COMPLETE** (2026-03-22)
**Primary Owner:** Orchestrator
**Supporting:** Viktor (lint verification), Silas (telemetry research)

### Task Breakdown

#### 7.1 — Research: Claude Code Local Telemetry (COMPLETE)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Silas |
| **Priority** | P0 — DONE |
| **Status** | **COMPLETE** |
| **Deliverable** | `plans/Research-Telemetry.md` |

**Findings summary:**
- Session JSONL files in `~/.claude/projects/{slug}/{uuid}.jsonl`
- Every assistant event includes: `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`
- Also: model, entrypoint, version, cwd, gitBranch, timestamp, sessionId
- Subagent data in `{uuid}/subagents/agent-{id}.jsonl`
- Files written in real-time during active sessions
- Active session detectable via file mtime

**Verdict:** Full telemetry available. Best-case scenario confirmed.

---

#### 7.2 — Research: Data Refresh Patterns for Next.js

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Priority** | P0 |
| **Dependencies** | None |
| **Deliverable** | Section in `plans/Research-Telemetry.md` or separate doc |

Investigate live data patterns for Next.js App Router:
- [ ] Route Handler API endpoints (`src/app/api/`) returning JSON for client polling
- [ ] `useSWR` or plain `fetch` with refresh intervals
- [ ] Client-side `setInterval` polling with `"use client"` wrappers
- [ ] Page Visibility API — don't poll when tab is hidden
- [ ] Decide on primary pattern for Sprint 2

---

#### 7.3 — Research: Session Logger Hook Diagnosis

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Priority** | P1 (deprioritized — telemetry reader replaces core purpose) |
| **Dependencies** | None |
| **Note** | Hook still useful for V&V *category* logging (C5). Diagnose but don't block on fix |

- [ ] Verify `.claude/settings.local.json` hooks config
- [ ] Test hook manually
- [ ] Check Windows compatibility
- [ ] Document root cause — fix deferred to Phase 8 if needed

---

#### 7.4 — Fix: All 5 Lint Errors

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Priority** | P0 |
| **Files** | `src/app/page.tsx`, `src/app/agents/page.tsx`, `src/components/Sidebar.tsx`, `src/components/Terminal.tsx` |

**7.4a — `Date.now()` purity violations (3 errors):**
- Fix: Compute `const now = Date.now()` once, pass to status logic. Or move to data layer (see 7.5).

**7.4b — `setState` in effect (1 error):**
- Fix: Replace `useEffect` + `setMobileOpen(false)` with ref-based approach or `startTransition`.

**7.4c — Unused variable (1 warning):**
- Fix: Remove `status` state variable from `Terminal.tsx`.

**Smoke check:** `npm run lint` → 0 errors, 0 warnings. `npm run build` → clean. `npm test` → all pass.

---

#### 7.5 — Fix: Agent Status Data Layer Refactor

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Priority** | P0 |
| **Dependencies** | 7.4a (lint fix establishes the pattern) |
| **Files** | `src/lib/agent-status.ts`, `src/lib/agents.ts`, `src/types/index.ts`, page components |

- [ ] Add `status: AgentStatus` field to `AgentProfile` type
- [ ] Update `readAllAgents()` — compute status with single `Date.now()` at function entry
- [ ] Remove all inline `Date.now()` from page components
- [ ] Update AgentCard to use pre-computed status
- [ ] Update tests

**Smoke check:** Playwright screenshot — active agents green, idle agents gray.

---

#### 7.6 — Verify: Subagent Double-Counting (C1)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Priority** | P0 — BLOCKING for Phase 8 telemetry reader |
| **Dependencies** | 7.1 (research complete) |

- [ ] Compare token totals: parent JSONL alone vs parent + subagent JSONLs
- [ ] Determine if parent assistant events already include subagent token spend
- [ ] Document finding — informs telemetry reader architecture
- [ ] Add to `plans/Research-Telemetry.md`

---

### Phase 7 — QA Checkpoint

| Step | Check | Blocking? |
|------|-------|-----------|
| Lint | `npm run lint` → 0 errors, 0 warnings | Yes |
| Build | `npm run build` → clean | Yes |
| Tests | `npm test` → all pass | Yes |
| Agent status | Active agents show correct colors | Yes |
| Security | No new attack surface introduced | Yes |
| Research | Telemetry + refresh pattern research complete | Yes |
| Double-count | C1 verified — no double-counting | Yes |

**Viktor QA:** Full 9-step pipeline.

### Phase 7 — Git Commits

1. `docs: add telemetry and data refresh research documents`
2. `fix: resolve all 5 lint errors (Date.now purity, setState in effect, unused var)`
3. `refactor: move agent status computation to data layer`

---

## Phase 8 — Live Telemetry Pipeline

> *"Make Vena breathe."*

**Goal:** Real-time telemetry data, interactive charts, live session monitoring, budget rework.
**Duration:** 3–4 sessions
**Primary Owner:** Orchestrator
**Supporting:** Nova (charts, visual design), Silas (budget panel, burn rate), Viktor (security + QA)

**Features delivered:** F1, F2, F3, F4, F6, F7, F8, F9, F13, F14, F17, F19, F20

### Task Breakdown

#### 8.1 — Build: Telemetry Reader Core

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | 7.1 research, 7.6 double-count verification |
| **Files (create)** | `src/lib/telemetry.ts`, `src/types/telemetry.ts` |
| **Resolves** | C1 (architecture), C3 (race conditions), C4 (performance), C5 (categorization note) |

The foundation. Every telemetry feature depends on this.

- [x] `getProjectSlug(cwd: string): string` — convert path to Claude Code slug format
- [x] `getSessionFiles(projectSlug: string): string[]` — list session JSONLs
- [x] `parseSessionTelemetry(filePath: string): SessionTelemetry` — extract all data from one session
- [x] `getProjectTelemetry(projectSlug?: string): ProjectTelemetry` — aggregate across all sessions
- [x] `isSessionActive(filePath: string, thresholdMs?: number): boolean` — mtime check
- [x] Path confinement: all reads validated to stay under `~/.claude/projects/` (C7/S1)
- [x] File extension whitelist: only `.jsonl` files (C7/S2)
- [x] Race condition handling: try/catch per JSON.parse, skip malformed lines (C3)
- [x] Streaming readline for files > 500 lines (C4)
- [x] Handle subagent files (based on C1 findings — sum parent + subagent tokens)
- [x] Vitest tests with fixture JSONL data (N2)

**Types:**
```typescript
interface TokenBreakdown {
  input: number;
  output: number;
  cacheCreation: number;
  cacheRead: number;
  total: number;
}

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
  tokens: TokenBreakdown;
  messageCount: number;
  subagentCount: number;
  subagentTokens: TokenBreakdown;
}

interface ProjectTelemetry {
  projectSlug: string;
  sessions: SessionTelemetry[];
  totals: TokenBreakdown;
  activeSessionCount: number;
  dailyUsage: DailyUsage[];
}
```

**Smoke check:** `node -e "require('./src/lib/telemetry.ts')"` returns valid data. Vitest passes.

---

#### 8.2 — Build: API Route Endpoints (Security Hardened)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | 8.1 (telemetry reader), 7.5 (agent status in data layer) |
| **Files (create)** | `src/app/api/telemetry/route.ts`, `src/app/api/agents/route.ts`, `src/app/api/budget/route.ts`, `src/app/api/sessions/route.ts`, `src/app/api/dashboard/route.ts` |
| **Resolves** | C7 (security — Viktor's 6-point checklist applied here) |

- [x] Each route reads from data layer / telemetry reader
- [x] Return JSON with `Cache-Control: no-store`
- [x] **S1 — Path confinement:** telemetry route validates project slug
- [x] **S4 — Input validation:** `if (!/^[a-zA-Z0-9-]+$/.test(slug)) return 400`
- [x] **S5 — Server-only:** no fs in client, API returns sanitized JSON only
- [x] **S6 — Safe errors:** no file paths in error responses
- [x] Vitest tests for each endpoint (5 test files, 20 tests)

**Smoke check:** `curl http://localhost:3000/api/telemetry` returns valid JSON with session data.

---

#### 8.3 — Build: Smart Token Formatting (F19)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | None |
| **Files (create)** | `src/lib/format.ts` |
| **Resolves** | C2 (cache misleading — formatting separates concerns) |

- [x] `formatTokens(n: number): string` — "238M", "48.7K", "1,234"
- [x] `formatDuration(minutes: number): string` — "4h 31m", "23m"
- [x] `formatRelativeTime(date: Date): string` — "Updated 30s ago", "2 hours ago"
- [x] `formatDate` and `formatDateShort` for DD-MM-YYYY and DD-MM formats
- [x] Vitest tests for edge cases (0, negative, very large numbers)

---

#### 8.4 — Build: Client-Side Polling

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Nova |
| **Dependencies** | 8.2 (API routes) |
| **Files (create)** | `src/hooks/usePolling.ts` |
| **Files (modify)** | All page components |

- [x] `usePolling(url, interval)` hook — fetches at configurable interval
- [ ] Dashboard: 30s interval. Detail pages: 60s (wired in Phase 8B with page overhauls)
- [x] Handle loading, error, stale states
- [x] Page Visibility API — pause polling when tab hidden
- [ ] Convert pages to hybrid: Server Component SSR initial data, Client Component child polls (Phase 8B)

**Smoke check:** Open dashboard, wait 30s, data updates without page refresh.

---

#### 8.5 — Build: Budget Page Rework (F20)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Silas |
| **Dependencies** | 8.1 (telemetry reader), 8.2 (API routes) |
| **Files (modify)** | `src/app/budget/page.tsx`, `src/lib/budget.ts` |

Two distinct panels:

**Panel 1 — Pro Plan Usage (from telemetry):**
- Total sessions, total tokens (formatted with F19)
- Session duration quota proxy gauge (F8): "Today: 2.3h / ~5h"
- Daily/weekly burn rate mini chart (F7)
- "Last session: 47 min ago"

**Panel 2 — API Budget (from V&V ledger):**
- Existing budget cards (remaining, usable, floor, alert level)
- Keep existing donut chart
- "Last updated: [timestamp]"

**Smoke check:** Budget page shows two clear panels. Telemetry panel has real data.

---

#### 8.6 — Build: Dashboard Overhaul (F1, F2, F4)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Nova |
| **Dependencies** | 8.1 (telemetry), 8.3 (formatting), 8.4 (polling) |
| **Files (modify)** | `src/app/page.tsx` |
| **Files (create)** | `src/components/SessionPulse.tsx`, `src/components/TokenChart.tsx`, `src/components/ModelDonut.tsx` |

- [ ] **F1 — Live Session Pulse:** Card with breathing animation, active session count, duration counter, current token output. Indigo pulse when active, gray when idle
- [ ] **F2 — Token Breakdown Chart:** Stacked bar showing input vs output vs cache. Clear visual separation — output tokens prominent, cache tokens muted/secondary (C2)
- [ ] **F4 — Model Usage Donut:** Small donut — opus %, sonnet %, other %
- [ ] Existing status cards updated with live data from polling
- [ ] All token numbers use smart formatting (F19)

**Smoke check:** Playwright screenshot — pulse card breathing, charts rendering with real data.

---

#### 8.7 — Build: Sessions Page Overhaul (F3, F13, F14)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Nova |
| **Dependencies** | 8.1 (telemetry), 8.4 (polling) |
| **Files (modify)** | `src/app/sessions/page.tsx` |

- [ ] **F3 — Timeline Bars:** Horizontal duration bars per session, color-coded by model (opus=indigo, sonnet=lighter)
- [ ] **F13 — Token Display:** Each session row shows input/output token counts (formatted)
- [ ] **F14 — Model Tag:** Badge showing model name per session
- [ ] Session title from `custom-title` event or first user message preview
- [ ] Active sessions highlighted with pulse indicator
- [ ] Date grouping preserved, date format DD-MM-YYYY

**Smoke check:** Playwright screenshot — timeline bars, token counts, model badges visible.

---

#### 8.8 — Build: Telemetry Charts (F7, F8, F17)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Silas + Nova |
| **Dependencies** | 8.1 (telemetry), 8.3 (formatting) |
| **Files (modify)** | `src/app/budget/page.tsx` or new `src/app/telemetry/page.tsx` |
| **Resolves** | C6 (context for numbers — charts provide baselines) |

- [ ] **F7 — Burn Rate Chart:** Recharts bar chart — output tokens per day, 7-day and 30-day views. Shows trend
- [ ] **F8 — Duration Quota Gauge:** Horizontal bar or radial gauge — "Today: 2.3h" with soft 5h reference line
- [ ] **F17 — Usage Over Time:** Line chart switchable by: messages count, session count, or tool calls per day
- [ ] Average per-session and per-day baselines shown as reference lines (C6)

**Smoke check:** Charts render with real data. Switching views works.

---

#### 8.9 — Build: Phase Token Report (F6)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Silas |
| **Dependencies** | 8.1 (telemetry reader), roadmap parser (existing) |

- [ ] Cross-reference session timestamps with phase date ranges from roadmap
- [ ] Compute per-phase: session count, total duration, output tokens, cache tokens
- [ ] Display on roadmap page or budget page as a breakdown table
- [ ] Show deltas: "Phase 5 used 2x more than Phase 4"

**Smoke check:** Phase token report shows non-zero data for completed phases.

---

#### 8.10 — Build: Automated V&V Log Entries (F9)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Silas |
| **Dependencies** | 8.1 (telemetry reader) |

- [ ] Detect ended sessions: JSONL file mtime > 10 minutes stale + no active writes
- [ ] Generate V&V-compatible `usage-log.jsonl` entries from telemetry data
- [ ] Categories inferred from git commit messages or left as "uncategorized"
- [ ] Run as part of API route call (lazy generation, not background job)

---

#### 8.11 — Date Format Updates

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | None |

- [ ] Roadmap completed dates → DD-MM-YYYY
- [ ] Session chart axis labels → DD-MM
- [ ] Consistent relative timestamps everywhere (using F19 formatRelativeTime)

---

### Phase 8 — Security Review (Viktor)

Viktor's 6-point checklist applied to all Phase 8 code:

| # | Check | Applied To | Blocking? |
|---|-------|------------|-----------|
| S1 | Path confinement — all reads under `~/.claude/projects/` | `telemetry.ts`, API routes | **Yes** |
| S2 | File extension whitelist — `.jsonl` only | `telemetry.ts` | **Yes** |
| S3 | No credential exposure — cannot reach `.credentials.json` | Full grep of build output | **Yes** |
| S4 | API input validation — slug alphanumeric + hyphens only | API routes | **Yes** |
| S5 | No data in client bundle — fs server-side only | Build output audit | **Yes** |
| S6 | Safe error messages — no paths leaked | API routes, error handlers | **Yes** |

**Security tests Viktor will run:**
1. Path traversal: `project=../../` → must return 400
2. Credential access: no code path reaches `.credentials.json`
3. Slug injection: `project=foo;ls` → must reject
4. Client bundle audit: search build output for `homedir` → must not appear
5. Error message audit: trigger errors → no paths in response
6. JSONL-only: rename file to `.json` → reader skips it

### Phase 8 — QA Checkpoint

**Round 1:**
- Viktor security review (6-point checklist above)
- Viktor reviews telemetry reader (C3, C4 handling)
- Viktor reviews polling implementation (no memory leaks, cleanup in useEffect)
- Viktor tests data freshness end-to-end

**Round 2:**
- Viktor verifies all Round 1 fixes
- Full build + lint + test pass
- Expected: PASS in 2 rounds

### Phase 8 — Budget Checkpoint

- Silas logs Pro quota usage
- Silas verifies telemetry data accuracy (cross-check telemetry reader output vs manual JSONL inspection)
- Silas confirms burn rate chart data matches expectations

### Phase 8 — Director Live Testing

| # | Test | Expected |
|---|------|----------|
| D8.1 | Leave dashboard open 60s | Status cards update without manual refresh |
| D8.2 | Live Session Pulse card | Shows active session with duration counter, breathing animation |
| D8.3 | Token Breakdown chart | Stacked bar renders — output tokens visually distinct from cache |
| D8.4 | Model Usage donut | Shows opus/sonnet split |
| D8.5 | Sessions page | Timeline bars, token counts, model badges visible |
| D8.6 | Budget page — Pro panel | Shows real telemetry data, session count, duration gauge |
| D8.7 | Budget page — API panel | Shows V&V ledger data (existing) |
| D8.8 | Burn rate chart | Shows daily token output trend |
| D8.9 | Usage over time graph | Switchable by messages/sessions/tool calls |
| D8.10 | Phase token report | Shows token usage per completed phase |
| D8.11 | Roadmap dates | DD-MM-YYYY format |
| D8.12 | Session chart dates | DD-MM format |

### Phase 8 — Git Commits

1. `feat: add telemetry reader core with security-hardened path validation`
2. `feat: add API route endpoints for telemetry, agents, budget, sessions, dashboard`
3. `feat: add smart token formatting utilities`
4. `feat: add client-side polling with usePolling hook`
5. `feat: rework budget page with dual panel (Pro telemetry + API ledger)`
6. `feat: add live session pulse, token breakdown chart, and model donut to dashboard`
7. `feat: overhaul sessions page with timeline bars, token display, and model tags`
8. `feat: add burn rate chart, duration gauge, and usage-over-time graph`
9. `feat: add phase-by-phase token report`
10. `fix: update date formats to DD-MM-YYYY per Director request`

**Gate to Phase 9:** Director confirms data freshness is resolved. Charts render real data. Viktor QA: PASS.

---

## Phase 9 — Chat, History & UX Polish

> *"Make Vena complete."*

**Goal:** Chatbox UI, session history viewer, PTY auto-start, branding, interactive roadmap.
**Duration:** 2–3 sessions
**Primary Owner:** Orchestrator + Nova
**Supporting:** Viktor (security review for chat + history), Silas (budget check)

**Features delivered:** F10, plus existing planned features (chatbox, PTY auto-start, VenaOS branding, roadmap expand/collapse)

### Task Breakdown

#### 9.1 — Build: Chatbox UI Component

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Nova |
| **Dependencies** | None (builds on existing Terminal infrastructure) |
| **Files (create)** | `src/components/ChatBox.tsx` |
| **Files (modify)** | `src/app/chat/page.tsx` |

- [ ] Split view on chat page: terminal panel + chatbox panel
- [ ] Chatbox: message input, send button, scrollable message history
- [ ] User messages right-aligned, Claude responses left-aligned
- [ ] Messages formatted with basic styling
- [ ] Bridge to PTY: writes to PTY stdin, reads responses
- [ ] Design follows tokens: `border-vena-border`, `bg-vena-surface-raised`

**MVP scope (strict):** Input, display, PTY bridge. No streaming, no persistence, no markdown rendering. Those are Sprint 3.

**Smoke check:** Playwright screenshot of split view. Type message, receive response.

---

#### 9.2 — Build: PTY Server Auto-Start

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | None |
| **Files** | `package.json` |

- [ ] Swap: `"dev"` → runs both Next.js + PTY (currently `dev:full`), `"dev:next"` → Next.js only
- [ ] Graceful shutdown: PTY stops when Next.js stops
- [ ] Update README and docs

**Smoke check:** `npm run dev` → navigate to /chat → terminal connects automatically.

---

#### 9.3 — Build: Chat History Viewer (F10)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Nova |
| **Dependencies** | 8.1 (telemetry reader — reads same JSONL files) |
| **Files (create)** | `src/app/history/page.tsx`, `src/lib/history.ts`, `src/components/MessageBubble.tsx` |

- [ ] New route: `/history` — lists all past sessions (from telemetry reader)
- [ ] Click session → scrollable read-only message list
- [ ] Parse `user` and `assistant` events from session JSONL
- [ ] User messages and Claude messages styled differently (alignment, color, name label)
- [ ] Show timestamp per message
- [ ] Show token count per assistant message (from `usage` field)
- [ ] Show model used per message
- [ ] Streaming readline for large sessions (C4)
- [ ] **Security:** Same path confinement as telemetry reader. No raw prompt exposure in API — only return sanitized message content

**MVP scope:** Basic message list. No markdown rendering, no code highlighting, no tool call display. No agent differentiation yet (Sprint 3 — F11). Display message `content[0].text` only.

**Smoke check:** Navigate to /history → see session list → click → see messages.

---

#### 9.4 — Enhancement: VenaOS Branding & Version Text

| Field | Detail |
|-------|--------|
| **Owner** | Nova + Orchestrator |
| **Dependencies** | None |

- [ ] "Vena" → "VenaOS" in sidebar (desktop + mobile)
- [ ] Version badge: `text-micro` (11px), color: `text-vena-text-secondary` (brighter)
- [ ] Version: `v0.2-mvp`

---

#### 9.5 — Enhancement: Roadmap Phase Expand/Collapse

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Nova |
| **Dependencies** | None |

- [ ] Collapsible phase cards — click header to toggle task list
- [ ] Current/next phase expanded by default, completed collapsed
- [ ] Chevron icon: right (collapsed) → down (expanded)
- [ ] Smooth height transition
- [ ] `aria-expanded` for accessibility
- [ ] Convert to `"use client"` for `useState`

---

#### 9.6 — Enhancement: Phase Detail Panels

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | 9.5 (expand/collapse), 8.9 (phase token data) |

- [ ] Show phase token usage, session count, model breakdown in expanded panel
- [ ] Data comes from Phase Token Report (8.9)
- [ ] Lower priority — show available data, mark rest N/A

---

### Phase 9 — QA Checkpoint

**Round 1:**
- Viktor security review on chatbox (input sanitization, no XSS)
- Viktor security review on history viewer (same path confinement as telemetry, no raw file content)
- Viktor reviews PTY auto-start (no new attack surface)
- Viktor tests expand/collapse accessibility (aria-expanded, keyboard)

**Round 2:**
- All fixes verified. Build + lint + test pass. Expected: PASS.

### Phase 9 — Director Live Testing

| # | Test | Expected |
|---|------|----------|
| D9.1 | `npm run dev` | Both Next.js and PTY server start |
| D9.2 | /chat terminal | Connects automatically, green status dot |
| D9.3 | Chatbox visible | Split view: terminal + chatbox side by side |
| D9.4 | Send chatbox message | Message appears, Claude responds |
| D9.5 | /history page | Lists past sessions with timestamps |
| D9.6 | Click session in history | Messages load in scrollable view |
| D9.7 | Message display | User vs Claude visually distinct, tokens shown |
| D9.8 | Sidebar branding | "VenaOS" shown, version text readable |
| D9.9 | Roadmap expand/collapse | Click phase → tasks expand with animation |
| D9.10 | Phase detail data | Token usage shown in expanded phase panel |

### Phase 9 — Git Commits

1. `feat: add chatbox UI component with split view on chat page`
2. `feat: auto-start PTY server with npm run dev`
3. `feat: add session history viewer with read-only message display`
4. `feat: update branding to VenaOS with improved version visibility`
5. `feat: add expand/collapse to roadmap phase cards`
6. `feat: add phase detail metadata panels with token data`

**Gate to Phase 10:** All features functional. Viktor QA: PASS.

---

## Phase 10 — QA, Stabilization & MVP Release

> *"Ship it for real this time."*

**Goal:** Comprehensive QA, automated tests, Director final testing, release.
**Duration:** 1–2 sessions
**Primary Owner:** Viktor (QA), Orchestrator (fixes)
**Supporting:** Nova (final visual check), Silas (budget reconciliation)

### Task Breakdown

#### 10.1 — Full Viktor QA Pipeline

- Run complete 9-step pipeline on every page and every new feature
- Pages: Dashboard, Agents, Agent Detail, Budget, Roadmap, Sessions, Chat, **History**
- New code: telemetry reader, API routes, polling hooks, chatbox, history viewer, all charts

#### 10.2 — Playwright End-to-End Tests

- [ ] Navigation: all sidebar links work (including /history)
- [ ] Dashboard: live pulse card renders, charts show data, auto-refresh works
- [ ] Agents: cards render with correct status, click → detail page
- [ ] Budget: dual panel — Pro telemetry + API ledger both render
- [ ] Roadmap: phases expand/collapse, phase detail shows token data
- [ ] Sessions: timeline bars render, model tags visible
- [ ] Chat: terminal connects (requires PTY server)
- [ ] History: session list renders, click → messages load
- [ ] Responsive: mobile sidebar opens/closes
- [ ] Data refresh: polling updates data after interval
- [ ] Telemetry charts: burn rate, model donut, usage over time

#### 10.3 — Fix All QA Findings

#### 10.4 — Budget Reconciliation (Silas)

- Compare telemetry reader output vs manual JSONL inspection
- Verify token counts match
- Update V&V ledger if needed
- Document discrepancies

#### 10.5 — Performance Pass

- [ ] All pages load < 2 seconds on localhost
- [ ] No visible layout shift
- [ ] Polling doesn't cause memory leaks (DevTools over 5 min)
- [ ] No unnecessary re-renders
- [ ] Large session JSONL files don't block page load

#### 10.6 — Director Testing Round 2

Full testing using updated testing plan below.

#### 10.7 — MVP Release Preparation

- [ ] Update `package.json` version to `0.2.0`
- [ ] Update version display in Sidebar
- [ ] Final README update with Sprint 2 features
- [ ] Update roadmap: all Sprint 2 phases → complete
- [ ] Final memory file updates for all team members
- [ ] Git tag: `v0.2.0-mvp`

### Phase 10 — Git Commits

1. `test: add Playwright e2e test suite for all pages`
2. `fix: resolve Viktor QA findings from Phase 10 review`
3. `chore: budget reconciliation and ledger update`
4. `chore: v0.2.0-mvp release preparation`
5. `feat: Sprint 2 MVP release v0.2.0` (after Director approval)

---

## Future Backlog — Sprint 3+

Features discussed and approved for future sprints. Not in scope for Sprint 2.

| # | Feature | Proposed By | Complexity | Notes |
|---|---------|-------------|------------|-------|
| F5 | **Project Switcher** | Nova | High | Sidebar dropdown — select project, all pages update. Requires projectSlug param through entire data layer |
| F11 | **Agent Message Filtering** | Director | Medium-High | Categorize messages by agent in history. Filter by agent. Needs heuristics for agent identification in JSONL |
| F12 | **WhatsApp-Style Chat UI** | Director | High | Full chat client: profile photos, agent-specific colors, message bubbles, left/right alignment, markdown rendering |
| F15 | **Remote Session Control** | Director | Very High | Bidirectional access to running Claude Code sessions. Requires research — may not be feasible |
| F18 | **Multi-Project Overall Tab** | Director | High | Combined metrics across all projects. Depends on F5 (project switcher) |
| F13+ | **Per-Message Token Display** | Director | Medium | Token count per individual message. Tied to F12 (rich chat UI) |
| C8 | **Online Security Upgrade** | Director | High | Full auth, HTTPS, CORS, security audit before any network exposure |

---

## Risk Register

| # | Risk | Probability | Impact | Contingency |
|---|------|-------------|--------|-------------|
| R1 | ~~Telemetry doesn't exist~~ | ~~Medium-High~~ | ~~High~~ | **RESOLVED — telemetry confirmed** |
| R2 | Session logger hook broken on Windows | High | Low (deprioritized) | Hook now secondary. Telemetry reader handles session data. Fix hook for categories only if time allows |
| R3 | Client-side polling performance issues | Low | Medium | Reduce frequency (60s). Page Visibility API. Request deduplication |
| R4 | PTY auto-start conflicts with Next.js | Low | Low | Keep `dev:full` as fallback. `concurrently` already works |
| R5 | **Scope creep from expanded feature set** | **Medium-High** | **Medium** | **14 features is ambitious. Phase 8 is heavy. If falling behind, F6 (phase report), F9 (V&V auto), F17 (usage over time) can be deferred to Phase 9 without blocking MVP** |
| R6 | Large JSONL files slow down page loads | Medium | Medium | Streaming readline, async reads, pagination for history viewer |
| R7 | Subagent double-counting inflates data | Medium | Medium | C1 verification in Phase 7. Architecture decision before reader is built |
| R8 | Security findings in telemetry reader | Medium | High | Viktor's 6-point checklist. All findings block. Budget time for 2 QA rounds |

---

## MVP Success Criteria

All must pass for release:

| # | Criterion | Measured By |
|---|-----------|-------------|
| 1 | Dashboard live session pulse card shows active session | Director live test |
| 2 | Token breakdown chart renders with real data | Director live test |
| 3 | Model usage donut shows opus/sonnet split | Director live test |
| 4 | Sessions page shows timeline bars with duration, tokens, model | Director live test |
| 5 | Budget page shows dual panel (Pro telemetry + API ledger) | Director live test |
| 6 | Burn rate chart shows daily token output | Director live test |
| 7 | Session duration gauge shows cumulative hours | Director live test |
| 8 | Usage over time graph switchable by metric | Director live test |
| 9 | Dashboard auto-updates within 60s | Director live test |
| 10 | History page lists past sessions | Director live test |
| 11 | Click session → read-only message display | Director live test |
| 12 | Chatbox UI sends/receives messages (no manual PTY start) | Director live test |
| 13 | `npm run dev` starts both Next.js and PTY server | Director live test |
| 14 | "VenaOS" visible in sidebar, version text readable | Director live test |
| 15 | Roadmap phases expand/collapse with phase token data | Director live test |
| 16 | `npm run lint` → 0 errors, 0 warnings | CI check |
| 17 | `npm run build` → clean | CI check |
| 18 | `npm test` → all pass | CI check |
| 19 | `npx playwright test` → all pass | CI check |
| 20 | Viktor's 6-point security checklist → all pass | QA report |
| 21 | Viktor verdict: PASS or PASS WITH NOTES | QA report |

---

## Director's Sprint 2 Testing Plan

### Prerequisites

| # | Step | Details |
|---|------|---------|
| 1 | Install dependencies | `npm install` |
| 2 | Start dev server | `npm run dev` — confirm both Next.js AND PTY server start |
| 3 | Open browser | Navigate to `http://localhost:3000` |

---

### Section S2-1 — Regression: Sprint 1 Critical Fixes

| # | Test | Expected Result | Pass? |
|---|------|-----------------|-------|
| S2-1.1 | Agent active status | Active agents show green dot | |
| S2-1.2 | Phase card on dashboard | Correct current phase | |
| S2-1.3 | Lint check | `npm run lint` → 0 errors, 0 warnings | |
| S2-1.4 | Agent active count | Dashboard shows correct active count | |
| S2-1.5 | Agent status colors | Active=green, idle=gray | |

---

### Section S2-2 — Live Telemetry (Phase 8)

| # | Test | Expected Result | Pass? |
|---|------|-----------------|-------|
| S2-2.1 | Dashboard auto-refresh | Cards update within 60s without manual refresh | |
| S2-2.2 | Live Session Pulse | Breathing animation, duration counter, active token count | |
| S2-2.3 | Token Breakdown chart | Stacked bar — output tokens visually prominent, cache secondary | |
| S2-2.4 | Model Usage donut | Shows opus/sonnet distribution | |
| S2-2.5 | Sessions timeline bars | Duration bars, color-coded by model | |
| S2-2.6 | Session token display | Each session shows input/output tokens | |
| S2-2.7 | Session model tag | Badge showing model name per session | |
| S2-2.8 | Budget Pro panel | Real telemetry data — session count, token totals | |
| S2-2.9 | Budget API panel | V&V ledger data (existing) | |
| S2-2.10 | Duration quota gauge | Shows cumulative hours today | |
| S2-2.11 | Burn rate chart | Shows daily output tokens over time | |
| S2-2.12 | Usage over time | Switchable: messages / sessions / tool calls | |
| S2-2.13 | Phase token report | Shows token usage per completed phase | |
| S2-2.14 | Roadmap dates | DD-MM-YYYY format | |
| S2-2.15 | Session chart dates | DD-MM format | |

---

### Section S2-3 — Chat & History (Phase 9)

| # | Test | Expected Result | Pass? |
|---|------|-----------------|-------|
| S2-3.1 | PTY auto-start | `npm run dev` starts both servers | |
| S2-3.2 | Terminal auto-connect | /chat — terminal connects, green dot | |
| S2-3.3 | Chatbox UI | Split view: terminal + chatbox | |
| S2-3.4 | Send message | Message appears in chatbox history | |
| S2-3.5 | Receive response | Claude responds in chatbox | |
| S2-3.6 | History page | Lists past sessions with timestamps | |
| S2-3.7 | Session messages | Click session → messages load, user/Claude styled differently | |
| S2-3.8 | Message tokens | Token count shown per assistant message | |
| S2-3.9 | Message model | Model shown per message | |

---

### Section S2-4 — UX Polish (Phase 9)

| # | Test | Expected Result | Pass? |
|---|------|-----------------|-------|
| S2-4.1 | VenaOS branding | Sidebar shows "VenaOS" | |
| S2-4.2 | Version visibility | Version text clearly readable | |
| S2-4.3 | Roadmap expand | Click phase → task list expands with animation | |
| S2-4.4 | Roadmap collapse | Click again → collapses | |
| S2-4.5 | Phase detail data | Expanded phase shows token usage from telemetry | |

---

### Section S2-5 — Cross-Cutting

| # | Test | Expected Result | Pass? |
|---|------|-----------------|-------|
| S2-5.1 | Build | `npm run build` → clean | |
| S2-5.2 | Lint | `npm run lint` → 0 errors, 0 warnings | |
| S2-5.3 | Unit tests | `npm test` → all pass | |
| S2-5.4 | E2E tests | `npx playwright test` → all pass | |
| S2-5.5 | Mobile responsive | All new features work on mobile viewport | |
| S2-5.6 | No console errors | Browser DevTools — no red errors | |
| S2-5.7 | Security tests | Viktor's 6-point checklist — all pass | |

---

### Post-Testing Summary Template

```
VENA v0.2.0-mvp — Director's Sprint 2 Testing Report
Date: [DD-MM-YYYY]

Total tests: 37
Passed:
Failed:
Skipped:

Critical issues (must fix):
1.
2.

Non-critical issues:
1.
2.

Overall verdict: [ PASS / PASS WITH NOTES / FAIL ]
```
