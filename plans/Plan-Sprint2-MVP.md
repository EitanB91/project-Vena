# Plan: Sprint 2 — MVP

**Sprint:** 2 (Phases 7–10)
**Type:** MVP — fix fundamental issues, prove vision is viable
**Status:** Planned
**Team:** Director (Eitan), Orchestrator (Claude), Nova, Viktor, Silas Sterling
**Created:** 2026-03-21

---

## Why Sprint 2 Exists

Vena v1.0 (Sprint 1, Phases 0–6) was tested by the Director on 2026-03-21. **Verdict: FAIL.**

The UX/UI and design are spot on, but data doesn't update in real time. Agent statuses are stale, sessions stop logging after 2026-03-18, budget numbers don't reflect reality. The Director declared v1.0 won't release publicly. Sprint 2 is an MVP sprint — fix the data pipeline or determine whether the project vision is reachable.

**Director's core concern:** "If we won't find solutions the project's future is dire."

---

## Sprint 2 Overview

| Field | Value |
|-------|-------|
| **Goal** | Make Vena's data live — agents, sessions, budget update in real time |
| **Phases** | 7 (Research & Fixes) → 8 (Live Pipeline) → 9 (Chat & UX) → 10 (QA & Release) |
| **Top Priority** | Research Claude Code local telemetry (Director mandate — above all else) |
| **Key Decision** | Keep CLI terminal + add chatbox UI alongside it (split view) |
| **Critical Gate** | Full team meeting after Phase 7 research — finalize roadmap based on findings |
| **Assumption** | Roadmap built assuming automated budget updates are achievable |
| **Target Version** | v0.2.0-mvp |

---

## Prerequisites (before Phase 7 starts)

| # | Task | Owner | Done? |
|---|------|-------|-------|
| P.1 | Update `Roadmap-Project-Vena.md` — set Phase 6 `status="next"` → `status="complete"` with date `2026-03-21` | Orchestrator | [ ] |
| P.2 | Add Phase 7–10 stubs to roadmap with `status="planned"` | Orchestrator | [ ] |
| P.3 | Update `plans/INDEX.md` to include this file | Orchestrator | [ ] |
| P.4 | Confirm all team memory files are current (mandatory per Memory Update Protocol) | All | [ ] |
| P.5 | Run `npm run build` and `npm test` — confirm green baseline | Orchestrator | [ ] |
| P.6 | Git commit: `chore: update roadmap Phase 6 to complete, add Sprint 2 phase stubs` | Orchestrator | [ ] |

---

## Phase 7 — Research & Foundation Fixes

> *"Can we build what we envision?"*

**Goal:** Answer the existential questions before building features on shaky ground.
**Duration:** 1–2 sessions
**Primary Owner:** Orchestrator
**Supporting:** Viktor (lint verification), Silas (telemetry research)

### Task Breakdown

#### 7.1 — Research: Claude Code Local Telemetry (TOP PRIORITY)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Silas |
| **Priority** | P0 — FIRST. Director mandate: above all else. |
| **Dependencies** | None |
| **Deliverable** | `plans/Research-Telemetry.md` |

Investigate what local files Claude Code writes about usage:
- [ ] Scan `~/.claude/` global directory for usage/telemetry files
- [ ] Check for local SQLite databases, JSON files, or log files
- [ ] Inspect `projects.json` or equivalent session tracking
- [ ] Test whether Claude Code CLI exposes usage commands (`--usage`, `--stats`)
- [ ] Check Claude Code settings/config files for usage tracking options
- [ ] Document all findings with file paths and data formats
- [ ] Determine feasibility: can Vena read real-time usage data automatically?

**Smoke check:** N/A (research only)

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
- [ ] Next.js `revalidatePath` / `revalidateTag` for server-side cache invalidation
- [ ] Server-Sent Events (SSE) via Route Handlers for push updates
- [ ] Client-side `setInterval` polling with `"use client"` wrappers
- [ ] `useSWR` or plain `fetch` with refresh intervals
- [ ] Decide on primary pattern for Sprint 2

**Smoke check:** N/A (research only)

---

