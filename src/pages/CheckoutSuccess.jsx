import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CheckoutSuccess() {
  const { clear } = useCart();

  useEffect(() => { clear(); }, [clear]);

  return (
    <section className="auth-page">
      <div className="auth-card center">
        <div className="success-icon">✓</div>
        <h1>Thank you for your order!</h1>
        <p className="auth-sub">
          A receipt is on its way to your email. eBooks are ready in your library now, and paperbacks
          will ship within 1–2 business days.
        </p>
        <Link to="/account" className="btn btn-primary btn-block">View my orders &amp; eBooks</Link>
        <Link to="/books" className="continue-link">Keep shopping</Link>
      </div>
    </section>
  );
}
