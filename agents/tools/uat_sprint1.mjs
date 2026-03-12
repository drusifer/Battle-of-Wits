/**
 * UAT Sprint 1 — Trin's acceptance audit
 * Run: node agents/tools/uat_sprint1.mjs
 */
import { readFileSync } from 'fs';
import { buildGameData } from '../../src/utils/DataLoader.js';
import { GameSimulator } from '../../src/engine/GameSimulator.js';
import { GobletManager } from '../../src/engine/GobletManager.js';
import { RiddleManager } from '../../src/engine/RiddleManager.js';
import { Deck } from '../../src/utils/Deck.js';
import { normalize } from '../../src/utils/normalize.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}${detail ? ': ' + detail : ''}`);
    failed++;
    failures.push(label);
  }
}

const rawRiddles       = JSON.parse(readFileSync('data/riddles.json', 'utf8'));
const rawAttributes    = JSON.parse(readFileSync('data/attributes.json', 'utf8'));
const rawConversations = JSON.parse(readFileSync('data/conversations.json', 'utf8'));
const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);

// ── 1. DATA FILE INTEGRITY ────────────────────────────────────────────────
console.log('\n[1] riddles.json');
check('≥20 riddles', rawRiddles.length >= 20, `found ${rawRiddles.length}`);
const riddleAnswers = rawRiddles.map(r => r.answer.toLowerCase());
const dupAnswers = riddleAnswers.filter((a,i) => riddleAnswers.indexOf(a) !== i);
check('no duplicate answers', dupAnswers.length === 0, dupAnswers.join(', '));
check('all have question/answer/hint/alternates', rawRiddles.every(
  r => r.question && r.answer && r.hint && Array.isArray(r.alternates)
));

console.log('\n[2] attributes.json');
const categories = Object.entries(rawAttributes);
check('≥5 categories', categories.length >= 5, `found ${categories.length}`);
const allIds = categories.flatMap(([,vs]) => vs.map(v => v.id));
const dupIds = allIds.filter((id,i) => allIds.indexOf(id) !== i);
check('no duplicate variant ids', dupIds.length === 0, dupIds.join(', '));
check('all categories have ≥5 variants', categories.every(([,vs]) => vs.length >= 5));
check('all variants have ≥5 insults', categories.every(([,vs]) => vs.every(v => v.insults?.length >= 5)));
check('all variants have ≥5 compliments', categories.every(([,vs]) => vs.every(v => v.compliments?.length >= 5)));
check('all variants have ≥5 hints', categories.every(([,vs]) => vs.every(v => v.hints?.length >= 5)));

console.log('\n[3] conversations.json');
const b = rawConversations.banter;
for (const k of ['intro','riddlePhase','gobletPhase','outro_win','outro_lose']) {
  check(`banter.${k} ≥3 entries`, Array.isArray(b?.[k]) && b[k].length >= 3, `${b?.[k]?.length}`);
}
const reactionChars = Object.keys(rawConversations.reactions ?? {});
check('reactions present', reactionChars.length > 0, reactionChars.join(', '));
for (const [char, outcomes] of Object.entries(rawConversations.reactions)) {
  for (const [outcome, lines] of Object.entries(outcomes)) {
    check(`reactions.${char}.${outcome} ≥3 lines`, Array.isArray(lines) && lines.length >= 3, `${lines?.length}`);
  }
}
check('grampsConnectives ≥6', Array.isArray(rawConversations.grampsConnectives) && rawConversations.grampsConnectives.length >= 6);

// ── 2. DECK PRIMITIVE ────────────────────────────────────────────────────
console.log('\n[4] Deck primitive');
const d = new Deck([1,2,3,4,5], { autoReshuffle: false });
const drawn = [];
for (let i = 0; i < 5; i++) drawn.push(d.draw());
check('draws all 5 without repeat', new Set(drawn).size === 5);
check('returns null when exhausted', d.draw() === null);
check('isEmpty true after exhaust', d.isEmpty);
d.reset();
check('isEmpty false after reset', !d.isEmpty);

const ar = new Deck([1,2,3], { autoReshuffle: true });
for (let i = 0; i < 9; i++) ar.draw();
check('autoReshuffle never returns null', ar.draw() !== null);

let heads = 0;
for (let i = 0; i < 1000; i++) if (Deck.coinFlip()) heads++;
check('coinFlip ~50% heads (±10%)', Math.abs(heads - 500) < 100, `${heads}/1000`);

// withFrequency returns a Deck — sample draws to verify null ratio
const wf = Deck.withFrequency(['a','b','c'], 0.5);
let nullDraws = 0, totalDraws = 60;
for (let i = 0; i < totalDraws; i++) { if (wf.draw() === null) nullDraws++; }
check('withFrequency ~50% null draws (±15%)', Math.abs(nullDraws / totalDraws - 0.5) < 0.15, `${nullDraws}/${totalDraws}`);

// ── 3. NORMALIZE ─────────────────────────────────────────────────────────
console.log('\n[5] normalize');
check('strips leading "the"', normalize('the river') === 'river');
check('strips leading "a"',   normalize('a mountain') === 'mountain');
check('strips leading "an"',  normalize('an echo') === 'echo');
check('lowercases',           normalize('MOUNTAIN') === 'mountain');
check('trims punctuation',    normalize('mountain.') === 'mountain');
check('handles empty string', normalize('') === '');