#### 7.3 — Research: Session Logger Hook Diagnosis

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Priority** | P0 |
| **Dependencies** | None |

Investigate why `usage-log.jsonl` stops at 2026-03-18:
- [ ] Verify `.claude/settings.local.json` hooks config is correct
- [ ] Test the hook manually — pipe mock JSON input to `session-logger.sh`
- [ ] Check Windows compatibility (`bash`, `date -u`, `node` path resolution in Git Bash)
- [ ] Check file permissions on `usage-log.jsonl`
- [ ] Document root cause and fix plan

**Smoke check:** N/A (research only, fix in Phase 8)

---

#### 7.4 — Fix: All 5 Lint Errors

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Priority** | P0 |
| **Dependencies** | None |
| **Files** | `src/app/page.tsx`, `src/app/agents/page.tsx`, `src/components/Sidebar.tsx`, `src/components/Terminal.tsx` |

**7.4a — `Date.now()` purity violations (3 errors):**
- Files: `src/app/page.tsx` (lines 27, 165), `src/app/agents/page.tsx` (line 14)
- Fix: Move active status computation out of render. Compute a `const now = Date.now()` once before any filtering, pass it as a parameter to status logic. Or better — compute active status in the data layer (see 7.5).

**7.4b — `setState` in effect (1 error):**
- File: `src/components/Sidebar.tsx` (line 22)
- Fix: Replace `useEffect` + `setMobileOpen(false)` with a ref-based approach — track previous pathname, only set state when it actually changes. Or use `startTransition`.

**7.4c — Unused variable (1 warning):**
- File: `src/components/Terminal.tsx` (line 37)
- Fix: Remove `status` state variable. The `onStatusChange` callback already propagates status to the parent.

**Smoke check:**
- `npm run lint` → 0 errors, 0 warnings
- `npm run build` → clean
- `npm test` → all pass

---

#### 7.5 — Fix: Date.now Architecture (Data Layer Refactor)

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Priority** | P0 |
| **Dependencies** | 7.4a (lint fix establishes the pattern) |
| **Files** | `src/lib/agent-status.ts`, `src/lib/agents.ts`, `src/types/index.ts`, `src/app/page.tsx`, `src/app/agents/page.tsx` |

- [ ] Add `status: AgentStatus` field to `AgentProfile` type in `src/types/index.ts`
- [ ] Update `readAllAgents()` in `src/lib/agents.ts` — compute status using `getAgentStatus()` with a single `Date.now()` call at function entry
- [ ] Remove all inline `Date.now()` comparisons from page components
- [ ] Update `AgentCard` component to use pre-computed status
- [ ] Update tests in `tests/lib/agents.test.ts`

**Smoke check:** Playwright screenshot of agents page — active agents show green dots, idle show gray.

---

### Phase 7 — QA Checkpoint

| Step | Check | Blocking? |
|------|-------|-----------|
| Lint | `npm run lint` → 0 errors, 0 warnings | Yes |
| Build | `npm run build` → clean | Yes |
| Tests | `npm test` → all pass | Yes |
| Agent status | Active agents show correct colors | Yes |
| Security | No new attack surface introduced | Yes |
| Research docs | Telemetry + refresh pattern research complete | Yes (for gate meeting) |

**Viktor QA:** Full 9-step pipeline. Expected: PASS in 1–2 rounds.

### Phase 7 — Budget Checkpoint

- Silas logs Pro quota usage for the phase
- Silas presents telemetry research findings (what data is available for automated tracking)

### Phase 7 — Director Live Testing

| # | Test | Expected |
|---|------|----------|
| D7.1 | Open /agents — check active status colors | Green dots for active agents, gray for idle |
| D7.2 | Open dashboard — agents card shows correct active count | Matches actual active agents |
| D7.3 | Run `npm run lint` | 0 errors, 0 warnings |
| D7.4 | Open /roadmap — Phase 6 shows "Complete" badge | Green badge, not "next" |

### Phase 7 — Git Commits

1. `docs: add telemetry and data refresh research documents`
2. `fix: resolve all 5 lint errors (Date.now purity, setState in effect, unused var)`
3. `refactor: move agent status computation to data layer`

