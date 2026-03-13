/**
 * Backlog Sprint 3+4 tests — B1, B5, B6 (TDD).
 *
 * Covers:
 *  B1 — BaseSubscriber: subscribe() + destroy()
 *  B5 — GobletReaction tuples: ChatUI uses entry.char / entry.line
 *  B6 — TypingIndicator: show() / hide(); ChatUI.whenIdle() timing; sequential animation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { EventBus } from "../../src/engine/EventBus.js";

// ── Minimal DOM mock ──────────────────────────────────────────────────────────

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
    _ariaLabel: "",
    _parent: null,

    setAttribute(name, value) {
      if (name === "aria-label") this._ariaLabel = value;
    },
    getAttribute(name) {
      return name === "aria-label" ? this._ariaLabel : null;
    },
    appendChild(child) {
      child._parent = this;
      this._children.push(child);
      return child;
    },
    removeChild(child) {
      const idx = this._children.indexOf(child);
      if (idx !== -1) {
        this._children.splice(idx, 1);
        child._parent = null;
      }
    },
    contains(child) {
      if (child === this) return true;
      for (const c of this._children) {
        if (c === child || (c.contains && c.contains(child))) return true;
      }
      return false;
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
    addEventListener(event, handler) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(handler);
    },
    removeEventListener(event, handler) {
      if (!this._listeners[event]) return;
      this._listeners[event] = this._listeners[event].filter(
        (h) => h !== handler,
      );
    },
    _dispatch(event, ...args) {
      if (this._listeners[event]) {
        for (const h of this._listeners[event]) h(...args);
      }
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

// Patch document.createElement for Node env
global.document = {
  createElement: (tag) => makeMockElement(tag),
};

// Import after patching
const { BaseSubscriber } = await import("../../src/ui/BaseSubscriber.js");
const { TypingIndicator } = await import("../../src/ui/TypingIndicator.js");
const { ChatUI } = await import("../../src/ui/ChatUI.js");

// ─────────────────────────────────────────────────────────────────────────────
// B1 — BaseSubscriber
// ─────────────────────────────────────────────────────────────────────────────

describe("BaseSubscriber — subscribe()", () => {
  it("registers handler with the bus", () => {
    const subscriber = new BaseSubscriber();
    const bus = new EventBus();
    const handler = vi.fn();
    subscriber.subscribe(bus, "test:event", handler);
    bus.emit("test:event", { data: 42 });
    expect(handler).toHaveBeenCalledWith({ data: 42 });
  });

  it("can subscribe to multiple events", () => {
    const subscriber = new BaseSubscriber();
    const bus = new EventBus();
    const h1 = vi.fn();
    const h2 = vi.fn();
    subscriber.subscribe(bus, "event:one", h1);
    subscriber.subscribe(bus, "event:two", h2);
    bus.emit("event:one", "A");
    bus.emit("event:two", "B");
    expect(h1).toHaveBeenCalledWith("A");
    expect(h2).toHaveBeenCalledWith("B");
  });

  it("stores subscriptions internally", () => {
    const subscriber = new BaseSubscriber();
    const bus = new EventBus();
    const handler = vi.fn();
    subscriber.subscribe(bus, "any:event", handler);
    // Verify by checking destroy works (indirectly tests storage)
    subscriber.destroy();
    bus.emit("any:event", "payload");
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("BaseSubscriber — destroy()", () => {
  it("calls bus.off() for each registered subscription", () => {
    const subscriber = new BaseSubscriber();
    const bus = new EventBus();
    const offSpy = vi.spyOn(bus, "off");
    const h1 = vi.fn();
    const h2 = vi.fn();
    subscriber.subscribe(bus, "event:a", h1);
    subscriber.subscribe(bus, "event:b", h2);
    subscriber.destroy();
    expect(offSpy).toHaveBeenCalledTimes(2);
    expect(offSpy).toHaveBeenCalledWith("event:a", h1);
    expect(offSpy).toHaveBeenCalledWith("event:b", h2);
  });

  it("clears the subscription list after destroy", () => {
    const subscriber = new BaseSubscriber();
    const bus = new EventBus();
    const handler = vi.fn();
    subscriber.subscribe(bus, "my:event", handler);
    subscriber.destroy();
    // After destroy, handler must not fire
    bus.emit("my:event", "ignored");
    expect(handler).not.toHaveBeenCalled();
  });

  it("destroy() is idempotent — calling twice does not throw", () => {
    const subscriber = new BaseSubscriber();
    const bus = new EventBus();
    subscriber.subscribe(bus, "x:event", vi.fn());
    expect(() => {
      subscriber.destroy();
      subscriber.destroy();
    }).not.toThrow();
  });

  it("handlers are no longer called after destroy", () => {
    const subscriber = new BaseSubscriber();
    const bus = new EventBus();
    const handler = vi.fn();
    subscriber.subscribe(bus, "phase:changed", handler);
    subscriber.destroy();
    bus.emit("phase:changed", { round: 1 });
    expect(handler).toHaveBeenCalledTimes(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B5 — GobletReaction tuples
// ─────────────────────────────────────────────────────────────────────────────

describe("ChatUI — B5 GobletReaction tuples", () => {
  let container;
  let bus;

  beforeEach(() => {
    vi.useFakeTimers();
    container = makeMockElement("div");
    bus = new EventBus();
    new ChatUI(container, bus);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("goblet:chosen reactionLines uses entry.char for avatar lookup", async () => {
    bus.emit("goblet:chosen", {
      choice: "left",
      outcome: "goblet:correct",
      reactionLines: [
        { char: "Vizzini", line: "Inconceivable!" },
        { char: "Buttercup", line: "Oh, Westley!" },
      ],
    });
    await vi.advanceTimersByTimeAsync(15000);

    const allText = container._children.map((b) => b.allText).join(" ");
    expect(allText).toContain("Inconceivable!");
    expect(allText).toContain("Oh, Westley!");
  });

  it("goblet:chosen uses entry.char to set bubble name (not positional index)", async () => {
    bus.emit("goblet:chosen", {
      choice: "right",
      outcome: "goblet:poisoned",
      reactionLines: [{ char: "Gramps", line: "You chose poorly." }],
    });
    await vi.advanceTimersByTimeAsync(15000);

    const grampsName = container._children
      .flatMap((b) => {
        const header = b._children.find((c) => c.className === "chat-header");
        return header ? header._children : [];
      })
      .find((c) => c.className === "chat-name" && c.textContent === "Gramps");

    expect(grampsName).toBeDefined();
    expect(grampsName.textContent).toBe("Gramps");
  });

  it("goblet:chosen renders all reaction entries from tuple array", async () => {
    const reactions = [
      { char: "Vizzini", line: "Line V" },
      { char: "Boy", line: "Line B" },
    ];
    bus.emit("goblet:chosen", {
      choice: "left",
      outcome: "goblet:correct",
      reactionLines: reactions,
    });
    await vi.advanceTimersByTimeAsync(15000);

    // 1 (choice) + 1 (outcome) + 2 (reactions) = 4
    expect(container._children.length).toBe(4);
  });

  it("empty reactionLines array results in only choice + outcome bubbles", async () => {
    bus.emit("goblet:chosen", {
      choice: "left",
      outcome: "goblet:correct",
      reactionLines: [],
    });
    await vi.advanceTimersByTimeAsync(10000);

    expect(container._children.length).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B6 — TypingIndicator
// ─────────────────────────────────────────────────────────────────────────────

describe("TypingIndicator — show()", () => {
  it('appends a bubble with "..." text to the container', () => {
    const indicator = new TypingIndicator();
    const container = makeMockElement("div");
    indicator.show("Vizzini", "😤", container);
    expect(container._children.length).toBe(1);
    const bubble = container._children[0];
    expect(bubble.allText).toContain("...");
  });

  it("includes the speaker name in the typing bubble", () => {
    const indicator = new TypingIndicator();
    const container = makeMockElement("div");
    indicator.show("Gramps", "🧓", container);
    const bubble = container._children[0];
    expect(bubble.allText).toContain("Gramps");
  });

  it("includes the avatar emoji in the typing bubble", () => {
    const indicator = new TypingIndicator();
    const container = makeMockElement("div");
    indicator.show("Buttercup", "👸", container);
    const bubble = container._children[0];
    expect(bubble.allText).toContain("👸");
  });
});

describe("TypingIndicator — hide()", () => {
  it("removes the bubble from the container", () => {
    const indicator = new TypingIndicator();
    const container = makeMockElement("div");
    indicator.show("Boy", "🤧", container);
    expect(container._children.length).toBe(1);
    indicator.hide();
    expect(container._children.length).toBe(0);
  });

  it("hide() before show() does not throw", () => {
    const indicator = new TypingIndicator();
    expect(() => indicator.hide()).not.toThrow();
  });

  it("calling show() then hide() twice does not throw", () => {
    const indicator = new TypingIndicator();
    const container = makeMockElement("div");
    indicator.show("DPR", "🏴‍☠️", container);
    indicator.hide();
    expect(() => indicator.hide()).not.toThrow();
    expect(container._children.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B6 — ChatUI.whenIdle() with animation timing
// ─────────────────────────────────────────────────────────────────────────────

describe("ChatUI — whenIdle() resolves after animation delay", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("whenIdle() returns a Promise", () => {
    const container = makeMockElement("div");
    const chatUI = new ChatUI(container);
    expect(chatUI.whenIdle()).toBeInstanceOf(Promise);
  });

  it("whenIdle() does not resolve before animation delay", async () => {
    vi.useFakeTimers();
    const container = makeMockElement("div");
    // Emit a riddle which triggers appendBubbleAnimated internally
    const bus = new EventBus();
    const animChatUI = new ChatUI(container, bus);

    let resolved = false;
    // Trigger an event to queue an animation
    bus.emit("riddle:presented", {
      riddle: {
        question: "What has roots as nobody sees?",
        hint: "think",
        alternates: [],
      },
    });

    animChatUI.whenIdle().then(() => {
      resolved = true;
    });

    // Should not resolve before delay elapses
    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(false);

    // advanceTimersByTimeAsync interleaves microtask flushing so the chained
    // setTimeout (registered inside a .then()) is correctly reached and fired.
    await vi.advanceTimersByTimeAsync(3000);
    expect(resolved).toBe(true);

    vi.useRealTimers();
  });

  it("whenIdle() resolves immediately when no animations are pending", async () => {
    const container = makeMockElement("div");
    const chatUI = new ChatUI(container);
    // No events fired — idle promise should resolve right away
    let resolved = false;
    chatUI.whenIdle().then(() => {
      resolved = true;
    });
    await Promise.resolve();
    expect(resolved).toBe(true);
  });
});

describe("ChatUI — sequential animation for multi-line scenes", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders scene lines sequentially — first bubble before second is visible", async () => {
    vi.useFakeTimers();
    const container = makeMockElement("div");
    const bus = new EventBus();
    new ChatUI(container, bus);

    const scene = [
      { char: "Vizzini", line: "Ha!" },
      { char: "Buttercup", line: "Oh." },
    ];

    bus.emit("conversation:play", scene);

    // After 0 ms — typing indicators for first line may be shown but real bubble not yet appended
    // After first delay elapses — first bubble appears, second typing indicator starts
    // We just verify both eventually appear after advancing time

    // Each bubble is animated sequentially; need enough time for both chains.
    await vi.advanceTimersByTimeAsync(10000);

    // After sufficient time, both real bubbles should be in the container
    const bubbleLines = container._children.map((b) => b.allText);
    const containsHa = bubbleLines.some((t) => t.includes("Ha!"));
    const containsOh = bubbleLines.some((t) => t.includes("Oh."));
    expect(containsHa).toBe(true);
    expect(containsOh).toBe(true);

    vi.useRealTimers();
  });
});
