# Architecture: Battle of Wits
*Authored by Morpheus — 2026-03-09, revised 2026-03-10 (decisions incorporated)*

---

## TL;DR: Vanilla JS/ES6 module game. `Deck` is the universal primitive — Decks of Decks for structured variety. All game data (riddles, attributes, dialogue) lives in YAML/JSON files loaded at runtime; Deck classes are runtime constructs, not data holders. Goblet generation assembles Vizzini's and Buttercup's clue decks in-situ from drawn attribute variants. ConversationDecks drive multi-character banter; ReactionDecks drive outcome-specific character responses. GameEngine is async-aware (`await chatUI.whenIdle()`). A headless GameSimulator enables rapid playtesting and deck quality measurement.

---

## Module Structure

```
src/
  engine/
    GameEngine.js       # Async state machine — owns RoundContext, awaits ChatUI
    RiddleManager.js    # Riddle deck, answer validation
    GobletManager.js    # Deck-of-Decks goblet pair generation; assembles RoundContext
    GameSimulator.js    # Headless game runner for deck optimisation & logic testing
    EventBus.js         # Simple pub/sub — decouples engine from UI

  characters/
    Character.js        # Base: name, avatar (emoji), reactionDeck map
    Vizzini.js          # Clue decks injected per round; reactionDecks per outcome
    Buttercup.js        # Hint deck injected per round; combined riddle + goblet hint
    Gramps.js           # Assembles goblet description from variant fragments
    Boy.js              # Framing flavor — speaker in ConversationDecks

  data/
    riddles.json              # [{question, answer, alternates[], hint}] — 100+ entries
    attributes/               # Modular: one JSON file per category (T28); merged via `make merge-attributes`
      Handle.json             # [{id, fragment, insults[], compliments[], hints[]}] — 8+ variants
      Rim.json
      Material.json
      ... (20+ category files)
    attributes.json           # Merged output of data/attributes/ (generated; not hand-edited)
    conversations.json        # ConversationDecks + ReactionDecks + Gramps connectives

  ui/
    ChatUI.js           # Async message queue; whenIdle(); gameplay vs banter styling
    StatusBar.js        # Hearts (Iocane resistance) + Round display
    GobletDisplay.js    # Goblet panels + Gramps' description; player choice
    TypingIndicator.js  # Per-character animated typing indicator

  utils/
    Deck.js             # Universal primitive: draw, coinFlip, withFrequency
    DataLoader.js       # Loads + parses YAML/JSON data files; constructs Deck instances
    normalize.js        # Lowercase, strip articles ('the', 'a', 'an')

index.html              # 700px max-width container, parchment theme
main.js                 # Bootstrap: DataLoader → GameEngine → mount UI
style.css               # Parchment/scroll aesthetic; gameplay vs banter visual distinction
```

> ⚠️ **Data Format Note for Neo:** Browser ES6 modules cannot natively `import` YAML. Options:
> - **JSON** (recommended): Native `fetch()` + `JSON.parse()`. Zero dependencies. Same human-editability as YAML.
> - **YAML**: Requires bundling a parser (e.g., `js-yaml`) or a build step — conflicts with the no-frameworks constraint.
>
> Unless Drew specifies otherwise, implement `data/` files as **JSON** and name them accordingly (`.json`). `DataLoader.js` uses `fetch()`. The authoring experience is nearly identical to YAML.

---

## Deck Structure Diagram

