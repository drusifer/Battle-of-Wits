# Current Task

**Status:** Complete — Sprint 4 impl T42–T47 shipped
**Assigned to:** Neo
**Started:** 2026-03-12

## Deliverables

- [x] T42: S4-U1 clue flash — `clueType` in `hint:requested` payload (GameEngine); `#chainAnimatedClue` + `#chainFlash` in ChatUI; CSS `.clue-flash-safe` / `.clue-flash-poison`
- [x] T43: S4-U2 whenIdle — already implemented in Sprint 3; tests added to BacklogSprint4.test.js
- [x] T44: S4-U3 goblet reveal animation — `goblet:chosen` subscription in GobletDisplay (`.goblet-shake`/`.goblet-glow`); 600ms `#chainDelay` in ChatUI; CSS keyframes
- [x] T45: S4-U4 mobile tap targets — 44px min-height on goblet + input buttons at ≤480px
- [x] T46: S4-G1 goblet phase hint — `requestGobletHint()` on GameEngine; `heart:spent` event; `#onHeartSpent()` in StatusBar; `setHintButton()` + `#onGobletHintUsed()` in GobletDisplay; `#goblet-hint-btn` in index.html; wired in main.js
- [x] T47: S4-S1 sound effects — `SoundManager` (Web Audio API synth tones, no external assets); mute toggle; wired in main.js

## Results

- 278/278 tests green (30 new Sprint 4 tests)
- `make lint` clean
- `src/utils/SoundManager.js` created
- `tests/unit/BacklogSprint4.test.js` created

## Key Decisions

- Sound: Web Audio API synth tones (no file assets needed) — graceful no-op in Node/test env
- `#scrollToBottom`: guarded with `typeof requestAnimationFrame !== 'undefined'` for Node compat
- `wireControls`: refactored to options object to satisfy max-params lint rule

---
*Last updated: 2026-03-12 by Neo*
