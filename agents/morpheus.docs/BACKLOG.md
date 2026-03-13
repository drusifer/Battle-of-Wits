# Backlog: Battle of Wits
*Owned by Morpheus*

---

## Sprint 4 Candidates

### UX-1 — Vizzini Clue Flash on Buttercup Hint
**Source:** Drew feedback 2026-03-12 on TECH_DEBT_SPRINT.md

**User story:** When Buttercup gives a goblet hint during the riddle phase, the most recent Vizzini clue bubble briefly flashes green (complement = safe goblet) or red (insult = poisoned goblet) to reinforce the connection, then fades back to normal.

**Design notes:**
- CSS: `.clue-flash-safe` (green tint) and `.clue-flash-poison` (red tint) classes with a CSS transition/animation (fade out over ~2–3s)
- `hint:requested` event payload already carries `vizziniReaction` — ChatUI needs to also know `clueType: 'complement' | 'insult'` to pick the right flash class. GameEngine knows this from the current round context (`correct` answer drives the last clue drawn).
- Simplest approach: GameEngine adds `clueType` to the `hint:requested` payload; ChatUI applies the flash class to the last `.gameplay` bubble from Vizzini.
- Flash should trigger after Buttercup finishes speaking (whenIdle before flash).

**Assigned to:** TBD Sprint 4
**Effort:** ~1h (CSS + ChatUI event handler update + GameEngine payload change + tests)

---

## Deferred (from Cypher PRD backlog)
- Difficulty settings
- Sound effects
- Leaderboard / score tracking
