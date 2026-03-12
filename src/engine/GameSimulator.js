import { Deck } from '../utils/Deck.js';
import { GobletManager } from './GobletManager.js';
import { RiddleManager } from './RiddleManager.js';

const RIDDLES_PER_ROUND = 3;
const MAX_ROUNDS = 2;

/**
 * GameSimulator — headless game runner for deck quality measurement.
 *
 * No UI, no delays, no characters. Runs complete games at speed to verify:
 * - Game logic correctness
 * - Deck variety and uniqueness
 * - Win-rate distribution (~75% at random play — player gets 2 chances)
 *
 * Usage:
 *   const sim = new GameSimulator(gameData);
 *   const batch = sim.runBatch(1000);
 *   console.log(batch.winRate, batch.variantCollisions);
 */
export class GameSimulator {
  #gameData;

  constructor(gameData) {
    this.#gameData = gameData;
  }

  /**
   * Run a single complete game.
   * Player makes random decisions (50/50) to measure baseline distribution.
   *
   * @returns {GameResult}
   */
  runGame() {
    const gobletMgr = new GobletManager(this.#gameData.createAttributeDeck());
    const riddleMgr = new RiddleManager(this.#gameData.createRiddleDeck());
    const allVariantIds = [];
    const clueLines = [];

    for (let round = 1; round <= MAX_ROUNDS; round++) {
      const ctx = gobletMgr.generateGobletPair();
      allVariantIds.push(...this.#collectVariantIds(ctx));
      clueLines.push(...this.#runRiddlePhase(ctx, riddleMgr));

      const playerChoice = Deck.coinFlip() ? 'left' : 'right';
      const choseCorrectly = playerChoice === ctx.safe;
      if (choseCorrectly) return { won: true, rounds: round, clueLines, allVariantIds };
    }

    return { won: false, rounds: MAX_ROUNDS, clueLines, allVariantIds };
  }

  /** Draw clue lines for one riddle phase. Returns array of non-null lines drawn. */
  #runRiddlePhase(ctx, riddleMgr) {
    const lines = [];
    for (let i = 0; i < RIDDLES_PER_ROUND; i++) {
      if (!riddleMgr.drawRiddle()) break;
      const deck = Deck.coinFlip() ? ctx.vizziniComplimentDeck : ctx.vizziniInsultDeck;
      const line = deck.draw();
      if (line) lines.push(line);
    }
    return lines;
  }

  /** Extract all attribute variant IDs from both goblets in a round context. */
  #collectVariantIds(ctx) {
    return [
      ...ctx.leftGoblet.attributes.map(v => v.id),
      ...ctx.rightGoblet.attributes.map(v => v.id),
    ];
  }

  /**
   * Run n games and return aggregate quality metrics.
   *
   * @param {number} n
   * @returns {BatchResult}
   */
  runBatch(n) {
    const acc = { wins: 0, totalRounds: 0, variantCollisions: 0, clueLineFrequency: {} };

    for (let i = 0; i < n; i++) {
      const result = this.runGame();
      if (result.won) acc.wins++;
      acc.totalRounds += result.rounds;
      acc.variantCollisions += this.#countCollisions(result.allVariantIds);
      this.#tallyClueLines(result.clueLines, acc.clueLineFrequency);
    }

    return this.#buildBatchResult(n, acc);
  }

  /** Count duplicate ids in a list (variant collision detection). */
  #countCollisions(ids) {
    const seen = new Set();
    let count = 0;
    for (const id of ids) {
      if (seen.has(id)) count++;
      seen.add(id);
    }
    return count;
  }

  /** Accumulate clue line draw counts into a frequency map. */
  #tallyClueLines(lines, freq) {
    for (const line of lines) {
      // eslint-disable-next-line security/detect-object-injection
      freq[line] = (freq[line] ?? 0) + 1;
    }
  }

  /** Compute final batch metrics from raw accumulators. */
  #buildBatchResult(n, { wins, totalRounds, variantCollisions, clueLineFrequency }) {
    const samples = Object.values(clueLineFrequency).reduce((a, b) => a + b, 0);
    const maxClueRepeatRate =
      samples > 0 ? Math.max(...Object.values(clueLineFrequency)) / samples : 0;
    return {
      n,
      wins,
      winRate: wins / n,
      avgRounds: totalRounds / n,
      variantCollisions,
      uniqueClueLines: Object.keys(clueLineFrequency).length,
      maxClueRepeatRate,
    };
  }
}
