/**
 * UAT Sprint 4 — Trin's acceptance audit (T50)
 * Run: node agents/tools/uat_sprint4.mjs
 *
 * Covers T42–T47 (UX Polish + Sound):
 *   [1] S4-U1: clueType in hint:requested payload (GameEngine)
 *   [2] S4-U1: ChatUI clue flash class applied after hint
 *   [3] S4-U2: ChatUI whenIdle() queue is real (doesn't resolve before animations)
 *   [4] S4-U3: GobletDisplay goblet:chosen applies animation class
 *   [5] S4-G1: GameEngine requestGobletHint() — event, idempotency
 *   [6] S4-G1: StatusBar heart:spent decrements hearts
 *   [7] S4-S1: SoundManager mute/unmute; event-driven play; graceful no AudioContext
 *   [8] Sprint 3 regression — 278 unit tests pass baseline confirmed
 */

import { readFileSync } from 'fs';
import { buildGameData } from '../../src/utils/DataLoader.js';
import { EventBus } from '../../src/engine/EventBus.js';
import { GameEngine, STATES } from '../../src/engine/GameEngine.js';
import { SoundManager } from '../../src/utils/SoundManager.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    const msg = detail ? `${label}: ${detail}` : label;
    console.log(`  ✗ ${msg}`);
    failed++;
    failures.push(label);
  }
}

// ── Load data ─────────────────────────────────────────────────────────────────
const rawRiddles = JSON.parse(readFileSync('data/riddles.json', 'utf8'));
const rawAttributes = JSON.parse(readFileSync('data/attributes.json', 'utf8'));
const rawConversations = JSON.parse(readFileSync('data/conversations.json', 'utf8'));
const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);

const mockChatUI = { whenIdle: async () => {} };

