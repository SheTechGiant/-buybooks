# BuyBooks.com

An online bookstore in golden yellow & white. Readers browse, search and buy **paperbacks**
(shipped) and **eBooks** (instant download).

Built with **React + Vite**, **Supabase** (accounts, catalog, orders, eBook files),
**Stripe** (payments) and **Vercel** (hosting + API).

```
buybook/
├── api/                            ← Server code (runs on Vercel)
│   ├── _lib.js                     shared helpers (Stripe + Supabase admin clients)
│   ├── create-checkout-session.js  re-checks prices/stock, saves order, opens Stripe Checkout
│   ├── stripe-webhook.js           Stripe → marks order paid, reduces stock, unlocks eBooks
│   └── ebook-download.js           gives buyers a 5-minute download link for their eBook
├── shared/shop.js                  currency, shipping rules, price maths (used by site AND server)
├── scripts/seed.js                 uploads the sample books to Supabase (`npm run seed`)
├── supabase/schema.sql             database tables, security rules, eBook storage bucket
├── src/                            ← React website
│   ├── data/books.js               sample catalog (16 fictional books)
│   ├── components/                 Header (search + cart), Footer, BookCard, BookCover, BookRow, Toast…
│   ├── sections/                   Hero, Faq, Cta (newsletter)
│   ├── pages/                      Home, Catalog, BookDetail, Cart, Account, Login, Signup, CheckoutSuccess, NotFound
│   ├── context/                    AuthContext (logged-in user), CartContext (cart, saved in the browser)
│   ├── lib/                        supabase.js, catalog.js (loads books), api.js (calls /api)
│   └── styles.css                  the whole golden yellow / white theme
├── static-version/                 the original plain-HTML version (not used)
├── .env.example                    every environment variable you need
└── vercel.json                     Vercel build + routing config
```

## How it works

| Page | What it does |
|---|---|
| `/` | Hero, categories, Bestsellers / New arrivals / eBook deals shelves, book of the month, FAQ, newsletter |
| `/books` | Full catalog — search (`?q=`), category, format (paperback / eBook) and sort |
| `/books/:id` | Book page — choose format, quantity, add to cart, related books |
| `/cart` | Edit quantities, see shipping & total, checkout (sign-in required) |
| `/account` | Order history + **eBook library** with download buttons |

**Buying flow:** Cart → *Checkout* → server re-checks every price and stock level in the database
→ saves a *pending* order → Stripe Checkout (collects card + shipping address if there are
paperbacks) → Stripe webhook marks the order *paid*, reduces paperback stock → eBooks appear in
the buyer's library.

**Store rules** (edit `shared/shop.js`): currency USD, flat shipping $4.99, free shipping on
paperback orders over $50, max 10 copies per paperback, eBooks 1 per order.

---

## 1. Run it locally

```bash
npm install
npm run dev                 # → http://localhost:5173
```

Without any keys the shop runs on the sample books in `src/data/books.js` — you can browse,
search and fill the cart. Sign-in, checkout and the newsletter show a "not connected yet" message
until you add keys.

```bash
copy .env.example .env      # Mac/Linux: cp .env.example .env — then fill in the values
npm i -g vercel
vercel dev                  # website + /api payment functions → http://localhost:3000
```

---

## 2. Supabase (accounts, catalog, orders, eBook files)

1. Create a project at supabase.com.
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
3. **Project Settings → API** → copy into `.env`:
   - Project URL → `VITE_SUPABASE_URL` **and** `SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**secret — never in a `VITE_` variable**)
4. Load the sample books: `npm run seed`
5. **Authentication → URL Configuration**: Site URL `https://buybooks.com`; Redirect URLs
   `https://buybooks.com/**` and `http://localhost:5173/**`.
6. Before launch, set up custom SMTP (**Authentication → Emails**) — the built-in sender is heavily rate-limited.

### Managing books
- **Add / edit books:** Supabase → **Table Editor → books**. `paperback_price` or `ebook_price`
  left empty means that format isn't sold. Set `paperback_stock` for paperbacks.
- **Covers:** paste an image URL in `cover_url` (e.g. upload to a public Supabase bucket). Without
  one, a cover is drawn from `cover_bg` / `cover_fg` colours.
- **eBook files:** Supabase → **Storage → ebooks** → upload the `.epub`, and put its file name
  in the book's `ebook_file` column. The bucket is private — only buyers get a temporary link.

---

## 3. Stripe (payments)

1. Use **Test mode** while setting up.
2. **Developers → API keys** → Secret key → `STRIPE_SECRET_KEY`.
   (No products need to be created in Stripe — prices come from your `books` table.)
3. After your first deploy (step 4): **Developers → Webhooks → Add endpoint**
   - URL: `https://buybooks.com/api/stripe-webhook`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `checkout.session.expired`
   - Signing secret (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`
4. Set `SHIPPING_COUNTRIES` to the countries you ship paperbacks to.

Local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe-webhook`.
Test card: `4242 4242 4242 4242`, any future date, any CVC.

---

## 4. Deploy to Vercel

1. Install Git (git-scm.com), then put the code on GitHub:
   ```bash
   git init
   git add .
   git commit -m "BuyBooks bookstore"
   git branch -M main
   git remote add origin https://github.com/<your-username>/buybooks.git
   git push -u origin main
   ```
   `.env` is in `.gitignore`, so your secrets are not uploaded.
2. vercel.com → **Add New → Project** → import the repo (Vite is detected automatically).
3. **Environment Variables**: add every key from `.env.example`. Set `SITE_URL=https://buybooks.com`.
4. **Deploy**. Every `git push` redeploys automatically.
5. Create the Stripe webhook (step 3.3), add `STRIPE_WEBHOOK_SECRET` in Vercel, then
   **Deployments → ⋯ → Redeploy**. (Any env change needs a redeploy.)

## 5. Connect buybooks.com

Vercel → **Settings → Domains** → add `buybooks.com` and `www.buybooks.com`, then add the DNS
records Vercel shows at your domain registrar. HTTPS is automatic.

## 6. Go-live checklist

- [ ] Replace the sample books with your real catalog, covers and eBook files
- [ ] Add Privacy Policy, Terms, and Shipping & Returns pages (Stripe requires them)
- [ ] Decide on sales tax/VAT — enable **Stripe Tax** if you need it
- [ ] Stripe: activate your account, switch to **Live mode**, create the live webhook, update
      `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Vercel
- [ ] Supabase: custom SMTP for sign-up / password emails
- [ ] Fulfilment: paid paperback orders (with shipping address) are in **Table Editor → orders**;
      change `status` to `shipped` once posted
- [ ] Test end-to-end: sign up → buy a paperback + an eBook → order shows as Paid →
      eBook downloads → stock went down

## Environment variables

| Variable | Used by | Secret? |
|---|---|---|
| `VITE_SUPABASE_URL` | browser | no |
| `VITE_SUPABASE_ANON_KEY` | browser | no (protected by Row Level Security) |
| `SITE_URL` | api | no |
| `SUPABASE_URL` | api, seed | no |
| `SUPABASE_SERVICE_ROLE_KEY` | api, seed | **yes** |
| `STRIPE_SECRET_KEY` | api | **yes** |
| `STRIPE_WEBHOOK_SECRET` | api | **yes** |
| `SHIPPING_COUNTRIES` | api | no |

Only variables starting with `VITE_` reach the browser. Never prefix a secret with `VITE_`.
