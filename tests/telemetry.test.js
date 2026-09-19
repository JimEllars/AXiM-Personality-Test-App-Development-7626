import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent, getQueue_forTesting, setQueue_forTesting, flushQueue } from '../src/services/telemetry';

describe('telemetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    Object.defineProperty(global, 'navigator', {
      value: {
        sendBeacon: vi.fn().mockReturnValue(false),
        userAgent: 'test-agent',
        onLine: true
      },
      writable: true,
      configurable: true
    });
    Object.defineProperty(global, 'window', {
      value: {
        location: { href: 'http://localhost' },
        addEventListener: vi.fn()
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('batches events and flushes', () => {
    for (let i = 0; i < 10; i++) {
      trackEvent('test_event', { index: i });
    }
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('truncates queue on oversized payloads', () => {
    const largeQueue = Array.from({ length: 60 }).map((_, i) => ({ event: 'test', id: i }));
    setQueue_forTesting(largeQueue);

    flushQueue();

    expect(global.fetch).toHaveBeenCalled();
  });

  it('queues offline and flushes when online', () => {
    global.navigator.onLine = false;
    trackEvent('offline_event_1', {});
    trackEvent('offline_event_2', {});

    flushQueue();
    expect(global.fetch).not.toHaveBeenCalled();

    // check local storage
    const stored = JSON.parse(localStorage.getItem('axim_telemetry_queue') || '[]');
    expect(stored.length).toBeGreaterThan(0);
    expect(stored[0].event).toBe('offline_event_1');
  });

  it('drains queue when online again', async () => {
    global.navigator.onLine = false;
    trackEvent('offline_event_1', {});
    flushQueue();
    expect(global.fetch).not.toHaveBeenCalled();

    global.navigator.onLine = true;
    const { flushOfflineQueue } = await import('../src/services/telemetry');
    flushOfflineQueue();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('calls sendBeacon and falls back to fetch with keepalive if sendBeacon fails', () => {
    global.navigator.sendBeacon = vi.fn().mockReturnValue(false);
    trackEvent('test_beacon', {});
    flushQueue();
    expect(global.navigator.sendBeacon).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      keepalive: true,
      method: 'POST'
    }));
  });
  it('verifies the payload structure for Edge Worker compatibility', () => {
    trackEvent('structured_event', { customProp: 'value', latency: 150 });

    const queue = getQueue_forTesting();
    expect(queue.length).toBeGreaterThan(0);

    const event = queue[queue.length - 1];
    expect(event).toHaveProperty('event', 'structured_event');
    expect(event).toHaveProperty('sessionId');
    expect(event).toHaveProperty('timestamp');
    expect(event).toHaveProperty('latency', 150);
    expect(event.metadata).toHaveProperty('customProp', 'value');
    expect(event.metadata).toHaveProperty('userAgent');
    expect(event.metadata).toHaveProperty('url');
  });

  it('saves queue to sessionStorage and recovers it', async () => {
    trackEvent('session_storage_event', {});
    const stored = JSON.parse(sessionStorage.getItem('axim_telemetry_live_queue') || '[]');
    expect(stored.length).toBeGreaterThan(0);
    expect(stored[stored.length - 1].event).toBe('session_storage_event');
  });
});
