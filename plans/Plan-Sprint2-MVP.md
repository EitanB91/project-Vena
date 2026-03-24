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
**Duration:** 8 sessions (4 sub-phases)
**Status:** IN PROGRESS — **8A SHIPPED, 8B SHIPPED, 8C SHIPPED, 8D next**
**Primary Owner:** Orchestrator
**Supporting:** Nova (charts, visual design), Silas (budget panel, burn rate), Viktor (security + QA)
**Detailed execution plan:** [`plans/Plan-Phase8-Execution.md`](Plan-Phase8-Execution.md)

**Features delivered:** F1, F2, F3, F4, F6, F7, F8, F9, F13, F14, F17, F19, F20

---

### Sub-Phase 8A — Foundation (SHIPPED)

**Sessions:** 1–2 | **Commit:** `bb3cead` | **Viktor QA:** PASS | **Director:** APPROVED

| Task | Name | Status | Features |
|------|------|--------|----------|
| 8.1 | Telemetry Reader Core | DONE | — |
| 8.3 | Smart Token Formatting | DONE | F19 |

**Delivered:** `src/lib/telemetry.ts`, `src/lib/format.ts`, `src/types/telemetry.ts`, 43 new tests (97 total). Security S1–S6 pass. Runtime type guards (no `as` casts). Real data flowing (14 sessions, 285.7M tokens).

---

### Sub-Phase 8B — API & Polling (SHIPPED)

**Sessions:** 3–4 | **Commit:** `02c3ad8` | **Viktor QA:** PASS | **Director:** APPROVED

| Task | Name | Status | Features |
|------|------|--------|----------|
| 8.2 | API Route Endpoints | DONE | — |
| 8.4 | Client-Side Polling | DONE | — |
| 8.5 | Budget Page Rework | DONE | F20 |
| 8.6 | Dashboard Overhaul | DONE | F1, F2, F4 |
| 8.7 | Sessions Page Overhaul | DONE | F3, F13, F14 |
| 8.9 | Phase Token Report | DONE | F6 |
| 8.11 | Date Format Updates | DONE | — |

**Delivered:** 5 API routes, `usePolling` hook, dashboard/sessions/budget page overhauls, telemetry charts, phase token report. 111 total tests.

---

### Sub-Phase 8C — Chart Enhancements (SHIPPED)

**Session:** 5 | **Shipped:** 2026-03-24

| Task | Name | Status | Features |
|------|------|--------|----------|
| 8.8 | Telemetry Charts | DONE | F7, F8, F17 |

**Delivered:**
- [x] **F7 — Burn Rate Chart:** 7-day and 30-day toggle views (was 7-day only from 8B)
- [x] **F8 — Duration Quota Gauge:** Horizontal bar with soft 5h reference (shipped in 8B, verified)
- [x] **F17 — Usage Over Time:** Switchable by tokens, messages, sessions, and tool calls per day
- [x] Average per-day baselines as reference lines (C6)
- [x] `toolCalls` added to `DailyUsage` type and aggregation
- [x] 112 tests passing, lint clean, build clean

**Smoke check:** PASS — Charts render with real data. 7d/30d toggle works. All 4 metric views work.

---

### Sub-Phase 8D — V&V Sync & Exit (CODE COMPLETE)

**Sessions:** 6–7

| Task | Name | Status | Features |
|------|------|--------|----------|
| 8.10 | Automated V&V Log Entries | DONE | F9 |

**Scope:**
- [x] Detect ended sessions: JSONL file mtime > 10 minutes stale + no active writes
- [x] Generate V&V-compatible `usage-log.jsonl` entries from telemetry data
- [x] Categories inferred from git commit messages or left as "uncategorized"
- [x] Run as part of API route call (lazy generation, not background job)

**Delivered:**
- [x] New module `src/lib/vv-sync.ts` — sync engine with idempotent deduplication
- [x] Integrated into `/api/telemetry` route (lazy, best-effort on each poll)
- [x] Git commit prefix → category mapping (feat→code_build, test→tests, docs→admin, etc.)
- [x] 17 new tests, 129 total passing, lint clean, build clean
- [x] Smoke tested: 18 sessions synced, idempotency verified

**Ends with:** Viktor full Phase 8 sweep + Director full live test → **PHASE 8 EXIT APPROVAL**

---

### Phase 8 — Security Review (Viktor)

Viktor's 6-point checklist applied to all Phase 8 code:

| # | Check | Applied To | Blocking? | Status |
|---|-------|------------|-----------|--------|
| S1 | Path confinement — all reads under `~/.claude/projects/` | `telemetry.ts`, API routes | **Yes** | PASS (8A+8B) |
| S2 | File extension whitelist — `.jsonl` only | `telemetry.ts` | **Yes** | PASS (8A) |
| S3 | No credential exposure — cannot reach `.credentials.json` | Full grep of build output | **Yes** | PASS (8B) |
| S4 | API input validation — slug alphanumeric + hyphens only | API routes | **Yes** | PASS (8B) |
| S5 | No data in client bundle — fs server-side only | Build output audit | **Yes** | PASS (8B) |
| S6 | Safe error messages — no paths leaked | API routes, error handlers | **Yes** | PASS (8B) |

### Phase 8 — Git Commits (Actual)

| # | Commit | Sub-Phase | Message |
|---|--------|-----------|---------|
| 1 | `bb3cead` | 8A | feat: Phase 8A — telemetry reader core and smart formatting utilities |
| 2 | `02c3ad8` | 8B | feat: Phase 8B — API routes, live polling, dashboard/sessions/budget overhauls, telemetry charts |
| 3 | *pending* | 8C | — |
| 4 | *pending* | 8D | — |

### Phase 8 — Director Live Testing

| # | Test | Expected | Sub-Phase | Tested? |
|---|------|----------|-----------|---------|
| D8.1 | Leave dashboard open 60s | Status cards update without manual refresh | 8B | — |
| D8.2 | Live Session Pulse card | Shows active session with duration counter, breathing animation | 8C | — |
| D8.3 | Token Breakdown chart | Stacked bar renders — output tokens visually distinct from cache | 8C | — |
| D8.4 | Model Usage donut | Shows opus/sonnet split | 8C | — |
| D8.5 | Sessions page | Timeline bars, token counts, model badges visible | 8B | — |
| D8.6 | Budget page — Pro panel | Shows real telemetry data, session count, duration gauge | 8C | — |
| D8.7 | Budget page — API panel | Shows V&V ledger data (existing) | 8B | — |
| D8.8 | Burn rate chart | Shows daily token output trend | 8C | — |
| D8.9 | Usage over time graph | Switchable by messages/sessions/tool calls | 8C | — |
| D8.10 | Phase token report | Shows token usage per completed phase | 8D | — |
| D8.11 | Roadmap dates | DD-MM-YYYY format | 8C | — |
| D8.12 | Session chart dates | DD-MM format | 8C | — |

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
