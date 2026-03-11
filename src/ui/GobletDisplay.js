/**
 * GobletDisplay — two goblet panels with Gramps' descriptions.
 *
 * Subscribes to `goblets:described` to populate descriptions and enable clicks.
 * Subscribes to `phase:changed` to hide/show panels based on current phase.
 * Fires onChoose(side) callback when a goblet is clicked.
 */

import { STATES } from '../engine/GameEngine.js';

export class GobletDisplay {
  #leftEl;
  #rightEl;
  #onChoose;
  #active;

  /**
   * @param {HTMLElement} leftEl    - DOM element for left goblet
   * @param {HTMLElement} rightEl   - DOM element for right goblet
   * @param {Function}    onChoose  - callback(side: 'left'|'right') on goblet click
   * @param {EventBus}    [bus]     - optional EventBus to auto-subscribe
   */
  constructor(leftEl, rightEl, onChoose, bus) {
    this.#leftEl = leftEl;
    this.#rightEl = rightEl;
    this.#onChoose = onChoose;
    this.#active = false;

    this.#leftEl.addEventListener('click', () => this.#handleClick('left'));
    this.#rightEl.addEventListener('click', () => this.#handleClick('right'));

    this.#setVisible(false);
    this.#setEnabled(false);

    if (bus) this.#subscribe(bus);
  }

  /** Show both goblet panels. */
  show() {
    this.#setVisible(true);
  }

  /** Hide both goblet panels. */
  hide() {
    this.#setVisible(false);
    this.#setEnabled(false);
    this.#active = false;
  }

  /** Enable goblet click interaction. */
  enable() {
    if (this.#active) this.#setEnabled(true);
  }

  /** Disable goblet click interaction. */
  disable() {
    this.#setEnabled(false);
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /** @param {EventBus} bus */
  #subscribe(bus) {
    bus.on('goblets:described', ({ left, right }) => this.#onGobletsDescribed(left, right));
    bus.on('phase:changed', ({ to }) => this.#onPhaseChanged(to));
  }

  /**
   * @param {string} left
   * @param {string} right
   */
  #onGobletsDescribed(left, right) {
    this.#leftEl.querySelector('.goblet-desc').textContent = left;
    this.#rightEl.querySelector('.goblet-desc').textContent = right;
    this.#active = true;
    this.#setVisible(true);
    this.#setEnabled(true);
  }

  /** @param {string} to */
  #onPhaseChanged(to) {
    if (to === STATES.GOBLET_PHASE) {
      this.#active = true;
      this.#setVisible(true);
    } else {
      this.hide();
    }
  }

  /** @param {'left'|'right'} side */
  #handleClick(side) {
    if (!this.#active) return;
    if (this.#leftEl.disabled || this.#rightEl.disabled) return;
    this.#onChoose(side);
  }

  /** @param {boolean} visible */
  #setVisible(visible) {
    const display = visible ? '' : 'none';
    this.#leftEl.style.display = display;
    this.#rightEl.style.display = display;
  }

  /** @param {boolean} enabled */
  #setEnabled(enabled) {
    this.#leftEl.disabled = !enabled;
    this.#rightEl.disabled = !enabled;
    const cursor = enabled ? 'pointer' : 'not-allowed';
    this.#leftEl.style.cursor = cursor;
    this.#rightEl.style.cursor = cursor;
    const opacity = enabled ? '1' : '0.4';
    this.#leftEl.style.opacity = opacity;
    this.#rightEl.style.opacity = opacity;
  }
}
