import { Character } from "./Character.js";

/**
 * Boy — the sick grandchild listening to the story.
 *
 * Reacts to goblet outcomes only. No clue decks, no round-specific injection.
 *
 * Reaction outcomes: goblet:correct, goblet:poisoned
 */
export class Boy extends Character {
  constructor(reactionDecks) {
    super("Boy", "🤧", reactionDecks);
  }
}
