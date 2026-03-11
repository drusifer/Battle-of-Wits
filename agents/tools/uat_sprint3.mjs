/**
 * UAT Sprint 3 — Trin's acceptance audit
 * Run: node agents/tools/uat_sprint3.mjs
 *
 * Covers T30–T38 (UI layer + main.js bootstrap):
 *   [1] ChatUI contract — EventBus event → render output
 *   [2] StatusBar contract — phase:changed and goblet:chosen state updates
 *   [3] GobletDisplay contract — goblets:described, click callback, phase hiding
 *   [4] main.js smoke test — DataLoader.fetchAndBuild (via buildGameData), GameEngine bootstrap
 *   [5] Sprint 1+2 regression — batch sim + key checks inline
 */

import { readFileSync } from 'fs';
import { buildGameData } from '../../src/utils/DataLoader.js';
import { EventBus } from '../../src/engine/EventBus.js';
import { GameEngine, STATES } from '../../src/engine/GameEngine.js';
import { GameSimulator } from '../../src/engine/GameSimulator.js';
import { ChatUI } from '../../src/ui/ChatUI.js';
import { StatusBar } from '../../src/ui/StatusBar.js';
import { GobletDisplay } from '../../src/ui/GobletDisplay.js';

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

// ── Load data ────────────────────────────────────────────────────────────────
const rawRiddles       = JSON.parse(readFileSync('data/riddles.json', 'utf8'));
const rawAttributes    = JSON.parse(readFileSync('data/attributes.json', 'utf8'));
const rawConversations = JSON.parse(readFileSync('data/conversations.json', 'utf8'));
const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);

// ── Minimal DOM mock for headless UI testing ──────────────────────────────────
// Creates mock elements that track state the UI classes actually use.

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
    setAttribute(name, value) { if (name === 'aria-label') this._ariaLabel = value; },
    getAttribute(name) { return name === 'aria-label' ? this._ariaLabel : null; },
    appendChild(child) { this._children.push(child); return child; },
    querySelector(selector) {
      const cls = selector.startsWith('.') ? selector.slice(1) : null;
      if (!cls) return null;
      const search = (children) => {
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
      if (this._listeners[event]) for (const h of this._listeners[event]) h(...args);
    },
    get allText() {
      const collect = (node) => {
        let text = node.textContent || '';
        for (const c of node._children || []) text += collect(c);
        return text;
      };
      return collect(this);
    },
  };
  return el;
}

// Patch global document for ChatUI's createElement calls
global.document = { createElement: (tag) => makeMockElement(tag) };

// Helper to make a goblet button element (pre-populated with .goblet-desc child)
function makeGobletEl() {
  const el = makeMockElement('button');
  const desc = makeMockElement('span');
  desc.className = 'goblet-desc';
  el.appendChild(desc);
  return el;
}

// Headless chatUI stub — resolves immediately (for GameEngine)
const chatUI = { whenIdle: () => Promise.resolve() };

// ─────────────────────────────────────────────────────────────────────────────
// [1] CHATUI CONTRACT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[1] ChatUI contract');

const chatContainer = makeMockElement('div');
const chatBus = new EventBus();
const ui = new ChatUI(chatContainer, chatBus);

// render() with a banter scene
ui.render([
  { char: 'Vizzini', line: 'Inconceivable!' },
  { char: 'Buttercup', line: 'You keep using that word.' },
]);
check('render() appends 2 bubbles for 2-line scene', chatContainer._children.length === 2);

// Each bubble has a chat-name with correct speaker
const bubble1 = chatContainer._children[0];
const nameEl1 = bubble1.querySelector('chat-name') ??
  bubble1._children.find(c => c.className === 'chat-header')
    ?._children.find(c => c.className === 'chat-name');
check('first bubble speaker name is Vizzini', nameEl1?.textContent === 'Vizzini', nameEl1?.textContent);

const lineEl1 = bubble1._children.find(c => c.className === 'chat-line');
check('first bubble line text matches', lineEl1?.textContent === 'Inconceivable!', lineEl1?.textContent);

// whenIdle() contract
const idleResult = ui.whenIdle();
check('whenIdle() returns a Promise', idleResult instanceof Promise);
let idleResolved = false;
await idleResult.then(() => { idleResolved = true; });
check('whenIdle() resolves immediately', idleResolved);

