const WORKER_URL = import.meta.env.VITE_EDGE_WORKER_URL || (import.meta.env.PROD ? (import.meta.env.BASE_URL.replace(/\/$/, '') || '') : 'http://localhost:8787');
const TELEMETRY_ENDPOINT = `${WORKER_URL}/api/telemetry`;

let eventQueue = [];
let flushTimeout = null;

const QUEUE_SIZE_LIMIT = 15;
const FLUSH_INTERVAL_MS = 10000;
const MAX_PAYLOAD_SIZE = 50; // Truncate queue to prevent oversized payloads

export function flushQueue() {
  if (eventQueue.length === 0) return;

  // Truncate queue on oversized payloads to avoid excessive body size errors
  const queueToProcess = eventQueue.length > MAX_PAYLOAD_SIZE ? eventQueue.slice(-MAX_PAYLOAD_SIZE) : eventQueue;
  const payload = [...queueToProcess];
  eventQueue = [];

  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  try {
    const data = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // Offline buffer
        try {
            const stored = JSON.parse(localStorage.getItem('axim_telemetry_offline') || '[]');
            stored.push(...payload);
            localStorage.setItem('axim_telemetry_offline', JSON.stringify(stored.slice(-MAX_PAYLOAD_SIZE)));
        } catch (e) {
            console.warn("Failed to write to offline telemetry buffer");
        }
        return;
    }

    // Attempt sendBeacon first
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' });
      const success = navigator.sendBeacon(TELEMETRY_ENDPOINT, blob);
      if (success) return;
    }

    // Fallback to fetch with keepalive
    if (typeof fetch !== 'undefined') {
      fetch(TELEMETRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true
      }).catch((e) => {
          // Add back to offline buffer on fail
          try {
            const stored = JSON.parse(localStorage.getItem('axim_telemetry_offline') || '[]');
            stored.push(...payload);
            localStorage.setItem('axim_telemetry_offline', JSON.stringify(stored.slice(-MAX_PAYLOAD_SIZE)));
        } catch (err) { /* silent catch */ }
      });
    }
  } catch (error) {
    console.error('Telemetry flush error:', error);
  }
}

export function trackEvent(eventName, payload = {}) {
  try {
    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      // Minimal UA properties, avoid full PII
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 150) : '',
      ...payload
    };

    eventQueue.push(eventData);

    if (eventQueue.length >= QUEUE_SIZE_LIMIT) {
      flushQueue();
    } else if (!flushTimeout) {
      flushTimeout = setTimeout(flushQueue, FLUSH_INTERVAL_MS);
    }
  } catch (error) {
    // Silently catch to prevent telemetry from breaking the app
    console.error('Telemetry trackEvent error:', error);
  }
}

export function trackError(error, errorInfo = {}) {
  trackEvent('error', {
    message: error?.message || String(error),
    stack: error?.stack,
    ...errorInfo
  });
}


export function flushOfflineQueue() {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    try {
        const stored = JSON.parse(localStorage.getItem('axim_telemetry_offline') || '[]');
        if (stored.length > 0) {
            eventQueue.push(...stored);
            localStorage.removeItem('axim_telemetry_offline');
            flushQueue();
        }
    } catch (e) {
        // Silent catch
    }
}

// Ensure delivery during navigation/unload
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushQueue);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushQueue();
    }
  });
  window.addEventListener('online', flushOfflineQueue);
}

export function getQueue_forTesting() {
  return eventQueue;
}

export function setQueue_forTesting(newQueue) {
  eventQueue = newQueue;
}
