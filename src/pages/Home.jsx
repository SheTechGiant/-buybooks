import { Link } from 'react-router-dom';
import Hero from '../sections/Hero';
import Faq from '../sections/Faq';
import Cta from '../sections/Cta';
import BookRow from '../components/BookRow';
import BookCover from '../components/BookCover';
import { useBooks } from '../lib/catalog';
import { CATEGORIES, formatPrice } from '../../shared/shop';

export default function Home() {
  const { books, loading, error } = useBooks();
  const bestsellers = books.filter(b => b.bestseller);
  const newest = books.filter(b => b.is_new);
  const ebookDeals = books.filter(b => b.ebook_price != null).sort((a, b) => a.ebook_price - b.ebook_price).slice(0, 8);
  const spotlight = bestsellers.find(b => b.rating >= 4.9) || bestsellers[0];

  return (
    <>
      <Hero books={bestsellers.length ? bestsellers : books} />

      <section className="categories">
        <div className="container">
          <h2 className="sr-only">Shop by category</h2>
          <div className="category-grid">
            {CATEGORIES.map(({ name, icon }) => (
              <Link key={name} to={`/books?category=${encodeURIComponent(name)}`} className="category-tile">
                <span className="cat-icon">{icon}</span>
                <span>{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {loading && <p className="page-loading">Loading books…</p>}
      {error && <p className="form-error center">{error}</p>}

      <BookRow title="Bestsellers" subtitle="What everyone is reading right now" books={bestsellers} link="/books?sort=bestsellers" />

      {spotlight && (
        <section className="spotlight">
          <div className="container spotlight-inner">
            <BookCover book={spotlight} size="lg" />
            <div>
              <span className="eyebrow">Book of the month</span>
              <h2>{spotlight.title}</h2>
              <p className="spot-author">by {spotlight.author}</p>
              <p className="lead">{spotlight.description}</p>
              <Link to={`/books/${spotlight.id}`} className="btn btn-dark btn-lg">
                Get it from {formatPrice(Math.min(...[spotlight.paperback_price, spotlight.ebook_price].filter(p => p != null)))}
              </Link>
            </div>
          </div>
        </section>
      )}

      <BookRow title="New arrivals" subtitle="Fresh on the shelves this season" books={newest} link="/books?sort=newest" />
      <BookRow title="eBook deals" subtitle="Start reading in seconds — from just a few dollars" books={ebookDeals} link="/books?format=ebook&sort=price-asc" />

      <section className="perks">
        <div className="container perks-grid">
          <div><span>📦</span><strong>Fast delivery</strong><p>Paperbacks shipped in 1–2 business days.</p></div>
          <div><span>⚡</span><strong>Instant eBooks</strong><p>Download right after checkout, read anywhere.</p></div>
          <div><span>🔒</span><strong>Secure payment</strong><p>Card payments processed safely by Stripe.</p></div>
          <div><span>↩️</span><strong>Easy returns</strong><p>30 days to return any paperback.</p></div>
        </div>
      </section>

      <Faq />
      <Cta />
    </>
  );
}
