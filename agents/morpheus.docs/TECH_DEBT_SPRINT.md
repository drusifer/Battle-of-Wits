# Tech Debt Sprint Plan
*Morpheus — 2026-03-12*

---

## TD1 — CRITICAL BUG: Restart Flow Destroys UI Subscriptions

**Priority:** P1 — functional regression, affects every restart.

**Root cause:** `main.js` restart handler calls `destroy()` on `chatUI`, `statusBar`, and `gobletDisplay` before `engine.restart()`. `destroy()` removes all EventBus subscriptions. When `engine.restart()` replays `startGame()` and emits game events (`conversation:play`, `riddle:presented`, `riddle:answered`, `goblets:described`, `goblet:chosen`, `game:won`, `game:lost`, `phase:changed`), none of the UI components are subscribed — they don't hear them.

**Observed symptom:** After restart, input re-enables (because `wirePhaseListener` and `wireRiddleListeners` in main.js use `bus.on()` directly and survive the restart), but the chat window stays empty, status bar doesn't update, and goblets never appear. The game is silently broken on every second play.

**Why tests missed it:** The GUI test suite does not exercise a full game-play-to-completion → restart → full game-play-to-completion path. All 4 Playwright tests cover single-game flows.

**Fix:** Remove `destroy()` from the restart handler. Preserve subscriptions. Use DOM-reset methods only:

```js
// BEFORE (broken):
restartBtn.addEventListener('click', async () => {
  chatUI.destroy();
  statusBar.destroy();
  gobletDisplay.destroy();
  chatUI.clear();
  statusBar.reset();
  await engine.restart();
});

// AFTER (correct):
restartBtn.addEventListener('click', async () => {
  chatUI.clear();        // resets DOM; subscriptions preserved
  statusBar.reset();     // resets DOM; subscriptions preserved
  gobletDisplay.hide();  // hides panels; subscriptions preserved
  await engine.restart();
});
```

`destroy()` remains on the API for genuine SPA teardown scenarios; it is simply wrong in the restart path.

**Testing required:**
1. Unit test: mock engine, call restart handler, assert all game events are still received by ChatUI/StatusBar/GobletDisplay after restart.
2. GUI test (T-GUI-5): play game to completion → click restart → play second game to completion → assert chat, status bar, and goblets all behave correctly in the second game.

**New LESSON:** `destroy()` is for permanent teardown (SPA unmount, component removal). `clear()`/`reset()`/`hide()` are for within-lifecycle resets. Never call `destroy()` on an instance you intend to reuse.

---

## TD2 — ARCH.md Three Stale Sections

**Priority:** P2 — doc accuracy; misleads next engineer.

### TD2a — `goblet:chosen` payload shape contradiction

ARCH.md has two descriptions of the `goblet:chosen` payload:
- **Line 297** (event table): correct — `reactionLines: Array<GobletReaction>` where `GobletReaction = { char: string, line: string }`
- **Lines 502–505** (UI Architecture section): stale — still shows `reactionLines: string[]` with the old positional `[vizziniLine, buttercupLine, grampLine, boyLine]` format

B5 changed the shape to tuples. The UI section was not updated. Delete lines 502–505 and replace with a reference to the event table entry at line 297.

### TD2b — GobletDisplay CSS display contract undocumented

The GobletDisplay CSS cascade bugs that emerged in Sprint 3 (display:'' vs flex/inline-block) prove that implicit CSS contracts must be documented in ARCH.

Add to ARCH UI section under GobletDisplay:

> **CSS display contracts:** `GobletDisplay#setVisible(true)` sets `style.display = 'flex'` on goblet elements. `#setCtaVisible(true)` sets `style.display = 'inline-block'` on `.goblet-cta` elements. CSS rules for `#goblet-left`, `#goblet-right`, and `.goblet-cta` must use `display: none` as default (not `visibility: hidden` or other hiding technique). Using `style.display = ''` to show does NOT work when a CSS rule explicitly sets `display: none` — the rule wins.

### TD2c — Buttercup hint section shows removed `drawGobletHint()` call

ARCH Buttercup section shows:
```js
[buttercup.react('hint:requested'), buttercup.drawGobletHint(), currentRiddle.hint]
  .filter(Boolean)
  .join(' ')
```

Bug 4 fix removed `buttercup.drawGobletHint()` from `GameEngine.requestHint()` during riddle phase (goblet hints only after goblets are revealed). The hint is now 2-part only:
```js
[buttercup.react('hint:requested'), currentRiddle.hint]
  .filter(Boolean)
  .join(' ')
```
The goblet hint deck is preserved on Buttercup for future use. Update ARCH Buttercup section accordingly.

**Assigned to:** Oracle (doc patch).

---

## TD3 — GobletDisplay.enable() Dead Code in main.js

**Priority:** P3 — code clarity; no functional impact today.

**Problem:** `wirePhaseListener` in `main.js` calls `gobletDisplay.enable()` when `phase:changed → GOBLET_PHASE` fires. But `enable()` guards on `if (this.#active)`, and `#active` is only set to `true` inside `#onGobletsDescribed()` — which fires later, on the `goblets:described` event.

Event order: `phase:changed(GOBLET_PHASE)` → `gobletDisplay.enable()` called → **no-op** (`#active=false`) → `goblets:described` fires → `#onGobletsDescribed()` sets `#active=true` AND calls `#setEnabled(true)` directly.

The `enable()` call from `wirePhaseListener` has **never executed its intended path** in any game. The actual enabling always happens internally via `#onGobletsDescribed`.

**Fix:** Remove `gobletDisplay.enable()` from `wirePhaseListener`. GobletDisplay owns its own enable/disable lifecycle internally. The `enable()` public method can be removed or retained with a comment explaining its guard is intentional and it will no-op if called before `goblets:described`.

**Assigned to:** Neo (5-min cleanup + confirm unit test still green).

---

## Sprint Assignment Summary

| ID | Priority | Owner | Effort |
|----|----------|-------|--------|
| TD1 | P1 CRITICAL | Neo | ~2h (fix + 2 new tests) |
| TD2a | P2 | Oracle | 15min doc |
| TD2b | P2 | Oracle | 15min doc |
| TD2c | P2 | Oracle | 10min doc |
| TD3 | P3 | Neo | 15min code + verify tests |

**Sequencing:** TD1 first — it's a real bug. TD2 and TD3 can run in parallel.

---

*Full plan at `agents/morpheus.docs/TECH_DEBT_SPRINT.md`*
