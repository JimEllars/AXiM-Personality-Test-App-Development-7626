import { describe, it, expect } from 'vitest';
import worker from '../src/index';

describe('Edge Worker Missing KV', () => {
  it('returns Storage-Unprovisioned warning when TELEMETRY_DB is missing', async () => {
    const request = new Request('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify([{ event: 'test', sessionId: '123', timestamp: new Date().toISOString(), metadata: { some: 'data' } }])
    });
    // Env is empty object => no TELEMETRY_DB
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.status).toBe(202);
    expect(response.headers.get('X-Edge-Warning')).toBe('Storage-Unprovisioned');
  });

  it('returns Storage-Unprovisioned warning when PERSONALITY_CACHE_KV is missing', async () => {
    const request = new Request('http://localhost/api/v1/assessment/submit', {
      method: 'POST',
      body: JSON.stringify({ assignedArchetype: 'Explorer' })
    });
    // Env is empty object => no PERSONALITY_CACHE_KV
    const response = await worker.fetch(request, {} as any, {} as any);
    expect(response.status).toBe(202);
    expect(response.headers.get('X-Edge-Warning')).toBe('Storage-Unprovisioned');
  });
});
