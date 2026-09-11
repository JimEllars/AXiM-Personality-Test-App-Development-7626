const WORKER_URL = import.meta.env.VITE_EDGE_WORKER_URL || (import.meta.env.PROD ? (import.meta.env.BASE_URL.replace(/\/$/, '') || '') : 'http://localhost:8787');
const TELEMETRY_ENDPOINT = `${WORKER_URL}/api/telemetry`;

let eventQueue = [];
let flushTimeout = null;

const QUEUE_SIZE_LIMIT = 10;
const FLUSH_INTERVAL_MS = 15000;
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
            const stored = JSON.parse(localStorage.getItem('axim_telemetry_queue') || '[]');
            stored.push(...payload);
            localStorage.setItem('axim_telemetry_queue', JSON.stringify(stored.slice(-MAX_PAYLOAD_SIZE)));
        } catch (e) {
            console.warn("Failed to write to offline telemetry buffer");
        }
        return;
    }

    // Attempt sendBeacon first
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' });
      try {
        const success = navigator.sendBeacon(TELEMETRY_ENDPOINT, blob);
        if (success) return;
      } catch (err) { /* silent catch */ }
    }

    // Fallback to fetch with keepalive
    if (typeof fetch !== 'undefined') {
      const attemptFetch = (retries) => {
        fetch(TELEMETRY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true
        }).catch((e) => {
          if (retries > 0) {
            setTimeout(() => attemptFetch(retries - 1), (4 - retries) * 1000); // exponential-ish backoff
          } else {
            // Add back to offline buffer on fail after retries
            try {
              const stored = JSON.parse(localStorage.getItem('axim_telemetry_queue') || '[]');
              stored.push(...payload);
              localStorage.setItem('axim_telemetry_queue', JSON.stringify(stored.slice(-MAX_PAYLOAD_SIZE)));
            } catch (err) { /* silent catch */ }
          }
        });
      };
      attemptFetch(3);
    }
  } catch (error) {
    // Silently catch
  }
}

function getSessionId() {
  if (typeof localStorage === 'undefined') return 'unknown';
  let sessionId = localStorage.getItem('axim_telemetry_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('axim_telemetry_session_id', sessionId);
  }
  return sessionId;
}

export function trackEvent(eventName, payload = {}) {
  try {
    const { sessionId, ...restPayload } = payload;
    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      sessionId: sessionId || getSessionId(),
      metadata: {
        url: typeof window !== 'undefined' ? window.location.href : '',
        // Minimal UA properties, avoid full PII
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 150) : '',
        ...restPayload
      }
    };

    // Keep top-level keys for Worker parsing compatibility (e.g., latency, error) if they exist in payload
    if (restPayload.latency !== undefined) eventData.latency = restPayload.latency;
    if (restPayload.error !== undefined) eventData.error = restPayload.error;
    if (restPayload.screen !== undefined) eventData.screen = restPayload.screen;
    if (restPayload.timeToComplete !== undefined) eventData.timeToComplete = restPayload.timeToComplete;
    if (restPayload.transitionLatency !== undefined) eventData.transitionLatency = restPayload.transitionLatency;
    if (restPayload.errorCount !== undefined) eventData.errorCount = restPayload.errorCount;


    eventQueue.push(eventData);

    if (eventQueue.length >= QUEUE_SIZE_LIMIT) {
      flushQueue();
    } else if (!flushTimeout) {
      flushTimeout = setTimeout(flushQueue, FLUSH_INTERVAL_MS);
    }
  } catch (error) {
    // Silently catch to prevent telemetry from breaking the app

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
        const stored = JSON.parse(localStorage.getItem('axim_telemetry_queue') || '[]');
        if (stored.length > 0) {
            eventQueue.push(...stored);
            localStorage.removeItem('axim_telemetry_queue');
            flushQueue();
        }
    } catch (e) {
        // Silent catch
    }
}


// Ensure delivery during navigation/unload
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushQueue);
  window.addEventListener('beforeunload', flushQueue);
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