---

### GATE: Phase 7 Team Meeting

> **This meeting determines the shape of the rest of Sprint 2.**

**Attendees:** Director, Orchestrator, Nova, Viktor, Silas
**Trigger:** All Phase 7 research tasks complete
**Purpose:** Present findings, finalize roadmap

**Agenda:**
1. Orchestrator presents telemetry research results — what data exists, where, what format
2. Silas presents budget automation feasibility — can V&V get real numbers automatically?
3. Orchestrator presents data refresh pattern recommendation — polling vs SSE vs revalidation
4. Orchestrator presents session logger diagnosis — root cause and fix plan
5. Team discusses: does the Phase 8–10 roadmap change based on findings?
6. **Director approves or modifies Phase 8–10 scope**

**Decision matrix:**

| Telemetry exists? | Session logger fixable? | Outcome |
|-------------------|------------------------|---------|
| Yes | Yes | Full roadmap proceeds as planned |
| Yes | No | Rewrite logger as Node.js script; roadmap proceeds |
| No | Yes | Phase 8.2 changes to manual + hook-based estimation |
| No | No | Significant scope reduction; Director decides path |

**GATE RULE:** No Phase 8 work begins until Director approves scope in this meeting.

---

## Phase 8 — Live Data Pipeline

> *"Make Vena breathe."*

**Goal:** Real-time data updates — dashboard reflects actual system state.
**Duration:** 2–3 sessions
**Primary Owner:** Orchestrator
**Supporting:** Nova (visual heartbeat), Silas (telemetry reader), Viktor (QA)

### Task Breakdown

#### 8.1 — Build: API Route Endpoints for Client Polling

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | 7.5 (agent status in data layer) |
| **Files (create)** | `src/app/api/agents/route.ts`, `src/app/api/budget/route.ts`, `src/app/api/sessions/route.ts`, `src/app/api/dashboard/route.ts` |

- [ ] Create Route Handlers returning JSON for each data domain
- [ ] Each reads from filesystem using existing `src/lib/` readers
- [ ] Return proper JSON with `Cache-Control: no-store` headers
- [ ] Add Vitest tests for each handler

**Smoke check:** `curl http://localhost:3000/api/agents` returns valid JSON with agent profiles.

---

#### 8.2 — Build: Telemetry Reader for V&V Budget Ledger

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Silas |
| **Dependencies** | 7.1 research results, 8.1 (API route pattern) |
| **Files** | `src/lib/telemetry.ts` (new), budget reader updates |

**If telemetry files found:**
- [ ] Build reader in `src/lib/telemetry.ts` that parses Claude Code usage data
- [ ] Compute session/weekly usage percentages from raw data
- [ ] Merge telemetry data with existing budget ledger
- [ ] Add Vitest tests

**If no telemetry (contingency):**
- [ ] Build manual update API route (`POST /api/budget/update`)
- [ ] Hook-based estimation from session-logger events
- [ ] Show "Last updated: [timestamp]" with manual maintenance note

---

#### 8.3 — Fix: Session Logger Hook

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | 7.3 research results |
| **Files** | `.claude/hooks/session-logger.sh` (fix or replace with `.mjs`) |

- [ ] Fix root cause identified in 7.3
- [ ] If Windows-incompatible: rewrite as Node.js script (`session-logger.mjs`)
- [ ] Update `.claude/settings.local.json` if script path changes
- [ ] Handle edge cases: concurrent sessions, missing log file, file locks
- [ ] Test: trigger a Claude Code session, verify new entries in `usage-log.jsonl`

**Smoke check:** Start/stop a Claude Code session → new entry appears in `usage-log.jsonl`.

---

#### 8.4 — Build: Client-Side Polling Components

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Nova |
| **Dependencies** | 8.1 (API routes) |
| **Files (create)** | `src/hooks/usePolling.ts` |
| **Files (modify)** | `src/app/page.tsx`, `src/app/agents/page.tsx`, `src/app/sessions/page.tsx`, `src/app/budget/page.tsx` |

