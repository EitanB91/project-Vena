# Nova — Design Memory: Project Vena

## Project Purpose
Project Vena — a local web dashboard for monitoring Claude Code projects. Modern, minimalistic, sleek high-tech design. Shows agents, budgets, roadmaps, sessions, and conversations.

## Tech Stack Decisions
- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Charts:** Recharts (confirmed Phase 4)
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

### Phase 1 Design Debt (status)
- ~~`text-[11px]` arbitrary values~~ — **RESOLVED Phase 4.** `text-micro` design token added. All occurrences replaced.
- `text-[10px]` in Sidebar version badge — 1 occurrence, acceptable as-is. Too niche for its own token.
- ~~SVG icons duplicated between Sidebar and placeholder pages~~ — **RESOLVED Phase 4.** All placeholders replaced with real content.

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

### Phase 4 — COMPLETE (2026-03-20)
Budget & Roadmap Views delivered. Recharts integrated for charts. Key design outcomes:

- **Budget page:** 4 metric cards (balance, usable, floor, alert level). Recharts donut chart showing budget breakdown (green=available, amber=floor, red=spent). Claude Code usage bars with color thresholds (accent < 50%, warning 50-80%, error > 80%). Alert thresholds panel.
- **Sessions page:** Recharts bar chart for daily activity (indigo bars). Date-grouped session list with phase/category badges (accent pills), duration display, active session pulse indicators.
- **Roadmap page:** Phase cards with progress bars (green=complete, accent=current with pulse, muted=planned). Current phase shows task checklist with checkmarks. Feature registry table with color-coded priority (red=Critical, amber=High) and status (green=Complete, muted=Planned). Plan document cards with file icons.
- **Dashboard home:** Live status cards, roadmap progress mini-bars, team avatars with agent color tokens.
- **`text-micro` design token:** Added `--font-size-micro: 11px` to globals.css. All 11 `text-[11px]` arbitrary values replaced with `text-micro`. Phase 1 design debt resolved.
- **Recharts limitation:** SVG fills cannot use CSS custom properties. Hardcoded hex colors in BudgetChart.tsx and SessionChart.tsx mirror design tokens — documented with sync-warning comments.

**Phase 4 Design Decisions:**
- Donut chart (PieChart with innerRadius) for budget breakdown — center label shows total balance. More visually striking than bar chart for a single budget.
- Grouped bar chart for session activity — sessions + minutes side by side per day. Lighter shade for minutes to distinguish.
- Phase cards use border accent highlight for current phase — draws eye to active work.
- Plan documents shown as cards (not expandable) — minimal viable plan viewer, can enhance later.

### Phase 5 — COMPLETE (2026-03-20)
CLI Passthrough Chat delivered. Nova's design involvement:

- **Terminal theme:** `src/lib/terminal-theme.ts` maps all Vena design tokens to xterm.js `ITheme`. Background uses `vena-surface`, foreground `vena-text`, cursor `vena-accent`. ANSI color palette mapped to Vena status + agent colors (green=success, red=error, blue=accent, magenta=viktor, pink=nova, amber=silas).
- **Terminal container:** Rounded border (`border-vena-border`), overflow hidden, fills available space with `flex-1 min-h-0`.
- **Connection status pill:** Rounded-full badge with colored dot — green (connected), amber pulse (connecting), red (disconnected). Uses `vena-success`, `vena-warning`, `vena-error` tokens.
- **Session ID:** Monospace `text-micro` in muted color, shown when connected.
- **New Session button:** Surface-raised background, border hover transitions to accent.
- **Footer hints:** `<kbd>` styled inline code for `claude` command, muted text, pipe separator.
- **Recharts-style limitation applies:** xterm.js theme requires hardcoded hex values — cannot use CSS custom properties. Same sync-warning pattern as charts.

**Phase 5 Design Decisions:**
- Terminal background matches `vena-surface` (not `vena-bg`) — creates visual separation from the page background, making the terminal area distinct within the layout.
- Geist Mono as primary terminal font with Cascadia Code and Fira Code fallbacks — maintains consistency with the mono font used elsewhere in the dashboard.
- Block cursor with blink — standard terminal UX, indigo accent color makes it visible against dark background.

### Phase 6 — COMPLETE (2026-03-20)
Polish & v1.0 delivered. Heavy Nova involvement — responsive design, empty states, loading states, error states.

