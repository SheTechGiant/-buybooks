import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { CATEGORY_NAMES, FREE_SHIPPING_MIN, formatPrice } from '../../shared/shop';

const NAV = [
  ['/books', 'All Books'],
  ...CATEGORY_NAMES.map(c => [`/books?category=${encodeURIComponent(c)}`, c]),
  ['/books?format=ebook', 'eBooks'],
];

function SearchBox({ onDone }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  return (
    <form
      className="search-box"
      role="search"
      onSubmit={e => {
        e.preventDefault();
        navigate(`/books${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
        onDone?.();
      }}
    >
      <input type="search" placeholder="Search titles, authors…" aria-label="Search books" value={q} onChange={e => setQ(e.target.value)} />
      <button type="submit" aria-label="Search">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M10 2a8 8 0 0 1 6.3 12.9l5.4 5.4-1.4 1.4-5.4-5.4A8 8 0 1 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" /></svg>
      </button>
    </form>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  async function logout() {
    close();
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <header className="site-header" id="top">
      <div className="promo-bar">
        Free shipping on paperback orders over {formatPrice(FREE_SHIPPING_MIN)} · eBooks delivered instantly
      </div>

      <div className="container header-inner">
        <Logo />
        <div className="header-search"><SearchBox /></div>

        <div className="header-icons">
          {isAdmin && (
            <Link to="/admin" className="icon-link admin-link" onClick={close}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 1 3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4Zm0 2.2 7 3.1V11c0 4.4-2.9 8.6-7 9.9-4.1-1.3-7-5.5-7-9.9V6.3l7-3.1Z" /></svg>
              <span className="icon-label">Admin</span>
            </Link>
          )}
          {user ? (
            <>
              <Link to="/account" className="icon-link" onClick={close}>
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 12a8 8 0 0 1 16 0h-2a6 6 0 0 0-12 0H4Z" /></svg>
                <span className="icon-label">Account</span>
              </Link>
              <button className="icon-link hide-sm" onClick={logout}><span className="icon-label">Log out</span></button>
            </>
          ) : (
            <Link to="/login" className="icon-link" onClick={close}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 12a8 8 0 0 1 16 0h-2a6 6 0 0 0-12 0H4Z" /></svg>
              <span className="icon-label">Sign in</span>
            </Link>
          )}
          <Link to="/cart" className="icon-link cart-link" onClick={close} aria-label={`Cart, ${count} items`}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm10 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM1 2h3.3l1 2H21a1 1 0 0 1 .9 1.4l-3.6 7a2 2 0 0 1-1.8 1.1H8.1l-.9 1.5h12.8v2H5.5a1 1 0 0 1-.9-1.5l1.6-2.8L3 4H1V2Z" /></svg>
            <span className="icon-label">Cart</span>
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <button
            className={`menu-toggle${open ? ' open' : ''}`}
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <nav className={`cat-nav${open ? ' open' : ''}`} aria-label="Shop">
        <div className="container cat-nav-inner">
          <div className="mobile-search"><SearchBox onDone={close} /></div>
          {NAV.map(([to, label]) => (
            <Link key={to} to={to} onClick={close}>{label}</Link>
          ))}
          {user && <button className="cat-nav-logout" onClick={logout}>Log out</button>}
        </div>
      </nav>
    </header>
  );
}
