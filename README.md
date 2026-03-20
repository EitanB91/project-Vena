# Vena

A local-first web dashboard for monitoring Claude Code projects — agents, budgets, roadmaps, sessions, and CLI chat.

## Features

- **Dashboard** — project overview with status cards, roadmap progress, and team status
- **Agents** — view agent identities, memory snapshots, and activity status
- **Budget** — Vault & Valve budget breakdown, usage charts, and alert thresholds
- **Roadmap** — phase tracker, feature registry, and plan document viewer
- **Sessions** — session history, daily activity charts, and usage categories
- **Chat** — embedded terminal for CLI passthrough via xterm.js + PTY server

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run pty-server` | Start PTY server for CLI chat (port 3001) |
| `npm run dev:full` | Start both Next.js and PTY server together |

## How It Works

Vena reads `.claude/` project directories directly — no database, no cloud, no auth. All data comes from local files:

| Data | Source |
|------|--------|
| Agent identities | `.claude/*/identity.md` |
| Agent memory | `.claude/*/memory.md` |
| Budget ledger | `.claude/vault-and-valve/budget-ledger.json` |
| Usage log | `.claude/vault-and-valve/usage-log.jsonl` |
| Roadmap | `plans/Roadmap-*.md` |
| Plan documents | `plans/*.md` |

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Terminal | xterm.js |
| Testing | Vitest (unit) + Playwright (browser) |

## Project Structure

```
src/
├── app/            — App Router pages and layouts
│   ├── agents/     — agent overview and detail pages
│   ├── budget/     — budget dashboard
│   ├── roadmap/    — roadmap viewer
│   ├── sessions/   — session history
│   └── chat/       — CLI terminal
├── components/     — shared UI components
├── lib/            — server-side file readers and parsers
└── types/          — TypeScript type definitions
server/
└── pty-server.ts   — WebSocket PTY server for terminal chat
plans/              — roadmap and planning documents
tests/              — test files and screenshots
```

## Design

Dark-themed, mission-control aesthetic. All colors, spacing, and typography flow from design tokens defined in `src/app/globals.css`. No light mode.

## License

Private project.
