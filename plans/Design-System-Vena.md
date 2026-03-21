# Vena Design System

**Design Lead:** Nova
**Version:** 1.0 (v1.0 milestone — Phase 6 complete)
**Last Updated:** 2026-03-21

---

## Design Philosophy

Vena is a **mission control dashboard** for monitoring Claude Code projects. The visual language draws from developer IDE aesthetics and aerospace telemetry displays — information-dense, dark-themed, and brutally clear.

### Core Principles

| Principle | What it means in practice |
|-----------|--------------------------|
| **Dark-first** | No light mode. Every color is chosen for legibility on near-black backgrounds. |
| **Token-driven** | All visual decisions flow from CSS custom properties. No raw hex in components. |
| **Data-dense, not cluttered** | High information density with generous whitespace between logical groups. |
| **Progressive disclosure** | Cards show summaries; detail pages show everything. Don't overwhelm on first glance. |
| **Local-first honesty** | No loading spinners pretending to talk to a server. Skeleton shimmer for async reads, empty states when files don't exist. |

### Mood & References

Think: VS Code's dark theme meets a NASA flight director's console. Muted surfaces, glowing accent colors, monospace data readouts, crisp sans-serif headings. The dashboard should feel like it's *running* something important — because it is.

---

## Color System

All colors are defined as CSS custom properties in `src/app/globals.css` and exposed to Tailwind v4 via `@theme inline`.

### Background Layers

Four elevation layers create visual depth without drop shadows.

| Token | Hex | Usage |
|-------|-----|-------|
| `vena-bg` | `#08080d` | Page background, deepest layer |
| `vena-surface` | `#0f0f17` | Cards, sidebar, panels |
| `vena-surface-raised` | `#161622` | Hover states, skeleton shimmer, elevated elements |
| `vena-surface-overlay` | `#1c1c2e` | Overlays, badges, floating elements |