```
GAME DECK HIERARCHY
═══════════════════

RIDDLE LAYER
────────────
RiddleDeck (Deck, autoReshuffle:false)
  ├── {question, answer, alternates[], hint}
  ├── {question, answer, alternates[], hint}
  └── ... (100+ entries)


GOBLET LAYER  (Deck of Decks of Decks)
───────────────────────────────────────
AttributeDeck  ← outer, autoReshuffle:TRUE (reset between left/right goblet draws)
  │
  ├── HandleDeck  ← category, autoReshuffle:FALSE (variants consumed across the game)
  │     ├── { id, fragment, insults:[], compliments:[], hints:[] }  ← ringed   (plain arrays)
  │     ├── { id, fragment, insults:[], compliments:[], hints:[] }  ← broken
  │     └── ... (5+ variants minimum)
  │
  ├── RimDeck    ← category, autoReshuffle:FALSE, 5+ variants
  ├── MaterialDeck ← same
  └── ... (20+ category decks)


ROUND ASSEMBLY  (built by GobletManager per round)
───────────────────────────────────────────────────
                        ┌─────────────┐
                        │ AttributeDeck│  ← reset outer only, NOT inner variant decks
                        └──────┬──────┘         (variants consumed persist across rounds)
                draw×5         │         draw×5 (after outer reset)
               ┌───────────────┴───────────────┐
               ▼                               ▼
        Left Goblet                      Right Goblet
        [v1, v2, v3, v4, v5]             [v6, v7, v8, v9, v10]
        (unique variants)                (unique; may share category but not variant)
               │
        safe='left'?
     ┌─────────┴──────────┐
     ▼                    ▼
 Safe Variants       Poisoned Variants
 .compliments[]      .insults[]
 .hints[]
     │                    │
     ▼                    ▼
 vizziniComplimentDeck  vizziniInsultDeck  ← assembled as new Deck([...all lines])
 buttercupHintDeck                        ← assembled from safe variants' hints[]
                                            (merged with riddle.hint at draw time)


REACTION LAYER  (per character, per outcome)
─────────────────────────────────────────────
Each character has a reactionDecks map:
  {
    'riddle:correct':   Deck([...lines]),
    'riddle:wrong':     Deck([...lines]),
    'hint:requested':   Deck([...lines]),   ← Vizzini taunts; Buttercup encourages
    'goblet:correct':   Deck([...lines]),
    'goblet:poisoned':  Deck([...lines]),
  }
Reaction decks are loaded from data, constructed once per game, autoReshuffle:true.


CONVERSATION LAYER  (banter — optional, probabilistic)
────────────────────────────────────────────────────────
ConversationDeck  = Deck.withFrequency([conv1, conv2, ...], ratio)
  ├── null  (blank — inserted automatically by withFrequency)
  ├── null
  ├── [{char:'Vizzini', line:'...'}, {char:'Boy', line:'...'}]  ← a conversation
  └── ...

draw() → null  → skip (no banter this beat)
draw() → [{char,line},...] → ChatUI sequences turns with typing delays


BLANK CARD FREQUENCY CONTROL
──────────────────────────────
Deck.withFrequency(items, ratio) inserts blanks automatically:
  Deck.withFrequency([c1, c2, c3], 1/3)
  → internal array: [c1, null, null, c2, null, null, c3, null, null]
  → ~33% of draws fire a conversation; tunable in one line
```

---

## Core Primitive: `Deck` (utils/Deck.js)

The most critical component. All variety, all randomness, all data sequencing flows through here.

```js
class Deck {
  // JS private fields — never accessible from outside the class
  #deck;
  #ptr;
  #autoReshuffle;

  constructor(items, { autoReshuffle = true } = {}) { ... }

  draw()           // → next item; null if exhausted and !autoReshuffle; reshuffles if autoReshuffle
  drawN(n)         // → array of n items via repeated draw()
  reset()          // → manual reshuffle + reset ptr (used by GobletManager between goblets)
  get isEmpty()    // → true if ptr >= length and !autoReshuffle

  // Static factories
  static withFrequency(items, ratio)  // → new Deck (not array) with blanks inserted to achieve ratio
  static coinFlip()                   // → boolean; THE ONLY random boolean in the codebase

  #shuffle()       // Fisher-Yates using crypto.getRandomValues() — called at construction + reset
}
```

**Rules:**
- `#deck` uses JS private fields — inaccessible outside the class. Never use `._items` patterns.
- `Deck.coinFlip()` is the only source of random booleans in the entire codebase.
- `Deck.#shuffle()` is the only consumer of `crypto.getRandomValues()`. `Math.random()` is banned.
- `Deck.withFrequency()` returns a **`Deck` instance**, not a plain array.

---

## Data Layer (`data/`)

### Format
All game data is stored in **JSON files** (see format note above). `DataLoader.js` fetches them and constructs Deck instances at game start. Data files are pure content — no logic.

### Riddle Data (`data/riddles.json`)
```json
[
  {
    "question": "What has roots as nobody sees, is taller than trees, up, up, up it goes and yet never grows?",
    "answer": "mountain",
    "alternates": ["mountains"],
    "hint": "Think of something ancient and immovable that touches the sky."
  }
]
```
Target: **100+ riddles**. `hint` is used by Buttercup (combined with a goblet attribute clue).

