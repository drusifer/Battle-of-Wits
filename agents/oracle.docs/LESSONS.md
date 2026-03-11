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

---

## Sprint 2 Lessons

### L08 — Gramps API Signature Diverged from ARCH
**Context:** Sprint 2 implementation of Gramps.
**Discrepancy:** ARCH.md documents `gramps.describeGoblets(roundContext)` (plural, takes RoundContext). Actual implementation is `gramps.describeGoblet(attributes)` (singular, takes an attributes array). GameEngine calls it twice — once for left, once for right.
**Effect:** Any engineer reading ARCH.md would implement the wrong method signature, or write tests against the wrong interface.
**Rule:** When a method's name or signature changes during implementation, update ARCH.md before merging. Method signatures are a contract — stale names are silent integration bugs waiting to happen.

---

### L09 — EventBus `off()` Method Undocumented
**Context:** Sprint 2 EventBus implementation.
**Discrepancy:** ARCH.md describes EventBus as "Simple pub/sub" with no mention of an `off()` unsubscribe method. The implementation adds `off(event, callback)` for clean listener removal.
**Effect:** Engineers consuming EventBus wouldn't know `off()` exists. Listener leak bugs are likely if teams don't know unsubscription is available.
**Rule:** All public API surface — especially cleanup/teardown methods — must appear in ARCH. "Simple" doesn't mean undocumented.

---

### L10 — `goblets:described` Event Missing from Event Table
**Context:** GameEngine emits `goblets:described` with `{ left, right }` payload during `#enterGobletPhase()`.
**Discrepancy:** ARCH.md's event table omits this event entirely. The UI layer (GobletDisplay) depends on this event to render goblet panels.
**Effect:** Anyone building the UI from ARCH would not know to subscribe to `goblets:described`, leaving GobletDisplay permanently blank.
**Rule:** Every `bus.emit()` call in GameEngine must have a corresponding row in the ARCH event table. Review the table against the source at the end of each sprint.

---

### L11 — Hint Composition Richer Than Documented
**Context:** `GameEngine.requestHint()` composes the hint from three parts: Buttercup's `react('hint:requested')` encouragement line, `buttercup.drawGobletHint()`, and `riddle.hint`. ARCH only documents parts 2 and 3.
**Effect:** The encouragement prefix is invisible in the architecture doc, making hint output appear shorter and less designed than it is.
**Rule:** Document the full composition formula for any multi-part assembled line in ARCH. Even one-liners like `[a, b, c].filter(Boolean).join(' ')` deserve a formula note.

---

### L12 — Modular Data Files Not Reflected in ARCH
**Context:** T28 split `data/attributes.json` into per-category files under `data/attributes/`, merged via `make merge-attributes`. ARCH.md still shows `data/attributes.json` as a single file.
**Effect:** Engineers following ARCH would create or edit the single-file path, bypassing the modular authoring workflow and breaking the merge pipeline.
**Rule:** When the data file layout changes, update the Module Structure diagram in ARCH.md immediately. The directory tree is often the first thing a new engineer reads.

---

### L13 — Add ARCH Review to Sprint DoD
**Context:** Sprint 2 follow-up documentation pass.
**Finding:** Five stale items accumulated in ARCH.md during Sprint 2 (Gramps method signature, EventBus off(), goblets:described event, hint composition formula, data/ layout). None were caught until the end-of-sprint review, by which point they had already had the opportunity to mislead engineers reading the architecture doc mid-sprint.
**Fix:** Morpheus corrected all 5 items as Sprint 2 follow-up work.
**Rule:** Every sprint's Definition of Done must include an ARCH.md accuracy check — a 10-minute diff against the implementation at sprint end. Catching doc drift immediately prevents it from compounding across sprints.

---

---

## Sprint 3 Lessons

### L14 — DOM Mock Pattern for UI Testing Without jsdom
**Context:** T39/T40 tests for ChatUI, StatusBar, GobletDisplay run in Node (`environment: 'node'` in vitest.config.js). jsdom is not installed.
**Solution:** A hand-rolled `makeMockElement()` factory in `ChatUI.test.js` provides just enough DOM surface (`_children`, `_listeners`, `style`, `disabled`, `innerHTML`, `querySelector`, `setAttribute`, `getAttribute`, `addEventListener`, `_dispatch`). `global.document.createElement` is patched to use this factory.
**Benefits:** Zero extra dependencies. Tests are fast and portable. The mock is minimal — only the surface actually used by the UI classes.
**Rule:** When adding a new UI method that calls a DOM API not currently in the mock, add it to `makeMockElement()` before writing the test. Never install jsdom just to avoid extending the mock.

