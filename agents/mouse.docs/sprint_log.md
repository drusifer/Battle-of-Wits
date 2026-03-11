# Sprint Log

> TL;DR: Sprint 1 complete (15/15 tasks, 2026-03-10). Sprint 2 (T16–T29): 3 backlog tests + characters + EventBus + GameEngine + data expansion. Sprint 3 (T30–T35): full UI.

## Sprint 1 — Logic Core
**Started:** 2026-03-10
**Completed:** 2026-03-10
**Goal:** Working, tested game logic. No UI.
**DoD:** GameSimulator.runBatch(1000) passes all quality checks.

| Date | Event |
|------|-------|
| 2026-03-10 | Sprint 1 planned. 15 tasks created. Neo assigned impl, Trin assigned tests. |
| 2026-03-10 | T01–T14 implemented and tested by Neo + Trin. |
| 2026-03-10 | T15 validated: winRate=75%, variantCollisions=0, uniqueClueLines=250. |
| 2026-03-10 | UAT run by Trin: 71/71 checks passed. 3 data defects found and fixed. |
| 2026-03-10 | Code quality gates added: lint, complexity, security, duplication (all clean). |
| 2026-03-10 | Full team review completed. ARCH.md updated. Lessons recorded. |
| 2026-03-10 | **Sprint 1 ACCEPTED.** |

**Velocity:** 15 / 15 tasks ✅

---

## Sprint 2 — Characters + Game Engine
**Started:** 2026-03-10
**Goal:** Wired characters, async GameEngine, expanded data. DoD: GameEngine completes a full headless 2-round cycle with all characters reacting correctly.
**Target tasks:** T16–T29

| ID | Task | Owner | Status |
|----|------|-------|--------|
| T16 | Backlog tests: winRate dist, drawN null combo, GobletManager null-guard | Trin | `[ ]` |
| T17 | `characters/Character.js` — base class | Neo | `[ ]` |
| T18 | `characters/Vizzini.js` | Neo | `[ ]` |
| T19 | `characters/Buttercup.js` | Neo | `[ ]` |
| T20 | `characters/Gramps.js` | Neo | `[ ]` |
| T21 | `characters/Boy.js` | Neo | `[ ]` |
| T22 | Test suite: all 4 character classes | Trin | `[ ]` |
| T23 | `engine/EventBus.js` — pub/sub | Neo | `[ ]` |
| T24 | Test suite: EventBus | Trin | `[ ]` |
| T25 | `engine/GameEngine.js` — async state machine | Neo | `[ ]` |
| T26 | Test suite: GameEngine — transitions, round 2, async, integration | Trin | `[ ]` |
| T27 | Expand `data/riddles.json` to 100+ entries | Neo | `[ ]` |
| T28 | Expand `data/attributes.json` to 20+ categories × 8+ variants | Neo | `[ ]` |
| T29 | UAT gate + Sprint 2 DoD validation | Trin | `[ ]` |

---

## Sprint 3 — Full UI (Planned)
**Goal:** Parchment-themed browser game.
**Target tasks:** T30–T35

| ID | Task | Owner |
|----|------|-------|
| T30 | `ui/ChatUI.js` — async queue, whenIdle(), gameplay vs banter styling | Neo |
| T31 | `ui/StatusBar.js` | Neo |
| T32 | `ui/GobletDisplay.js` | Neo |
| T33 | `ui/TypingIndicator.js` | Neo |
| T34 | `index.html` + `main.js` + `style.css` — parchment theme, 700px | Neo |
| T35 | Expand all data to final target counts (if not reached in S2) | Neo |
