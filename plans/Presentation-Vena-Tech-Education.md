# Vena v1.0 — Technology Education Presentation

**Audience:** The Director and anyone joining the project
**Goal:** Understand every technology, pattern, and decision in Vena so you can read the code, ask informed questions, and make architectural decisions
**Duration:** ~45 minutes (self-paced reading or team walkthrough)

---

## Slide 1 — What Is Vena?

**Vena** is a local web dashboard that reads `.claude/` project directories and displays:
- Agent identities, memory, and activity status
- API budget tracking and alert levels
- Project roadmap progress and plan documents
- Session history with timeline charts
- An embedded terminal for CLI interaction

**Key principle:** No database. No cloud. No authentication. Reads files directly from disk. Runs entirely on `localhost`.

---

## Slide 2 — The Big Picture Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        BROWSER                          │
│                                                         │
│   Next.js App (React)          xterm.js Terminal        │
│   ├── Dashboard                ├── WebSocket client     │
│   ├── Agents page              └── Sends keystrokes     │
│   ├── Budget page                   ↕ ws://localhost:3001
│   ├── Roadmap page                  │                   │
│   ├── Sessions page                 │                   │
│   └── Chat page ──────────────────→ │                   │
│         ↕ HTTP                      │                   │
└─────────┼───────────────────────────┼───────────────────┘
          │                           │
┌─────────┼───────────────────────────┼───────────────────┐
│         ↓         SERVER            ↓                   │
│                                                         │
│   Next.js Server               PTY Server               │
│   ├── Server Components        ├── WebSocket server     │
│   │   └── Read .claude/ files  ├── Spawns shell (PTY)   │
│   ├── API Routes               └── Token auth (S8)      │
│   │   └── /api/pty-token                                │
│   └── Renders HTML + sends                              │
│       to browser                                        │
│         ↕ fs.readFileSync          ↕ node-pty            │
│         │                          │                    │
│   ┌─────┴──────────┐        ┌─────┴──────────┐         │
│   │  .claude/ dir  │        │  Shell process  │         │
│   │  (files on     │        │  (PowerShell/   │         │
│   │   disk)        │        │   bash)         │         │
│   └────────────────┘        └────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

Two servers run side by side:
1. **Next.js** (port 3000) — serves the web UI, reads files
2. **PTY Server** (port 3001) — bridges browser terminal to a real shell

---

## Slide 3 — Next.js & the App Router

**What is Next.js?**
A framework built on top of React that handles things React doesn't: routing, server rendering, API endpoints, and optimization.

**What is the App Router?**
The modern routing system where **the folder structure IS the routes**:

```
src/app/
├── page.tsx              → http://localhost:3000/
├── agents/
│   ├── page.tsx          → http://localhost:3000/agents
│   └── [name]/page.tsx   → http://localhost:3000/agents/nova
├── budget/page.tsx       → http://localhost:3000/budget
├── roadmap/page.tsx      → http://localhost:3000/roadmap
├── sessions/page.tsx     → http://localhost:3000/sessions
└── chat/page.tsx         → http://localhost:3000/chat
```

**Special files:**
| File | Purpose |
|------|---------|
| `page.tsx` | The actual page content |
| `layout.tsx` | Wraps all child pages (sidebar, fonts, theme) |
| `loading.tsx` | Shown while data loads (skeleton placeholders) |
| `error.tsx` | Shown when something crashes (error recovery UI) |

**Why this matters:** You don't write route configurations. You create a folder — it becomes a URL. Delete the folder — the route disappears.

---

## Slide 4 — Server Components vs Client Components

This is the most important concept in modern Next.js.

### Server Components (the default)
- Run **on the server** (Node.js), not in the browser
- Can read files (`fs.readFileSync`), query databases, access secrets
- Ship **zero JavaScript** to the browser — just HTML
- Cannot use `useState`, `useEffect`, `onClick`, or any browser API

**In Vena:** All page files (`page.tsx`) are Server Components. They read `.claude/` files directly.

### Client Components (opt-in with `"use client"`)
- Run **in the browser**
- Can use state, effects, event handlers, and browser APIs
- Must be explicitly marked with `"use client"` at the top of the file

**In Vena:** Sidebar (navigation state), Terminal (WebSocket), Charts (Recharts), Error boundaries.

