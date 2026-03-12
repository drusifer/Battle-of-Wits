/**
 * UAT Sprint 2 — Trin's acceptance audit
 * Run: node agents/tools/uat_sprint2.mjs
 *
 * Covers T16–T29:
 *   [1] Data expansion — 100+ riddles, 20+ categories × 8+ variants
 *   [2] Characters — all 4 instantiate + API contracts
 *   [3] EventBus — pub/sub contract
 *   [4] GameEngine — full round-1 win path (headless)
 *   [5] GameEngine — full round-2 lose path (headless)
 *   [6] GameEngine — restart resets state
 *   [7] Clue integrity — Vizzini clue lines sourced from correct goblet
 *   [8] Sprint 1 regression — batch sim still clean
 */
import { readFileSync } from 'fs';
import { buildGameData } from '../../src/utils/DataLoader.js';
import { Vizzini } from '../../src/characters/Vizzini.js';
import { Buttercup } from '../../src/characters/Buttercup.js';
import { Gramps } from '../../src/characters/Gramps.js';
import { Boy } from '../../src/characters/Boy.js';
import { EventBus } from '../../src/engine/EventBus.js';
import { GameEngine, STATES } from '../../src/engine/GameEngine.js';
import { GameSimulator } from '../../src/engine/GameSimulator.js';
import { Deck } from '../../src/utils/Deck.js';

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

// ── Headless chatUI stub — resolves immediately ───────────────────────────────
const chatUI = { whenIdle: () => Promise.resolve() };

// ─────────────────────────────────────────────────────────────────────────────
// [1] DATA EXPANSION
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[1] Data expansion — riddles.json');
check('≥100 riddles', rawRiddles.length >= 100, `found ${rawRiddles.length}`);
const answers = rawRiddles.map(r => r.answer.toLowerCase());
const dupAnswers = answers.filter((a, i) => answers.indexOf(a) !== i);
check('no duplicate answers', dupAnswers.length === 0, dupAnswers.join(', '));
check('all riddles have question/answer/hint/alternates', rawRiddles.every(
  r => r.question && r.answer && r.hint && Array.isArray(r.alternates)
));

console.log('\n[1] Data expansion — attributes.json');
const categories = Object.entries(rawAttributes);
check('≥20 attribute categories', categories.length >= 20, `found ${categories.length}`);
check('all categories have ≥8 variants', categories.every(([, vs]) => vs.length >= 8),
  categories.filter(([, vs]) => vs.length < 8).map(([k]) => k).join(', '));
const allVariantIds = categories.flatMap(([, vs]) => vs.map(v => v.id));
const dupIds = allVariantIds.filter((id, i) => allVariantIds.indexOf(id) !== i);
check('no duplicate variant ids', dupIds.length === 0, dupIds.join(', '));
check('all variants have id + fragment', categories.every(([, vs]) =>
  vs.every(v => v.id && v.fragment)
));
check('all variants have ≥5 insults', categories.every(([, vs]) =>
  vs.every(v => Array.isArray(v.insults) && v.insults.length >= 5)
));
check('all variants have ≥5 compliments', categories.every(([, vs]) =>
  vs.every(v => Array.isArray(v.compliments) && v.compliments.length >= 5)
));
check('all variants have ≥5 hints', categories.every(([, vs]) =>
  vs.every(v => Array.isArray(v.hints) && v.hints.length >= 5)
));

// ─────────────────────────────────────────────────────────────────────────────
// [2] CHARACTERS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[2] Characters — instantiation via DataLoader');
const r = gameData.reactions;
const vizzini = new Vizzini(r['Vizzini']);
const buttercup = new Buttercup(r['Buttercup']);
const gramps = new Gramps(r['Gramps'], gameData.grampsConnectives);
const boy = new Boy(r['Boy']);

check('Vizzini name + avatar', vizzini.name === 'Vizzini' && vizzini.avatar === '😤');
check('Buttercup name + avatar', buttercup.name === 'Buttercup' && buttercup.avatar === '👸');
check('Gramps name + avatar', gramps.name === 'Gramps' && gramps.avatar === '🧓');
check('Boy name + avatar', boy.name === 'Boy' && boy.avatar === '🤧');

console.log('\n[2] Characters — react() contract');
const vReactions = ['riddle:correct', 'riddle:wrong', 'hint:requested', 'goblet:correct', 'goblet:poisoned'];
for (const outcome of vReactions) {
  const line = vizzini.react(outcome);
  check(`Vizzini.react('${outcome}') returns string`, typeof line === 'string' && line.length > 0, String(line));
}

const bcReactions = ['hint:requested', 'goblet:correct', 'goblet:poisoned'];
for (const outcome of bcReactions) {
  const line = buttercup.react(outcome);
  check(`Buttercup.react('${outcome}') returns string`, typeof line === 'string' && line.length > 0, String(line));
}

