import { Deck } from "./Deck.js";

const MIN_VARIANTS = 5;

/**
 * Validate attribute data and throw a descriptive error if any category
 * has fewer than MIN_VARIANTS variants.
 */
function validate(rawAttributes) {
  for (const [category, variants] of Object.entries(rawAttributes)) {
    if (variants.length < MIN_VARIANTS) {
      throw new Error(
        `Category "${category}" has ${variants.length} variants — minimum is ${MIN_VARIANTS}`,
      );
    }
  }
}

/**
 * Build a fresh AttributeDeck from raw attribute data.
 * The outer deck (categories) auto-reshuffles; inner variant decks do NOT.
 * Call this factory once per new game to get independent, fresh instances.
 */
function createAttributeDeck(rawAttributes) {
  const categoryDecks = Object.values(rawAttributes).map(
    (variants) => new Deck(variants, { autoReshuffle: false }),
  );
  return new Deck(categoryDecks, { autoReshuffle: true });
}

/**
 * Build fully-constructed game data from raw JSON objects.
 * Pure function — no side effects, no fetching.
 *
 * @param {object[]} rawRiddles      - Array from riddles.json
 * @param {object}   rawAttributes   - Object from attributes.json
 * @param {object}   rawConversations - Object from conversations.json
 * @returns {GameData}
 */
export function buildGameData(rawRiddles, rawAttributes, rawConversations) {
  validate(rawAttributes);

  const riddleDeck = new Deck(rawRiddles, { autoReshuffle: false });

  const conversations = {
    intro: new Deck(rawConversations.banter.intro),
    riddlePhase: new Deck(rawConversations.banter.riddlePhase),
    gobletPhase: new Deck(rawConversations.banter.gobletPhase),
    outro_win: new Deck(rawConversations.banter.outro_win),
    outro_lose: new Deck(rawConversations.banter.outro_lose),
  };

  const reactions = {};
  for (const [char, outcomes] of Object.entries(rawConversations.reactions)) {
    // eslint-disable-next-line security/detect-object-injection
    reactions[char] = {};
    for (const [outcome, lines] of Object.entries(outcomes)) {
      // eslint-disable-next-line security/detect-object-injection
      reactions[char][outcome] = new Deck(lines, { autoReshuffle: true });
    }
  }

  const grampsConnectives = new Deck(rawConversations.grampsConnectives);

  return {
    riddleDeck,
    createRiddleDeck: () => new Deck(rawRiddles, { autoReshuffle: false }),
    createAttributeDeck: () => createAttributeDeck(rawAttributes),
    conversations,
    reactions,
    grampsConnectives,
  };
}

/**
 * Fetch JSON data files and build game data.
 * For browser use; in Node/tests use buildGameData with imported JSON directly.
 *
 * @param {string} basePath - Base URL or path prefix (default: 'data')
 * @returns {Promise<GameData>}
 */
export async function fetchAndBuild(basePath = "data") {
  const [riddles, attributes, conversations] = await Promise.all([
    fetch(`${basePath}/riddles.json`).then((r) => r.json()),
    fetch(`${basePath}/attributes.json`).then((r) => r.json()),
    fetch(`${basePath}/conversations.json`).then((r) => r.json()),
  ]);
  return buildGameData(riddles, attributes, conversations);
}
