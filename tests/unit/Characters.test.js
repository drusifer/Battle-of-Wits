/**
 * Character test suite (T22).
 * Covers: Character base, Vizzini, Buttercup, Gramps, Boy.
 */
import { describe, it, expect } from 'vitest';
import { Deck } from '../../src/utils/Deck.js';
import { Character } from '../../src/characters/Character.js';
import { Vizzini } from '../../src/characters/Vizzini.js';
import { Buttercup } from '../../src/characters/Buttercup.js';
import { Gramps } from '../../src/characters/Gramps.js';
import { Boy } from '../../src/characters/Boy.js';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeDeck(lines) {
  return new Deck(lines, { autoReshuffle: true });
}

function makeReactionDecks(outcomes) {
  return Object.fromEntries(
    outcomes.map(o => [o, makeDeck([`${o} line 1`, `${o} line 2`, `${o} line 3`])])
  );
}

// ── Character (base) ───────────────────────────────────────────────────────────

describe('Character (base)', () => {
  it('stores name, avatar, and reactionDecks', () => {
    const decks = makeReactionDecks(['goblet:correct']);
    const c = new Character('TestChar', '🎭', decks);
    expect(c.name).toBe('TestChar');
    expect(c.avatar).toBe('🎭');
    expect(c.reactionDecks).toBe(decks);
  });

  it('react() draws a string for a registered outcome', () => {
    const c = new Character('X', '❓', makeReactionDecks(['goblet:correct']));
    const line = c.react('goblet:correct');
    expect(typeof line).toBe('string');
    expect(line.length).toBeGreaterThan(0);
  });

  it('react() returns null for an unregistered outcome', () => {
    const c = new Character('X', '❓', {});
    expect(c.react('unknown:outcome')).toBeNull();
  });

  it('react() cycles through lines (autoReshuffle — never permanently exhausts)', () => {
    const c = new Character('X', '❓', makeReactionDecks(['goblet:correct']));
    const results = Array.from({ length: 12 }, () => c.react('goblet:correct'));
    expect(results.every(r => typeof r === 'string')).toBe(true);
  });

  it('defaults reactionDecks to empty object', () => {
    const c = new Character('X', '❓');
    expect(c.react('goblet:correct')).toBeNull();
  });
});

// ── Vizzini ────────────────────────────────────────────────────────────────────

describe('Vizzini', () => {
  function makeVizzini() {
    return new Vizzini(
      makeReactionDecks([
        'riddle:correct',
        'riddle:wrong',
        'hint:requested',
        'goblet:correct',
        'goblet:poisoned',
      ])
    );
  }

  it('has correct name and avatar', () => {
    const v = makeVizzini();
    expect(v.name).toBe('Vizzini');
    expect(v.avatar).toBe('😤');
  });

  it('react() works for all 5 Vizzini outcomes', () => {
    const v = makeVizzini();
    for (const outcome of [
      'riddle:correct',
      'riddle:wrong',
      'hint:requested',
      'goblet:correct',
      'goblet:poisoned',
    ]) {
      expect(typeof v.react(outcome)).toBe('string');
    }
  });

  it('drawClue() returns null before setRoundDecks()', () => {
    const v = makeVizzini();
    expect(v.drawClue(true)).toBeNull();
    expect(v.drawClue(false)).toBeNull();
  });

  it('drawClue(true) draws from complimentDeck after setRoundDecks()', () => {
    const v = makeVizzini();
    const compliments = makeDeck(['great answer!', 'well done!', 'impressive!']);
    const insults = makeDeck(['terrible!', 'pathetic!', 'disgraceful!']);
    v.setRoundDecks(compliments, insults);

    const line = v.drawClue(true);
    expect(['great answer!', 'well done!', 'impressive!']).toContain(line);
  });

  it('drawClue(false) draws from insultDeck after setRoundDecks()', () => {
    const v = makeVizzini();
    const compliments = makeDeck(['great answer!', 'well done!', 'impressive!']);
    const insults = makeDeck(['terrible!', 'pathetic!', 'disgraceful!']);
    v.setRoundDecks(compliments, insults);

    const line = v.drawClue(false);
    expect(['terrible!', 'pathetic!', 'disgraceful!']).toContain(line);
  });

  it('setRoundDecks() can be called again for round 2', () => {
    const v = makeVizzini();
    v.setRoundDecks(makeDeck(['r1 compliment']), makeDeck(['r1 insult']));
    v.setRoundDecks(makeDeck(['r2 compliment']), makeDeck(['r2 insult']));
    expect(v.drawClue(true)).toBe('r2 compliment');
    expect(v.drawClue(false)).toBe('r2 insult');
  });
});

// ── Buttercup ──────────────────────────────────────────────────────────────────

