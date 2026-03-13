import { normalize } from "../utils/normalize.js";

/**
 * RiddleManager — draws riddles and validates player answers.
 *
 * The deck passed in should be autoReshuffle:false so riddles are never
 * repeated within a game.
 */
export class RiddleManager {
  #deck;

  constructor(riddleDeck) {
    this.#deck = riddleDeck;
  }

  /** Draw the next riddle. Returns null when the deck is exhausted. */
  drawRiddle() {
    return this.#deck.draw();
  }

  /**
   * Check whether a player's raw input matches a riddle's answer or alternates.
   * @param {{answer: string, alternates: string[]}} riddle
   * @param {string} rawInput
   * @returns {boolean}
   */
  checkAnswer(riddle, rawInput) {
    if (!rawInput) return false;
    const player = normalize(rawInput);
    const accepted = [riddle.answer, ...riddle.alternates].map(normalize);
    return accepted.includes(player);
  }
}
