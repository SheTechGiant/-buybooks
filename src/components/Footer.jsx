import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Paperbacks delivered to your door and eBooks in seconds. Happy reading!</p>
          <div className="socials">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="X">X</a>
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="TikTok">TT</a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/books">All books</Link>
          <Link to="/books?sort=bestsellers">Bestsellers</Link>
          <Link to="/books?sort=newest">New arrivals</Link>
          <Link to="/books?format=ebook">eBooks</Link>
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/#faq">FAQ</Link>
          <Link to="/#faq">Shipping &amp; delivery</Link>
          <Link to="/#faq">Returns</Link>
          <Link to="/account">Track my order</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/account">My account</Link>
          <Link to="/account">My eBooks</Link>
          <Link to="/cart">Cart</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="mailto:hello@buybooks.com">hello@buybooks.com</a>
          <a href="#">Live chat</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} BuyBooks.com. All rights reserved.</span>
        <span><a href="#">Privacy</a> · <a href="#">Terms</a></span>
      </div>
    </footer>
  );
}