// EventBus: riddle:presented
const riddle = { question: 'What walks on four legs at morning?', hint: 'Life stages', alternates: [] };
chatBus.emit('riddle:presented', { riddle });
const riddleTexts = chatContainer._children.map(b => b.allText).join(' ');
check('riddle:presented appends bubble containing question text',
  riddleTexts.includes(riddle.question), riddleTexts.slice(0, 80));

// EventBus: game:won
const wonContainer = makeMockElement('div');
const wonBus = new EventBus();
new ChatUI(wonContainer, wonBus);
wonBus.emit('game:won', { rounds: 1 });
const wonTexts = wonContainer._children.map(b => b.allText).join(' ').toLowerCase();
check('game:won appends win message',
  wonTexts.match(/triumph|bested|victory|wisely/) !== null, wonTexts.slice(0, 80));

// EventBus: game:lost
const lostContainer = makeMockElement('div');
const lostBus = new EventBus();
new ChatUI(lostContainer, lostBus);
lostBus.emit('game:lost', {});
const lostTexts = lostContainer._children.map(b => b.allText).join(' ').toLowerCase();
check('game:lost appends loss message',
  lostTexts.match(/blunder|over|fallen|poorly/) !== null, lostTexts.slice(0, 80));

// clear() resets innerHTML
const clearContainer = makeMockElement('div');
const clearUI = new ChatUI(clearContainer);
clearUI.render([{ char: 'Boy', line: 'Is this a kissing book?' }]);
clearUI.clear();
check('clear() resets container innerHTML', clearContainer.innerHTML === '');

// ─────────────────────────────────────────────────────────────────────────────
// [2] STATUSBAR CONTRACT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[2] StatusBar contract');

const sbEl = makeMockElement('div');
const sbBus = new EventBus();
const sb = new StatusBar(sbEl, sbBus);

check('StatusBar initial render shows Round 1', sbEl.innerHTML.includes('Round 1'));
const initFullHearts = (sbEl.innerHTML.match(/❤️/g) || []).length;
check('StatusBar initial render shows 2 full hearts', initFullHearts === 2, `found ${initFullHearts}`);
check('StatusBar initial aria label reports 2 of 2 hearts', sbEl.innerHTML.includes('2 of 2 hearts'));

// phase:changed to RIDDLE_PHASE round 2
sbBus.emit('phase:changed', { to: STATES.RIDDLE_PHASE, round: 2 });
check('phase:changed to RIDDLE_PHASE round 2 updates round display', sbEl.innerHTML.includes('Round 2'));

// goblet:chosen poisoned decrements hearts
sbBus.emit('goblet:chosen', { outcome: 'goblet:poisoned' });
const afterPoison = (sbEl.innerHTML.match(/❤️/g) || []).length;
check('goblet:chosen poisoned decrements hearts to 1', afterPoison === 1, `found ${afterPoison}`);

// goblet:chosen correct does not decrement
const sbEl2 = makeMockElement('div');
const sbBus2 = new EventBus();
new StatusBar(sbEl2, sbBus2);
sbBus2.emit('goblet:chosen', { outcome: 'goblet:correct' });
const afterCorrect = (sbEl2.innerHTML.match(/❤️/g) || []).length;
check('goblet:chosen correct does not decrement hearts', afterCorrect === 2, `found ${afterCorrect}`);

// reset() restores initial state
sb.reset();
check('reset() restores Round 1', sbEl.innerHTML.includes('Round 1'));
const resetHearts = (sbEl.innerHTML.match(/❤️/g) || []).length;
check('reset() restores 2 full hearts', resetHearts === 2, `found ${resetHearts}`);

// ─────────────────────────────────────────────────────────────────────────────
// [3] GOBLET DISPLAY CONTRACT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[3] GobletDisplay contract');

// Initial hidden/disabled state
const gdLeft1 = makeGobletEl();
const gdRight1 = makeGobletEl();
const gdBus1 = new EventBus();
new GobletDisplay(gdLeft1, gdRight1, () => {}, gdBus1);
check('GobletDisplay: both buttons hidden on construction', gdLeft1.style.display === 'none' && gdRight1.style.display === 'none');
check('GobletDisplay: both buttons disabled on construction', gdLeft1.disabled === true && gdRight1.disabled === true);

