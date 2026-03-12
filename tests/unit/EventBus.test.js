/**
 * EventBus test suite (T24).
 */
import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../../src/engine/EventBus.js';

describe('EventBus', () => {
  // ── on / emit ──────────────────────────────────────────────────────────────

  it('calls a registered listener when the event is emitted', () => {
    const bus = new EventBus();
    const cb = vi.fn();
    bus.on('test', cb);
    bus.emit('test', 'payload');
    expect(cb).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledWith('payload');
  });

  it('does not call listener for a different event', () => {
    const bus = new EventBus();
    const cb = vi.fn();
    bus.on('event-a', cb);
    bus.emit('event-b', 'data');
    expect(cb).not.toHaveBeenCalled();
  });

  it('calls all listeners registered for the same event', () => {
    const bus = new EventBus();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    bus.on('click', cb1);
    bus.on('click', cb2);
    bus.emit('click', 42);
    expect(cb1).toHaveBeenCalledWith(42);
    expect(cb2).toHaveBeenCalledWith(42);
  });

  it('passes payload correctly (object)', () => {
    const bus = new EventBus();
    const received = [];
    bus.on('data', p => received.push(p));
    bus.emit('data', { x: 1, y: 2 });
    expect(received[0]).toEqual({ x: 1, y: 2 });
  });

  it('passes payload correctly (undefined)', () => {
    const bus = new EventBus();
    const cb = vi.fn();
    bus.on('empty', cb);
    bus.emit('empty');
    expect(cb).toHaveBeenCalledWith(undefined);
  });

  // ── off ────────────────────────────────────────────────────────────────────

  it('off() removes a specific listener', () => {
    const bus = new EventBus();
    const cb = vi.fn();
    bus.on('msg', cb);
    bus.off('msg', cb);
    bus.emit('msg', 'hi');
    expect(cb).not.toHaveBeenCalled();
  });

  it('off() removes only the target listener, leaving others intact', () => {
    const bus = new EventBus();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    bus.on('msg', cb1);
    bus.on('msg', cb2);
    bus.off('msg', cb1);
    bus.emit('msg', 'hi');
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledWith('hi');
  });

  it('off() is a no-op for an event that was never subscribed', () => {
    const bus = new EventBus();
    expect(() => bus.off('ghost', vi.fn())).not.toThrow();
  });

  it('off() is a no-op if callback was not registered', () => {
    const bus = new EventBus();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    bus.on('msg', cb1);
    bus.off('msg', cb2); // cb2 was never registered
    bus.emit('msg', 'x');
    expect(cb1).toHaveBeenCalledWith('x');
  });

  // ── emit with no listeners ─────────────────────────────────────────────────

  it('emit() is a no-op when no listeners are registered for that event', () => {
    const bus = new EventBus();
    expect(() => bus.emit('nothing', 'data')).not.toThrow();
  });

  // ── multiple emits ─────────────────────────────────────────────────────────

  it('listener is called on every emit, not just the first', () => {
    const bus = new EventBus();
    const cb = vi.fn();
    bus.on('tick', cb);
    bus.emit('tick', 1);
    bus.emit('tick', 2);
    bus.emit('tick', 3);
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it('independent buses do not share listeners', () => {
    const bus1 = new EventBus();
    const bus2 = new EventBus();
    const cb = vi.fn();
    bus1.on('event', cb);
    bus2.emit('event', 'data');
    expect(cb).not.toHaveBeenCalled();
  });
});
