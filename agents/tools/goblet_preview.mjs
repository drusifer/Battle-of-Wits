/**
 * goblet_preview — generate sample goblet description paragraphs for human eval.
 *
 * Usage:
 *   node agents/tools/goblet_preview.mjs [count]
 *   make goblet-preview
 *   make goblet-preview COUNT=20
 *
 * Prints COUNT goblet pairs (left + right) assembled via the real Gramps /
 * GobletManager / DataLoader pipeline — the same code the game uses.
 */

import { readFileSync } from 'fs';
import { buildGameData } from '../../src/utils/DataLoader.js';
import { GobletManager } from '../../src/engine/GobletManager.js';
import { Gramps } from '../../src/characters/Gramps.js';

const COUNT = parseInt(process.argv[2] ?? '10', 10);

const rawRiddles = JSON.parse(readFileSync('data/riddles.json', 'utf8'));
const rawAttributes = JSON.parse(readFileSync('data/attributes.json', 'utf8'));
const rawConversations = JSON.parse(readFileSync('data/conversations.json', 'utf8'));

const gameData = buildGameData(rawRiddles, rawAttributes, rawConversations);

// Gramps needs reaction decks — use empty object; we only call describeGoblet()
const gramps = new Gramps({}, gameData.grampsConnectives);

console.log(`Generating ${COUNT} goblet pair(s)...\n`);
console.log('─'.repeat(60));

for (let i = 1; i <= COUNT; i++) {
  // Fresh AttributeDeck per pair so inner decks are not exhausted across pairs
  const manager = new GobletManager(gameData.createAttributeDeck());
  const { leftGoblet, rightGoblet } = manager.generateGobletPair();

  const left = gramps.describeGoblet(leftGoblet.attributes);
  const right = gramps.describeGoblet(rightGoblet.attributes);

  console.log(`Pair ${i}`);
  console.log(`  Left:  ${left}`);
  console.log(`  Right: ${right}`);
  console.log('─'.repeat(60));
}
