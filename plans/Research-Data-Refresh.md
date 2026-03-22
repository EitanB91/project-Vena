# Research: Next.js Data Refresh Patterns

**Task:** 7.2 — Phase 7 (Sprint 2)
**Researcher:** Orchestrator
**Date:** 2026-03-22
**Verdict:** `router.refresh()` polling is the primary pattern. API routes + SWR for telemetry. SSE for terminal.

---

## Executive Summary

Vena needs near-real-time display of filesystem data (`.claude/` and `~/.claude/`). Three patterns are available in Next.js App Router, each suited to different update frequencies.

---

## Pattern 1: `router.refresh()` Polling (Primary)

**How:** Client component calls `router.refresh()` on an interval. Server components re-render with fresh data. Client state (scroll, inputs) is preserved.

**Best for:** Dashboard home, agents, budget, roadmap, sessions — data that changes every few seconds.

**Interval:** 5–10 seconds.

**Implementation:**

```typescript
// src/hooks/usePolling.ts
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function usePolling(intervalMs: number = 5000) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, router])
}
```

**Pros:** Zero API routes needed. Works with existing `force-dynamic` pages. Flicker-free via RSC diffing.

**Cons:** Refreshes entire route. Not suitable for sub-second updates.

---

## Pattern 2: API Routes + SWR (Targeted)

**How:** Create `/api/telemetry` (etc.) route handlers. Client polls via SWR or `useEffect` + `fetch`.

**Best for:** Telemetry data, live token counters — sections that update independently and frequently.

**Interval:** 3–5 seconds.

**Pros:** Fine-grained, smaller payloads, isolated refresh zones.

**Cons:** Extra API layer, separate type management, requires `'use client'` boundary.

---

## Pattern 3: Server-Sent Events (SSE) with `fs.watch()`

**How:** Route handler returns a `ReadableStream` with `text/event-stream` headers. Server watches files via `fs.watch()` and pushes events.

**Best for:** Terminal output, live session logs — data that changes unpredictably and needs push-based updates.

**Pros:** Lower latency, no wasted requests.

**Cons:** Persistent connection, more complex setup, `fs.watch()` needs debouncing.

---

## Recommendation for Vena (Sprint 2)

| Layer | Pattern | Interval | Pages |
|-------|---------|----------|-------|
| **Primary** | `router.refresh()` | 5–10s | Dashboard, Agents, Budget, Roadmap, Sessions |
| **Telemetry** | API routes + SWR | 3–5s | Telemetry charts, per-message tokens |
| **Terminal** | SSE + `fs.watch()` | Push-based | Chat/terminal view |

### Additional Best Practices

- **Pause on tab blur:** Don't poll when the tab is hidden (`document.visibilityState`).
- **Cleanup intervals:** Always `clearInterval` in `useEffect` cleanup.
- **Debounce `fs.watch()`:** OS-level watchers emit duplicate events. Use 500ms debounce.
- **No sub-second polling:** Filesystem reads are fast but not free. 3s minimum.

---

## Integration with Existing Architecture

The current `force-dynamic` export on all data pages is correct. No changes needed to existing server components. The polling hook wraps them in a client layout component that triggers `router.refresh()`.

For Phase 8, the telemetry reader (8.1) will use Pattern 2 — API route at `/api/telemetry` returning session/token data, polled by SWR from the dashboard.
