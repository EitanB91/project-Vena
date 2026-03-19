# Viktor — QA Memory: Project Vena

## Project Purpose
Project Vena — local web dashboard for Claude Code projects. Next.js + TypeScript + Tailwind.

## Convention Checks (adapted for Next.js)
- No `fs` usage in client components (only Server Components and API routes)
- TypeScript strict mode enabled
- Tailwind classes follow design token conventions (Nova's approval)
- API routes validate input
- All environment variables stay server-side
- **Plan/Roadmap files:** Must be in `plans/` directory with meaningful names (`Plan-<name>.md`, `Roadmap-<name>.md`). Never random/generated names.
- **ROADMAP.md:** Must use Vena convention markers (`<!-- vena:roadmap -->`, `<!-- vena:phase -->`, `<!-- vena:sprint -->`)

## QA Pipeline (8 steps)
1. Code structure review
2. Bug analysis
3. Readability check
4. Convention compliance (see above)
5. Test coverage verification
6. Issue resolution
7. Director summary
8. Git push gate

## Build Status
Phase 0 — COMPLETE (2026-03-19). Commit `371bc76`. Viktor verdict: PASS.
Phase 1 — COMPLETE (2026-03-19). Viktor verdict: PASS. Director approved push.
Phase 2 — COMPLETE (2026-03-19). Viktor verdict: PASS (two rounds). Director approved push.

### Phase 1 QA Notes (carry-forward)
- SVG icons duplicated between Sidebar and placeholder pages — will resolve when placeholders are replaced
- `text-[10px]`/`text-[11px]` arbitrary values in Sidebar — cosmetic, Nova may formalize later

### Phase 2 QA Notes
**Round 1 — BLOCKED (1 bug, 2 notes):**
- B1 (BLOCKING): `transformUsageEvent` in `budget.ts` — SessionSummary events in real `usage-log.jsonl` lack a `session` field. Code used `as string` cast on `undefined`, creating phantom session with `id: undefined`. Fix: `typeof` check + synthetic ID generation (`synthetic-{timestamp}`).
- N1 (non-blocking): `readProjectRoadmap` in `roadmap.ts` used string concatenation instead of `path.join()`. Inconsistent with other modules. Fixed.
- N2 (non-blocking): sort comparator in `sessions.ts` returned `1` or `-1` but never `0` for equal values. Fixed to proper three-way comparator.

**Round 2 — PASS:**
- All 3 findings fixed and verified
- Bonus fix: `parseKeyPhrases` regex only matched `*"..."*` (Nova-style), not plain `"..."` (Viktor-style). Orchestrator fixed both regex and section lookup order.
- Vitest runner set up — 5 test files, 39 tests, all passing
- B1 has dedicated regression test (budget.test.ts:38-46)
- Build clean, lint clean, all tests green

### Phase 2 Lessons
- **`as` casts on `Record<string, unknown>` are dangerous** — they bypass TypeScript's safety. The B1 bug was invisible to the compiler because `undefined as string` doesn't error. Prefer `typeof` runtime checks for data from external files.
- **Vitest is now available** — `npm test` runs 39 tests in ~2s. All pure logic in `src/lib/` is now testable. No more "no test runner" carry-forward finding.
- **Test against real data** — the B1 bug was only caught because QA checked against the actual `usage-log.jsonl` file, not just synthetic test data.

### Phase 3 — Next (Agent Dashboard)
Upcoming QA focus: UI components, agent cards, status indicators, design token usage, Playwright visual verification.
