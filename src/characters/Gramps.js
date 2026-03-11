import { Character } from './Character.js';

/**
 * Gramps — the narrator.
 *
 * Assembles a natural-sounding goblet description from an array of attribute variants
 * and a connectives Deck. Not a speaker in banter ConversationDecks.
 *
 * Reaction outcomes: goblet:correct, goblet:poisoned
 */
export class Gramps extends Character {
  #connectivesDeck;

  /**
   * @param {object} reactionDecks - pre-built Decks keyed by outcome
   * @param {Deck}   connectivesDeck - auto-reshuffle Deck of connective words/phrases
   */
  constructor(reactionDecks, connectivesDeck) {
    super('Gramps', '🧓', reactionDecks);
    this.#connectivesDeck = connectivesDeck;
  }

  /**
   * Assemble a paragraph describing one goblet from its attribute variants.
   *
   * Example output:
   *   "The cup before you is its handle encircled by a ring of tarnished copper,
   *    topped by a rim worn smooth at the lip, with a base of cracked obsidian,
   *    bearing a body of hammered pewter, and finished with a tarnished patina."
   *
   * @param {Array<{fragment: string}>} attributes - variants drawn for this goblet
   * @returns {string}
   */
  describeGoblet(attributes) {
    if (!attributes || attributes.length === 0) return '';
    const [first, ...rest] = attributes;
    const parts = [first.fragment];
    for (const attr of rest) {
      const connective = this.#connectivesDeck.draw();
      parts.push(`${connective} ${attr.fragment}`);
    }
    return `The cup before you is ${parts.join(', ')}.`;
  }
}