### The Rule
> Keep components as Server Components unless they absolutely need browser interactivity. This makes the app faster and more secure.

---

## Slide 5 — TypeScript: Types as Safety Nets

**What it does:** Adds type annotations to JavaScript. Every variable, function parameter, and return value has a declared type.

```typescript
// Without TypeScript — bug hides until runtime
function getBalance(ledger) {
  return ledger.remaining_balance; // typo? wrong field? No one knows until it crashes
}

// With TypeScript — bug caught immediately at build time
function getBalance(ledger: BudgetLedger): number {
  return ledger.remainingBalance; // TypeScript knows the exact shape
}
```

**Strict mode** means:
- No guessing types (`any` is banned)
- Null must be checked (`if (value !== null)` before using it)
- Function signatures must match exactly

**In Vena:** The build (`npm run build`) fails if types don't match. This is intentional — it catches bugs before they reach the browser.

---

## Slide 6 — Tailwind CSS v4: Utility-First Styling

**Traditional CSS:**
```css
.card { background: #0f0f17; border-radius: 8px; padding: 16px; border: 1px solid #1e1e32; }
```
```html
<div class="card">...</div>
```

**Tailwind CSS:**
```html
<div className="rounded-lg bg-vena-surface p-4 border border-vena-border">...</div>
```

No separate CSS file needed. Classes describe exactly what they do:
- `rounded-lg` = border radius
- `bg-vena-surface` = background color (our design token)
- `p-4` = padding 16px
- `border border-vena-border` = 1px border in our border color

**v4 differences from v3:**
- No `tailwind.config.js` — everything configured in CSS with `@theme` blocks
- Design tokens defined in `globals.css`, not in JavaScript

---

## Slide 7 — The Design Token System

Nova (Design Lead) built a layered color system in `globals.css`:

### Background Layers (darkest → lightest)
```
bg       #08080d  ← Page background (near black)
surface  #0f0f17  ← Card backgrounds
raised   #161622  ← Elevated elements (hover states, pills)
overlay  #1c1c2e  ← Modals, overlays
```

### Text Hierarchy
```
text       #e4e4ef  ← Primary text (bright)
secondary  #8888a4  ← Secondary text (descriptions)
muted      #55556e  ← Tertiary text (timestamps, hints)
```

### Accent & Status
```
accent   #6366f1  ← Indigo — active states, links, highlights
success  #22c55e  ← Green — healthy, complete, active
warning  #f59e0b  ← Amber — attention, caution
error    #ef4444  ← Red — errors, critical alerts
info     #38bdf8  ← Blue — informational
```

### Agent Colors
```
Orchestrator  #6366f1  (indigo)
Nova          #f472b6  (pink)
Viktor        #a78bfa  (purple)
Silas         #fbbf24  (gold)
```

**Why tokens?** Change a color in one place (`globals.css`) and it updates everywhere — the sidebar, cards, charts, terminal, and all status indicators.

---

## Slide 8 — The Data Layer: Files as a Database

Vena has no database. Instead, it reads files directly:

```
.claude/
├── design-team/
│   ├── nova-identity.md      ← Agent identity (parsed → AgentIdentity type)
│   └── nova-memory.md        ← Agent memory (parsed → AgentMemory type)
├── qa-team/
│   └── viktor-identity.md
├── vault-and-valve/
│   ├── silas-identity.md
│   ├── silas-memory.md
│   ├── budget-ledger.json    ← Budget data (parsed → BudgetLedger type)
│   └── usage-log.jsonl       ← Session events (parsed → UsageEvent[] type)
plans/
├── Roadmap-Project-Vena.md   ← Roadmap (parsed → Roadmap type)
└── Plan-MVP.md               ← Plan docs (parsed → PlanFile type)
```

### The parsing pipeline:
```
Raw file on disk
    ↓ fs.readFileSync
Raw string (JSON, JSONL, or Markdown)
    ↓ Parser function (in src/lib/)
Typed TypeScript object
    ↓ Passed as props
React component renders it
```

