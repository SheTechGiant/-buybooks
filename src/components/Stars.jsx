export default function Stars({ rating }) {
  if (!rating) return null;
  const full = Math.round(rating);
  return (
    <span className="stars-sm" aria-label={`Rated ${rating} out of 5`}>
      {'★'.repeat(full)}<span className="stars-off">{'★'.repeat(5 - full)}</span>
      <small>{Number(rating).toFixed(1)}</small>
    </span>
  );
}
