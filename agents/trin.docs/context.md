> TL;DR: Trin's Sprint 1+2+3 QA knowledge — UAT at agents/tools/uat_sprint1.mjs (make uat), uat_sprint2.mjs (make uat2), uat_sprint3.mjs (make uat3), 204/204 tests green, all Sprint 1+2 regressions clean.

## Recent Decisions

- UAT Sprint 1: `agents/tools/uat_sprint1.mjs`, run via `make uat`
- UAT Sprint 2: `agents/tools/uat_sprint2.mjs`, run via `make uat2`
- UAT Sprint 3: `agents/tools/uat_sprint3.mjs`, run via `make uat3`
- `Deck.withFrequency()` returns a **Deck**, not an array — sample draws to verify null ratio
- banter.outro_* entries are arrays-of-arrays (scene variants); min 3 variants required
- Clue-integrity check: only flag explicit vessel nouns (goblet/chalice/cup/flagon/vessel).
  Do NOT flag "right" or "left" — too common as ordinary English adjectives/adverbs.
- UI tests use a minimal DOM mock (no jsdom) — global.document.createElement patched in test file
  before importing UI classes (top-level await in ESM test file)

## Key Findings

### Sprint 1
- **Duplicate riddle answer**: `riddles.json` had "fire" twice — fixed to "ember"
- **Thin outro arrays**: `outro_win` and `outro_lose` had only 1 scene variant — expanded to 3
- **Operator precedence bug**: `Deck.coinFlip() ? 'left' : 'right' === ctx.safe` evaluated wrong.
  Always parenthesise: `(Deck.coinFlip() ? 'left' : 'right') === ctx.safe`
- **Win rate baseline**: 75% (not 50%) is correct for this 2-chance game design (P=0.5 + 0.5×0.5)
- **Math.random**: Zero runtime usage confirmed — comments and test labels only

### Sprint 2
- 101 riddles (DoD: 100+) ✓
- 21 categories × 8 variants each = 168 variants total (DoD: 20+ × 8+) ✓
- 168/168 unit tests green across 10 suites ✓
- GameEngine: IDLE → INTRO → RIDDLE_PHASE → GOBLET_PHASE → WIN | LOSE — all transitions verified headless
- Vizzini clue decks: compliments sourced from safe goblet, insults from poisoned goblet — verified
- Buttercup: drawGobletHint() returns null before setRoundDeck(), string after — verified
- Gramps: describeGoblet() format: "The cup before you is <fragments>." — verified
- EventBus: on/off/emit/multi-listener/unknown-event — all verified

### Sprint 3
- 204/204 unit tests green across 11 suites (35 new UI tests)
- ChatUI: render() creates chat-bubble divs with chat-name + chat-line spans; EventBus subscriptions verified
- StatusBar: innerHTML tracking pattern works for heart counting (❤️ match with regex)
- GobletDisplay: click guards check #active flag AND button.disabled before calling onChoose()
- DOM mock approach: patch global.document BEFORE top-level await import of UI classes (ESM module cache)
- `make uat3` headless script runs 50+ checks: ChatUI contract, StatusBar, GobletDisplay, GameEngine smoke, S1+2 batch regression

## Important Notes

- **Lint targets**: eslint (flat config `eslint.config.js`), prettier (`.prettierrc`), jscpd (`.jscpdrc`). All via `make lint`
- **False positives to be aware of**: `security/detect-object-injection` fires on bracket notation — safe, mark with eslint-disable-next-line
- GameEngine `whenIdle()` contract: UI layer is responsible for queuing; headless tests use `() => Promise.resolve()`
- UAT script pattern: headless chatUI stub = `{ whenIdle: () => Promise.resolve() }`, capture EventBus events into array for assertion
- UI test pattern: mock DOM elements with `makeMockElement()` factory; patch `global.document` before importing UI classes

---
*Last updated: 2026-03-11 by Trin*
