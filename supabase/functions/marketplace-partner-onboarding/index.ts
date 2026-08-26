import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';

async function stripe(path: string, method: 'GET' | 'POST', params?: URLSearchParams) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, { method, headers: { Authorization: `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`, ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) }, body: params?.toString() });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || 'Stripe onboarding failed.');
  return body;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    if (!Deno.env.get('STRIPE_SECRET_KEY')) return json({ error: 'Marketplace partner payments are not configured' }, 503);
    const authorization = request.headers.get('Authorization') || '';
    const url = Deno.env.get('SUPABASE_URL')!;
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const [{ data: { user } }, { data: isPublisher }] = await Promise.all([userClient.auth.getUser(), userClient.rpc('is_marketplace_editor', { p_role: 'publisher' })]);
    if (!user || !isPublisher) return json({ error: 'Publisher access required' }, 403);
    const { businessId } = await request.json();
    if (!businessId) return json({ error: 'Business is required' }, 400);
    const { data: business, error: businessError } = await admin.from('marketplace_businesses').select('*').eq('id', businessId).maybeSingle();
    if (businessError) throw businessError;
    if (!business) return json({ error: 'Business not found' }, 404);
    const { data: existing, error: existingError } = await admin.from('marketplace_business_payment_accounts').select('*').eq('business_id', businessId).maybeSingle();
    if (existingError) throw existingError;
    let accountId = existing?.stripe_account_id;
    if (!accountId) {
      const created = await stripe('accounts', 'POST', new URLSearchParams({ type: 'express', country: 'BG', email: business.support_email, business_type: 'company', 'capabilities[card_payments][requested]': 'true', 'capabilities[transfers][requested]': 'true', 'metadata[marketplace_business_id]': businessId }));
      accountId = created.id;
    }
    const account = await stripe(`accounts/${accountId}`, 'GET');
    const { error: paymentAccountError } = await admin.from('marketplace_business_payment_accounts').upsert({ business_id: businessId, stripe_account_id: accountId, onboarding_complete: Boolean(account.details_submitted), charges_enabled: Boolean(account.charges_enabled), payouts_enabled: Boolean(account.payouts_enabled), updated_at: new Date().toISOString() });
    if (paymentAccountError) throw paymentAccountError;
    const returnBase = Deno.env.get('MARKETPLACE_ADMIN_RETURN_URL');
    if (!returnBase) throw new Error('Marketplace admin return URL is not configured.');
    const link = await stripe('account_links', 'POST', new URLSearchParams({ account: accountId, type: 'account_onboarding', refresh_url: `${returnBase}/admin/marketplace?onboarding=refresh&business=${businessId}`, return_url: `${returnBase}/admin/marketplace?onboarding=complete&business=${businessId}` }));
    return json({ onboardingUrl: link.url, accountId, chargesEnabled: Boolean(account.charges_enabled), payoutsEnabled: Boolean(account.payouts_enabled) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to create partner onboarding' }, 400);
  }
});
