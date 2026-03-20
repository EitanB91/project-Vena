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
Phase 3 — COMPLETE (2026-03-20). Viktor verdict: PASS (two rounds). Director approved push.
Phase 4 — COMPLETE (2026-03-20). Viktor verdict: PASS (two rounds). Awaiting Director push approval.

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

### Phase 3 QA Notes
**Round 1 — 1 required fix, 3 notes:**
- F1 (REQUIRED): `slugify.ts` had no test file despite every other `src/lib/` module having tests. Fix: `tests/lib/slugify.test.ts` with 8 test cases.
- N1 (non-blocking): `getStatus` function duplicated in `AgentCard.tsx` and `[name]/page.tsx`. Fix: extracted to `src/lib/agent-status.ts` with `getAgentStatus` and `formatLastSeen`.
- N2 (non-blocking): `AgentCard.tsx` imported `slugify` directly from `@/lib/slugify` instead of barrel `@/lib`. Fixed.
- N3 (non-blocking): Magic numbers `30` and `1440` for status thresholds used in 3 places. Fix: named constants `ACTIVE_THRESHOLD_MINUTES` and `RECENT_THRESHOLD_MINUTES`.

**Round 2 — PASS:**
- All 4 findings fixed and verified
- No duplication of `getStatus` anywhere — only `getAgentStatus` in `agent-status.ts`
- All imports use barrel `@/lib`
- No raw threshold numbers in consumer code
- 6 test files, 47 tests, all passing
- Build clean, zero errors
- Visual verification: grid page, detail pages (Nova, Silas, Viktor), 404 — all verified independently with Playwright

### Phase 3 Lessons
- **Every new `src/lib/` module must have a test file** — Viktor will always check for this. No exceptions.
- **Extract shared logic immediately** — duplicated status functions across components is a maintainability risk. The Orchestrator fixed this quickly when flagged.
- **Playwright visual verification is essential** — caught that the slug bug was fixed correctly by clicking through all agent cards and verifying navigation.
- **Phase 1 carry-forward update:** SVG icon duplication between Sidebar and placeholder pages is now partially resolved — agents placeholder replaced with real content. Budget, roadmap, sessions, chat placeholders still have duplicated icons.

### Phase 4 QA Notes
**Round 1 — 1 required fix, 3 notes:**
- F1 (REQUIRED): `readPlanFiles` function embedded in `roadmap/page.tsx` with `fs` imports — breaks data layer pattern. Every other reader lives in `src/lib/` with tests. Fix: moved to `src/lib/roadmap.ts`, exported from barrel, 7 tests added.
- N1 (non-blocking): Hardcoded hex colors in `BudgetChart.tsx` and `SessionChart.tsx` duplicate design tokens. Recharts SVG limitation — cannot use CSS variables. Fix: sync-warning comments added.
- N2 (non-blocking): `AlertCard` in `budget/page.tsx` — inner span derived `bg-*` class from comparing text color strings. Fix: simplified config to use `dotColor` field directly.
- N3 (non-blocking): `text-[11px]` arbitrary value spread to 11 occurrences across 5 files. Phase 1 carry-forward. Fix: `text-micro` design token added to `globals.css`, all occurrences replaced.

**Round 2 — PASS:**
- All 4 findings fixed and verified
- No `fs` imports in any page file
- Zero `text-[11px]` in codebase
- AlertCard simplified with no string comparison
- 6 test files, 54 tests, all passing
- Build clean, zero errors
- Visual verification: Dashboard, Budget, Sessions, Roadmap — all independently verified with Playwright

### Phase 4 Lessons
- **Data readers always go in `src/lib/`** — even if the page is a Server Component and technically allowed to use `fs`, the project pattern is clear: readers in `src/lib/`, with tests. Viktor caught this same pattern violation in Phase 3 (slugify) and Phase 4 (readPlanFiles).
- **Recharts requires hardcoded hex** — SVG fills/strokes don't support CSS custom properties. Document this with comments so future devs know to keep them in sync with `globals.css`.
- **Design token debt compounds** — `text-[11px]` started as 1 occurrence in Phase 1, grew to 11 by Phase 4. Formalizing `text-micro` token early would have prevented spread. Lesson: formalize arbitrary values after 2-3 uses, not after 11.
- **Phase 1 carry-forward resolved:** SVG icon duplication fully resolved — all placeholder pages replaced with real content. `text-[11px]` resolved via `text-micro` token. Only `text-[10px]` (1 occurrence, Sidebar version badge) remains — acceptable.

### Phase 5 — Next (CLI Passthrough Chat)
Upcoming QA focus: xterm.js integration, client-side terminal component, theme matching with design tokens, session management.
