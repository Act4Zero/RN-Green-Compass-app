import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { json } from '../_shared/http.ts';

const toHex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes)).map((value) => value.toString(16).padStart(2, '0')).join('');
const safeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
};

async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  const entries = header.split(',').map((part) => part.split('=')).reduce<Record<string, string[]>>((all, [key, value]) => ({ ...all, [key]: [...(all[key] || []), value] }), {});
  const timestamp = entries.t?.[0];
  if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`)));
  return (entries.v1 || []).some((signature) => safeEqual(signature, expected));
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') || '';
  const secret = Deno.env.get('STRIPE_CONNECT_WEBHOOK_SECRET') || '';
  if (!secret || !await verifyStripeSignature(payload, signature, secret)) return json({ error: 'Invalid signature' }, 400);
  try {
    const event = JSON.parse(payload);
    const object = event.data?.object || {};
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let orderId = object.metadata?.order_id || object.payment_intent?.metadata?.order_id;
    if (!orderId && typeof object.payment_intent === 'string') {
      const { data } = await admin.from('marketplace_orders').select('id').eq('stripe_payment_intent_id', object.payment_intent).maybeSingle();
      orderId = data?.id;
    }
    if (!orderId) return json({ received: true, ignored: true });
    const { error } = await admin.rpc('process_marketplace_payment_event', { p_event_id: event.id, p_event_type: event.type, p_order_id: orderId, p_payload: event });
    if (error) throw error;
    return json({ received: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Webhook processing failed' }, 500);
  }
});
