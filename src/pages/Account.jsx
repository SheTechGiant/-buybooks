import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookCover from '../components/BookCover';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../lib/catalog';
import { supabase } from '../lib/supabase';
import { getEbookLink } from '../lib/api';
import { FORMATS, formatPrice } from '../../shared/shop';

const STATUS_LABEL = { pending: 'Awaiting payment', paid: 'Paid', shipped: 'Shipped', cancelled: 'Cancelled' };

export default function Account() {
  const { user } = useAuth();
  const { books } = useBooks();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    supabase
      .from('orders')
      .select('id, created_at, status, total, shipping, order_items(book_id, title, format, quantity, unit_price)')
      .neq('status', 'pending')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError('Could not load your orders.');
        setOrders(data || []);
        setLoading(false);
      });
  }, []);

  // Every eBook from a paid order, without duplicates.
  const library = [];
  for (const order of orders.filter(o => o.status === 'paid' || o.status === 'shipped')) {
    for (const item of order.order_items) {
      if (item.format === 'ebook' && !library.some(l => l.book_id === item.book_id)) library.push(item);
    }
  }

  async function download(bookId) {
    setError('');
    setDownloading(bookId);
    try {
      window.location.href = await getEbookLink(bookId);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(null);
    }
  }

  const name = user.user_metadata?.full_name || user.email;

  return (
    <section className="section dashboard">
      <div className="container">
        <span className="eyebrow">My account</span>
        <h1>Hello, {name}</h1>
        <p className="muted">Signed in as {user.email}</p>
        {error && <p className="form-error">{error}</p>}

        <div className="dash-card">
          <h3>My eBook library</h3>
          {loading ? <p>Loading…</p> : !library.length ? (
            <p className="muted">eBooks you buy will appear here, ready to download any time.</p>
          ) : (
            <div className="library-grid">
              {library.map(item => {
                const book = books.find(b => b.id === item.book_id);
                return (
                  <div className="library-item" key={item.book_id}>
                    {book && <BookCover book={book} size="sm" />}
                    <div>
                      <strong>{item.title}</strong>
                      <button className="btn btn-primary btn-sm" disabled={downloading === item.book_id} onClick={() => download(item.book_id)}>
                        {downloading === item.book_id ? 'Preparing…' : 'Download EPUB'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="dash-card">
          <h3>Order history</h3>
          {loading ? <p>Loading…</p> : !orders.length ? (
            <p className="muted">No orders yet. <Link to="/books" className="text-link">Start browsing →</Link></p>
          ) : (
            <div className="orders">
              {orders.map(order => (
                <div className="order" key={order.id}>
                  <div className="order-head">
                    <span><strong>Order #{order.id.slice(0, 8).toUpperCase()}</strong> · {new Date(order.created_at).toLocaleDateString()}</span>
                    <span className={`status-pill status-${order.status}`}>{STATUS_LABEL[order.status] || order.status}</span>
                  </div>
                  <ul>
                    {order.order_items.map((i, n) => (
                      <li key={n}>
                        <span>{i.quantity} × {i.title} <small className="muted">({FORMATS[i.format]?.label})</small></span>
                        <span>{formatPrice(i.unit_price * i.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="order-total">
                    {Number(order.shipping) > 0 && <span className="muted">Shipping {formatPrice(order.shipping)} · </span>}
                    <strong>Total {formatPrice(order.total)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
