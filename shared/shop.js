// Store settings shared by the website (src/) and the payment server (api/).
// Change these to switch currency or shipping rules.

export const CURRENCY = 'usd';
export const SHIPPING_FLAT = 4.99;        // shipping charged on orders with physical books
export const FREE_SHIPPING_MIN = 50;      // physical-book subtotal that unlocks free shipping
export const MAX_QTY = 10;                // max copies of one paperback per order

// The only categories the store uses (shown in the menu, home page, filters and admin form).
export const CATEGORIES = [
  { name: 'Self-Help', icon: '🌱' },
  { name: 'Motivational', icon: '🔥' },
  { name: 'Financial', icon: '💰' },
  { name: 'Business', icon: '💼' },
  { name: 'Girled Up', icon: '👑' },
];
export const CATEGORY_NAMES = CATEGORIES.map(c => c.name);

export const FORMATS = {
  paperback: { label: 'Paperback', physical: true },
  ebook: { label: 'eBook', physical: false },
};

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY.toUpperCase() }).format(amount);
}

export function priceOf(book, format) {
  return format === 'paperback' ? book.paperback_price : book.ebook_price;
}

// items: [{ book, format, qty }] → { subtotal, shipping, total, hasPhysical }
export function calcTotals(items) {
  let subtotal = 0;
  let physicalSubtotal = 0;
  for (const { book, format, qty } of items) {
    const line = Number(priceOf(book, format)) * qty;
    subtotal += line;
    if (FORMATS[format].physical) physicalSubtotal += line;
  }
  const hasPhysical = physicalSubtotal > 0;
  const shipping = hasPhysical && physicalSubtotal < FREE_SHIPPING_MIN ? SHIPPING_FLAT : 0;
  const round = n => Math.round(n * 100) / 100;
  return { subtotal: round(subtotal), shipping, total: round(subtotal + shipping), hasPhysical };
}
