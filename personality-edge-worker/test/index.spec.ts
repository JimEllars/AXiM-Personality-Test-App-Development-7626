import { describe, it, expect } from 'vitest';
import worker from '../src/index';

describe('Edge Worker', () => {
  it('responds to OPTIONS with CORS headers', async () => {
    const request = new Request('http://localhost/api/telemetry', { method: 'OPTIONS' });
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://axim.us.com');
  });

  it('health check returns status', async () => {
    const request = new Request('http://localhost/health', { method: 'GET' });
    const response = await worker.fetch(request, {} as any, {} as any);
    const data: any = await response.json();
    expect(data.status).toBe('healthy');
  });

  it('health check returns status even with subpath', async () => {
    const request = new Request('http://localhost/personalitytest/health', { method: 'GET' });
    const response = await worker.fetch(request, {} as any, {} as any);
    const data: any = await response.json();
    expect(data.status).toBe('healthy');
  });

  it('telemetry accepts valid payload', async () => {
    const request = new Request('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify([{ event: 'test', sessionId: '123', timestamp: new Date().toISOString(), metadata: { some: 'data' } }])
    });
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.status).toBe(202);
    const data: any = await response.json();
    expect(data.status).toBe("ok");
    expect(data.ingested).toBe(1);
  });

  it('telemetry accepts valid payload even with subpath', async () => {
    const request = new Request('http://localhost/personalitytest/api/telemetry', {
      method: 'POST',
      body: JSON.stringify([{ event: 'test', sessionId: '123', timestamp: new Date().toISOString() }])
    });
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.status).toBe(202);
    const data: any = await response.json();
    expect(data.status).toBe("ok");
    expect(data.ingested).toBe(1);
  });

  it('telemetry rejects invalid schema payload (missing event)', async () => {
    const request = new Request('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify([{ sessionId: '123', timestamp: new Date().toISOString() }])
    });
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.status).toBe(202); const data = await response.json(); expect(data.error).toBeDefined();
  });

  it('telemetry rejects invalid schema payload (missing sessionId)', async () => {
    const request = new Request('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify([{ event: 'test', timestamp: new Date().toISOString() }])
    });
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.status).toBe(202); const data = await response.json(); expect(data.error).toBeDefined();
  });

  it('telemetry rejects large payloads', async () => {
    const request = new Request('http://localhost/api/telemetry', {
      method: 'POST',
      headers: { 'content-length': '70000' },
      body: JSON.stringify([{ event: 'test', sessionId: '123', timestamp: new Date().toISOString() }])
    });
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.status).toBe(413);
  });

  it('telemetry accepts valid payload on /api/telemetry/events', async () => {
    const request = new Request('http://localhost/api/telemetry/events', {
      method: 'POST',
      body: JSON.stringify([{ event: 'test', sessionId: '123', timestamp: new Date().toISOString() }])
    });
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.status).toBe(202);
    const data: any = await response.json();
    expect(data.status).toBe("ok");
    expect(data.ingested).toBe(1);
  });

  it('telemetry accepts valid payload on /api/v1/telemetry', async () => {
    const request = new Request('http://localhost/api/v1/telemetry', {
      method: 'POST',
      body: JSON.stringify([{ event: 'test', sessionId: '123', timestamp: new Date().toISOString() }])
    });
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.status).toBe(202);
    const data: any = await response.json();
    expect(data.status).toBe("ok");
    expect(data.ingested).toBe(1);
  });

  it('creates and retrieves a share link', async () => {
    // Note: the test mock env needs to have a PERSONALITY_CACHE_KV
    const request = new Request('http://localhost/api/results/share', {
      method: 'POST',
      body: JSON.stringify({ result: { archetype: 'Explorer' } }),
      headers: { 'Content-Type': 'application/json' }
    });

    // We mock ctx and env
    let kvStore = {};
    const env = {
      PERSONALITY_CACHE_KV: {
        put: async (k, v) => { kvStore[k] = v; },
        get: async (k) => kvStore[k],
      }
    };
    const ctx = { waitUntil: (p) => p };

    const res = await worker.fetch(request, env, ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.shareId).toBeDefined();

    const getReq = new Request(`http://localhost/api/results/${data.shareId}`);
    const getRes = await worker.fetch(getReq, env, ctx);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.archetype).toBe('Explorer');
  });
});
