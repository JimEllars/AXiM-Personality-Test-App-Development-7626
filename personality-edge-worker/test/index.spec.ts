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
});
