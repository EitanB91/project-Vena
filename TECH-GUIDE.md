# TECH-GUIDE.md — Project Vena

Education document for the Director. Explains the technologies, patterns, and concepts used in this project so you can follow along, ask better questions, and make informed decisions.

---

## Next.js 16 (App Router)

### What it is
Next.js is a React framework that handles routing, server-side rendering, and bundling. We use version 16 with the **App Router** — the modern routing system based on the file system.

### How routing works
Every folder inside `src/app/` becomes a URL route. The file `page.tsx` inside that folder is the page component.

```
src/app/page.tsx          → http://localhost:3000/
src/app/agents/page.tsx   → http://localhost:3000/agents
src/app/budget/page.tsx   → http://localhost:3000/budget
```

### Server Components vs Client Components
By default, every component in App Router is a **Server Component** — it runs on the server, can read files, query databases, and never ships JavaScript to the browser.

When you need interactivity (click handlers, state, browser APIs), you add `"use client"` at the top of the file to make it a **Client Component**.

**Rule of thumb:** keep components as Server Components unless they need `useState`, `useEffect`, `onClick`, or other browser-only features.

### Layouts
`layout.tsx` wraps all pages in its directory. The root `src/app/layout.tsx` wraps the entire app — this is where we put the sidebar, fonts, and dark theme class.

---

## TypeScript

### What it is
TypeScript = JavaScript + types. It catches bugs at compile time by enforcing that variables, function parameters, and return values have declared types.

### Strict mode
We have `"strict": true` in `tsconfig.json`. This means:
- No implicit `any` — every variable must have a known type
- Null checks are enforced — you can't use a value that might be `null` without checking first
- Function parameters must match their declared types

### Why it matters
Catches bugs before runtime. The build will fail if types don't match — this is intentional.

---

## Tailwind CSS v4

### What it is
A utility-first CSS framework. Instead of writing CSS classes like `.header { color: blue; }`, you apply utility classes directly in HTML: `className="text-blue-500 font-bold"`.

### How v4 differs from v3
- **No `tailwind.config.js`** — configuration happens in CSS using `@theme` blocks
- **CSS-first configuration** — design tokens (colors, fonts, spacing) are defined in `globals.css`
- **`@import "tailwindcss"`** replaces the old `@tailwind` directives

### Design tokens
Nova defines our design tokens in `src/app/globals.css` using CSS custom properties and `@theme` blocks:

```css
@theme inline {
  --color-vena-bg: #0a0a0f;
  --color-vena-surface: #12121a;
  --color-vena-accent: #6366f1;
}
```

Then used in components: `className="bg-vena-bg text-vena-accent"`

---

## React Concepts

### Components
A component is a function that returns JSX (HTML-like syntax). Components are the building blocks of the UI.

```tsx
function AgentCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="p-4 rounded-lg bg-vena-surface">
      <h3>{name}</h3>
      <p>{role}</p>
    </div>
  );
}
```

### Props
Data passed from a parent component to a child. Like function arguments.

### State (`useState`)
Data that changes over time within a component. When state changes, the component re-renders.

```tsx
"use client";
const [isOpen, setIsOpen] = useState(false);
```

### Effects (`useEffect`)
Code that runs after render — for fetching data, setting up subscriptions, etc. Only in Client Components.

---

## File System Reading (Server-Side)

### How Vena reads `.claude/` directories
Since Vena is local-only, we use Node.js `fs` module in Server Components and `src/lib/` utilities to read files directly from disk. This is safe because:
1. Server Components run on the server (Node.js), not in the browser
2. The app is local-only — no public access
3. We never expose `fs` to Client Components

```tsx
// src/lib/agents.ts (server-side only)
import { readFileSync } from 'fs';

export function readAgentIdentity(path: string) {
  return readFileSync(path, 'utf-8');
}
```

---

## Project Structure Explained

| Path | Purpose |
|------|---------|
| `src/app/` | Routes and pages (App Router) |
| `src/components/` | Reusable UI components (buttons, cards, sidebar) |
| `src/lib/` | Server-side utilities (file readers, parsers) |
| `src/types/` | TypeScript type definitions |
| `plans/` | Planning documents (roadmap, MVP plan) |
| `tests/` | Test files and screenshot evidence |
| `.claude/` | Agent team files (identities, memory, budget, hooks) |

---

## Key Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Production build — also type-checks |
| `npm run lint` | Run ESLint to check code quality |
| `npm run start` | Serve the production build |

---

## Markdown Parsing

Vena reads roadmap and plan files written in Markdown. We use HTML comment markers to help the parser find sections:

```markdown
<!-- vena:phase id="1" status="in-progress" -->
### Phase 1 — Dashboard Shell
- [x] Sidebar component
- [ ] Dark theme
<!-- /vena:phase -->
```

The parser looks for these markers and extracts structured data (phase ID, status, tasks, completion %).

---

## ESLint

A code linting tool that enforces code style and catches common mistakes. Our config (`eslint.config.mjs`) extends `eslint-config-next` which includes React and Next.js specific rules.

Run with: `npm run lint`

---

## Git Workflow

Simple commit-based workflow:

```bash
git add src/app/page.tsx          # stage specific files
git commit -m "feat: add sidebar" # commit with prefix
git push                          # push to GitHub
```

**Commit prefixes:**
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code restructure, no behavior change
- `chore:` — tooling, config, dependencies
- `docs:` — documentation only

**Important:** No push happens without Viktor's QA review and your approval.
