import { Link } from 'react-router-dom';
import BookCover from './BookCover';
import Stars from './Stars';
import { useCart } from '../context/CartContext';
import { formatsOf, inStock, lowestPrice } from '../lib/catalog';
import { FORMATS, formatPrice } from '../../shared/shop';

export default function BookCard({ book }) {
  const { add } = useCart();
  const formats = formatsOf(book);
  // Quick-add the first format that can be bought right now.
  const quickFormat = formats.find(f => inStock(book, f));

  return (
    <article className="book-card">
      <Link to={`/books/${book.id}`} className="book-card-cover">
        <BookCover book={book} />
        <div className="book-badges">
          {book.bestseller && <span className="tag tag-gold">Bestseller</span>}
          {book.is_new && <span className="tag tag-dark">New</span>}
        </div>
      </Link>
      <div className="book-card-body">
        <Link to={`/books/${book.id}`} className="book-card-title">{book.title}</Link>
        <span className="book-card-author">{book.author}</span>
        <Stars rating={book.rating} />
        <div className="format-chips">
          {formats.map(f => <span key={f} className="chip">{FORMATS[f].label}</span>)}
        </div>
        <div className="book-card-foot">
          <span className="book-price">
            {formats.length > 1 && <small>from </small>}
            {formatPrice(lowestPrice(book))}
          </span>
          <button
            className="btn btn-primary btn-sm"
            disabled={!quickFormat}
            onClick={() => add(book, quickFormat)}
            aria-label={`Add ${book.title} to cart`}
          >
            {quickFormat ? 'Add' : 'Sold out'}
          </button>
        </div>
      </div>
    </article>
  );
}
