/**
 * ChatUI — renders game events as chat bubbles in a DOM container.
 *
 * Extends BaseSubscriber for clean EventBus teardown via destroy().
 * Subscribes to EventBus events and appends styled message bubbles.
 * Gameplay messages (riddles, clue lines, outcomes) get the 'gameplay' CSS class;
 * banter (ConversationDeck draws) gets the 'banter' class.
 *
 * whenIdle() returns a Promise that resolves after all pending animated bubbles
 * finish their typing-indicator delay.
 */

import { BaseSubscriber } from "./BaseSubscriber.js";
import { TypingIndicator } from "./TypingIndicator.js";

const TYPING_MIN_MS = 400;
const TYPING_CHAR_MS = 35;
const TYPING_MAX_MS = 2500;
const GOBLET_ANIM_DELAY_MS = 600;

const AVATARS = {
  Vizzini: "😤",
  Buttercup: "👸",
  Gramps: "🧓",
  Boy: "🤧",
  DPR: "🏴‍☠️",
};

/**
 * Typing delay: proportional to text length, clamped to [400, 2500] ms.
 * Returns 1ms when window.FAST_MODE is true (e.g. Playwright GUI tests) —
 * keeps the real setTimeout event-loop cycle but runs at minimum timer resolution.
 * @param {string} text
 * @returns {number}
 */
function typingDelay(text) {
  if (typeof window !== "undefined" && window.FAST_MODE) return 1;
  return Math.min(TYPING_MIN_MS + text.length * TYPING_CHAR_MS, TYPING_MAX_MS);
}

export class ChatUI extends BaseSubscriber {
  #container;
  #idlePromise = Promise.resolve();
  #lastVizzinyClueBubble = null;

  /**
   * @param {HTMLElement} containerEl - DOM element to render chat into
   * @param {EventBus}    [bus]       - optional EventBus to auto-subscribe
   */
  constructor(containerEl, bus) {
    super();
    this.#container = containerEl;
    if (bus) this.#initSubscriptions(bus);
  }

  /**
   * Render a scene array as banter bubbles, each animated sequentially.
   * @param {Array<{char: string, line: string}>} scene
   */
  render(scene) {
    if (!scene || scene.length === 0) return;
    // Chain each line sequentially through the idle promise
    for (const { char, line } of scene) {
      this.#chainAnimated(char, line, "banter");
    }
  }

  /**
   * Returns a Promise that resolves when all pending animated bubbles are done.
   * @returns {Promise<void>}
   */
  whenIdle() {
    return this.#idlePromise;
  }

  /** Clear all chat bubbles — called on restart. */
  clear() {
    this.#container.innerHTML = "";
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /**
   * Subscribe to all relevant EventBus events.
   * @param {import('../engine/EventBus.js').EventBus} bus
   */
  #initSubscriptions(bus) {
    this.subscribe(bus, "conversation:play", (scene) => this.render(scene));
    this.subscribe(bus, "riddle:presented", ({ riddle }) =>
      this.#onRiddlePresented(riddle),
    );
    this.subscribe(bus, "riddle:answered", (payload) =>
      this.#onRiddleAnswered(payload),
    );
    this.subscribe(bus, "hint:requested", (payload) =>
      this.#onHintRequested(payload),
    );
    this.subscribe(bus, "hint:goblet-requested", (payload) =>
      this.#onHintGobletRequested(payload),
    );
    this.subscribe(bus, "goblets:described", (payload) =>
      this.#onGobletsDescribed(payload),
    );
    this.subscribe(bus, "goblet:chosen", (payload) =>
      this.#onGobletChosen(payload),
    );
    this.subscribe(bus, "game:won", (payload) => this.#onGameWon(payload));
    this.subscribe(bus, "game:lost", () => this.#onGameLost());
  }

  /** @param {{question: string, hint: string}} riddle */
  #onRiddlePresented(riddle) {
    this.#chainAnimated(
      "Vizzini",
      `Here is your riddle: "${riddle.question}"`,
      "gameplay",
    );
  }

