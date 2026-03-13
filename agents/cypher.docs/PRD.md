# Product Requirements Document: Battle of Wits

> TL;DR: Browser game where player (DPR) solves 3 riddles per round to collect oblique clues, then picks the safe goblet. Max 2 rounds (iocane resistance). Vizzini never names the goblet. All 10 design decisions resolved. Sprint 1 complete.

## 1. Project Overview
**Battle of Wits** is an interactive, web-based puzzle game inspired by the iconic scene from *The Princess Bride*. Players assume the role of the Dread Pirate Roberts (DPR) in a high-stakes intellectual duel against the villainous Vizzini. The game combines riddle-solving with deductive reasoning, where character dialogue serves as a medium for both narrative and gameplay clues.

## 2. Target Audience
- Fans of *The Princess Bride* seeking a thematic experience.
- Puzzle game enthusiasts who enjoy word riddles and deductive logic.
- Casual gamers looking for a narrative-driven browser experience.

## 3. Core Gameplay Mechanics

### 3.1 Game Structure
- **Game Length:** A full game consists of **at most 2 rounds**. The player can win in Round 1 by correctly identifying the safe goblet.
- **Iocane Resistance (Hearts):** The player has built up resistance to iocane powder. If they drink from the poisoned goblet in Round 1, they survive (resistance kicks in) and a second round begins. Drinking the poison a **second time** is fatal — the player loses.
- **Rounds:** Each round consists of two phases: the **Riddle Phase** and the **Goblet Phase**.
- **Victory Condition:** The player selects the safe goblet. Vizzini, having no iocane resistance, drinks from the poisoned goblet and is defeated.
- **Failure Condition:** The player drinks from the poisoned goblet twice (exhausting their resistance).

### 3.2 Riddle Phase
- Vizzini poses **three riddles** per round.
- **Input:** Players provide a single-word answer.
- **Clue Mechanism — Oblique Adjective Matching (CRITICAL):**
    - **Correct Answer:** Vizzini drops a backhanded 'compliment' (grudging frustration). The dialogue **embeds adjectives that match an attribute of the Safe Goblet** — obliquely, never directly referencing the goblet.
    - **Incorrect Answer:** Vizzini delivers a mocking 'insult'. The dialogue **embeds adjectives that match an attribute of the Poisoned Goblet** — obliquely, never directly referencing the goblet.
    - **Rule:** Vizzini must NEVER refer directly to either goblet in his clue dialogue. The connection is discovered only during the Goblet Phase when the player matches remembered adjectives to visible goblet attributes.
    - *Example:* If the poisoned goblet has a `gold-plated rim`, an insult might read: *"Your answer was more worthless than a gold-plated guilder!"*
- **Clue Accumulation:** Players receive up to 3 clues per round (one per riddle). Correct answers yield safe-goblet clues; incorrect answers yield poisoned-goblet clues. Goblet attributes are unique per goblet (deck system ensures no attribute variant is shared between the two goblets in a round), so clues will never contradict each other.
- **Hints:** Players may request a hint from Buttercup. Buttercup's hints are **mechanically beneficial** — they are naturally laden with goblet attribute adjectives, giving the player additional clues to identify the safe goblet. The narrative cost is that Vizzini reacts with further insults/distractions.

### 3.3 Goblet Phase
- Two goblets (Left and Right) are presented. Each goblet has **multiple attributes** drawn from a large attribute deck (see §5.2).
- A detailed descriptive paragraph is generated for each goblet based on its drawn attributes.
- The **safe goblet is assigned randomly** each round (50/50 left/right); the same side may repeat across rounds.
- The player must choose one goblet to drink from by matching clues gathered during the Riddle Phase to the visible goblet attributes.

