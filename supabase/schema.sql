-- Schéma Supabase de YOUSS CONNECT.
-- À coller dans le SQL Editor du projet, puis Run.
-- Le solde n'est jamais modifiable par le client : uniquement via wallet_pay / wallet_topup.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  full_name text default '',
  email text default '',
  pin_hash text,
  city text default 'Cotonou',
  country text default 'Bénin',
  created_at timestamptz default now()
);

create table if not exists public.wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  points integer not null default 0 check (points >= 0),
  currency text not null default 'FCFA',
  updated_at timestamptz default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  amount integer not null,
  kind text not null check (kind in ('credit', 'debit')),
  service text,
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  service text not null,
  label text not null,
  amount integer not null default 0,
  status text not null default 'confirmed',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  origin text,
  destination text,
  km numeric,
  amount integer not null default 0,
  status text not null default 'completed',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.bookings enable row level security;
alter table public.rides enable row level security;

drop policy if exists "own profile read" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own wallet read" on public.wallets;
drop policy if exists "own tx read" on public.wallet_transactions;
drop policy if exists "own bookings read" on public.bookings;
drop policy if exists "own rides read" on public.rides;

create index if not exists wallet_transactions_user_created_idx
  on public.wallet_transactions (user_id, created_at desc);
create index if not exists bookings_user_created_idx
  on public.bookings (user_id, created_at desc);
create index if not exists rides_user_created_idx
  on public.rides (user_id, created_at desc);

create policy "own profile read" on public.profiles for select using ((select auth.uid()) = id);
create policy "own profile update" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "own profile insert" on public.profiles for insert with check ((select auth.uid()) = id);
create policy "own wallet read" on public.wallets for select using ((select auth.uid()) = user_id);
create policy "own tx read" on public.wallet_transactions for select using ((select auth.uid()) = user_id);
create policy "own bookings read" on public.bookings for select using ((select auth.uid()) = user_id);
create policy "own rides read" on public.rides for select using ((select auth.uid()) = user_id);

-- Compte créé à la première vérification OTP : profil + wallet vides.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone, full_name)
  values (new.id, new.phone, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  insert into public.wallets (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Débit atomique. Le client ne peut pas écrire le solde.
create or replace function public.wallet_pay(
  p_amount integer,
  p_label text,
  p_service text,
  p_points integer default 0,
  p_meta jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  bal integer;
  pts integer;
  earned integer;
  km numeric;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 2000000 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_amount');
  end if;
  earned := least(greatest(coalesce(p_points, 0), 0), p_amount / 100);

  select balance, points into bal, pts
  from public.wallets where user_id = uid for update;
  if bal is null then
    return jsonb_build_object('ok', false, 'reason', 'no_wallet');
  end if;
  if bal < p_amount then
    return jsonb_build_object('ok', false, 'reason', 'insufficient_balance');
  end if;

  update public.wallets
    set balance = balance - p_amount,
        points = points + earned,
        updated_at = now()
    where user_id = uid
    returning balance, points into bal, pts;

  insert into public.wallet_transactions (user_id, label, amount, kind, service)
  values (uid, left(coalesce(p_label, 'Paiement'), 160), -p_amount, 'debit', left(coalesce(p_service, 'wallet'), 40));

  if p_service = 'transport' then
    begin
      km := nullif(p_meta->>'km', '')::numeric;
    exception when others then
      km := null;
    end;
    insert into public.rides (user_id, origin, destination, km, amount, status)
    values (uid, p_meta->>'from', p_meta->>'to', km, p_amount, 'completed');
  elsif p_service is not null and p_service <> 'wallet' then
    insert into public.bookings (user_id, service, label, amount, status, meta)
    values (uid, left(p_service, 40), left(coalesce(p_label, ''), 160), p_amount, 'confirmed', coalesce(p_meta, '{}'::jsonb));
  end if;

  return jsonb_build_object('ok', true, 'balance', bal, 'points', pts);
end;
$$;

-- Recharge : réservée au service (webhook MoMo / back-office). Pas d'exécution client.
create or replace function public.wallet_topup(p_amount integer, p_label text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  bal integer;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 1000000 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_amount');
  end if;
  update public.wallets
    set balance = balance + p_amount, updated_at = now()
    where user_id = uid
    returning balance into bal;
  if bal is null then
    return jsonb_build_object('ok', false, 'reason', 'no_wallet');
  end if;
  insert into public.wallet_transactions (user_id, label, amount, kind, service)
  values (uid, left(coalesce(p_label, 'Rechargement'), 160), p_amount, 'credit', 'wallet');
  return jsonb_build_object('ok', true, 'balance', bal);
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.wallet_pay(integer, text, text, integer, jsonb) from public, anon, authenticated;
revoke all on function public.wallet_topup(integer, text) from public, anon, authenticated;
grant execute on function public.wallet_pay(integer, text, text, integer, jsonb) to authenticated;

create table if not exists public.user_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('activity', 'ticket', 'order', 'notification', 'address')),
  local_id text not null check (char_length(local_id) between 1 and 80),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, kind, local_id)
);

create index if not exists user_records_user_created_idx
  on public.user_records (user_id, created_at desc);

alter table public.user_records enable row level security;

drop policy if exists "own records read" on public.user_records;
drop policy if exists "own records insert" on public.user_records;
drop policy if exists "own records update" on public.user_records;
drop policy if exists "own records delete" on public.user_records;

create policy "own records read" on public.user_records for select using ((select auth.uid()) = user_id);
create policy "own records insert" on public.user_records for insert with check ((select auth.uid()) = user_id);
create policy "own records update" on public.user_records for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own records delete" on public.user_records for delete using ((select auth.uid()) = user_id);

create or replace function public.save_records(p_rows jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  row jsonb;
  k text;
  lid text;
  body jsonb;
begin
  if uid is null or jsonb_typeof(p_rows) is distinct from 'array' then
    return;
  end if;
  if jsonb_array_length(p_rows) > 80 then
    return;
  end if;
  for row in select value from jsonb_array_elements(p_rows)
  loop
    k := row->>'kind';
    lid := left(coalesce(row->>'local_id', ''), 80);
    body := coalesce(row->'payload', '{}'::jsonb);
    if k not in ('activity', 'ticket', 'order', 'notification', 'address') then
      continue;
    end if;
    if char_length(lid) < 1 or octet_length(body::text) > 12000 then
      continue;
    end if;
    insert into public.user_records (user_id, kind, local_id, payload)
    values (uid, k, lid, body)
    on conflict (user_id, kind, local_id) do update set payload = excluded.payload;
  end loop;
end;
$$;

revoke all on function public.save_records(jsonb) from public, anon, authenticated;
grant execute on function public.save_records(jsonb) to authenticated;

