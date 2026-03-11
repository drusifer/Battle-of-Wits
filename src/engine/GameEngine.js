import { GobletManager } from './GobletManager.js';
import { RiddleManager } from './RiddleManager.js';
import { Vizzini } from '../characters/Vizzini.js';
import { Buttercup } from '../characters/Buttercup.js';
import { Gramps } from '../characters/Gramps.js';
import { Boy } from '../characters/Boy.js';

/**
 * GameEngine — async state machine driving the Battle of Wits.
 *
 * States: IDLE → INTRO → RIDDLE_PHASE → GOBLET_PHASE → WIN | LOSE
 * Round 2 re-enters RIDDLE_PHASE from GOBLET_PHASE when player picks the poisoned goblet.
 *
 * The engine awaits chatUI.whenIdle() before each game-progress step, ensuring the
 * chat queue drains before new content is injected. Player input is disabled while
 * the UI is busy (enforced by the UI layer).
 *
 * Events are emitted via EventBus. The UI layer subscribes to render them.
 */

export const STATES = {
  IDLE: 'IDLE',
  INTRO: 'INTRO',
  RIDDLE_PHASE: 'RIDDLE_PHASE',
  GOBLET_PHASE: 'GOBLET_PHASE',
  WIN: 'WIN',
  LOSE: 'LOSE',
};

const RIDDLES_PER_ROUND = 3;
const MAX_ROUNDS = 2;

export class GameEngine {
  #state = STATES.IDLE;
  #round = 1;
  #riddleCount = 0;
  #currentRiddle = null;
  #roundContext = null;

  #gameData;
  #chatUI;
  #bus;

  #riddleManager;
  #gobletManager;
  #vizzini;
  #buttercup;
  #gramps;
  #boy;

  /**
   * @param {GameData}  gameData  - from DataLoader.buildGameData()
   * @param {object}    chatUI    - must expose `whenIdle(): Promise<void>`
   * @param {EventBus}  eventBus
   */
  constructor(gameData, chatUI, eventBus) {
    this.#gameData = gameData;
    this.#chatUI = chatUI;
    this.#bus = eventBus;
    this.#buildCharacters();
  }

  get state() {
    return this.#state;
  }