## 4. Characters & Roles
- **Dread Pirate Roberts / DPR (Player):** The protagonist making the choices.
- **Vizzini (Antagonist):** Delivers riddles and is the primary clue source via oblique insults/compliments.
- **Buttercup (Helper):** Provides attribute-rich hints for riddles. Her dialogue naturally contains goblet attribute adjectives.
- **Gramps (Narrator):** Sets the scene and describes the goblets in the Goblet Phase.
- **Boy (Audience):** The sick grandson from the framing story (Fred Savage's character). Provides meta-commentary and fan-service flavor text drawn from actual movie/book dialogue, with in-character quips. Conveys illness via `*cough*` and `*sneeze*` emotes. Do **not** call him "Sick Boy."

## 5. Functional Requirements

### 5.1 Riddle Management
- Draw riddles from a **large pre-defined deck** — large enough that it is impossible to exhaust in a single game (max 6 riddles per game across 2 rounds).
- Riddles are drawn **without replacement** — no riddle repeats within a playthrough.
- Riddles exist to drive narrative and elicit Vizzini's clue-laden dialogue; they are not intended to be difficult puzzles in themselves.
- Normalize user input (case-insensitive, strip articles like 'the' or 'a').
- Difficulty scaling (Easy/Medium/Hard) is **deferred to backlog** (see §8).

### 5.2 Attribute & Description System
- Goblet attributes are drawn from a **large attribute deck** with many categories, each containing many variants. The goal is near-infinite goblet variety — it should be virtually impossible to generate the same pair of goblets twice.
- **Deck System (anti-contradiction rule):** Each attribute variant is exclusive to one goblet per round. A variant drawn for the Left Goblet cannot appear on the Right Goblet in the same round. Both goblets may share the same *attribute category* (e.g., both have a "Handle") but must have *different variants* (e.g., `ringed` vs `broken`). Drawn variants are not reused until reshuffle (next round).
- **Example Attribute Structure:**
  ```
  Attribute: Handle
    variants: ringed, broken, bejeweled, carved, wrapped, absent

  Attribute: Rim
    variants: wide, salted, gilded, chipped, engraved, tarnished

  Attribute: Material
    variants: pewter, silver, gold-plated, obsidian, oak, bone
  ... (many more)
  ```
- Procedurally generate a descriptive paragraph for each goblet from its drawn attributes.

### 5.3 Dialogue System
- Implement an `AutoShuffleDeck` for character dialogue to ensure variety and prevent immediate repetition.
- Support `Silence` entries to control pacing and prevent chat overcrowding.
- Boy's dialogue should draw from actual *Princess Bride* movie/book framing-scene lines, supplemented with in-character quips.

### 5.4 UI/UX Requirements
- **Chat Interface:** A parchment-themed scrollable chat log.
- **Typing Indicators:** Visual feedback when characters are 'typing' to enhance immersion.
- **Responsive Design:** Game container fits within a standard browser window (max-width 700px).
- **Status Bar:** Real-time display of Hearts (Iocane Resistance) and Round number.

## 6. User Stories
1. **As a player,** I want to solve riddles so that I can earn clues about which goblet is safe to drink from.
2. **As a player,** I want to ask Buttercup for a hint when a riddle is too difficult so that I have more adjective clues to work with.
3. **As a player,** I want to read a detailed description of both goblets so that I can match the clues I gathered to the goblet attributes.
4. **As a player,** I want to feel the tension of the scene through Vizzini's insults and the Narrator's descriptions.
5. **As a player,** I want to see my progress and health so that I know how many mistakes I can afford.
6. **As a fan,** I want to hear Boy's familiar lines from the movie so that the framing story feels authentic.

## 7. Technical Stack
- **Language:** JavaScript (ES6+ Modules).
- **Frameworks:** None (Vanilla JS/HTML/CSS).
- **Testing:** Vitest / Chai.
- **Assets:** Google Fonts (Merriweather, Roboto).

## 8. Sprint 4 Requirements

### Sprint 4 User Stories

**S4-G1 — Goblet Phase Hint (Buttercup's Secret)**
> As a player, I want to ask Buttercup for a goblet attribute hint during the Goblet Phase so that I have an additional clue to choose the safe goblet — at the cost of one heart.

**Acceptance Criteria:**
- "Ask Buttercup" button is visible in the Goblet Phase (before a choice is made)
- Clicking it draws from `buttercup.gobletHintDeck` and posts a hint in chat
- Vizzini reacts to the hint request (existing `hint:requested` reaction deck)
- Costs 1 heart (StatusBar updates); button disabled after use
- If player has 0 hearts remaining, button is disabled (cannot use)
- Event: `hint:goblet-requested` emitted with `{ hintLine, vizziniReaction }`

---

**S4-U1 — Vizzini Clue Flash on Buttercup Hint**
> As a player, when Buttercup gives a riddle hint, I want the most recent Vizzini clue bubble to briefly flash green (safe goblet) or red (poisoned goblet) so I can see the connection between Vizzini's clue and the hint.

**Acceptance Criteria:**
- Flash triggers after Buttercup finishes speaking (`whenIdle` before flash)
- Safe clue (`clueType: 'complement'`) flashes with green tint (`.clue-flash-safe`)
- Poison clue (`clueType: 'insult'`) flashes with red tint (`.clue-flash-poison`)
- Flash fades back to normal over ~2–3s (CSS transition/animation)
- GameEngine adds `clueType: 'complement' | 'insult'` to `hint:requested` payload

---

**S4-U2 — Real Typing Animation Queue**
> As a player, I want to see each character's typing indicator appear and animate for a realistic duration before their message appears, so the conversation feels natural and immersive.

**Acceptance Criteria:**
- `ChatUI.whenIdle()` returns a Promise that resolves only after the message queue fully drains
- Each message has a typing delay proportional to message length (min ~400ms, max ~1800ms)
- TypingIndicator appears per-character while their message is "typing"
- GameEngine `await whenIdle()` call sites behave correctly — no messages lost or skipped
- All existing tests remain green; new tests cover queue drain behavior

---

**S4-U3 — Goblet Reveal Animation**
> As a player, when I choose a goblet, I want a brief visual animation (shake for poison, glow for safe) before the outcome text appears, so the moment feels dramatic and weighty.

**Acceptance Criteria:**
- Chosen goblet plays a CSS animation before outcome events fire: shake (`.goblet-shake`) for poisoned, glow pulse (`.goblet-glow`) for safe
- Animation duration ~600ms; outcome chat messages wait until animation completes
- Non-chosen goblet has no animation
- No regressions on goblet selection logic or event order

---

**S4-U4 — Mobile Tap Target Audit**
> As a player on a mobile device, I want goblet buttons and the chat input to be large enough to tap accurately, so the game is playable without a mouse.

**Acceptance Criteria:**
- Goblet buttons: minimum 44×44px tap target on viewport ≤ 480px
- Chat input + submit button: minimum 44px height on mobile
- No horizontal overflow on viewport ≤ 375px
- Existing desktop layout unchanged

---

**S4-S1 — Sound Effects**
> As a player, I want to hear audio feedback for key game moments (correct riddle, wrong riddle, goblet chosen safe, goblet chosen poisoned) so the game feels more alive and rewarding.

**Acceptance Criteria:**
- Sound plays on: `riddle:answered` (correct ✓ tone; wrong ✗ tone), `goblet:chosen` (safe = triumphant; poisoned = ominous)
- Sounds are short (<2s), thematically appropriate, royalty-free
- Audio is opt-out: a mute toggle is accessible in the UI
- No sound plays if browser autoplay policy blocks it (graceful silent fallback)
- Sound assets bundled in `assets/sounds/` as `.mp3` or `.ogg`

---

## 9. Future Enhancements (Backlog)
- **Difficulty Scaling:** Tiered riddle difficulty (Easy/Medium/Hard) that scales with round number or player setting (e.g., 'Inconceivable Mode'). Difficulty may affect clue clarity.
- Leaderboard for 'Lowest Hearts Lost' or 'Fastest Win'.
- Integration of more characters from the lore (e.g., Inigo Montoya, Fezzik).
- Streak / score tracking across sessions (localStorage).

---

## 10. Resolved Design Decisions

> **All questions resolved 2026-03-09. Requirements are ready for implementation.**

| # | Topic | Decision |
|---|-------|----------|
| Q1 | Game Length | Max 2 rounds. Win in Round 1 (correct goblet) or survive to Round 2 via Iocane resistance. |
| Q2 | Clue Accumulation | Each riddle generates one clue. No contradictions possible — deck system ensures goblet variants are never shared. Player reconciles mixed clues; Buttercup can help. |
| Q3 | Clue Format | Oblique adjective matching. Vizzini embeds goblet attribute adjectives in his dialogue but **never references the goblet directly**. |
| Q4 | Hint Mechanic | Buttercup's hints are mechanically useful (attribute-adjective laden). Narrative cost only — Vizzini reacts with more insults. |
| Q5 | Hearts / Failure | Round ends on goblet choice. Wrong = lose 1 heart + new round begins. Two wrong choices = game over. |
| Q6 | Attribute System | Many attribute categories, many variants each. Deck system: variants exclusive per goblet per round. Near-infinite goblet variety is the goal. |
| Q7 | Safe Goblet | Randomly assigned each round. Same side may repeat. |
| Q8 | "Boy" Character | Named **Boy** (Fred Savage). Uses actual movie/book framing dialogue + in-character quips. Illness conveyed via `*cough*`/`*sneeze*`. Never "Sick Boy." |
| Q9 | Riddle Deck | Large deck (far more than 6). No repeats per playthrough. Drawn without replacement. |
| Q10 | Difficulty Scaling | Deferred to backlog. Riddles are narrative prompts, not difficulty challenges. |
