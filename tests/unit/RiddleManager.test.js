import { describe, it, expect } from "vitest";
import { RiddleManager } from "../../src/engine/RiddleManager.js";
import { Deck } from "../../src/utils/Deck.js";
import { readFileSync } from "fs";
import { resolve } from "path";

const rawRiddles = JSON.parse(
  readFileSync(resolve("data/riddles.json"), "utf8"),
);

describe("RiddleManager", () => {
  it("drawRiddle() returns a riddle object", () => {
    const rm = new RiddleManager(
      new Deck(rawRiddles, { autoReshuffle: false }),
    );
    const riddle = rm.drawRiddle();
    expect(riddle).toHaveProperty("question");
    expect(riddle).toHaveProperty("answer");
    expect(riddle).toHaveProperty("hint");
  });

  it("drawRiddle() returns null when deck exhausted", () => {
    const small = [rawRiddles[0]];
    const rm = new RiddleManager(new Deck(small, { autoReshuffle: false }));
    rm.drawRiddle();
    expect(rm.drawRiddle()).toBeNull();
  });

  it("does not repeat riddles within a draw sequence", () => {
    const rm = new RiddleManager(
      new Deck(rawRiddles, { autoReshuffle: false }),
    );
    const drawn = new Set();
    for (let i = 0; i < 6; i++) {
      const r = rm.drawRiddle();
      if (r) {
        expect(drawn.has(r.answer)).toBe(false);
        drawn.add(r.answer);
      }
    }
  });

  describe("checkAnswer()", () => {
    it("returns true for exact correct answer", () => {
      const rm = new RiddleManager(new Deck(rawRiddles));
      const riddle = { answer: "mountain", alternates: [] };
      expect(rm.checkAnswer(riddle, "mountain")).toBe(true);
    });

    it("returns true regardless of case", () => {
      const rm = new RiddleManager(new Deck(rawRiddles));
      const riddle = { answer: "mountain", alternates: [] };
      expect(rm.checkAnswer(riddle, "MOUNTAIN")).toBe(true);
      expect(rm.checkAnswer(riddle, "Mountain")).toBe(true);
    });

    it("returns true when answer matches an alternate", () => {
      const rm = new RiddleManager(new Deck(rawRiddles));
      const riddle = { answer: "mountain", alternates: ["mountains"] };
      expect(rm.checkAnswer(riddle, "mountains")).toBe(true);
    });

    it("strips leading articles before comparing", () => {
      const rm = new RiddleManager(new Deck(rawRiddles));
      const riddle = { answer: "river", alternates: [] };
      expect(rm.checkAnswer(riddle, "the river")).toBe(true);
      expect(rm.checkAnswer(riddle, "a river")).toBe(true);
    });

    it("returns false for wrong answer", () => {
      const rm = new RiddleManager(new Deck(rawRiddles));
      const riddle = { answer: "mountain", alternates: [] };
      expect(rm.checkAnswer(riddle, "volcano")).toBe(false);
    });

    it("returns false for empty input", () => {
      const rm = new RiddleManager(new Deck(rawRiddles));
      const riddle = { answer: "mountain", alternates: [] };
      expect(rm.checkAnswer(riddle, "")).toBe(false);
    });
  });
});
