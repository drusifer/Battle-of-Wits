/**
 * EventBus — lightweight pub/sub.
 *
 * Decouples GameEngine (event emitter) from ChatUI and other listeners (event consumers).
 * No dependencies. Synchronous dispatch.
 */
export class EventBus {
  #listeners = new Map();

  /**
   * Subscribe to an event.
   * @param {string}   event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(callback);
  }

  /**
   * Unsubscribe a specific callback from an event.
   * No-op if the callback was not subscribed.
   * @param {string}   event
   * @param {Function} callback
   */
  off(event, callback) {
    if (!this.#listeners.has(event)) return;
    const updated = this.#listeners.get(event).filter(cb => cb !== callback);
    this.#listeners.set(event, updated);
  }

  /**
   * Emit an event to all registered listeners.
   * No-op if no listeners are registered for that event.
   * @param {string} event
   * @param {*}      payload
   */
  emit(event, payload) {
    if (!this.#listeners.has(event)) return;
    for (const cb of this.#listeners.get(event)) cb(payload);
  }
}
