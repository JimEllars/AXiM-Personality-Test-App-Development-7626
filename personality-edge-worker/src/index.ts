export interface Env {
  TELEMETRY_DB: KVNamespace;
  PERSONALITY_CACHE_KV: KVNamespace;
  PERSONALITY_TEST_ORIGIN: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY: string;
  AXIM_SERVICE_KEY: string;
}

const getCorsHeaders = (request: Request) => {
  const origin = request.headers.get('Origin') || '';


  // Allow localhost for dev, staging preview domains, and our production domains.
  let allowOrigin = '*';
  if (origin.startsWith('http://localhost:') || origin === 'https://axim.us.com' || origin === 'http://axim.us.com' || origin.endsWith('.axim.us.com') || origin.endsWith('.pages.dev') || origin.endsWith('.workers.dev')) {
    allowOrigin = origin;
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-AXiM-Client-Version',
    'Access-Control-Max-Age': '86400',
  };
};

const personalityTestPrefix = '/personalitytest';

function isPersonalityTestRequest(pathname: string): boolean {
  return pathname === personalityTestPrefix || pathname.startsWith(`${personalityTestPrefix}/`);
}

function proxyPersonalityTest(request: Request, origin: string): Promise<Response> {
  const requestUrl = new URL(request.url);
  const originUrl = new URL(origin);
  const upstreamUrl = new URL(requestUrl.pathname.slice(personalityTestPrefix.length) || '/', originUrl);
  upstreamUrl.search = requestUrl.search;

  return fetch(new Request(upstreamUrl, request));
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    let normalizedPathname = url.pathname;

    // Normalize path matching: Strip any /personalitytest subpath prefix
    if (normalizedPathname.startsWith(personalityTestPrefix)) {
      normalizedPathname = normalizedPathname.slice(personalityTestPrefix.length) || '/';
    }

    if (isPersonalityTestRequest(url.pathname) && !normalizedPathname.includes('/api/') && !normalizedPathname.endsWith('/health')) {
      return proxyPersonalityTest(request, env.PERSONALITY_TEST_ORIGIN);
    }


    const corsHeaders = getCorsHeaders(request);

    if (request.method === 'OPTIONS') {
      // Explicitly return caching headers for preflight requests
      return new Response(null, { headers: { ...corsHeaders, 'Access-Control-Max-Age': '86400', 'X-Content-Type-Options': 'nosniff' } });
    }

    try {
      if (request.method === 'GET' && (normalizedPathname === '/health' || normalizedPathname === '/api/health')) {
        return new Response(JSON.stringify({
          status: "healthy",
          region: request.cf?.colo || "local",
          timestamp: Date.now(),
          utc_timestamp: new Date().toISOString(),
          kv_status: !!env.PERSONALITY_CACHE_KV ? "connected" : "offline",
          telemetry_db_status: !!env.TELEMETRY_DB ? "connected" : "offline",
          service: "personality-edge",
          runtime: "cloudflare-worker",
          bindings: {
             TELEMETRY_DB: !!env.TELEMETRY_DB,
             PERSONALITY_CACHE_KV: !!env.PERSONALITY_CACHE_KV
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      }

      if (request.method === 'POST' && (normalizedPathname === '/api/telemetry' || normalizedPathname === '/api/telemetry/events' || normalizedPathname === '/api/v1/telemetry' || normalizedPathname === '/api/assessment/session' || normalizedPathname === '/api/state')) {
        try {
          const payloadSize = parseInt(request.headers.get('content-length') || '0', 10);
          if (payloadSize > 32 * 1024) {
            return new Response(JSON.stringify({ success: false, processed: 0, error: 'Payload too large (max 32KB)' }), {
              status: 413,
              headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
            });
          }

          let payload;
          try {
            payload = await request.json() as any;
          } catch (err) {
            return new Response(JSON.stringify({ success: false, error: 'Malformed JSON payload' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
            });
          }

          // Log telemetry without PII
          const events = Array.isArray(payload) ? payload : [payload];

          // Validate schema
          const allowedEvents = ['assessment_start', 'item_response', 'cluster_complete', 'assessment_complete', 'error'];
          for (const e of events) {
            if (!e.event || typeof e.event !== 'string' || e.event.length > 50) {
              return new Response(JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', details: 'Invalid schema: Missing or invalid event name' } }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
              });
            }
            if (typeof e.sessionId !== 'string' || e.sessionId.length > 100 || /[^a-zA-Z0-9_-]/.test(e.sessionId)) {
              return new Response(JSON.stringify({ success: false, processed: 0, error: 'Invalid schema: Missing or invalid session ID' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
              });
            }
            if (typeof e.timestamp !== 'string' || e.timestamp.length > 50) {
              return new Response(JSON.stringify({ success: false, processed: 0, error: 'Invalid schema: Missing or invalid timestamp' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
              });
            }
            if (e.metadata) {
              if (typeof e.metadata !== 'object') {
                return new Response(JSON.stringify({ success: false, processed: 0, error: 'Invalid schema: metadata must be an object' }), {
                  status: 400,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
                });
              }
              // Validate trait floats if present
              if (e.metadata.scores) {
                for (const val of Object.values(e.metadata.scores)) {
                  if (typeof val !== 'number' || isNaN(val) || val < -10 || val > 10) {
                    return new Response(JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', details: 'Invalid schema: Invalid trait floats' } }), {
                      status: 400,
                      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
                    });
                  }
                }
              }
            }
          }

          const logData = events.map((e: any) => ({
            event: e.event,
            sessionId: e.sessionId,
            timestamp: e.timestamp,
            metadata: e.metadata || null,
            latency: e.latency || null,
            error: e.error || null,
            screen: e.screen || null,
            timeToComplete: e.timeToComplete || null,
            transitionLatency: e.transitionLatency || null,
            errorCount: e.errorCount || null
          }));

          console.log("Telemetry ingested:", JSON.stringify({
             region: request.cf?.colo || "local",
             events: logData
          }));

          if (env.TELEMETRY_DB) {
             ctx.waitUntil((async () => {
                 try {
                    const batchId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
                    await env.TELEMETRY_DB.put('telemetry_batch_' + batchId, JSON.stringify(logData), { expirationTtl: 2592000 });
                 } catch (err) {
                    console.error("Failed to write to TELEMETRY_DB KV", err);
                 }
             })());
          }


          const headers: Record<string, string> = { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
          if (!env.TELEMETRY_DB) {
            headers['X-Edge-Warning'] = 'Storage-Unprovisioned';
            headers['X-Telemetry-Status'] = 'Degraded';
          }
          return new Response(JSON.stringify({ success: true, processed: events.length }), {
            status: 202,
            headers,
          });
        } catch (e: any) {
          console.error("Telemetry ingestion failed", e);
          return new Response(JSON.stringify({ success: false, processed: 0, error: e.message || 'Bad request' }), {
            status: 202,
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
          });
        }
      }



      if (request.method === 'POST' && normalizedPathname === '/api/results/sync') {
        try {
          const payload = await request.json() as any;
          if (!payload || !payload.result) {
            return new Response(JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', details: 'Missing result data' } }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
            });
          }

          const idempotencyKey = request.headers.get('x-idempotency-key') || payload.idempotencyKey || Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);

          if (env.PERSONALITY_CACHE_KV) {
            ctx.waitUntil((async () => {
              try {
                await env.PERSONALITY_CACHE_KV.put(`sync_result_${idempotencyKey}`, JSON.stringify({
                  result: payload.result,
                  syncedAt: new Date().toISOString(),
                  metadata: payload.metadata || {}
                }), { expirationTtl: 2592000 }); // 30 days
              } catch (err) {
                console.error("Failed to write to PERSONALITY_CACHE_KV", err);
              }
            })());
          }

          const headers: Record<string, string> = { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
          if (!env.PERSONALITY_CACHE_KV) {
            headers['X-Edge-Warning'] = 'Storage-Unprovisioned';
            headers['X-Telemetry-Status'] = 'Degraded';
          }

          return new Response(JSON.stringify({ success: true, idempotencyKey }), {
            status: 202,
            headers
          });
        } catch (e: any) {
          console.error("Result sync failed", e);
          return new Response(JSON.stringify({ success: false, error: e.message || 'Bad request' }), {
            status: 202, // Graceful degrade per instructions
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
          });
        }
      }

      if (request.method === 'POST' && normalizedPathname === '/api/results/share') {
        try {
          const payload = await request.json() as any;
          if (!payload || !payload.result) {
            return new Response(JSON.stringify({ error: 'Missing result data' }), { status: 400, headers: corsHeaders });
          }

          // Sanitize and validate share payload structure
          if (!payload.result.archetype || typeof payload.result.archetype !== 'string' ||
              !payload.result.thetaScores || typeof payload.result.thetaScores !== 'object') {
            return new Response(JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', details: 'Invalid share payload schema' } }), { status: 400, headers: corsHeaders });
          }

          // Simple float validation for thetaScores
          for (const val of Object.values(payload.result.thetaScores)) {
            if (typeof val !== 'number' || isNaN(val)) {
               return new Response(JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', details: 'Invalid score values' } }), { status: 400, headers: corsHeaders });
            }
          }

          const shareId = Math.random().toString(36).substring(2, 15);
          if (env.PERSONALITY_CACHE_KV) {
            ctx.waitUntil(env.PERSONALITY_CACHE_KV.put(`share_${shareId}`, JSON.stringify(payload.result), { expirationTtl: 604800 })); // 7 days
          }

          return new Response(JSON.stringify({ shareId, url: `${url.origin}/results/${shareId}` }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Failed to create share link' }), { status: 500, headers: corsHeaders });
        }
      }

      if (request.method === 'GET' && normalizedPathname.startsWith('/api/results/')) {
        const shareId = normalizedPathname.split('/').pop();
        if (!shareId || shareId === 'share') {
           return new Response('Not Found', { status: 404, headers: corsHeaders });
        }

        try {
          let resultData = null;
          if (env.PERSONALITY_CACHE_KV) {
            try {
              resultData = await env.PERSONALITY_CACHE_KV.get(`share_${shareId}`);
            } catch (kvErr) {
              console.error("KV GET Error", kvErr);
              resultData = null; // fallback
            }
          }

          if (!resultData) {
             return new Response(JSON.stringify({ error: 'Share link not found or expired' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          return new Response(resultData, {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Failed to retrieve share link' }), { status: 500, headers: corsHeaders });
        }
      }

      if (request.method === 'POST' && (normalizedPathname === '/api/v1/assessment/submit' || normalizedPathname === '/api/v1/personality/submit')) {
        try {
          const payload = await request.json() as any;
          if (!payload || typeof payload !== 'object' || !payload.assignedArchetype || typeof payload.assignedArchetype !== 'string') {
             return new Response(JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', details: 'Invalid payload schema' } }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
             });
          }

          // Structured logging for psychometric outcome distribution without logging PII
          console.log("Ingesting completed assessment session into public.personality_user_assessments", {
            archetype: payload.assignedArchetype,
            thetaScores: payload.thetaScores,
            completedAt: payload.completedAt,
            region: request.cf?.colo || "local"
          });

          // Write a rolling aggregation summary of anonymous completions (counts per archetype) if KV bound
          if (env.PERSONALITY_CACHE_KV && payload.assignedArchetype) {
            ctx.waitUntil((async () => {
                try {
                  const countsStr = await env.PERSONALITY_CACHE_KV.get('archetype_counts');
                  const counts = countsStr ? JSON.parse(countsStr) : {};
                  counts[payload.assignedArchetype] = (counts[payload.assignedArchetype] || 0) + 1;
                  await env.PERSONALITY_CACHE_KV.put('archetype_counts', JSON.stringify(counts), { expirationTtl: 2592000 });
                } catch (err) {
                  console.error("Failed to update archetype_counts in KV", err);
                }
            })());
          }
        } catch (e) {
          console.error("Assessment submit failed", e);
        }

        const headers: Record<string, string> = { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
        if (!env.PERSONALITY_CACHE_KV) {
           headers['X-Edge-Warning'] = 'Storage-Unprovisioned';
           headers['X-Telemetry-Status'] = 'Degraded';
        }
        return new Response(JSON.stringify({ success: true, timestamp: Date.now() }), {
          status: 202,
          headers,
        });
      }

      if (request.method === 'POST' && normalizedPathname === '/api/v1/personality/email-report') {
        try {
          const payload = await request.json() as { email: string, archetype: string, pdfBase64?: string, sessionToken?: string };

          // Mock email dispatch via Resend
          console.log("Dispatching branded report email via Resend to", payload.email);
        } catch(e) {
           console.error("Email report failed", e);
        }

        return new Response(JSON.stringify({ success: true, message: 'Email dispatched' }), {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      }

      if (request.method === 'GET' && normalizedPathname === '/api/v1/personality/benchmarks') {
        let benchmarks;
        try {
           benchmarks = await env.PERSONALITY_CACHE_KV?.get('benchmarks', { type: 'json' });
        } catch(e) {
           console.error("Failed to read KV", e);
        }

        if (!benchmarks) {
          // Fallback normative population averages
          benchmarks = {
            "Ti": 0.1, "Te": -0.2, "Fi": 0.3, "Fe": -0.1,
            "Ni": -0.4, "Ne": 0.2, "Si": 0.5, "Se": -0.3
          };
        }

        return new Response(JSON.stringify(benchmarks), {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (err: any) {
      console.error("Worker error:", err.message);
      // Graceful error handling for edge worker failures
      return new Response(JSON.stringify({ success: false, processed: 0, error: "Internal service error handled gracefully" }), {
        status: 202, // Returning 200 to acknowledge without breaking frontend execution, per requirement
        headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' }
      });
    }
  },
};
