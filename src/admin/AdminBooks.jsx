import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookCover from '../components/BookCover';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../../shared/shop';

export default function AdminBooks() {
  const [books, setBooks] = useState(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('books').select('*').order('title').then(({ data, error }) => {
      if (error) setError(error.message);
      setBooks(data || []);
    });
  }, []);

  if (!books) return <p className="muted">Loading…</p>;

  const needle = q.toLowerCase();
  const shown = books.filter(b => `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(needle));

  return (
    <div className="dash-card">
      <div className="admin-toolbar">
        <input className="admin-search" type="search" placeholder="Search books…" value={q} onChange={e => setQ(e.target.value)} />
        <Link to="/admin/books/new" className="btn btn-primary">+ Add book</Link>
      </div>
      {error && <p className="form-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th></th><th>Title</th><th>Paperback</th><th>Stock</th><th>eBook</th><th>Status</th></tr>
          </thead>
          <tbody>
            {shown.map(b => (
              <tr key={b.id}>
                <td><Link to={`/admin/books/${b.id}`}><BookCover book={b} size="sm" /></Link></td>
                <td>
                  <Link to={`/admin/books/${b.id}`} className="admin-book-title">{b.title}</Link>
                  <small className="muted">{b.author} · {b.category}</small>
                </td>
                <td>{b.paperback_price != null ? formatPrice(b.paperback_price) : <span className="muted">—</span>}</td>
                <td>
                  {b.paperback_price == null ? <span className="muted">—</span>
                    : <span className={b.paperback_stock === 0 ? 'badge-danger' : b.paperback_stock <= 5 ? 'badge-warn' : ''}>{b.paperback_stock}</span>}
                </td>
                <td>
                  {b.ebook_price != null ? formatPrice(b.ebook_price) : <span className="muted">—</span>}
                  {b.ebook_price != null && !b.ebook_file && <small className="badge-warn">no file</small>}
                </td>
                <td>{b.active ? <span className="badge-ok">In shop</span> : <span className="badge-muted">Hidden</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!shown.length && <p className="muted center">No books match “{q}”.</p>}
    </div>
  );
}
