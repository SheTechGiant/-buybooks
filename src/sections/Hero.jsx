import { Link } from 'react-router-dom';
import BookCover from '../components/BookCover';

export default function Hero({ books }) {
  const stack = books.slice(0, 3);

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">Paperbacks &amp; eBooks</span>
          <h1>
            Your next favourite book <span className="highlight">is waiting here.</span>
          </h1>
          <p className="lead">
            Browse thousands of stories, guides and picture books. Get paperbacks delivered to your door,
            or start reading an eBook in seconds.
          </p>
          <div className="hero-cta">
            <Link to="/books" className="btn btn-primary btn-lg">Shop all books</Link>
            <Link to="/books?format=ebook" className="btn btn-outline btn-lg">Browse eBooks</Link>
          </div>
          <ul className="hero-perks">
            <li>📦 Free shipping over $50</li>
            <li>⚡ Instant eBook downloads</li>
            <li>🔒 Secure checkout</li>
          </ul>
        </div>

        <div className="hero-books" aria-hidden="true">
          {stack.map((b, i) => (
            <Link key={b.id} to={`/books/${b.id}`} className={`hero-book hb-${i}`} tabIndex={-1}>
              <BookCover book={b} size="lg" />
            </Link>
          ))}
          <div className="float-card sale">
            <strong>eBook ready</strong>
            <small>Download started · EPUB</small>
          </div>
          <div className="float-card payout">
            <strong>Order shipped 📦</strong>
            <small>Arriving in 2–4 days</small>
          </div>
        </div>
      </div>
    </section>
  );
}
