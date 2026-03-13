import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { buildGameData } from '../src/utils/DataLoader.js';
import { GameSimulator } from '../src/engine/GameSimulator.js';
import { GameEngine } from '../src/engine/GameEngine.js';
import { EventBus } from '../src/engine/EventBus.js';

const runs = process.argv[2] ? parseInt(process.argv[2], 10) : 1000;

const rawRiddles       = JSON.parse(readFileSync('data/riddles.json', 'utf8'));
const rawAttributes    = JSON.parse(readFileSync('data/attributes.json', 'utf8'));
const rawConversations = JSON.parse(readFileSync('data/conversations.json', 'utf8'));
const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);

const sim = new GameSimulator(gameData);
const batch = sim.runBatch(runs);

console.log(`--- Simulation Results (${runs} games) ---`);
console.log(`Win Rate: ${(batch.winRate * 100).toFixed(2)}%`);
console.log(`Average Rounds to Win: ${batch.avgRounds.toFixed(2)}`);
console.log(`Variant Collisions: ${batch.variantCollisions}`);
console.log(`Unique Clue Lines Shown: ${batch.uniqueClueLines}`);
console.log(`Max Clue Repeat Rate: ${(batch.maxClueRepeatRate * 100).toFixed(2)}%`);

// --- Run a tracked narrative game for dialogue preview ---
console.log('\n--- Generating narrative preview (build/sim_output.txt) ---');

let logContent = "--- BATTLE OF WITS SIMULATED RUN ---\n\n";
const log = (msg) => { logContent += msg + '\n'; };

const bus = new EventBus();

bus.on('conversation:play', (lines) => {
  if (!lines || !Array.isArray(lines)) return;
  lines.forEach(l => {
    if (l) log(`[${l.char}] ${l.line}`);
  });
});

bus.on('riddle:presented', (r) => {
  log(`\n[Vizzini (Riddle)] ${r.question}`);
});

bus.on('riddle:answered', (r) => {
  log(`[DPR (Answer)] ${r.answer}`);
  if (r.reactionLine) log(`[Vizzini (Reaction)] ${r.reactionLine}`);
});

bus.on('hint:requested', (h) => {
  log(`[DPR] *Requests hint*`);
  if (h.hintLine) log(`[Buttercup] ${h.hintLine}`);
  if (h.vizziniClue) log(`[Vizzini (Clue)] ${h.vizziniClue}`);
});

bus.on('goblets:described', (d) => {
  log(`\n[Gramps (Narration)] The goblet on the left... ${d.leftDesc}`);
  log(`[Gramps (Narration)] The goblet on the right... ${d.rightDesc}`);
});

bus.on('goblet:chosen', (c) => {
  log(`\n[DPR] *Chooses ${c.choice} goblet*`);
  if (c.reactionLines) {
    c.reactionLines.forEach(l => log(`[${l.char}] ${l.line}`));
  }
});

bus.on('game:won', () => { log(`\n--- GAME WON ---`); });
bus.on('game:lost', () => { log(`\n--- GAME LOST ---`); });

const mockChatUI = {
  whenIdle: () => Promise.resolve(),
  clear: () => {},
  render: () => {},
  showTyping: () => {},
  hideTyping: () => {}
};

const engine = new GameEngine(gameData, mockChatUI, bus);

// Simulate playing the game automatically
async function autoPlay() {
  await engine.startGame();
  
  while (engine.state === 'RIDDLE_PHASE') {
    await engine.answerRiddle(engine.currentRiddle.answer);
    await engine.requestRiddleHint(); // Always ask for hint to see dialogue
  }
  
  if (engine.state === 'GOBLET_PHASE') {
    await engine.chooseGoblet('left');
  }

  // If lost round 1, play round 2
  if (engine.state === 'RIDDLE_PHASE') {
    while (engine.state === 'RIDDLE_PHASE') {
      await engine.answerRiddle(engine.currentRiddle.answer);
      await engine.requestRiddleHint();
    }
    if (engine.state === 'GOBLET_PHASE') {
      await engine.chooseGoblet('left');
    }
  }

  writeFileSync('build/sim_output.txt', logContent);
  console.log('Saved narrative preview to build/sim_output.txt');
}

autoPlay();
