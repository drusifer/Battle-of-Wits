# Battle of Wits — Lessons Learned

> TL;DR: Sprint 1 post-mortems and engineering gotchas. Read before starting Sprint 2.

---

## Sprint 1 Lessons

### L01 — Operator Precedence with Ternary + Comparison
**Context:** GameSimulator.runGame() goblet choice check.
**Bug:** `Deck.coinFlip() ? 'left' : 'right' === ctx.safe`
**Effect:** JS evaluates ternary before ===. When coinFlip=true, result was the string `'left'` (truthy — always wins). Win rate jumped to 93.6% instead of 75%.
**Fix:** `(Deck.coinFlip() ? 'left' : 'right') === ctx.safe`
**Rule:** Always parenthesise a ternary expression before applying a comparison operator.
**Caught by:** `make uat` (winRate assertion), not by unit tests. A unit test for winRate distribution was missing.

---

### L02 — withFrequency() Returns a Deck, Not an Array
**Context:** UAT script called `.filter()` on the result of `Deck.withFrequency()`.
**Bug:** `TypeError: wf.filter is not a function`
**Fix:** Sample draws from the returned Deck to verify null ratio, not `.filter()` on the result.
**Rule:** `Deck.withFrequency(items, ratio)` → returns a **Deck instance**. Never assume it returns a plain array.

---

### L03 — ES6 Module Singletons Mutate Across Games
**Context:** DataLoader returns game data. Without factory functions, the same Deck instances would be shared across all games.
**Fix:** `createAttributeDeck()` and `createRiddleDeck()` factories in `buildGameData()` return value. Each call constructs a fresh Deck tree from the raw data.
**Rule:** Never import a pre-constructed Deck as a module-level singleton. Always use a factory when the same Deck must be fresh per game.

---

### L04 — eslint-plugin-security Has False Positives on Array Bracket Notation
**Context:** Fisher-Yates shuffle in `Deck.#shuffle()` and `Object.entries()` loops in DataLoader.
**Finding:** `security/detect-object-injection` fires on any `arr[i]` expression, including perfectly safe internal array access.
**Fix:** `// eslint-disable-next-line security/detect-object-injection` on the specific lines, with a comment explaining why the access is safe (internal data, no user input).
**Rule:** Do not globally disable the rule. Disable per-line only where the false positive is verified safe.

---

### L05 — Data Authoring Defects Found by UAT, Not Unit Tests
**Context:** Sprint 1 UAT found 3 data defects that unit tests missed:
1. Duplicate riddle answer (`'fire'` appeared twice)
2. `outro_win` had only 1 scene variant (minimum 3 required)
3. `outro_lose` had only 1 scene variant

**Finding:** Unit tests mock or ignore data content. UAT's structural audit of the JSON files is the only gate that catches content quality issues.
**Rule:** Always run `make uat` after any data file edit. `make test` alone is not sufficient.

---

### L06 — ARCH.md Must Be Updated to Reflect Final Implementation
**Context:** Post Sprint 1 review found 4 stale entries in ARCH.md:
1. Deck shown with underscore fields (`_items`) — actual uses JS private fields (`#deck`)
2. DataLoader shown as a class — actual is module-level functions
3. Win rate stated as ~50% — actual is 75% (2-chance game design)
4. `createRiddleDeck()` factory not documented

**Rule:** When implementation deviates from ARCH (even as an improvement), update ARCH.md immediately. Stale architecture docs mislead Sprint 2 engineers.

---

### L07 — drawN() Null Ambiguity
**Context:** When `autoReshuffle:false` and a Deck contains genuine `null` items (blank cards from `withFrequency`), `draw()` returning null is ambiguous: it could mean exhausted OR blank card drawn.
**Fix Applied:** `drawN()` checks `this.isEmpty` after a null draw — only breaks if the deck is actually exhausted, not if null was a blank card.
**Known Gap:** No test covers the combined case (genuine nulls + exhaustion in the same deck). Recommended test for Sprint 2 backlog.

---

*Last updated: 2026-03-10 by Oracle*
