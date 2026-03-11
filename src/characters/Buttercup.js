import { Character } from './Character.js';

/**
 * Buttercup — the ally.
 *
 * Provides hints when the player requests them.
 * Per round, receives the goblet hint Deck (built from safe attribute hints) injected
 * by GameEngine. When a hint is requested, GameEngine draws from this deck and combines
 * it with the current riddle's hint text.
 *
 * Reaction outcomes: hint:requested, goblet:correct, goblet:poisoned
 */
export class Buttercup extends Character {
  #gobletHintDeck = null;

  constructor(reactionDecks) {
    super('Buttercup', '👸', reactionDecks);
  }

  /**
   * Inject this round's goblet hint Deck.
   * Called by GameEngine after GobletManager.generateGobletPair().
   * @param {Deck} gobletHintDeck - hints drawn from the safe goblet's attribute variants
   */
  setRoundDeck(gobletHintDeck) {
    this.#gobletHintDeck = gobletHintDeck;
  }

  /**
   * Draw one goblet-attribute hint line.
   * GameEngine combines this with the riddle's own hint text.
   * @returns {string|null}
   */
  drawGobletHint() {
    return this.#gobletHintDeck?.draw() ?? null;
  }
}
