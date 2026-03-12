/**
 * Data integrity tests.
 *
 * These tests run against the actual data files. They are the repeatable quality
 * gate for content authoring — catch structural and uniqueness defects before UAT.
 *
 * Run after any edit to data/riddles.json or data/attributes.json.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const rawRiddles = JSON.parse(readFileSync(resolve('data/riddles.json'), 'utf8'));
const rawAttributes = JSON.parse(readFileSync(resolve('data/attributes.json'), 'utf8'));
const rawConversations = JSON.parse(readFileSync(resolve('data/conversations.json'), 'utf8'));

// ── riddles.json ───────────────────────────────────────────────────────────────

describe('data/riddles.json', () => {
  it('has at least 100 entries', () => {
    expect(rawRiddles.length).toBeGreaterThanOrEqual(100);
  });

  it('every entry has question, answer, alternates[], hint', () => {
    for (const r of rawRiddles) {
      expect(r).toHaveProperty('question');
      expect(r).toHaveProperty('answer');
      expect(r).toHaveProperty('hint');
      expect(Array.isArray(r.alternates)).toBe(true);
    }
  });

  it('no empty questions', () => {
    for (const r of rawRiddles) {
      expect(r.question.trim().length).toBeGreaterThan(0);
    }
  });

  it('no empty answers', () => {
    for (const r of rawRiddles) {
      expect(r.answer.trim().length).toBeGreaterThan(0);
    }
  });

  it('no empty hints', () => {
    for (const r of rawRiddles) {
      expect(r.hint.trim().length).toBeGreaterThan(0);
    }
  });

  it('no duplicate answers (case-insensitive)', () => {
    const seen = new Map();
    const dupes = [];
    for (const r of rawRiddles) {
      const key = r.answer.toLowerCase().trim();
      if (seen.has(key)) {
        dupes.push(`"${r.answer}" (also at index ${seen.get(key)})`);
      } else {
        seen.set(key, rawRiddles.indexOf(r));
      }
    }
    expect(dupes).toEqual([]);
  });

  it('no alternate equals its own riddle answer', () => {
    for (const r of rawRiddles) {
      for (const alt of r.alternates) {
        expect(alt.toLowerCase().trim()).not.toBe(r.answer.toLowerCase().trim());
      }
    }
  });
});

// ── attributes.json ────────────────────────────────────────────────────────────

describe('data/attributes.json', () => {
  const categories = Object.entries(rawAttributes);

  it('has at least 5 categories', () => {
    expect(categories.length).toBeGreaterThanOrEqual(5);
  });

  it('every category has at least 5 variants (DataLoader minimum)', () => {
    for (const [cat, variants] of categories) {
      expect(variants.length, `Category "${cat}" needs 5+ variants`).toBeGreaterThanOrEqual(5);
    }
  });

  it('every variant has id, fragment, insults[], compliments[], hints[]', () => {
    for (const [, variants] of categories) {
      for (const v of variants) {
        expect(v).toHaveProperty('id');
        expect(v).toHaveProperty('fragment');
        expect(Array.isArray(v.insults)).toBe(true);
        expect(Array.isArray(v.compliments)).toBe(true);
        expect(Array.isArray(v.hints)).toBe(true);
      }
    }
  });

  it('every variant has at least 5 insults, 5 compliments, 5 hints', () => {
    for (const [cat, variants] of categories) {
      for (const v of variants) {
        expect(v.insults.length, `${cat}:${v.id} insults < 5`).toBeGreaterThanOrEqual(5);
        expect(v.compliments.length, `${cat}:${v.id} compliments < 5`).toBeGreaterThanOrEqual(5);
        expect(v.hints.length, `${cat}:${v.id} hints < 5`).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('no empty fragment strings', () => {
    for (const [, variants] of categories) {
      for (const v of variants) {
        expect(v.fragment.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('all variant ids are unique across the entire attributes file', () => {
    const seen = new Set();
    const dupes = [];
    for (const [, variants] of categories) {
      for (const v of variants) {
        if (seen.has(v.id)) dupes.push(v.id);
        seen.add(v.id);
      }
    }
    expect(dupes).toEqual([]);
  });

  it('variant ids follow Category:name pattern', () => {
    for (const [cat, variants] of categories) {
      for (const v of variants) {
        expect(v.id).toMatch(new RegExp(`^${cat}:`));
      }
    }
  });

  it('no empty insult, compliment, or hint strings', () => {
    for (const [, variants] of categories) {
      for (const v of variants) {
        for (const line of [...v.insults, ...v.compliments, ...v.hints]) {
          expect(line.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('no compliment or insult line directly names a vessel (goblet/cup/chalice/flagon/vessel)', () => {
    // Vizzini draws from these lines as clues — they must never reference the goblet directly.
    const vesselWords = /\b(goblet|chalice|cup|flagon|vessel)\b/i;
    const violations = [];
    for (const [cat, variants] of categories) {
      for (const v of variants) {
        for (const line of [...v.compliments, ...v.insults]) {
          if (vesselWords.test(line)) {
            violations.push(`${cat}:${v.id} — "${line}"`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});

// ── conversations.json ─────────────────────────────────────────────────────────

describe('data/conversations.json', () => {
  it('has banter key with all required scene decks', () => {
    expect(rawConversations.banter).toBeDefined();
    for (const key of ['intro', 'riddlePhase', 'gobletPhase', 'outro_win', 'outro_lose']) {
      expect(Array.isArray(rawConversations.banter[key]), `banter.${key} missing`).toBe(true);
    }
  });

  it('outro_win has at least 3 scene variants', () => {
    const nonNull = rawConversations.banter.outro_win.filter(Boolean);
    expect(nonNull.length).toBeGreaterThanOrEqual(3);
  });

  it('outro_lose has at least 3 scene variants', () => {
    const nonNull = rawConversations.banter.outro_lose.filter(Boolean);
    expect(nonNull.length).toBeGreaterThanOrEqual(3);
  });

  it('has reactions for Vizzini, Buttercup, Gramps, Boy', () => {
    for (const char of ['Vizzini', 'Buttercup', 'Gramps', 'Boy']) {
      expect(rawConversations.reactions[char], `reactions.${char} missing`).toBeDefined();
    }
  });

  it('Vizzini has all 5 required outcome arrays', () => {
    const v = rawConversations.reactions.Vizzini;
    for (const outcome of [
      'riddle:correct',
      'riddle:wrong',
      'hint:requested',
      'goblet:correct',
      'goblet:poisoned',
    ]) {
      expect(Array.isArray(v[outcome]), `Vizzini.${outcome} missing`).toBe(true);
      expect(v[outcome].length).toBeGreaterThanOrEqual(3);
    }
  });

  it('grampsConnectives has at least 5 entries', () => {
    expect(rawConversations.grampsConnectives.length).toBeGreaterThanOrEqual(5);
  });

  it('banter.intro has at least 3 scene entries', () => {
    const nonNull = rawConversations.banter.intro.filter(Boolean);
    expect(nonNull.length).toBeGreaterThanOrEqual(3);
  });

  it('each banter.intro scene has at least 2 lines', () => {
    const scenes = rawConversations.banter.intro.filter(Boolean);
    for (const scene of scenes) {
      expect(Array.isArray(scene), 'each scene must be an array').toBe(true);
      expect(scene.length, 'each intro scene must have at least 2 lines').toBeGreaterThanOrEqual(2);
    }
  });
});