- [ ] Create `usePolling` hook — fetches from API route at configurable interval (30s dashboard, 60s detail pages)
- [ ] Handle loading, error, stale states
- [ ] Convert pages to hybrid model: Server Component renders initial data (SSR), Client Component child polls for updates
- [ ] Don't poll when tab is hidden (Page Visibility API)

**Smoke check:** Open dashboard, wait 30s, verify data updates without page refresh.

---

#### 8.5 — Build: Visual Heartbeat Indicators

| Field | Detail |
|-------|--------|
| **Owner** | Nova + Orchestrator |
| **Dependencies** | 8.4 (polling provides timestamp data) |
| **Files (create)** | `src/components/LastUpdated.tsx` |

- [ ] "Updated Xs ago" relative timestamp on status cards
- [ ] Subtle fade animation when data refreshes
- [ ] Manual refresh icon button
- [ ] Follow existing design token system

**Smoke check:** Playwright screenshot showing "Updated Xs ago" on dashboard cards.

---

#### 8.6 — Enhancement: Session Titles and Summaries

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | None |
| **Files** | `src/app/sessions/page.tsx` |

- [ ] If session has `SessionSummary` event: use `summary.summary` as row description
- [ ] If no summary: generate brief description from duration, source, categories
- [ ] Display title prominently in session row

**Smoke check:** Sessions page shows meaningful text for each session row.

---

#### 8.7 — Enhancement: Date Format Updates

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | None |
| **Files** | `src/app/roadmap/page.tsx`, `src/app/sessions/page.tsx`, `src/components/SessionChart.tsx` |

Director requested:
- [ ] Roadmap completed dates → DD-MM-YYYY
- [ ] Session chart axis labels → DD-MM
- [ ] Consistent relative timestamps everywhere

**Smoke check:** Playwright screenshots confirming date formats match spec.

---

### Phase 8 — QA Checkpoint

**Round 1:**
- Viktor security review on all new API routes (no path traversal, proper error handling)
- Viktor reviews polling implementation (no memory leaks, proper cleanup in useEffect)
- Viktor reviews telemetry reader (no unsafe file operations)
- Viktor tests data freshness end-to-end

**Round 2:**
- Viktor verifies all Round 1 fixes
- Full build + lint + test pass
- Expected: PASS

### Phase 8 — Budget Checkpoint

- Silas logs Pro quota usage
- Silas verifies budget data accuracy (if telemetry reader built)
- Silas compares V&V ledger values against actual Anthropic dashboard

### Phase 8 — Director Live Testing

| # | Test | Expected |
|---|------|----------|
| D8.1 | Leave dashboard open 60s | Status cards update without manual refresh |
| D8.2 | Check "Updated Xs ago" text | Each card shows relative timestamp |
| D8.3 | Click refresh icon | Data updates immediately |
| D8.4 | Start a Claude Code session | New session appears on /sessions within 60s |
| D8.5 | Check budget page | Values shown with "last updated" timestamp |
| D8.6 | Check roadmap dates | DD-MM-YYYY format |
| D8.7 | Check session chart dates | DD-MM format |
| D8.8 | Check session rows | Title/summary text visible |

### Phase 8 — Git Commits

1. `feat: add API route endpoints for dashboard, agents, budget, sessions`
2. `feat: build telemetry reader for automated budget data` (or `feat: add manual budget update mechanism`)
3. `fix: rebuild session logger hook for Windows compatibility`
4. `feat: add client-side polling with usePolling hook`
5. `feat: add visual heartbeat indicators and last-updated timestamps`
6. `feat: add session titles and summaries to session rows`
7. `fix: update date formats to DD-MM-YYYY per Director request`

**Gate to Phase 9:** Director confirms data freshness issue is resolved. Viktor QA: PASS.

---

## Phase 9 — Chat & UX Polish

> *"Make Vena complete."*

**Goal:** Chatbox UI, PTY auto-start, branding, interactive roadmap.
**Duration:** 2–3 sessions
**Primary Owner:** Orchestrator + Nova
**Supporting:** Viktor (security review for chat), Silas (budget check)

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
- [ ] Messages formatted with markdown support
- [ ] Bridge to PTY: writes to PTY stdin, reads responses
- [ ] Design follows existing tokens: `border-vena-border`, `bg-vena-surface-raised`

