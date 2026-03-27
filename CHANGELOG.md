# Changelog

All notable changes to Project Vena are documented in this file.

## [0.2.0] — 2026-03-28 (MVP)

The MVP release. Local-first Claude Code project dashboard with live telemetry,
agent monitoring, budget tracking, and CLI chat.

### Features

- **Dashboard** — status cards, roadmap progress, team panel with live agent
  status (30s polling)
- **Agents** — identity cards, memory snapshots, project scope, personality
  key phrases, telemetry-based active detection
- **Budget** — dual-panel view (Pro telemetry + API ledger), burn rate charts
  with 7d/30d toggle, duration gauge, alert thresholds
- **Roadmap** — interactive phase viewer with expand/collapse, task progress
  bars, feature registry, plan document browser
- **Sessions** — session timeline with daily activity chart, category pills,
  phase badges, model tags, per-session token breakdown
- **Chat** — embedded terminal via xterm.js + PTY server with auto-start

### Technical Highlights

- **Live telemetry pipeline** — reads `~/.claude/projects/` JSONL session files
  for real-time token usage, session activity, and model distribution
- **5 API routes** with client-side polling (Page Visibility API aware)
- **No database** — reads `.claude/` files directly. Local only, no cloud,
  no auth
- **VenaOS branding** — dark mission-control aesthetic with Nova's design
  token system
- **V&V integration** — budget ledger + usage log sync with telemetry data,
  category inference, phase correlation
- **Security hardened** — PTY server with command allowlist, path confinement,
  no credential exposure

### Testing

- 129 unit tests (Vitest)
- 56 end-to-end tests (Playwright) across 7 pages
- 133-item Director test plan — all passing
- Viktor QA pipeline: 9-step review with security audit

### Build

- Next.js 16 (App Router) + TypeScript strict mode
- Tailwind CSS v4
- Recharts for data visualization
- xterm.js for terminal emulation

### Phases Completed

| Phase | Title | Date |
|-------|-------|------|
| 0 | Kickoff & Scaffold | 2026-03-19 |
| 1 | Dashboard Shell & Navigation | 2026-03-19 |
| 2 | File Readers & Data Layer | 2026-03-19 |
| 3 | Agent Dashboard | 2026-03-20 |
| 4 | Charts & Live Pages | 2026-03-20 |
| 5 | CLI Passthrough Chat | 2026-03-21 |
| 6 | Responsive Polish & v1.0 | 2026-03-22 |
| 7 | Telemetry Research | 2026-03-23 |
| 8 | Live Telemetry Pipeline | 2026-03-24 |
| 9 | Chat & UX Polish | 2026-03-25 |
| 10 | QA, Stabilization & MVP Release | 2026-03-28 |

### Team

- **Director** (Eitan) — project lead
- **The Orchestrator** (Claude) — main agent
- **Nova** — design lead, visual language, design tokens
- **Viktor** — QA gate owner, security reviewer
- **Silas Sterling** — budget & resource lead (Vault & Valve)
