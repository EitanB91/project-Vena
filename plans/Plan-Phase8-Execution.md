# Phase 8 Execution Plan — "Make Vena Breathe"

**Created:** 2026-03-22 (Session `9fd7a57b`)
**Phase:** 8 — Live Telemetry Pipeline
**Sprint:** 2 (MVP)
**Last Updated:** 2026-03-24 (Session 6 — 8D V&V sync)

---

## Structure

**4 sub-phases, 8 sessions, 3 approval gates.**

| Sub-Phase | Sessions | What | Ends With |
|-----------|----------|------|-----------|
| **8A** Foundation | 1–2 | Telemetry reader + formatting utils | QA + Director test + APPROVAL |
| **8B** API & Polling | 3–4 | 5 API routes + polling hook + page overhauls + charts + dates | QA + Director test + APPROVAL |
| **8C** Chart Enhancements | 5 | Burn rate 7d/30d toggle + tool calls metric + DailyUsage toolCalls | Code + smoke check |
| **8D** V&V Sync & Exit | 6–7 | Automated V&V log entries + final QA + Director full test | QA + Director FULL test + PHASE 8 EXIT APPROVAL |

24 new files, 7 modified, 11 commits, 15 features delivered.

---

## Session Map

| Session | Sub-Phase | Tasks | Owner | Ends With | Status |
|---------|-----------|-------|-------|-----------|--------|
| **1** | 8A — Foundation | 8.1 (Telemetry Reader) + 8.3 (Formatting) | Orchestrator | Code + tests | SHIPPED |
| **2** | 8A — QA & Approval | Viktor full QA + Director live test | Viktor → Director | **GATE: Director approval** | SHIPPED |
| **3** | 8B — API & Polling | 8.2 + 8.4 + 8.5–8.7 + 8.9 + 8.11 (page overhauls, charts, dates) | Orchestrator | Code + tests | SHIPPED |
| **4** | 8B — QA & Approval | Viktor QA (security-critical) + Director live test | Viktor → Director | **GATE: Director approval** | SHIPPED |
| **5** | 8C — Chart Enhancements | 8.8 (F7 30d toggle, F17 tool calls metric, DailyUsage toolCalls) | Orchestrator | Code + smoke check | SHIPPED |
| **6** | 8D — V&V Sync | 8.10 (Automated V&V Log Entries) | Orchestrator + Silas | Code + tests | SHIPPED |
| **7** | 8D — Final QA & Approval | Viktor full Phase 8 sweep + Director full live test | Viktor → Director | **GATE: Phase 8 exit** | PENDING |

---

## Task Registry

| Task | Name | Features | Owner | Sub-Phase | Status |
|------|------|----------|-------|-----------|--------|
| 8.1 | Telemetry Reader Core | — | Orchestrator | 8A | DONE |
| 8.2 | API Route Endpoints | — | Orchestrator | 8B | DONE |
| 8.3 | Smart Token Formatting | F19 | Orchestrator | 8A | DONE |
| 8.4 | Client-Side Polling | — | Orchestrator + Nova | 8B | DONE |
| 8.5 | Budget Page Rework | F20 | Orchestrator + Silas | 8B | DONE |
| 8.6 | Dashboard Overhaul | F1, F2, F4 | Orchestrator + Nova | 8B | DONE |
| 8.7 | Sessions Page Overhaul | F3, F13, F14 | Orchestrator + Nova | 8B | DONE |
| 8.8 | Telemetry Charts | F7, F8, F17 | Orchestrator + Silas + Nova | 8C | DONE |
| 8.9 | Phase Token Report | F6 | Orchestrator + Silas | 8B | DONE |
| 8.10 | Automated V&V Log Entries | F9 | Orchestrator + Silas | 8D | DONE |
| 8.11 | Date Format Updates | — | Orchestrator | 8B | DONE |

---

## QA Gates

### Gate 1 — Sub-Phase 8A (Session 2)

