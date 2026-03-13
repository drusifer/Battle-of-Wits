/**
 * Tech Debt Sprint regression tests — 2026-03-12
 *
 * TD1 — Restart flow must preserve EventBus subscriptions.
 *   destroy() permanently removes subscriptions; it must NOT be called in the
 *   restart path. clear()/reset()/hide() reset DOM state only and must leave
 *   subscriptions intact so the UI responds to a restarted engine's events.
 *
 * TD3 — GobletDisplay self-enables via goblets:described (not phase:changed).
 *   The public enable() method guards on #active which is only set in
 *   #onGobletsDescribed. Calling enable() before goblets:described is always
 *   a no-op. Verified here so the behaviour is locked in.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { EventBus } from "../../src/engine/EventBus.js";

// ── Minimal DOM mock (same pattern as BacklogSprint3.test.js) ─────────────────

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

global.document = {
  createElement: (tag) => makeMockElement(tag),
};

const { ChatUI } = await import("../../src/ui/ChatUI.js");
const { StatusBar } = await import("../../src/ui/StatusBar.js");
const { GobletDisplay } = await import("../../src/ui/GobletDisplay.js");

// ─────────────────────────────────────────────────────────────────────────────
// TD1 — Restart: reset methods preserve subscriptions
// ─────────────────────────────────────────────────────────────────────────────

describe("TD1 — ChatUI.clear() preserves EventBus subscriptions", () => {
  afterEach(() => vi.useRealTimers());

  it("still receives riddle:presented events after clear()", async () => {
    vi.useFakeTimers();
    const bus = new EventBus();
    const container = makeMockElement("div");
    const chatUI = new ChatUI(container, bus);

    // Fire an event before clear to populate state
    bus.emit("riddle:presented", {
      riddle: { question: "First riddle?", hint: "hint", alternates: [] },
    });
    await vi.advanceTimersByTimeAsync(5000);
    const beforeCount = container._children.length;
    expect(beforeCount).toBeGreaterThan(0);

    // clear() — simulates restart. ChatUI uses innerHTML='', not removeChild,
    // so check innerHTML rather than _children (mock doesn't sync the two).
    chatUI.clear();
    expect(container.innerHTML).toBe("");

    // Fire a second event — subscription must still be active
    bus.emit("riddle:presented", {
      riddle: { question: "Second riddle?", hint: "hint", alternates: [] },
    });
    await vi.advanceTimersByTimeAsync(5000);
    expect(container._children.length).toBeGreaterThan(0);
  });

  it("destroy() removes subscriptions — proving clear() is the right restart method", () => {
    const bus = new EventBus();
    const container = makeMockElement("div");
    const chatUI = new ChatUI(container, bus);
    const onSpy = vi.spyOn(bus, "off");

    chatUI.clear();
    expect(onSpy).not.toHaveBeenCalled(); // clear() must NOT call bus.off()

    chatUI.destroy();
    expect(onSpy).toHaveBeenCalled(); // destroy() does call bus.off()
  });
});

describe("TD1 — StatusBar.reset() preserves EventBus subscriptions", () => {
  it("still receives phase:changed events after reset()", () => {
    const bus = new EventBus();
    const el = makeMockElement("div");
    const statusBar = new StatusBar(el, bus);

    // Advance to round 2 via poison
    bus.emit("phase:changed", { to: "RIDDLE_PHASE", round: 2 });
    expect(el.innerHTML).toContain("Round 2");

    // reset() — simulates restart
    statusBar.reset();
    expect(el.innerHTML).toContain("Round 1");

    // Subscription still active — responds to new game events
    bus.emit("phase:changed", { to: "RIDDLE_PHASE", round: 1 });
    expect(el.innerHTML).toContain("Round 1");
  });

  it("destroy() removes subscriptions — proving reset() is the right restart method", () => {
    const bus = new EventBus();
    const el = makeMockElement("div");
    const statusBar = new StatusBar(el, bus);
    const offSpy = vi.spyOn(bus, "off");

    statusBar.reset();
    expect(offSpy).not.toHaveBeenCalled();

    statusBar.destroy();
    expect(offSpy).toHaveBeenCalled();
  });
});

describe("TD1 — GobletDisplay.hide() preserves EventBus subscriptions", () => {
  it("still responds to goblets:described after hide()", () => {
    const bus = new EventBus();
    const leftEl = makeMockElement("button");
    const rightEl = makeMockElement("button");
    // Add required child elements
    const leftDesc = makeMockElement("span");
    leftDesc.className = "goblet-desc";
    const rightDesc = makeMockElement("span");
    rightDesc.className = "goblet-desc";
    leftEl.appendChild(leftDesc);
    rightEl.appendChild(rightDesc);

    const gobletDisplay = new GobletDisplay(leftEl, rightEl, vi.fn(), bus);

    // hide() — simulates restart
    gobletDisplay.hide();
    expect(leftEl.style.display).toBe("none");

    // Subscription still active — goblets:described should make panels visible again
    bus.emit("goblets:described", {
      left: "A dark goblet",
      right: "A silver goblet",
    });
    expect(leftEl.style.display).toBe("flex");
    expect(rightEl.style.display).toBe("flex");
  });

  it("destroy() removes subscriptions — proving hide() is the right restart method", () => {
    const bus = new EventBus();
    const leftEl = makeMockElement("button");
    const rightEl = makeMockElement("button");
    const offSpy = vi.spyOn(bus, "off");

    const gobletDisplay = new GobletDisplay(leftEl, rightEl, vi.fn(), bus);

    gobletDisplay.hide();
    expect(offSpy).not.toHaveBeenCalled();

    gobletDisplay.destroy();
    expect(offSpy).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TD3 — GobletDisplay.enable() is a no-op before goblets:described
// ─────────────────────────────────────────────────────────────────────────────

describe("TD3 — GobletDisplay.enable() no-ops before goblets:described", () => {
  it("enable() before goblets:described does not enable the buttons", () => {
    const bus = new EventBus();
    const leftEl = makeMockElement("button");
    const rightEl = makeMockElement("button");
    leftEl.disabled = true;
    rightEl.disabled = true;

    const gobletDisplay = new GobletDisplay(leftEl, rightEl, vi.fn(), bus);

    // Calling enable() without prior goblets:described is a no-op
    gobletDisplay.enable();
    expect(leftEl.disabled).toBe(true);
    expect(rightEl.disabled).toBe(true);
  });

  it("goblets:described fires self-enables the display without needing enable()", () => {
    const bus = new EventBus();
    const leftEl = makeMockElement("button");
    const rightEl = makeMockElement("button");
    const leftDesc = makeMockElement("span");
    leftDesc.className = "goblet-desc";
    const rightDesc = makeMockElement("span");
    rightDesc.className = "goblet-desc";
    leftEl.appendChild(leftDesc);
    rightEl.appendChild(rightDesc);

    new GobletDisplay(leftEl, rightEl, vi.fn(), bus);

    // No external enable() call — self-enables via event
    bus.emit("goblets:described", {
      left: "Dark goblet",
      right: "Bright goblet",
    });
    expect(leftEl.disabled).toBe(false);
    expect(rightEl.disabled).toBe(false);
  });
});
