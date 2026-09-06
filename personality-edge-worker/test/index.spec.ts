import { describe, it, expect } from 'vitest';
import worker from '../src/index';

describe('Edge Worker', () => {
  it('responds to OPTIONS with CORS headers', async () => {
    const request = new Request('http://localhost/api/v1/telemetry', { method: 'OPTIONS' });
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://axim.us.com');
  });

  it('health check returns status', async () => {
    const request = new Request('http://localhost/health', { method: 'GET' });
    const response = await worker.fetch(request, {} as any, {} as any);
    const data: any = await response.json();
    expect(data.status).toBe('healthy');
  });

  it('telemetry accepts payload', async () => {
    const request = new Request('http://localhost/api/v1/telemetry', {
      method: 'POST',
      body: JSON.stringify([{ event: 'test' }])
    });
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.status).toBe(200);
  });
});
