/**
 * Backlog tests from Sprint 1 post-mortem (T16).
 *
 * Three gaps identified during Sprint 1 review:
 *  1. GameSimulator winRate distribution not guarded by a unit test (caught only by UAT)
 *  2. drawN() behaviour when deck has genuine null items AND is exhaustible (L07)
 *  3. GobletManager null-guard for depleted category deck (only tested indirectly via batch)
 */
import { describe, it, expect } from 'vitest';
import { Deck } from '../../src/utils/Deck.js';
import { GobletManager } from '../../src/engine/GobletManager.js';
import { GameSimulator } from '../../src/engine/GameSimulator.js';
import { buildGameData } from '../../src/utils/DataLoader.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Build an AttributeDeck directly (bypassing buildGameData validation) from a raw
 * attributes map. Used to construct pathological decks for null-guard testing.
 */
function buildAttributeDeckDirect(rawAttributes) {
  const categoryDecks = Object.values(rawAttributes).map(
    variants => new Deck(variants, { autoReshuffle: false })
  );
  return new Deck(categoryDecks, { autoReshuffle: true });
}

const rawRiddles = JSON.parse(readFileSync(resolve('data/riddles.json'), 'utf8'));
const rawAttributes = JSON.parse(readFileSync(resolve('data/attributes.json'), 'utf8'));
const rawConversations = JSON.parse(readFileSync(resolve('data/conversations.json'), 'utf8'));

function makeGameData() {
  return buildGameData(rawRiddles, rawAttributes, rawConversations);
}

// ── 1. GameSimulator winRate distribution ──────────────────────────────────────

describe('GameSimulator winRate distribution (backlog T16)', () => {
  it('winRate is between 60% and 90% over 200 games at random play', () => {
    // Expected: ~75% (P = 0.5 + 0.5×0.5 for 2-chance game).
    // Wide bounds to avoid flakiness while still catching gross logic errors.
    const sim = new GameSimulator(makeGameData());
    const { winRate } = sim.runBatch(200);
    expect(winRate).toBeGreaterThan(0.6);
    expect(winRate).toBeLessThan(0.9);
  });

  it('variantCollisions is 0 over 100 games', () => {
    const sim = new GameSimulator(makeGameData());
    const { variantCollisions } = sim.runBatch(100);
    expect(variantCollisions).toBe(0);
  });
});

// ── 2. drawN() with genuine null items AND exhaustion ─────────────────────────

describe('drawN() genuine null + exhaustion combo (backlog T16, lesson L07)', () => {
  it('stops early on exhaustion, not on blank-card null', () => {
    // Deck: [realItem, null(blank), realItem] — autoReshuffle:false
    // drawN(10) should return 3 items (2 real + 1 blank), then stop when exhausted.
    const d = new Deck(['real-a', null, 'real-b'], { autoReshuffle: false });
    const results = d.drawN(10);

    // Should return all 3 items (including the null blank card), then stop.
    expect(results).toHaveLength(3);
    expect(results).toContain('real-a');
    expect(results).toContain('real-b');
    expect(results).toContain(null); // the genuine null blank card
  });

  it('is truly exhausted after drawing all items including blank nulls', () => {
    const d = new Deck(['x', null, 'y'], { autoReshuffle: false });
    d.drawN(10);
    expect(d.isEmpty).toBe(true);
  });

  it('drawN() on a non-null-only deck stops cleanly at exhaustion', () => {
    const d = new Deck([1, 2, 3], { autoReshuffle: false });
    const results = d.drawN(100);
    expect(results).toHaveLength(3);
    expect(d.isEmpty).toBe(true);
  });
});

// ── 3. GobletManager null-guard for depleted category deck ────────────────────

describe('GobletManager null-guard on depleted category (backlog T16)', () => {
  it('generateGobletPair() still produces attributes when one category is exhausted', () => {
    // Build a minimal attribute set with one category holding only 1 variant.
    // DataLoader validates min-5 — bypass it and construct the AttributeDeck directly.
    function makeVariants(prefix, count) {
      return Array.from({ length: count }, (_, i) => ({
        id: `${prefix}:v${i}`,
        fragment: `${prefix} fragment ${i}`,
        insults: Array.from({ length: 5 }, (_, j) => `${prefix} insult ${i}-${j}`),
        compliments: Array.from({ length: 5 }, (_, j) => `${prefix} compliment ${i}-${j}`),
        hints: Array.from({ length: 5 }, (_, j) => `${prefix} hint ${i}-${j}`),
      }));
    }

    // One Tiny category with a single variant — exhausted after the first round.
    // Five healthy categories with 10 variants each — enough for 2 full rounds.
    const miniAttributes = {
      Tiny: makeVariants('Tiny', 1), // ← will be exhausted after Round 1
      Alpha: makeVariants('Alpha', 10),
      Beta: makeVariants('Beta', 10),
      Gamma: makeVariants('Gamma', 10),
      Delta: makeVariants('Delta', 10),
      Epsilon: makeVariants('Epsilon', 10),
    };

    // Bypass buildGameData validation — construct AttributeDeck directly.
    const attributeDeck = buildAttributeDeckDirect(miniAttributes);
    const manager = new GobletManager(attributeDeck);

    // Round 1: Tiny:v0 is drawn and consumed.
    const ctx1 = manager.generateGobletPair();
    expect(ctx1.leftGoblet.attributes.length).toBeGreaterThan(0);
    expect(ctx1.rightGoblet.attributes.length).toBeGreaterThan(0);

    // Round 2: Tiny is exhausted. null-guard skips it — no crash, attributes still filled.
    const ctx2 = manager.generateGobletPair();
    expect(ctx2.leftGoblet.attributes.length).toBeGreaterThan(0);
    expect(ctx2.rightGoblet.attributes.length).toBeGreaterThan(0);

    // Tiny:v0 must NOT appear in Round 2 (it was consumed in Round 1).
    const round2Ids = [
      ...ctx2.leftGoblet.attributes.map(v => v.id),
      ...ctx2.rightGoblet.attributes.map(v => v.id),
    ];
    expect(round2Ids).not.toContain('Tiny:v0');
  });
});