### Attribute Data (`data/attributes/` → merged to `data/attributes.json`)
As of T28, attributes live in a modular directory — one JSON file per category (e.g., `Handle.json`, `Rim.json`). The merged `data/attributes.json` is generated by running `make merge-attributes` and is what `DataLoader` loads at runtime. Do not hand-edit the merged file.

Example category file (`data/attributes/Handle.json`):
```json
[
  {
    "id": "Handle:ringed",
    "fragment": "its handle encircled by a ring of tarnished copper",
    "insults":     ["Even your grip is as circular and pointless as a ringed fool!", "..."],
    "compliments": ["A ringed scholar could not have answered more cleverly...", "..."],
    "hints":       ["Sometimes what binds things together tells you what they truly are...", "..."]
  }
]
```
The merged `attributes.json` shape is `{ "Handle": [...], "Rim": [...], ... }`.

- **Minimum 5 variants per category** (data constraint — enforced by DataLoader validation).
- Target: **20+ categories × 8+ variants = 160+ variant entries**.
- `insults`, `compliments`, `hints` are plain string arrays. `DataLoader` wraps them in `Deck` instances.

### Conversation & Reaction Data (`data/conversations.json`)
```json
{
  "banter": {
    "riddlePhase": [
      [{"char": "Vizzini", "line": "INCONCEIVABLE!"}, {"char": "Boy", "line": "*cough* You keep using that word..."}],
      null
    ]
  },
  "reactions": {
    "Vizzini": {
      "riddle:correct":  ["Inconceivable! A lucky guess...", "..."],
      "riddle:wrong":    ["Ha! As I expected from someone of your limited faculties!", "..."],
      "hint:requested":  ["Asking for help? INCONCEIVABLE!", "..."],
      "goblet:correct":  ["This is... not possible.", "..."],
      "goblet:poisoned": ["HAHAHA! You fell victim to one of the classic blunders!", "..."]
    },
    "Buttercup": {
      "hint:requested":  ["Westley, listen carefully...", "..."],
      "goblet:correct":  ["Oh, Westley! I knew you could do it!", "..."]
    }
  },
  "grampsConnectives": ["with", "its", "topped by", "bearing", "finished with", "and"]
}
```

---

## Game State Machine (engine/GameEngine.js)

GameEngine is **async** — it `await`s `chatUI.whenIdle()` before each game-progress event, ensuring dialogue sequences complete before gameplay continues. Player input is disabled while ChatUI is busy.

```
IDLE
  ──[startGame()]──▶ INTRO
INTRO
  ──► await play(introDeck)
  ──[introComplete()]──▶ RIDDLE_PHASE { round: 1 }

RIDDLE_PHASE { round }
  ──► draw(banterDeck) → if non-null: await play(conversation)
  ──► await present(riddle)                     [player inputs answer]
  ──[answerRiddle(answer)]
      ──► await play(vizzini.reactionDeck['riddle:correct|wrong'].draw())
      ──► await play(vizzini.drawClue(correct))  [goblet attribute clue]
      ──▶ (same state, next riddle) [riddles 1 & 2]
      ──▶ GOBLET_PHASE               [after riddle 3]

GOBLET_PHASE { round }
  ──► draw(gobletBanterDeck) → if non-null: await play(conversation)
  ──► gramps.describeGoblet(attributes) × 2   [left goblet, then right goblet]
  ──► show GobletDisplay                        [player clicks a goblet]
  ──[chooseGoblet(choice)]
      ──► await play(allCharacters.reactionDeck[outcome].draw())
      ──▶ WIN                         [choice === safe]
      ──▶ RIDDLE_PHASE { round: 2 }   [choice === poisoned, round 1]
      ──▶ LOSE                        [choice === poisoned, round 2]

WIN / LOSE
  ──► await play(outroDeck)
  ──[restart()]──▶ IDLE
```

**Visual differentiation (D6 addendum):** Gameplay messages (riddles, goblet choices, outcomes, clue lines) are styled distinctly from banter ConversationDecks in the ChatUI — e.g., gameplay in a highlighted/bordered bubble, banter in a softer style. Player can visually distinguish "this matters" from "this is flavour."

