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

import { fetchAndBuild } from "./utils/DataLoader.js";
import { EventBus } from "./engine/EventBus.js";
import { GameEngine, STATES } from "./engine/GameEngine.js";
import { ChatUI } from "./ui/ChatUI.js";
import { StatusBar } from "./ui/StatusBar.js";
import { GobletDisplay } from "./ui/GobletDisplay.js";
import { SoundManager } from "./utils/SoundManager.js";

// ── Theme Management ───────────────────────────────────────────────────────

const THEME_KEY = "battle-of-wits-theme";
const VALID_THEMES = ["dark", "light", "system"];

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.setAttribute(
      "aria-pressed",
      btn.dataset.themeValue === theme ? "true" : "false",
    );
  });
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  applyTheme(VALID_THEMES.includes(stored) ? stored : "dark");
  document.getElementById("theme-picker").addEventListener("click", (e) => {
    const btn = e.target.closest(".theme-btn");
    if (!btn) return;
    const chosen = btn.dataset.themeValue;
    if (!VALID_THEMES.includes(chosen)) return;
    localStorage.setItem(THEME_KEY, chosen);
    applyTheme(chosen);
  });
}

initTheme();

// ── DOM refs ───────────────────────────────────────────────────────────────

const chatContainerEl = document.getElementById("chat-container");
const statusBarEl = document.getElementById("status-bar");
const gobletLeftEl = document.getElementById("goblet-left");
const gobletRightEl = document.getElementById("goblet-right");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const hintBtn = document.getElementById("hint-btn");
const gobletHintBtn = document.getElementById("goblet-hint-btn");
const muteBtn = document.getElementById("mute-btn");
const restartBtn = document.getElementById("restart-btn");

// ── Helpers ────────────────────────────────────────────────────────────────

/** Wire phase-change listener — controls input, hint, and goblet disable. */
function wirePhaseListener(bus, gobletDisplay) {
  bus.on("phase:changed", ({ to }) => {
    const inRiddle = to === STATES.RIDDLE_PHASE;
    const gameOver = to === STATES.WIN || to === STATES.LOSE;
    answerInput.disabled = !inRiddle;
    submitBtn.disabled = !inRiddle;
    hintBtn.classList.toggle("visible", inRiddle);
    restartBtn.disabled = false;
    // GobletDisplay self-enables internally via goblets:described event.
    // Disable it on all non-goblet phases so it resets correctly on restart.
    if (to !== STATES.GOBLET_PHASE) {
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
  bus.on("riddle:presented", () => {
    answerInput.value = "";
    answerInput.disabled = false;
    submitBtn.disabled = false;
    answerInput.focus();
  });
  bus.on("riddle:answered", () => {
    answerInput.value = "";
    answerInput.disabled = true;
    submitBtn.disabled = true;
  });
}

/** Wire button click handlers to engine methods. */
function wireControls({
  engine,
  chatUI,
  statusBar,
  gobletDisplay,
  soundManager,
}) {
  const submitAnswer = () => {
    const raw = answerInput.value.trim();
    if (!raw) return;
    answerInput.value = "";
    engine.answerRiddle(raw);
  };
  submitBtn.addEventListener("click", submitAnswer);
  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitAnswer();
  });
  hintBtn.addEventListener("click", () => engine.requestHint());
  gobletHintBtn.addEventListener("click", () => engine.requestGobletHint());
  muteBtn.addEventListener("click", () => {
    if (soundManager.muted) {
      soundManager.unmute();
      muteBtn.textContent = "🔊";
      muteBtn.title = "Mute sound";
    } else {
      soundManager.mute();
      muteBtn.textContent = "🔇";
      muteBtn.title = "Unmute sound";
    }
  });
  // Sync initial mute state
  if (soundManager.muted) {
    muteBtn.textContent = "🔇";
    muteBtn.title = "Unmute sound";
  }
  restartBtn.addEventListener("click", async () => {
    // Reset DOM state only — subscriptions must be preserved so the UI
    // responds to events from the restarted engine. destroy() is for SPA
    // teardown, not in-lifecycle restarts.
    chatUI.clear();
    statusBar.reset();
    gobletDisplay.hide();
    await engine.restart();
  });
}

// ── Bootstrap ──────────────────────────────────────────────────────────────

async function init() {
  const gameData = await fetchAndBuild("data");
  const bus = new EventBus();
  const chatUI = new ChatUI(chatContainerEl, bus);
  const statusBar = new StatusBar(statusBarEl, bus);

  // engine must be `let`: GobletDisplay onChoose closure captures it by ref.
  // eslint-disable-next-line prefer-const
  let engine;
  const gobletDisplay = new GobletDisplay(
    gobletLeftEl,
    gobletRightEl,
    (side) => engine.chooseGoblet(side),
    bus,
  );
  gobletDisplay.setHintButton(gobletHintBtn);
  engine = new GameEngine(gameData, chatUI, bus);
  const soundManager = new SoundManager(bus);

  wirePhaseListener(bus, gobletDisplay);
  wireRiddleListeners(bus);
  wireControls({ engine, chatUI, statusBar, gobletDisplay, soundManager });

  restartBtn.disabled = true;
  await engine.startGame();
}

init().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Battle of Wits failed to start:", err);
});
