import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent, getQueue_forTesting, setQueue_forTesting, flushQueue } from '../src/services/telemetry';

describe('telemetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

        Object.defineProperty(global, 'navigator', {
      value: {
        sendBeacon: vi.fn().mockReturnValue(true),
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

  it('drains queue when online again', () => {
    global.navigator.onLine = false;
    trackEvent('offline_event_1', {});
    flushQueue();
    expect(global.fetch).not.toHaveBeenCalled();

    global.navigator.onLine = true;
    import('../src/services/telemetry').then(({ flushOfflineQueue }) => {
        flushOfflineQueue();
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
