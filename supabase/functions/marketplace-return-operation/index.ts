import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const authorization = request.headers.get('Authorization') || '';
    const url = Deno.env.get('SUPABASE_URL')!;
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const [{ data: { user } }, { data: isPublisher }] = await Promise.all([userClient.auth.getUser(), userClient.rpc('is_marketplace_editor', { p_role: 'publisher' })]);
    if (!user || !isPublisher) return json({ error: 'Publisher access required' }, 403);
    const { returnRequestId, decision, amountCents } = await request.json();
    if (!returnRequestId || !['refund', 'reject'].includes(decision)) return json({ error: 'Invalid return operation' }, 400);
    const { data: returnRequest, error: returnError } = await admin.from('marketplace_return_requests').select('*,marketplace_orders(*)').eq('id', returnRequestId).maybeSingle();
    if (returnError) throw returnError;
    if (!returnRequest) return json({ error: 'Return request not found' }, 404);
    if (!['requested', 'approved', 'received'].includes(returnRequest.status)) return json({ error: 'Return request is already closed' }, 409);
    if (decision === 'reject') {
      const { error: rejectError } = await admin.from('marketplace_return_requests').update({ status: 'rejected', reviewer_id: user.id, reviewed_at: new Date().toISOString() }).eq('id', returnRequestId);
      if (rejectError) throw rejectError;
      const { error: orderError } = await admin.from('marketplace_orders').update({ status: 'delivered', updated_at: new Date().toISOString() }).eq('id', returnRequest.order_id);
      if (orderError) throw orderError;
      return json({ status: 'rejected' });
    }
    const order = returnRequest.marketplace_orders;
    if (!order?.stripe_payment_intent_id || !order?.stripe_account_id) return json({ error: 'Order payment reference is unavailable' }, 409);
    if (!Deno.env.get('STRIPE_SECRET_KEY')) return json({ error: 'Marketplace refunds are not configured' }, 503);
    const amount = amountCents == null ? Number(order.total_cents) : Number(amountCents);
    if (!Number.isInteger(amount) || amount < 1 || amount > Number(order.total_cents)) return json({ error: 'Invalid refund amount' }, 400);
    const params = new URLSearchParams({ payment_intent: order.stripe_payment_intent_id, amount: String(amount), reason: 'requested_by_customer', 'metadata[order_id]': order.id, 'metadata[return_request_id]': returnRequestId });
    if (order.application_fee_cents > 0) params.set('refund_application_fee', 'true');
    const response = await fetch('https://api.stripe.com/v1/refunds', { method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`, 'Stripe-Account': order.stripe_account_id, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
    const refund = await response.json();
    if (!response.ok) throw new Error(refund?.error?.message || 'Stripe refund failed.');
    const { error: updateError } = await admin.from('marketplace_return_requests').update({ status: 'refunded', reviewer_id: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', returnRequestId);
    if (updateError) throw updateError;
    return json({ status: 'refund_submitted', refundId: refund.id });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Return operation failed' }, 400);
  }
});
