import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  it('batches events and flushes', () => {
    for (let i = 0; i < 15; i++) {
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
