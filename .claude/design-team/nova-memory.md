# Nova — Design Memory: Project Vena

## Project Purpose
Project Vena — a local web dashboard for monitoring Claude Code projects. Modern, minimalistic, sleek high-tech design. Shows agents, budgets, roadmaps, sessions, and conversations.

## Tech Stack Decisions
- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Charts:** Recharts or Chart.js (TBD)
- **Terminal embed:** xterm.js for CLI passthrough chat
- **No database** — reads `.claude/` directory files directly

## Design Token System (approved Phase 0)
All tokens defined in `src/app/globals.css` as CSS custom properties + `@theme inline` block.

### Color Palette
- **Backgrounds:** `vena-bg` (#08080d) → `vena-surface` (#0f0f17) → `vena-surface-raised` (#161622) → `vena-surface-overlay` (#1c1c2e)
- **Borders:** `vena-border` (#1e1e32), `vena-border-subtle` (#14142a)
- **Text:** `vena-text` (#e4e4ef), `vena-text-secondary` (#8888a4), `vena-text-muted` (#55556e)
- **Accent (indigo):** `vena-accent` (#6366f1), `vena-accent-hover` (#818cf8), `vena-accent-muted` (#4f46e5)
- **Status:** success (#22c55e), warning (#f59e0b), error (#ef4444), info (#38bdf8)
- **Agent colors:** orchestrator (indigo), nova (pink), viktor (purple), silas (amber)

### Typography
- Sans: Geist Sans (via `--font-geist-sans`)
- Mono: Geist Mono (via `--font-geist-mono`)

### Design Language
- Mission control / developer IDE aesthetic
- Dark theme only (no light mode for MVP)
- High contrast text on dark surfaces
- Indigo accent for interactive elements
- Subtle borders, no heavy outlines
- Custom dark scrollbars

## Conventions
- **Plan/Roadmap files:** All saved in `plans/` directory with meaningful names.
- **ROADMAP.md format:** Uses `<!-- vena:phase -->` and `<!-- vena:sprint -->` markers.
- **Tailwind usage:** Always use `vena-*` token classes, not raw Tailwind colors.

## Build Status
Phase 0 — Kickoff & Scaffold (2026-03-19)
- [x] Design tokens defined in globals.css
- [x] Layout updated with Vena branding
- [x] Placeholder home page with Vena identity
- [ ] Sidebar component (Phase 1)
- [ ] Component library (Phase 1+)
