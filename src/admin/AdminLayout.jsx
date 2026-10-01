import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TABS = [
  ['/admin', 'Overview', true],
  ['/admin/books', 'Books'],
  ['/admin/orders', 'Orders'],
  ['/admin/subscribers', 'Subscribers'],
];

// Only admins get past this point. (The database also blocks non-admins from changing anything.)
export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <p className="page-loading">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (!isAdmin) {
    return (
      <section className="auth-page">
        <div className="auth-card center">
          <div className="success-icon">🔒</div>
          <h1>Admins only</h1>
          <p className="auth-sub">This account doesn't have admin access.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin">
      <div className="container">
        <div className="admin-head">
          <h1>Store admin</h1>
          <nav className="admin-tabs">
            {TABS.map(([to, label, end]) => (
              <NavLink key={to} to={to} end={end}>{label}</NavLink>
            ))}
          </nav>
        </div>
        <Outlet />
      </div>
    </section>
  );
}
