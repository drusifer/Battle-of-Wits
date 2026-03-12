import { describe, it, expect } from 'vitest';
import { buildGameData } from '../../src/utils/DataLoader.js';
import { Deck } from '../../src/utils/Deck.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load real data files for integration-style unit tests
const rawRiddles = JSON.parse(readFileSync(resolve('data/riddles.json'), 'utf8'));
const rawAttributes = JSON.parse(readFileSync(resolve('data/attributes.json'), 'utf8'));
const rawConversations = JSON.parse(readFileSync(resolve('data/conversations.json'), 'utf8'));

describe('buildGameData', () => {
  it('returns a gameData object', () => {
    const gd = buildGameData(rawRiddles, rawAttributes, rawConversations);
    expect(gd).toBeDefined();
  });

  // ── riddleDeck ──────────────────────────────────────────────────────────────

  it('riddleDeck is a Deck instance', () => {
    const { riddleDeck } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    expect(riddleDeck).toBeInstanceOf(Deck);
  });

  it('riddleDeck draws riddle objects with required fields', () => {
    const { riddleDeck } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const riddle = riddleDeck.draw();
    expect(riddle).toHaveProperty('question');
    expect(riddle).toHaveProperty('answer');
    expect(riddle).toHaveProperty('alternates');
    expect(riddle).toHaveProperty('hint');
    expect(Array.isArray(riddle.alternates)).toBe(true);
  });

  // ── createAttributeDeck factory ─────────────────────────────────────────────

  it('createAttributeDeck is a function', () => {
    const { createAttributeDeck } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    expect(typeof createAttributeDeck).toBe('function');
  });

  it('createAttributeDeck returns a Deck each call', () => {
    const { createAttributeDeck } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    expect(createAttributeDeck()).toBeInstanceOf(Deck);
  });

  it('createAttributeDeck returns a FRESH instance each call (not a singleton)', () => {
    const { createAttributeDeck } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const d1 = createAttributeDeck();
    const d2 = createAttributeDeck();
    expect(d1).not.toBe(d2);

    // Draw a variant from d1 — it should not affect d2
    const categoryDeck1 = d1.draw();
    const variant1 = categoryDeck1.draw();
    const categoryDeck2 = d2.draw();
    const variant2 = categoryDeck2.draw();

    // Both should be valid variants (not null/undefined)
    expect(variant1).not.toBeNull();
    expect(variant2).not.toBeNull();
  });

  it('attribute category sub-decks draw variant objects with required fields', () => {
    const { createAttributeDeck } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const attrDeck = createAttributeDeck();
    const categoryDeck = attrDeck.draw();
    const variant = categoryDeck.draw();
    expect(variant).toHaveProperty('id');
    expect(variant).toHaveProperty('fragment');
    expect(variant).toHaveProperty('insults');
    expect(variant).toHaveProperty('compliments');
    expect(variant).toHaveProperty('hints');
    expect(Array.isArray(variant.insults)).toBe(true);
    expect(Array.isArray(variant.compliments)).toBe(true);
    expect(Array.isArray(variant.hints)).toBe(true);
  });

  // ── Validation: min 5 variants per category ─────────────────────────────────

  it('throws if any category has fewer than 5 variants', () => {
    const badAttributes = { ...rawAttributes, TooFew: [rawAttributes.Material[0]] };
    expect(() => buildGameData(rawRiddles, badAttributes, rawConversations)).toThrow(/TooFew.*5/i);
  });

  it('does not throw with valid data', () => {
    expect(() => buildGameData(rawRiddles, rawAttributes, rawConversations)).not.toThrow();
  });

  // ── conversations ────────────────────────────────────────────────────────────

  it('conversations object has expected keys', () => {
    const { conversations } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    expect(conversations).toHaveProperty('riddlePhase');
    expect(conversations).toHaveProperty('gobletPhase');
    expect(conversations).toHaveProperty('intro');
    expect(conversations.riddlePhase).toBeInstanceOf(Deck);
  });

  it('conversations riddlePhase draws null or array of turns', () => {
    const { conversations } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const draw = conversations.riddlePhase.draw();
    const isNullOrArray = draw === null || Array.isArray(draw);
    expect(isNullOrArray).toBe(true);
  });

  // ── reactions ────────────────────────────────────────────────────────────────

  it('reactions contains character entries', () => {
    const { reactions } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    expect(reactions).toHaveProperty('Vizzini');
    expect(reactions).toHaveProperty('Buttercup');
  });

  it('Vizzini reactions have all 5 outcome decks', () => {
    const { reactions } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    expect(reactions.Vizzini['riddle:correct']).toBeInstanceOf(Deck);
    expect(reactions.Vizzini['riddle:wrong']).toBeInstanceOf(Deck);
    expect(reactions.Vizzini['hint:requested']).toBeInstanceOf(Deck);
    expect(reactions.Vizzini['goblet:correct']).toBeInstanceOf(Deck);
    expect(reactions.Vizzini['goblet:poisoned']).toBeInstanceOf(Deck);
  });

  it('reaction decks draw string lines', () => {
    const { reactions } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const line = reactions.Vizzini['riddle:correct'].draw();
    expect(typeof line).toBe('string');
    expect(line.length).toBeGreaterThan(0);
  });

  // ── grampsConnectives ────────────────────────────────────────────────────────

  it('grampsConnectives is a Deck', () => {
    const { grampsConnectives } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    expect(grampsConnectives).toBeInstanceOf(Deck);
  });

  it('grampsConnectives draws string values', () => {
    const { grampsConnectives } = buildGameData(rawRiddles, rawAttributes, rawConversations);
    expect(typeof grampsConnectives.draw()).toBe('string');
  });
});
