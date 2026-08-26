import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { json } from '../_shared/http.ts';

const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes)).map((value) => value.toString(16).padStart(2, '0')).join('');
const sign = async (secret: string, payload: string) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const raw = await request.text();
  const secret = Deno.env.get('CLOVERLY_WEBHOOK_SECRET');
  const supplied = (request.headers.get('cloverly-signature') || '').replace(/^sha256=/, '');
  if (!secret || !supplied || supplied !== await sign(secret, raw)) return json({ error: 'Invalid signature' }, 401);
  try {
    const event = JSON.parse(raw);
    if (!event.id) return json({ error: 'Missing event id' }, 400);
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const payloadHash = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)));
    const { error: replayError } = await admin.from('offset_webhook_events').insert({ provider: 'cloverly', event_id: event.id, payload_hash: payloadHash });
    if (replayError?.code === '23505') return json({ received: true, duplicate: true });
    if (replayError) throw replayError;
    const providerSessionId = event.data?.checkout_id || event.data?.session_id || event.data?.id;
    const greenSessionId = event.data?.metadata?.green_compass_session_id;
    let query = admin.from('offset_checkout_sessions').select('*');
    query = greenSessionId ? query.eq('id', greenSessionId) : query.eq('provider_session_id', providerSessionId);
    const { data: session } = await query.maybeSingle();
    if (!session) throw new Error('Checkout session not found');
    const rawStatus = String(event.data?.status || event.type || '').toLowerCase();
    const status = rawStatus.includes('retir') ? 'retired' : rawStatus.includes('fulfill') || rawStatus.includes('complete') || rawStatus.includes('purchas') ? 'fulfilled' : rawStatus.includes('cancel') ? 'cancelled' : rawStatus.includes('fail') ? 'failed' : 'pending';
    await admin.from('offset_checkout_sessions').update({ status, updated_at: new Date().toISOString() }).eq('id', session.id);
    if (status === 'fulfilled' || status === 'retired') {
      const providerReference = String(event.data?.retirement_id || event.data?.purchase_id || event.data?.id || event.id);
      await admin.from('offset_contributions').upsert({
        user_id: session.user_id, project_id: session.project_id, checkout_session_id: session.id,
        provider_reference: providerReference, status, quantity_kg_co2e: Number(event.data?.carbon_weight?.value || session.quantity_kg_co2e),
        amount_minor: Number(event.data?.amount_minor || 0), currency: event.data?.currency || 'USD',
        certificate_url: event.data?.certificate_url || null, registry_reference: event.data?.registry_reference || null,
        fulfilled_at: new Date().toISOString(), retired_at: status === 'retired' ? new Date().toISOString() : null, updated_at: new Date().toISOString(),
      }, { onConflict: 'provider_reference' });
      await admin.rpc('evaluate_carbon_badges', { p_user_id: session.user_id });
    }
    await admin.from('offset_webhook_events').update({ processed_at: new Date().toISOString() }).eq('provider', 'cloverly').eq('event_id', event.id);
    return json({ received: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Webhook processing failed' }, 500);
  }
});