**MVP scope (strict):** Input, display, PTY bridge. No streaming, no persistence, no markdown rendering beyond basic formatting. Those are Sprint 3.

**Smoke check:** Playwright screenshot of split view. Type message, receive response.

---

#### 9.2 — Build: PTY Server Auto-Start

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | None |
| **Files** | `package.json` |

Current state: `dev:full` script already uses `concurrently` to run both Next.js and PTY server.

- [ ] Swap scripts: `"dev"` → runs both (currently `dev:full`), `"dev:next"` → runs Next.js only
- [ ] Ensure graceful shutdown: PTY server stops when Next.js stops
- [ ] Update README and any docs referencing `npm run dev`

**Smoke check:** Run `npm run dev` → navigate to /chat → terminal connects automatically.

---

#### 9.3 — Enhancement: VenaOS Branding & Version Text

| Field | Detail |
|-------|--------|
| **Owner** | Nova + Orchestrator |
| **Dependencies** | None |
| **Files** | `src/components/Sidebar.tsx` |

- [ ] Change "Vena" → "VenaOS" in sidebar header (desktop + mobile top bar)
- [ ] Version badge: `text-[10px]` → `text-micro` (11px, +1 size)
- [ ] Version color: `text-vena-text-muted` → `text-vena-text-secondary` (brighter)
- [ ] Update version text from `v0.1` to `v0.2-mvp`

**Smoke check:** Playwright screenshot — "VenaOS" visible, version text clearly readable.

---

#### 9.4 — Enhancement: Roadmap Phase Expand/Collapse

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Nova |
| **Dependencies** | None |
| **Files** | `src/app/roadmap/page.tsx` |

- [ ] All phases are collapsible — click header to toggle task list
- [ ] Current/next phase expanded by default, others collapsed
- [ ] Chevron icon: right (collapsed) → down (expanded)
- [ ] Smooth height transition animation
- [ ] `aria-expanded` attribute for accessibility
- [ ] Requires converting component to `"use client"` for `useState`

**Smoke check:** Playwright screenshot showing expanded + collapsed phases.

---

#### 9.5 — Enhancement: Phase Detail Panels

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator |
| **Dependencies** | 9.4 (expand/collapse provides UI space) |
| **Files** | `src/app/roadmap/page.tsx`, `src/types/index.ts`, `src/lib/roadmap.ts` |

- [ ] Extend `RoadmapPhase` type with optional: `timeSpent`, `usageSpent`, `model`, `bugs`, `notes`
- [ ] Parse from additional markdown content or metadata section in roadmap
- [ ] Display in expanded phase panel
- [ ] Lower priority — show what data is readily available, mark rest as N/A

**Smoke check:** Playwright screenshot of expanded phase with metadata.

---

### Phase 9 — QA Checkpoint

**Round 1:**
- Viktor security review on chatbox (input sanitization, no XSS via message display)
- Viktor security review on PTY auto-start (no new attack surface)
- Viktor checks branding changes don't break responsive layout
- Viktor tests expand/collapse accessibility (`aria-expanded`, keyboard navigation)

**Round 2:**
- Viktor verifies all fixes
- Full build + lint + test pass
- Expected: PASS

### Phase 9 — Budget Checkpoint

- Silas logs Pro quota usage (Phase 9 is feature-heavy — monitor closely)

### Phase 9 — Director Live Testing

| # | Test | Expected |
|---|------|----------|
| D9.1 | Run `npm run dev` | Both Next.js and PTY server start (see terminal output) |
| D9.2 | Navigate to /chat | Terminal connects automatically, green status dot |
| D9.3 | Chatbox visible | Split view: terminal + chatbox side by side |
| D9.4 | Send message in chatbox | Message appears in history, Claude responds |
| D9.5 | Check sidebar branding | "VenaOS" shown, version text clearly visible |
| D9.6 | Click roadmap phase | Task list expands with animation |
| D9.7 | Click again | Task list collapses |
| D9.8 | Test on mobile | Split chat view works on mobile viewport |

### Phase 9 — Git Commits

