# Design Decisions: Battle of Wits
*Raised by Morpheus — 2026-03-10 | All decisions resolved — ARCH.md updated 2026-03-10*

> TL;DR: All 10 design decisions resolved — JSON files, Deck-of-Decks, 2-round structure, pre-written clue lines, factory pattern, async GameEngine. See ARCH.md for implementation.

> ✅ All 10 decisions resolved. ARCH.md has been updated to incorporate all answers.

---

### D1 🔴 — Singleton Mutable State (`attributes.js`)
**Problem:** ES6 modules are cached singletons. `AttributeDeck` and all variant sub-decks are shared across the entire browser session. After game 1, variant sub-decks remain partially exhausted — game 2 silently draws from a depleted pool.

**Proposed fix:** `attributes.js` exports `createAttributeDeck()` — a factory function that constructs fresh `Deck` instances on every call. `GobletManager` calls it at the start of each new game.

**Is this approach acceptable, or do you prefer a different reset strategy?**

#### Answer:
Yes Fully reshuffle all decks before each new game.

---

### D2 🔴 — Null Guard on Exhausted Variant Sub-Deck
**Problem:** If the outer `AttributeDeck` draws the same category for both goblets and that category's variant sub-deck has only 1 variant, `categoryDeck.draw()` returns `null` on the second draw (`autoReshuffle: false`). GobletManager would push `null` into `rightAttrs`, crashing when it tries `null.insults`.

**Proposed fix:** After drawing a category, check `categoryDeck.isEmpty`. If true, skip it and draw the next category. Also enforce a data constraint: **minimum N variants per category**.

**What should the minimum variant count per category be?**

#### Answer:

There must me a minimum of 5 varients per category but variety is the spice of life so let's make a lot of attributes and varients.

---

### D3 🔴 — `Deck.items` Leaky Abstraction
**Problem:** RoundContext assembly does `safeAttrs.flatMap(v => [...v.compliments.items])` — directly accessing Deck's internal array. Breaks encapsulation; any internal Deck refactor silently breaks the assembler.

**Option A:** Add `deck.getAll()` → returns a shallow copy of all items (ignoring draw state).
**Option B:** Variant objects store clue lines as plain arrays (`insults: ['...', '...']`); Deck is constructed at runtime by GobletManager. Variants are pure data, decks are ephemeral.

**Which option? Or another approach?**

#### Answer:
Keep Encapsulation as a basic design princpe. we want the level of abstraction high to avoid messy mistakes.
I think it's best to keep the text for each deck in a simple yaml files that are easy to generate and are read by the appropriate deck class.

---

### D4 🟡 — Riddle Hints: Riddle-Specific Text or Goblet Clues Only?
**Problem:** `data/riddles.js` has no `hint` field. When a player requests a hint during the Riddle Phase, Buttercup currently only draws from her goblet attribute hint deck — she helps identify the safe goblet but says nothing about the riddle answer itself.

**Option A:** Buttercup only gives goblet attribute clues. She never helps with riddle answers. Players use her purely to gain more goblet information.
**Option B:** Each riddle carries a `hint` field. Buttercup combines a riddle hint with a goblet attribute clue in her response.

**Which do you prefer?**

#### Answer:
B.

---

### D5 🟡 — Vizzini's Reaction to Hint Requests
**Problem:** The PRD says requesting a hint costs "further insults/distractions from Vizzini." But Vizzini's current clue decks are assembled from goblet attribute variants — using them for a hint reaction burns a goblet clue unnecessarily and reveals attribute info out of turn.

**Proposed fix:** Vizzini gets a standalone `reactionDeck` of generic taunts unrelated to goblet attributes (e.g., *"Asking for help? INCONCEIVABLE!"*). Used for hint reactions, intro taunts, and general flavor. Constructed once at game start, not per-round.

**Confirmed, or different approach?**

#### Answer:
Yes and we can use character reaction decks for specific outcomes like correctly guessing the goblet, drinking poision, or answering a riddle correctly.  The should make sense in the context of the game play.

---

### D6 🟡 — ChatUI Queue vs EventBus Ordering
**Problem:** `GameEngine` emits `conversation:play` (banter), then immediately emits `riddle:presented`. Both land in ChatUI's message queue. The riddle appears in chat while the banter is still typing out — player can answer before characters finish speaking.

**Option A (async GameEngine):** `ChatUI` exposes `whenIdle()` → a Promise. `GameEngine` `await`s it before emitting the next game-progress event. Clean sequencing; requires GameEngine to be async-aware.
**Option B (synchronous GameEngine):** ChatUI internally serialises all incoming events into a strict sequence. GameEngine fires-and-forgets; ChatUI ensures ordering. GameEngine stays synchronous.

**Which pattern do you prefer?**

#### Answer:

I like A as it sounds like it might yield a more realistic "chat room" experience.  but we shoudl visually differentiate the game play elements from the random banter.

---

### D7 🟠 — Gramps Description Template Schema
**Problem:** ARCH says Gramps assembles a paragraph from variant `fragment` strings with "connective templates" but doesn't specify the structure. Neo will have to guess.

**Proposed schema:**
```
Each fragment is a phrase: "fashioned from dull pewter", "encircled by a ring of tarnished copper"
Connectives deck: ["with", "its", "topped by", "bearing", "finished with", "and"]
Assembly: join fragments with drawn connectives + sentence wrapper from Gramps' voice deck.

Result: "The cup before you is fashioned from dull pewter, its handle encircled by
         a ring of tarnished copper, bearing a wide rim worn smooth by many hands."
```

**Is this the right approach? Any specific constraints on how Gramps should sound?**

#### Answer:
Yes that's perfect. It shoudl sound like it was generated in real time.

---

### D8 🟠 — Blank Card Frequency Helper
**Problem:** Manually counting nulls in a Deck array to hit a target frequency is fragile and hard to tune later.

**Proposed fix:** `Deck.withFrequency(items, ratio)` static factory auto-inserts blanks:
```js
// Fire ~1 in 3 draws
const banterDeck = Deck.withFrequency([conv1, conv2, conv3], 1/3);
```

**Approved?**

#### Answer:

Sure that make the abscration much more obvious

---

### D9 🟢 — Round 2 Variant Sub-Deck Reset Policy
**Problem:** When Round 2 begins (player survived poison in Round 1), `GobletManager.generateGobletPair()` runs again. Should variant sub-decks reset for Round 2 or continue from their Round 1 depleted state?

**Option A — Reset for Round 2:** Fresh pool. Round 2 goblets could theoretically share variants with Round 1 (unlikely with large decks). Simpler.
**Option B — No reset:** Depleted pool continues. Round 2 goblets are guaranteed to differ from Round 1. More interesting narratively ("the cups have changed") but smaller pool to draw from.

**Which?**

#### Answer:

B there shoudl must be enough varients for each attribute to satisfy this requirement

---

### D10 🟢 — Coin Flip Utility
**Problem:** `crypto.getRandomValues(new Uint8Array(1))[0] < 128` is correct but opaque. Easy to accidentally bias with a typo.

**Proposed fix:** Encapsulate as `Deck.coinFlip()` — one tested implementation used everywhere a boolean random is needed.

**Approved?**

#### Answer:
YES: that is the only place where we do random number generation. and it's only usecase is in Deck.shuffle(). 


## New Suggestion
Create a simulator that can play through games at a rapid pace and measure the "quality" of a run.  We will use that for deck optimzation and testing the game logic without the ux.
