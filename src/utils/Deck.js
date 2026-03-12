/**
 * Deck — universal draw-without-replacement primitive.
 *
 * All randomness in the game flows through this class.
 * Math.random() is never used; all shuffles use crypto.getRandomValues().
 *
 * Supports:
 *  - Decks of Decks (items can be any value, including other Decks)
 *  - Blank cards (null items) for probabilistic ConversationDecks
 *  - autoReshuffle for infinite cycling dialogue decks
 *  - One-shot mode (autoReshuffle:false) for riddles and attribute variants
 */
export class Deck {
  #ptr;
  #deck;
  #autoReshuffle;

  constructor(items, { autoReshuffle = true } = {}) {
    this.#deck = [...items]; // copy — never mutate caller's array
    this.#autoReshuffle = autoReshuffle;
    this.#ptr = 0;
    this.#shuffle();
  }

  /** Draw the next item. Returns null if exhausted and autoReshuffle is false. */
  draw() {
    if (this.#ptr >= this.#deck.length) {
      if (!this.#autoReshuffle) return null;
      this.#shuffle();
      this.#ptr = 0;
    }
    return this.#deck[this.#ptr++];
  }

  /**
   * Draw n items as an array. Stops early (returns fewer) if exhausted without autoReshuffle.
   *
   * Exhaustion is checked BEFORE each draw so that genuine null items (blank cards from
   * withFrequency) are included in results. Checking after the draw causes a false-positive
   * stop when a blank card is the last item and isEmpty becomes true post-draw (L07 fix).
   */
  drawN(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      if (!this.#autoReshuffle && this.isEmpty) break;
      results.push(this.draw());
    }
    return results;
  }

  /** True when all items have been drawn and autoReshuffle is false. */
  get isEmpty() {
    return !this.#autoReshuffle && this.#ptr >= this.#deck.length;
  }

  /** Manually reshuffle and reset the draw pointer. */
  reset() {
    this.#shuffle();
    this.#ptr = 0;
  }

  /**
   * Fisher-Yates shuffle using crypto.getRandomValues().
   * Called at construction and on every reshuffle.
   */
  #shuffle() {
    const arr = this.#deck;
    const buf = new Uint32Array(arr.length);
    crypto.getRandomValues(buf);
    for (let i = arr.length - 1; i > 0; i--) {
      // eslint-disable-next-line security/detect-object-injection
      const j = buf[i] % (i + 1);
      // eslint-disable-next-line security/detect-object-injection
      const tmp = arr[i];
      // eslint-disable-next-line security/detect-object-injection
      arr[i] = arr[j];
      // eslint-disable-next-line security/detect-object-injection
      arr[j] = tmp;
    }
  }

  /**
   * The only source of random booleans in the codebase.
   * Uses crypto.getRandomValues() — never Math.random().
   */
  static coinFlip() {
    const MIDPOINT = 128; // 0–255 uniform → heads if below midpoint
    const buf = new Uint8Array(1);
    crypto.getRandomValues(buf);
    return buf[0] < MIDPOINT;
  }

  /**
   * Creates a Deck that fires real items at the given ratio, padded with nulls (blank cards).
   *
   * Deck.withFrequency([a, b, c], 1/3)
   *   → internal deck: [a, null, null, b, null, null, c, null, null]
   *   → ~1 in 3 draws returns a real item
   *
   * @param {any[]} items - The real items
   * @param {number} ratio - Desired fraction of non-null draws (0 < ratio ≤ 1)
   */
  static withFrequency(items, ratio) {
    const blanksPerItem = Math.round((1 - ratio) / ratio);
    const arr = [];
    for (const item of items) {
      arr.push(item);
      for (let i = 0; i < blanksPerItem; i++) arr.push(null);
    }
    return new Deck(arr);
  }
}
