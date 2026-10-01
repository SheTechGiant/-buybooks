import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCover from '../components/BookCover';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../lib/catalog';
import { isSupabaseConfigured } from '../lib/supabase';
import { startCheckout } from '../lib/api';
import { FORMATS, FREE_SHIPPING_MIN, MAX_QTY, calcTotals, formatPrice, priceOf } from '../../shared/shop';

export default function Cart() {
  const { items, setQty, remove } = useCart();
  const { books, loading } = useBooks();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <p className="page-loading">Loading your cart…</p>;

  // Join cart lines with catalog data; drop anything no longer sold.
  const lines = items
    .map(i => ({ ...i, book: books.find(b => b.id === i.bookId) }))
    .filter(l => l.book && priceOf(l.book, l.format) != null);
  const totals = calcTotals(lines);
  const physicalSubtotal = lines.filter(l => FORMATS[l.format].physical).reduce((s, l) => s + priceOf(l.book, l.format) * l.qty, 0);
  const toFreeShipping = FREE_SHIPPING_MIN - physicalSubtotal;

  async function checkout() {
    setError('');
    if (!isSupabaseConfigured) {
      setError('Checkout is not connected yet — add your Supabase and Stripe keys to .env.');
      return;
    }
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    try {
      setBusy(true);
      await startCheckout(lines.map(({ bookId, format, qty }) => ({ bookId, format, qty })));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (!lines.length) {
    return (
      <section className="auth-page">
        <div className="auth-card center">
          <div className="success-icon">🛒</div>
          <h1>Your cart is empty</h1>
          <p className="auth-sub">Find something wonderful to read.</p>
          <Link to="/books" className="btn btn-primary btn-block">Browse books</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="container">
        <h1>Your cart</h1>
        <div className="cart-grid">
          <div className="cart-lines">
            {lines.map(({ book, format, qty }) => {
              const max = format === 'ebook' ? 1 : Math.min(MAX_QTY, book.paperback_stock);
              return (
                <div className="cart-line" key={`${book.id}-${format}`}>
                  <Link to={`/books/${book.id}`}><BookCover book={book} size="sm" /></Link>
                  <div className="cart-line-info">
                    <Link to={`/books/${book.id}`} className="cart-line-title">{book.title}</Link>
                    <span className="muted">{book.author}</span>
                    <span className="chip">{FORMATS[format].label}</span>
                  </div>
                  <div className="cart-line-qty">
                    {format === 'ebook' ? (
                      <span className="muted small">1 licence</span>
                    ) : (
                      <div className="qty">
                        <button onClick={() => setQty(book.id, format, qty - 1)} aria-label="Decrease quantity">−</button>
                        <span>{qty}</span>
                        <button onClick={() => setQty(book.id, format, Math.min(max, qty + 1))} disabled={qty >= max} aria-label="Increase quantity">+</button>
                      </div>
                    )}
                    <button className="link-btn" onClick={() => remove(book.id, format)}>Remove</button>
                  </div>
                  <strong className="cart-line-price">{formatPrice(priceOf(book, format) * qty)}</strong>
                </div>
              );
            })}
          </div>

          <aside className="order-summary">
            <h2>Order summary</h2>
            {totals.hasPhysical && toFreeShipping > 0 && (
              <p className="ship-hint">Add {formatPrice(toFreeShipping)} more in paperbacks for <strong>free shipping</strong>.</p>
            )}
            <div className="sum-row"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
            <div className="sum-row">
              <span>Shipping</span>
              <span>{!totals.hasPhysical ? '—' : totals.shipping ? formatPrice(totals.shipping) : 'Free'}</span>
            </div>
            <div className="sum-row total"><span>Total</span><span>{formatPrice(totals.total)}</span></div>
            <p className="muted small">Taxes, if any, are calculated at checkout.</p>
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary btn-block btn-lg" onClick={checkout} disabled={busy}>
              {busy ? 'Redirecting to payment…' : user ? 'Checkout securely' : 'Sign in to checkout'}
            </button>
            <Link to="/books" className="continue-link">← Continue shopping</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
