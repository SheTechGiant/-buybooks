import { Link } from 'react-router-dom';
import BookCard from './BookCard';

// A titled horizontal shelf of books with a "See all" link.
export default function BookRow({ title, subtitle, books, link }) {
  if (!books.length) return null;
  return (
    <section className="shelf">
      <div className="container">
        <div className="shelf-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {link && <Link to={link} className="see-all">See all →</Link>}
        </div>
        <div className="shelf-scroll">
          {books.map(b => <BookCard key={b.id} book={b} />)}
        </div>
      </div>
    </section>
  );
}
