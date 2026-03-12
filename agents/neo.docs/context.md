> TL;DR: Neo's Sprint 1 knowledge — factory pattern, private fields, operator precedence gotcha, lint rules. Sprint 2: characters + GameEngine + data expansion.

## Recent Decisions

- **2026-03-10 (Sprint 1 complete):** All T01–T14 implemented. Lint-driven refactoring of GameSimulator extracted helpers (#runRiddlePhase, #collectVariantIds, #countCollisions, #tallyClueLines, #buildBatchResult) to bring function sizes below 40-line limit.
- **2026-03-10:** Added createRiddleDeck() factory to DataLoader to avoid accessing Deck private fields from GameSimulator.
- **2026-03-10:** Upgraded Deck to use JS private fields (#deck, #ptr, #autoReshuffle) — better than ARCH's underscore convention.

## Key Findings

- **Operator precedence trap:** `Deck.coinFlip() ? 'left' : 'right' === ctx.safe` is WRONG — evaluates as ternary first. Always use: `(Deck.coinFlip() ? 'left' : 'right') === ctx.safe`
- **withFrequency() returns Deck:** Cannot call .filter() on the result. Sample draws to verify null ratio.
- **Factory functions are critical:** createAttributeDeck() and createRiddleDeck() solve ES6 singleton mutation. Never mutate a shared Deck at module level.
- **Lint passes clean:** 0 ESLint errors, 0 warnings, Prettier formatted, 0 jscpd clones.
- **Private fields need eslint-disable for security plugin:** Fisher-Yates arr[i] triggers security/detect-object-injection — it's a false positive. Disable per-line with explanation comment.

## Sprint 2 Implementation Plan

Next tasks (T16–T20):
- T16: `characters/Character.js` base class + Vizzini, Buttercup, Gramps, Boy subclasses
- T17: `engine/EventBus.js` — simple pub/sub
- T18: `engine/GameEngine.js` — async state machine, await chatUI.whenIdle()
- T19: Tests for GameEngine state transitions and async sequencing
- T20: Data expansion — 100+ riddles, 20+ categories × 8+ variants

Key Sprint 2 constraints:
- GameEngine must be async-aware: `await chatUI.whenIdle()` before each game beat
- EventBus: lightweight, no dependencies
- Characters receive round-specific Decks injected by GobletManager (not stored permanently)

## Important Notes

- Task board: `task.md`
- Architecture reference: `agents/morpheus.docs/ARCH.md` (updated post Sprint 1 review)
- Lessons: `agents/oracle.docs/LESSONS.md`
- Symbol index: `agents/oracle.docs/SYMBOL_INDEX.md`

---
*Last updated: 2026-03-10 by Oracle (grooming)*
