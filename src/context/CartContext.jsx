import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MAX_QTY } from '../../shared/shop';

const STORAGE_KEY = 'buybooks-cart';
const CartContext = createContext(null);

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// Cart lines: { bookId, format: 'paperback'|'ebook', qty }. Prices are looked up from the catalog.
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((book, format, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.bookId === book.id && i.format === format);
      // eBooks are a single licence — never more than 1.
      const cap = format === 'ebook' ? 1 : Math.min(MAX_QTY, book.paperback_stock);
      if (existing) {
        return prev.map(i => (i === existing ? { ...i, qty: Math.min(cap, i.qty + qty) } : i));
      }
      return [...prev, { bookId: book.id, format, qty: Math.min(cap, qty) }];
    });
    setToast(`“${book.title}” added to your cart`);
  }, []);

  const setQty = useCallback((bookId, format, qty) => {
    setItems(prev =>
      qty <= 0
        ? prev.filter(i => !(i.bookId === bookId && i.format === format))
        : prev.map(i => (i.bookId === bookId && i.format === format ? { ...i, qty: Math.min(MAX_QTY, qty) } : i))
    );
  }, []);

  const remove = useCallback((bookId, format) => setQty(bookId, format, 0), [setQty]);
  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((n, i) => n + i.qty, 0);

  const value = useMemo(() => ({ items, count, add, setQty, remove, clear, toast }), [items, count, add, setQty, remove, clear, toast]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