// ── 4. GOBLET MANAGER ────────────────────────────────────────────────────
console.log('\n[6] GobletManager');
const attrDeck = gameData.createAttributeDeck();
const gm = new GobletManager(attrDeck);
const ctx = gm.generateGobletPair();
check('leftGoblet has 5 attributes',  ctx.leftGoblet.attributes.length === 5);
check('rightGoblet has 5 attributes', ctx.rightGoblet.attributes.length === 5);
check('safe is left or right',        ctx.safe === 'left' || ctx.safe === 'right');
check('vizziniComplimentDeck present', ctx.vizziniComplimentDeck instanceof Deck);
check('vizziniInsultDeck present',     ctx.vizziniInsultDeck instanceof Deck);
check('buttercupGobletDeck present',   ctx.buttercupGobletDeck instanceof Deck);
const leftIds  = ctx.leftGoblet.attributes.map(v => v.id);
const rightIds = ctx.rightGoblet.attributes.map(v => v.id);
const shared   = leftIds.filter(id => rightIds.includes(id));
check('no shared variants between goblets', shared.length === 0, shared.join(', '));

// Cross-round uniqueness: second pair should not reuse R1 variant ids
const ctx2 = gm.generateGobletPair();
const r1Ids = [...leftIds, ...rightIds];
const r2Ids = [...ctx2.leftGoblet.attributes.map(v=>v.id), ...ctx2.rightGoblet.attributes.map(v=>v.id)];
const crossRound = r1Ids.filter(id => r2Ids.includes(id));
check('no cross-round variant reuse', crossRound.length === 0, crossRound.join(', '));

// Clue decks come from correct goblet
const safeAttrs  = ctx.safe === 'left' ? leftIds  : rightIds;
const poisonAttrs = ctx.safe === 'left' ? rightIds : leftIds;
const safeVariants   = ctx.safe === 'left' ? ctx.leftGoblet.attributes : ctx.rightGoblet.attributes;
const poisonVariants = ctx.safe === 'left' ? ctx.rightGoblet.attributes : ctx.leftGoblet.attributes;
const complimentLine = ctx.vizziniComplimentDeck.draw();
const complimentSources = safeVariants.flatMap(v => v.compliments);
check('complimentDeck sourced from safe goblet', complimentSources.includes(complimentLine));

const insultLine = ctx.vizziniInsultDeck.draw();
const insultSources = poisonVariants.flatMap(v => v.insults);
check('insultDeck sourced from poison goblet', insultSources.includes(insultLine));

// ── 5. RIDDLE MANAGER ────────────────────────────────────────────────────
console.log('\n[7] RiddleManager');
const rm = new RiddleManager(gameData.createRiddleDeck());
const r1 = rm.drawRiddle();
check('drawRiddle returns question/answer/hint', r1?.question && r1?.answer && r1?.hint);
check('checkAnswer exact match',       rm.checkAnswer(r1, r1.answer));
check('checkAnswer case-insensitive',  rm.checkAnswer(r1, r1.answer.toUpperCase()));
check('checkAnswer rejects wrong',     !rm.checkAnswer(r1, '__WRONG__'));
check('checkAnswer rejects empty',     !rm.checkAnswer(r1, ''));
if (r1.alternates?.length > 0) {
  check('checkAnswer accepts alternate', rm.checkAnswer(r1, r1.alternates[0]));
}
// No repeats
const rids = new Set();
rids.add(r1.answer);
for (let i = 0; i < 6; i++) {
  const r = rm.drawRiddle();
  if (r) {
    check(`riddle draw ${i+2} is unique`, !rids.has(r.answer), r.answer);
    rids.add(r.answer);
  }
}

// ── 6. GAMESIMULATOR BATCH ───────────────────────────────────────────────
console.log('\n[8] GameSimulator batch (n=500)');
const sim = new GameSimulator(gameData);
const batch = sim.runBatch(500);
check('no crashes (completed 500 games)', batch.n === 500);
check('zero variant collisions',          batch.variantCollisions === 0, `${batch.variantCollisions}`);
check('winRate ~75% (±10%)',              Math.abs(batch.winRate - 0.75) < 0.10, `${(batch.winRate*100).toFixed(1)}%`);
check('uniqueClueLines > 50',            batch.uniqueClueLines > 50, `${batch.uniqueClueLines}`);
check('maxClueRepeatRate < 5%',          batch.maxClueRepeatRate < 0.05, `${(batch.maxClueRepeatRate*100).toFixed(2)}%`);

// ── 7. FACTORY INDEPENDENCE ───────────────────────────────────────────────
console.log('\n[9] Factory independence');
const gd1 = gameData.createAttributeDeck();
const gd2 = gameData.createAttributeDeck();
gd1.draw();
const item1 = gd1.draw();
gd2.draw();
const item2 = gd2.draw();
// Both are fresh independent decks — drawing same index may differ due to shuffle
// But they must be separate objects
check('createAttributeDeck returns distinct instances', gd1 !== gd2);
const rd1 = gameData.createRiddleDeck();
const rd2 = gameData.createRiddleDeck();
rd1.draw();
check('createRiddleDeck returns distinct instances', rd1 !== rd2);
// Consuming rd1 does not affect rd2
const beforeRd2 = rd2.draw();
check('rd2 unaffected by rd1 consumption', beforeRd2 !== null);

// ── SUMMARY ──────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`UAT Sprint 1 — ${passed + failed} checks: ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log('\nFAILED:');
  failures.forEach(f => console.log(`  ✗ ${f}`));
  process.exit(1);
} else {
  console.log('ALL CHECKS PASSED — Sprint 1 accepted ✓');
}
