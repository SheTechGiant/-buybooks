import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BookCover from '../components/BookCover';
import BookRow from '../components/BookRow';
import Stars from '../components/Stars';
import NotFound from './NotFound';
import { useCart } from '../context/CartContext';
import { useBooks, formatsOf, inStock } from '../lib/catalog';
import { FORMATS, MAX_QTY, formatPrice, priceOf } from '../../shared/shop';

export default function BookDetail() {
  const { id } = useParams();
  const { books, loading } = useBooks();
  const { add } = useCart();
  const book = books.find(b => b.id === id);

  const [format, setFormat] = useState(null);
  const [qty, setQty] = useState(1);

  // Pick a sensible default format whenever the book changes.
  useEffect(() => {
    if (!book) return;
    const formats = formatsOf(book);
    setFormat(formats.find(f => inStock(book, f)) || formats[0]);
    setQty(1);
  }, [book]);

  if (loading) return <p className="page-loading">Loading…</p>;
  if (!book) return <NotFound />;

  const formats = formatsOf(book);
  const available = format && inStock(book, format);
  const maxQty = format === 'paperback' ? Math.min(MAX_QTY, book.paperback_stock) : 1;
  const related = books.filter(b => b.category === book.category && b.id !== book.id);

  return (
    <>
      <section className="book-detail">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link> › <Link to="/books">Books</Link> ›{' '}
            <Link to={`/books?category=${encodeURIComponent(book.category)}`}>{book.category}</Link>
          </nav>

          <div className="detail-grid">
            <div className="detail-cover">
              <BookCover book={book} size="xl" />
            </div>

            <div className="detail-info">
              <div className="book-badges static">
                {book.bestseller && <span className="tag tag-gold">Bestseller</span>}
                {book.is_new && <span className="tag tag-dark">New</span>}
              </div>
              <h1>{book.title}</h1>
              <p className="detail-author">by <Link to={`/books?q=${encodeURIComponent(book.author)}`}>{book.author}</Link></p>
              <Stars rating={book.rating} />

              <p className="detail-desc">{book.description}</p>

              <div className="format-picker" role="radiogroup" aria-label="Format">
                {formats.map(f => (
                  <button
                    key={f}
                    role="radio"
                    aria-checked={format === f}
                    className={`format-opt${format === f ? ' active' : ''}`}
                    onClick={() => { setFormat(f); setQty(1); }}
                  >
                    <span>{FORMATS[f].label}</span>
                    <strong>{formatPrice(priceOf(book, f))}</strong>
                    <small>
                      {f === 'ebook' ? 'Instant download · EPUB' : book.paperback_stock > 0 ? `In stock (${book.paperback_stock})` : 'Out of stock'}
                    </small>
                  </button>
                ))}
              </div>

              <div className="buy-row">
                {format === 'paperback' && available && (
                  <div className="qty">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(maxQty, q + 1))} aria-label="Increase quantity">+</button>
                  </div>
                )}
                <button className="btn btn-primary btn-lg" disabled={!available} onClick={() => add(book, format, qty)}>
                  {available ? `Add to cart · ${formatPrice(priceOf(book, format) * qty)}` : 'Out of stock'}
                </button>
              </div>

              <ul className="detail-meta">
                <li><span>Category</span>{book.category}</li>
                <li><span>Pages</span>{book.pages}</li>
                <li><span>Published</span>{book.published_year}</li>
                <li><span>Language</span>{book.language}</li>
              </ul>

              <p className="detail-note">
                {format === 'ebook'
                  ? '⚡ Your eBook will be available in your account library right after payment.'
                  : '📦 Ships in 1–2 business days. Free shipping on paperback orders over $50.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <BookRow title={`More in ${book.category}`} books={related} link={`/books?category=${encodeURIComponent(book.category)}`} />
    </>
  );
}
