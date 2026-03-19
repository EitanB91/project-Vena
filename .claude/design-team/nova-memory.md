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
Phase 0 — COMPLETE (2026-03-19). Committed `371bc76`, pushed to GitHub.
Phase 1 — COMPLETE (2026-03-19). Viktor verdict: PASS. Director approved push.

### Phase 1 Delivery
- [x] Sidebar component with route links — inline SVG icons, active state highlighting
- [x] Dark theme applied across shell — all `vena-*` tokens used consistently
- [x] Placeholder pages for each route (agents, budget, roadmap, sessions, chat)
- [x] Dashboard home with status cards
- [x] Root layout with fixed sidebar + main content area

### Phase 1 Design Debt (deferred to Phase 6)
- `text-[10px]` and `text-[11px]` in Sidebar use arbitrary Tailwind values — formalize micro-typography tokens during Phase 6 polish pass
- SVG icons duplicated between Sidebar and placeholder pages — will resolve when placeholders are replaced with real content

### Phase 1 Lessons
- **What worked:** Design tokens from Phase 0 carried through cleanly — no color inconsistencies, every component used `vena-*` classes. Dark theme was essentially "free" because tokens were defined upfront.
- **Decision:** Inline SVG icons chosen over icon library to avoid dependency bloat. Keeps bundle small for a local tool.

### Phase 2 — COMPLETE (2026-03-19)
No direct Nova involvement. Data layer built (types, parsers, readers) — all server-side in `src/lib/`.

**Relevant for Phase 3:** The data layer now provides structured `AgentProfile` objects with `colorToken` field mapped to Nova's design tokens (`vena-agent-orchestrator`, `vena-agent-nova`, `vena-agent-viktor`, `vena-agent-silas`). Agent cards in Phase 3 should use these tokens for color-coding.

**Tech addition:** Vitest added as unit test runner.

### Phase 3 — COMPLETE (2026-03-20)
Agent Dashboard delivered. Nova's design tokens used throughout:

- **Agent card grid:** Responsive 3-column layout. Each card shows color-coded avatar (CSS variable `var(--vena-agent-*)` for dynamic coloring), name, role, key phrases (italic, muted), project badges (rounded pills), and status indicator with relative time.
- **Agent detail pages:** Large avatar, identity + memory panels side-by-side in `lg:grid-cols-2`, back navigation arrow, section headers in uppercase tracking-wider muted style.
- **Status indicators:** Green dot = Active (<30min), Yellow dot = Recent (<24h), Gray dot = Idle. Uses `vena-success`, `vena-warning`, `vena-text-muted` tokens.
- **Card interaction:** Hover raises surface (`bg-vena-surface-raised`), border brightens (`border-vena-text-muted`), name goes white. Transition-colors for smooth feel.
- **Design tokens validated:** All `vena-agent-*` colors render correctly. No raw Tailwind colors used. Dark theme consistent.

**Phase 3 Design Decisions:**
- Agent avatars are solid-color circles using CSS variables — simple, scales to any agent count, no image assets needed.
- Key phrases truncated with `truncate` on cards, fully displayed on detail page — progressive disclosure.
- Identity/memory panels use `font-mono text-xs` for raw content — respects the "mission control" data-dense aesthetic.

### Phase 4 — Next (Budget & Roadmap Views)
Nova's involvement: chart styling (Recharts theming with vena-* tokens), budget dashboard layout, roadmap phase visualization, session timeline design.
