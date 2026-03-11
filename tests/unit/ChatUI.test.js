/**
 * ChatUI, StatusBar, and GobletDisplay tests (T39 + T40).
 *
 * Runs in Node environment using a minimal DOM mock — no jsdom required.
 * The mock implements only the DOM surface that the UI classes actually use.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../../src/engine/EventBus.js';

// ── Minimal DOM mock ──────────────────────────────────────────────────────────
// Provides just enough DOM API to satisfy ChatUI, StatusBar, and GobletDisplay
// without requiring the jsdom package.

function makeMockElement(tag = 'div') {
  const el = {
    tag,
    className: '',
    textContent: '',
    innerHTML: '',
    style: {},
    disabled: false,
    _children: [],
    _listeners: {},
    _ariaLabel: '',

    setAttribute(name, value) {
      if (name === 'aria-label') this._ariaLabel = value;
    },
    getAttribute(name) {
      if (name === 'aria-label') return this._ariaLabel;
      return null;
    },
    appendChild(child) {
      this._children.push(child);
      return child;
    },
    querySelector(selector) {
      // Support '.goblet-desc' selector for GobletDisplay
      const cls = selector.startsWith('.') ? selector.slice(1) : null;
      if (!cls) return null;
      const search = children => {
        for (const c of children) {
          if (typeof c.className === 'string' && c.className.split(' ').includes(cls)) return c;
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
    _dispatch(event, ...args) {
      if (this._listeners[event]) {
        for (const h of this._listeners[event]) h(...args);
      }
    },
    /** Flatten all descendant text to a searchable string. */
    get allText() {
      const collect = node => {
        let text = node.textContent || '';
        for (const c of node._children || []) text += collect(c);
        return text;
      };
      return collect(this);
    },
  };
  return el;
}

// Patch document.createElement globally so ChatUI can call it in Node env.
global.document = {
  createElement: tag => makeMockElement(tag),
};

// ── Import UI classes AFTER document is patched ───────────────────────────────
const { ChatUI } = await import('../../src/ui/ChatUI.js');
const { StatusBar } = await import('../../src/ui/StatusBar.js');
const { GobletDisplay } = await import('../../src/ui/GobletDisplay.js');
const { STATES } = await import('../../src/engine/GameEngine.js');

// ─────────────────────────────────────────────────────────────────────────────
// T39 — ChatUI
// ─────────────────────────────────────────────────────────────────────────────

describe('ChatUI — render()', () => {
  let container;
  let chatUI;

  beforeEach(() => {
    container = makeMockElement('div');
    chatUI = new ChatUI(container);
  });

  it('render() appends chat bubbles to the container for a banter scene', () => {
    const scene = [
      { char: 'Vizzini', line: 'Inconceivable!' },
      { char: 'Buttercup', line: 'You keep using that word.' },
    ];
    chatUI.render(scene);
    expect(container._children.length).toBe(2);
  });

  it('each bubble contains the speaker name', () => {
    chatUI.render([{ char: 'Gramps', line: 'As you wish.' }]);
    const bubble = container._children[0];
    const nameEl = bubble._children
      .find(c => c.className === 'chat-header')
      ?._children.find(c => c.className === 'chat-name');
    expect(nameEl.textContent).toBe('Gramps');
  });

  it('each bubble contains the line text', () => {
    chatUI.render([{ char: 'Gramps', line: 'The classic blunders.' }]);
    const bubble = container._children[0];
    const lineEl = bubble._children.find(c => c.className === 'chat-line');
    expect(lineEl.textContent).toBe('The classic blunders.');
  });

  it('render() with empty scene does nothing', () => {
    chatUI.render([]);
    expect(container._children.length).toBe(0);
  });

  it('render() with null does nothing', () => {
    chatUI.render(null);
    expect(container._children.length).toBe(0);
  });

  it('multiple render() calls accumulate bubbles', () => {
    chatUI.render([{ char: 'Boy', line: 'Is this a kissing book?' }]);
    chatUI.render([{ char: 'Gramps', line: 'Wait. Do you want me to go back?' }]);
    expect(container._children.length).toBe(2);
  });
});

describe('ChatUI — whenIdle()', () => {
  it('returns a Promise', () => {
    const container = makeMockElement('div');
    const chatUI = new ChatUI(container);
    const result = chatUI.whenIdle();
    expect(result).toBeInstanceOf(Promise);
  });

  it('resolves immediately', async () => {
    const container = makeMockElement('div');
    const chatUI = new ChatUI(container);
    await expect(chatUI.whenIdle()).resolves.toBeUndefined();
  });
});

