# Silas — Working Memory

## Current Project
**Project Vena** — Claude Code Project Dashboard. Phase 3 complete as of 2026-03-20.
Previous project context: Pixel Art Tool v0.2.0 shipped, O6 Animation sprint was active.

## Budget Status — Claude API
| Field | Value | Updated |
|-------|-------|---------|
| Remaining Balance | $4.87 | 2026-03-17 |
| Usable Budget (monthly) | $4.00 | 2026-03-17 |
| Floor (untouchable) | $0.87 | 2026-03-17 |
| Alert Level | Normal | 2026-03-17 |

## Budget Status — Claude Code (Pro Plan)
| Field | Value | Updated |
|-------|-------|---------|
| Session (5hr) usage | TBD | 2026-03-19 |
| Weekly (7d) usage | TBD | 2026-03-19 |
| Daily/weekly soft limits | TBD — next sprint planning | — |

## Project Vena Budget Impact
- **API cost:** $0.00 — entire project uses CLI passthrough (Pro quota only)
- **Chat strategy:** xterm.js embedded terminal running `claude` CLI
- **Estimated Pro quota:** ~60% total spread across 3 weeks (~20%/week)

## Conventions
- **Plan/Roadmap files:** All saved in `plans/` directory with meaningful names (e.g., `Plan-MVP.md`, `Roadmap-Project-Vena.md`). Never random names.

## Phase Status
Phase 0 — COMPLETE (2026-03-19). Commit `371bc76`. Zero API cost.
Phase 1 — COMPLETE (2026-03-19). Zero API cost. Pro quota usage: light (single session, build + QA).
Phase 2 — COMPLETE (2026-03-19). Zero API cost. Pro quota usage: moderate (data layer build + 2-round QA + test setup).
Phase 3 — COMPLETE (2026-03-20). Zero API cost. Pro quota usage: moderate (UI build + 2-round QA + memory updates).
Phase 4 — COMPLETE (2026-03-20). Zero API cost. Pro quota usage: moderate (charts + 4 pages + 2-round QA).
Phase 5 — COMPLETE (2026-03-20). Zero API cost. Pro quota usage: heavy (xterm.js + PTY server + 8 security fixes + 2-round QA).
Phase 6 — COMPLETE (2026-03-20). Zero API cost. Pro quota usage: moderate (responsive + polish + 2-round QA). **v1.0 milestone.**

## Active Alerts
None.

## Recent Decisions
- V&V team created (2026-03-17)
- Monitoring stack: Option A (hooks + bookends + cron + on-demand)
- At floor: only the Director can authorize API usage
- Silas Scale for spoken reports; budget-ledger.json always has real numbers
- Project Vena approved with $0 API cost (2026-03-19)

## Open Items
- Daily/weekly soft limits to be defined at next sprint planning meeting
- Cron schedules for daily/weekly reports to be configured
- Director to provide API usage updates periodically (Silas cannot query automatically)
- Monitor Pro plan quota during Vena development

## Notes
_Update this file at session compaction and at every phase transition._