// goblets:described populates descriptions and shows
const gdLeft2 = makeGobletEl();
const gdRight2 = makeGobletEl();
const gdBus2 = new EventBus();
new GobletDisplay(gdLeft2, gdRight2, () => {}, gdBus2);
gdBus2.emit('goblets:described', {
  left: 'A golden chalice of ancient make.',
  right: 'A humble clay vessel, unadorned.',
});
const leftDescEl = gdLeft2.querySelector('.goblet-desc');
const rightDescEl = gdRight2.querySelector('.goblet-desc');
check('goblets:described populates left description',
  leftDescEl?.textContent === 'A golden chalice of ancient make.',
  leftDescEl?.textContent);
check('goblets:described populates right description',
  rightDescEl?.textContent === 'A humble clay vessel, unadorned.',
  rightDescEl?.textContent);
check('goblets:described makes goblets visible',
  gdLeft2.style.display === '' && gdRight2.style.display === '');
check('goblets:described enables goblets',
  gdLeft2.disabled === false && gdRight2.disabled === false);

// Click callback — left
const gdLeft3 = makeGobletEl();
const gdRight3 = makeGobletEl();
const gdBus3 = new EventBus();
const choices3 = [];
new GobletDisplay(gdLeft3, gdRight3, s => choices3.push(s), gdBus3);
gdBus3.emit('goblets:described', { left: 'L', right: 'R' });
gdLeft3._dispatch('click');
check('clicking left goblet calls onChoose("left")', choices3[0] === 'left', choices3[0]);

// Click callback — right
const gdLeft4 = makeGobletEl();
const gdRight4 = makeGobletEl();
const gdBus4 = new EventBus();
const choices4 = [];
new GobletDisplay(gdLeft4, gdRight4, s => choices4.push(s), gdBus4);
gdBus4.emit('goblets:described', { left: 'L', right: 'R' });
gdRight4._dispatch('click');
check('clicking right goblet calls onChoose("right")', choices4[0] === 'right', choices4[0]);

// Click before activation is a no-op
const gdLeft5 = makeGobletEl();
const gdRight5 = makeGobletEl();
const gdBus5 = new EventBus();
const choices5 = [];
new GobletDisplay(gdLeft5, gdRight5, s => choices5.push(s), gdBus5);
gdLeft5._dispatch('click');
check('clicking goblet before goblets:described is a no-op', choices5.length === 0);

// phase:changed away from GOBLET_PHASE hides goblets
const gdLeft6 = makeGobletEl();
const gdRight6 = makeGobletEl();
const gdBus6 = new EventBus();
new GobletDisplay(gdLeft6, gdRight6, () => {}, gdBus6);
gdBus6.emit('goblets:described', { left: 'L', right: 'R' });
gdBus6.emit('phase:changed', { to: STATES.RIDDLE_PHASE });
check('phase:changed to RIDDLE_PHASE hides goblets',
  gdLeft6.style.display === 'none' && gdRight6.style.display === 'none');
check('phase:changed to RIDDLE_PHASE disables goblets',
  gdLeft6.disabled === true && gdRight6.disabled === true);

// Click after phase change is a no-op
const gdLeft7 = makeGobletEl();
const gdRight7 = makeGobletEl();
const gdBus7 = new EventBus();
const choices7 = [];
new GobletDisplay(gdLeft7, gdRight7, s => choices7.push(s), gdBus7);
gdBus7.emit('goblets:described', { left: 'L', right: 'R' });
gdBus7.emit('phase:changed', { to: STATES.RIDDLE_PHASE });
gdLeft7._dispatch('click');
check('clicking goblet after phase:changed to non-GOBLET is a no-op', choices7.length === 0);

// ─────────────────────────────────────────────────────────────────────────────
// [4] MAIN.JS SMOKE TEST
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[4] main.js smoke test — DataLoader + GameEngine bootstrap');

// buildGameData returns valid gameData
check('buildGameData returns riddleDeck', typeof gameData.riddleDeck === 'object');
check('buildGameData returns createRiddleDeck factory', typeof gameData.createRiddleDeck === 'function');
check('buildGameData returns createAttributeDeck factory', typeof gameData.createAttributeDeck === 'function');
check('buildGameData returns conversations', typeof gameData.conversations === 'object');
check('buildGameData returns reactions', typeof gameData.reactions === 'object');

