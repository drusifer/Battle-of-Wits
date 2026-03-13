> TL;DR: Sprint 3 shipped. Tech Debt Sprint planned 2026-03-12: TD1 = P1 bug (restart destroys UI subscriptions), TD2 = 3 stale ARCH sections, TD3 = dead enable() call in main.js.

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

## Sprint 2 Architecture Review Findings (2026-03-10)

Sprint 2 delivered and reviewed. Verdict: SHIP IT. Key notes:

- 'goblets:described' event (payload: {left, right}) is undocumented in ARCH.md — needs to be added to the event table.
- #buildCharacters() is constructor-only. Safe because reactionDecks are autoReshuffle:true, but this contract is undocumented in code. Add a comment.
- Buttercup intentionally has no riddle:correct / riddle:wrong reactions — add a comment in Buttercup.js before a future dev adds them by mistake.
- restart() re-initialises managers via factory calls in startGame() — characters persist, which is correct but subtle.
- describeGoblet() is singular/called twice (one per goblet) rather than a combined describeGoblets(roundContext). Functionally equivalent and arguably cleaner.

## Sprint 3 Architecture Gaps to Close

- UI layer: ChatUI (async + whenIdle), StatusBar, GobletDisplay, TypingIndicator
- GameEngine integration with real ChatUI (not mock)
- main.js bootstrap: DataLoader → GameEngine → mount UI
- Visual differentiation: gameplay vs banter message styles
- Update ARCH.md event table with 'goblets:described' event
- UAT Sprint 3 script

---
*Last updated: 2026-03-10 by Morpheus (post Sprint 2 review)*
