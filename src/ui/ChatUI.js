/**
 * ChatUI — renders game events as chat bubbles in a DOM container.
 *
 * Subscribes to EventBus events and appends styled message bubbles.
 * Gameplay messages (riddles, clue lines, outcomes) get the 'gameplay' CSS class;
 * banter (ConversationDeck draws) gets the 'banter' class.
 *
 * whenIdle() resolves immediately (typing animation deferred to T31).
 */

const AVATARS = {
  Vizzini: '😤',
  Buttercup: '👸',
  Gramps: '🧓',
  Boy: '🤧',
  DPR: '🏴‍☠️',
};

export class ChatUI {
  #container;

  /**
   * @param {HTMLElement} containerEl - DOM element to render chat into
   * @param {EventBus}    [bus]       - optional EventBus to auto-subscribe
   */
  constructor(containerEl, bus) {
    this.#container = containerEl;
    if (bus) this.#subscribe(bus);
  }

  /**
   * Render a scene array as banter bubbles.
   * @param {Array<{char: string, line: string}>} scene
   */
  render(scene) {
    if (!scene || scene.length === 0) return;
    for (const { char, line } of scene) {
      this.#appendBubble(char, line, 'banter');
    }
    this.#scrollToBottom();
  }

  /**
   * Returns a Promise that resolves when the chat is idle.
   * Sprint 3 MVP: resolves immediately (no typing animation yet).
   * @returns {Promise<void>}
   */
  whenIdle() {
    return Promise.resolve();
  }

  /** Clear all chat bubbles — called on restart. */
  clear() {
    this.#container.innerHTML = '';
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /**
   * Subscribe to all relevant EventBus events.
   * @param {EventBus} bus
   */
  #subscribe(bus) {
    bus.on('conversation:play', scene => this.render(scene));
    bus.on('riddle:presented', ({ riddle }) => this.#onRiddlePresented(riddle));
    bus.on('riddle:answered', payload => this.#onRiddleAnswered(payload));
    bus.on('hint:requested', payload => this.#onHintRequested(payload));
    bus.on('goblets:described', payload => this.#onGobletsDescribed(payload));
    bus.on('goblet:chosen', payload => this.#onGobletChosen(payload));
    bus.on('game:won', payload => this.#onGameWon(payload));
    bus.on('game:lost', () => this.#onGameLost());
  }

  /** @param {{question: string, hint: string}} riddle */
  #onRiddlePresented(riddle) {
    this.#appendBubble('Gramps', `Here is your riddle: "${riddle.question}"`, 'gameplay');
    this.#scrollToBottom();
  }

  /** @param {{correct: boolean, clueLine: string, reactionLine: string}} payload */
  #onRiddleAnswered(payload) {
    const { correct, clueLine, reactionLine } = payload;
    const resultText = correct ? 'Correct!' : 'Wrong!';
    this.#appendBubble('DPR', resultText, 'gameplay');
    if (reactionLine) this.#appendBubble('Vizzini', reactionLine, 'gameplay');
    if (clueLine) this.#appendBubble('Vizzini', clueLine, 'gameplay');
    this.#scrollToBottom();
  }

  /** @param {{hintLine: string, vizziniReaction: string}} payload */
  #onHintRequested(payload) {
    const { hintLine, vizziniReaction } = payload;
    if (hintLine) this.#appendBubble('Buttercup', hintLine, 'gameplay');
    if (vizziniReaction) this.#appendBubble('Vizzini', vizziniReaction, 'gameplay');
    this.#scrollToBottom();
  }

  /** @param {{left: string, right: string}} payload */
  #onGobletsDescribed(payload) {
    const { left, right } = payload;
    this.#appendBubble('Gramps', `The cup on the left: ${left}`, 'gameplay');
    this.#appendBubble('Gramps', `The cup on the right: ${right}`, 'gameplay');
    this.#scrollToBottom();
  }

  /** @param {{choice: string, outcome: string, reactionLines: string[]}} payload */
  #onGobletChosen(payload) {
    const { choice, outcome, reactionLines } = payload;
    const choiceText = `You chose the ${choice} goblet.`;
    this.#appendBubble('DPR', choiceText, 'gameplay');

    const outcomeText = outcome === 'goblet:correct' ? 'You chose wisely!' : 'You chose... poorly.';
    this.#appendBubble('Gramps', outcomeText, 'gameplay');

    const reactors = ['Vizzini', 'Buttercup', 'Gramps', 'Boy'];
    for (const [i, line] of reactionLines.entries()) {
      // eslint-disable-next-line security/detect-object-injection
      const char = reactors[i] ?? 'Gramps';
      this.#appendBubble(char, line, 'gameplay');
    }
    this.#scrollToBottom();
  }

  /** @param {{rounds: number}} payload */
  #onGameWon(payload) {
    const { rounds } = payload;
    const msg =
      rounds === 1
        ? 'You have bested Vizzini! Westley triumphs in the first round!'
        : 'Against all odds, you have survived the iocane challenge! Victory is yours!';
    this.#appendBubble('Gramps', msg, 'gameplay');
    this.#scrollToBottom();
  }

  #onGameLost() {
    this.#appendBubble(
      'Gramps',
      'You have fallen victim to one of the classic blunders. The game is over.',
      'gameplay'
    );
    this.#scrollToBottom();
  }

  /**
   * Create and append a chat bubble element.
   * @param {string} char  - character name (used for avatar lookup)
   * @param {string} line  - message text
   * @param {'gameplay'|'banter'} style
   */
  #appendBubble(char, line, style) {
    // eslint-disable-next-line security/detect-object-injection
    const avatar = AVATARS[char] ?? '🎭';
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${style}`;

    const avatarEl = document.createElement('span');
    avatarEl.className = 'chat-avatar';
    avatarEl.textContent = avatar;
    avatarEl.setAttribute('aria-label', char);

    const nameEl = document.createElement('span');
    nameEl.className = 'chat-name';
    nameEl.textContent = char;

    const lineEl = document.createElement('span');
    lineEl.className = 'chat-line';
    lineEl.textContent = line;

    const headerEl = document.createElement('div');
    headerEl.className = 'chat-header';
    headerEl.appendChild(avatarEl);
    headerEl.appendChild(nameEl);

    bubble.appendChild(headerEl);
    bubble.appendChild(lineEl);
    this.#container.appendChild(bubble);
  }

  #scrollToBottom() {
    this.#container.scrollTop = this.#container.scrollHeight;
  }
}