describe('Buttercup', () => {
  function makeButtercup() {
    return new Buttercup(
      makeReactionDecks(['hint:requested', 'goblet:correct', 'goblet:poisoned'])
    );
  }

  it('has correct name and avatar', () => {
    const b = makeButtercup();
    expect(b.name).toBe('Buttercup');
    expect(b.avatar).toBe('👸');
  });

  it('react() works for all 3 Buttercup outcomes', () => {
    const b = makeButtercup();
    for (const o of ['hint:requested', 'goblet:correct', 'goblet:poisoned']) {
      expect(typeof b.react(o)).toBe('string');
    }
  });

  it('drawGobletHint() returns null before setRoundDeck()', () => {
    const b = makeButtercup();
    expect(b.drawGobletHint()).toBeNull();
  });

  it('drawGobletHint() draws from the injected deck after setRoundDeck()', () => {
    const b = makeButtercup();
    const hints = makeDeck(['goblet hint A', 'goblet hint B', 'goblet hint C']);
    b.setRoundDeck(hints);

    const line = b.drawGobletHint();
    expect(['goblet hint A', 'goblet hint B', 'goblet hint C']).toContain(line);
  });

  it('setRoundDeck() can be replaced for round 2', () => {
    const b = makeButtercup();
    b.setRoundDeck(makeDeck(['r1 goblet hint']));
    b.setRoundDeck(makeDeck(['r2 goblet hint']));
    expect(b.drawGobletHint()).toBe('r2 goblet hint');
  });
});

// ── Gramps ─────────────────────────────────────────────────────────────────────

describe('Gramps', () => {
  function makeConnectives() {
    return new Deck(['with', 'its', 'topped by', 'bearing', 'and'], { autoReshuffle: true });
  }

  function makeGramps() {
    return new Gramps(makeReactionDecks(['goblet:correct', 'goblet:poisoned']), makeConnectives());
  }

  function makeAttrs(count) {
    return Array.from({ length: count }, (_, i) => ({
      id: `Cat:v${i}`,
      fragment: `fragment ${i}`,
      insults: [],
      compliments: [],
      hints: [],
    }));
  }

  it('has correct name and avatar', () => {
    expect(makeGramps().name).toBe('Gramps');
    expect(makeGramps().avatar).toBe('🧓');
  });

  it('react() works for both Gramps outcomes', () => {
    const g = makeGramps();
    expect(typeof g.react('goblet:correct')).toBe('string');
    expect(typeof g.react('goblet:poisoned')).toBe('string');
  });

  it('describeGoblet() returns a non-empty string', () => {
    const desc = makeGramps().describeGoblet(makeAttrs(5));
    expect(typeof desc).toBe('string');
    expect(desc.length).toBeGreaterThan(0);
  });

  it('describeGoblet() includes all attribute fragments', () => {
    const attrs = makeAttrs(5);
    const desc = makeGramps().describeGoblet(attrs);
    // Compare case-insensitively since the first fragment is capitalised
    const descLower = desc.toLowerCase();
    for (const attr of attrs) {
      expect(descLower).toContain(attr.fragment.toLowerCase());
    }
  });

  it('describeGoblet() does NOT include "The cup before you is"', () => {
    const desc = makeGramps().describeGoblet(makeAttrs(3));
    expect(desc).not.toMatch(/The cup before you is/);
  });

  it('describeGoblet() ends with a period', () => {
    expect(makeGramps().describeGoblet(makeAttrs(3))).toMatch(/\.$/);
  });

  it('describeGoblet() uses connectives between fragments', () => {
    const attrs = makeAttrs(3);
    const desc = makeGramps().describeGoblet(attrs);
    // Should contain at least one connective word from the deck
    const hasConnective = ['with', 'its', 'topped by', 'bearing', 'and'].some(c =>
      desc.includes(c)
    );
    expect(hasConnective).toBe(true);
  });

  it('describeGoblet() returns empty string for empty attributes', () => {
    expect(makeGramps().describeGoblet([])).toBe('');
  });

  it('describeGoblet() never includes "The cup before you is" across 20+ calls', () => {
    const g = makeGramps();
    for (let i = 0; i < 25; i++) {
      const desc = g.describeGoblet(makeAttrs(5));
      expect(desc).not.toMatch(/The cup before you is/);
    }
  });

  it('describeGoblet() returns a non-empty sentence ending in "."', () => {
    const desc = makeGramps().describeGoblet(makeAttrs(5));
    expect(desc.length).toBeGreaterThan(0);
    expect(desc).toMatch(/\.$/);
  });

  it('describeGoblet() handles single attribute without connective', () => {
    const desc = makeGramps().describeGoblet(makeAttrs(1));
    // First letter is capitalised; test case-insensitively
    expect(desc.toLowerCase()).toContain('fragment 0');
  });
});

// ── Boy ────────────────────────────────────────────────────────────────────────

describe('Boy', () => {
  function makeBoy() {
    return new Boy(makeReactionDecks(['goblet:correct', 'goblet:poisoned']));
  }

  it('has correct name and avatar', () => {
    const b = makeBoy();
    expect(b.name).toBe('Boy');
    expect(b.avatar).toBe('🤧');
  });

  it('react() works for both Boy outcomes', () => {
    const b = makeBoy();
    expect(typeof b.react('goblet:correct')).toBe('string');
    expect(typeof b.react('goblet:poisoned')).toBe('string');
  });

  it('react() returns null for outcomes Boy does not have', () => {
    const b = makeBoy();
    expect(b.react('riddle:correct')).toBeNull();
    expect(b.react('hint:requested')).toBeNull();
  });
});