1. `feat: add chatbox UI component with split view on chat page`
2. `feat: auto-start PTY server with npm run dev`
3. `feat: update branding to VenaOS with improved version visibility`
4. `feat: add expand/collapse to roadmap phase cards`
5. `feat: add phase detail metadata panels`

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

- Owner: Viktor
- Run complete 9-step pipeline on every page and every new feature
- Pages: Dashboard, Agents, Agent Detail, Budget, Roadmap, Sessions, Chat
- New code: API routes, polling hooks, chatbox, telemetry reader

#### 10.2 — Playwright End-to-End Tests

| Field | Detail |
|-------|--------|
| **Owner** | Orchestrator + Viktor |
| **Files (create)** | `tests/e2e/*.spec.ts` |

- [ ] Navigation: all sidebar links work
- [ ] Dashboard: status cards render with data, auto-refresh works
- [ ] Agents: cards render, click → detail page
- [ ] Budget: metric cards show values
- [ ] Roadmap: phases render, expand/collapse
- [ ] Sessions: session list renders with titles
- [ ] Chat: terminal connects (requires PTY server)
- [ ] Responsive: mobile sidebar opens/closes
- [ ] Data refresh: polling updates data after interval

#### 10.3 — Fix All QA Findings

- Owner: Orchestrator (code), Nova (design)
- Fix all bugs flagged by Viktor in 10.1
- Re-run affected QA steps after fixes

#### 10.4 — Budget Reconciliation

- Owner: Silas
- Compare `budget-ledger.json` against actual Anthropic dashboard
- Update ledger if discrepancies found
- Verify alert level calculation is correct
- Document any discrepancies

#### 10.5 — Performance Pass

- Owner: Orchestrator
- [ ] All pages load < 2 seconds on localhost
- [ ] No visible layout shift
- [ ] Polling doesn't cause memory leaks (check DevTools over 5 minutes)
- [ ] No unnecessary re-renders (React DevTools profiler)
- [ ] Bundle size check: `npm run build` output reasonable

#### 10.6 — Director Testing Round 2

- Owner: Director
- Full testing using Sprint 2 Testing Plan (see below)
- Verdict determines: PASS (release), PASS WITH NOTES (release with known issues), FAIL (another round)

#### 10.7 — MVP Release Preparation

If Director verdict is PASS or PASS WITH NOTES:
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

## Risk Register

