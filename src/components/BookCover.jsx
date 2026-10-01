// Shows the real cover image if the book has one, otherwise draws a styled cover.
export default function BookCover({ book, size = 'md' }) {
  if (book.cover_url) {
    return <img className={`cover cover-${size}`} src={book.cover_url} alt={`Cover of ${book.title}`} loading="lazy" />;
  }
  return (
    <div
      className={`cover cover-${size} cover-drawn`}
      style={{ '--cover-bg': book.cover_bg || '#F2B705', '--cover-fg': book.cover_fg || '#1F1A0E' }}
      role="img"
      aria-label={`Cover of ${book.title}`}
    >
      <span className="cover-rule" />
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author}</span>
    </div>
  );
}
