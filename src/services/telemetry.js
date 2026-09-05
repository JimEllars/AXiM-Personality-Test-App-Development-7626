const TELEMETRY_ENDPOINT = '/api/telemetry';

export function trackEvent(eventName, payload = {}) {
  try {
    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...payload
    };

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(eventData)], { type: 'application/json' });
      navigator.sendBeacon(TELEMETRY_ENDPOINT, blob);
    } else {
      fetch(TELEMETRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
        keepalive: true
      }).catch(() => {});
    }
  } catch (error) {
    // Silently catch to prevent telemetry from breaking the app
    console.error('Telemetry error:', error);
  }
}

export function trackError(error, errorInfo = {}) {
  trackEvent('error', {
    message: error?.message || String(error),
    stack: error?.stack,
    ...errorInfo
  });
}