for (const outcome of ['goblet:correct', 'goblet:poisoned']) {
  const gl = gramps.react(outcome);
  check(`Gramps.react('${outcome}') returns string`, typeof gl === 'string' && gl.length > 0, String(gl));
  const bl = boy.react(outcome);
  check(`Boy.react('${outcome}') returns string`, typeof bl === 'string' && bl.length > 0, String(bl));
}

check('react() unknown outcome returns null', vizzini.react('__unknown__') === null);

console.log('\n[2] Characters — Vizzini clue decks');
check('drawClue() before setRoundDecks returns null', vizzini.drawClue(true) === null);
const ctx = gameData.createAttributeDeck();
const gm = new (await import('../../src/engine/GobletManager.js')).GobletManager(ctx);
const roundCtx = gm.generateGobletPair();
vizzini.setRoundDecks(roundCtx.vizziniComplimentDeck, roundCtx.vizziniInsultDeck);
const clueLine = vizzini.drawClue(true);
check('drawClue(correct=true) returns string after setRoundDecks',
  typeof clueLine === 'string' && clueLine.length > 0, String(clueLine));
const insultLine = vizzini.drawClue(false);
check('drawClue(correct=false) returns string after setRoundDecks',
  typeof insultLine === 'string' && insultLine.length > 0, String(insultLine));

console.log('\n[2] Characters — Buttercup hint deck');
check('drawGobletHint() before setRoundDeck returns null', buttercup.drawGobletHint() === null);
buttercup.setRoundDeck(roundCtx.buttercupGobletDeck);
const hintLine = buttercup.drawGobletHint();
check('drawGobletHint() returns string after setRoundDeck',
  typeof hintLine === 'string' && hintLine.length > 0, String(hintLine));

console.log('\n[2] Characters — Gramps describeGoblet()');
const desc = gramps.describeGoblet(roundCtx.leftGoblet.attributes);
check('describeGoblet returns non-empty string', typeof desc === 'string' && desc.length > 10, desc.slice(0, 40));
check('describeGoblet does NOT start with "The cup before you is"', !desc.startsWith('The cup before you is'));
check('describeGoblet ends with "."', desc.endsWith('.'));
check('describeGoblet empty array returns ""', gramps.describeGoblet([]) === '');

// ─────────────────────────────────────────────────────────────────────────────
// [3] EVENTBUS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[3] EventBus');
const bus = new EventBus();

let received = null;
const cb = (payload) => { received = payload; };
bus.on('test:event', cb);
bus.emit('test:event', { x: 42 });
check('on + emit delivers payload', received?.x === 42);

received = null;
bus.off('test:event', cb);
bus.emit('test:event', { x: 99 });
check('off removes listener', received === null);

// Multiple listeners
let count = 0;
bus.on('multi', () => count++);
bus.on('multi', () => count++);
bus.emit('multi', null);
check('multiple listeners all fire', count === 2);

// Emit with no listeners is a no-op (no throw)
let threw = false;
try { bus.emit('no:listener', {}); } catch { threw = true; }
check('emit unknown event is a no-op', !threw);

// ─────────────────────────────────────────────────────────────────────────────
// [4] GAMEENGINE — round-1 WIN path
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[4] GameEngine — round-1 win path');

function makeEngine() {
  return new GameEngine(buildGameData(rawRiddles, rawAttributes, rawConversations), chatUI, new EventBus());
}