describe('ChatUI — EventBus subscriptions', () => {
  let container;
  let bus;

  beforeEach(() => {
    container = makeMockElement('div');
    bus = new EventBus();
    new ChatUI(container, bus);
  });

  it('riddle:presented event appends a riddle bubble with question text', () => {
    bus.emit('riddle:presented', { riddle: { question: 'What has roots as nobody sees?' } });
    expect(container._children.length).toBeGreaterThan(0);
    const texts = container._children.map(b => b.allText).join(' ');
    expect(texts).toContain('What has roots as nobody sees?');
  });

  it('game:won appends a win message bubble', () => {
    bus.emit('game:won', { rounds: 1 });
    const texts = container._children.map(b => b.allText).join(' ');
    expect(texts.toLowerCase()).toMatch(/triumph|bested|victory/);
  });

  it('game:lost appends a loss message bubble', () => {
    bus.emit('game:lost', {});
    expect(container._children.length).toBeGreaterThan(0);
    const texts = container._children.map(b => b.allText).join(' ');
    expect(texts.toLowerCase()).toMatch(/blunder|over|fallen/);
  });

  it('conversation:play event appends banter bubbles', () => {
    const scene = [{ char: 'Vizzini', line: 'Never get involved in a land war in Asia.' }];
    bus.emit('conversation:play', scene);
    expect(container._children.length).toBe(1);
  });

  it('riddle:answered appends result bubble', () => {
    bus.emit('riddle:answered', { correct: true, clueLine: null, reactionLine: null });
    expect(container._children.length).toBeGreaterThan(0);
    const texts = container._children.map(b => b.allText).join(' ');
    expect(texts).toMatch(/Correct/);
  });
});

describe('ChatUI — clear()', () => {
  it('clear() resets container innerHTML', () => {
    const container = makeMockElement('div');
    const bus = new EventBus();
    const chatUI = new ChatUI(container, bus);
    chatUI.render([{ char: 'Vizzini', line: 'Inconceivable!' }]);
    chatUI.clear();
    expect(container.innerHTML).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T40a — StatusBar
// ─────────────────────────────────────────────────────────────────────────────

describe('StatusBar — initial render', () => {
  it('shows Round 1 on construction', () => {
    const el = makeMockElement('div');
    new StatusBar(el);
    expect(el.innerHTML).toContain('Round 1');
  });

  it('shows 2 full hearts on construction', () => {
    const el = makeMockElement('div');
    new StatusBar(el);
    // Two full hearts — ❤️ appears twice
    const heartCount = (el.innerHTML.match(/❤️/g) || []).length;
    expect(heartCount).toBe(2);
  });

  it('aria-label on hearts span reports 2 of 2 hearts', () => {
    const el = makeMockElement('div');
    new StatusBar(el);
    expect(el.innerHTML).toContain('2 of 2 hearts');
  });
});

describe('StatusBar — phase:changed events', () => {
  let el;
  let bus;

  beforeEach(() => {
    el = makeMockElement('div');
    bus = new EventBus();
    new StatusBar(el, bus);
  });

  it('phase:changed to RIDDLE_PHASE with round 2 updates round display', () => {
    bus.emit('phase:changed', { to: STATES.RIDDLE_PHASE, round: 2 });
    expect(el.innerHTML).toContain('Round 2');
  });

  it('phase:changed to GOBLET_PHASE preserves current round', () => {
    bus.emit('phase:changed', { to: STATES.RIDDLE_PHASE, round: 1 });
    bus.emit('phase:changed', { to: STATES.GOBLET_PHASE, round: 1 });
    expect(el.innerHTML).toContain('Round 1');
  });
});

describe('StatusBar — goblet:chosen events', () => {
  it('goblet:chosen with poisoned outcome decrements hearts', () => {
    const el = makeMockElement('div');
    const bus = new EventBus();
    new StatusBar(el, bus);

    bus.emit('goblet:chosen', { outcome: 'goblet:poisoned' });
    // Hearts should now be 1 full + 1 empty
    const fullHearts = (el.innerHTML.match(/❤️/g) || []).length;
    expect(fullHearts).toBe(1);
  });

  it('goblet:chosen with correct outcome does not decrement hearts', () => {
    const el = makeMockElement('div');
    const bus = new EventBus();
    new StatusBar(el, bus);

    bus.emit('goblet:chosen', { outcome: 'goblet:correct' });
    const fullHearts = (el.innerHTML.match(/❤️/g) || []).length;
    expect(fullHearts).toBe(2);
  });

  it('two poisoned events brings hearts to 0', () => {
    const el = makeMockElement('div');
    const bus = new EventBus();
    new StatusBar(el, bus);

    bus.emit('goblet:chosen', { outcome: 'goblet:poisoned' });
    bus.emit('goblet:chosen', { outcome: 'goblet:poisoned' });
    const fullHearts = (el.innerHTML.match(/❤️/g) || []).length;
    expect(fullHearts).toBe(0);
    expect(el.innerHTML).toContain('0 of 2 hearts');
  });
});

describe('StatusBar — reset()', () => {
  it('reset() restores Round 1 and 2 full hearts', () => {
    const el = makeMockElement('div');
    const bus = new EventBus();
    const bar = new StatusBar(el, bus);

    bus.emit('phase:changed', { to: STATES.RIDDLE_PHASE, round: 2 });
    bus.emit('goblet:chosen', { outcome: 'goblet:poisoned' });
    bar.reset();

    expect(el.innerHTML).toContain('Round 1');
    const fullHearts = (el.innerHTML.match(/❤️/g) || []).length;
    expect(fullHearts).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T40b — GobletDisplay
// ─────────────────────────────────────────────────────────────────────────────

function makeGobletEl(side) {
  const el = makeMockElement('button');
  // Pre-populate a .goblet-desc child as the real HTML does
  const desc = makeMockElement('span');
  desc.className = 'goblet-desc';
  el.appendChild(desc);
  el._side = side;
  return el;
}

describe('GobletDisplay — initial state', () => {
  it('goblet buttons are hidden (display:none) on construction', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    new GobletDisplay(leftEl, rightEl, () => {}, bus);

    expect(leftEl.style.display).toBe('none');
    expect(rightEl.style.display).toBe('none');
  });

  it('goblet buttons are disabled on construction', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    new GobletDisplay(leftEl, rightEl, () => {}, bus);

    expect(leftEl.disabled).toBe(true);
    expect(rightEl.disabled).toBe(true);
  });
});

describe('GobletDisplay — goblets:described event', () => {
  it('populates description text for both goblets', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    new GobletDisplay(leftEl, rightEl, () => {}, bus);

    bus.emit('goblets:described', {
      left: 'A jeweled cup of rare craftsmanship.',
      right: 'A plain wooden goblet, worn by use.',
    });

    const leftDesc = leftEl.querySelector('.goblet-desc');
    const rightDesc = rightEl.querySelector('.goblet-desc');
    expect(leftDesc.textContent).toBe('A jeweled cup of rare craftsmanship.');
    expect(rightDesc.textContent).toBe('A plain wooden goblet, worn by use.');
  });

  it('makes goblets visible after goblets:described', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    new GobletDisplay(leftEl, rightEl, () => {}, bus);

    bus.emit('goblets:described', { left: 'Left desc', right: 'Right desc' });

    expect(leftEl.style.display).toBe('');
    expect(rightEl.style.display).toBe('');
  });

  it('enables goblets after goblets:described', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    new GobletDisplay(leftEl, rightEl, () => {}, bus);

    bus.emit('goblets:described', { left: 'Left', right: 'Right' });

    expect(leftEl.disabled).toBe(false);
    expect(rightEl.disabled).toBe(false);
  });
});

describe('GobletDisplay — click callback', () => {
  it('clicking left goblet calls onChoose with "left"', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    const choices = [];
    new GobletDisplay(leftEl, rightEl, side => choices.push(side), bus);

    // Activate goblets first
    bus.emit('goblets:described', { left: 'L', right: 'R' });

    leftEl._dispatch('click');
    expect(choices).toEqual(['left']);
  });

  it('clicking right goblet calls onChoose with "right"', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    const choices = [];
    new GobletDisplay(leftEl, rightEl, side => choices.push(side), bus);

    bus.emit('goblets:described', { left: 'L', right: 'R' });

    rightEl._dispatch('click');
    expect(choices).toEqual(['right']);
  });

  it('clicking a goblet when disabled does NOT fire onChoose', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    const choices = [];
    new GobletDisplay(leftEl, rightEl, side => choices.push(side), bus);

    // Do NOT emit goblets:described — goblets remain inactive
    leftEl._dispatch('click');
    expect(choices).toHaveLength(0);
  });
});

