> TL;DR: Morpheus's architecture knowledge — Deck-of-Decks pattern, factory functions, 75% win rate (intentional), ARCH.md updated post Sprint 1 review. Sprint 2: characters + EventBus + GameEngine.

## Recent Decisions

- **2026-03-10 (Sprint 1 review):** ARCH.md updated to reflect actual implementation: Deck uses JS private fields (#), DataLoader is module functions not a class, win rate is 75% (not 50%), createRiddleDeck() factory documented.
- **2026-03-10 (final):** All 10 DECISIONS.md answers incorporated. Key additions: JSON data files, DataLoader factory pattern, min 5 variants enforced, ReactionDecks per character per outcome, async GameEngine awaits chatUI.whenIdle(), visual differentiation gameplay vs banter, GameSimulator (headless) added, no sub-deck reset between rounds, Deck.coinFlip() is sole randomness source.
- **2026-03-10:** ARCH.md revised based on Drew's feedback. Decks of Decks for goblets; each variant owns pre-written ClueDeck; ConversationDecks for multi-character dialogue; crypto.getRandomValues() for shuffling.

## Key Findings

- **`Deck` is the universal primitive**: draw-without-replacement used everywhere. Private fields (#deck, #ptr, #autoReshuffle) — not underscore convention.
- **DataLoader is module functions**: `buildGameData()` (pure) + `fetchAndBuild()` (async, browser). Not a class. Returns gameData object with factory functions.
- **Factory functions solve singleton mutation**: `createAttributeDeck()` and `createRiddleDeck()` each return a fresh Deck tree per call. Critical — ES6 modules are singletons; mutating shared Decks would corrupt cross-game state.
- **Deck-of-Decks for goblets**: Outer deck (categories, autoReshuffle:true) resets between left/right draws. Inner variant decks (autoReshuffle:false) NEVER reset within a game — guarantees Round 2 cannot reuse Round 1 variants.
- **Win rate at random play = 75%**: P(win R1) + P(survive R1)×P(win R2) = 0.5 + 0.5×0.5. Not a bug.
- **withFrequency() returns a Deck**: Not an array. Cannot call .filter() on the result.
- **Operator precedence risk**: `Deck.coinFlip() ? 'left' : 'right' === x` evaluates wrong. Always parenthesise: `(Deck.coinFlip() ? 'left' : 'right') === x`.

## Sprint 2 Architecture Gaps to Close

- Characters (Vizzini, Buttercup, Gramps, Boy) — implement Character base + subclasses
- EventBus.js — lightweight pub/sub
- GameEngine.js — async state machine, await chatUI.whenIdle()
- Data expansion: 100+ riddles, 20+ attribute categories × 8+ variants
- Update UAT script for Sprint 2 coverage

---
*Last updated: 2026-03-10 by Morpheus (post Sprint 1 review)*
