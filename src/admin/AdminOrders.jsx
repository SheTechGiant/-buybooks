import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FORMATS, formatPrice } from '../../shared/shop';

const FILTERS = [
  ['paid', 'To ship / paid'],
  ['shipped', 'Shipped'],
  ['all', 'All'],
];
const STATUS_LABEL = { pending: 'Awaiting payment', paid: 'Paid', shipped: 'Shipped', cancelled: 'Cancelled' };

function Address({ shipping }) {
  if (!shipping?.address) return null;
  const a = shipping.address;
  return (
    <address className="ship-address">
      <strong>{shipping.name}</strong><br />
      {a.line1}{a.line2 && <>, {a.line2}</>}<br />
      {[a.city, a.state, a.postal_code].filter(Boolean).join(', ')}<br />
      {a.country}
    </address>
  );
}

export default function AdminOrders() {
  const [filter, setFilter] = useState('paid');
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    setOrders(null);
    let query = supabase
      .from('orders')
      .select('id, created_at, email, status, subtotal, shipping, total, shipping_address, order_items(title, format, quantity, unit_price)')
      .order('created_at', { ascending: false })
      .limit(200);
    query = filter === 'all' ? query.neq('status', 'pending') : query.eq('status', filter);
    query.then(({ data, error }) => {
      if (error) setError(error.message);
      setOrders(data || []);
    });
  }, [filter]);

  async function setStatus(order, status) {
    setBusy(order.id);
    setError('');
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
    setBusy(null);
    if (error) return setError(error.message);
    setOrders(list => (filter === 'all' ? list.map(o => (o.id === order.id ? { ...o, status } : o)) : list.filter(o => o.id !== order.id)));
  }

  return (
    <div className="dash-card">
      <div className="admin-toolbar">
        <div className="pill-tabs">
          {FILTERS.map(([key, label]) => (
            <button key={key} type="button" className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      {!orders ? <p className="muted">Loading…</p> : !orders.length ? (
        <p className="muted center">No orders here yet.</p>
      ) : (
        <div className="orders">
          {orders.map(order => {
            const physical = order.order_items.some(i => FORMATS[i.format]?.physical);
            return (
              <div className="order" key={order.id}>
                <div className="order-head">
                  <span>
                    <strong>#{order.id.slice(0, 8).toUpperCase()}</strong> · {new Date(order.created_at).toLocaleString()} · {order.email}
                  </span>
                  <span className={`status-pill status-${order.status}`}>{STATUS_LABEL[order.status]}</span>
                </div>
                <div className="admin-order-body">
                  <ul>
                    {order.order_items.map((i, n) => (
                      <li key={n}>
                        <span>{i.quantity} × {i.title} <small className="muted">({FORMATS[i.format]?.label})</small></span>
                        <span>{formatPrice(i.unit_price * i.quantity)}</span>
                      </li>
                    ))}
                    <li className="order-total-row"><span>Shipping</span><span>{formatPrice(order.shipping)}</span></li>
                    <li className="order-total-row"><strong>Total</strong><strong>{formatPrice(order.total)}</strong></li>
                  </ul>
                  {physical ? <Address shipping={order.shipping_address} /> : <p className="muted small">eBooks only — nothing to ship.</p>}
                </div>
                {physical && order.status === 'paid' && (
                  <button className="btn btn-primary btn-sm" disabled={busy === order.id} onClick={() => setStatus(order, 'shipped')}>
                    {busy === order.id ? 'Saving…' : '📦 Mark as shipped'}
                  </button>
                )}
                {order.status === 'shipped' && (
                  <button className="link-btn" disabled={busy === order.id} onClick={() => setStatus(order, 'paid')}>Undo shipped</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
