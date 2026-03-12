/**
 * BaseSubscriber — base class for UI components that subscribe to EventBus events.
 *
 * Provides `subscribe(bus, event, handler)` to register a handler and store the tuple,
 * and `destroy()` to unsubscribe all registered handlers and clear the list.
 *
 * All three UI components (ChatUI, StatusBar, GobletDisplay) extend this class.
 */
export class BaseSubscriber {
  #subscriptions = [];

  /**
   * Subscribe to an event and store the tuple for later teardown.
   * @param {import('../engine/EventBus.js').EventBus} bus
   * @param {string} event
   * @param {Function} handler
   */
  subscribe(bus, event, handler) {
    bus.on(event, handler);
    this.#subscriptions.push({ bus, event, handler });
  }

  /**
   * Unsubscribe all registered handlers and clear the subscription list.
   * Safe to call multiple times.
   */
  destroy() {
    for (const { bus, event, handler } of this.#subscriptions) {
      bus.off(event, handler);
    }
    this.#subscriptions = [];
  }
}
