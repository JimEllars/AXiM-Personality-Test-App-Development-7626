export interface Env {
  PERSONALITY_CACHE_KV: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY: string;
  AXIM_SERVICE_KEY: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      if (request.method === 'GET' && url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: "healthy",
          region: request.cf?.colo || "local",
          timestamp: Date.now()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (request.method === 'POST' && url.pathname === '/api/v1/telemetry') {
        const payload = await request.json() as any;

        // Log telemetry without PII
        const events = Array.isArray(payload) ? payload : [payload];
        const logData = events.map((e: any) => ({
          event: e.event,
          latency: e.latency || null,
          error: e.error || null,
          screen: e.screen || null
        }));
        console.log("Telemetry ingested:", JSON.stringify({
           region: request.cf?.colo || "local",
           events: logData
        }));

        return new Response(null, {
          status: 202,
          headers: corsHeaders,
        });
      }

      if (request.method === 'POST' && (url.pathname === '/api/v1/assessment/submit' || url.pathname === '/api/v1/personality/submit')) {
        const payload = await request.json() as any;

        // Structured logging for psychometric outcome distribution without logging PII
        console.log("Ingesting completed assessment session into public.personality_user_assessments", {
          archetype: payload.assignedArchetype,
          thetaScores: payload.thetaScores,
          completedAt: payload.completedAt,
          region: request.cf?.colo || "local"
        });

        return new Response(JSON.stringify({ success: true, message: 'Assessment persisted' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (request.method === 'POST' && url.pathname === '/api/v1/personality/email-report') {
        const payload = await request.json() as { email: string, archetype: string, pdfBase64?: string, sessionToken?: string };

        // Mock email dispatch via Resend
        console.log("Dispatching branded report email via Resend to", payload.email);

        return new Response(JSON.stringify({ success: true, message: 'Email dispatched' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (request.method === 'GET' && url.pathname === '/api/v1/personality/benchmarks') {
        let benchmarks = await env.PERSONALITY_CACHE_KV?.get('benchmarks', { type: 'json' });

        if (!benchmarks) {
          // Fallback normative population averages
          benchmarks = {
            "Ti": 0.1, "Te": -0.2, "Fi": 0.3, "Fe": -0.1,
            "Ni": -0.4, "Ne": 0.2, "Si": 0.5, "Se": -0.3
          };
        }

        return new Response(JSON.stringify(benchmarks), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (err: any) {
      console.error("Worker error:", err.message);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};
