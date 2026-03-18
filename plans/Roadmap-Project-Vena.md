# Roadmap — Project Vena

<!-- vena:roadmap -->

## Vision

Vena is a local web dashboard for monitoring Claude Code projects. It reads `.claude/` directories and surfaces agent identities, budget data, roadmaps, session history, and provides CLI passthrough chat.

## Phases

<!-- vena:phase id="0" status="in-progress" -->
### Phase 0 — Kickoff & Scaffold
**Status:** In Progress (started 2026-03-19)
**Goal:** Project setup, team alignment, foundational scaffold.

- [x] Initialize git repo + create GitHub repo
- [x] Scaffold Next.js project with TypeScript + Tailwind
- [ ] Set up project structure and CLAUDE.md
- [ ] Create plans/ directory with Plan-MVP.md and Roadmap
- [ ] Adapt agent identity files (Nova, Viktor, Silas)
- [ ] Copy Playwright CLI skill + adapt hooks
- [ ] Create TECH-GUIDE.md education document
- [ ] Nova: define design tokens in tailwind.config.ts / globals.css
- [ ] Viktor: spot-check scaffold conventions
- [ ] Director Checkpoint #1
<!-- /vena:phase -->

<!-- vena:phase id="1" status="planned" -->
### Phase 1 — Dashboard Shell & Navigation
**Status:** Planned
**Goal:** App shell with sidebar navigation, dark theme, layout system.

- [ ] Sidebar component with route links
- [ ] Dark theme implementation (design tokens from Nova)
- [ ] Root layout with sidebar + main content area
- [ ] Placeholder pages for each route (agents, budget, roadmap, sessions, chat)
- [ ] Viktor QA review
- [ ] Director Checkpoint #2
<!-- /vena:phase -->

<!-- vena:phase id="2" status="planned" -->
### Phase 2 — File Readers & Data Layer
**Status:** Planned
**Goal:** Server-side utilities that read `.claude/` directories and parse markdown/JSON.

- [ ] Project scanner — discover `.claude/` directories
- [ ] Agent reader — parse identity and memory markdown files
- [ ] Budget reader — parse budget-ledger.json and usage-log.jsonl
- [ ] Roadmap parser — parse markdown with `<!-- vena:* -->` markers
- [ ] Session reader — parse usage-log.jsonl for session timeline
- [ ] TypeScript types for all data models
- [ ] Viktor QA review
- [ ] Director Checkpoint #3
<!-- /vena:phase -->

<!-- vena:phase id="3" status="planned" -->
### Phase 3 — Agent Dashboard
**Status:** Planned
**Goal:** Display agent cards with identity, status, and memory summaries.

- [ ] Agent list page with card grid
- [ ] Agent detail page with full identity + memory
- [ ] Status indicators (active/idle based on session data)
- [ ] Viktor QA review
- [ ] Director Checkpoint #4
<!-- /vena:phase -->

<!-- vena:phase id="4" status="planned" -->
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
| Project scaffold | 0 | Critical | In Progress |
| Design tokens | 0 | Critical | Pending |
| Sidebar navigation | 1 | Critical | Planned |
| Dark theme | 1 | Critical | Planned |
| File readers / parsers | 2 | Critical | Planned |
| Agent dashboard | 3 | High | Planned |
| Budget views | 4 | High | Planned |
| Roadmap viewer | 4 | High | Planned |
| Charts (Recharts) | 4 | Medium | Planned |
| CLI chat (xterm.js) | 5 | Medium | Planned |
| Responsive design | 6 | Medium | Planned |
