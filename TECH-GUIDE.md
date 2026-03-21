# TECH-GUIDE.md — Project Vena

Complete reference of every technology, design pattern, architecture decision, security measure, and tool used in Vena v1.0.

---

## 1. Frameworks & Runtime

| Technology | Version | Summary |
|-----------|---------|---------|
| **Next.js** | 16.2.0 | React meta-framework providing file-system routing (App Router), server-side rendering, API routes, and automatic code splitting. The backbone of Vena's architecture. |
| **React** | 19.2.4 | UI library using a component-based model. Components are functions that return JSX; React handles DOM updates efficiently via a virtual DOM diffing algorithm. |
| **Node.js** | >=20 | Server-side JavaScript runtime. Powers Next.js server rendering, file system access, and the standalone PTY WebSocket server. |

---

## 2. Languages & Type Systems

| Technology | Summary |
|-----------|---------|
| **TypeScript** | Superset of JavaScript that adds static types. Catches bugs at compile time by enforcing that every variable, parameter, and return value has a declared type. Vena runs in strict mode — no implicit `any`, null safety enforced. |
| **JSX / TSX** | Syntax extension that lets you write HTML-like markup inside TypeScript. Every `.tsx` file is a React component that returns JSX elements. |

---

## 3. Styling & Design System

| Technology | Summary |
|-----------|---------|
| **Tailwind CSS v4** | Utility-first CSS framework. Instead of writing separate CSS files, you apply classes directly: `className="text-sm bg-vena-surface rounded-lg"`. v4 uses CSS-native `@theme` blocks instead of a JS config file. |
| **CSS Custom Properties** | CSS variables (`--vena-bg`, `--vena-accent`, etc.) defined in `globals.css`. These are Vena's design tokens — a single source of truth for all colors, spacing, and typography. |
| **@theme inline block** | Tailwind v4 feature that bridges CSS variables into Tailwind's utility class system. Lets us write `bg-vena-surface` instead of `bg-[var(--vena-surface)]`. |
| **Design Token System** | Nova's color architecture: 4 background layers (bg → surface → raised → overlay), 3 text levels (text → secondary → muted), accent palette (core, hover, muted), status colors (success, warning, error, info), and per-agent colors. |
| **Dark Theme** | Applied globally via `:root` CSS variables. No light mode — Vena is designed as a dark-only mission control aesthetic. Background is near-black (#08080d), text is light (#e4e4ef). |
| **Custom Scrollbar Styling** | WebKit scrollbar pseudo-elements styled to match the dark theme — thin (6px), dark track, subtle thumb. |
| **Geist Font Family** | Sans-serif (`--font-geist-sans`) for UI text, monospace (`--font-geist-mono`) for code and data. Loaded via `next/font`. |
| **text-micro Token** | Custom font size (11px / 1.45 line-height) registered as a Tailwind utility for tiny labels and metadata text. |

---

## 4. Data Visualization

| Technology | Summary |
|-----------|---------|
| **Recharts** | 3.8.0 — React charting library built on D3. Used for the budget breakdown donut chart and session activity bar chart. Responsive, composable, and theme-matched to Vena's color tokens. |
| **Inline SVG Icons** | All icons are hand-crafted SVG components (not an icon library). Each icon is a function component accepting `className` for styling. Keeps bundle size zero for icons. |

---

## 5. Terminal & CLI Passthrough

| Technology | Summary |
|-----------|---------|
| **xterm.js** | 6.0.0 — Terminal emulator for the browser. Renders a full terminal UI in a `<div>`, supports 256 colors, cursor styles, scrollback buffer (5000 lines), and add-ons. |
| **@xterm/addon-fit** | Auto-resizes the terminal to fill its container. Uses `ResizeObserver` to re-fit on window/container size changes. |
| **@xterm/addon-web-links** | Makes URLs in terminal output clickable — detects links and opens them in the browser. |
| **node-pty** | 1.1.0 — Native Node.js module that spawns pseudo-terminal processes. Bridges a real shell (PowerShell on Windows, bash on Linux/Mac) to the WebSocket server. |
| **ws (WebSocket)** | 8.19.0 — Fast, standards-compliant WebSocket library for Node.js. Powers the PTY server's real-time bidirectional communication with the browser terminal. |
| **tsx** | 4.21.0 — TypeScript execution engine. Runs the PTY server (`server/pty-server.ts`) directly without a separate compile step. |
| **concurrently** | 9.2.1 — Runs multiple commands in parallel. The `npm run dev:full` script starts both Next.js and the PTY server simultaneously. |

---

## 6. Testing

| Technology | Summary |
|-----------|---------|
| **Vitest** | 4.1.0 — Unit test framework compatible with the Vite ecosystem. Runs 54+ tests covering all `src/lib/` parsers and data layer functions. Fast, TypeScript-native, with watch mode (`npm run test:watch`). |
| **Playwright** | Browser automation used for screenshot-based visual testing. Captures evidence of UI states after each phase for QA review. Screenshots saved to `tests/screenshots/`. |

---

## 7. Code Quality & Linting

| Technology | Summary |
|-----------|---------|
| **ESLint** | 9.x — Static analysis tool that catches code quality issues, unused variables, and React/Next.js anti-patterns. Config extends `eslint-config-next` for framework-specific rules. |
| **TypeScript Strict Mode** | Enabled in `tsconfig.json`. Enforces: no implicit `any`, strict null checks, strict function types, no unused locals/parameters. The build fails on type errors. |

---

## 8. Architecture Patterns

### 8.1 App Router (File-System Routing)
Every folder in `src/app/` becomes a URL route. `page.tsx` is the page component, `layout.tsx` wraps child routes, `loading.tsx` shows during data fetching, `error.tsx` catches runtime errors. No manual route configuration needed.

### 8.2 Server Components (Default)
All components are Server Components by default — they run on the server, can read files with `fs`, and ship zero JavaScript to the browser. Only components that need interactivity (state, effects, click handlers) get the `"use client"` directive.

### 8.3 Client Components (Opt-In)
Files starting with `"use client"` run in the browser. Used for: Sidebar (navigation state, mobile toggle), Terminal (WebSocket, xterm.js), BudgetChart / SessionChart (Recharts requires browser APIs), error boundaries (need `useEffect` for reset).

### 8.4 Data Layer Pattern
All file system reads happen in `src/lib/` — never inline in pages. Each domain has its own reader module: `agents.ts`, `budget.ts`, `sessions.ts`, `roadmap.ts`, `scanner.ts`. Pages import these functions and call them directly (Server Components can call `fs`). This separation makes the data layer independently testable with Vitest.

### 8.5 Type-Driven Development
Every data structure has a TypeScript interface in `src/types/index.ts`. External data (JSON files, JSONL logs) goes through transformer functions that convert `snake_case` raw shapes to `camelCase` typed objects. Runtime `typeof` checks on external data instead of `as` casts.

### 8.6 Barrel Exports
`src/lib/index.ts` re-exports all public functions from the data layer. Pages import from `@/lib` instead of individual modules, keeping import statements clean.

### 8.7 Dynamic Imports
The Terminal component uses `next/dynamic` with `{ ssr: false }` to prevent server-side rendering of browser-only code (xterm.js requires DOM APIs). This is the code-splitting pattern for heavy client-only dependencies.

### 8.8 Composable UI Components
Shared components (`EmptyState`, `ErrorDisplay`, `Skeleton`, `AgentCard`, `BudgetChart`, `SessionChart`) are in `src/components/`. Page-specific components (local `StatusCard`, `MetricCard`, `PhaseCard`, etc.) live inside their page file to avoid unnecessary abstraction.

### 8.9 Error Boundary Pattern
Every route has an `error.tsx` file — a Client Component that catches runtime errors and shows a recovery UI (via `ErrorDisplay`). This prevents one broken page from crashing the entire app. The root `error.tsx` is the final catch-all.

### 8.10 Loading State Pattern
Every route has a `loading.tsx` file with `Skeleton` components that show placeholder UI while data loads. Next.js App Router uses React Suspense boundaries to automatically show these during server-side data fetching.

### 8.11 Empty State Pattern
When data is missing (no agents, no budget, no sessions), pages render an `EmptyState` component with an icon, message, and hint — rather than showing a blank page or crashing.

### 8.12 `force-dynamic` Export
All data-fetching pages export `const dynamic = "force-dynamic"` to disable Next.js static generation caching. Since Vena reads live files from disk, pages must always fetch fresh data on every request.

---

## 9. Security Measures (S1–S8)

All security hardening was applied to the PTY server and terminal system during Phase 5.

| ID | Measure | Summary |
|----|---------|---------|
| **S1** | Localhost Binding | PTY server binds to `127.0.0.1` only. It is never exposed on `0.0.0.0` or any network interface. Only the local machine can connect. |
| **S2** | Session Cap | Maximum 5 concurrent PTY sessions. New connections are rejected with a `1013` close code when the limit is reached. Prevents resource exhaustion. |
| **S3** | Resize Validation | Terminal resize commands (`cols`, `rows`) are validated as positive integers bounded between 1–500. Prevents malformed resize attacks that could crash the PTY process. |
| **S4** | Origin Checking | The `verifyClient` callback rejects WebSocket connections from origins other than `http://localhost:3000`. Prevents cross-site WebSocket hijacking (CSWSH). |
| **S5** | Rate Limiting | Max 10 connections per IP per 60-second window. Excessive connections return HTTP 429. Stale entries are cleaned every 5 minutes. |
| **S6** | CWD Validation | The PTY working directory (`PTY_CWD`) is validated: must exist, must be a directory. Falls back to `process.cwd()` if invalid. Prevents path traversal. |
| **S7** | Max Payload | Incoming WebSocket messages are capped at 1 MB (`maxPayload`). Prevents memory exhaustion from oversized messages. |
| **S8** | Token Authentication | The PTY server generates a random 24-byte hex token on startup, writes it to `.pty-auth-token` (file mode `0o600`). The browser fetches this token via an API route (`/api/pty-token`) and sends it as the first WebSocket message. Connections that don't authenticate within 5 seconds are terminated. |

### Additional Security Design Decisions
- **No database**: Vena reads files read-only from `.claude/` directories. No write operations, no SQL, no injection surface.
- **No authentication/authorization**: Local-only app. No user accounts, no sessions, no cookies — nothing to attack.
- **No network deployment**: Designed for `localhost` only. No cloud, no public URLs, no CORS complexity.
- **Server-only `fs` access**: The `fs` module is never imported in Client Components. File reads happen exclusively in Server Components and `src/lib/`.
- **Graceful shutdown**: PTY server handles `SIGINT`/`SIGTERM`, kills all PTY processes, closes WebSocket connections, and cleans up the auth token file.

---

## 10. Data Formats

| Format | Where Used | Summary |
|--------|-----------|---------|
| **JSON** | `budget-ledger.json` | Standard JSON object storing API budget data, alert thresholds, Claude Code usage, and authority rules. Uses `snake_case` keys; transformed to `camelCase` at read time. |
| **JSONL** | `usage-log.jsonl` | JSON Lines format — one JSON object per line. Each line is a session event (`SessionStart`, `SessionEnd`, or `SessionSummary`). Append-friendly, easy to parse line-by-line. |
| **Markdown** | Agent identities, memory files, roadmap, plans | Structured markdown with `##` headings for sections, markdown tables for data, and `<!-- vena:* -->` HTML comment markers for machine-parsable phase data. |
| **HTML Comment Markers** | `<!-- vena:phase id="X" status="Y" -->` | Custom markers embedded in markdown that the roadmap parser uses to extract structured data. The parser uses regex to find blocks between open/close markers. |

---

## 11. Design Patterns in Detail

### 11.1 Markdown-as-Database
Vena treats markdown files as its data store. Instead of a database, the roadmap parser reads `Roadmap-*.md`, the agent reader scans `*-identity.md` and `*-memory.md`, and the budget reader parses JSON/JSONL. This "files-as-data" approach means zero setup, zero migrations, and the data is always human-readable.

### 11.2 snake_case → camelCase Transformation
External data files use `snake_case` (e.g., `remaining_balance`, `session_usage_percent`). Internal TypeScript types use `camelCase`. The data layer has explicit transformer functions that map between the two, ensuring type safety at the boundary.

### 11.3 Convention-Based Discovery
Agents are discovered by scanning `.claude/` subdirectories for files matching `*-identity.md`. Roadmaps are found by looking for `Roadmap-*.md` in `plans/`. No configuration file needed — the file system structure *is* the configuration.

### 11.4 Session Pairing Algorithm
The session reader pairs `SessionStart` and `SessionEnd` events by session ID, computes durations, attaches summary metadata, filters out hook noise (sessions < 3 seconds), and groups results by date. This transforms a flat log into a structured timeline.

### 11.5 Token-Based Theme Synchronization
The terminal theme (`terminal-theme.ts`) manually maps Vena's CSS design tokens to xterm.js's `ITheme` interface. Both the web UI and the embedded terminal share the same color palette, creating a seamless visual experience.

### 11.6 Component Colocation
Page-specific helper components (like `StatusCard`, `MetricCard`, `PhaseCard`, `AlertCard`) are defined in the same file as their page. Only truly shared components live in `src/components/`. This keeps related code together and avoids premature abstraction.

---

## 12. Project Structure

| Path | Purpose |
|------|---------|
| `src/app/` | Routes and pages (App Router) — each subfolder is a URL |
| `src/app/api/` | API routes (server-side endpoints, e.g., PTY token) |
| `src/components/` | Shared UI components (Sidebar, AgentCard, Charts, EmptyState, ErrorDisplay, Skeleton) |
| `src/lib/` | Server-side data layer (file readers, parsers, transformers) — independently testable |
| `src/types/` | TypeScript type definitions for all data models |
| `server/` | Standalone PTY WebSocket server (runs as a separate process) |
| `plans/` | Planning documents (roadmap, MVP plan, testing plan, meeting agenda) |
| `tests/` | Test files, Vitest config, and screenshot evidence |
| `.claude/` | Agent team files (identities, memory, budget ledger, usage log, hooks) |

---

## 13. Tools & Scripts

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start Next.js development server with hot reload on port 3000 |
| `npm run build` | Production build — also runs TypeScript type checking |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint code quality checks |
| `npm run test` | Run Vitest unit tests (54+ tests) |
| `npm run test:watch` | Run Vitest in watch mode — re-runs on file changes |
| `npm run pty-server` | Start the standalone PTY WebSocket server on port 3001 |
| `npm run dev:full` | Start both Next.js and PTY server concurrently |

---

## 14. Git Workflow

| Convention | Details |
|-----------|---------|
| **Commit prefixes** | `feat:` (new feature), `fix:` (bug fix), `refactor:` (restructure), `chore:` (tooling/config), `docs:` (documentation) |
| **QA gate** | No code is pushed without Viktor's QA review (9-step pipeline) and the Director's explicit approval |
| **Specific file staging** | `git add <specific files>` — never `git add .` or `git add -A` to avoid committing sensitive files |

---

## 15. QA Pipeline (9 Steps)

| Step | Check | Blocking? |
|------|-------|-----------|
| 1 | Code structure & organization | No |
| 2 | Bug & edge case check | Yes |
| 3 | **Security review** | **Yes** |
| 4 | Readability & maintainability | No |
| 5 | Convention compliance (CLAUDE.md) | Yes |
| 6 | Unit tests (Vitest) | Yes |
| 7 | Return issues to responsible team lead | Yes |
| 8 | Summary report to Director | — |
| 9 | Await Director approval → push | Yes |

---

## 16. V&V Budget Model

| Concept | Summary |
|---------|---------|
| **Remaining Balance** | Total API credit remaining — decreases with each API call |
| **Usable Budget** | Monthly spending cap — how much can be spent this period |
| **Floor** | Remaining Balance minus Usable Budget — untouchable reserve |
| **Alert Levels** | Normal (>30%), Warn (≤30%), Critical (≤10%), Locked (at floor). Each triggers escalating actions from monitoring to full API lockout |
| **4-Layer Monitoring** | Layer 1: Hooks (zero-cost shell scripts), Layer 2: Session bookends (~200 tokens), Layer 3: Scheduled reports (cron), Layer 4: On-demand `/silas` activation |
