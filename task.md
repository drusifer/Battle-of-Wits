# Battle of Wits — Task Board

> TL;DR: Sprint 1 complete (15/15, UAT 71/71). Sprint 2 planned: T16–T20 (characters, GameEngine, data expansion). Sprint 3 planned: T21–T26 (full UI).

---

## Sprint 1: Logic Core
**Goal:** Working, tested game logic with no UI. Sprint ends when `GameSimulator.runBatch(1000)` passes all quality checks.
**Started:** 2026-03-10
**Team:** Neo (impl), Trin (tests)

### Definition of Done
- [x] All T01–T15 tasks complete and checked off
- [x] `GameSimulator.runBatch(1000)` reports: win rate 75% (expected for 2-chance game), zero crashes, zero goblet variant sharing
- [x] Zero `Math.random()` usage anywhere (Trin verifies via grep)
- [x] All test suites green (74/74)

---

### Foundation

| ID  | Task | Owner | Status | Notes |
|-----|------|-------|--------|-------|
| T01 | Implement `utils/Deck.js` | Neo | `[x]` | draw, drawN, reset, isEmpty, coinFlip, withFrequency, _shuffle (crypto) |
| T02 | Test suite: `Deck.js` | Trin | `[x]` | Depends on T01. WDWR, autoReshuffle, coinFlip distribution, withFrequency ratio, no Math.random |
| T03 | Implement `utils/normalize.js` | Neo | `[x]` | Lowercase, strip 'the/a/an', trim punctuation |
| T04 | Test suite: `normalize.js` | Trin | `[x]` | Depends on T03. Edge cases: multi-word, hyphenated, empty string |

### Data Files

| ID  | Task | Owner | Status | Notes |
|-----|------|-------|--------|-------|
| T05 | Create `data/riddles.json` | Neo | `[x]` | 20 entries min. Shape: `{question, answer, alternates[], hint}` |
| T06 | Create `data/attributes.json` | Neo | `[x]` | 5+ categories × 5+ variants. Shape: `{id, fragment, insults[], compliments[], hints[]}`. Min 5 insults/compliments/hints per variant |
| T07 | Create `data/conversations.json` | Neo | `[x]` | 3 ConversationDecks (riddlePhase, gobletPhase, intro). ReactionDecks for all 5 outcomes × all characters. 6+ Gramps connectives |

### Engine

| ID  | Task | Owner | Status | Notes |
|-----|------|-------|--------|-------|
| T08 | Implement `utils/DataLoader.js` | Neo | `[x]` | Depends on T05–T07. fetch + parse, validate min-5-variants, construct Decks, createAttributeDeck() factory |
| T09 | Test suite: `DataLoader.js` | Trin | `[x]` | Depends on T08. Validation rejects bad data, factory returns fresh instances, shape checks |
| T10 | Implement `engine/GobletManager.js` | Neo | `[x]` | Depends on T08. Deck-of-Decks generation, null guard on depleted sub-deck, RoundContext assembly |
| T11 | Test suite: `GobletManager.js` | Trin | `[x]` | Depends on T10. No variant shared, safe side random, clue decks populated correctly, null guard fires |
| T12 | Implement `engine/RiddleManager.js` | Neo | `[x]` | Depends on T08. Riddle deck (no autoReshuffle), answer validation with normalize, alternates support |
| T13 | Test suite: `RiddleManager.js` | Trin | `[x]` | Depends on T12. Correct/wrong detection, alternates match, no repeat draws within 20 |
| T14 | Implement `engine/GameSimulator.js` | Neo | `[x]` | Depends on T10, T12. Headless runGame + runBatch. Quality metrics: winRate, variantCollisions, clueRepeat |
| T15 | Validation run: `GameSimulator.runBatch(1000)` | Trin | `[x]` | winRate=75% (correct for 2-chance game), zero crashes, zero variant collisions, 250 unique clue lines |

---

## Sprint 2: Characters + Game Engine
**Goal:** Wired characters, async GameEngine, expanded data. Sprint ends when GameEngine can complete a full 2-round headless cycle with all characters reacting correctly.
**Started:** 2026-03-10
**Team:** Neo (impl), Trin (tests + UAT)

### Definition of Done
- [ ] T16–T29 all complete and checked off
- [ ] GameEngine can complete a full headless 2-round game cycle (wired to Characters)
- [ ] `make test` green — target 150+ tests
- [ ] `make uat` passes all checks
- [ ] `make lint` clean (0 errors, 0 warnings)
- [ ] 100+ riddles in `data/riddles.json`
- [ ] 20+ categories × 8+ variants in `data/attributes.json`

