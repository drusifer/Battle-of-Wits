# Sprint Log

> TL;DR: Sprint 1 complete (15/15 tasks, 2026-03-10). Sprint 2 (T16–T29): 3 backlog tests + characters + EventBus + GameEngine + data expansion. Sprint 3 (T30–T41): full playable UI — ChatUI, input area, hint button, goblet selection, status bar, typing indicator, app bootstrap, UAT script.

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
| T16 | Backlog tests: winRate dist, drawN null combo, GobletManager null-guard | Trin | `[x]` |
| T17 | `characters/Character.js` — base class | Neo | `[x]` |
| T18 | `characters/Vizzini.js` | Neo | `[x]` |
| T19 | `characters/Buttercup.js` | Neo | `[x]` |
| T20 | `characters/Gramps.js` | Neo | `[x]` |
| T21 | `characters/Boy.js` | Neo | `[x]` |
| T22 | Test suite: all 4 character classes | Trin | `[x]` |
| T23 | `engine/EventBus.js` — pub/sub | Neo | `[x]` |
| T24 | Test suite: EventBus | Trin | `[x]` |
| T25 | `engine/GameEngine.js` — async state machine | Neo | `[x]` |
| T26 | Test suite: GameEngine — transitions, round 2, async, integration | Trin | `[x]` |
| T27 | Expand `data/riddles.json` to 100+ entries | Neo | `[x]` |
| T28 | Expand `data/attributes.json` to 20+ categories × 8+ variants | Neo | `[x]` |
| T29 | UAT gate + Sprint 2 DoD validation | Trin | `[x]` |

---

## Sprint 3 — Full Playable UI
**Started:** 2026-03-11
**Goal:** Full playable game in the browser. Pure HTML/CSS/JS served from index.html. No backend. Player can start a game, answer riddles, request hints, choose a goblet, and restart — all working end-to-end.
**Target tasks:** T30–T41

**DoD (Sprint 3 accepted when ALL of the following pass):**
- `make test` green (200+ unit tests total — includes new UI unit tests)
- `make lint` green (ESLint + Prettier + jscpd)
- `make uat3` green — Trin's `agents/tools/uat_sprint3.mjs` passes all checks
- Browser smoke test: load `index.html` in browser (no server), play through a complete 2-round game without errors
- ChatUI renders `conversation:play` events as bubbles with character avatar + name
- Player input (riddle text field + Submit) correctly disabled while ChatUI is busy
- Hint button wired to `engine.requestHint()` and visible during RIDDLE_PHASE only
- Goblet panels are clickable during GOBLET_PHASE and disabled at all other times
- StatusBar shows correct hearts and round number at all phase transitions
- Restart button resets to IDLE and runs a fresh game
- All character avatars (😤 👸 🧓 🤧 🏴‍☠️) render alongside their dialogue lines
- Gameplay messages (riddles, clues, outcomes) are visually distinct from banter messages

| ID | Task | Owner | Size | DoD |
|----|------|-------|------|-----|
| T30 | `ui/ChatUI.js` — async message queue, `whenIdle()` Promise, gameplay vs banter CSS class, character avatar + name rendering | Neo | L | Unit tests pass; `whenIdle()` resolves only after queue drains; gameplay and banter bubbles have distinct CSS classes |
| T31 | `ui/TypingIndicator.js` — per-character animated "…" indicator shown while message is queued; hidden when idle | Neo | S | Indicator appears on enqueue, disappears on resolve; no flicker between consecutive messages |
| T32 | `ui/StatusBar.js` — live hearts (iocane resistance icons) + round number; updates on `phase:changed` and `goblet:chosen` events | Neo | S | Hearts decrement correctly after poisoned-goblet choice; round number advances to 2 on Round 2 start |
| T33 | `ui/GobletDisplay.js` — two goblet panels with Gramps' descriptions; click wired to `engine.chooseGoblet()`; hidden outside GOBLET_PHASE; disabled while ChatUI is busy | Neo | M | Panels hidden in RIDDLE_PHASE; both panels rendered with description text in GOBLET_PHASE; click fires `chooseGoblet`; clicking while ChatUI busy is a no-op |
| T34 | Input area — riddle answer text field + Submit button; disabled while ChatUI is busy or outside RIDDLE_PHASE; Enter key submits; wired to `engine.answerRiddle()` | Neo | S | Submit fires `answerRiddle` with normalized input; field clears on submit; disabled state enforced by `whenIdle()` |
| T35 | Hint button — visible and enabled during RIDDLE_PHASE when ChatUI is idle; hidden in GOBLET_PHASE; wired to `engine.requestHint()` | Neo | S | Button hidden outside RIDDLE_PHASE; click fires `requestHint`; button disabled while ChatUI busy |
| T36 | Restart button — always visible after game starts; wired to `engine.restart()`; triggers full UI reset (clears chat log, resets StatusBar, hides GobletDisplay) | Neo | S | Click fires `restart`; chat log clears; StatusBar resets to 2 hearts, Round 1 |
| T37 | `style.css` — parchment/scroll aesthetic; max-width 700px container; gameplay vs banter visual distinction; responsive (mobile-friendly, single-column ≤ 480px); Google Fonts (Merriweather, Roboto) | Neo | M | No horizontal scroll at 375px viewport; parchment background visible; gameplay bubbles have visible border/highlight distinct from banter |
| T38 | `index.html` + `main.js` — app bootstrap: `fetchAndBuild('data')` → `GameEngine` → mount UI components → subscribe all EventBus listeners → call `engine.startGame()` | Neo | M | Page loads in browser without a local server (file:// protocol or Vite dev); full game cycle completes in browser console with no uncaught errors |
| T39 | Unit tests: ChatUI — queue ordering, `whenIdle()` settlement, gameplay/banter class assignment, avatar rendering | Trin | M | All ChatUI unit tests pass under Vitest |
| T40 | Unit tests: StatusBar, GobletDisplay, TypingIndicator, input area, hint button, restart button — EventBus wiring and DOM state assertions | Trin | M | All UI component unit tests pass under Vitest; `make test` total ≥ 200 |
| T41 | UAT Sprint 3: create `agents/tools/uat_sprint3.mjs`; add `make uat3` target; run full checklist and browser smoke test; file Sprint 3 DoD sign-off | Trin | L | `make uat3` exits 0; all checklist items checked; browser smoke test documented in `agents/trin.docs/uat_sprint3_results.md` |

**Event → UI wiring reference:**

| Engine Event | UI Consumer |
|---|---|
| `conversation:play` | ChatUI — enqueue bubbles with avatar + name |
| `phase:changed` | StatusBar (round), GobletDisplay (show/hide), input area (enable/disable), hint button (show/hide) |
| `riddle:presented` | Input area — enable + focus text field |
| `riddle:answered` | ChatUI — clue line bubble; input area clears |
| `hint:requested` | ChatUI — Buttercup + Vizzini reaction bubbles |
| `goblets:described` | GobletDisplay — populate description text |
| `goblet:chosen` | StatusBar — update hearts; GobletDisplay — hide |
| `game:won` / `game:lost` | ChatUI — outro bubbles; Restart button highlight |
