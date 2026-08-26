import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { json } from '../_shared/http.ts';

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (request.headers.get('x-reconciliation-secret') !== Deno.env.get('OFFSET_RECONCILIATION_SECRET')) return json({ error: 'Unauthorized' }, 401);
  const endpoint = Deno.env.get('CLOVERLY_CHECKOUT_STATUS_ENDPOINT');
  const apiKey = Deno.env.get('CLOVERLY_API_KEY');
  if (!endpoint || !apiKey) return json({ error: 'Provider status configuration is incomplete' }, 503);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: sessions, error } = await admin.from('offset_checkout_sessions').select('*').eq('status', 'pending').not('provider_session_id', 'is', null).lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()).limit(100);
  if (error) return json({ error: error.message }, 500);
  let updated = 0;
  for (const session of sessions || []) {
    const response = await fetch(`${endpoint.replace(/\/$/, '')}/${encodeURIComponent(session.provider_session_id)}`, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!response.ok) continue;
    const provider = await response.json();
    const raw = String(provider.status || '').toLowerCase();
    const status = raw.includes('retir') ? 'retired' : raw.includes('fulfill') || raw.includes('complete') ? 'fulfilled' : raw.includes('cancel') ? 'cancelled' : raw.includes('fail') ? 'failed' : 'pending';
    if (status !== 'pending') {
      await admin.from('offset_checkout_sessions').update({ status, updated_at: new Date().toISOString() }).eq('id', session.id);
      if (status === 'fulfilled' || status === 'retired') { await admin.from('offset_contributions').upsert({ user_id: session.user_id, project_id: session.project_id, checkout_session_id: session.id, provider_reference: String(provider.retirement_id || provider.purchase_id || provider.id), status, quantity_kg_co2e: Number(provider.carbon_weight?.value || session.quantity_kg_co2e), amount_minor: Number(provider.amount_minor || 0), currency: provider.currency || 'USD', certificate_url: provider.certificate_url || null, registry_reference: provider.registry_reference || null, fulfilled_at: new Date().toISOString(), retired_at: status === 'retired' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }, { onConflict: 'provider_reference' }); await admin.rpc('evaluate_carbon_badges', { p_user_id: session.user_id }); }
      updated += 1;
    }
  }
  return json({ checked: sessions?.length || 0, updated });
});
