import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';

const stripeRequest = async (path: string, accountId: string, params: URLSearchParams) => {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
      'Stripe-Account': accountId,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || 'Stripe could not create the payment.');
  return body;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    if (!Deno.env.get('STRIPE_SECRET_KEY')) return json({ error: 'Marketplace payments are not configured.' }, 503);
    const authorization = request.headers.get('Authorization') || '';
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Authentication required' }, 401);
    const { address, platform } = await request.json();
    const { data: prepared, error: prepareError } = await userClient.rpc('prepare_marketplace_checkout', { p_shipping_address: address, p_platform: platform });
    if (prepareError) throw prepareError;
    const orderId = prepared.orderId;
    const fee = Number(prepared.applicationFeeCents || 0);
    if (platform === 'web') {
      const returnBase = Deno.env.get('MARKETPLACE_RETURN_URL');
      if (!returnBase) throw new Error('Marketplace return URL is not configured.');
      const params = new URLSearchParams({
        mode: 'payment', success_url: `${returnBase}/marketplace/orders/${orderId}?result=success`, cancel_url: `${returnBase}/marketplace/cart?result=cancelled`,
        'line_items[0][price_data][currency]': 'eur', 'line_items[0][price_data][product_data][name]': `Green Compass order ${orderId}`,
        'line_items[0][price_data][unit_amount]': String(prepared.amountCents), 'line_items[0][quantity]': '1',
        'metadata[order_id]': orderId, 'payment_intent_data[metadata][order_id]': orderId,
      });
      if (prepared.customerEmail) params.set('customer_email', prepared.customerEmail);
      if (fee > 0) params.set('payment_intent_data[application_fee_amount]', String(fee));
      const session = await stripeRequest('checkout/sessions', prepared.stripeAccountId, params);
      const { error } = await userClient.rpc('attach_marketplace_payment_reference', { p_order_id: orderId, p_checkout_session_id: session.id });
      if (error) throw error;
      return json({ orderId, checkoutUrl: session.url, stripeAccountId: prepared.stripeAccountId, businessName: prepared.businessName });
    }
    const params = new URLSearchParams({ amount: String(prepared.amountCents), currency: 'eur', 'automatic_payment_methods[enabled]': 'true', 'metadata[order_id]': orderId });
    if (fee > 0) params.set('application_fee_amount', String(fee));
    const intent = await stripeRequest('payment_intents', prepared.stripeAccountId, params);
    const { error } = await userClient.rpc('attach_marketplace_payment_reference', { p_order_id: orderId, p_payment_intent_id: intent.id });
    if (error) throw error;
    return json({ orderId, paymentIntentClientSecret: intent.client_secret, stripeAccountId: prepared.stripeAccountId, businessName: prepared.businessName });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to create checkout' }, 400);
  }
});
