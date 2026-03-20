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

## QA Pipeline (9 steps — updated Phase 5, 2026-03-20)
1. Code structure review
2. Bug analysis
3. **Security review** (all findings block — Director mandate)
4. Readability check
5. Convention compliance (see above)
6. Test coverage verification
7. Issue resolution
8. Director summary
9. Git push gate

### Security Review Checklist
- Network exposure (localhost binding, no `0.0.0.0`)
- Authentication & authorization
- Input validation (all external inputs bounded)
- Resource limits (connections, sessions, message sizes, rate limits)
- Origin/CORS policy (WebSocket, API endpoints)
- Environment variable validation
- No secrets in client code
- Dependency surface audit

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

### Phase 5 QA Notes
**Round 1 — BLOCKED (8 security findings, 1 note):**

Security findings (all blocking — Director mandate):
- S1 (CRITICAL): WebSocket server bound to `0.0.0.0` — exposed on entire network. Fix: `host: "127.0.0.1"`.
- S2 (CRITICAL): No session limit — unlimited PTY processes. Fix: `MAX_SESSIONS = 5` cap.
- S3 (HIGH): No resize validation — cols/rows unvalidated. Fix: `isValidResize()` with bounds 1–500.
- S4 (HIGH): No origin checking — cross-site WebSocket hijacking possible. Fix: `verifyClient` + `ALLOWED_ORIGINS`.
- S5 (MEDIUM): No rate limiting — connection floods possible. Fix: 10/min/IP rate limiter.
- S6 (MEDIUM): `PTY_CWD` env var unvalidated. Fix: `resolveWorkingDirectory()` with existence + directory checks.
- S7 (MEDIUM): No max message size. Fix: `maxPayload: 1MB` on WebSocketServer.
- S8 (LOW→MEDIUM): No authentication. Fix: cryptographic token auth — server writes `.pty-auth-token`, client fetches via `/api/pty-token` API route, sends as first WebSocket message.

Convention note:
- N1 (non-blocking): `event.data as string` in Terminal.tsx — `as` cast on external data. Fix: `typeof` runtime check.

**Round 2 — PASS:**
- All 8 security findings fixed and independently verified
- N1 fixed — no `as` casts on external data in Phase 5 code
- Build clean, 54/54 tests pass
- Visual verification: terminal connects, authenticates, renders prompt
- QA pipeline upgraded to 9 steps (Step 3: Security Review added)

### Phase 5 Lessons
- **Security is first and foremost** — Director mandate (2026-03-20). All security findings block by default. Design for public distribution, never assume local-only as mitigation.
- **QA pipeline now 9 steps** — Security Review added as Step 3, with full checklist (network, auth, input, resources, origin, env, secrets, deps).
- **PTY servers need defense in depth** — Spawning shell processes is inherently high-risk. Even a "local" tool needs localhost binding, auth, session caps, rate limiting, input validation, and message size limits.
- **Token sharing pattern** — Server writes file, client reads via API route. Avoids `NEXT_PUBLIC_*` exposure while enabling seamless `dev:full` startup.
- **First security-focused QA** — Proved the value of the security checklist immediately. 8 real findings in Round 1, all fixed in Round 2.

### Phase 6 QA Notes
**Round 1 — 2 required fixes, 1 note:**
- F1 (REQUIRED): `budget/page.tsx` main content branch had `p-8` instead of `p-4 md:p-8`. The `replace_all` edit only caught the empty-state return, not the main return. Fix: changed to `p-4 md:p-8`.
- F2 (REQUIRED): `roadmap/page.tsx` — same issue as F1. Same root cause. Fix: changed to `p-4 md:p-8`.
- N1 (non-blocking → fixed by Director request): Dashboard Quick Glance panels used plain text for empty states instead of icon + message pattern. Fix: added inline icon circles matching EmptyState visual language.

**Round 2 — PASS:**
- All 3 findings fixed and verified
- Grep verification: every `p-8` in page wrappers now has `p-4 md:p-8` — 9 occurrences, 7 pages, all consistent
- No security findings (pure UI phase — no new endpoints, servers, env vars, or deps)
- Build clean, 54/54 tests pass
- Visual verification: desktop + mobile screenshots confirmed by Orchestrator

### Phase 6 Lessons
- **`replace_all` doesn't mean "all instances across the file"** — it means all occurrences of the exact match string. When a file has multiple branches returning different wrapper divs (e.g., empty-state return vs. main-content return), each is a unique string and must be matched separately. Viktor caught two pages where only one branch was updated.
- **Verify responsive changes with grep, not eyeball** — A single `grep` for the old pattern across all page files would have caught F1/F2 instantly. The Orchestrator should grep for the old value after a responsive pass to confirm zero remaining occurrences.
- **Pure UI phases have fewer but subtler bugs** — No logic errors, no security issues, but CSS inconsistencies across multiple files. The risk shifts from "does it work?" to "is it consistent?"
- **Phase 1 carry-forward fully resolved** — All design debt from Phase 1 is closed. `text-[11px]` → `text-micro` (Phase 4). SVG duplication → real content (Phase 4). Responsive sidebar → Phase 6. Only `text-[10px]` (1 occurrence, Sidebar version badge) remains — accepted.

### Cumulative QA Stats (Phases 0–6)
- Total QA rounds: 12 (6 phases × ~2 rounds average)
- Total findings: F1-F2 + 8 security + 4 required + ~12 notes = ~26 findings caught
- Zero bugs shipped to git. QA pipeline is battle-tested across 6 phases.
- All phases passed with either PASS or PASS WITH NOTES → fixes → PASS.