**Layering rule:** Each surface should be exactly one step lighter than its parent. Never skip a level (e.g., don't put `surface-overlay` directly on `bg`).

### Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `vena-border` | `#1e1e32` | Card borders, dividers, sidebar edges |
| `vena-border-subtle` | `#14142a` | Inner dividers, low-emphasis separators |

**Border rule:** 1px solid. No thick borders, no heavy outlines. Borders define space — they don't demand attention.

### Text Hierarchy

| Token | Hex | Usage |
|-------|-----|-------|
| `vena-text` | `#e4e4ef` | Primary content — headings, body text, values |
| `vena-text-secondary` | `#8888a4` | Supporting text — labels, descriptions, roles |
| `vena-text-muted` | `#55556e` | Tertiary — timestamps, hints, disabled states |

**Hierarchy rule:** Every text element must use exactly one of these three levels. If you need a fourth, you probably need to restructure the information.

### Accent (Indigo)

| Token | Hex | Usage |
|-------|-----|-------|
| `vena-accent` | `#6366f1` | Interactive elements, active states, links, focus rings |
| `vena-accent-hover` | `#818cf8` | Hover state for accent elements |
| `vena-accent-muted` | `#4f46e5` | Pressed state, accent backgrounds |

**Accent rule:** Indigo is the *only* interactive color. If something is clickable, it either turns indigo or reveals an indigo border/glow on hover.

### Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `vena-success` | `#22c55e` | Active status, completed tasks, healthy metrics |
| `vena-warning` | `#f59e0b` | Recent activity, approaching thresholds, caution |
| `vena-error` | `#ef4444` | Errors, failures, critical alerts, blocked |
| `vena-info` | `#38bdf8` | Informational highlights, tips, neutral indicators |

**Status rule:** Status colors are semantic only. Never use `vena-error` for decoration. If something is red, something is wrong.

### Agent Identity Colors

Each team member has a signature color used for avatars, chart segments, and identity markers.

| Token | Hex | Agent | Character |
|-------|-----|-------|-----------|
| `vena-agent-orchestrator` | `#6366f1` | Claude / The Orchestrator | Indigo — shared with system accent |
| `vena-agent-nova` | `#f472b6` | Nova (Design Lead) | Pink — warm, creative, radiant |
| `vena-agent-viktor` | `#a78bfa` | Viktor (QA Lead) | Purple — stoic, authoritative |
| `vena-agent-silas` | `#fbbf24` | Silas Sterling (Budget Lead) | Amber — golden, theatrical, vault-keeper |

**Identity rule:** Agent colors are used for avatar circles and chart/badge accents. They never replace the system accent for interactive elements.

---

## Typography

### Font Stack

| Role | Font | CSS Variable | Fallback |
|------|------|-------------|----------|
| **Sans** (primary) | Geist Sans | `--font-geist-sans` | system-ui, sans-serif |
| **Mono** (data/code) | Geist Mono | `--font-geist-mono` | Cascadia Code, Fira Code, monospace |

Both fonts are loaded via `next/font/google` in `src/app/layout.tsx` and assigned to `--font-sans` / `--font-mono` theme tokens.

### Type Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-lg` | 18px | Page titles |
| `text-base` | 16px | Brand text (sidebar "Vena") |
| `text-sm` | 14px | Body text, nav labels, card content |
| `text-xs` | 12px | Badges, metadata, timestamps, status labels |
| `text-micro` | 11px | Version badges, footer labels, fine print |

**`text-micro`** is a custom Tailwind token (`--font-size-micro: 11px`, `--line-height-micro: 1.45`) defined in the `@theme inline` block. It replaces all `text-[11px]` arbitrary values.

### Weight & Tracking

| Style | Where |
|-------|-------|
| `font-semibold` | Page headings, card titles, agent names |
| `font-medium` | Nav items, metric values, section headers |
| `font-mono text-xs` | Raw data blocks (identity/memory panels), code readouts |
| `tracking-tight` | Brand text ("Vena") |
| `tracking-wider uppercase` | Section labels, group headers |

---

## Layout System

### Shell Structure

```
┌─────────────────────────────────────────┐
│ Mobile Top Bar (h-14, md:hidden)        │
├──────────┬──────────────────────────────┤
│ Sidebar  │ Main Content                 │
│ w-56     │ md:ml-56                     │
│ fixed    │ flex min-h-screen flex-col   │
│ border-r │                              │
│          │ ┌──────────────────────────┐ │
│          │ │ Page Content             │ │
│          │ │ p-4 md:p-8              │ │
│          │ └──────────────────────────┘ │
└──────────┴──────────────────────────────┘
```

- **Sidebar:** Fixed, `w-56` (224px), full height, `border-r border-vena-border`, `bg-vena-surface`.
- **Main area:** Offset by `md:ml-56`, flex column, minimum full viewport height.
- **Page padding:** `p-4 md:p-8` — tighter on mobile, generous on desktop.

### Responsive Strategy

| Breakpoint | Behavior |
|------------|----------|
| `< md` (mobile) | Sidebar hidden, hamburger menu in fixed top bar. Sidebar slides in as overlay with black/60 backdrop. Body scroll locked when open. |
| `>= md` (desktop) | Sidebar always visible. No top bar. Standard layout. |

**Mobile sidebar:**
- Slides from left with `translate-x` transition (200ms `ease-in-out`)
- Close on route change (`useEffect([pathname])`)
- Close on backdrop click
- Close button (X) in sidebar header

### Grid Patterns

| Pattern | Classes | Where used |
|---------|---------|------------|
| Stat cards row | `flex flex-wrap gap-4 md:gap-6` | Budget metrics, dashboard stats |
| 3-column card grid | `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` | Agent cards |
| 2-column content | `lg:grid-cols-2` | Agent detail panels, dashboard sections |
| Full-width stacked | `space-y-4` or `space-y-6` | Session lists, roadmap phases |

---

## Component Patterns

### Cards

The card is the fundamental container in Vena.

```
┌─────────────────────────────┐
│ border-vena-border (1px)    │
│ bg-vena-surface             │
│ rounded-lg  p-4 or p-5     │
│                             │
│ Content                     │
│                             │
└─────────────────────────────┘
```

**Interactive cards** (e.g., AgentCard):
- `hover:border-vena-text-muted` — border brightens on hover
- `hover:bg-vena-surface-raised` — background lifts one level
- `transition-colors` — smooth 150ms transition
- Title text goes `text-white` on group hover

**Static cards** (e.g., stat cards, info panels):
- No hover effects
- Same border/background base

### Status Indicators

Three-tier status system for agent activity:

| State | Dot Color | Token | Trigger |
|-------|-----------|-------|---------|
| Active | Green | `vena-success` | < 30 minutes since last seen |
| Recent | Yellow (pulse) | `vena-warning` | < 24 hours |
| Idle | Gray | `vena-text-muted` | > 24 hours |

Status dot: `inline-block h-2 w-2 rounded-full`. Active sessions add `animate-pulse`.

### Badges & Pills

```
rounded-full bg-vena-surface-overlay px-2 py-0.5 text-xs text-vena-text-secondary
```

Used for: project tags, phase labels, category markers, session metadata.

**Priority-colored badges** (roadmap):
- Critical: `text-vena-error`
- High: `text-vena-warning`
- Complete: `text-vena-success`
- Planned: `text-vena-text-muted`

### Avatars

Agent avatars are solid-color circles using CSS variables:

```tsx
<div
  className="h-10 w-10 rounded-full"
  style={{ backgroundColor: `var(--${colorToken})` }}
/>
```

No images. No initials. Pure color identity. Simple, scales to any agent count.

### Buttons

**Primary action:**
```
rounded-md border border-vena-border bg-vena-surface-raised px-4 py-2
text-sm text-vena-text-secondary
transition-colors hover:border-vena-accent hover:text-vena-text
```

**Icon button (mobile nav):**
```
h-9 w-9 rounded-md text-vena-text-secondary
hover:bg-vena-surface-raised hover:text-vena-text transition-colors
```

No filled/solid accent buttons in v1.0. All buttons are surface-raised with border hover.

---

## State Patterns

### Loading (Skeleton)

Composable skeleton primitives in `src/components/Skeleton.tsx`:

| Primitive | Usage |
|-----------|-------|
| `Skeleton` | Base pulse bar — `animate-pulse rounded-md bg-vena-surface-raised` |
| `SkeletonCard` | Stat card placeholder (title + value + subtitle bars) |
| `SkeletonHeader` | Page header placeholder (title + description bars) |
| `SkeletonRow` | List row placeholder (dot + text + trailing badge) |

**Principle:** Skeleton shapes mirror the actual page content. A budget loading page shows a donut-shaped skeleton. An agent loading page shows a grid of card skeletons. This reduces perceived layout shift.

### Empty State

Centered card with dashed border — `src/components/EmptyState.tsx`:

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│                           │
│       (icon circle)       │
│        Message text       │
│        Hint text          │
│                           │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

- Dashed border distinguishes "no data" from "loading" (which uses solid borders)
- Icon in a `h-10 w-10 rounded-full bg-vena-surface-raised` circle
- Optional hint in `text-vena-text-muted/70` (70% opacity of muted)

**Compact variant** (dashboard Quick Glance panels): Inline icon + message, no card wrapper. Avoids card-within-card nesting.

### Error State

`src/components/ErrorDisplay.tsx` — centered, max-width `md`:

- Error circle icon: `bg-vena-error/10` background, `text-vena-error` icon
- Title in `text-lg font-semibold`
- Message in `text-sm text-vena-text-secondary`
- Optional retry button (standard button pattern)

---

## Charts & Data Visualization

Built with **Recharts**. Key constraint: SVG fills cannot use CSS custom properties. All chart colors are hardcoded hex values that mirror design tokens, marked with `// sync-warning` comments.

### Budget Chart (Donut)

`PieChart` with `innerRadius` for donut shape. Center label shows total balance.

| Segment | Hex | Token |
|---------|-----|-------|
| Available | `#22c55e` | `vena-success` |
| Floor | `#fbbf24` | `vena-warning` |
| Spent | `#ef4444` | `vena-error` |

### Session Chart (Bar)

Grouped bar chart — sessions + minutes side by side per day.

| Bar | Hex | Token |
|-----|-----|-------|
| Sessions | `#6366f1` | `vena-accent` |
| Minutes | `#818cf8` | `vena-accent-hover` (lighter to distinguish) |

### Usage Bars (Budget)

Horizontal progress bars with color thresholds:
- `< 50%` usage → `vena-accent` (indigo)
- `50–80%` → `vena-warning` (amber)
- `> 80%` → `vena-error` (red)

### Roadmap Progress Bars

Phase progress indicators:
- Complete → `vena-success` (green, full width)
- Current → `vena-accent` (indigo, partial width, `animate-pulse`)
- Planned → `vena-text-muted` (gray, zero width)

---

## Terminal Integration

The CLI passthrough chat embeds an xterm.js terminal with a fully custom theme defined in `src/lib/terminal-theme.ts`.

### Terminal Theme Mapping

| xterm Property | Value | Vena Token |
|---------------|-------|------------|
| `background` | `#0f0f17` | `vena-surface` (not `vena-bg` — creates visual separation) |
| `foreground` | `#e4e4ef` | `vena-text` |
| `cursor` | `#6366f1` | `vena-accent` |
| `selectionBackground` | `#6366f133` | `vena-accent` @ 20% opacity |

ANSI colors mapped to Vena tokens: red=error, green=success, yellow=warning, blue=accent, magenta=viktor, brightMagenta=nova, brightYellow=silas.

### Terminal Container

- `rounded-lg border border-vena-border` wrapper
- `overflow-hidden` to clip terminal edges
- `flex-1 min-h-0` to fill available vertical space
- Font: Geist Mono primary, Cascadia Code and Fira Code fallbacks

### Connection Status Pill

Rounded-full badge with animated dot:
- Connected: Green dot, `vena-success`
- Connecting: Amber pulsing dot, `vena-warning`
- Disconnected: Red dot, `vena-error`

---

## Icons

All icons are **inline SVGs** — no icon library dependency. This keeps the bundle small for a local tool.

Standard icon attributes:
```tsx
viewBox="0 0 24 24" fill="none" stroke="currentColor"
strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
```

Icons accept a `className` prop for sizing (`h-4 w-4`, `h-5 w-5`) and inherit text color via `currentColor`.

### Icon Set (v1.0)

| Icon | Where | Shape |
|------|-------|-------|
| Grid (2x2 squares) | Dashboard nav | Four squares |
| Users | Agents nav | Person silhouettes |
| Wallet | Budget nav | Card/wallet rectangle |
| Map | Roadmap nav | Folded map with lines |
| Clock | Sessions nav | Clock face with hands |
| Terminal | Chat nav | Chevron prompt + underline |
| Menu (hamburger) | Mobile top bar | Three horizontal lines |
| Close (X) | Mobile sidebar close | Two crossed lines |
| Alert circle | Error display | Circle with exclamation |

---

## Scrollbar Styling

Custom dark scrollbars for WebKit browsers:

| Part | Style |
|------|-------|
| Width/Height | `6px` — thin, unobtrusive |
| Track | `vena-bg` — matches page background |
| Thumb | `vena-border` — visible but subtle |
| Thumb hover | `vena-text-muted` — slightly brighter on interaction |

---

## Animation & Transitions

| Animation | Where | Details |
|-----------|-------|---------|
| `transition-colors` | Cards, buttons, nav items | 150ms default, smooth color shift |
| `animate-pulse` | Active status dots, current phase progress, logo dot | Tailwind's built-in pulse keyframe |
| `translate-x` + `duration-200 ease-in-out` | Mobile sidebar open/close | Slide from left |
| `animate-pulse` on `Skeleton` | Loading states | Shimmer effect for skeleton blocks |

**Animation rule:** Transitions are functional, not decorative. Every animation communicates state — hover, loading, active, connecting. No gratuitous motion.

---

## Design Tokens — Quick Reference

All tokens available as Tailwind classes with `vena-` prefix (e.g., `bg-vena-surface`, `text-vena-accent`, `border-vena-border`).

```css
/* Backgrounds */
bg-vena-bg | bg-vena-surface | bg-vena-surface-raised | bg-vena-surface-overlay

/* Borders */
border-vena-border | border-vena-border-subtle

/* Text */
text-vena-text | text-vena-text-secondary | text-vena-text-muted

/* Accent */
text-vena-accent | bg-vena-accent | border-vena-accent
hover:text-vena-accent-hover | bg-vena-accent-muted

/* Status */
text-vena-success | text-vena-warning | text-vena-error | text-vena-info
bg-vena-success | bg-vena-warning | bg-vena-error | bg-vena-info

/* Agents */
bg-vena-agent-orchestrator | bg-vena-agent-nova | bg-vena-agent-viktor | bg-vena-agent-silas

/* Typography */
text-micro (11px, line-height 1.45)
```

---

## Known Limitations (v1.0)

| Limitation | Reason | Workaround |
|------------|--------|------------|
| No CSS variables in Recharts SVG fills | SVG `fill` doesn't resolve CSS custom properties | Hardcoded hex with `// sync-warning` comments |
| No CSS variables in xterm.js theme | xterm ITheme expects string values | Same — hardcoded hex with sync-warning |
| `text-[10px]` in sidebar version badge | Too niche for its own token (1 occurrence) | Accepted as-is |
| Dark theme only | MVP scope decision | Light mode not planned; dark is the identity |

---

*Designed by Nova. Built by the team.*
*Every pixel has a purpose. Every token has a reason.*
