# Roadmap — Project Vena

<!-- vena:roadmap -->

## Vision

Vena is a local web dashboard for monitoring Claude Code projects. It reads `.claude/` directories and surfaces agent identities, budget data, roadmaps, session history, and provides CLI passthrough chat.

## Phases

<!-- vena:phase id="0" status="complete" -->
### Phase 0 — Kickoff & Scaffold
**Status:** Complete (2026-03-19)
**Goal:** Project setup, team alignment, foundational scaffold.

- [x] Initialize git repo + create GitHub repo
- [x] Scaffold Next.js project with TypeScript + Tailwind
- [x] Set up project structure and CLAUDE.md
- [x] Create plans/ directory with Plan-MVP.md and Roadmap
- [x] Adapt agent identity files (Nova, Viktor, Silas)
- [x] Copy Playwright CLI skill + adapt hooks
- [x] Create TECH-GUIDE.md education document
- [x] Nova: define design tokens in tailwind.config.ts / globals.css
- [x] Viktor: spot-check scaffold conventions
- [x] Director Checkpoint #1
<!-- /vena:phase -->

<!-- vena:phase id="1" status="complete" -->
### Phase 1 — Dashboard Shell & Navigation
**Status:** Complete (2026-03-19)
**Goal:** App shell with sidebar navigation, dark theme, layout system.

- [x] Sidebar component with route links
- [x] Dark theme implementation (design tokens from Nova)
- [x] Root layout with sidebar + main content area
- [x] Placeholder pages for each route (agents, budget, roadmap, sessions, chat)
- [x] Viktor QA review — verdict: PASS
- [x] Director Checkpoint #2
<!-- /vena:phase -->

<!-- vena:phase id="2" status="complete" -->
### Phase 2 — File Readers & Data Layer
**Status:** Complete (2026-03-19)
**Goal:** Server-side utilities that read `.claude/` directories and parse markdown/JSON.

- [x] Project scanner — discover `.claude/` directories
- [x] Agent reader — parse identity and memory markdown files
- [x] Budget reader — parse budget-ledger.json and usage-log.jsonl
- [x] Roadmap parser — parse markdown with `<!-- vena:* -->` markers
- [x] Session reader — parse usage-log.jsonl for session timeline
- [x] TypeScript types for all data models
- [x] Vitest test runner + 39 unit tests
- [x] Viktor QA review — verdict: PASS (2 rounds)
- [x] Director Checkpoint #3
<!-- /vena:phase -->

<!-- vena:phase id="3" status="complete" -->
### Phase 3 — Agent Dashboard
**Status:** Complete (2026-03-20)
**Goal:** Display agent cards with identity, status, and memory summaries.

- [x] Agent list page with card grid
- [x] Agent detail page with full identity + memory
- [x] Status indicators (active/idle based on session data)
- [x] Viktor QA review — verdict: PASS (2 rounds)
- [x] Director Checkpoint #4
<!-- /vena:phase -->

<!-- vena:phase id="4" status="complete" -->
### Phase 4 — Budget & Roadmap Views
**Status:** Complete (2026-03-20)
**Goal:** Visual budget dashboard and interactive roadmap viewer.

- [x] Budget overview — remaining balance, alert level, usage chart
- [x] Session timeline — visual log of sessions with categories
- [x] Roadmap viewer — render phases and tasks from parsed markdown
- [x] Plan viewer — list and display plan documents
- [x] Charts integration (Recharts)
- [x] Viktor QA review — verdict: PASS
- [x] Director Checkpoint #5
<!-- /vena:phase -->

<!-- vena:phase id="5" status="complete" -->
### Phase 5 — CLI Passthrough Chat
**Status:** Complete (2026-03-20)
**Goal:** Embedded terminal for Claude CLI interaction.

- [x] xterm.js integration
- [x] CLI session management
- [x] Theme matching with dashboard
- [x] Security hardening (S1–S8: localhost binding, auth, rate limiting, input validation, resource caps)
- [x] Viktor QA review — verdict: PASS (2 rounds)
- [x] Director Checkpoint #6
<!-- /vena:phase -->

<!-- vena:phase id="6" status="complete" -->
### Phase 6 — Polish & v1.0
**Status:** Complete (2026-03-21)
**Goal:** Responsive layout, animations, error states, documentation.

- [x] Responsive design pass (collapsible mobile sidebar, responsive padding)
- [x] Loading states (Skeleton components matching page layouts)
- [x] Error boundaries (ErrorDisplay component)
- [x] Empty state designs (EmptyState component, compact inline variants)
- [x] README.md with setup instructions
- [x] Viktor QA review — verdict: PASS (2 rounds)
- [x] Director testing — verdict: FAIL (data freshness issues → Sprint 2)
<!-- /vena:phase -->

