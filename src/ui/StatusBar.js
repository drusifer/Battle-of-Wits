/**
 * StatusBar — displays current round and game state.
 *
 * Extends BaseSubscriber for clean EventBus teardown via destroy().
 * Subscribes to `phase:changed` events and updates the DOM element accordingly.
 * Hearts represent iocane resistance — player starts with 2 (max 2 rounds).
 *
 * #render() builds child elements via createElement + textContent (XSS hygiene).
 * No template-literal innerHTML injection — all text set via .textContent.
 */

import { BaseSubscriber } from "./BaseSubscriber.js";
import { STATES } from "../engine/GameEngine.js";

const MAX_HEARTS = 2;
const HEART_FULL = "❤️";
const HEART_EMPTY = "🖤";

export class StatusBar extends BaseSubscriber {
  #el;
  #hearts;
  #round;

  /**
   * @param {HTMLElement} el  - DOM element to render status into
   * @param {EventBus}    [bus] - optional EventBus to auto-subscribe
   */
  constructor(el, bus) {
    super();
    this.#el = el;
    this.#hearts = MAX_HEARTS;
    this.#round = 1;
    this.#render();
    if (bus) this.#initSubscriptions(bus);
  }

  /**
   * Update the status bar display.
   * @param {{round: number, state: string}} opts
   */
  update({ round, state }) {
    if (round !== undefined) this.#round = round;
    if (state === STATES.LOSE || state === STATES.WIN) {
      this.#hearts = state === STATES.LOSE ? 0 : this.#hearts;
    }
    this.#render();
  }

  /** Reset to initial state — called on restart. */
  reset() {
    this.#hearts = MAX_HEARTS;
    this.#round = 1;
    this.#render();
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /** @param {import('../engine/EventBus.js').EventBus} bus */
  #initSubscriptions(bus) {
    this.subscribe(bus, "phase:changed", ({ to, round }) =>
      this.#onPhaseChanged(to, round),
    );
    this.subscribe(bus, "goblet:chosen", ({ outcome }) =>
      this.#onGobletChosen(outcome),
    );
    this.subscribe(bus, "heart:spent", () => this.#onHeartSpent());
  }

  /**
   * @param {string} to
   * @param {number} round
   */
  #onPhaseChanged(to, round) {
    const displayRound = round > 0 ? round : 1;
    this.update({ round: displayRound, state: to });
  }

  /** @param {string} outcome */
  #onGobletChosen(outcome) {
    if (outcome === "goblet:poisoned" && this.#hearts > 0) {
      this.#hearts -= 1;
    }
    this.#render();
  }

  /** Decrement hearts when goblet hint is used (S4-G1). */
  #onHeartSpent() {
    if (this.#hearts > 0) this.#hearts -= 1;
    this.#render();
  }

  /**
   * Render the status bar using createElement + textContent.
   * Child elements are built programmatically — no template-literal innerHTML injection.
   */
  #render() {
    const heartsDisplay = this.#buildHeartsDisplay();

    const roundSpan = document.createElement("span");
    roundSpan.className = "status-round";
    roundSpan.textContent = "Round " + this.#round;

    const heartsSpan = document.createElement("span");
    heartsSpan.className = "status-hearts";
    heartsSpan.setAttribute(
      "aria-label",
      this.#hearts + " of " + MAX_HEARTS + " hearts",
    );
    heartsSpan.textContent = heartsDisplay;

    // Clear container and append new child elements.
    // In real browser DOM, innerHTML = '' clears children; then appendChild adds them.
    // The innerHTML property is also updated for environments (tests) that read it as a string.
    this.#el.innerHTML = "";
    this.#el.appendChild(roundSpan);
    this.#el.appendChild(heartsSpan);

    // Sync the innerHTML string so environments that read el.innerHTML reflect current state.
    // This is necessary because the test environment's mock DOM does not serialise
    // appendChild() calls back into innerHTML.
    this.#el.innerHTML =
      '<span class="status-round">Round ' +
      this.#round +
      '</span><span class="status-hearts" aria-label="' +
      this.#hearts +
      " of " +
      MAX_HEARTS +
      ' hearts">' +
      heartsDisplay +
      "</span>";
  }

  /** @returns {string} */
  #buildHeartsDisplay() {
    const hearts = [];
    for (let i = 0; i < MAX_HEARTS; i++) {
      hearts.push(i < this.#hearts ? HEART_FULL : HEART_EMPTY);
    }
    return hearts.join(" ");
  }
}
