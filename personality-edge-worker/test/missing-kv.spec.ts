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

  it('returns Storage-Unprovisioned warning when PERSONALITY_CACHE_KV is missing on sync result', async () => {
    const request = new Request('http://localhost/api/results/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: { data: 'test' } })
    });
    const ctx = { waitUntil: () => {} };

    // Omitting env completely to trigger missing KV code paths
    const response = await worker.fetch(request, {} as any, ctx as any);
    expect(response.status).toBe(202);
    expect(response.headers.get('X-Edge-Warning')).toBe('Storage-Unprovisioned');
    expect(response.headers.get('X-Telemetry-Status')).toBe('Degraded');
  });

});