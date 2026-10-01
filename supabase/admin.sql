-- =====================================================================
--  BuyBooks.com — admin area setup
--  Run AFTER schema.sql: Supabase → SQL Editor → New query → paste → Run
--  (Safe to re-run.)
-- =====================================================================

-- ---------- Who is an admin ----------
-- Rows are added only by the server script `npm run make-admin -- you@email.com`.
-- No policies = nobody can read or change this table from the website.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = (select auth.uid()));
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Books: hide instead of delete (old orders still point to them) ----------
alter table public.books add column if not exists active boolean not null default true;

drop policy if exists "Anyone can browse books" on public.books;
create policy "Anyone can browse books"
  on public.books for select
  to anon, authenticated
  using (active or (select public.is_admin()));

drop policy if exists "Admins add books" on public.books;
create policy "Admins add books" on public.books for insert
  to authenticated with check ((select public.is_admin()));

drop policy if exists "Admins edit books" on public.books;
create policy "Admins edit books" on public.books for update
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Admins delete books" on public.books;
create policy "Admins delete books" on public.books for delete
  to authenticated using ((select public.is_admin()));

-- ---------- Orders: admins see all and can mark them shipped ----------
drop policy if exists "Admins read all orders" on public.orders;
create policy "Admins read all orders" on public.orders for select
  to authenticated using ((select public.is_admin()));

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders for update
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Admins read all order items" on public.order_items;
create policy "Admins read all order items" on public.order_items for select
  to authenticated using ((select public.is_admin()));

-- ---------- Newsletter list: admins can read it ----------
drop policy if exists "Admins read leads" on public.leads;
create policy "Admins read leads" on public.leads for select
  to authenticated using ((select public.is_admin()));

-- ---------- File storage ----------
-- covers: public (anyone can see cover images). ebooks: private (buyers get 5-minute links).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('covers', 'covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

update storage.buckets
   set file_size_limit = 52428800,  -- 50 MB
       allowed_mime_types = array['application/epub+zip', 'application/pdf']
 where id = 'ebooks';

drop policy if exists "Admins manage book files" on storage.objects;
create policy "Admins manage book files" on storage.objects for all
  to authenticated
  using (bucket_id in ('covers', 'ebooks') and (select public.is_admin()))
  with check (bucket_id in ('covers', 'ebooks') and (select public.is_admin()));
