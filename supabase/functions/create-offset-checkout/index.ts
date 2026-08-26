import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    if (Deno.env.get('OFFSET_PROVIDER_ENABLED') !== 'true') return json({ error: 'Verified offset checkout is not enabled.' }, 503);
    const authorization = request.headers.get('Authorization') || '';
    const url = Deno.env.get('SUPABASE_URL')!;
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Authentication required' }, 401);
    const { projectId, quantityKgCo2e } = await request.json();
    const quantity = Number(quantityKgCo2e);
    if (!projectId || !Number.isFinite(quantity) || quantity < 1 || quantity > 1000000) return json({ error: 'Invalid project or quantity' }, 400);
    const endpoint = Deno.env.get('CLOVERLY_DIRECT_CHECKOUT_ENDPOINT');
    const apiKey = Deno.env.get('CLOVERLY_API_KEY');
    const returnBase = Deno.env.get('OFFSET_RETURN_URL');
    if (!endpoint || !apiKey || !returnBase) return json({ error: 'Cloverly checkout configuration is incomplete' }, 503);
    const { data: project } = await admin.from('offset_projects').select('*').eq('id', projectId).eq('active', true).maybeSingle();
    if (!project) return json({ error: 'Offset project is not available' }, 404);
    const { data: session, error: sessionError } = await admin.from('offset_checkout_sessions').insert({ user_id: user.id, project_id: project.id, quantity_kg_co2e: quantity }).select().single();
    if (sessionError) throw sessionError;

    const providerResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': session.id },
      body: JSON.stringify({
        project_id: project.provider_project_id,
        carbon_weight: { value: quantity, unit: 'kg' },
        metadata: { green_compass_session_id: session.id, green_compass_user_id: user.id },
        success_url: `${returnBase}?session=${session.id}&result=success`,
        cancel_url: `${returnBase}?session=${session.id}&result=cancelled`,
      }),
    });
    const provider = await providerResponse.json();
    const checkoutUrl = provider.checkout_url || provider.url;
    const providerSessionId = provider.id || provider.checkout_id;
    if (!providerResponse.ok || !checkoutUrl || !providerSessionId) {
      await admin.from('offset_checkout_sessions').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', session.id);
      throw new Error(provider.message || 'Cloverly did not return a checkout session');
    }
    await admin.from('offset_checkout_sessions').update({ provider_session_id: providerSessionId, checkout_url: checkoutUrl, expires_at: provider.expires_at || null, updated_at: new Date().toISOString() }).eq('id', session.id);
    return json({ sessionId: session.id, checkoutUrl });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to create checkout' }, 500);
  }
});