<!-- vena:phase id="7" status="complete" -->
### Phase 7 — Research & Foundation Fixes
**Status:** Complete (2026-03-22)
**Goal:** Research Claude Code telemetry, fix lint errors, refactor agent status to data layer.

- [x] Research: Claude Code local telemetry (P0 — Director mandate)
- [x] Research: Data refresh patterns for Next.js App Router
- [x] Research: Session logger hook diagnosis
- [x] Fix: All 5 lint errors (Date.now purity, setState in effect, unused var)
- [x] Fix: Move agent status computation to data layer
- [x] QA checkpoint
- [x] GATE: Phase 7 team meeting — finalize Sprint 2 roadmap based on findings
<!-- /vena:phase -->

<!-- vena:phase id="8" status="complete" -->
### Phase 8 — Live Telemetry Pipeline
**Status:** Complete (2026-03-24)
**Goal:** Real-time telemetry data, interactive charts, live session monitoring, budget rework.

- [x] Telemetry reader core (8A) — JSONL parser, streaming, security S1-S6
- [x] Smart token formatting (8A) — human-readable large numbers
- [x] API Route endpoints (8B) — /telemetry, /agents, /budget, /sessions, /dashboard
- [x] Client-side polling (8B) — usePolling hook with Page Visibility API
- [x] Dashboard overhaul (8B) — SessionPulse, TokenChart, ModelDonut, live 30s polling
- [x] Sessions page overhaul (8B) — timeline bars, model tags, per-session tokens
- [x] Budget page rework (8B) — dual panel (Pro telemetry + API ledger), duration gauge
- [x] Phase token report (8B) — cross-references sessions with phase dates
- [x] Date format updates (8B) — DD-MM-YYYY and DD-MM
- [x] Telemetry charts enhanced (8C) — burn rate 7d/30d toggle, tool calls metric, avg baselines
- [x] Automated V&V log entries (8D) — telemetry-to-V&V sync, category inference, idempotent
- [x] Final QA gate + Director full live test (8D)
<!-- /vena:phase -->

<!-- vena:phase id="9" status="in_progress" -->
### Phase 9 — Chat & UX Polish
**Status:** In Progress
**Goal:** Chatbox UI, PTY auto-start, VenaOS branding, interactive roadmap.

- [x] Chatbox UI component (split view with terminal)
- [x] PTY server auto-start with npm run dev
- [x] VenaOS branding & version text polish
- [x] Roadmap phase expand/collapse
- [x] Phase detail metadata panels
- [ ] Viktor QA + Director live test
<!-- /vena:phase -->

<!-- vena:phase id="10" status="planned" -->
### Phase 10 — QA, Stabilization & MVP Release
**Status:** Planned
**Goal:** Comprehensive QA, Playwright e2e tests, Director testing, v0.2.0-mvp release.

- [ ] Full Viktor QA pipeline (all pages + new features)
- [ ] Playwright end-to-end test suite
- [ ] Fix all QA findings
- [ ] Budget reconciliation
- [ ] Performance pass
- [ ] Director testing round 2
- [ ] MVP release preparation (v0.2.0)
<!-- /vena:phase -->

## Feature Registry

| Feature | Phase | Priority | Status |
|---------|-------|----------|--------|
| Project scaffold | 0 | Critical | Complete |
| Design tokens | 0 | Critical | Complete |
| Sidebar navigation | 1 | Critical | Complete |
| Dark theme | 1 | Critical | Complete |
| File readers / parsers | 2 | Critical | Complete |
| Agent dashboard | 3 | High | Complete |
| Budget views | 4 | High | Complete |
| Roadmap viewer | 4 | High | Complete |
| Charts (Recharts) | 4 | Medium | Complete |
| CLI chat (xterm.js) | 5 | Medium | Complete |
| Responsive design | 6 | Medium | Complete |
| Telemetry research | 7 | Critical | In Progress |
| Lint fixes & agent status refactor | 7 | Critical | Planned |
| API route endpoints | 8 | Critical | Planned |
| Client-side polling | 8 | Critical | Planned |
| Telemetry reader | 8 | High | Planned |
| Session logger fix | 8 | High | Planned |
| Visual heartbeat indicators | 8 | Medium | Planned |
| Chatbox UI | 9 | High | Planned |
| PTY auto-start | 9 | Medium | Planned |
| VenaOS branding | 9 | Low | Planned |
| Roadmap expand/collapse | 9 | Medium | Planned |
| Playwright e2e tests | 10 | Critical | Planned |
| MVP release (v0.2.0) | 10 | Critical | Planned |
