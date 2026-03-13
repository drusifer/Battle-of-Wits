/**
 * GUI UAT — SPRINT3_Feedback UX contracts
 *
 * Test Pyramid: these 4 tests cover only what requires a real rendered DOM.
 * Game logic, narration correctness, and state transitions are covered by
 * unit tests (239) and UAT scripts (uat1/2/3). Do not duplicate that coverage here.
 *
 * FAST_MODE: window.FAST_MODE=true is injected before page load, collapsing
 * all ChatUI typing delays to 0ms so the full intro+riddle sequence completes
 * in milliseconds rather than ~60 seconds.
 *
 * Run: make uat-gui  (starts/stops vite server automatically)
 */

import { test, expect } from "@playwright/test";

// Inject FAST_MODE before any page script executes
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.FAST_MODE = true;
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Wait for the intro to complete and riddle phase to begin.
 * Answers a riddle by submitting a known correct answer.
 * @param {import('@playwright/test').Page} page
 * @param {string} answer
 */
async function submitAnswer(page, answer) {
  const input = page.locator("#answer-input");
  const submit = page.locator("#submit-btn");
  await expect(input).toBeEnabled({ timeout: 10000 });
  await input.fill(answer);
  await submit.click();
}

/**
 * Wait until a chat bubble from a named speaker appears.
 * @param {import('@playwright/test').Page} page
 * @param {string} speakerName
 */
async function waitForSpeaker(page, speakerName) {
  await expect(
    page.locator(".chat-name", { hasText: speakerName }).first(),
  ).toBeVisible({ timeout: 10000 });
}

// ── T-GUI-1: Intro scene renders on load ─────────────────────────────────────

test("T-GUI-1: intro scene renders Gramps dialogue on load", async ({
  page,
}) => {
  await page.goto("/");

  // Gramps sets the scene in the intro — at least one bubble must appear
  await waitForSpeaker(page, "Gramps");

  const grampsBubbles = page.locator(".chat-bubble .chat-name", {
    hasText: "Gramps",
  });
  await expect(grampsBubbles.first()).toBeVisible();
});

// ── T-GUI-2: Vizzini presents riddles (not Gramps) ───────────────────────────

test("T-GUI-2: Vizzini presents the riddle, not Gramps", async ({ page }) => {
  await page.goto("/");

  // Wait for input to be enabled — means intro finished and riddle phase started
  await expect(page.locator("#answer-input")).toBeEnabled({ timeout: 10000 });

  // A Vizzini bubble must be present in the riddle phase
  await waitForSpeaker(page, "Vizzini");

  // The riddle question bubble is from Vizzini
  const vizziniBubbles = page.locator(".chat-bubble", {
    has: page.locator(".chat-name", { hasText: "Vizzini" }),
  });
  await expect(vizziniBubbles.first()).toBeVisible();

  // No bubble from Gramps should contain "riddle" framing language
  const grampsBubbles = page.locator(".chat-bubble", {
    has: page.locator(".chat-name", { hasText: "Gramps" }),
  });
  const grampsCount = await grampsBubbles.count();
  for (let i = 0; i < grampsCount; i++) {
    const text = await grampsBubbles.nth(i).locator(".chat-line").textContent();
    expect(text).not.toMatch(/here is your riddle/i);
  }
});

// ── T-GUI-3: Goblet CTA buttons visible in goblet phase ──────────────────────

test("T-GUI-3: goblet CTA buttons appear when goblet phase starts", async ({
  page,
}) => {
  await page.goto("/");

  // Answer 3 riddles to reach goblet phase.
  // Use 'skip' — GameEngine normalises answers; an incorrect answer still
  // advances through all 3 riddles and triggers the goblet phase.
  for (let i = 0; i < 3; i++) {
    await submitAnswer(page, "xyzzy_no_match_intentional");
  }

  // Goblet CTA spans should become visible
  const leftCta = page.locator("#goblet-left .goblet-cta");
  const rightCta = page.locator("#goblet-right .goblet-cta");

  await expect(leftCta).toBeVisible({ timeout: 10000 });
  await expect(rightCta).toBeVisible({ timeout: 10000 });

  // Goblet buttons should be enabled
  await expect(page.locator("#goblet-left")).toBeEnabled();
  await expect(page.locator("#goblet-right")).toBeEnabled();
});

// ── T-GUI-5: Restart — second game receives events and renders correctly ──────
//
// Restart is triggered from RIDDLE_PHASE (engine idle — awaiting user input).
// This is the only point where the engine's async chain has fully resolved and
// there are no dangling awaits. Clicking restart from goblet phase would race
// against the chooseGoblet() async chain.

test("T-GUI-5: UI renders correctly in second game after restart", async ({
  page,
}) => {
  await page.goto("/");

  // Wait until engine is idle: riddle:presented emitted + whenIdle() resolved.
  // At this point startGame()'s entire async chain has completed.
  await expect(page.locator("#answer-input")).toBeEnabled({ timeout: 10000 });

  // Restart mid-game (engine idle, awaiting player riddle input)
  const restartBtn = page.locator("#restart-btn");
  await expect(restartBtn).toBeEnabled({ timeout: 5000 });
  await restartBtn.click();

  // Second game: at least one chat bubble must appear (intro plays).
  // The intro deck has 3 scenes; game 2 draws scene 2 (Vizzini-only) — so we
  // can't assert Gramps here. We assert that ANY bubble renders, proving
  // ChatUI's conversation:play subscription survived the restart.
  await expect(page.locator(".chat-bubble").first()).toBeVisible({
    timeout: 10000,
  });

  // Riddle phase starts — Vizzini always presents the riddle
  await expect(page.locator("#answer-input")).toBeEnabled({ timeout: 10000 });
  await waitForSpeaker(page, "Vizzini");

  // Status bar reset to Round 1 — proves StatusBar subscriptions survived restart
  await expect(page.locator("#status-bar")).toContainText("Round 1");
});

// ── T-GUI-4: Buttercup hint is riddle-scoped during riddle phase ─────────────

test("T-GUI-4: Buttercup hint contains no goblet-reveal vocabulary during riddle phase", async ({
  page,
}) => {
  await page.goto("/");

  // Wait for riddle phase (input enabled)
  await expect(page.locator("#answer-input")).toBeEnabled({ timeout: 10000 });

  // Click hint
  await page.locator("#hint-btn").click();

  // Wait for Buttercup's bubble to appear
  const buttercupBubble = page
    .locator(".chat-bubble", {
      has: page.locator(".chat-name", { hasText: "Buttercup" }),
    })
    .first();
  await expect(buttercupBubble).toBeVisible({ timeout: 5000 });

  // Hint must not reveal goblet information during riddle phase
  const GOBLET_VOCAB = /left goblet|right goblet|poisoned|the safe|the cup/i;
  const text = await buttercupBubble.locator(".chat-line").textContent();
  expect(text).not.toMatch(GOBLET_VOCAB);
});
