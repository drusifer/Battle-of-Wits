/**
 * SoundManager — Web Audio API synthesized sound effects (S4-S1).
 *
 * Uses OscillatorNode + GainNode to synthesize short tones — no audio assets required.
 * Gracefully degrades: if AudioContext is unavailable, play() is a silent no-op.
 *
 * Sounds:
 *   'correct'  — ascending arpeggio (riddle answered correctly)
 *   'wrong'    — descending buzz (riddle answered wrong)
 *   'safe'     — triumphant chord (goblet chosen correctly)
 *   'poison'   — ominous low tone (goblet chosen — poisoned)
 *
 * Mute state persists via localStorage under key 'bow-muted'.
 */

const STORAGE_KEY = "bow-muted";
const TONE_GAIN = 0.18;
const TONE_GAIN_END = 0.001;
const TONE_STOP_BUFFER = 0.01;

const SOUNDS = {
  correct: [
    { freq: 523, dur: 0.08, delay: 0 }, // C5
    { freq: 659, dur: 0.08, delay: 0.09 }, // E5
    { freq: 784, dur: 0.15, delay: 0.18 }, // G5
  ],
  wrong: [
    { freq: 392, dur: 0.12, delay: 0 }, // G4
    { freq: 294, dur: 0.2, delay: 0.1 }, // D4
  ],
  safe: [
    { freq: 523, dur: 0.12, delay: 0 }, // C5
    { freq: 659, dur: 0.12, delay: 0 }, // E5 (chord)
    { freq: 784, dur: 0.25, delay: 0 }, // G5 (chord)
  ],
  poison: [
    { freq: 196, dur: 0.35, delay: 0 }, // G3 ominous
    { freq: 185, dur: 0.3, delay: 0.1 }, // F#3
  ],
};

export class SoundManager {
  #muted;
  #audioCtx = null;

  /**
   * @param {import('../engine/EventBus.js').EventBus} [bus] - optional EventBus to auto-subscribe
   */
  constructor(bus) {
    this.#muted = this.#loadMuted();
    this.#initAudio();
    if (bus) this.#initSubscriptions(bus);
  }

  get muted() {
    return this.#muted;
  }

  mute() {
    this.#muted = true;
    this.#saveMuted(true);
  }

  unmute() {
    this.#muted = false;
    this.#saveMuted(false);
  }

  /**
   * Play a named sound effect.
   * Silent no-op when muted or AudioContext unavailable.
   * @param {'correct'|'wrong'|'safe'|'poison'} soundId
   */
  play(soundId) {
    if (this.#muted || !this.#audioCtx) return;
    // eslint-disable-next-line security/detect-object-injection
    const notes = SOUNDS[soundId];
    if (!notes) return;
    for (const { freq, dur, delay } of notes) {
      this.#playTone(freq, dur, delay);
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  #initAudio() {
    try {
      const Ctx =
        (typeof window !== "undefined" &&
          (window.AudioContext || window.webkitAudioContext)) ||
        null;
      if (Ctx) this.#audioCtx = new Ctx();
    } catch {
      // Autoplay policy or unavailable — silent fallback
    }
  }

  /**
   * Synthesize a single sine-wave tone.
   * @param {number} freq  - frequency in Hz
   * @param {number} dur   - duration in seconds
   * @param {number} delay - start delay in seconds (from now)
   */
  #playTone(freq, dur, delay) {
    if (!this.#audioCtx) return;
    const ctx = this.#audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(TONE_GAIN, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(
      TONE_GAIN_END,
      ctx.currentTime + delay + dur,
    );

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur + TONE_STOP_BUFFER);
  }

  #initSubscriptions(bus) {
    bus.on("riddle:answered", ({ correct }) =>
      this.play(correct ? "correct" : "wrong"),
    );
    bus.on("goblet:chosen", ({ outcome }) =>
      this.play(outcome === "goblet:correct" ? "safe" : "poison"),
    );
  }

  #loadMuted() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }

  #saveMuted(value) {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // localStorage unavailable — fine
    }
  }
}