---

### Backlog Carry-over (Sprint 1 test gaps)

| ID  | Task | Owner | Status | Notes |
|-----|------|-------|--------|-------|
| T16 | Add 3 backlog unit tests from Sprint 1 review | Trin | `[ ]` | (1) `GameSimulator.runBatch(200)` winRate distribution 60–90%; (2) `drawN()` genuine null + exhaustion combo (L07); (3) `GobletManager` null-guard direct trigger |

### Characters

| ID  | Task | Owner | Status | Notes |
|-----|------|-------|--------|-------|
| T17 | Implement `characters/Character.js` — base class | Neo | `[ ]` | `name`, `avatar` (emoji), `reactionDecks` map, `react(outcome)` method |
| T18 | Implement `characters/Vizzini.js` | Neo | `[ ]` | Depends on T17. `setRoundDecks(complimentDeck, insultDeck)`, `drawClue(correct)`. 5 reaction outcomes. |
| T19 | Implement `characters/Buttercup.js` | Neo | `[ ]` | Depends on T17. `hint(riddleHint, gobletHintLine)` — combines goblet deck draw + riddle.hint text. 3 reaction outcomes. |
| T20 | Implement `characters/Gramps.js` | Neo | `[ ]` | Depends on T17. `describeGoblet(attributes, connectivesDeck)` — assembles natural paragraph from variant fragments + connectives. |
| T21 | Implement `characters/Boy.js` | Neo | `[ ]` | Depends on T17. Reaction decks only (`goblet:correct`, `goblet:poisoned`). |
| T22 | Test suite: all 4 character classes | Trin | `[ ]` | Depends on T17–T21. `react()` draw, `drawClue()` correct/wrong, Buttercup hint composition, Gramps description grammar, Boy reactions. |

### Engine

| ID  | Task | Owner | Status | Notes |
|-----|------|-------|--------|-------|
| T23 | Implement `engine/EventBus.js` — pub/sub | Neo | `[ ]` | `on(event, cb)`, `off(event, cb)`, `emit(event, payload)`. Zero dependencies. |
| T24 | Test suite: `EventBus.js` | Trin | `[ ]` | Depends on T23. Subscribe, emit, unsubscribe, multiple listeners, unknown event no-op. |
| T25 | Implement `engine/GameEngine.js` — async state machine | Neo | `[ ]` | Depends on T17–T22, T23. 7 states (IDLE→INTRO→RIDDLE_PHASE→GOBLET_PHASE→WIN/LOSE). Emits all events per ARCH. `await chatUI.whenIdle()` before each game-progress step. |
| T26 | Test suite: `GameEngine.js` — state transitions, round 2, async, integration | Trin | `[ ]` | Depends on T25. All state transitions, round 2 trigger, win/lose paths, async await sequencing, all reaction deck outcomes fire. Integration: full 2-round cycle, Round 2 goblets share no variants with Round 1. |

### Data Expansion

| ID  | Task | Owner | Status | Notes |
|-----|------|-------|--------|-------|
| T27 | Expand `data/riddles.json` to 100+ entries | Neo | `[ ]` | All entries must have `question`, `answer`, `alternates[]`, `hint`. No duplicate answers. Run `make uat` after. |
| T28 | Expand `data/attributes.json` to 20+ categories × 8+ variants | Neo | `[ ]` | Min 5 insults/compliments/hints per variant. Run `make uat` after. Validator enforces min-5-variants rule. |
| T29 | UAT gate + Sprint 2 DoD validation | Trin | `[ ]` | Depends on T16–T28. Full `make uat` pass. Confirm Sprint 2 DoD met. Hand off to Mouse for Sprint 3 planning. |

---

## Sprint 3: UI (Planned)
*Not started*

| ID  | Task | Owner |
|-----|------|-------|
| T30 | `ui/ChatUI.js` — async queue, `whenIdle()`, gameplay vs banter styling | Neo |
| T31 | `ui/StatusBar.js` — hearts + round display | Neo |
| T32 | `ui/GobletDisplay.js` — two-panel goblet choice, Gramps description | Neo |
| T33 | `ui/TypingIndicator.js` — per-character animated indicator | Neo |
| T34 | `index.html` + `main.js` + `style.css` — parchment theme, 700px max-width | Neo |
| T35 | Expand all data to final target counts (if not reached in S2) | Neo |

---
*Last updated: 2026-03-10 by Mouse — Sprint 2 planned ✓*