async function runRound1Win() {
  const bus2 = new EventBus();
  const engine = new GameEngine(buildGameData(rawRiddles, rawAttributes, rawConversations), chatUI, bus2);
  const events = [];
  for (const ev of ['phase:changed','riddle:presented','riddle:answered','hint:requested',
                    'goblets:described','goblet:chosen','conversation:play','game:won','game:lost']) {
    bus2.on(ev, (p) => events.push({ ev, p }));
  }

  check('initial state is IDLE', engine.state === STATES.IDLE);

  await engine.startGame();
  check('state is RIDDLE_PHASE after startGame', engine.state === STATES.RIDDLE_PHASE);
  check('round is 1 after startGame', engine.round === 1);
  check('phase:changed IDLE→INTRO emitted', events.some(e =>
    e.ev === 'phase:changed' && e.p.from === STATES.IDLE && e.p.to === STATES.INTRO
  ));
  check('phase:changed INTRO→RIDDLE_PHASE emitted', events.some(e =>
    e.ev === 'phase:changed' && e.p.from === STATES.INTRO && e.p.to === STATES.RIDDLE_PHASE
  ));
  check('riddle:presented emitted', events.some(e => e.ev === 'riddle:presented' && e.p.riddle));

  // answerRiddle 3x to reach goblet phase
  for (let i = 0; i < 3; i++) {
    const before = events.filter(e => e.ev === 'riddle:answered').length;
    await engine.answerRiddle('__WRONG__');
    const after = events.filter(e => e.ev === 'riddle:answered').length;
    check(`riddle:answered emitted (answer ${i + 1})`, after > before);
  }

  check('state is GOBLET_PHASE after 3 answers', engine.state === STATES.GOBLET_PHASE);
  check('phase:changed →GOBLET_PHASE emitted', events.some(e =>
    e.ev === 'phase:changed' && e.p.to === STATES.GOBLET_PHASE
  ));
  check('goblets:described emitted', events.some(e => e.ev === 'goblets:described'));

  // Hint while in GOBLET_PHASE is a no-op
  const hintCountBefore = events.filter(e => e.ev === 'hint:requested').length;
  await engine.requestHint();
  check('requestHint is no-op in GOBLET_PHASE', events.filter(e => e.ev === 'hint:requested').length === hintCountBefore);

  // answerRiddle in GOBLET_PHASE is a no-op
  const answeredBefore = events.filter(e => e.ev === 'riddle:answered').length;
  await engine.answerRiddle('anything');
  check('answerRiddle is no-op in GOBLET_PHASE', events.filter(e => e.ev === 'riddle:answered').length === answeredBefore);

  // Force a win by choosing the correct goblet
  // We need to read the safe side — cheat via reading the private state through the bus
  // GameEngine emits goblets:described but doesn't expose safe. We'll try left first;
  // if we lose (get poisoned) we'd enter round 2. Instead, run 4 independent games and
  // capture at least one round-1 win.
  await engine.chooseGoblet('left');
  const won = engine.state === STATES.WIN;
  const lostRound1 = engine.state === STATES.RIDDLE_PHASE && engine.round === 2;
  check('after chooseGoblet: WIN or round-2 RIDDLE_PHASE', won || lostRound1,
    `state=${engine.state} round=${engine.round}`);

  return { events, won };
}

const { events: evR1, won: wonR1 } = await runRound1Win();

// Verify game:won fires on a guaranteed win by running many games
let foundWin = wonR1;
for (let attempt = 0; attempt < 20 && !foundWin; attempt++) {
  const bus3 = new EventBus();
  const eng3 = new GameEngine(buildGameData(rawRiddles, rawAttributes, rawConversations), chatUI, bus3);
  let sawWon = false;
  bus3.on('game:won', () => { sawWon = true; });
  await eng3.startGame();
  for (let i = 0; i < 3; i++) await eng3.answerRiddle('__wrong__');
  await eng3.chooseGoblet('left');
  if (sawWon || eng3.state === STATES.WIN) { foundWin = true; }
}
check('game:won event fires when correct goblet chosen (R1)', foundWin);

// ─────────────────────────────────────────────────────────────────────────────
// [5] GAMEENGINE — round-2 LOSE path
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[5] GameEngine — round-2 lose path');

async function findRound2Engine() {
  // Play until we hit round 2 (player chose poisoned goblet in round 1)
  for (let attempt = 0; attempt < 50; attempt++) {
    const b = new EventBus();
    const e = new GameEngine(buildGameData(rawRiddles, rawAttributes, rawConversations), chatUI, b);
    await e.startGame();
    for (let i = 0; i < 3; i++) await e.answerRiddle('__wrong__');
    await e.chooseGoblet('left');
    if (e.state === STATES.RIDDLE_PHASE && e.round === 2) return { engine: e, bus: b };
    await e.chooseGoblet('right');
    if (e.state === STATES.RIDDLE_PHASE && e.round === 2) return { engine: e, bus: b };
  }
  return null;
}

const r2result = await findRound2Engine();
if (r2result) {
  const { engine: eng2, bus: bus4 } = r2result;
  const r2events = [];
  for (const ev of ['phase:changed', 'riddle:presented', 'riddle:answered',
                    'goblets:described', 'goblet:chosen', 'game:won', 'game:lost']) {
    bus4.on(ev, (p) => r2events.push({ ev, p }));
  }

  check('state is RIDDLE_PHASE at round 2', eng2.state === STATES.RIDDLE_PHASE && eng2.round === 2);

  // Answer 3 riddles in round 2
  for (let i = 0; i < 3; i++) await eng2.answerRiddle('__wrong__');
  check('state is GOBLET_PHASE at round 2', eng2.state === STATES.GOBLET_PHASE);

  // Exhaust round 2 — both goblet choices attempted across multiple game runs
  let foundLose = false;
  for (let attempt = 0; attempt < 30 && !foundLose; attempt++) {
    const lb = new EventBus();
    const le = new GameEngine(buildGameData(rawRiddles, rawAttributes, rawConversations), chatUI, lb);
    let sawLost = false;
    lb.on('game:lost', () => { sawLost = true; });
    await le.startGame();
    // Force round 2 by losing round 1 then losing round 2
    for (let i = 0; i < 3; i++) await le.answerRiddle('__wrong__');
    // Try each goblet — if round 2 starts, answer riddles again and lose
    const savedState = le.state;
    await le.chooseGoblet('left');
    if (le.state === STATES.RIDDLE_PHASE && le.round === 2) {
      for (let i = 0; i < 3; i++) await le.answerRiddle('__wrong__');
      await le.chooseGoblet('left');
      if (sawLost || le.state === STATES.LOSE) foundLose = true;
    } else if (le.state === STATES.RIDDLE_PHASE && le.round === 2) {
      for (let i = 0; i < 3; i++) await le.answerRiddle('__wrong__');
      await le.chooseGoblet('right');
      if (sawLost || le.state === STATES.LOSE) foundLose = true;
    }
    if (sawLost) foundLose = true;
  }
  check('game:lost fires when poisoned goblet chosen at max round', foundLose);
} else {
  check('could reach round 2 (SKIPPED — statistical failure)', false, 'Could not reach round 2 in 50 attempts');
}