// GameEngine can be constructed with stub chatUI
let engineConstructed = false;
let engineError = null;
try {
  const testBus = new EventBus();
  const testEngine = new GameEngine(buildGameData(rawRiddles, rawAttributes, rawConversations), chatUI, testBus);
  engineConstructed = testEngine.state === STATES.IDLE;
} catch (e) {
  engineError = e.message;
}
check('GameEngine constructs successfully', engineConstructed, engineError ?? '');

// startGame() completes without throwing
let startCompleted = false;
let startError = null;
try {
  const testBus2 = new EventBus();
  const testEngine2 = new GameEngine(buildGameData(rawRiddles, rawAttributes, rawConversations), chatUI, testBus2);
  await testEngine2.startGame();
  startCompleted = testEngine2.state === STATES.RIDDLE_PHASE;
} catch (e) {
  startError = e.message;
}
check('GameEngine.startGame() completes, ends in RIDDLE_PHASE', startCompleted, startError ?? '');

// Full game cycle completes without throwing
let fullGameOk = false;
let fullGameError = null;
try {
  const testBus3 = new EventBus();
  const testEngine3 = new GameEngine(buildGameData(rawRiddles, rawAttributes, rawConversations), chatUI, testBus3);
  let gameOver = false;
  testBus3.on('game:won', () => { gameOver = true; });
  testBus3.on('game:lost', () => { gameOver = true; });
  await testEngine3.startGame();
  for (let i = 0; i < 3; i++) await testEngine3.answerRiddle('__wrong__');
  await testEngine3.chooseGoblet('left');
  if (!gameOver && testEngine3.state === STATES.RIDDLE_PHASE) {
    for (let i = 0; i < 3; i++) await testEngine3.answerRiddle('__wrong__');
    await testEngine3.chooseGoblet('left');
  }
  fullGameOk = gameOver;
} catch (e) {
  fullGameError = e.message;
}
check('Full game cycle (win or lose) completes without throwing', fullGameOk, fullGameError ?? '');

// Restart contract
let restartOk = false;
let restartError = null;
try {
  const testBus4 = new EventBus();
  const testEngine4 = new GameEngine(buildGameData(rawRiddles, rawAttributes, rawConversations), chatUI, testBus4);
  await testEngine4.startGame();
  for (let i = 0; i < 3; i++) await testEngine4.answerRiddle('__wrong__');
  await testEngine4.restart();
  restartOk = testEngine4.state === STATES.RIDDLE_PHASE && testEngine4.round === 1;
} catch (e) {
  restartError = e.message;
}
check('GameEngine.restart() resets to RIDDLE_PHASE round 1', restartOk, restartError ?? '');

// ─────────────────────────────────────────────────────────────────────────────
// [5] SPRINT 1+2 REGRESSION — key batch checks inline
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[5] Sprint 1+2 regression — batch simulation');

const sim = new GameSimulator(gameData);
const batch = sim.runBatch(500);
check('no crashes (completed 500 games)', batch.n === 500);
check('zero variant collisions', batch.variantCollisions === 0, `${batch.variantCollisions}`);
check('winRate ~75% (±10%)', Math.abs(batch.winRate - 0.75) < 0.10, `${(batch.winRate * 100).toFixed(1)}%`);
check('uniqueClueLines > 50', batch.uniqueClueLines > 50, `${batch.uniqueClueLines}`);
check('maxClueRepeatRate < 5%', batch.maxClueRepeatRate < 0.05, `${(batch.maxClueRepeatRate * 100).toFixed(2)}%`);

// Data integrity checks
check('≥100 riddles in data', rawRiddles.length >= 100, `found ${rawRiddles.length}`);
const answers = rawRiddles.map(r => r.answer.toLowerCase());
const dupAnswers = answers.filter((a, i) => answers.indexOf(a) !== i);
check('no duplicate riddle answers', dupAnswers.length === 0, dupAnswers.join(', '));
const categories = Object.entries(rawAttributes);
check('≥20 attribute categories', categories.length >= 20, `found ${categories.length}`);
check('all categories ≥8 variants', categories.every(([, vs]) => vs.length >= 8),
  categories.filter(([, vs]) => vs.length < 8).map(([k]) => k).join(', '));

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`UAT Sprint 3 — ${passed + failed} checks: ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log('\nFAILED:');
  failures.forEach(f => console.log(`  ✗ ${f}`));
  process.exit(1);
} else {
  console.log('ALL CHECKS PASSED — Sprint 3 accepted ✓');
}