- Viktor full 9-step QA on telemetry reader + formatting
- Security review: S1–S6 checklist
- Director live test: telemetry data reads correctly
- **Status: PASSED** — Viktor QA PASS, Director approved, pushed as `bb3cead`

### Gate 2 — Sub-Phase 8B (Session 4)

- Viktor QA on API routes (security-critical), polling hook, page overhauls
- Security review: path traversal, slug injection, client bundle audit, error messages
- Director live test: D8.1–D8.5 (polling, pages, API responses)
- **Status: PASSED** — Viktor QA PASS, Director approved, pushed as `02c3ad8`

### Gate 3 — Phase 8 Exit (Session 7)

- Viktor full Phase 8 sweep — all code, all features
- Director full live test: D8.1–D8.12
- **Status: PENDING**

---

## Git Commits (Actual)

| Commit | Sub-Phase | Description |
|--------|-----------|-------------|
| `8fa2511` | 7 (cleanup) | fix: Phase 7 — lint fixes, agent status to data layer, telemetry research |
| `bb3cead` | 8A | feat: Phase 8A — telemetry reader core and smart formatting utilities |
| `02c3ad8` | 8B | feat: Phase 8B — API routes, live polling, dashboard/sessions/budget overhauls, telemetry charts |

---

## Director Live Tests

| # | Test | Expected | Sub-Phase |
|---|------|----------|-----------|
| D8.1 | Leave dashboard open 60s | Status cards update without manual refresh | 8B |
| D8.2 | Live Session Pulse card | Shows active session with duration counter, breathing animation | 8B |
| D8.3 | Token Breakdown chart | Stacked bar renders — output tokens visually distinct from cache | 8B |
| D8.4 | Model Usage donut | Shows opus/sonnet split | 8B |
| D8.5 | Sessions page | Timeline bars, token counts, model badges visible | 8B |
| D8.6 | Budget page — Pro panel | Shows real telemetry data, session count, duration gauge | 8B |
| D8.7 | Budget page — API panel | Shows V&V ledger data (existing) | 8B |
| D8.8 | Burn rate chart | Shows daily token output trend, 7d/30d toggle | 8C |
| D8.9 | Usage over time graph | Switchable by tokens/messages/sessions/tool calls, avg reference line | 8C |
| D8.10 | Phase token report | Shows token usage per completed phase | 8B |
| D8.11 | Roadmap dates | DD-MM-YYYY format | 8B |
| D8.12 | Session chart dates | DD-MM format | 8B |

---

## 8C Session 5 — Change Summary

**What was done:**
- Added `toolCalls: number` to `DailyUsage` type
- Updated `buildDailyUsage()` to aggregate `toolCallCount` per day
- F7: Added 7d/30d window toggle to Burn Rate bar chart (was fixed 7-day only)
- F17: Added "Tool Calls" as 4th switchable metric in Usage Over Time chart
- Updated server-side initial data to pass 30 days (was 7) for burn rate
- Improved average reference line formatting for millions-scale values
- Added test: `daily usage includes toolCalls aggregation`
- **112 tests passing**, lint clean, build clean

---

## 8D Session 6 — Change Summary

**What was done:**
- F9: Automated V&V log entries — new `src/lib/vv-sync.ts` module
- Detects ended telemetry sessions (not active + mtime > 10 min stale)
- Generates SessionStart + SessionEnd + SessionSummary entries per session
- Categories inferred from git commit prefixes (`feat:` → `code_build`, `test:` → `tests`, etc.)
- Idempotent deduplication via `source: "telemetry-sync"` marker
- Append-only writes to `.claude/vault-and-valve/usage-log.jsonl`
- Integrated lazily into `/api/telemetry` route (runs on each 60s poll cycle)
- Entries compatible with existing `parseUsageLog` reader
- 17 new tests in `tests/lib/vv-sync.test.ts`
- Smoke tested: 18 sessions synced on first call, 0 duplicates on second
- **129 tests passing**, lint clean, build clean
