import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="BuyBooks home">
      <span className="logo-mark">B</span>
      <span className="logo-text">
        buybooks<span className="logo-dot">.com</span>
      </span>
    </Link>
  );
}
