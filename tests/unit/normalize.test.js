import { describe, it, expect } from 'vitest';
import { normalize } from '../../src/utils/normalize.js';

describe('normalize', () => {
  it('lowercases input', () => {
    expect(normalize('MOUNTAIN')).toBe('mountain');
  });

  it('trims whitespace', () => {
    expect(normalize('  fire  ')).toBe('fire');
  });

  it('strips leading article "the"', () => {
    expect(normalize('the mountain')).toBe('mountain');
  });

  it('strips leading article "a"', () => {
    expect(normalize('a dragon')).toBe('dragon');
  });

  it('strips leading article "an"', () => {
    expect(normalize('an eagle')).toBe('eagle');
  });

  it('strips articles case-insensitively', () => {
    expect(normalize('The Mountain')).toBe('mountain');
    expect(normalize('A Dragon')).toBe('dragon');
    expect(normalize('AN Eagle')).toBe('eagle');
  });

  it('does not strip "a" or "the" mid-word', () => {
    expect(normalize('thunder')).toBe('thunder');
    expect(normalize('ather')).toBe('ather');
  });

  it('handles hyphenated answers', () => {
    expect(normalize('fire-fly')).toBe('fire-fly');
  });

  it('handles empty string', () => {
    expect(normalize('')).toBe('');
  });

  it('handles already-normalized input', () => {
    expect(normalize('mountain')).toBe('mountain');
  });

  it('strips trailing punctuation', () => {
    expect(normalize('fire!')).toBe('fire');
    expect(normalize('mountain.')).toBe('mountain');
  });
});
