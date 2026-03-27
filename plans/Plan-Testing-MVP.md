# VenaOS MVP — Director's Live Test Plan

Comprehensive manual testing checklist for the Director to validate every feature shipped across Sprint 1 + Sprint 2 (Phases 0–10) before MVP release.

**Version:** v0.2.0
**Date:** 26-03-2026
**Test round:** 2 (Sprint 1 round 1 verdict: FAIL — 7 critical issues)
**Total tests:** 133

**How to use:** Work through each section top-to-bottom. Mark items ✅ or ❌ as you go. Write notes in the **Comments** column — these feed directly into the release decision.

**Legend:**
- 🔄 = Regression test (was broken in Sprint 1, should be fixed now)
- 🆕 = New feature (didn't exist in Sprint 1)
- ⚡ = Performance-sensitive test

---

## Prerequisites

| # | Step | Details |
|---|------|---------|
| P1 | Install dependencies | Run `npm install` in the project root |
| P2 | Start dev server | Run `npm run dev` — confirm no errors. This now auto-starts both Next.js AND the PTY server 🆕 |
| P3 | Open browser | Navigate to `http://localhost:3000` |
| P4 | Verify `.claude/` data exists | The app reads from `.claude/` in the project root. Confirm agent identities, budget ledger, and usage log are present |
| P5 | Verify telemetry directory | Confirm `~/.claude/projects/` exists and contains session JSONL files (this powers live data) 🆕 |

---

## Section 1 — App Shell & VenaOS Branding (8 tests)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 1.1 | Page loads without errors | Dashboard home renders, no blank screen, no console errors |✅ | |
| 1.2 | Dark theme applied | Background is dark (#0a0a0f or similar), text is light, no white-flash on load | ✅| |
| 1.3 | Sidebar visible (desktop) | Left sidebar shows: Dashboard, Agents, Budget, Roadmap, Sessions, Chat |✅ | |
| 1.4 | Sidebar navigation works | Click each link — page changes, active link is highlighted in accent color |✅ | |
| 1.5 | VenaOS logo shown 🔄 | Logo text reads **"VenaOS"** (not plain "Vena") — techy branding | ✅| |
| 1.6 | Version text visible 🔄 | Version "v0.2.0" shown in sidebar — brighter color, readable (not near-invisible gray) | ✅| |
| 1.7 | Sidebar footer | "Project Vena" or equivalent text in sidebar footer |✅ | |
| 1.8 | Geist font rendering | Text uses Geist font family, crisp rendering, no fallback serif/system font visible |✅ | |

---

## Section 2 — Dashboard Home Page (10 tests)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 2.1 | Status cards render | Four cards visible: Phase, Agents, API Budget, Sessions — all show real data |✅ | |
| 2.2 | Phase card correct 🔄 | Shows current phase (Phase 10) or accurate status — NOT stale "Phase 6" |✅ | |
| 2.3 | Agents card — total count | Shows correct total agent count matching `.claude/` agent directories ✅ | |
| 2.4 | Agents card — active count 🔄 | Active agent count reflects currently active agents (based on telemetry/recent activity) |❌ |when orchestrator worked it showed '1' but when Nova worked it showed '0' |
| 2.5 | Budget card | Shows dollar amount and alert level. Color matches threshold (green/yellow/red) | ✅| |
| 2.6 | Sessions card | Shows session count and total minutes. Numbers are plausible and up-to-date | ✅| |
| 2.7 | Roadmap progress panel | Shows phases with progress bars and percentage. Reflects actual phase statuses | ✅| |
| 2.8 | Team panel — agents listed | Shows all agents with avatar initials, name, role | ✅| |
| 2.9 | Team panel — active pulse 🔄 | Active agents have a pulsing green dot; idle agents have gray/dim dot | ❌| while nova was active it stayed gray|
| 2.10 | Live polling 🆕 | Wait 30 seconds on dashboard — data should auto-refresh without manual page reload |✅ | |

---

## Section 3 — Agents Page (9 tests)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 3.1 | Navigate to /agents | Page loads, shows "Agents" heading with description | ✅| |
| 3.2 | Agent count stats 🔄 | Shows "Total Agents" and "Active" counts — active count is accurate per telemetry | ❌| active num is '0' althogh nova is active|
| 3.3 | Agent cards render | Grid of cards — one per agent (Nova, Viktor, Silas, etc.) |✅ | |
| 3.4 | Card content | Each card shows: name, role, color-coded avatar, status indicator | ✅| |
| 3.5 | Active status detection 🔄 | Agents with recent activity show active status (green indicator, not permanently gray) | ✅| |
| 3.6 | Click agent card | Navigates to agent detail page (`/agents/[name]`) | ✅| |
| 3.7 | Agent detail page | Shows full identity info (name, role, description) and memory content | ✅| |
| 3.8 | Back navigation | Browser back button returns to agent list correctly | ✅| |
| 3.9 | Empty state | If you temporarily rename `.claude/` — shows "No agents found" empty state | ✅| |

---

## Section 4 — Budget & Telemetry Charts (14 tests)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 4.1 | Navigate to /budget | Page loads, shows "Budget" heading | ✅| |
| 4.2 | Metric cards | Four cards: Remaining Balance, Usable Budget, Floor (Reserved), Alert Level |✅ | |
| 4.3 | Dollar amounts match | Values match what's in `.claude/vault-and-valve/budget-ledger.json` | ✅| |
| 4.4 | Alert level indicator | Colored dot + text (Normal/Warning/Critical/Locked) matches threshold calculation | ✅| |
| 4.5 | Budget breakdown chart | Recharts pie/donut chart shows usable vs floor vs spent segments | ✅| |
| 4.6 | Chart legend | Legend shows Available (green), Floor (yellow), Spent (red if applicable) | ✅| |
| 4.7 | Burn rate chart 🆕 | Line chart showing 7-day and 30-day burn rate trends | ✅| |
| 4.8 | Daily usage chart 🆕 | Bar chart showing daily token usage with tool calls metric | ✅| |
| 4.9 | Token usage by phase 🆕 | Report/chart showing token consumption broken down by project phase | ✅| |
| 4.10 | Live telemetry data 🆕 🔄 | Budget data reflects real usage from telemetry JSONL — not just static ledger | ✅|not sure about the Bar chart showing daily token usage  |
| 4.11 | Usage bar colors | Green <50%, yellow 50-80%, red >80% — colors match thresholds | ✅| |
| 4.12 | Reset timestamps | Session and weekly reset dates shown and formatted correctly | ✅| data not really looks a live|
| 4.13 | Alert thresholds section | Shows warn %, critical %, and at-floor authority text | ✅| |
| 4.14 | Empty state | Temporarily rename budget-ledger.json — shows "No budget ledger found" | ✅| |

---

## Section 5 — Roadmap Page (12 tests)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 5.1 | Navigate to /roadmap | Page loads, shows "Roadmap" heading |✅ | |
| 5.2 | Phase/feature counts | Stats show correct completed phase count (should reflect Phases 0–9 complete, 10 in progress) and total features | ✅| |
| 5.3 | Vision section | Displays the roadmap vision text | ✅| |
| 5.4 | Phase timeline cards | One card per phase (0–10), each with title, goal, status badge | ✅| |
| 5.5 | Phase progress bars | Each phase shows task count and completion percentage bar | ✅| |
| 5.6 | Status colors | Complete = green, In Progress = accent/blue with pulse, Planned = gray |✅ | |
| 5.7 | Interactive collapse/expand 🆕 | Click a phase card — it expands to show task checklist. Click again to collapse | ✅| |
| 5.8 | Current phase tasks | The in-progress phase (10) shows expanded task checklist with done/remaining items | ❌| showing the tasks but the status is not changed.|
| 5.9 | Completed date format 🔄 | Completed phases show their completion date in DD-MM-YYYY format | ✅| |
| 5.10 | Feature registry table | Table with Feature, Phase, Priority, Status columns | ✅| |
| 5.11 | Priority colors | Critical = red, High = yellow, Medium = gray | ✅| |
| 5.12 | Plan documents section | Shows plan files (Plan-MVP.md, Roadmap, etc.) with file icon and line count | ✅| |

---

## Section 6 — Sessions & Telemetry (12 tests)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 6.1 | Navigate to /sessions | Page loads, shows "Sessions" heading | ✅| |
| 6.2 | Stats displayed | Total sessions, total minutes, days active counts at top — numbers are plausible | ✅| |
| 6.3 | Daily activity chart 🔄 | Recharts bar chart showing sessions and minutes per day — includes recent days (not stuck at old dates) |❌
 | no such chart in existence here |
| 6.4 | Chart legend | Shows "Sessions" and "Minutes" with color indicators |❌ | no such chart in existence here|
| 6.5 | Live session data 🆕 | Session list reflects data from telemetry JSONL — shows recent sessions, not just old synthetic data | ❌|no such chart in existence here |
| 6.6 | Session list by date | Sessions grouped by date (newest first), with date headers |✅ | |
| 6.7 | Session row details | Each session shows: ID prefix, start→end time, duration, source | ✅| |
| 6.8 | Session title & summary 🔄 | Session rows include a title or summary text describing the session content |❌ | no titles|
| 6.9 | Session categories | Category tags (research, code_build, etc.) displayed as pills — present on sessions (not just one) |❌| no titles|
| 6.10 | Phase tags | Sessions with phase info show phase badge | ❌|didn't see it |
| 6.11 | Active session indicator | Active sessions show pulsing green dot and "active" text | ❌| didn't see it|
| 6.12 | Empty state | With no usage-log.jsonl — shows "No sessions found" | ✅| |

---

## Section 7 — Chat & Terminal (12 tests)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 7.1 | Navigate to /chat | Page loads, shows chat interface |✅ | |
| 7.2 | Chatbox UI visible 🆕 | Chat-style interface (like Claude web/VS Code) — NOT a raw black terminal |✅ | |
| 7.3 | PTY auto-started 🆕 🔄 | Terminal/chat is connected automatically — no manual server startup needed |✅ | |
| 7.4 | Connection status | Shows connection status indicator (Connected = green, Disconnected = red) | ✅| |
| 7.5 | Send a message | Type a message and send — it appears in the chat area | ✅| |
| 7.6 | Receive response | After sending, a response appears (from the PTY/CLI session) |✅ | |
| 7.7 | Chat history | Previous messages in the session remain visible (scrollable history) | ✅| |
| 7.8 | Session ID shown | Session ID appears in header or info area after connection | ✅| |
| 7.9 | New Session button | Click "New Session" — chat resets, new session starts | ✅| |
| 7.10 | Terminal rendering | Terminal/chat area uses dark theme matching the rest of the dashboard |✅ | |
| 7.11 | Keyboard hints | Shows keyboard hint or input placeholder guiding the user | ✅| |
| 7.12 | Graceful disconnect | If PTY server stops — shows disconnected state, no app crash, recovery possible |✅ | |

---

## Section 8 — Live Data Pipeline (10 tests) 🆕

This section tests the Phase 8 telemetry backbone — the system that reads `~/.claude/projects/` JSONL files and feeds live data to the dashboard via API routes and polling.

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 8.1 | API: /api/dashboard | Open in browser/curl — returns JSON with dashboard summary data, no errors |✅ | |
| 8.2 | API: /api/agents | Returns JSON array of agents with name, role, status fields | ✅| |
| 8.3 | API: /api/budget | Returns JSON with budget metrics matching ledger data | ✅| |
| 8.4 | API: /api/sessions | Returns JSON array of sessions with timestamps and metadata | ✅| |
| 8.5 | API: /api/telemetry | Returns telemetry data stream with token usage information |✅ | |
| 8.6 | Polling active ⚡ | Open Network tab in DevTools — see periodic API requests (every 5–30s depending on page) |✅ | |
| 8.7 | Data freshness test | Modify a `.claude/` source file (e.g., edit budget-ledger.json) → wait for poll interval → dashboard reflects the change | ✅| |
| 8.8 | No stale cache ⚡ | Navigate away from a page and back — data is fresh, not showing cached old values | ✅| |
| 8.9 | API error handling | Temporarily rename a data file (e.g., budget-ledger.json) → API returns graceful error, page shows empty/error state, no crash | ✅| |
| 8.10 | API response time ⚡ | API responses return in under 500ms (check Network tab timing) | ✅| |

---

## Section 9 — Responsive Design (10 tests)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 9.1 | Resize to mobile (<768px) | Sidebar collapses, hamburger menu appears in top bar | ✅| |
| 9.2 | Mobile hamburger menu | Click hamburger — sidebar slides in from left with backdrop overlay | ✅| |
| 9.3 | Close mobile sidebar | Click backdrop or close button (X) — sidebar closes | ✅| |
| 9.4 | Navigate on mobile | Click a nav link — sidebar closes, page navigates correctly | ✅| |
| 9.5 | Mobile top bar | Shows "VenaOS" branding, version, and hamburger icon | ✅| |
| 9.6 | Card grid responsive | Status cards stack on mobile (1 col), 2 cols on tablet, 4 on desktop | |✅ |
| 9.7 | Agent grid responsive | 1 col mobile, 2 cols tablet, 3 cols desktop | ✅| |
| 9.8 | Charts responsive | Charts resize correctly, no overflow or clipping | ✅| |
| 9.9 | Chat responsive | Chat/terminal area is usable on mobile — input accessible, messages readable | ✅| |
| 9.10 | Table responsive | Feature registry table scrolls horizontally on small screens | ✅| |

---

## Section 10 — Loading & Error States (7 tests)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 10.1 | Loading skeletons | On first load / slow connection, skeleton placeholders appear briefly |✅ | |
| 10.2 | Error boundary — agents | If agents data throws, error page shows with "Something went wrong" message | ✅| |
| 10.3 | Error boundary — budget | If budget data throws, error page shows with recovery option | ✅| |
| 10.4 | Error boundary — roadmap | If roadmap parse fails, error page shows | ✅| |
| 10.5 | Error boundary — sessions | If sessions data throws, error page shows | ✅| |
| 10.6 | Error boundary — chat | If terminal/chat fails, error page shows | ✅| |
| 10.7 | Empty states consistent | All empty states use the same EmptyState component with icon + message + hint | ✅| |

---

## Section 11 — Cross-Cutting Concerns (12 tests)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 11.1 | Production build | `npm run build` completes with zero errors | | ✅|
| 11.2 | Lint check 🔄 | `npm run lint` passes with **zero errors and zero warnings** (was 5 problems in Sprint 1) | ✅| |
| 11.3 | Unit tests | `npm run test` — all 129 unit tests pass (0 failures) | ✅| |
| 11.4 | E2E tests 🆕 | `npm run test:e2e` — all 56 Playwright tests pass (0 failures) | ✅| |
| 11.5 | No console errors | Check browser DevTools console on every page — no red errors | ✅| |
| 11.6 | No TypeScript warnings | Build output shows no type errors | ✅| |
| 11.7 | Design consistency | All pages use same color tokens, spacing, card styles from Nova's design system | ✅| |
| 11.8 | No dead links | All sidebar links and internal navigation lead to real pages | ✅| |
| 11.9 | Page titles / headings | Each page has correct heading and subheading text | ✅| |
| 11.10 | Accessibility basics | Interactive elements are keyboard-focusable, buttons have labels | ✅| |
| 11.11 | Performance — page load ⚡ | Pages load quickly (<2s), no visible jank or layout shift | ✅| |
| 11.12 | Performance — navigation ⚡ | Client-side navigation between pages is instant, no full page reloads | ✅| |

---

## Section 12 — Data Accuracy Spot-Check (6 tests)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 12.1 | Agent count matches files | Number of agents on dashboard matches actual `.claude/` subdirectories with identity files | ❌| |
| 12.2 | Budget numbers match ledger | Open `budget-ledger.json` in editor — verify displayed dollar values match raw data exactly | ✅| |
| 12.3 | Roadmap phases match markdown | Open `Roadmap-Project-Vena.md` — verify phase count, titles, and task statuses match dashboard | ❌| phase now show real tasks status|
| 12.4 | Session count matches telemetry | Check `~/.claude/projects/` JSONL files — verify session count on dashboard is plausible | ✅| |
| 12.5 | Alert level calculation | Manually calculate usable% from ledger — verify alert level matches threshold rules in CLAUDE.md | ✅| |
| 12.6 | Telemetry token totals 🆕 | Token usage numbers on budget page are consistent with telemetry JSONL data | ✅| |

---

## Section 13 — Sprint 1 Critical Issue Regression (7 tests) 🔄

Every critical issue from the Sprint 1 FAIL verdict is explicitly retested here. **All 7 must pass for MVP release.**

| # | Sprint 1 Issue | What Was Broken | Expected Now | Pass? | Comments |
|---|---------------|-----------------|--------------|-------|----------|
| 13.1 | Active agent count (2.1, 2.3) | Active agents didn't update — Orchestrator + Nova activated but count stayed 0 | Active count reflects recent activity via telemetry data |❌ | |
| 13.2 | Phase card stale (2.2) | Showed "Phase 6" even after phases 7+ were complete | Shows current phase (Phase 10) or accurate status | ✅| |
| 13.3 | Budget vs real usage (4.7) | Claude Code usage section didn't match real usage | Budget page shows telemetry-driven usage data | ✅| |
| 13.4 | Active agent count wrong (2.3) | Dashboard agents card showed wrong active count | Count is accurate and updates with polling | ✅| |
| 13.5 | Active agent pulse (2.8) | Green pulse dot never appeared for active agents | Active agents show pulsing green dot, idle show gray | ✅| |
| 13.6 | Agent page active status (3.2) | Agent page "Active" count and status didn't change for active agents | Agent page reflects correct active/idle status |❌ | |
| 13.7 | Lint failures (10.2) | `npm run lint` failed with 5 problems: 3× Date.now() purity, 1× setState in effect, 1× unused var | `npm run lint` passes with 0 errors, 0 warnings | ✅| |

---

## Section 14 — Sprint 1 Non-Critical Issue Regression (4 tests) 🔄

Non-critical issues from Sprint 1 that were addressed in Phases 7–10.

| # | Sprint 1 Issue | What Was Reported | Expected Now | Pass? | Comments |
|---|---------------|-------------------|--------------|-------|----------|
| 14.1 | No live data updates | Dashboard felt static, no automatic data refresh | Pages poll APIs and auto-refresh data (visible in Network tab) | ✅| |
| 14.2 | Session titles missing | Session rows lacked title and summary text | Sessions show meaningful title/summary (from telemetry or usage log) | ✅| |
| 14.3 | Chat was raw terminal | /chat page was a raw xterm.js terminal, not user-friendly | Chat page has chatbox-style UI (like Claude web interface) | ✅| |
| 14.4 | PTY manual startup | Had to manually run PTY server in a separate terminal — blocking for users | `npm run dev` auto-starts PTY server alongside Next.js | ✅| |

---

## Post-Testing Summary

Fill this out after completing all sections:

```
VenaOS MVP — Director's Testing Report
Date: 26-03-2026
Version: v0.2.0

Total tests: 133
Passed:
Failed:
Skipped:

Sprint 1 regression status: __ / 7 critical fixed, __ / 4 non-critical fixed

Critical issues (BLOCKING — must fix before release):
1.
2.
3.

Non-critical issues (nice to fix, not blocking):
1.
2.
3.

UX/Design observations:
1.
2.
3.

Feature requests / ideas for future sprints:
1.
2.
3.

Overall verdict: [ PASS / PASS WITH NOTES / FAIL ]

Director signature: _______________
Date: _______________
```

---

## Appendix A — Test Environment Info

Record your test environment for reproducibility:

```
OS:
Browser:
Node version:
npm version:
Screen resolution:
Date/time of test:
Git commit hash:
```

---

## Appendix B — Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server + PTY (auto) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run test` | Run 129 unit tests |
| `npm run test:e2e` | Run 56 Playwright e2e tests |
| `curl http://localhost:3000/api/dashboard` | Test dashboard API |
| `curl http://localhost:3000/api/agents` | Test agents API |
| `curl http://localhost:3000/api/budget` | Test budget API |
| `curl http://localhost:3000/api/sessions` | Test sessions API |
| `curl http://localhost:3000/api/telemetry` | Test telemetry API |
