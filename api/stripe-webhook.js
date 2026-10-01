// POST /api/stripe-webhook
// Stripe calls this when a checkout is paid, fails or expires. Paid orders unlock eBooks
// and reduce paperback stock (both done atomically by the mark_order_paid database function).
import { stripe, supabaseAdmin } from './_lib.js';

// Stripe needs the exact raw body to verify the signature.
export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

async function markPaid(session) {
  const orderId = session.metadata?.order_id;
  if (!orderId || session.payment_status !== 'paid') return;

  // Newer Stripe API versions put the shipping address under collected_information.
  const shipping = session.collected_information?.shipping_details ?? session.shipping_details ?? null;

  const { error } = await supabaseAdmin.rpc('mark_order_paid', {
    p_order_id: orderId,
    p_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
    p_shipping_address: shipping,
  });
  if (error) throw error;
}

async function markCancelled(session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) return;
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .eq('status', 'pending');
  if (error) throw error;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature check failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await markPaid(event.data.object);
        break;
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed':
        await markCancelled(event.data.object);
        break;
      default:
        break;
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(`Failed to handle ${event.type}:`, err);
    // 500 tells Stripe to retry later.
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
