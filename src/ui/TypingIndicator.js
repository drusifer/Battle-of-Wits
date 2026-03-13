/**
 * TypingIndicator — manages a single typing-indicator "..." bubble in the chat.
 *
 * Lifecycle:
 *   show(speakerName, avatarEmoji, containerEl) — appends the bubble
 *   hide()                                      — removes it from the DOM
 */
export class TypingIndicator {
  #bubble = null;
  #container = null;

  /**
   * Append a typing bubble with "..." to containerEl.
   * @param {string}      speakerName  - character name (e.g. 'Vizzini')
   * @param {string}      avatarEmoji  - avatar emoji (e.g. '😤')
   * @param {HTMLElement} containerEl  - DOM container to append to
   */
  show(speakerName, avatarEmoji, containerEl) {
    this.#container = containerEl;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble typing-indicator";

    const avatarEl = document.createElement("span");
    avatarEl.className = "chat-avatar";
    avatarEl.textContent = avatarEmoji;
    avatarEl.setAttribute("aria-label", speakerName);

    const nameEl = document.createElement("span");
    nameEl.className = "chat-name";
    nameEl.textContent = speakerName;

    const headerEl = document.createElement("div");
    headerEl.className = "chat-header";
    headerEl.appendChild(avatarEl);
    headerEl.appendChild(nameEl);

    const dotsEl = document.createElement("span");
    dotsEl.className = "chat-line typing-dots";
    dotsEl.textContent = "...";

    bubble.appendChild(headerEl);
    bubble.appendChild(dotsEl);

    this.#bubble = bubble;
    containerEl.appendChild(bubble);
  }

  /**
   * Remove the typing bubble from the DOM.
   * No-op if show() has not been called or bubble was already removed.
   */
  hide() {
    if (
      this.#bubble &&
      this.#container &&
      this.#container.contains(this.#bubble)
    ) {
      this.#container.removeChild(this.#bubble);
    }
    this.#bubble = null;
    this.#container = null;
  }
}
