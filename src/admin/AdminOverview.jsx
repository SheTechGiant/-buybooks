import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../../shared/shop';

const LOW_STOCK = 5;

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    Promise.all([
      supabase.from('orders').select('total, created_at, status').in('status', ['paid', 'shipped']),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
      supabase.from('books').select('id, title, paperback_stock, paperback_price, active').not('paperback_price', 'is', null).lte('paperback_stock', LOW_STOCK).order('paperback_stock'),
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('leads').select('id', { count: 'exact', head: true }),
    ]).then(([sales, toShip, lowStock, books, leads]) => {
      const failed = [sales, toShip, lowStock, books, leads].find(r => r.error);
      if (failed) return setError(failed.error.message);
      const today = sales.data.filter(o => new Date(o.created_at) >= startOfDay);
      setStats({
        revenue: sales.data.reduce((s, o) => s + Number(o.total), 0),
        orders: sales.data.length,
        todayRevenue: today.reduce((s, o) => s + Number(o.total), 0),
        todayOrders: today.length,
        toShip: toShip.count,
        lowStock: lowStock.data,
        books: books.count,
        subscribers: leads.count,
      });
    });
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!stats) return <p className="muted">Loading…</p>;

  return (
    <>
      <div className="stat-tiles">
        <div className="stat-tile"><span>Sales today</span><strong>{formatPrice(stats.todayRevenue)}</strong><small>{stats.todayOrders} orders</small></div>
        <div className="stat-tile"><span>All-time sales</span><strong>{formatPrice(stats.revenue)}</strong><small>{stats.orders} orders</small></div>
        <Link to="/admin/orders" className={`stat-tile${stats.toShip ? ' attention' : ''}`}><span>Waiting to ship</span><strong>{stats.toShip}</strong><small>View orders →</small></Link>
        <Link to="/admin/books" className="stat-tile"><span>Books</span><strong>{stats.books}</strong><small>Manage books →</small></Link>
        <Link to="/admin/subscribers" className="stat-tile"><span>Subscribers</span><strong>{stats.subscribers}</strong><small>Newsletter →</small></Link>
      </div>

      <div className="dash-card">
        <h3>Low paperback stock</h3>
        {!stats.lowStock.length ? (
          <p className="muted">All paperbacks have more than {LOW_STOCK} copies. 👍</p>
        ) : (
          <ul className="simple-list">
            {stats.lowStock.map(b => (
              <li key={b.id}>
                <Link to={`/admin/books/${b.id}`}>{b.title}</Link>
                <span className={b.paperback_stock === 0 ? 'badge-danger' : 'badge-warn'}>
                  {b.paperback_stock === 0 ? 'Out of stock' : `${b.paperback_stock} left`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