Each domain has its own reader module:
| Module | Reads | Produces |
|--------|-------|----------|
| `scanner.ts` | `.claude/` directory structure | `VenaProject` |
| `agents.ts` | `*-identity.md`, `*-memory.md` | `AgentProfile[]` |
| `budget.ts` | `budget-ledger.json`, `usage-log.jsonl` | `BudgetLedger`, `UsageEvent[]` |
| `sessions.ts` | (uses budget's usage log) | `SessionTimeline` |
| `roadmap.ts` | `Roadmap-*.md`, `plans/*.md` | `Roadmap`, `PlanFile[]` |

---

## Slide 9 — Markdown Parsing: HTML Comment Markers

The roadmap file uses custom markers that are invisible when viewing the markdown but machine-readable by the parser:

```markdown
<!-- vena:phase id="1" status="complete" -->
### Phase 1 — Dashboard Shell
**Status:** Complete (2026-03-19)
**Goal:** App shell with sidebar navigation.
- [x] Sidebar component
- [x] Dark theme
- [ ] Mobile responsive
<!-- /vena:phase -->
```

The parser uses regex to:
1. Find `<!-- vena:phase ... -->` blocks
2. Extract `id` and `status` from attributes
3. Parse the `### heading`, `**Goal:**` line, and `- [x]` checkboxes
4. Build a structured `RoadmapPhase` object with completion percentage

**Why markers?** The roadmap is both human-readable (it's just markdown) and machine-parsable (the dashboard can render it as an interactive UI).

---

## Slide 10 — JSONL: The Session Log Format

`usage-log.jsonl` uses JSON Lines — one JSON object per line:

```jsonl
{"event":"SessionStart","ts":"2026-03-19T10:00:00Z","session":"s-001","source":"hook"}
{"event":"SessionEnd","ts":"2026-03-19T10:45:00Z","session":"s-001","source":"hook"}
{"event":"SessionSummary","ts":"2026-03-19T10:45:00Z","session":"s-001","phase":"Phase 2","categories":["code_build","tests"],"api_cost_usd":0.42,"summary":"Built data layer"}
```

**Why JSONL instead of JSON?**
- **Append-friendly** — new events are added by appending a line (no need to parse the whole file to add data)
- **Stream-parsable** — each line is a complete JSON object, can be parsed independently
- **Fault-tolerant** — a malformed line doesn't break the whole file (parser skips bad lines)

The session reader pairs `SessionStart` + `SessionEnd` events by session ID, computes durations, attaches summaries, filters noise, and groups by date.

---

## Slide 11 — The Terminal System (xterm.js + PTY)

The Chat page embeds a real terminal in the browser. Here's how it works:

```
┌──────────────┐    WebSocket     ┌──────────────┐    stdin/stdout    ┌──────────┐
│  xterm.js    │ ◄──────────────► │  PTY Server   │ ◄───────────────► │  Shell   │
│  (browser)   │    port 3001    │  (Node.js)    │    (node-pty)     │  (bash/  │
│              │                  │              │                    │  pwsh)   │
└──────────────┘                  └──────────────┘                    └──────────┘
```

1. xterm.js renders a terminal UI in the browser
2. User keystrokes are sent via WebSocket to the PTY server
3. The PTY server writes them to a real shell process (via node-pty)
4. Shell output flows back through the same WebSocket
5. xterm.js renders the output with full color and formatting support

**Authentication flow:**
1. PTY server generates a random token on startup → writes to `.pty-auth-token`
2. Browser calls `/api/pty-token` (Next.js API route) → reads the token file
3. Browser sends `{ type: "auth", token: "..." }` as first WebSocket message
4. PTY server verifies → spawns shell → sends session ID back

---

## Slide 12 — Security: The 8 Hardening Measures

The PTY server is the most security-sensitive part of Vena — it spawns real shell processes. Viktor's security review produced 8 measures:

| # | Threat | Measure |
|---|--------|---------|
| S1 | Network exposure | Bind to `127.0.0.1` only — never `0.0.0.0` |
| S2 | Resource exhaustion | Cap at 5 concurrent sessions |
| S3 | Malformed resize | Validate cols/rows as integers in 1–500 range |
| S4 | Cross-site hijack | Check WebSocket `Origin` header — only allow `localhost:3000` |
| S5 | Connection flood | Rate limit: max 10 connections per IP per minute |
| S6 | Path traversal | Validate PTY working directory exists and is a directory |
| S7 | Memory exhaustion | Limit incoming WebSocket messages to 1 MB |
| S8 | Unauthorized access | Random token auth — 5-second timeout for authentication |

**Beyond the PTY server:**
- No database = no SQL injection
- No user input to server = no XSS
- No authentication = no session hijacking
- Local-only = no CORS, no certificate management

---

## Slide 13 — React Patterns Used in Vena

### Components
Functions that return JSX. The building block of every UI element.
```tsx
function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-vena-surface p-4">
      <p className="text-xs text-vena-text-muted">{label}</p>
      <p className="text-2xl font-semibold text-vena-text">{value}</p>
    </div>
  );
}
```

### Props
Data passed from parent to child — like function arguments.

### State (`useState`)
Data that changes over time. When state updates, the component re-renders.
```tsx
const [mobileOpen, setMobileOpen] = useState(false);
// Click handler: setMobileOpen(true) → component re-renders with sidebar open
```

### Effects (`useEffect`)
Code that runs after render — for subscriptions, timers, or cleanup.
```tsx
useEffect(() => {
  // Runs after every render where pathname changes
  setMobileOpen(false); // Close sidebar on navigation
}, [pathname]);
```

### Refs (`useRef`)
References to DOM elements or mutable values that don't trigger re-renders.
```tsx
const termRef = useRef<XTerm | null>(null);
// termRef.current gives direct access to the xterm.js instance
```

### Callbacks (`useCallback`)
Memoized functions that don't change between renders (unless dependencies change).
```tsx
const connect = useCallback(async () => { ... }, [updateStatus]);
```

---

## Slide 14 — Recharts: Data Visualization

Recharts is a React-native charting library. Instead of imperative drawing code, you compose charts declaratively:

```tsx
<ResponsiveContainer width="100%" height={200}>
  <BarChart data={chartData}>
    <XAxis dataKey="label" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="sessions" fill="var(--vena-accent)" />
    <Bar dataKey="minutes" fill="var(--vena-accent-hover)" />
  </BarChart>
</ResponsiveContainer>
```

**Used in Vena for:**
- **Budget page** — donut/pie chart showing usable vs floor vs spent
- **Sessions page** — bar chart showing daily session count and minutes

Charts are Client Components (they need browser APIs for canvas/SVG rendering).

---

## Slide 15 — Testing Strategy

### Unit Tests (Vitest)
54+ tests covering the entire `src/lib/` data layer:
- Agent identity and memory parsing
- Budget ledger reading and summary computation
- Usage log JSONL parsing
- Session timeline building and pairing
- Roadmap markdown parsing with markers
- Slug generation and edge cases

Run with `npm run test` or `npm run test:watch`.

### Visual Testing (Playwright)
Browser automation captures screenshots of the running app:
- Navigate to each page
- Interact with UI elements
- Save screenshot evidence to `tests/screenshots/`

Used for QA proof — Viktor reviews screenshots before approving a phase.

### QA Pipeline (Viktor's 9-Step Review)
Every code change goes through:
1. Structure analysis → 2. Bug check → 3. **Security review** → 4. Readability → 5. Convention compliance → 6. Tests → 7. Fix cycle → 8. Report → 9. Director approval

Steps 2, 3, 5, and 6 are **blocking** — failures prevent the code from being pushed.

---

## Slide 16 — Error Handling Strategy

Vena has three layers of error handling:

### Layer 1: Data Layer (Graceful Nulls)
Every reader function returns `null` or `[]` if the file doesn't exist or can't be parsed. Pages check for null and show empty states.
```tsx
const ledger = readBudgetLedger(claudeDir);
if (!ledger) return <EmptyState message="No budget ledger found." />;
```

### Layer 2: Loading States
Every route has a `loading.tsx` with skeleton placeholders. Next.js shows these automatically via React Suspense while the Server Component fetches data.

### Layer 3: Error Boundaries
Every route has an `error.tsx` — a Client Component that catches runtime crashes and shows a recovery UI with a "Try again" button. The root `error.tsx` is the catch-all.

**The philosophy:** Never show a blank page or an unhandled crash. Always show context about what went wrong and how to recover.

---

## Slide 17 — Responsive Design

The sidebar uses a **collapsible pattern** for mobile:

**Desktop (≥768px):**
- Sidebar is always visible, fixed on the left
- Content area has `md:p-8` padding

**Mobile (<768px):**
- Sidebar is hidden (`-translate-x-full`)
- A top bar appears with hamburger menu icon
- Click hamburger → sidebar slides in with backdrop overlay
- Click nav link or backdrop → sidebar closes
- Body scroll is locked when sidebar is open

**Grid responsiveness:**
- Status cards: 1 col → 2 cols → 4 cols (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`)
- Agent cards: 1 col → 2 cols → 3 cols
- Chart containers: 1 col → 2 cols

All handled by Tailwind's responsive prefix classes (`sm:`, `md:`, `lg:`, `xl:`).

---

## Slide 18 — The V&V Budget Model

Silas Sterling manages the Vault & Valve budget system:

```
Total Credit: $100.00
                ┌─────────────────────────────────────┐
Floor (locked): │██████████████████████████████ $40.00 │ ← Can't touch this
                ├─────────────────────────────────────┤
Usable Budget:  │████████████ $30.00 (spent)          │
                │░░░░░░░░░░░░ $30.00 (available)      │ ← Monthly cap
                └─────────────────────────────────────┘

Alert: at 30% → Warn, at 10% → Critical, at 0% → LOCKED
```

**4-Layer Monitoring Stack:**
1. **Hooks** — shell scripts log session start/end automatically (zero token cost)
2. **Session Bookends** — Orchestrator reads ledger at session start, logs at end (~200 tokens)
3. **Scheduled Reports** — daily snapshots, weekly summaries (cron)
4. **On-demand /silas** — full budget analysis with Silas's personality

---

## Slide 19 — Key Files Quick Reference

| If you want to... | Look at... |
|-------------------|-----------|
| Change the color scheme | `src/app/globals.css` |
| Add a new page/route | Create `src/app/your-route/page.tsx` |
| Add a new sidebar link | `src/components/Sidebar.tsx` → `navItems` array |
| Read a new data source | Create a reader in `src/lib/`, export from `src/lib/index.ts` |
| Add a TypeScript type | `src/types/index.ts` |
| Change terminal appearance | `src/lib/terminal-theme.ts` |
| Modify PTY security settings | `server/pty-server.ts` (constants at top) |
| Write a unit test | `tests/` directory, import from `src/lib/` |
| Add a plan/roadmap document | `plans/` directory |

---

## Slide 20 — Sprint 1 By the Numbers

| Metric | Value |
|--------|-------|
| Phases completed | 6 (0–6) |
| Source files | 38 TypeScript/TSX files |
| Unit tests | 54+ passing |
| Security measures | 8 (S1–S8) |
| QA pipeline steps | 9 |
| Design tokens | 20+ CSS custom properties |
| npm dependencies | 9 production + 10 dev |
| Lines of code | ~3,000+ (TypeScript/TSX) |
| Database tables | 0 (by design) |
| Cloud services | 0 (by design) |
| Team members | 4 (Orchestrator, Nova, Viktor, Silas) |

---

## Appendix A — Glossary

| Term | Definition |
|------|-----------|
| **App Router** | Next.js routing system where folders = routes |
| **Client Component** | React component that runs in the browser (marked with `"use client"`) |
| **CSS Custom Property** | A variable defined in CSS (e.g., `--vena-bg: #08080d`) |
| **Design Token** | A named value in the design system (color, spacing, font) |
| **Error Boundary** | A component that catches and handles runtime errors |
| **JSX** | JavaScript syntax extension for writing HTML-like markup |
| **JSONL** | JSON Lines — one JSON object per line in a text file |
| **node-pty** | Native module for spawning pseudo-terminal processes |
| **PTY** | Pseudo-terminal — a virtual terminal that bridges a process to I/O streams |
| **Server Component** | React component that runs on the server (the default in App Router) |
| **Skeleton** | A placeholder UI shown while real content loads |
| **Slug** | URL-safe version of a name (e.g., "Nova" → "nova") |
| **Strict Mode** | TypeScript config that enforces maximum type safety |
| **Suspense** | React feature that shows fallback UI while async content loads |
| **Utility-First CSS** | Styling approach using small, single-purpose classes |
| **V&V** | Vault & Valve — Silas's budget management system |
| **WebSocket** | Protocol for real-time bidirectional communication |
| **xterm.js** | Terminal emulator library for the browser |

---

*Prepared by The Orchestrator for Project Vena v1.0 — Sprint 1 retrospective.*
