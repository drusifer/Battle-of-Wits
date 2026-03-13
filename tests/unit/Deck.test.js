import { describe, it, expect, vi } from "vitest";
import { Deck } from "../../src/utils/Deck.js";

describe("Deck", () => {
  // ── Construction ────────────────────────────────────────────────────────────

  it("accepts an array of items", () => {
    const d = new Deck([1, 2, 3]);
    expect(d).toBeDefined();
  });

  it("does not expose internal items array directly", () => {
    const d = new Deck([1, 2, 3]);
    expect(d._items).toBeUndefined();
    expect(d.items).toBeUndefined();
  });

  // ── draw() ──────────────────────────────────────────────────────────────────

  it("draw() returns each item exactly once before reshuffle", () => {
    const items = [1, 2, 3, 4, 5];
    const d = new Deck(items, { autoReshuffle: false });
    const drawn = new Set();
    for (let i = 0; i < 5; i++) drawn.add(d.draw());
    expect(drawn).toEqual(new Set(items));
  });

  it("draw() auto-reshuffles and continues when autoReshuffle:true", () => {
    const d = new Deck([1, 2, 3], { autoReshuffle: true });
    // Draw 9 items — should not return null (3 full passes)
    const results = Array.from({ length: 9 }, () => d.draw());
    expect(results.every((r) => r !== null)).toBe(true);
  });

  it("draw() returns null when exhausted and autoReshuffle:false", () => {
    const d = new Deck([1, 2], { autoReshuffle: false });
    d.draw();
    d.draw();
    expect(d.draw()).toBeNull();
  });

  it("draw() does not mutate the original input array", () => {
    const original = [1, 2, 3];
    const d = new Deck(original);
    d.draw();
    d.draw();
    expect(original).toEqual([1, 2, 3]);
  });

  it("draw() handles a single-item deck", () => {
    const d = new Deck(["only"], { autoReshuffle: false });
    expect(d.draw()).toBe("only");
    expect(d.draw()).toBeNull();
  });

  it("draw() handles null items (blank cards) as valid draws", () => {
    const d = new Deck([null, "real"], { autoReshuffle: false });
    const results = [d.draw(), d.draw()];
    expect(results).toContain(null);
    expect(results).toContain("real");
  });

  // ── drawN() ─────────────────────────────────────────────────────────────────

  it("drawN(n) returns an array of n items", () => {
    const d = new Deck([1, 2, 3, 4, 5]);
    expect(d.drawN(3)).toHaveLength(3);
  });

  it("drawN(n) returns all unique items (WDWR within batch)", () => {
    const d = new Deck([1, 2, 3, 4, 5], { autoReshuffle: false });
    const drawn = d.drawN(5);
    expect(new Set(drawn).size).toBe(5);
  });

  it("drawN(0) returns empty array", () => {
    const d = new Deck([1, 2, 3]);
    expect(d.drawN(0)).toEqual([]);
  });

  // ── isEmpty ──────────────────────────────────────────────────────────────────

  it("isEmpty is false when items remain", () => {
    const d = new Deck([1, 2, 3], { autoReshuffle: false });
    expect(d.isEmpty).toBe(false);
  });

  it("isEmpty is true after exhaustion when autoReshuffle:false", () => {
    const d = new Deck([1, 2], { autoReshuffle: false });
    d.draw();
    d.draw();
    expect(d.isEmpty).toBe(true);
  });

  it("isEmpty is never true when autoReshuffle:true", () => {
    const d = new Deck([1, 2], { autoReshuffle: true });
    d.draw();
    d.draw();
    d.draw();
    expect(d.isEmpty).toBe(false);
  });

  // ── reset() ──────────────────────────────────────────────────────────────────

  it("reset() allows re-drawing all items", () => {
    const d = new Deck([1, 2, 3], { autoReshuffle: false });
    d.draw();
    d.draw();
    d.draw();
    d.reset();
    expect(d.isEmpty).toBe(false);
    const drawn = new Set([d.draw(), d.draw(), d.draw()]);
    expect(drawn).toEqual(new Set([1, 2, 3]));
  });

  it("reset() on a non-exhausted deck still works", () => {
    const d = new Deck([1, 2, 3], { autoReshuffle: false });
    d.draw();
    d.reset();
    expect(d.isEmpty).toBe(false);
  });

  // ── Deck.coinFlip() ──────────────────────────────────────────────────────────

  it("coinFlip() returns a boolean", () => {
    expect(typeof Deck.coinFlip()).toBe("boolean");
  });

  it("coinFlip() produces both true and false over many calls", () => {
    const results = new Set(Array.from({ length: 200 }, () => Deck.coinFlip()));
    expect(results).toContain(true);
    expect(results).toContain(false);
  });

  it("coinFlip() distribution is roughly 50/50 (±15%)", () => {
    const n = 1000;
    const trues = Array.from({ length: n }, () => Deck.coinFlip()).filter(
      Boolean,
    ).length;
    expect(trues).toBeGreaterThan(350);
    expect(trues).toBeLessThan(650);
  });

  // ── Deck.withFrequency() ─────────────────────────────────────────────────────

  it("withFrequency returns a Deck instance", () => {
    expect(Deck.withFrequency(["a", "b"], 0.5)).toBeInstanceOf(Deck);
  });

  it("withFrequency(items, 1/3) produces ~33% non-null draws", () => {
    const items = ["x", "y", "z"];
    const d = Deck.withFrequency(items, 1 / 3);
    // Draw full cycle (all items exhausted = one pass through deck)
    const results = [];
    // withFrequency([x,y,z], 1/3) → 9 entries: 3 real + 6 null
    for (let i = 0; i < 9; i++) results.push(d.draw());
    const nonNull = results.filter((r) => r !== null).length;
    expect(nonNull).toBe(3);
  });

  it("withFrequency(items, 1/2) produces ~50% non-null draws", () => {
    const items = ["a", "b", "c", "d"];
    const d = Deck.withFrequency(items, 1 / 2);
    // 4 items + 4 nulls = 8 total
    const results = [];
    for (let i = 0; i < 8; i++) results.push(d.draw());
    const nonNull = results.filter((r) => r !== null).length;
    expect(nonNull).toBe(4);
  });

  it("withFrequency preserves all original items", () => {
    const items = ["a", "b", "c"];
    const d = Deck.withFrequency(items, 1 / 3);
    const results = [];
    for (let i = 0; i < 9; i++) results.push(d.draw());
    const drawn = results.filter((r) => r !== null);
    expect(new Set(drawn)).toEqual(new Set(items));
  });

  // ── Math.random is BANNED ───────────────────────────────────────────────────

  it("never calls Math.random during construction", () => {
    const spy = vi.spyOn(Math, "random");
    new Deck([1, 2, 3, 4, 5]);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("never calls Math.random during draw()", () => {
    const d = new Deck([1, 2, 3]);
    const spy = vi.spyOn(Math, "random");
    d.draw();
    d.draw();
    d.draw();
    d.draw(); // triggers reshuffle
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("never calls Math.random during reset()", () => {
    const d = new Deck([1, 2, 3]);
    const spy = vi.spyOn(Math, "random");
    d.reset();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("never calls Math.random during coinFlip()", () => {
    const spy = vi.spyOn(Math, "random");
    Deck.coinFlip();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
