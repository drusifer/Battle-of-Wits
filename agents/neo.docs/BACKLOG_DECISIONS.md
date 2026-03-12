# Backlog Fix Plan — Sprint 3+4

> Answer inline. Neo will implement once decisions are recorded.

---

## B1: EventBus.off() Teardown + GobletDisplay.destroy()
**Status:** DECIDED
**What:** Store all bus.on() callbacks as named private fields on ChatUI, StatusBar, and GobletDisplay so they can be passed to bus.off() on teardown. Add a destroy() method to all three classes. GobletDisplay.destroy() also calls removeEventListener on both goblet DOM buttons. main.js calls destroy() on each UI component before restart.
**Why:** All three UI classes currently subscribe with anonymous arrow functions — you cannot unsubscribe those. EventBus.off() already exists and works; the fix is purely on the subscriber side. Without this, every restart() accumulates phantom listeners. This is dormant under single-instance lifecycle but becomes a real double-fire bug the moment restart is called repeatedly or SPA routing is introduced.

FEEDBACK: Let's use an interface  BaseSubscriber to managing the event bus logic and use that to normalize the UX components

---

## B2: StatusBar innerHTML — Switch to textContent
**Status:** DECIDED
**What:** Replace the template-literal innerHTML in StatusBar.#render() with createElement + textContent construction. Build child spans programmatically, set their textContent to the round string and emoji hearts, and append them to the container.
**Why:** ChatUI already uses textContent everywhere for XSS hygiene. StatusBar.#render() interpolates `this.#round` (a number from game state) into innerHTML — inconsistent with the project's established discipline and a latent injection vector if the data source ever changes. The rendered output is visually identical; this is a pure code hygiene fix.

FEEDBACK: Good K.I.S.S. applies here.

---

## B3: maxlength on #answer-input
**Status:** DECIDED
**What:** Add `maxlength="200"` to the `#answer-input` element in index.html.
**Why:** RiddleManager normalises and trims input in JS, but the DOM input field has no upper bound. 200 characters is well above any reasonable riddle answer and prevents a user from pasting a large blob of text that would be silently truncated. Enforcing the limit at the DOM level is the correct defence-in-depth approach.

FEEDBACK: +1

---

## B4: ARCH Event Table — Document phase:changed round:0 During INTRO
**Status:** DECIDED
**What:** Add a note to the phase:changed row in the ARCH.md event table documenting that round is 0 when transitioning to STATES.INTRO (i.e. at game start). The note will read: "round is 0 during the IDLE→INTRO transition; all UI consumers must guard against round:0."
**Why:** GameEngine.startGame() emits phase:changed with round:0 during INTRO. StatusBar already guards this correctly (`displayRound = round > 0 ? round : 1`), but the ARCH table does not document the edge case. A future engineer writing a new phase:changed subscriber will not know to guard. This is a pure documentation fix — no code change.


---

## B5: reactionLines — Make Data-Driven (char/line tuples) Instead of Positional Index
**Status:** DECIDED
**What:** Change the goblet:chosen event payload in GameEngine from a flat `reactionLines: string[]` to `reactionLines: Array<{ char: string, line: string }>`. Each entry pairs the character name with the reaction line. ChatUI.#onGobletChosen() iterates the array directly, using `entry.char` for the avatar lookup and `entry.line` for the bubble text. The filter(Boolean) step in GameEngine moves to only emitting entries where the character returned a non-null reaction.
**Why:** The current code maps by position: `reactors[i]` where reactors is `['Vizzini','Buttercup','Gramps','Boy']`. GameEngine's `filter(Boolean)` removes null reactions before emitting, so index i no longer corresponds to the original character order. This silently mis-labels bubbles when any early character returns null. The tuple shape is already used for conversation:play scenes — making goblet:chosen consistent eliminates the positional assumption entirely. This is an internal contract change (GameEngine → ChatUI only); no external API is affected.

FEEDBACK: use a Type for the Goblet response and reaction data it will be much cleaner way to manage the state.

---

## B6: whenIdle() — Typing Animation
**Status:** OPEN — needs Drew's answer

**Context:** whenIdle() is currently a stub that returns Promise.resolve() immediately. This means all dialogue bubbles appear instantaneously — no reading time, no typing feel. The stub is correctly wired throughout GameEngine (all await chatUI.whenIdle() call sites are in place), so the timing behaviour is entirely determined by what whenIdle() does. The implementation complexity varies significantly by option. Options A and B are ~30 minutes of work. Option C is 2-3 hours and changes the visual character of every dialogue bubble. Option D is no work — the stub stays and we ship T31 in a later sprint.

**Options:**
- A) **Fixed delay per bubble** — whenIdle() resolves after a fixed timeout (e.g. 300ms per bubble in the queue). Simple, predictable, gives the chat log a natural rhythm without any typewriter animation. No new DOM work required.
- B) **Character-count proportional delay** — whenIdle() calculates delay as roughly 30–50ms per character (simulating a comfortable reading pace). Longer dialogue lines get more screen time. Still resolves automatically — no animation, just pacing. ~30 minutes of work.
- C) **Typewriter animation inside each bubble** — Characters "type" their lines letter-by-letter inside the chat bubble. whenIdle() resolves only after the last character of the last queued bubble finishes animating. Most immersive. Requires a TypingIndicator component (T31 as originally scoped) and interval/requestAnimationFrame management inside ChatUI. ~2-3 hours.
- D) **Keep the stub, ship T31 later** — Promise.resolve() stays. The game is fully playable without pacing. Defer to a polish sprint when the rest of the game is stable.

**DECISION:** <!-- your answer here -->

FEEDBACK: I want C but use composition to normalize a "delayed events" For example instead of fireing one event to start teh typing indicator and then a second one to stop and show the message, just bake it into the event type so that when it fires it does both the typing indicator and then after the delay the message.