describe('GobletDisplay — phase:changed hides goblets', () => {
  it('phase:changed to GOBLET_PHASE shows goblets', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    new GobletDisplay(leftEl, rightEl, () => {}, bus);

    bus.emit('phase:changed', { to: STATES.GOBLET_PHASE });

    expect(leftEl.style.display).toBe('');
    expect(rightEl.style.display).toBe('');
  });

  it('phase:changed away from GOBLET_PHASE hides goblets', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    new GobletDisplay(leftEl, rightEl, () => {}, bus);

    bus.emit('goblets:described', { left: 'L', right: 'R' });
    bus.emit('phase:changed', { to: STATES.RIDDLE_PHASE });

    expect(leftEl.style.display).toBe('none');
    expect(rightEl.style.display).toBe('none');
  });

  it('phase:changed away from GOBLET_PHASE disables goblets', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    new GobletDisplay(leftEl, rightEl, () => {}, bus);

    bus.emit('goblets:described', { left: 'L', right: 'R' });
    bus.emit('phase:changed', { to: STATES.RIDDLE_PHASE });

    expect(leftEl.disabled).toBe(true);
    expect(rightEl.disabled).toBe(true);
  });

  it('clicking after GOBLET_PHASE has ended does NOT fire onChoose', () => {
    const leftEl = makeGobletEl('left');
    const rightEl = makeGobletEl('right');
    const bus = new EventBus();
    const choices = [];
    new GobletDisplay(leftEl, rightEl, side => choices.push(side), bus);

    bus.emit('goblets:described', { left: 'L', right: 'R' });
    bus.emit('phase:changed', { to: STATES.RIDDLE_PHASE }); // leaves GOBLET_PHASE

    leftEl._dispatch('click');
    expect(choices).toHaveLength(0);
  });
});
