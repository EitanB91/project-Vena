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

<!-- vena:phase id="4" status="next" -->
### Phase 4 — Budget & Roadmap Views
**Status:** Planned
**Goal:** Visual budget dashboard and interactive roadmap viewer.

- [ ] Budget overview — remaining balance, alert level, usage chart
- [ ] Session timeline — visual log of sessions with categories
- [ ] Roadmap viewer — render phases and tasks from parsed markdown
- [ ] Plan viewer — list and display plan documents
- [ ] Charts integration (Recharts)
- [ ] Viktor QA review
- [ ] Director Checkpoint #5
<!-- /vena:phase -->

<!-- vena:phase id="5" status="planned" -->
### Phase 5 — CLI Passthrough Chat
**Status:** Planned
**Goal:** Embedded terminal for Claude CLI interaction.

- [ ] xterm.js integration
- [ ] CLI session management
- [ ] Theme matching with dashboard
- [ ] Viktor QA review
- [ ] Director Checkpoint #6
<!-- /vena:phase -->

<!-- vena:phase id="6" status="planned" -->
### Phase 6 — Polish & v1.0
**Status:** Planned
**Goal:** Responsive layout, animations, error states, documentation.

- [ ] Responsive design pass
- [ ] Loading states and error boundaries
- [ ] Empty state designs
- [ ] README.md with setup instructions
- [ ] Final Viktor QA review
- [ ] Director sign-off → v1.0
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
| Budget views | 4 | High | Planned |
| Roadmap viewer | 4 | High | Planned |
| Charts (Recharts) | 4 | Medium | Planned |
| CLI chat (xterm.js) | 5 | Medium | Planned |
| Responsive design | 6 | Medium | Planned |