**Key events emitted:**
| Event | Payload |
|-------|---------|
| `conversation:play` | `[{ char, line }, ...]` |
| `phase:changed` | `{ from, to, round }` |
| `riddle:presented` | `{ riddle }` |
| `riddle:answered` | `{ correct, clueLine, reactionLine }` |
| `hint:requested` | `{ hintLine, vizziniReaction }` |
| `goblets:described` | `{ left: string, right: string }` |
| `goblet:chosen` | `{ choice: 'left'\|'right', outcome: 'goblet:correct'\|'goblet:poisoned', reactionLines: string[] }` — array ordered [Vizzini, Buttercup, Gramps, Boy]; nulls filtered by ChatUI |
| `game:won` | `{ rounds }` |
| `game:lost` | `{}` |

---

## Goblet Generation (engine/GobletManager.js)

`GobletManager` holds a single `AttributeDeck` instance created by `DataLoader` at game start (not a module singleton — fresh per game). Variant sub-decks are **never reset between rounds** within a game, guaranteeing Round 2 goblets have different variants than Round 1.

### Generation Algorithm
```
generateGobletPair(attributeDeck):
  1. attributeDeck.reset()           // reset OUTER only (category order reshuffled)
                                     // inner variant decks NOT reset (consumed = consumed)

  2. Draw 5 attributes for Left Goblet:
     for each of 5 slots:
       categoryDeck = attributeDeck.draw()
       if categoryDeck.isEmpty → skip, draw next category   ← null guard
       variant = categoryDeck.draw()
       leftAttrs.push(variant)

  3. attributeDeck.reset()           // reset outer again for Right Goblet draw

  4. Draw 5 attributes for Right Goblet:  (same null guard applies)

  5. safe = Deck.coinFlip() ? 'left' : 'right'

  6. Assemble clue decks (DataLoader already built plain arrays; wrap in Deck here):
     safeAttrs    = roundContext.safe === 'left' ? leftAttrs : rightAttrs
     poisonAttrs  = the other

     vizziniComplimentDeck = new Deck( safeAttrs.flatMap(v => v.compliments) )
     vizziniInsultDeck     = new Deck( poisonAttrs.flatMap(v => v.insults) )
     buttercupGobletDeck   = new Deck( safeAttrs.flatMap(v => v.hints) )

  7. Return RoundContext
```

### RoundContext
```js
{
  leftGoblet:  { attributes: [...variants] },
  rightGoblet: { attributes: [...variants] },
  safe: 'left' | 'right',
  vizziniComplimentDeck: Deck,   // draw() for correct riddle clue
  vizziniInsultDeck:     Deck,   // draw() for wrong riddle clue
  buttercupGobletDeck:   Deck,   // draw() for goblet portion of hint
}
```

### Goblet Description (Gramps)
Gramps assembles a natural-sounding paragraph from variant `fragment` strings + connectives:
```
"The cup before you is [fragment:material], [connective] [fragment:handle],
 [connective] [fragment:rim], [connective] [fragment:base] [connective] [fragment:condition]."
```
Connectives are drawn from a small `Deck` (auto-reshuffle) loaded from `conversations.json`. The assembly sounds generated in real-time, not like a list.

---

## Character Architecture

### Base Class (`characters/Character.js`)
```js
class Character {
  constructor(name, avatar, reactionDecks = {}) {
    this.name         = name;
    this.avatar       = avatar;       // emoji shown in chat UI
    this.reactionDecks = reactionDecks; // { 'outcome:key': Deck }
  }
  react(outcome) {
    return this.reactionDecks[outcome]?.draw() ?? null;
  }
}
```

**Character Avatars:**
| Character | Avatar | Reaction Outcomes |
|-----------|--------|--------------------|
| Vizzini   | 😤 | `riddle:correct`, `riddle:wrong`, `hint:requested`, `goblet:correct`, `goblet:poisoned` |
| Buttercup | 👸 | `hint:requested`, `goblet:correct`, `goblet:poisoned` |
| Gramps    | 🧓 | `goblet:correct`, `goblet:poisoned` |
| Boy       | 🤧 | `goblet:correct`, `goblet:poisoned` |
| DPR (player) | 🏴‍☠️ | n/a |

