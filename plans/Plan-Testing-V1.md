# Vena v1.0 — Director's Testing Plan

Comprehensive manual testing checklist for the Director to validate every feature shipped in Sprint 1 (Phases 0–6).

**How to use:** Work through each section top-to-bottom. Mark items ✅ or ❌ as you go. Write notes in the **Comments** column — these feed directly into the Sprint 2 planning meeting.

---

## Prerequisites

| # | Step | Details |
|---|------|---------|
| 1 | Install dependencies | Run `npm install` in the project root |
| 2 | Start dev server | Run `npm run dev` — confirm no errors, server starts on `http://localhost:3000` |
| 3 | Open browser | Navigate to `http://localhost:3000` |
| 4 | Verify `.claude/` data exists | The app reads from `.claude/` in the project root. Confirm agent identities, budget ledger, and usage log are present |

---

## Section 1 — App Shell & Navigation (Phase 1)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 1.1 | Page loads without errors | Dashboard home renders, no blank screen, no console errors | ✅| |
| 1.2 | Dark theme applied | Background is dark (#0a0a0f or similar), text is light, no white-flash on load |✅ | |
| 1.3 | Sidebar visible (desktop) | Left sidebar shows: Dashboard, Agents, Budget, Roadmap, Sessions, Chat | ✅| |
| 1.4 | Sidebar navigation works | Click each link — page changes, active link is highlighted in accent color |✅ | |
| 1.5 | Logo and version shown | "Vena" label + "v0.1" version in sidebar header |✅ | |
| 1.6 | Sidebar footer | "Project Vena" text in sidebar footer |✅ | |

---

## Section 2 — Dashboard Home Page

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 2.1 | Status cards render | Four cards: Phase, Agents, API Budget, Sessions — all show real data |❌ | agents data not live  |
| 2.2 | Phase card | Shows current phase number and title (or "All phases complete") |❌ | |
| 2.3 | Agents card | Shows total agent count and active count |❌ | active count wrong|
| 2.4 | Budget card | Shows dollar amount, alert level text, color matches alert level | ✅| |
| 2.5 | Sessions card | Shows session count and total minutes | ✅|not shoure if the data is updated |
| 2.6 | Roadmap progress panel | Shows all phases with progress bars and percentage |✅ ||
| 2.7 | Team panel | Shows all agents with avatar initials, name, role, and status dot |✅ | |
| 2.8 | Active agent pulse | Active agents have a pulsing green dot; idle agents have gray dot |❌ |didn't change color for active agents |

---

## Section 3 — Agents Page (Phase 3)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 3.1 | Navigate to /agents | Page loads, shows "Agents" heading with description |✅ | |
| 3.2 | Agent count stats | Shows "Total Agents" and "Active" counts at top |❌ |Active status and number didn't changed for active agents. |
| 3.3 | Agent cards render | Grid of cards — one per agent (Nova, Viktor, Silas, etc.) | ✅| |
| 3.4 | Card content | Each card shows: name, role, color-coded avatar, status indicator |✅ | |
| 3.5 | Click agent card | Navigates to agent detail page (`/agents/[name]`) | ✅| |
| 3.6 | Agent detail page | Shows full identity info (name, role, description) and memory content | ✅| |
| 3.7 | Back navigation | Browser back button returns to agent list correctly |✅ | |
| 3.8 | Empty state | If you temporarily rename `.claude/` — shows "No agents found" empty state |✅ | |

---

## Section 4 — Budget Page (Phase 4)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 4.1 | Navigate to /budget | Page loads, shows "Budget" heading |✅ | |
| 4.2 | Metric cards | Four cards: Remaining Balance, Usable Budget, Floor (Reserved), Alert Level |✅ | |
| 4.3 | Dollar amounts | Values match what's in `.claude/vault-and-valve/budget-ledger.json` | ✅| |
| 4.4 | Alert level indicator | Colored dot + text (Normal/Warning/Critical/Locked) matches actual threshold |✅ | |
| 4.5 | Budget breakdown chart | Recharts pie/donut chart shows usable vs floor vs spent segments |✅ | |
| 4.6 | Chart legend | Legend shows Available (green), Floor (yellow), Spent (red if applicable) |✅ | |
| 4.7 | Claude Code usage section | Shows plan name, session usage bar, weekly usage bar |❌ | |
| 4.8 | Usage bar colors | Green <50%, yellow 50-80%, red >80% |✅ | |
| 4.9 | Reset timestamps | Session and weekly reset dates shown and formatted correctly |✅ | |
| 4.10 | Alert thresholds section | Shows warn %, critical %, and at-floor authority text |✅ | |
| 4.11 | Empty state | Temporarily rename budget-ledger.json — shows "No budget ledger found" |✅ | |

---

## Section 5 — Roadmap Page (Phase 4)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 5.1 | Navigate to /roadmap | Page loads, shows "Roadmap" heading |✅ | |
| 5.2 | Phase/feature counts | Stats show completed phases count and total features |✅ |data not updated, phase 6 allready finished |
| 5.3 | Vision section | Displays the roadmap vision text | ✅ | |
| 5.4 | Phase timeline cards | One card per phase (0–6), each with title, goal, status badge |✅  | |
| 5.5 | Phase progress bars | Each phase shows task count and completion percentage bar |✅  | |
| 5.6 | Status colors | Complete=green, In Progress=accent/blue with pulse, Planned=gray |✅ | |
| 5.7 | Current phase tasks | The in-progress/next phase shows expanded task checklist |✅ | |
| 5.8 | Completed date shown | Completed phases show their completion date |✅ | change date format to : DD-MM-YYYY |
| 5.9 | Feature registry table | Table with Feature, Phase, Priority, Status columns |✅ | |
| 5.10 | Priority colors | Critical=red, High=yellow, Medium=gray |✅ | |
| 5.11 | Plan documents section | Shows plan files (Plan-MVP.md, Roadmap, etc.) with file icon and line count |✅ |can we click and show them in the browser? |
| 5.12 | Empty state | Temporarily rename plans/ dir — shows "No roadmap found" | ✅| |

---

## Section 6 — Sessions Page (Phase 4)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 6.1 | Navigate to /sessions | Page loads, shows "Sessions" heading |✅ | |
| 6.2 | Stats displayed | Total sessions, total minutes, days active counts at top |✅ | |
| 6.3 | Daily activity chart | Recharts bar chart showing sessions and minutes per day |✅ |change date format to : DD-MM; data is not updated it showing last daily activity for the 17.03 but we worked every day |
| 6.4 | Chart legend | Shows "Sessions" and "Minutes" with color indicators |✅ | |
| 6.5 | Session list by date | Sessions grouped by date (newest first), with date headers |✅ |data not updated to the last real life data.|
| 6.6 | Session row details | Each session shows: ID prefix, start→end time, duration, source |✅ | |
| 6.7 | Session categories | Category tags (research, code_build, etc.) displayed as pills |✅ |shown only for one session "syntheti" in the others there arn't any categories |
| 6.8 | Phase tags | Sessions with phase info show phase badge |✅ | |
| 6.9 | Cost display | Sessions with API cost show dollar amount in warning color | | didn't have one so this will be tested in the future for now Non-blocking|
| 6.10 | Active session | Active sessions show pulsing green dot and "active" text |✅ | |
| 6.11 | Empty state | With no usage-log.jsonl — shows "No sessions found" |✅ | |

---

## Section 7 — Chat / CLI Passthrough (Phase 5)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 7.1 | Navigate to /chat | Page loads, shows "Chat" heading and terminal area |✅ | |
| 7.2 | Connection status | Shows "Disconnected" with red dot initially (if PTY server not running) |✅ | |
| 7.3 | Start PTY server | Run PTY server separately — terminal should connect, status becomes "Connected" (green) |✅ | why it's not automated - for me that a blocking!|
| 7.4 | Terminal renders | xterm.js terminal visible with dark theme matching dashboard |✅ | |
| 7.5 | Type in terminal | Can type commands, see output | ✅| |
| 7.6 | Session ID shown | Session ID appears in header after connection |✅ | |
| 7.7 | New Session button | Click "New Session" — terminal resets, new session starts |✅ | |
| 7.8 | Footer hints | Shows keyboard hint ("claude to start...") and PTY server note |✅ | |
| 7.9 | PTY server not running | Graceful error — status shows "Disconnected", no app crash |✅ | |

---

## Section 8 — Responsive Design (Phase 6)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 8.1 | Resize to mobile (<768px) | Sidebar collapses, hamburger menu appears in top bar |✅ | |
| 8.2 | Mobile hamburger menu | Click hamburger — sidebar slides in from left with backdrop overlay | ✅| |
| 8.3 | Close mobile sidebar | Click backdrop or close button (X) — sidebar closes | ✅| |
| 8.4 | Navigate on mobile | Click a nav link — sidebar closes, page navigates correctly |✅ | |
| 8.5 | Mobile top bar | Shows "Vena" branding, version, and hamburger icon |✅ | |
| 8.6 | Card grid responsive | Status cards stack on mobile (1 col), 2 cols on tablet, 4 on desktop |✅ | |
| 8.7 | Agent grid responsive | 1 col mobile, 2 cols tablet, 3 cols desktop | ✅| |
| 8.8 | Padding responsive | Pages use tighter padding on mobile (p-4) vs desktop (p-8) |✅ | |
| 8.9 | Charts responsive | Charts resize correctly, no overflow or clipping |✅ | |
| 8.10 | Table responsive | Feature registry table scrolls horizontally on small screens |✅ | |

---

## Section 9 — Loading & Error States (Phase 6)

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 9.1 | Loading skeletons | On slow connection / first load, skeleton placeholders appear briefly |✅ | |
| 9.2 | Error boundary — agents | If agents data throws, error page shows with "Something went wrong" message |✅ | |
| 9.3 | Error boundary — budget | If budget data throws, error page shows with recovery option |✅ | |
| 9.4 | Error boundary — roadmap | If roadmap parse fails, error page shows |✅ | |
| 9.5 | Error boundary — sessions | If sessions data throws, error page shows |✅ | |
| 9.6 | Error boundary — chat | If terminal fails, error page shows |✅ | |
| 9.7 | Empty states consistent | All empty states use the same EmptyState component with icon + message + hint | ✅| |

---

## Section 10 — Cross-Cutting Concerns

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 10.1 | Production build | `npm run build` completes with no errors |✅ | |
| 10.2 | Lint check | `npm run lint` passes with no errors |❌ |5 problems (4 errors, 1 warning) |
| 10.3 | No console errors | Check browser DevTools console — no red errors on any page | |skiped |
| 10.4 | No TypeScript warnings | Build output shows no type errors | |skiped |
| 10.5 | Font rendering | Inter font loads correctly, text is crisp | | skiped|
| 10.6 | Design consistency | All pages use same color tokens, spacing, card styles |✅ | |
| 10.7 | No dead links | All sidebar links navigate to real pages |✅ | |
| 10.8 | Page titles / headings | Each page has correct heading and subheading | ✅| |
| 10.9 | Accessibility basics | Interactive elements are keyboard-focusable, buttons have aria-labels |✅ | |
| 10.10 | Performance | Pages load quickly, no visible jank or layout shift |✅ | |

---

## Section 11 — Data Accuracy Spot-Check

| # | Test | Expected Result | Pass? | Comments |
|---|------|-----------------|-------|----------|
| 11.1 | Agent count matches files | Number of agents on dashboard matches actual `.claude/` subdirectories with identity files |✅ | |
| 11.2 | Budget numbers match ledger | Open `budget-ledger.json` — verify displayed values match raw data |✅ | not sure|
| 11.3 | Roadmap phases match markdown | Open `Roadmap-Project-Vena.md` — verify phase count, titles, tasks match | ✅| not sure|
| 11.4 | Session count matches log | Count lines in `usage-log.jsonl` — verify session count on dashboard |✅ | not sure|
| 11.5 | Alert level calculation | Manually calculate usable% from ledger — verify alert level matches threshold rules |✅ | |

---

## Post-Testing Summary Template

Fill this out after completing all sections:

```
VENA v1.0 — Director's Testing Report
Date: 21-03-206

Total tests: 83
Passed:  87
Failed:  8
Skipped: 3

Critical issues (BLOCKED - must fix):
!!! IMPORTANT !!! 
overall I see in a lot of places that data not updated to the last real life data. we should investigate that ASAP , maybe our record mecenashions don't work well or somethink with the data streaming to Vena or something entery else.
!!!!!!!!!!!!
1. 2.1 the Active agents number don't updates in real time. i'v activated 2 agents (Orcehstrator and nova) and they didn't changed to "active" and the total number of active agents didn't changed.
2. 2.2 Phase showing "phase 6" but it should show "All phases complete" .
3. 4.7 the data don't match the real usage but i see that the ledger also don't show real usage. need to think how make silas input real time usage data.
4. 2.3 active count wrong
5. 2.8 didn't change color for active agents
6. 3.2 Active status and number didn't changed for active agents
7. 10.2 "npm run lint" faild with 5 problems (4 errors, 1 warning). i added the error log at the end of this document (after "Overall verdict").

Non-critical issues (nice to fix in Sprint 2):
1. It's feels like there isn't automatic update of the data (livestream?) or i didn't used it right.
2. in 6.6 need to add the title of the session and a little summary of the session.
3. the chat is a command terminal it's nice but how it enables the user to speak with claude? we need a chatbox like in the Claude web or Claude code in VS.
4. to acttivate the chat i needed to do stuff on my local terminal, we can't ask things like that from the user, it must be done otherway (if we keep this CLI terminal)

UX/Design observations:
1. version shown but barley visibale, make the color a bit brighter(less gray) and +2 to the font size.
2. we should add to the logo name something techy so user understand that this is a dashboard, like "VenaOS".
3.

Feature requests / ideas for Sprint 2:
* option to manualy add/remove project from the dashboard.
* Section 5- if user click the phase it will uncolapse and show list of the task that in it(if aviable).
* Section 5- maybe add for each phase: list of tasks, time spent, usage spent, model that had been used, bugs found and fixed(for the whole phase), notes.
* light mode
* how we make this tool non local and give users the abillity to use thier own dashboard

Overall verdict: [ PASS / PASS WITH NOTES / FAIL ]
FAIL, producted not ready for production.


errors log:
C:\Users\user\Desktop\Ai\Claude\project-Vena\src\app\agents\page.tsx
  14:12  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

C:\Users\user\Desktop\Ai\Claude\project-Vena\src\app\agents\page.tsx:14:12
  12 |   const activeCount = profiles.filter((p) => {
  13 |     if (!p.memory?.lastModified) return false;
> 14 |     return Date.now() - p.memory.lastModified.getTime() < ACTIVE_THRESHOLD_MINUTES * 60_000;
     |            ^^^^^^^^^^ Cannot call impure function
  15 |   }).length;
  16 |
  17 |   return (  react-hooks/purity

C:\Users\user\Desktop\Ai\Claude\project-Vena\src\app\page.tsx
   27:7   error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

C:\Users\user\Desktop\Ai\Claude\project-Vena\src\app\page.tsx:27:7
  25 |     if (!p.memory?.lastModified) return false;
  26 |     return (
> 27 |       Date.now() - p.memory.lastModified.getTime() <
     |       ^^^^^^^^^^ Cannot call impure function
  28 |       ACTIVE_THRESHOLD_MINUTES * 60_000
  29 |     );
  30 |   }).length;                                                                                    react-hooks/purity
  165:19  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

C:\Users\user\Desktop\Ai\Claude\project-Vena\src\app\page.tsx:165:19
  163 |                 const isActive =
  164 |                   profile.memory?.lastModified &&
> 165 |                   Date.now() - profile.memory.lastModified.getTime() <
      |                   ^^^^^^^^^^ Cannot call impure function
  166 |                     ACTIVE_THRESHOLD_MINUTES * 60_000;
  167 |
  168 |                 return (  react-hooks/purity

C:\Users\user\Desktop\Ai\Claude\project-Vena\src\components\Sidebar.tsx
  22:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\user\Desktop\Ai\Claude\project-Vena\src\components\Sidebar.tsx:22:5
  20 |   // Close mobile sidebar on route change
  21 |   useEffect(() => {
> 22 |     setMobileOpen(false);
     |     ^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  23 |   }, [pathname]);
  24 |
  25 |   // Prevent body scroll when mobile sidebar is open  react-hooks/set-state-in-effect

C:\Users\user\Desktop\Ai\Claude\project-Vena\src\components\Terminal.tsx
  37:10  warning  'status' is assigned a value but never used  @typescript-eslint/no-unused-vars

✖ 5 problems (4 errors, 1 warning)

```