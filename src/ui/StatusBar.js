/**
 * StatusBar — displays current round and game state.
 *
 * Subscribes to `phase:changed` events and updates the DOM element accordingly.
 * Hearts represent iocane resistance — player starts with 2 (max 2 rounds).
 */

import { STATES } from '../engine/GameEngine.js';

const MAX_HEARTS = 2;
const HEART_FULL = '❤️';
const HEART_EMPTY = '🖤';

export class StatusBar {
  #el;
  #hearts;
  #round;

  /**
   * @param {HTMLElement} el  - DOM element to render status into
   * @param {EventBus}    [bus] - optional EventBus to auto-subscribe
   */
  constructor(el, bus) {
    this.#el = el;
    this.#hearts = MAX_HEARTS;
    this.#round = 1;
    this.#render();
    if (bus) this.#subscribe(bus);
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

  /** @param {EventBus} bus */
  #subscribe(bus) {
    bus.on('phase:changed', ({ to, round }) => this.#onPhaseChanged(to, round));
    bus.on('goblet:chosen', ({ outcome }) => this.#onGobletChosen(outcome));
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
    if (outcome === 'goblet:poisoned' && this.#hearts > 0) {
      this.#hearts -= 1;
    }
    this.#render();
  }

  #render() {
    const heartsDisplay = this.#buildHeartsDisplay();
    this.#el.innerHTML = `
      <span class="status-round">Round ${this.#round}</span>
      <span class="status-hearts" aria-label="${this.#hearts} of ${MAX_HEARTS} hearts">${heartsDisplay}</span>
    `;
  }

  /** @returns {string} */
  #buildHeartsDisplay() {
    const hearts = [];
    for (let i = 0; i < MAX_HEARTS; i++) {
      hearts.push(i < this.#hearts ? HEART_FULL : HEART_EMPTY);
    }
    return hearts.join(' ');
  }
}
