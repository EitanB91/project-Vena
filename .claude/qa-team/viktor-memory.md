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

### Phase 1 QA Notes
- SVG icons duplicated between Sidebar and placeholder pages — will resolve when placeholders are replaced
- `text-[10px]`/`text-[11px]` arbitrary values in Sidebar — cosmetic, Nova may formalize later
- No unit test runner yet (carried from Phase 0, not blocking)
- Independent Playwright verification: all 6 routes, click navigation, round-trip confirmed

### Phase 2 — Next (File Readers & Data Layer)
Upcoming QA focus: server-side file readers, TypeScript types, no fs in client code, parser correctness.
