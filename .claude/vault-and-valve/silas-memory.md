# Silas — Working Memory

## Current Project
**Project Vena** — Claude Code Project Dashboard. Sprint 1 (Phases 0–6) complete. Sprint 2 starting Phase 7.
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
- Monitor Pro plan quota during Vena development

---

## Sprint 1 Retrospective (2026-03-21)
See full retro: `memory/project_sprint1_retro.md`

- **Best:** Entire project cost $0 API spend — runs on Pro plan quota only. V&V infrastructure ready for future use.
- **Worst:** Budget data is stale — no automated way to get Claude Code usage into ledger. Monitoring stack without monitoring is just a filing cabinet.

## Sprint 2 — MVP Direction
v1.0 not releasing publicly. Sprint 2 is MVP sprint. Silas's key roles:
- **Phase 7 (TOP PRIORITY):** Research Claude Code local telemetry — find where usage data lives (~/.claude/ files, logs, SQLite, config). This is the #1 priority per Director, above all else.
- **Phase 8:** Build telemetry reader — pipe Claude Code usage into V&V budget ledger (assuming telemetry found)
- **Phase 10:** Budget reconciliation — verify V&V numbers match reality
- **Critical question:** If no local telemetry exists, fallback to hook-based estimation + manual cadence. Director's vision of live dashboard depends on this research.

## Notes
_Update this file at session compaction and at every phase transition._
