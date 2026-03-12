/**
 * main.js — App bootstrap for Battle of Wits.
 *
 * Load order:
 *   1. fetchAndBuild() → GameData
 *   2. Create EventBus, ChatUI, StatusBar, GobletDisplay
 *   3. Create GameEngine(gameData, chatUI, eventBus)
 *   4. Wire all UI controls to engine methods
 *   5. engine.startGame()
 */

import { fetchAndBuild } from './utils/DataLoader.js';
import { EventBus } from './engine/EventBus.js';
import { GameEngine, STATES } from './engine/GameEngine.js';
import { ChatUI } from './ui/ChatUI.js';
import { StatusBar } from './ui/StatusBar.js';
import { GobletDisplay } from './ui/GobletDisplay.js';

// ── DOM refs ───────────────────────────────────────────────────────────────

const chatContainerEl = document.getElementById('chat-container');
const statusBarEl = document.getElementById('status-bar');
const gobletLeftEl = document.getElementById('goblet-left');
const gobletRightEl = document.getElementById('goblet-right');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const hintBtn = document.getElementById('hint-btn');
const restartBtn = document.getElementById('restart-btn');

// ── Helpers ────────────────────────────────────────────────────────────────

/** Wire phase-change listener — controls input, hint, goblet enable/disable. */
function wirePhaseListener(bus, gobletDisplay) {
  bus.on('phase:changed', ({ to }) => {
    const inRiddle = to === STATES.RIDDLE_PHASE;
    const inGoblet = to === STATES.GOBLET_PHASE;
    const gameOver = to === STATES.WIN || to === STATES.LOSE;
    answerInput.disabled = !inRiddle;
    submitBtn.disabled = !inRiddle;
    hintBtn.classList.toggle('visible', inRiddle);
    restartBtn.disabled = false;
    if (inGoblet) {
      gobletDisplay.enable();
    } else {
      gobletDisplay.disable();
    }
    if (gameOver) {
      answerInput.disabled = true;
      submitBtn.disabled = true;
    }
  });
}

/** Wire riddle:presented and riddle:answered listeners for input state. */
function wireRiddleListeners(bus) {
  bus.on('riddle:presented', () => {
    answerInput.value = '';
    answerInput.disabled = false;
    submitBtn.disabled = false;
    answerInput.focus();
  });
  bus.on('riddle:answered', () => {
    answerInput.value = '';
    answerInput.disabled = true;
    submitBtn.disabled = true;
  });
}

/** Wire button click handlers to engine methods. */
function wireControls(engine, chatUI, statusBar, gobletDisplay) {
  const submitAnswer = () => {
    const raw = answerInput.value.trim();
    if (!raw) return;
    answerInput.value = '';
    engine.answerRiddle(raw);
  };
  submitBtn.addEventListener('click', submitAnswer);
  answerInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitAnswer();
  });
  hintBtn.addEventListener('click', () => engine.requestHint());
  restartBtn.addEventListener('click', async () => {
    chatUI.destroy();
    statusBar.destroy();
    gobletDisplay.destroy();
    chatUI.clear();
    statusBar.reset();
    await engine.restart();
  });
}

// ── Bootstrap ──────────────────────────────────────────────────────────────

async function init() {
  const gameData = await fetchAndBuild('data');
  const bus = new EventBus();
  const chatUI = new ChatUI(chatContainerEl, bus);
  const statusBar = new StatusBar(statusBarEl, bus);

  // engine must be `let`: GobletDisplay onChoose closure captures it by ref.
  // eslint-disable-next-line prefer-const
  let engine;
  const gobletDisplay = new GobletDisplay(
    gobletLeftEl,
    gobletRightEl,
    side => engine.chooseGoblet(side),
    bus
  );
  engine = new GameEngine(gameData, chatUI, bus);

  wirePhaseListener(bus, gobletDisplay);
  wireRiddleListeners(bus);
  wireControls(engine, chatUI, statusBar, gobletDisplay);

  restartBtn.disabled = true;
  await engine.startGame();
}

init().catch(err => {
  // eslint-disable-next-line no-console
  console.error('Battle of Wits failed to start:', err);
});
