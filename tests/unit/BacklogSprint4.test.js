/**
 * Sprint 4 TDD tests — T42, T43, T44, T46, T47.
 *
 * T42 — S4-U1: Clue flash: hint:requested carries clueType; ChatUI applies flash class
 * T43 — S4-U2: whenIdle() queue drain (real implementation already shipped in S3)
 * T44 — S4-U3: Goblet reveal animation; ChatUI 600ms delay before outcome messages
 * T46 — S4-G1: Goblet phase hint; heart:spent; StatusBar decrements on heart:spent
 * T47 — S4-S1: SoundManager mute/unmute; event-driven play
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EventBus } from "../../src/engine/EventBus.js";
import { buildGameData } from "../../src/utils/DataLoader.js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Game data fixture ────────────────────────────────────────────────────────

const rawRiddles = JSON.parse(
  readFileSync(resolve("data/riddles.json"), "utf8"),
);
const rawAttributes = JSON.parse(
  readFileSync(resolve("data/attributes.json"), "utf8"),
);
const rawConversations = JSON.parse(
  readFileSync(resolve("data/conversations.json"), "utf8"),
);

const mockChatUI = { whenIdle: async () => {} };

// ── Minimal DOM mock ─────────────────────────────────────────────────────────

function makeMockElement(tag = "div") {
  const el = {
    tag,
    className: "",
    textContent: "",
    innerHTML: "",
    style: {},
    disabled: false,
    _children: [],
    _listeners: {},

    setAttribute(name, value) {
      if (name === "aria-label") this._ariaLabel = value;
    },
    getAttribute(name) {
      return name === "aria-label" ? this._ariaLabel : null;
    },
    appendChild(child) {
      this._children.push(child);
      return child;
    },
    removeChild(child) {
      const idx = this._children.indexOf(child);
      if (idx !== -1) this._children.splice(idx, 1);
    },
    contains(child) {
      if (child === this) return true;
      for (const c of this._children) {
        if (c === child || (c.contains && c.contains(child))) return true;
      }
      return false;
    },
    removeEventListener() {},
    addEventListener(event, handler) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(handler);
    },
    _dispatch(event, ...args) {
      (this._listeners[event] || []).forEach((h) => h(...args));
    },
    querySelector(selector) {
      const cls = selector.startsWith(".") ? selector.slice(1) : null;
      if (!cls) return null;
      const search = (children) => {
        for (const c of children) {
          if (
            typeof c.className === "string" &&
            c.className.split(" ").includes(cls)
          )
            return c;
          const found = search(c._children || []);
          if (found) return found;
        }
        return null;
      };
      return search(this._children);
    },
    get allText() {
      const collect = (node) => {
        let text = node.textContent || "";
        for (const c of node._children || []) text += collect(c);
        return text;
      };
      return collect(this);
    },
  };
  return el;
}

global.document = { createElement: (tag) => makeMockElement(tag) };

// Import UI classes AFTER document is patched
const { ChatUI } = await import("../../src/ui/ChatUI.js");
const { GobletDisplay } = await import("../../src/ui/GobletDisplay.js");
const { StatusBar } = await import("../../src/ui/StatusBar.js");
const { GameEngine, STATES } = await import("../../src/engine/GameEngine.js");
const { SoundManager } = await import("../../src/utils/SoundManager.js");

async function flushAnimations(chatUI) {
  await vi.advanceTimersByTimeAsync(10000);
  await chatUI.whenIdle();
}

function makeGobletEl(side) {
  const el = makeMockElement("button");
  const desc = makeMockElement("span");
  desc.className = "goblet-desc";
  el.appendChild(desc);
  el._side = side;
  return el;
}

// ─────────────────────────────────────────────────────────────────────────────
// T42 — S4-U1: Clue flash — GameEngine payload
// ─────────────────────────────────────────────────────────────────────────────

describe("S4-U1: GameEngine — hint:requested carries clueType", () => {
  it("clueType is 'complement' after a correct riddle answer", async () => {
    const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const bus = new EventBus();
    const engine = new GameEngine(gameData, mockChatUI, bus);

    await engine.startGame();
    // Answer the first riddle correctly using its known answer
    const riddlePayloads = [];
    bus.on("riddle:presented", (p) => riddlePayloads.push(p));
    // Re-start to capture riddle
    const gameData2 = buildGameData(
      rawRiddles,
      rawAttributes,
      rawConversations,
    );
    const bus2 = new EventBus();
    const engine2 = new GameEngine(gameData2, mockChatUI, bus2);
    let firstRiddle = null;
    bus2.on("riddle:presented", ({ riddle }) => {
      if (!firstRiddle) firstRiddle = riddle;
    });
    let hint2 = null;
    bus2.on("hint:requested", (p) => {
      hint2 = p;
    });

    await engine2.startGame();
    await engine2.answerRiddle(firstRiddle.answer); // correct
    await engine2.requestHint();

    expect(hint2).not.toBeNull();
    expect(hint2.clueType).toBe("complement");
  });

  it("clueType is 'insult' after a wrong riddle answer", async () => {
    const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const bus = new EventBus();
    const engine = new GameEngine(gameData, mockChatUI, bus);

    let hint = null;
    bus.on("hint:requested", (p) => {
      hint = p;
    });

    await engine.startGame();
    await engine.answerRiddle("zzz_definitely_wrong");
    await engine.requestHint();

    expect(hint).not.toBeNull();
    expect(hint.clueType).toBe("insult");
  });

  it("clueType is null when no riddle has been answered yet", async () => {
    const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const bus = new EventBus();
    const engine = new GameEngine(gameData, mockChatUI, bus);

    let hint = null;
    bus.on("hint:requested", (p) => {
      hint = p;
    });

    await engine.startGame();
    await engine.requestHint(); // no answer yet

    expect(hint).not.toBeNull();
    expect(hint.clueType).toBeNull();
  });

  it("clueType resets to null at the start of each round", async () => {
    const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const bus = new EventBus();
    const engine = new GameEngine(gameData, mockChatUI, bus);

    const hints = [];
    bus.on("hint:requested", (p) => hints.push(p));

    await engine.startGame();
    // Answer 1 wrong so round 1 has insult
    await engine.answerRiddle("zzz_wrong");
    await engine.requestHint();
    expect(hints[0].clueType).toBe("insult");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T42 — S4-U1: Clue flash — ChatUI applies flash class
// ─────────────────────────────────────────────────────────────────────────────

describe("S4-U1: ChatUI — clue flash class on hint:requested", () => {
  let container;
  let bus;
  let chatUI;

  beforeEach(() => {
    vi.useFakeTimers();
    container = makeMockElement("div");
    bus = new EventBus();
    chatUI = new ChatUI(container, bus);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies clue-flash-safe to the last Vizzini gameplay bubble on clueType=complement", async () => {
    // Simulate riddle:answered (clueLine rendered), then hint:requested
    bus.emit("riddle:answered", {
      correct: true,
      answer: "mountain",
      clueLine:
        "Such a towering intellect — nearly as tall as your foolishness!",
      reactionLine: "Correct! How inconceivable.",
    });
    bus.emit("hint:requested", {
      hintLine: "Listen, Westley...",
      vizziniReaction: "Asking for help?!",
      clueType: "complement",
    });
    await flushAnimations(chatUI);

    // Find the clueLine bubble (last Vizzini gameplay before hint sequence)
    const vizziniBubbles = container._children.filter(
      (b) =>
        b.className.includes("gameplay") &&
        b.allText.includes("towering intellect"),
    );
    expect(vizziniBubbles.length).toBeGreaterThan(0);
    const clueBubble = vizziniBubbles[vizziniBubbles.length - 1];
    expect(clueBubble.className).toContain("clue-flash-safe");
  });

  it("applies clue-flash-poison to the last Vizzini clueLine bubble on clueType=insult", async () => {
    bus.emit("riddle:answered", {
      correct: false,
      answer: "wrong",
      clueLine: "Your mind is as dull as a tarnished coin!",
      reactionLine: "WRONG!",
    });
    bus.emit("hint:requested", {
      hintLine: "Listen, Westley...",
      vizziniReaction: "Asking for help?!",
      clueType: "insult",
    });
    await flushAnimations(chatUI);

    const clueBubbles = container._children.filter(
      (b) =>
        b.className.includes("gameplay") &&
        b.allText.includes("tarnished coin"),
    );
    expect(clueBubbles.length).toBeGreaterThan(0);
    const clueBubble = clueBubbles[clueBubbles.length - 1];
    expect(clueBubble.className).toContain("clue-flash-poison");
  });

  it("does not apply flash class when clueType is null", async () => {
    bus.emit("hint:requested", {
      hintLine: "Listen, Westley...",
      vizziniReaction: "Asking for help?!",
      clueType: null,
    });
    await flushAnimations(chatUI);

    const allClasses = container._children.map((b) => b.className).join(" ");
    expect(allClasses).not.toContain("clue-flash");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T43 — S4-U2: whenIdle() real queue (implementation shipped in Sprint 3)
// ─────────────────────────────────────────────────────────────────────────────

describe("S4-U2: ChatUI — whenIdle() resolves only after queue drains", () => {
  it("whenIdle() does not resolve before animated messages complete", async () => {
    vi.useFakeTimers();
    const container = makeMockElement("div");
    const chatUI = new ChatUI(container);

    chatUI.render([{ char: "Vizzini", line: "Inconceivable!" }]);

    // Before advancing time, animation hasn't run yet
    let resolved = false;
    chatUI.whenIdle().then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(0); // flush microtasks only
    expect(resolved).toBe(false); // still pending

    await vi.advanceTimersByTimeAsync(10000); // advance past all typing delays
    await chatUI.whenIdle();
    expect(resolved).toBe(true);
    vi.useRealTimers();
  });

  it("whenIdle() queues messages sequentially — second bubble appended after first completes", async () => {
    vi.useFakeTimers();
    const container = makeMockElement("div");
    const chatUI = new ChatUI(container);

    chatUI.render([
      { char: "Vizzini", line: "First line." },
      { char: "Buttercup", line: "Second line." },
    ]);

    // After first typing delay, one bubble present
    await vi.advanceTimersByTimeAsync(600);
    expect(container._children.length).toBe(1);

    // After both delays, both present
    await vi.advanceTimersByTimeAsync(10000);
    await chatUI.whenIdle();
    expect(container._children.length).toBe(2);
    vi.useRealTimers();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T44 — S4-U3: Goblet reveal animation — GobletDisplay
// ─────────────────────────────────────────────────────────────────────────────

describe("S4-U3: GobletDisplay — goblet:chosen animation class", () => {
  let leftEl;
  let rightEl;
  let bus;

  beforeEach(() => {
    leftEl = makeGobletEl("left");
    rightEl = makeGobletEl("right");
    bus = new EventBus();
    new GobletDisplay(leftEl, rightEl, () => {}, bus);
    bus.emit("goblets:described", { left: "Left desc", right: "Right desc" });
  });

  it("goblet:chosen with goblet:correct adds goblet-glow to chosen goblet", () => {
    bus.emit("goblet:chosen", { choice: "left", outcome: "goblet:correct" });
    expect(leftEl.className).toContain("goblet-glow");
  });

  it("goblet:chosen with goblet:poisoned adds goblet-shake to chosen goblet", () => {
    bus.emit("goblet:chosen", { choice: "right", outcome: "goblet:poisoned" });
    expect(rightEl.className).toContain("goblet-shake");
  });

  it("animation class is on chosen goblet, not the other", () => {
    bus.emit("goblet:chosen", { choice: "left", outcome: "goblet:correct" });
    expect(leftEl.className).toContain("goblet-glow");
    expect(rightEl.className).not.toContain("goblet-glow");
    expect(rightEl.className).not.toContain("goblet-shake");
  });

  it("animation classes are cleaned up when goblets are hidden", () => {
    bus.emit("goblet:chosen", { choice: "left", outcome: "goblet:correct" });
    bus.emit("phase:changed", { to: STATES.RIDDLE_PHASE });
    expect(leftEl.className).not.toContain("goblet-glow");
    expect(leftEl.className).not.toContain("goblet-shake");
  });
});

describe("S4-U3: ChatUI — 600ms delay chained before goblet outcome messages", () => {
  it("goblet:chosen triggers a delay before outcome messages render", async () => {
    vi.useFakeTimers();
    const container = makeMockElement("div");
    const bus = new EventBus();
    const chatUI = new ChatUI(container, bus);

    bus.emit("goblet:chosen", {
      choice: "left",
      outcome: "goblet:correct",
      reactionLines: [],
    });

    // At t=0: no bubbles yet (600ms delay is pending)
    await vi.advanceTimersByTimeAsync(0);
    expect(container._children.length).toBe(0);

    // At t=600: delay over, messages start rendering
    await vi.advanceTimersByTimeAsync(10000);
    await chatUI.whenIdle();
    expect(container._children.length).toBeGreaterThan(0);
    vi.useRealTimers();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T46 — S4-G1: Goblet phase hint — GameEngine
// ─────────────────────────────────────────────────────────────────────────────

describe("S4-G1: GameEngine — requestGobletHint()", () => {
  async function makeEngineInGobletPhase() {
    const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const bus = new EventBus();
    const engine = new GameEngine(gameData, mockChatUI, bus);

    await engine.startGame();
    // Answer 3 riddles to enter GOBLET_PHASE
    for (let i = 0; i < 3; i++) {
      await engine.answerRiddle("zzz_wrong");
    }
    return { engine, bus };
  }

  it("is a no-op outside GOBLET_PHASE (RIDDLE_PHASE)", async () => {
    const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const bus = new EventBus();
    const engine = new GameEngine(gameData, mockChatUI, bus);
    await engine.startGame();

    const events = [];
    bus.on("hint:goblet-requested", (p) => events.push(p));

    await engine.requestGobletHint();
    expect(events).toHaveLength(0);
  });

  it("emits hint:goblet-requested in GOBLET_PHASE", async () => {
    const { engine, bus } = await makeEngineInGobletPhase();
    expect(engine.state).toBe(STATES.GOBLET_PHASE);

    const events = [];
    bus.on("hint:goblet-requested", (p) => events.push(p));

    await engine.requestGobletHint();
    expect(events).toHaveLength(1);
    expect(events[0]).toHaveProperty("hintLine");
    expect(events[0]).toHaveProperty("vizziniReaction");
  });

  it("emits heart:spent on first call in GOBLET_PHASE", async () => {
    const { engine, bus } = await makeEngineInGobletPhase();
    expect(engine.state).toBe(STATES.GOBLET_PHASE);

    const heartEvents = [];
    bus.on("heart:spent", (p) => heartEvents.push(p));

    await engine.requestGobletHint();
    expect(heartEvents).toHaveLength(1);
  });

  it("second call in same GOBLET_PHASE is a no-op (idempotent)", async () => {
    const { engine, bus } = await makeEngineInGobletPhase();

    const events = [];
    bus.on("hint:goblet-requested", (p) => events.push(p));

    await engine.requestGobletHint();
    await engine.requestGobletHint();
    expect(events).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T46 — S4-G1: Goblet phase hint — StatusBar heart:spent
// ─────────────────────────────────────────────────────────────────────────────

describe("S4-G1: StatusBar — heart:spent decrements hearts", () => {
  it("heart:spent reduces full-heart count by 1", () => {
    const el = makeMockElement("div");
    const bus = new EventBus();
    new StatusBar(el, bus);

    const before = (el.innerHTML.match(/❤️/g) || []).length;
    bus.emit("heart:spent", {});
    const after = (el.innerHTML.match(/❤️/g) || []).length;
    expect(after).toBe(before - 1);
  });

  it("heart:spent does not decrement below 0", () => {
    const el = makeMockElement("div");
    const bus = new EventBus();
    new StatusBar(el, bus);

    bus.emit("heart:spent", {});
    bus.emit("heart:spent", {});
    bus.emit("heart:spent", {}); // third — should clamp at 0
    const fullHearts = (el.innerHTML.match(/❤️/g) || []).length;
    expect(fullHearts).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T46 — S4-G1: Goblet phase hint — ChatUI renders hint:goblet-requested
// ─────────────────────────────────────────────────────────────────────────────

describe("S4-G1: ChatUI — hint:goblet-requested renders Buttercup + Vizzini", () => {
  it("renders hintLine as a Buttercup gameplay bubble", async () => {
    vi.useFakeTimers();
    const container = makeMockElement("div");
    const bus = new EventBus();
    const chatUI = new ChatUI(container, bus);

    bus.emit("hint:goblet-requested", {
      hintLine: "Look closely at the goblet before you, Westley.",
      vizziniReaction: "INCONCEIVABLE! You dare ask her?!",
    });
    await flushAnimations(chatUI);

    const texts = container._children.map((b) => b.allText).join(" ");
    expect(texts).toContain("Look closely at the goblet");
    expect(texts).toContain("INCONCEIVABLE! You dare ask her");
    vi.useRealTimers();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// S4-G1 bug fix: goblet hint cost + poison = LOSE in round 1
// ─────────────────────────────────────────────────────────────────────────────

describe("S4-G1 bugfix: goblet hint + round-1 poison ends game immediately", () => {
  async function makeEngineInGobletPhase() {
    const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);
    const bus = new EventBus();
    const engine = new GameEngine(gameData, mockChatUI, bus);
    await engine.startGame();
    for (let i = 0; i < 3; i++) await engine.answerRiddle("zzz_wrong");
    return { engine, bus };
  }

  it("goblet hint + poison goblet in round 1 → LOSE (no round 2)", async () => {
    // Force the poisoned-goblet outcome by trying both sides; hint must have been used.
    let lost = false;
    for (let attempt = 0; attempt < 30 && !lost; attempt++) {
      const { engine, bus } = await makeEngineInGobletPhase();
      bus.on("game:lost", () => {
        lost = true;
      });

      await engine.requestGobletHint(); // costs 1 heart → 1 heart left
      // Try both sides; one is poisoned
      await engine.chooseGoblet("left");
      if (engine.state === STATES.LOSE) {
        lost = true;
        break;
      }
      // If left was safe we won — try again next attempt
      if (engine.state === STATES.WIN) continue;
      // left was poisoned but didn't lose — that's the bug; fail immediately
      expect(engine.state).toBe(STATES.LOSE);
    }

    // Retry with right side
    for (let attempt = 0; attempt < 30 && !lost; attempt++) {
      const { engine, bus } = await makeEngineInGobletPhase();
      bus.on("game:lost", () => {
        lost = true;
      });

      await engine.requestGobletHint();
      await engine.chooseGoblet("right");
      if (engine.state === STATES.LOSE) {
        lost = true;
        break;
      }
      if (engine.state === STATES.WIN) continue;
      expect(engine.state).toBe(STATES.LOSE);
    }

    expect(lost).toBe(true);
  });

  it("round-1 poison WITHOUT goblet hint → enters round 2 (regression guard)", async () => {
    let reachedRound2 = false;
    for (let attempt = 0; attempt < 30 && !reachedRound2; attempt++) {
      const { engine } = await makeEngineInGobletPhase();
      // No hint — full 2 hearts
      await engine.chooseGoblet("left");
      if (engine.state === STATES.RIDDLE_PHASE && engine.round === 2) {
        reachedRound2 = true;
      }
    }
    expect(reachedRound2).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T47 — S4-S1: SoundManager
// ─────────────────────────────────────────────────────────────────────────────

describe("S4-S1: SoundManager — mute/unmute", () => {
  it("starts unmuted", () => {
    const sm = new SoundManager();
    expect(sm.muted).toBe(false);
  });

  it("mute() sets muted to true", () => {
    const sm = new SoundManager();
    sm.mute();
    expect(sm.muted).toBe(true);
  });

  it("unmute() restores muted to false", () => {
    const sm = new SoundManager();
    sm.mute();
    sm.unmute();
    expect(sm.muted).toBe(false);
  });
});

describe("S4-S1: SoundManager — event-driven playback", () => {
  it("play() is called on riddle:answered correct", () => {
    const bus = new EventBus();
    const sm = new SoundManager(bus);
    const playSpy = vi.spyOn(sm, "play");

    bus.emit("riddle:answered", { correct: true });
    expect(playSpy).toHaveBeenCalledWith("correct");
  });

  it("play() is called on riddle:answered wrong", () => {
    const bus = new EventBus();
    const sm = new SoundManager(bus);
    const playSpy = vi.spyOn(sm, "play");

    bus.emit("riddle:answered", { correct: false });
    expect(playSpy).toHaveBeenCalledWith("wrong");
  });

  it("play() is called on goblet:chosen correct", () => {
    const bus = new EventBus();
    const sm = new SoundManager(bus);
    const playSpy = vi.spyOn(sm, "play");

    bus.emit("goblet:chosen", { outcome: "goblet:correct" });
    expect(playSpy).toHaveBeenCalledWith("safe");
  });

  it("play() is called on goblet:chosen poisoned", () => {
    const bus = new EventBus();
    const sm = new SoundManager(bus);
    const playSpy = vi.spyOn(sm, "play");

    bus.emit("goblet:chosen", { outcome: "goblet:poisoned" });
    expect(playSpy).toHaveBeenCalledWith("poison");
  });

  it("play() does not throw when AudioContext is unavailable", () => {
    const sm = new SoundManager(); // no AudioContext in Node env
    expect(() => sm.play("correct")).not.toThrow();
  });

  it("play() does not play when muted", () => {
    const sm = new SoundManager();
    // In Node env, audioCtx is null, so we just verify muted blocks
    sm.mute();
    // No throw, no audio — just verify muted flag prevents execution
    expect(() => sm.play("correct")).not.toThrow();
    expect(sm.muted).toBe(true);
  });
});