  get round() {
    return this.#round;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Transition IDLE → INTRO → RIDDLE_PHASE. Initialises fresh managers per game. */
  async startGame() {
    this.#state = STATES.INTRO;
    this.#bus.emit('phase:changed', { from: STATES.IDLE, to: STATES.INTRO, round: 0 });

    this.#riddleManager = new RiddleManager(this.#gameData.createRiddleDeck());
    this.#gobletManager = new GobletManager(this.#gameData.createAttributeDeck());

    const introConv = this.#gameData.conversations.intro.draw();
    if (introConv) {
      this.#bus.emit('conversation:play', introConv);
      await this.#chatUI.whenIdle();
    }

    await this.#startRound(1);
  }

  /**
   * Called by the UI when the player submits a riddle answer.
   * No-op if the engine is not in RIDDLE_PHASE.
   * @param {string} rawInput
   */
  async answerRiddle(rawInput) {
    if (this.#state !== STATES.RIDDLE_PHASE) return;

    const correct = this.#riddleManager.checkAnswer(this.#currentRiddle, rawInput);
    const reactionLine = this.#vizzini.react(correct ? 'riddle:correct' : 'riddle:wrong');
    const clueLine = this.#vizzini.drawClue(correct);

    this.#bus.emit('riddle:answered', { correct, clueLine, reactionLine });
    await this.#chatUI.whenIdle();

    if (this.#riddleCount >= RIDDLES_PER_ROUND) {
      await this.#enterGobletPhase();
    } else {
      await this.#presentNextRiddle();
    }
  }

  /**
   * Called by the UI when the player requests a hint.
   * No-op if the engine is not in RIDDLE_PHASE.
   */
  async requestHint() {
    if (this.#state !== STATES.RIDDLE_PHASE) return;

    const gobletHint = this.#buttercup.drawGobletHint();
    const encouragement = this.#buttercup.react('hint:requested');
    const hintLine = [encouragement, gobletHint, this.#currentRiddle?.hint]
      .filter(Boolean)
      .join(' ');
    const vizziniReaction = this.#vizzini.react('hint:requested');

    this.#bus.emit('hint:requested', { hintLine, vizziniReaction });
    await this.#chatUI.whenIdle();
  }

  /**
   * Called by the UI when the player clicks a goblet.
   * No-op if the engine is not in GOBLET_PHASE.
   * @param {'left'|'right'} choice
   */
  async chooseGoblet(choice) {
    if (this.#state !== STATES.GOBLET_PHASE) return;

    const outcome = choice === this.#roundContext.safe ? 'goblet:correct' : 'goblet:poisoned';

    const reactionLines = [
      this.#vizzini.react(outcome),
      this.#buttercup.react(outcome),
      this.#gramps.react(outcome),
      this.#boy.react(outcome),
    ].filter(Boolean);

    this.#bus.emit('goblet:chosen', { choice, outcome, reactionLines });
    await this.#chatUI.whenIdle();

    if (outcome === 'goblet:correct') {
      await this.#enterWin();
    } else if (this.#round < MAX_ROUNDS) {
      await this.#startRound(this.#round + 1);
    } else {
      await this.#enterLose();
    }
  }

  /** Reset to IDLE and start a new game. */
  async restart() {
    this.#state = STATES.IDLE;
    await this.startGame();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  #buildCharacters() {
    const r = this.#gameData.reactions;
    this.#vizzini = new Vizzini(r['Vizzini']);
    this.#buttercup = new Buttercup(r['Buttercup']);
    this.#gramps = new Gramps(r['Gramps'], this.#gameData.grampsConnectives);
    this.#boy = new Boy(r['Boy']);
  }

  async #startRound(round) {
    const from = this.#state;
    this.#round = round;
    this.#riddleCount = 0;

    this.#roundContext = this.#gobletManager.generateGobletPair();
    this.#vizzini.setRoundDecks(
      this.#roundContext.vizziniComplimentDeck,
      this.#roundContext.vizziniInsultDeck
    );
    this.#buttercup.setRoundDeck(this.#roundContext.buttercupGobletDeck);

    this.#state = STATES.RIDDLE_PHASE;
    this.#bus.emit('phase:changed', { from, to: STATES.RIDDLE_PHASE, round });

    await this.#presentNextRiddle();
  }

  async #presentNextRiddle() {
    const banter = this.#gameData.conversations.riddlePhase.draw();
    if (banter) {
      this.#bus.emit('conversation:play', banter);
      await this.#chatUI.whenIdle();
    }

    this.#currentRiddle = this.#riddleManager.drawRiddle();
    this.#riddleCount++;

    this.#bus.emit('riddle:presented', { riddle: this.#currentRiddle });
    await this.#chatUI.whenIdle();
  }

  async #enterGobletPhase() {
    const from = this.#state;
    this.#state = STATES.GOBLET_PHASE;
    this.#bus.emit('phase:changed', { from, to: STATES.GOBLET_PHASE, round: this.#round });

    const banter = this.#gameData.conversations.gobletPhase.draw();
    if (banter) {
      this.#bus.emit('conversation:play', banter);
      await this.#chatUI.whenIdle();
    }

    const leftDesc = this.#gramps.describeGoblet(this.#roundContext.leftGoblet.attributes);
    const rightDesc = this.#gramps.describeGoblet(this.#roundContext.rightGoblet.attributes);

    this.#bus.emit('goblets:described', { left: leftDesc, right: rightDesc });
    await this.#chatUI.whenIdle();
  }

  async #enterWin() {
    const from = this.#state;
    this.#state = STATES.WIN;
    this.#bus.emit('phase:changed', { from, to: STATES.WIN, round: this.#round });

    const outro = this.#gameData.conversations.outro_win.draw();
    if (outro) {
      this.#bus.emit('conversation:play', outro);
      await this.#chatUI.whenIdle();
    }

    this.#bus.emit('game:won', { rounds: this.#round });
  }

  async #enterLose() {
    const from = this.#state;
    this.#state = STATES.LOSE;
    this.#bus.emit('phase:changed', { from, to: STATES.LOSE, round: this.#round });

    const outro = this.#gameData.conversations.outro_lose.draw();
    if (outro) {
      this.#bus.emit('conversation:play', outro);
      await this.#chatUI.whenIdle();
    }

    this.#bus.emit('game:lost', {});
  }
}
