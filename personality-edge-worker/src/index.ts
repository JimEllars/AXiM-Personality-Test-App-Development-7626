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
      if (request.method === 'POST' && url.pathname === '/api/v1/personality/submit') {
        const payload = await request.json() as any;

        // Mock persistence to central API / Supabase
        console.log("Ingesting completed assessment session into public.personality_user_assessments", payload);

        return new Response(JSON.stringify({ success: true, message: 'Assessment persisted' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (request.method === 'POST' && url.pathname === '/api/v1/personality/email-report') {
        const payload = await request.json() as { email: string, archetype: string, pdfBase64?: string, sessionToken?: string };

        // Mock email dispatch via Resend
        console.log("Dispatching branded report email via Resend to", payload.email);

        // Example structure for fetch call to Resend:
        /*
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'AXiM <noreply@axim.us.com>',
            to: [payload.email],
            subject: `Your AXiM Cognitive Profile: ${payload.archetype}`,
            html: `<p>Here is your cognitive profile report for ${payload.archetype}.</p>`,
            attachments: payload.pdfBase64 ? [{
              filename: `AXiM-${payload.archetype}-Profile.pdf`,
              content: payload.pdfBase64.split(',')[1] || payload.pdfBase64
            }] : []
          })
        });
        */

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
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};
