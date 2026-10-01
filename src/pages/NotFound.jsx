import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="auth-page">
      <div className="auth-card center">
        <div className="success-icon">?</div>
        <h1>Page not found</h1>
        <p className="auth-sub">This page seems to have been left off the shelf.</p>
        <Link to="/" className="btn btn-primary btn-block">Back to home</Link>
      </div>
    </section>
  );
}