---

### L15 — ESM Module Caching Requires Dynamic `await import()` After Global Patch
**Context:** ChatUI calls `document.createElement()` at runtime. If ChatUI is statically imported before `global.document` is patched, the module loads fine but the test's DOM patch is not yet in place — any createElement calls during module evaluation would fail or use the wrong global.
**Fix:** `ChatUI.test.js` patches `global.document` first, then uses top-level `await import('../../src/ui/ChatUI.js')` to load the module after the patch is live. Static `import` at the top of the file would execute before the test file body runs.
**Rule:** When a module depends on a global (DOM, fetch, crypto) that you intend to mock in Node, always patch the global before importing the module. Use `await import()` for the affected modules; keep static imports only for pure-logic modules (EventBus, etc.) that do not touch globals at load time.

---

### L16 — `let engine` Hoisting Pattern for Circular Closure
**Context:** `main.js` must construct `GobletDisplay` with an `onChoose` callback that calls `engine.chooseGoblet()`. But `GameEngine` takes `chatUI` as a constructor argument, which is constructed before `engine`. The two objects have a circular dependency at construction time.
**Fix:** Declare `engine` with `let` before constructing `GobletDisplay`, so the closure captures the variable reference (not the value). Then assign `engine = new GameEngine(...)` on the next line. By the time the callback fires, `engine` is assigned.
**Code smell guard:** ESLint's `prefer-const` flags this pattern as suspicious. Add `// eslint-disable-next-line prefer-const` with a comment explaining the intentional forward reference, so future engineers don't "fix" it.
**Rule:** When two objects need each other at callback time (not construction time), the `let` hoisting pattern is the cleanest vanilla JS solution. Document it with a comment or a LESSONS entry.

---

### L17 — `whenIdle()` Stub: MVP vs. Full Implementation
**Context:** GameEngine `await`s `chatUI.whenIdle()` before each game-progress step. Sprint 3 ChatUI implements `whenIdle()` as `return Promise.resolve()` — resolves immediately, no animation queue.
**Finding:** This is intentional MVP scaffolding. The typing animation / real queue drain is deferred to T31. All async await sequencing in GameEngine is correct and wired; only the UI-side timing is missing.
**Risk:** If T31 is skipped or forgotten, the game will still "work" — dialogue will just appear instantly. The stub is invisible to integration tests.
**Rule:** Stub methods that will later have real async behaviour must carry a source comment naming the follow-up task (e.g., `// whenIdle resolves immediately — typing animation deferred to T31`). This makes the gap visible in code review and grep.

---

### L18 — ARCH UI Section Omits Implementation-Level Details
**Context:** Sprint 3 post-implementation review of ARCH.md UI section.
**Gaps found:**
1. The `AVATARS` constant in `ChatUI.js` (mapping char name → emoji) is not documented. Engineers adding a new character must know to update this map.
2. `GobletDisplay` uses `querySelector('.goblet-desc')` — it assumes the HTML pre-populates a child `<span class="goblet-desc">` inside each goblet button. This is an implicit HTML contract not stated in ARCH.
3. The `goblet:chosen` event payload `reactionLines[]` array structure (ordered Vizzini/Buttercup/Gramps/Boy) is not in the event table.
4. `GobletDisplay`'s `#active` flag pattern (double-disable guard: disabled both by flag and by `.disabled` property) is not documented.
**Effect:** (1) New character added to data but not to AVATARS → silently renders `🎭` fallback. (2) HTML template missing `.goblet-desc` span → `querySelector` returns null, `textContent` assignment throws.
**Rule:** Document implicit HTML contracts (required child selectors, required IDs) in ARCH alongside the component that depends on them. Add the `reactionLines[]` payload structure to the event table.

---

*Last updated: 2026-03-11 by Oracle (Sprint 3 review)*
