-- =====================================================================
--  BuyBooks.com — database setup
--  Run once in Supabase → SQL Editor → New query → paste → Run
--  (Safe to re-run: it only creates what doesn't exist yet.)
-- =====================================================================

-- ---------- Books (the catalog) ----------
create table if not exists public.books (
  id               text primary key,                -- URL slug, e.g. 'the-glass-alibi'
  title            text not null,
  author           text not null,
  category         text not null,
  description      text,
  pages            int,
  published_year   int,
  language         text default 'English',
  paperback_price  numeric(10,2) check (paperback_price >= 0),  -- null = not sold as paperback
  paperback_stock  int not null default 0 check (paperback_stock >= 0),
  ebook_price      numeric(10,2) check (ebook_price >= 0),      -- null = not sold as eBook
  ebook_file       text,                            -- file path inside the "ebooks" storage bucket
  cover_url        text,                            -- optional cover image URL
  cover_bg         text,                            -- colours for the drawn cover when no image
  cover_fg         text,
  bestseller       boolean not null default false,
  is_new           boolean not null default false,
  rating           numeric(2,1),
  created_at       timestamptz not null default now()
);

alter table public.books enable row level security;

drop policy if exists "Anyone can browse books" on public.books;
create policy "Anyone can browse books"
  on public.books for select
  to anon, authenticated
  using (true);

-- ---------- Orders ----------
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  email              text,
  status             text not null default 'pending'
                     check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  currency           text not null default 'usd',
  subtotal           numeric(10,2) not null,
  shipping           numeric(10,2) not null default 0,
  total              numeric(10,2) not null,
  stripe_session_id  text unique,
  stripe_payment_intent text,
  shipping_address   jsonb,
  paid_at            timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);

create table if not exists public.order_items (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders (id) on delete cascade,
  book_id     text not null references public.books (id),
  title       text not null,
  format      text not null check (format in ('paperback', 'ebook')),
  quantity    int not null check (quantity > 0),
  unit_price  numeric(10,2) not null
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Customers can read only their own orders. Orders are created/updated by the server only.
drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items"
  on public.order_items for select
  to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = (select auth.uid())
  ));

-- ---------- Mark an order paid + reduce paperback stock (called by the Stripe webhook) ----------
-- Only flips 'pending' → 'paid', so Stripe retrying the webhook never double-counts stock.
create or replace function public.mark_order_paid(
  p_order_id uuid,
  p_payment_intent text,
  p_shipping_address jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
     set status = 'paid',
         paid_at = now(),
         stripe_payment_intent = p_payment_intent,
         shipping_address = p_shipping_address
   where id = p_order_id and status = 'pending';

  if not found then
    return;
  end if;

  update books b
     set paperback_stock = greatest(0, b.paperback_stock - oi.quantity)
    from order_items oi
   where oi.order_id = p_order_id
     and oi.format = 'paperback'
     and oi.book_id = b.id;
end;
$$;

revoke execute on function public.mark_order_paid(uuid, text, jsonb) from public, anon, authenticated;

-- ---------- Newsletter emails (the "Subscribe" box on the homepage) ----------
create table if not exists public.leads (
  id         bigint generated always as identity primary key,
  email      text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Anyone can subscribe, but nobody can read the list from the browser.
-- View subscribers in Supabase → Table Editor → leads.
drop policy if exists "Anyone can join the list" on public.leads;
create policy "Anyone can join the list"
  on public.leads for insert
  to anon, authenticated
  with check (true);

-- ---------- Private storage bucket for eBook files ----------
-- No access policies = only the server (service role) can read it; buyers get 5-minute links.
insert into storage.buckets (id, name, public)
values ('ebooks', 'ebooks', false)
on conflict (id) do nothing;
