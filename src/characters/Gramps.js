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
   * Assemble a two-sentence paragraph describing one goblet from its attribute variants.
   * Sentence 1 covers the first two attributes; sentence 2 covers the remainder.
   * This avoids a single long run-on sentence when five attributes are drawn.
   *
   * Example output:
   *   "Its handle encircled by a ring of tarnished copper, topped by a rim worn smooth
   *    at the lip. With a base of cracked obsidian, bearing a body of hammered pewter,
   *    and finished with a tarnished patina."
   *
   * @param {Array<{fragment: string}>} attributes - variants drawn for this goblet
   * @returns {string}
   */
  describeGoblet(attributes) {
    if (!attributes || attributes.length === 0) return '';

    const SENTENCE_BREAK = 2;
    const sentences = [];

    const buildSentence = group => {
      const [first, ...rest] = group;
      const cap = first.fragment.charAt(0).toUpperCase() + first.fragment.slice(1);
      const parts = [cap];
      for (const attr of rest) {
        const connective = this.#connectivesDeck.draw();
        parts.push(`${connective} ${attr.fragment}`);
      }
      return `${parts.join(', ')}.`;
    };

    sentences.push(buildSentence(attributes.slice(0, SENTENCE_BREAK)));
    if (attributes.length > SENTENCE_BREAK) {
      sentences.push(buildSentence(attributes.slice(SENTENCE_BREAK)));
    }

    return sentences.join(' ');
  }
}