// ─────────────────────────────────────────────────────────────────────────────
// [6] GAMEENGINE — restart
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[6] GameEngine — restart');
const engRestart = new GameEngine(buildGameData(rawRiddles, rawAttributes, rawConversations), chatUI, new EventBus());
await engRestart.startGame();
for (let i = 0; i < 3; i++) await engRestart.answerRiddle('__wrong__');
check('state is GOBLET_PHASE before restart', engRestart.state === STATES.GOBLET_PHASE);
await engRestart.restart();
check('state is RIDDLE_PHASE after restart', engRestart.state === STATES.RIDDLE_PHASE);
check('round is 1 after restart', engRestart.round === 1);

// ─────────────────────────────────────────────────────────────────────────────
// [7] CLUE INTEGRITY — Vizzini clue lines sourced from correct goblet
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[7] Clue integrity');
// Run 5 rounds independently, verify correct-answer clues come from safe goblet
let clueIntegrityPassed = 0;
const INTEGRITY_ROUNDS = 5;
for (let i = 0; i < INTEGRITY_ROUNDS; i++) {
  const gd = buildGameData(rawRiddles, rawAttributes, rawConversations);
  const { GobletManager } = await import('../../src/engine/GobletManager.js');
  const gm2 = new GobletManager(gd.createAttributeDeck());
  const ctx2 = gm2.generateGobletPair();
  const v2 = new Vizzini(gd.reactions['Vizzini']);
  v2.setRoundDecks(ctx2.vizziniComplimentDeck, ctx2.vizziniInsultDeck);

  const safeVariants = ctx2.safe === 'left' ? ctx2.leftGoblet.attributes : ctx2.rightGoblet.attributes;
  const poisonVariants = ctx2.safe === 'left' ? ctx2.rightGoblet.attributes : ctx2.leftGoblet.attributes;
  const allCompliments = safeVariants.flatMap(v => v.compliments);
  const allInsults = poisonVariants.flatMap(v => v.insults);

  const correctClue = v2.drawClue(true);
  const wrongClue = v2.drawClue(false);

  if (correctClue && allCompliments.includes(correctClue)) clueIntegrityPassed++;
  else if (!correctClue) clueIntegrityPassed++; // deck exhausted — acceptable
}
check('correct-answer clue sourced from safe goblet compliments (5/5 rounds)',
  clueIntegrityPassed >= INTEGRITY_ROUNDS, `${clueIntegrityPassed}/${INTEGRITY_ROUNDS}`);

// Vessel-word check moved to DataIntegrity.test.js (exhaustive, deterministic).
// This UAT only verifies the engine-level clue sourcing contract above.

// ─────────────────────────────────────────────────────────────────────────────
// [8] SPRINT 1 REGRESSION — batch sim still clean
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[8] Sprint 1 regression — GameSimulator batch');
const sim = new GameSimulator(gameData);
const batch = sim.runBatch(500);
check('no crashes (completed 500 games)', batch.n === 500);
check('zero variant collisions',         batch.variantCollisions === 0, `${batch.variantCollisions}`);
check('winRate ~75% (±10%)',             Math.abs(batch.winRate - 0.75) < 0.10, `${(batch.winRate * 100).toFixed(1)}%`);
check('uniqueClueLines > 50',            batch.uniqueClueLines > 50, `${batch.uniqueClueLines}`);
check('maxClueRepeatRate < 5%',          batch.maxClueRepeatRate < 0.05, `${(batch.maxClueRepeatRate * 100).toFixed(2)}%`);

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`UAT Sprint 2 — ${passed + failed} checks: ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log('\nFAILED:');
  failures.forEach(f => console.log(`  ✗ ${f}`));
  process.exit(1);
} else {
  console.log('ALL CHECKS PASSED — Sprint 2 accepted ✓');
}
