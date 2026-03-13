import { Character } from "./Character.js";

/**
 * Vizzini — the villain.
 *
 * Reacts to riddle answers and the goblet choice.
 * Per round, receives clue Decks injected by GameEngine after GobletManager generates the pair.
 * drawClue() is how Vizzini delivers goblet attribute clues without ever naming a goblet directly.
 *
 * Reaction outcomes: riddle:correct, riddle:wrong, hint:requested, goblet:correct, goblet:poisoned
 */
export class Vizzini extends Character {
  #complimentDeck = null; // safe-goblet clues (correct riddle answer)
  #insultDeck = null; // poisoned-goblet clues (wrong riddle answer)

  constructor(reactionDecks) {
    super("Vizzini", "😤", reactionDecks);
  }

  /**
   * Inject this round's clue Decks.
   * Called by GameEngine after GobletManager.generateGobletPair().
   * @param {Deck} complimentDeck - drawn when player answers riddle correctly
   * @param {Deck} insultDeck     - drawn when player answers riddle incorrectly
   */
  setRoundDecks(complimentDeck, insultDeck) {
    this.#complimentDeck = complimentDeck;
    this.#insultDeck = insultDeck;
  }

  /**
   * Draw one goblet-attribute clue.
   * Correct answer → compliment deck (safe-goblet attributes).
   * Wrong answer   → insult deck (poisoned-goblet attributes).
   * Vizzini never references a goblet directly — the line is pre-authored.
   * @param {boolean} correct
   * @returns {string|null}
   */
  drawClue(correct) {
    const deck = correct ? this.#complimentDeck : this.#insultDeck;
    return deck?.draw() ?? null;
  }
}
