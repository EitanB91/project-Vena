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
Phase 0 — Kickoff & Scaffold (starting 2026-03-19)