  /** @param {{correct: boolean, answer: string, clueLine: string, reactionLine: string}} payload */
  #onRiddleAnswered(payload) {
    const { answer, clueLine, reactionLine } = payload;
    // Player's own message — appears instantly, anchored right (no typing indicator)
    if (answer) this.#chainInstant("DPR", answer, "player");
    if (reactionLine) this.#chainAnimated("Vizzini", reactionLine, "gameplay");
    if (clueLine) this.#chainAnimatedClue("Vizzini", clueLine, "gameplay");
  }

  /** @param {{hintLine: string, vizziniReaction: string, clueType: string|null}} payload */
  #onHintRequested(payload) {
    const { hintLine, vizziniReaction, clueType } = payload;
    if (hintLine) this.#chainAnimated("Buttercup", hintLine, "gameplay");
    if (vizziniReaction)
      this.#chainAnimated("Vizzini", vizziniReaction, "gameplay");
    if (clueType) this.#chainFlash(clueType);
  }

  /** @param {{hintLine: string, vizziniReaction: string}} payload */
  #onHintGobletRequested(payload) {
    const { hintLine, vizziniReaction } = payload;
    if (hintLine) this.#chainAnimated("Buttercup", hintLine, "gameplay");
    if (vizziniReaction)
      this.#chainAnimated("Vizzini", vizziniReaction, "gameplay");
  }

  /** @param {{left: string, right: string}} payload */
  #onGobletsDescribed(payload) {
    const { left, right } = payload;
    this.#chainAnimated(
      "Gramps",
      `The goblet on the left: ${left}`,
      "gameplay",
    );
    this.#chainAnimated(
      "Gramps",
      `The goblet on the right: ${right}`,
      "gameplay",
    );
  }

  /**
   * @typedef {{ char: string, line: string }} GobletReaction
   * @param {{choice: string, outcome: string, reactionLines: Array<GobletReaction>}} payload
   */
  #onGobletChosen(payload) {
    const { choice, outcome, reactionLines } = payload;
    // Silent delay for goblet reveal animation to play before text (S4-U3)
    this.#chainDelay(GOBLET_ANIM_DELAY_MS);
    const choiceText = `You chose the ${choice} goblet.`;
    this.#chainAnimated("DPR", choiceText, "gameplay");

    const outcomeText =
      outcome === "goblet:correct"
        ? "You chose wisely!"
        : "You chose... poorly.";
    this.#chainAnimated("Gramps", outcomeText, "gameplay");

    for (const entry of reactionLines) {
      this.#chainAnimated(entry.char, entry.line, "gameplay");
    }
  }

  /** @param {{rounds: number}} payload */
  #onGameWon(payload) {
    const { rounds } = payload;
    const msg =
      rounds === 1
        ? "You have bested Vizzini! Westley triumphs in the first round!"
        : "Against all odds, you have survived the iocane challenge! Victory is yours!";
    this.#chainAnimated("Gramps", msg, "gameplay");
  }

  #onGameLost() {
    this.#chainAnimated(
      "Gramps",
      "You have fallen victim to one of the classic blunders. The game is over.",
      "gameplay",
    );
  }

  /**
   * Chain an animated bubble onto #idlePromise so bubbles render sequentially.
   * @param {string} char
   * @param {string} line
   * @param {'gameplay'|'banter'} style
   */
  #chainAnimated(char, line, style) {
    this.#idlePromise = this.#idlePromise.then(() =>
      this.#appendBubbleAnimated(char, line, style),
    );
  }

  /**
   * Like #chainAnimated, but stores the bubble as the last Vizzini clue bubble
   * for the clue-flash feature (S4-U1).
   */
  #chainAnimatedClue(char, line, style) {
    this.#idlePromise = this.#idlePromise
      .then(() => this.#appendBubbleAnimated(char, line, style))
      .then((bubble) => {
        this.#lastVizzinyClueBubble = bubble;
      });
  }

  /**
   * Chain a flash class onto the last Vizzini clueLine bubble (S4-U1).
   * @param {'complement'|'insult'} clueType
   */
  #chainFlash(clueType) {
    this.#idlePromise = this.#idlePromise.then(() => {
      if (!this.#lastVizzinyClueBubble) return;
      const flashClass =
        clueType === "complement" ? "clue-flash-safe" : "clue-flash-poison";
      this.#lastVizzinyClueBubble.className += " " + flashClass;
    });
  }

  /**
   * Chain a silent delay (used for goblet reveal animation, S4-U3).
   * @param {number} ms
   */
  #chainDelay(ms) {
    this.#idlePromise = this.#idlePromise.then(
      () => new Promise((resolve) => setTimeout(resolve, ms)),
    );
  }

  /**
   * Chain an instant bubble (no typing indicator) — used for player messages.
   * @param {string} char
   * @param {string} line
   * @param {'player'} style
   */
  #chainInstant(char, line, style) {
    this.#idlePromise = this.#idlePromise.then(() => {
      this.#appendBubble(char, line, style);
      this.#scrollToBottom();
    });
  }

  /**
   * Show typing indicator, wait for proportional delay, hide it, then append bubble.
   * @param {string} char
   * @param {string} line
   * @param {'gameplay'|'banter'} style
   * @returns {Promise<void>}
   */
  #appendBubbleAnimated(char, line, style) {
    // eslint-disable-next-line security/detect-object-injection
    const avatar = AVATARS[char] ?? "🎭";
    const indicator = new TypingIndicator();
    indicator.show(char, avatar, this.#container);

    this.#scrollToBottom();
    const delay = typingDelay(line);
    return new Promise((resolve) => {
      setTimeout(() => {
        indicator.hide();
        const bubble = this.#appendBubble(char, line, style);
        this.#scrollToBottom();
        resolve(bubble);
      }, delay);
    });
  }

  /**
   * Create and append a chat bubble element (synchronous, no animation).
   * @param {string} char  - character name (used for avatar lookup)
   * @param {string} line  - message text
   * @param {'gameplay'|'banter'} style
   */
  #appendBubble(char, line, style) {
    // eslint-disable-next-line security/detect-object-injection
    const avatar = AVATARS[char] ?? "🎭";
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${style}`;

    const avatarEl = document.createElement("span");
    avatarEl.className = "chat-avatar";
    avatarEl.textContent = avatar;
    avatarEl.setAttribute("aria-label", char);

    const nameEl = document.createElement("span");
    nameEl.className = "chat-name";
    nameEl.textContent = char;

    const lineEl = document.createElement("span");
    lineEl.className = "chat-line";
    lineEl.textContent = line;

    const headerEl = document.createElement("div");
    headerEl.className = "chat-header";
    headerEl.appendChild(avatarEl);
    headerEl.appendChild(nameEl);

    bubble.appendChild(headerEl);
    bubble.appendChild(lineEl);
    this.#container.appendChild(bubble);
    return bubble;
  }

  #scrollToBottom() {
    // requestAnimationFrame not available in Node test env — no-op guard
    if (typeof requestAnimationFrame === "undefined") return;
    requestAnimationFrame(() => {
      this.#container.scrollTop = this.#container.scrollHeight;
    });
  }
}