- **Collapsible mobile sidebar:** Hamburger menu icon in a fixed mobile top bar (`md:hidden`). Sidebar slides in from left with `translate-x` transition (200ms ease-in-out). Black/60 backdrop overlay. Close on route change via `useEffect([pathname])`. Body scroll lock when open. Close button (X) inside sidebar header on mobile.
- **Mobile top bar:** Fixed top, z-40, `h-14`, replicates sidebar logo area (pulse dot + "Vena" + version badge). Hamburger button with `hover:bg-vena-surface-raised` transition.
- **Responsive padding:** All page wrappers changed from `p-8` to `p-4 md:p-8`. Header margins `mb-6 md:mb-8`. Stats rows `flex-wrap gap-4 md:gap-6`. Chat header stacks vertically on mobile (`flex-col gap-3 sm:flex-row`).
- **EmptyState component:** `src/components/EmptyState.tsx` — centered card with dashed border, icon circle (`h-10 w-10 rounded-full bg-vena-surface-raised`), message, optional hint in `text-vena-text-muted/70`. Used on agents, budget, sessions, roadmap pages.
- **Compact empty states:** Dashboard Quick Glance panels use inline icon + message (no card wrapper) to avoid card-within-card nesting.
- **Skeleton loading:** `src/components/Skeleton.tsx` — composable primitives: `Skeleton` (base pulse bar), `SkeletonCard`, `SkeletonHeader`, `SkeletonRow`. Used in 5 route `loading.tsx` files matching actual page layouts.
- **ErrorDisplay component:** `src/components/ErrorDisplay.tsx` — error circle icon (`bg-vena-error/10`), title, message, retry button with accent hover. Used in 6 route `error.tsx` files.

**Phase 6 Design Decisions:**
- Mobile sidebar as overlay (not inline collapse) — preserves full sidebar width when open, doesn't compress page content. Standard mobile nav pattern.
- Skeleton shapes match actual page content — donut placeholder for budget chart, rows for roadmap phases, cards for agent grid. Reduces layout shift on load.
- EmptyState uses dashed border to visually distinguish "no data" from "loading" (solid border). Consistent across all pages.
- Compact inline empty states in dashboard panels avoid nested-card pattern that would feel heavy in small Quick Glance containers.

### All Design Debt — RESOLVED
- ~~`text-[11px]` arbitrary values~~ — resolved Phase 4 (`text-micro` token)
- ~~SVG icon duplication~~ — resolved Phase 4 (real content replaced all placeholders)
- `text-[10px]` in Sidebar version badge — 1 occurrence, accepted as-is. Too niche for a token.

---

## Sprint 1 Retrospective (2026-03-21)
See full retro: `memory/project_sprint1_retro.md`

- **Best:** Design token system — defined in Phase 0, carried flawlessly through all 6 phases.
- **Worst:** Should have designed mobile-first from Phase 1 instead of cramming responsive into Phase 6.

### Phase 7 — COMPLETE (2026-03-22)
Research & Foundation Fixes. Minimal Nova involvement — mostly Orchestrator + Silas research.

**Relevant for Phase 8–9:**
- Data refresh research completed (`plans/Research-Data-Refresh.md`). Three patterns identified:
  1. `router.refresh()` polling (5–10s) for primary pages — zero API routes needed.
  2. API routes + SWR (3–5s) for telemetry data — fine-grained, isolated refresh.
  3. SSE + `fs.watch()` for terminal/logs — push-based, no polling.
- Nova's Phase 8 work: visual heartbeat cues ("updated Xs ago", pulse animations, fade transitions on data refresh).
- Nova's Phase 9 work: chatbox UI, "VenaOS" branding, version text polish.
- Agent status moved to data layer — `AgentProfile` now has pre-computed `status` and `lastSeen` fields. Cards/pages consume directly, no client-side Date.now().
- Sidebar mobile close: changed from useEffect/ref pattern to onClick on nav links — cleaner, lint-safe.

## Sprint 2 — MVP Direction
v1.0 not releasing publicly. Sprint 2 is MVP sprint. Nova's key roles:
- **Phase 8:** Visual heartbeat cues — "updated Xs ago" timestamps, pulse animations, fade transitions
- **Phase 9:** Chatbox UI alongside terminal (split view), "VenaOS" branding, version text polish
- Director UX feedback pending: brighter version text (+2 size), techy logo name

## Vena — Character & Brand Identity (approved 2026-03-28)

Vena is the human personification of the dashboard. Every color maps to the design token system.

### Art Style: Digital Noir Minimalism
Semi-stylized digital painting. Single cool light source, near-monochrome palette, one indigo accent (#6366f1) in the eyes. She emerges from `#08080d` void. Painterly but controlled.

### Visual Summary
- Late 20s, 5'9", lean angular frame, high cheekbones, defined jaw
- Cool moonlight pale skin (#c4bcc9), silver-lavender undertone
- Dark charcoal eyes with indigo-violet outer ring — THE signature detail
- Jet black hair, straight, collarbone, indigo sheen when light hits
- Matte black turtleneck, one thin silver chain necklace
- Expression: "observant calm" — recording, processing, three steps ahead

### Canonical Portrait
Generated 2026-03-28 from Nova's visual profile. Director verdict: approved instantly, zero notes. *"God... This is VENA!"*

### Assets
- `public/brand/VENA-VISUAL-PROFILE.md` — full visual profile document
- `public/brand/vena-eyes-study.svg` — SVG eye sketch with token annotations
- `public/brand/vena-portrait-sketch.svg` — full SVG portrait with token annotations
- Canonical portrait PNG — to be added by Director

### Planned Usage (post-sprint)
- Chat UI: portrait as greeting/idle state, indigo eye pulse when processing
- Sidebar or About page: small avatar variant
- Favicon: cropped eyes only (32x32)
- 404 page: full eye contact, *"There's nothing here. I already checked."*
