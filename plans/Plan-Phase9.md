# Plan — Phase 9: Chat & UX Polish

**Status:** In Progress
**Sprint:** 2
**Goal:** Chatbox UI, PTY auto-start, VenaOS branding, interactive roadmap.

---

## Sub-phases

### 9A — PTY Auto-start + VenaOS Branding (Quick Wins)

| # | Task | Details |
|---|------|---------|
| 1 | PTY auto-start | Swap `npm run dev` → runs Next.js + PTY server concurrently. Old `dev` becomes `dev:next`. |
| 2 | VenaOS branding | Rename "Vena" → "VenaOS" in sidebar logo (mobile + desktop). |
| 3 | Version text polish | Brighten from `text-vena-text-muted` → `text-vena-text-secondary`, bump `text-[10px]` → `text-xs`. |
| 4 | Remove manual PTY hint | Remove "PTY server must be running on port 3001" footer from chat page. |

### 9B — Chatbox UI (Main Feature)

| # | Task | Details |
|---|------|---------|
| 1 | ChatInput component | Claude-style message bar — input field + send button at page bottom. |
| 2 | Split view layout | Chat page redesign: terminal output (top 70%), chat input bar (bottom). |
| 3 | Wire input to PTY | ChatInput sends text + newline to PTY WebSocket. Terminal renders output. |
| 4 | Input UX | Enter to send, Shift+Enter for newline, auto-focus, command history (up/down). |

### 9C — Interactive Roadmap

| # | Task | Details |
|---|------|---------|
| 1 | Expand/collapse phases | Click any PhaseCard header to toggle task list visibility. |
| 2 | All phases expandable | Remove "current phase only" restriction on task checklist. |
| 3 | Phase detail metadata | Expanded view shows: goal, completion date, session count, token usage inline. |

---

## Architecture Notes

- ChatInput is a new `src/components/ChatInput.tsx` client component
- Terminal component stays unchanged — it renders PTY output
- ChatInput needs access to the same WebSocket ref as Terminal → lift WS to chat page
- Roadmap expand/collapse: convert PhaseCard to client component with local state

## Risk

- PTY auto-start on Windows: `concurrently` handles cross-platform. Low risk.
- WebSocket ref sharing: clean pattern — pass ws ref down from page to both Terminal and ChatInput.