### Vizzini (`characters/Vizzini.js`)
```js
class Vizzini extends Character {
  setRoundDecks(complimentDeck, insultDeck) { ... }  // called by GobletManager
  drawClue(correct) {
    return correct ? this._complimentDeck.draw() : this._insultDeck.draw();
  }
}
```
No template injection. Lines are complete as authored. Vizzini never references a goblet.

### Buttercup (`characters/Buttercup.js`)
When hint requested, GameEngine assembles a 3-part hint:
```js
[buttercup.react('hint:requested'), buttercup.drawGobletHint(), currentRiddle.hint]
  .filter(Boolean)
  .join(' ')
```
Parts: (1) Buttercup's `hint:requested` reaction line, (2) a goblet-attribute clue from the safe goblet's hint deck, (3) the current riddle's `hint` field. Any null parts are filtered out. GameEngine then also draws Vizzini's `hint:requested` reaction and emits both via `hint:requested`.

### Gramps (`characters/Gramps.js`)
Assembles description on demand from goblet variant fragments + connective deck. Not a speaker in banter conversations.

---

## GameSimulator (engine/GameSimulator.js)

Headless game runner for deck quality measurement and logic testing — no UI, no delays.

```js
class GameSimulator {
  constructor(gameData) { ... }

  runGame()       // → { won, rounds, clueLines, allVariantIds }
  runBatch(n)     // → { n, wins, winRate, avgRounds, variantCollisions, uniqueClueLines, maxClueRepeatRate }

  // Quality metrics:
  // - winRate: ~75% at random play (P = 0.5 + 0.5×0.5 — player gets 2 chances, not 1)
  // - variantCollisions: must be 0 — same variant id appearing in both goblets or across rounds
  // - uniqueClueLines: variety measure — higher is better
  // - maxClueRepeatRate: fraction of draws that return the most-repeated line (lower = better)
}
```

**Win rate note:** At random 50/50 play, expected win rate is **75%**, not 50%. The player gets two chances: P(win R1) + P(survive R1)×P(win R2) = 0.5 + 0.5×0.5 = 0.75.

Used by:
- Developers to tune deck sizes and frequencies before content authoring
- Trin's test suite to verify game logic in isolation (no UI mocking needed)

---

## EventBus (engine/EventBus.js)

Lightweight pub/sub. Decouples GameEngine (emitter) from ChatUI and other listeners (consumers). No dependencies. Synchronous dispatch.

```js
class EventBus {
  on(event, callback)   // Subscribe a callback to an event
  off(event, callback)  // Unsubscribe a specific callback. No-op if not registered.
  emit(event, payload)  // Dispatch payload to all registered listeners for that event
}
```

---

## DataLoader (utils/DataLoader.js)

Fetches JSON data files, validates them, and constructs all Deck instances. Called once at game start. Returns a fully-constructed game data object.

```js
// Module-level functions — not a class
export function buildGameData(rawRiddles, rawAttributes, rawConversations) → {
  riddleDeck:          Deck,           // autoReshuffle:false
  createRiddleDeck:    () => Deck,     // factory — fresh riddle deck per game
  createAttributeDeck: () => Deck,     // factory — fresh attribute deck per game (Deck-of-Decks)
  conversations:       { intro, riddlePhase, gobletPhase, outro_win, outro_lose },  // Decks
  reactions:           { Vizzini: {...}, Buttercup: {...}, Gramps: {...}, Boy: {...} },
  grampsConnectives:   Deck,
}

export async function fetchAndBuild(basePath = 'data') → GameData
// fetch + JSON.parse + buildGameData — for browser use only
```

Internal: `validate(rawAttributes)` throws if any category has < 5 variants.

`createAttributeDeck()` is a factory — each call constructs a fresh set of Deck instances from the loaded raw data. This solves the singleton mutation problem (D1).

---

## UI Architecture (`ui/`)

**ChatUI** is async-aware. `whenIdle()` returns a Promise that resolves when the message queue drains. GameEngine awaits it before each game-progress event.

**Visual differentiation:** Two message styles:
- **Gameplay** (riddles, clue lines, goblet outcomes): highlighted border/background — visually prominent. Player knows this content matters.
- **Banter** (ConversationDeck draws): softer styling, no border — clearly flavour.

```js
// Message queue entry
{ char: Character, line: string, typingMs: number, style: 'gameplay' | 'banter' }
```

