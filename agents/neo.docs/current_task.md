# Current Task

**Status:** Sprint 2 — T28 remaining (attributes.json expansion)
**Assigned to:** Neo
**Started:** 2026-03-10

## Sprint 2 Deliverables

- [x] T17 `src/characters/Character.js` — base class
- [x] T18 `src/characters/Vizzini.js` — setRoundDecks, drawClue
- [x] T19 `src/characters/Buttercup.js` — setRoundDeck, drawGobletHint
- [x] T20 `src/characters/Gramps.js` — describeGoblet from fragments + connectives
- [x] T21 `src/characters/Boy.js` — reaction decks only
- [x] T22 `tests/unit/Characters.test.js` — 28 tests, all green
- [x] T23 `src/engine/EventBus.js` — pub/sub
- [x] T24 `tests/unit/EventBus.test.js` — 12 tests, all green
- [x] T25 `src/engine/GameEngine.js` — async state machine, 7 states
- [x] T26 `tests/unit/GameEngine.test.js` — 27 tests, all green
- [x] T27 `data/riddles.json` — 100 riddles, no duplicates
- [x] T16 `tests/unit/Backlog.test.js` — 6 backlog tests from Sprint 1 review
- [x] `tests/unit/DataIntegrity.test.js` — 21 data quality tests
- [ ] T28 `data/attributes.json` — expand to 20+ categories × 8+ variants

## Current State

168/168 tests green. make lint clean.
DataIntegrity.test.js will gate T28 quality when expanded.
T28 pending: DataIntegrity tests require 20+ categories × 8+ variants × 5+ insults/compliments/hints each.

## Bugs Fixed During TDD

- drawN() L07: checked isEmpty AFTER draw → genuine null in last position treated as exhaustion. Fixed to check BEFORE draw.
- riddles.json: 7 duplicate answers + 1 self-referencing alternate. All fixed.

## Blockers

None. T28 is the only outstanding task.

---
*Last updated: 2026-03-10*