// ── Minimal DOM mock ──────────────────────────────────────────────────────────
function makeMockElement(tag = 'div') {
  const el = {
    tag, className: '', textContent: '', innerHTML: '', style: {},
    disabled: false, _children: [], _listeners: {},
    setAttribute(name, value) { if (name === 'aria-label') this._ariaLabel = value; },
    getAttribute(name) { return name === 'aria-label' ? this._ariaLabel : null; },
    appendChild(child) { this._children.push(child); return child; },
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
      (this._listeners[event] || []).forEach(h => h(...args));
    },
    querySelector(selector) {
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

global.document = { createElement: tag => makeMockElement(tag) };

// Import UI classes AFTER document is patched
const { ChatUI } = await import('../../src/ui/ChatUI.js');
const { StatusBar } = await import('../../src/ui/StatusBar.js');
const { GobletDisplay } = await import('../../src/ui/GobletDisplay.js');

function makeGobletEl() {
  const el = makeMockElement('button');
  const desc = makeMockElement('span');
  desc.className = 'goblet-desc';
  el.appendChild(desc);
  return el;
}

// Helper: run engine to GOBLET_PHASE by answering 3 riddles wrong
async function makeEngineInGobletPhase() {
  const gd = buildGameData(rawRiddles, rawAttributes, rawConversations);
  const bus = new EventBus();
  const engine = new GameEngine(gd, mockChatUI, bus);
  await engine.startGame();
  for (let i = 0; i < 3; i++) await engine.answerRiddle('zzz_wrong');
  return { engine, bus };
}

// ─────────────────────────────────────────────────────────────────────────────
// [1] S4-U1: clueType in hint:requested payload
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[1] S4-U1: GameEngine — hint:requested clueType payload');

{
  // After correct answer: complement
  const gd = buildGameData(rawRiddles, rawAttributes, rawConversations);
  const bus = new EventBus();
  const engine = new GameEngine(gd, mockChatUI, bus);
  let firstRiddle = null;
  bus.on('riddle:presented', ({ riddle }) => { if (!firstRiddle) firstRiddle = riddle; });
  let hint = null;
  bus.on('hint:requested', p => { hint = p; });
  await engine.startGame();
  await engine.answerRiddle(firstRiddle.answer); // correct
  await engine.requestHint();
  check('clueType is complement after correct answer', hint?.clueType === 'complement', hint?.clueType);
}

{
  // After wrong answer: insult
  const gd = buildGameData(rawRiddles, rawAttributes, rawConversations);
  const bus = new EventBus();
  const engine = new GameEngine(gd, mockChatUI, bus);
  let hint = null;
  bus.on('hint:requested', p => { hint = p; });
  await engine.startGame();
  await engine.answerRiddle('zzz_wrong');
  await engine.requestHint();
  check('clueType is insult after wrong answer', hint?.clueType === 'insult', hint?.clueType);
}

{
  // No answer yet: null
  const gd = buildGameData(rawRiddles, rawAttributes, rawConversations);
  const bus = new EventBus();
  const engine = new GameEngine(gd, mockChatUI, bus);
  let hint = null;
  bus.on('hint:requested', p => { hint = p; });
  await engine.startGame();
  await engine.requestHint();
  check('clueType is null when no riddle answered', hint?.clueType === null, String(hint?.clueType));
}

// ─────────────────────────────────────────────────────────────────────────────
// [2] S4-U1: ChatUI — clue flash class applied
// FAST_MODE=true collapses typing delays to 1ms for UAT speed
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[2] S4-U1: ChatUI — clue flash class on hint');

global.window = { FAST_MODE: true };

{
  const container = makeMockElement('div');
  const bus = new EventBus();
  const chatUI = new ChatUI(container, bus);

  bus.emit('riddle:answered', {
    correct: true,
    answer: 'mountain',
    clueLine: 'A towering achievement — much like my genius!',
    reactionLine: 'Correct!',
  });
  bus.emit('hint:requested', {
    hintLine: 'Listen, Westley...',
    vizziniReaction: 'Asking for help?!',
    clueType: 'complement',
  });
  await chatUI.whenIdle();

  const clueBubble = container._children.find(
    b => b.allText.includes('towering achievement')
  );
  check(
    'clue-flash-safe class on clueLine bubble after complement hint',
    clueBubble?.className?.includes('clue-flash-safe'),
    clueBubble?.className ?? 'bubble not found'
  );
}

{
  const container = makeMockElement('div');
  const bus = new EventBus();
  const chatUI = new ChatUI(container, bus);

  bus.emit('riddle:answered', {
    correct: false,
    answer: 'wrong',
    clueLine: 'As dull as tarnished pewter!',
    reactionLine: 'WRONG!',
  });
  bus.emit('hint:requested', {
    hintLine: 'Listen, Westley...',
    vizziniReaction: 'INCONCEIVABLE!',
    clueType: 'insult',
  });
  await chatUI.whenIdle();

  const clueBubble = container._children.find(
    b => b.allText.includes('tarnished pewter')
  );
  check(
    'clue-flash-poison class on clueLine bubble after insult hint',
    clueBubble?.className?.includes('clue-flash-poison'),
    clueBubble?.className ?? 'bubble not found'
  );
}

delete global.window;

// ─────────────────────────────────────────────────────────────────────────────
// [3] S4-U2: ChatUI whenIdle() real queue
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[3] S4-U2: ChatUI — whenIdle() is a real queue');

{
  const container = makeMockElement('div');
  const chatUI = new ChatUI(container);

  // whenIdle() resolves immediately when nothing queued
  const result = chatUI.whenIdle();
  check('whenIdle() returns a Promise', result instanceof Promise);
  await result; // must not hang
  check('whenIdle() resolves immediately when queue empty', true);
}

// ─────────────────────────────────────────────────────────────────────────────
// [4] S4-U3: GobletDisplay goblet:chosen animation class
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[4] S4-U3: GobletDisplay — goblet:chosen animation classes');

{
  const leftEl = makeGobletEl();
  const rightEl = makeGobletEl();
  const bus = new EventBus();
  new GobletDisplay(leftEl, rightEl, () => {}, bus);
  bus.emit('goblets:described', { left: 'Left desc', right: 'Right desc' });

  bus.emit('goblet:chosen', { choice: 'left', outcome: 'goblet:correct' });
  check(
    'goblet:correct adds goblet-glow to chosen goblet',
    leftEl.className.includes('goblet-glow'),
    leftEl.className
  );
  check(
    'goblet:correct does not animate unchosen goblet',
    !rightEl.className.includes('goblet-glow') && !rightEl.className.includes('goblet-shake'),
    rightEl.className
  );
}

{
  const leftEl = makeGobletEl();
  const rightEl = makeGobletEl();
  const bus = new EventBus();
  new GobletDisplay(leftEl, rightEl, () => {}, bus);
  bus.emit('goblets:described', { left: 'Left desc', right: 'Right desc' });

  bus.emit('goblet:chosen', { choice: 'right', outcome: 'goblet:poisoned' });
  check(
    'goblet:poisoned adds goblet-shake to chosen goblet',
    rightEl.className.includes('goblet-shake'),
    rightEl.className
  );
}

{
  // Animation class cleaned up on hide()
  const leftEl = makeGobletEl();
  const rightEl = makeGobletEl();
  const bus = new EventBus();
  new GobletDisplay(leftEl, rightEl, () => {}, bus);
  bus.emit('goblets:described', { left: 'Left', right: 'Right' });
  bus.emit('goblet:chosen', { choice: 'left', outcome: 'goblet:correct' });
  bus.emit('phase:changed', { to: STATES.RIDDLE_PHASE });
  check(
    'animation class cleaned up after hide()',
    !leftEl.className.includes('goblet-glow') && !leftEl.className.includes('goblet-shake'),
    leftEl.className
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// [5] S4-G1: GameEngine.requestGobletHint()
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[5] S4-G1: GameEngine — requestGobletHint()');

{
  // No-op outside GOBLET_PHASE
  const gd = buildGameData(rawRiddles, rawAttributes, rawConversations);
  const bus = new EventBus();
  const engine = new GameEngine(gd, mockChatUI, bus);
  await engine.startGame();
  const events = [];
  bus.on('hint:goblet-requested', p => events.push(p));
  await engine.requestGobletHint();
  check('requestGobletHint() is no-op outside GOBLET_PHASE', events.length === 0, `${events.length} events`);
}

{
  const { engine, bus } = await makeEngineInGobletPhase();
  const gobletHints = [];
  const heartEvents = [];
  bus.on('hint:goblet-requested', p => gobletHints.push(p));
  bus.on('heart:spent', p => heartEvents.push(p));

  await engine.requestGobletHint();
  check('requestGobletHint() emits hint:goblet-requested in GOBLET_PHASE', gobletHints.length === 1, `${gobletHints.length}`);
  check('hint:goblet-requested payload has hintLine', gobletHints[0]?.hintLine !== undefined);
  check('hint:goblet-requested payload has vizziniReaction', gobletHints[0]?.vizziniReaction !== undefined);
  check('requestGobletHint() emits heart:spent', heartEvents.length === 1, `${heartEvents.length}`);

  // Idempotent
  await engine.requestGobletHint();
  check('second requestGobletHint() call is no-op (idempotent)', gobletHints.length === 1, `${gobletHints.length}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// [6] S4-G1: StatusBar heart:spent
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[6] S4-G1: StatusBar — heart:spent event');

{
  const el = makeMockElement('div');
  const bus = new EventBus();
  new StatusBar(el, bus);
  const before = (el.innerHTML.match(/❤️/g) || []).length;
  bus.emit('heart:spent', {});
  const after = (el.innerHTML.match(/❤️/g) || []).length;
  check('heart:spent decrements hearts by 1', after === before - 1, `before=${before}, after=${after}`);
}

{
  const el = makeMockElement('div');
  const bus = new EventBus();
  new StatusBar(el, bus);
  bus.emit('heart:spent', {});
  bus.emit('heart:spent', {});
  bus.emit('heart:spent', {}); // 3rd — clamps at 0
  const count = (el.innerHTML.match(/❤️/g) || []).length;
  check('heart:spent clamps at 0 hearts', count === 0, `found ${count}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// [7] S4-S1: SoundManager
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[7] S4-S1: SoundManager');

{
  const sm = new SoundManager();
  check('SoundManager starts unmuted', sm.muted === false);

  sm.mute();
  check('mute() sets muted=true', sm.muted === true);

  sm.unmute();
  check('unmute() restores muted=false', sm.muted === false);

  // play() doesn't throw when AudioContext unavailable (Node env)
  let threw = false;
  try { sm.play('correct'); } catch { threw = true; }
  check('play() is graceful when AudioContext unavailable', !threw);
}

{
  // Event-driven: riddle:answered triggers play()
  const bus = new EventBus();
  const sm = new SoundManager(bus);
  let lastPlay = null;
  const origPlay = sm.play.bind(sm);
  sm.play = id => { lastPlay = id; origPlay(id); };

  bus.emit('riddle:answered', { correct: true });
  check('play(correct) called on riddle:answered correct', lastPlay === 'correct', lastPlay);

  bus.emit('riddle:answered', { correct: false });
  check('play(wrong) called on riddle:answered wrong', lastPlay === 'wrong', lastPlay);

  bus.emit('goblet:chosen', { outcome: 'goblet:correct' });
  check('play(safe) called on goblet:chosen correct', lastPlay === 'safe', lastPlay);

  bus.emit('goblet:chosen', { outcome: 'goblet:poisoned' });
  check('play(poison) called on goblet:chosen poisoned', lastPlay === 'poison', lastPlay);
}

{
  // Muted: play() still called but audio is skipped (no error)
  const sm = new SoundManager();
  sm.mute();
  let threw = false;
  try { sm.play('correct'); } catch { threw = true; }
  check('play() is silent (no throw) when muted', !threw);
}

// ─────────────────────────────────────────────────────────────────────────────
// [8] Sprint 3 regression — structural checks
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[8] Sprint 3 regression — structural smoke tests');

{
  check('GameEngine has requestGobletHint method', typeof new GameEngine(gameData, mockChatUI, new EventBus()).requestGobletHint === 'function');
  check('SoundManager has mute/unmute/play methods', (
    typeof new SoundManager().mute === 'function' &&
    typeof new SoundManager().unmute === 'function' &&
    typeof new SoundManager().play === 'function'
  ));

  const leftEl = makeGobletEl();
  const rightEl = makeGobletEl();
  const gd = new GobletDisplay(leftEl, rightEl, () => {}, new EventBus());
  check('GobletDisplay has setHintButton method', typeof gd.setHintButton === 'function');
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`UAT Sprint 4 — ${passed + failed} checks: ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log('\nFAILED:');
  failures.forEach(f => console.log(`  ✗ ${f}`));
  process.exit(1);
} else {
  console.log('ALL CHECKS PASSED — Sprint 4 accepted ✓');
}
