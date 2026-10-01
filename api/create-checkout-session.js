// POST /api/create-checkout-session  { items: [{ bookId, format: 'paperback'|'ebook', qty }] }
// Re-checks prices and stock against the database (never trusts the browser), saves a pending
// order, and returns a Stripe Checkout URL.
import { stripe, supabaseAdmin, siteUrl, shippingCountries, getUserFromRequest, methodNotAllowed } from './_lib.js';
import { CURRENCY, FORMATS, MAX_QTY, calcTotals, priceOf } from '../shared/shop.js';

const toCents = amount => Math.round(Number(amount) * 100);

class CartError extends Error {}

// Validates the raw cart and merges duplicate lines.
function parseItems(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 50) throw new CartError('Your cart is empty.');
  const merged = new Map();
  for (const item of raw) {
    const { bookId, format } = item || {};
    const qty = Number(item?.qty);
    if (typeof bookId !== 'string' || !FORMATS[format] || !Number.isInteger(qty) || qty < 1) {
      throw new CartError('Your cart contains an invalid item.');
    }
    const key = `${bookId}:${format}`;
    const total = (merged.get(key)?.qty || 0) + qty;
    merged.set(key, { bookId, format, qty: format === 'ebook' ? 1 : Math.min(total, MAX_QTY) });
  }
  return [...merged.values()];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Please sign in first.' });

    const items = parseItems(req.body?.items);

    const { data: books, error: booksError } = await supabaseAdmin
      .from('books')
      .select('id, title, author, paperback_price, paperback_stock, ebook_price, active')
      .in('id', [...new Set(items.map(i => i.bookId))]);
    if (booksError) throw booksError;

    const lines = items.map(item => {
      const book = books.find(b => b.id === item.bookId);
      if (!book || book.active === false || priceOf(book, item.format) == null) {
        throw new CartError('One of the books in your cart is no longer available.');
      }
      if (item.format === 'paperback' && book.paperback_stock < item.qty) {
        throw new CartError(`Sorry, only ${book.paperback_stock} paperback copies of “${book.title}” are left.`);
      }
      return { ...item, book };
    });

    const totals = calcTotals(lines);

    // 1. Save a pending order (marked paid by the Stripe webhook).
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        email: user.email,
        status: 'pending',
        currency: CURRENCY,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
      })
      .select('id')
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(
      lines.map(l => ({
        order_id: order.id,
        book_id: l.book.id,
        title: l.book.title,
        format: l.format,
        quantity: l.qty,
        unit_price: priceOf(l.book, l.format),
      }))
    );
    if (itemsError) throw itemsError;

    // 2. Create the Stripe Checkout page.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { order_id: order.id },
      payment_intent_data: { metadata: { order_id: order.id } },
      line_items: lines.map(l => ({
        quantity: l.qty,
        price_data: {
          currency: CURRENCY,
          unit_amount: toCents(priceOf(l.book, l.format)),
          product_data: {
            name: `${l.book.title} (${FORMATS[l.format].label})`,
            description: `by ${l.book.author}`,
          },
        },
      })),
      ...(totals.hasPhysical && {
        shipping_address_collection: { allowed_countries: shippingCountries() },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              display_name: totals.shipping ? 'Standard shipping' : 'Free shipping',
              fixed_amount: { amount: toCents(totals.shipping), currency: CURRENCY },
              delivery_estimate: {
                minimum: { unit: 'business_day', value: 2 },
                maximum: { unit: 'business_day', value: 7 },
              },
            },
          },
        ],
      }),
      success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/cart`,
    });

    await supabaseAdmin.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id);

    return res.status(200).json({ url: session.url });
  } catch (err) {
    if (err instanceof CartError) return res.status(400).json({ error: err.message });
    console.error('create-checkout-session failed:', err);
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
}
