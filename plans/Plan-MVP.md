# Plan — MVP (v0.1.0)

## Goal

Ship a working local dashboard that can read a Claude Code project directory and display:
1. Agent identities and memory
2. Budget status (V&V data)
3. Roadmap progress (parsed from markdown)
4. Session history timeline

**Out of scope for MVP:** CLI passthrough chat, charts, responsive design.

## Phases Covered

- **Phase 0** — Kickoff & Scaffold
- **Phase 1** — Dashboard Shell & Navigation
- **Phase 2** — File Readers & Data Layer
- **Phase 3** — Agent Dashboard (partial — list + detail)

## Target

- Version: v0.1.0
- Tech: Next.js 16 + TypeScript + Tailwind v4
- Runs locally only (`npm run dev`)

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data layer | Server Components reading fs | No database needed — `.claude/` files are the source of truth |
| Styling | Tailwind v4 + design tokens | Fast iteration, consistent with Nova's design system |
| Router | App Router only | Modern Next.js standard, server-first |
| Charts | Deferred to Phase 4 | MVP shows raw data; charts are polish |
| Chat | Deferred to Phase 5 | xterm.js is a separate feature module |

## Success Criteria

1. `npm run dev` launches without errors
2. Sidebar navigates between pages
3. Agent page lists agents from a real `.claude/` directory
4. Budget page shows ledger data
5. Roadmap page renders phases and tasks
6. Viktor QA passes with PASS or PASS WITH NOTES
7. Director approves for v0.1.0 tag
