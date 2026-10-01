import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toast } = useCart();
  if (!toast) return null;
  return (
    <div className="toast" role="status">
      <span>✓ {toast}</span>
      <Link to="/cart">View cart</Link>
    </div>
  );
}