**GobletDisplay** is hidden during Riddle Phase. During Goblet Phase: two panels side-by-side with Gramps' assembled description. Player input (click/tap) is disabled while ChatUI is busy.

**HTML contract — required child selectors:**
- Each goblet button element must contain a child element with class `goblet-desc` (e.g., `<span class="goblet-desc">`). `GobletDisplay` uses `querySelector('.goblet-desc')` to populate description text. If this child is absent, a null-dereference error will occur at `goblets:described` time.

**AVATARS map (ChatUI.js):**
```js
const AVATARS = {
  Vizzini: '😤', Buttercup: '👸', Gramps: '🧓', Boy: '🤧', DPR: '🏴‍☠️',
};
```
When adding a new character to the game, add their name → emoji entry here. Unknown characters fall back to `'🎭'`.

**`goblet:chosen` payload (full shape):**
```js
{ choice: 'left'|'right', outcome: 'goblet:correct'|'goblet:poisoned', reactionLines: string[] }
```
`reactionLines` is an ordered array: `[vizziniLine, buttercupLine, grampLine, boyLine]`. Any entry may be null; ChatUI skips nulls.

**`whenIdle()` (Sprint 3 MVP):** Resolves immediately — no typing animation queue yet. T31 will implement the real async queue drain. All GameEngine `await chatUI.whenIdle()` call sites are wired correctly; only the UI-side timing is deferred.

---

## Implementation Order (for Neo)

1. `utils/Deck.js` — `draw`, `drawN`, `reset`, `isEmpty`, `coinFlip`, `withFrequency`, `_shuffle` (crypto). **Test first.**
2. `utils/normalize.js`
3. `data/riddles.json` — start with 20 entries (all with `hint` field)
4. `data/attributes/` — 5 categories × 5 variants minimum (one JSON per category); run `make merge-attributes` to produce `data/attributes.json`
5. `data/conversations.json` — minimal reactions + 2–3 ConversationDecks + Gramps connectives
6. `utils/DataLoader.js` — load + validate + construct Decks
7. `engine/GobletManager.js` — Deck-of-Decks generation, RoundContext assembly
8. `engine/RiddleManager.js` — answer validation
9. `engine/GameSimulator.js` — headless game runner ← verify logic before building UI
10. `characters/` — all characters with reactionDecks
11. `engine/GameEngine.js` + `engine/EventBus.js` — async state machine
12. `ui/` — ChatUI (async + visual diff), StatusBar, GobletDisplay, TypingIndicator
13. `index.html` + `main.js` + `style.css`
14. Expand all data files to target counts

---

## Testing Strategy (for Trin)

- `Deck` — draw-without-replacement, autoReshuffle, drawN, null handling, `withFrequency` blank ratio, `coinFlip` distribution, `_shuffle` uses crypto (not Math.random)
- `DataLoader` — validates min 5 variants, constructs Decks correctly, `createAttributeDeck()` returns fresh instances
- `GobletManager` — no variant shared between goblets in same game, `Deck.coinFlip()` safe assignment, null guard fires on depleted category
- `RiddleManager` — normalize, correct/incorrect detection, no repeats
- `GameSimulator.runBatch(1000)` — win rate ≈ 75% at random play (2-chance game), no crashes, zero variant collisions, clue lines never reference goblets directly
- `GameEngine` — all state transitions, round 2 trigger, async await sequencing
- Integration: full 2-round cycle; all reaction deck outcomes fire; Round 2 goblets share no variants with Round 1

---

## Key Constraints (Non-Negotiable)

- **No frameworks** — Vanilla JS/ES6 modules only
- **`crypto.getRandomValues()`** — via `Deck._shuffle()` only; `Math.random()` is banned
- **`Deck.coinFlip()`** — the only random boolean source in the codebase
- **No `{{adj}}` templates** — all clue lines pre-written per variant
- **No array indexing into decks** — always use `draw()`
- **Vizzini never references a goblet** — enforced by authored data
- **Decks of Decks** — variety via composition, not procedural logic
- **Data files are JSON** — loaded by DataLoader; never imported directly as JS modules
- **Minimum 5 variants per category** — enforced by DataLoader validation
- **No sub-deck reset between rounds** — guarantees cross-round goblet uniqueness
- **max-width: 700px** container
- **Vitest + Chai** for all tests

> Open design decisions are tracked in `agents/morpheus.docs/DECISIONS.md`.
