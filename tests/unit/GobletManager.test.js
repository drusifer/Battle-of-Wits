import { describe, it, expect } from "vitest";
import { GobletManager } from "../../src/engine/GobletManager.js";
import { buildGameData } from "../../src/utils/DataLoader.js";
import { Deck } from "../../src/utils/Deck.js";
import { readFileSync } from "fs";
import { resolve } from "path";

const rawRiddles = JSON.parse(
  readFileSync(resolve("data/riddles.json"), "utf8"),
);
const rawAttributes = JSON.parse(
  readFileSync(resolve("data/attributes.json"), "utf8"),
);
const rawConversations = JSON.parse(
  readFileSync(resolve("data/conversations.json"), "utf8"),
);

function makeManager() {
  const gd = buildGameData(rawRiddles, rawAttributes, rawConversations);
  return new GobletManager(gd.createAttributeDeck());
}

describe("GobletManager", () => {
  describe("generateGobletPair()", () => {
    it("returns a RoundContext object with required keys", () => {
      const ctx = makeManager().generateGobletPair();
      expect(ctx).toHaveProperty("leftGoblet");
      expect(ctx).toHaveProperty("rightGoblet");
      expect(ctx).toHaveProperty("safe");
      expect(ctx).toHaveProperty("vizziniComplimentDeck");
      expect(ctx).toHaveProperty("vizziniInsultDeck");
      expect(ctx).toHaveProperty("buttercupGobletDeck");
    });

    it('safe is "left" or "right"', () => {
      const { safe } = makeManager().generateGobletPair();
      expect(["left", "right"]).toContain(safe);
    });

    it("safe assignment varies (both sides appear over many calls)", () => {
      const manager = makeManager();
      const sides = new Set(
        Array.from({ length: 40 }, () => manager.generateGobletPair().safe),
      );
      expect(sides).toContain("left");
      expect(sides).toContain("right");
    });

    it("each goblet has 5 attributes", () => {
      const { leftGoblet, rightGoblet } = makeManager().generateGobletPair();
      expect(leftGoblet.attributes).toHaveLength(5);
      expect(rightGoblet.attributes).toHaveLength(5);
    });

    it("no attribute variant is shared between left and right goblets", () => {
      const { leftGoblet, rightGoblet } = makeManager().generateGobletPair();
      const leftIds = new Set(leftGoblet.attributes.map((v) => v.id));
      const rightIds = new Set(rightGoblet.attributes.map((v) => v.id));
      for (const id of leftIds) {
        expect(rightIds.has(id)).toBe(false);
      }
    });

    it("no variant shared across both rounds in a 2-round game", () => {
      const manager = makeManager();
      const ctx1 = manager.generateGobletPair();
      const ctx2 = manager.generateGobletPair();

      const round1Ids = new Set([
        ...ctx1.leftGoblet.attributes.map((v) => v.id),
        ...ctx1.rightGoblet.attributes.map((v) => v.id),
      ]);
      const round2Ids = [
        ...ctx2.leftGoblet.attributes.map((v) => v.id),
        ...ctx2.rightGoblet.attributes.map((v) => v.id),
      ];
      for (const id of round2Ids) {
        expect(round1Ids.has(id)).toBe(false);
      }
    });

    it("all attribute objects have required fields", () => {
      const { leftGoblet } = makeManager().generateGobletPair();
      for (const attr of leftGoblet.attributes) {
        expect(attr).toHaveProperty("id");
        expect(attr).toHaveProperty("fragment");
        expect(Array.isArray(attr.insults)).toBe(true);
        expect(Array.isArray(attr.compliments)).toBe(true);
        expect(Array.isArray(attr.hints)).toBe(true);
      }
    });

    it("vizziniComplimentDeck draws from safe goblet lines", () => {
      const ctx = makeManager().generateGobletPair();
      const safeAttrs = ctx[ctx.safe + "Goblet"].attributes;
      const allSafeCompliments = new Set(
        safeAttrs.flatMap((v) => v.compliments),
      );

      const line = ctx.vizziniComplimentDeck.draw();
      expect(typeof line).toBe("string");
      expect(allSafeCompliments.has(line)).toBe(true);
    });

    it("vizziniInsultDeck draws from poisoned goblet lines", () => {
      const ctx = makeManager().generateGobletPair();
      const poisonSide = ctx.safe === "left" ? "right" : "left";
      const poisonAttrs = ctx[poisonSide + "Goblet"].attributes;
      const allPoisonInsults = new Set(poisonAttrs.flatMap((v) => v.insults));

      const line = ctx.vizziniInsultDeck.draw();
      expect(typeof line).toBe("string");
      expect(allPoisonInsults.has(line)).toBe(true);
    });

    it("buttercupGobletDeck draws from safe goblet hint lines", () => {
      const ctx = makeManager().generateGobletPair();
      const safeAttrs = ctx[ctx.safe + "Goblet"].attributes;
      const allHints = new Set(safeAttrs.flatMap((v) => v.hints));

      const line = ctx.buttercupGobletDeck.draw();
      expect(typeof line).toBe("string");
      expect(allHints.has(line)).toBe(true);
    });

    it("clue decks are Deck instances", () => {
      const ctx = makeManager().generateGobletPair();
      expect(ctx.vizziniComplimentDeck).toBeInstanceOf(Deck);
      expect(ctx.vizziniInsultDeck).toBeInstanceOf(Deck);
      expect(ctx.buttercupGobletDeck).toBeInstanceOf(Deck);
    });
  });
});
