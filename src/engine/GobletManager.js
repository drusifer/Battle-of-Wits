import { Deck } from '../utils/Deck.js';

/**
 * GobletManager — generates goblet pairs using the Deck-of-Decks pattern.
 *
 * The outer AttributeDeck (categories) is reset between left and right draws.
 * Inner variant sub-decks are NEVER reset within a game — this guarantees
 * Round 2 goblets cannot share any attribute variant with Round 1 goblets.
 *
 * Call `new GobletManager(gameData.createAttributeDeck())` once per game.
 */
export class GobletManager {
  #attributeDeck;

  constructor(attributeDeck) {
    this.#attributeDeck = attributeDeck;
  }

  /**
   * Generate a pair of goblets and assemble the round's clue decks.
   * @returns {RoundContext}
   */
  generateGobletPair() {
    const leftAttrs = this.#drawAttributes();
    this.#attributeDeck.reset(); // reset outer only — variant sub-decks stay consumed
    const rightAttrs = this.#drawAttributes();

    const safe = Deck.coinFlip() ? 'left' : 'right';
    const safeAttrs = safe === 'left' ? leftAttrs : rightAttrs;
    const poisonAttrs = safe === 'left' ? rightAttrs : leftAttrs;

    return {
      leftGoblet: { attributes: leftAttrs },
      rightGoblet: { attributes: rightAttrs },
      safe,
      vizziniComplimentDeck: new Deck(safeAttrs.flatMap(v => v.compliments)),
      vizziniInsultDeck: new Deck(poisonAttrs.flatMap(v => v.insults)),
      buttercupGobletDeck: new Deck(safeAttrs.flatMap(v => v.hints)),
    };
  }

  /**
   * Draw 5 attribute variants from the outer deck.
   * Skips any category whose variant sub-deck is exhausted (null guard).
   */
  #drawAttributes(count = 5) {
    const ATTEMPTS_MULTIPLIER = 4; // safety ceiling — prevents infinite loop on tiny decks
    const attrs = [];
    let attempts = 0;
    const maxAttempts = count * ATTEMPTS_MULTIPLIER;

    while (attrs.length < count && attempts < maxAttempts) {
      attempts++;
      const categoryDeck = this.#attributeDeck.draw();
      if (!categoryDeck || categoryDeck.isEmpty) continue; // null guard: skip depleted category
      const variant = categoryDeck.draw();
      if (variant !== null) attrs.push(variant);
    }

    return attrs;
  }
}
