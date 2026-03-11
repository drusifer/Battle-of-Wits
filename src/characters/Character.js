/**
 * Character — base class for all game personas.
 *
 * Each character has a name, an emoji avatar for the chat UI, and a map of
 * reaction Decks keyed by outcome string (e.g. 'riddle:correct').
 *
 * Characters receive pre-built Decks from DataLoader — they do not construct them.
 */
export class Character {
  constructor(name, avatar, reactionDecks = {}) {
    this.name = name;
    this.avatar = avatar;
    this.reactionDecks = reactionDecks;
  }

  /**
   * Draw one reaction line for the given outcome.
   * Returns null if no deck is registered for that outcome.
   * @param {string} outcome - e.g. 'riddle:correct', 'goblet:poisoned'
   * @returns {string|null}
   */
  react(outcome) {
    // eslint-disable-next-line security/detect-object-injection
    return this.reactionDecks[outcome]?.draw() ?? null;
  }
}