| # | Risk | Probability | Impact | Contingency |
|---|------|-------------|--------|-------------|
| R1 | **Claude Code local telemetry doesn't exist** | Medium-High | High | Manual ledger update workflow. Silas updates at session bookends via script or API route. Hook-based estimation for session counts/durations. Show "Last updated: [timestamp]" on budget page. Research CLI `--usage` flags as secondary source. |
| R2 | **Session logger hook broken on Windows** | High | Medium | Rewrite `session-logger.sh` as `session-logger.mjs` (Node.js). Use `node:fs` and `node:path` instead of bash commands. Update settings to `node .claude/hooks/session-logger.mjs`. |
| R3 | **Client-side polling causes performance issues** | Low | Medium | Reduce frequency (60s instead of 30s). Add Page Visibility API check (don't poll hidden tabs). Request deduplication. |
| R4 | **PTY auto-start conflicts with Next.js** | Low | Low | Keep `dev:full` as recommended command. Add clear documentation. `concurrently` already works. |
| R5 | **Chatbox UI scope creep** | Medium-High | Medium | Strict MVP: message input, display, PTY bridge. No markdown rendering, no streaming, no history persistence. Sprint 3 features. |
| R6 | **Phase 7 Gate Meeting changes the roadmap** | Medium | Variable | Phases 8–10 designed with modular tasks — individual items can be added/removed without restructuring. Gate meeting exists specifically to handle this. |

---

## MVP Success Criteria

All 13 must pass for release:

| # | Criterion | Measured by |
|---|-----------|-------------|
| 1 | Dashboard status cards auto-update within 60s | Director live test |
| 2 | Active agents show green dots within 30s of activation | Director live test |
| 3 | New Claude Code sessions appear on /sessions within 60s | Director live test |
| 4 | Budget page shows accurate values (or "manually maintained" with timestamp) | Silas reconciliation |
| 5 | `npm run lint` → 0 errors, 0 warnings | CI check |
| 6 | `npm run build` → clean | CI check |
| 7 | `npm test` → all pass | CI check |
| 8 | `npx playwright test` → all pass | CI check |
| 9 | Chatbox UI: send message, receive response (no manual PTY start) | Director live test |
| 10 | `npm run dev` starts both Next.js and PTY server | Director live test |
| 11 | "VenaOS" visible in sidebar, version text readable | Director live test |
| 12 | Roadmap phases expand/collapse to show tasks | Director live test |
| 13 | Viktor verdict: PASS or PASS WITH NOTES | QA report |

---

## Director's Sprint 2 Testing Plan

### Prerequisites

| # | Step | Details |
|---|------|---------|
| 1 | Install dependencies | `npm install` |
| 2 | Start dev server | `npm run dev` — confirm **both** Next.js AND PTY server start |
| 3 | Open browser | Navigate to `http://localhost:3000` |

---

### Section S2-1 — Regression: Sprint 1 Critical Fixes

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| S2-1.1 | Agent active status | Start a Claude Code session, wait 30s — at least one agent shows green "Active" dot | | |
| S2-1.2 | Phase card | Dashboard shows correct current phase or "All phases complete" | | |
| S2-1.3 | Lint check | `npm run lint` → 0 errors, 0 warnings | | |
| S2-1.4 | Agent active count | Dashboard Agents card shows correct active count | | |
| S2-1.5 | Agent status colors | Active = green dot, idle = gray dot | | |

---

### Section S2-2 — Data Freshness (Phase 8)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| S2-2.1 | Dashboard auto-refresh | Leave open 60s — cards update without manual refresh | | |
| S2-2.2 | "Updated Xs ago" | Each status card shows relative timestamp | | |
| S2-2.3 | Manual refresh | Click refresh icon — data updates immediately | | |
| S2-2.4 | Session logging | Start new Claude Code session — appears on /sessions within 60s | | |
| S2-2.5 | Budget data | Budget page shows values with "last updated" timestamp | | |
| S2-2.6 | Roadmap dates | DD-MM-YYYY format on completed phases | | |
| S2-2.7 | Session chart dates | DD-MM format on axis labels | | |
| S2-2.8 | Session row content | Sessions show title/summary text | | |

---

### Section S2-3 — Chat & Terminal (Phase 9)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| S2-3.1 | PTY auto-start | `npm run dev` starts both Next.js and PTY server | | |
| S2-3.2 | Terminal auto-connect | Navigate to /chat — terminal connects, green status dot | | |
| S2-3.3 | Chatbox UI | Chatbox panel visible alongside terminal | | |
| S2-3.4 | Send message | Type message in chatbox, press send — appears in history | | |
| S2-3.5 | Receive response | Claude responds to message in chatbox | | |

---

### Section S2-4 — UX Polish (Phase 9)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| S2-4.1 | VenaOS branding | Sidebar shows "VenaOS" instead of "Vena" | | |
| S2-4.2 | Version visibility | Version text clearly readable (not barely visible) | | |
| S2-4.3 | Roadmap expand | Click any phase card — task list expands with animation | | |
| S2-4.4 | Roadmap collapse | Click again — task list collapses | | |
| S2-4.5 | Session row details | Rows show title/summary, not just ID prefix | | |

---

### Section S2-5 — Cross-Cutting

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| S2-5.1 | Build | `npm run build` → clean | | |
| S2-5.2 | Lint | `npm run lint` → 0 errors, 0 warnings | | |
| S2-5.3 | Unit tests | `npm test` → all pass | | |
| S2-5.4 | E2E tests | `npx playwright test` → all pass | | |
| S2-5.5 | Mobile responsive | All new features work on mobile viewport | | |
| S2-5.6 | No console errors | Browser DevTools — no red errors | | |

---

### Post-Testing Summary Template

```
VENA v0.2.0-mvp — Director's Sprint 2 Testing Report
Date: [DD-MM-YYYY]

Total tests: 28
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
