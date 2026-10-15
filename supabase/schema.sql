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
revoke insert on table public.profiles from anon, authenticated;
grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.wallets to service_role;
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
  insert into public.profiles (id, phone, full_name, email)
  values (
    new.id,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  insert into public.wallets (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
exception when others then
  raise warning 'handle_new_user: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.ensure_account()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  p_phone text;
  p_name text;
  p_email text;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;
  select u.phone, coalesce(u.raw_user_meta_data->>'full_name', ''), coalesce(u.email, '')
    into p_phone, p_name, p_email
  from auth.users u
  where u.id = uid;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'no_auth_user');
  end if;
  insert into public.profiles (id, phone, full_name, email)
  values (uid, p_phone, p_name, p_email)
  on conflict (id) do nothing;
  insert into public.wallets (user_id) values (uid)
  on conflict (user_id) do nothing;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.ensure_account() from public, anon;
grant execute on function public.ensure_account() to authenticated, service_role;

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
revoke update (pin_hash) on public.profiles from public, anon, authenticated;

create table if not exists public.user_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('activity', 'ticket', 'order', 'notification', 'address', 'reward', 'favorite', 'saved')),
  local_id text not null check (char_length(local_id) between 1 and 80),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
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

-- La version à deux arguments (listes + suppressions) est dans supabase/harden.sql.
-- Ce fichier garde la même signature pour une installation neuve.
create or replace function public.save_records(p_rows jsonb, p_drop jsonb default '[]'::jsonb)
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
  if uid is null then
    return;
  end if;
  if p_rows is null or jsonb_typeof(p_rows) is distinct from 'array' then
    p_rows := '[]'::jsonb;
  end if;
  if p_drop is null or jsonb_typeof(p_drop) is distinct from 'array' then
    p_drop := '[]'::jsonb;
  end if;
  if jsonb_array_length(p_rows) > 80 or jsonb_array_length(p_drop) > 80 then
    return;
  end if;
  for row in select value from jsonb_array_elements(p_rows)
  loop
    k := row->>'kind';
    lid := left(coalesce(row->>'local_id', ''), 80);
    body := coalesce(row->'payload', '{}'::jsonb);
    if k not in ('activity', 'ticket', 'order', 'notification', 'address', 'reward', 'favorite', 'saved') then
      continue;
    end if;
    if char_length(lid) < 1 or octet_length(body::text) > 12000 then
      continue;
    end if;
    insert into public.user_records (user_id, kind, local_id, payload, updated_at)
    values (uid, k, lid, body, now())
    on conflict (user_id, kind, local_id) do update
      set payload = excluded.payload, updated_at = now();
  end loop;
  for row in select value from jsonb_array_elements(p_drop)
  loop
    k := row->>'kind';
    lid := left(coalesce(row->>'local_id', ''), 80);
    if k not in ('activity', 'ticket', 'order', 'notification', 'address', 'reward', 'favorite', 'saved') then
      continue;
    end if;
    if char_length(lid) < 1 then
      continue;
    end if;
    delete from public.user_records where user_id = uid and kind = k and local_id = lid;
  end loop;
end;
$$;

revoke all on function public.save_records(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.save_records(jsonb, jsonb) to authenticated;

-- Pièces d'identité, assistance, console et clé d'appareil.
-- Aucune image d'empreinte ou de visage n'est stockée : seulement la clé publique WebAuthn.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;

create table if not exists public.identity_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  doc_type text not null check (doc_type in ('cni', 'passeport', 'permis')),
  storage_path text not null check (char_length(storage_path) between 3 and 200),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
alter table public.identity_documents enable row level security;
create index if not exists identity_documents_status_idx on public.identity_documents (status, created_at desc);

create table if not exists public.support_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  subject text not null default 'Assistance' check (char_length(subject) between 1 and 80),
  status text not null default 'open' check (status in ('open', 'closed')),
  updated_at timestamptz not null default now()
);
alter table public.support_threads enable row level security;
create unique index if not exists support_one_open on public.support_threads (user_id) where status = 'open';

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.support_threads (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  from_staff boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.support_messages enable row level security;
create index if not exists support_messages_thread_idx on public.support_messages (thread_id, created_at);

create table if not exists public.device_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  credential_id text not null unique check (char_length(credential_id) between 8 and 512),
  public_key text not null check (char_length(public_key) between 16 and 4000),
  counter bigint not null default 0,
  kind text not null check (kind in ('face', 'fingerprint')),
  created_at timestamptz not null default now()
);
alter table public.device_keys enable row level security;

create table if not exists public.webauthn_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge text not null,
  purpose text not null check (purpose in ('register', 'confirm')),
  expires_at timestamptz not null
);
alter table public.webauthn_challenges enable row level security;

create table if not exists public.auth_confirmations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.auth_confirmations enable row level security;
create index if not exists auth_confirmations_user_idx on public.auth_confirmations (user_id, created_at desc);

create table if not exists public.pin_attempts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  failures integer not null default 0,
  locked_until timestamptz
);
alter table public.pin_attempts enable row level security;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

create or replace function private.claim_console()
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return 'denied';
  end if;
  if exists (select 1 from public.partner_access where auth_user_id = auth.uid()) then
    return 'denied';
  end if;
  if exists (select 1 from public.staff where user_id = auth.uid()) then
    return 'member';
  end if;
  return 'denied';
end;
$$;

create or replace function public.claim_console()
returns text
language sql
security invoker
set search_path = public
as $$
  select private.claim_console();
$$;

create or replace function private.touch_support_thread()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_threads set updated_at = now() where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists support_message_touch on public.support_messages;
create trigger support_message_touch
  after insert on public.support_messages
  for each row execute function private.touch_support_thread();

revoke all on function private.is_staff() from public, anon;
revoke all on function private.claim_console() from public, anon;
revoke all on function private.touch_support_thread() from public, anon, authenticated;
revoke all on function public.claim_console() from public, anon, authenticated;
grant execute on function private.is_staff() to authenticated;
grant execute on function private.claim_console() to authenticated;
grant execute on function public.claim_console() to authenticated;

drop policy if exists "staff self" on public.staff;
create policy "staff self" on public.staff for select to authenticated
  using (user_id = (select auth.uid()) or private.is_staff());

drop policy if exists "staff read profiles" on public.profiles;
create policy "staff read profiles" on public.profiles for select to authenticated
  using (private.is_staff());

drop policy if exists "identity own read" on public.identity_documents;
create policy "identity own read" on public.identity_documents for select to authenticated
  using (user_id = (select auth.uid()) or private.is_staff());
drop policy if exists "identity own insert" on public.identity_documents;
create policy "identity own insert" on public.identity_documents for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and reviewed_at is null
    and storage_path like ((select auth.uid()::text) || '/%')
  );
drop policy if exists "identity staff update" on public.identity_documents;
create policy "identity staff update" on public.identity_documents for update to authenticated
  using (private.is_staff())
  with check (private.is_staff());

drop policy if exists "thread read" on public.support_threads;
create policy "thread read" on public.support_threads for select to authenticated
  using (user_id = (select auth.uid()) or private.is_staff());
drop policy if exists "thread insert" on public.support_threads;
create policy "thread insert" on public.support_threads for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'open');
drop policy if exists "thread staff update" on public.support_threads;
create policy "thread staff update" on public.support_threads for update to authenticated
  using (private.is_staff())
  with check (private.is_staff());

drop policy if exists "message read" on public.support_messages;
create policy "message read" on public.support_messages for select to authenticated
  using (
    private.is_staff()
    or exists (
      select 1 from public.support_threads t
      where t.id = thread_id and t.user_id = (select auth.uid())
    )
  );
drop policy if exists "message member insert" on public.support_messages;
create policy "message member insert" on public.support_messages for insert to authenticated
  with check (
    from_staff = false
    and user_id = (select auth.uid())
    and exists (
      select 1 from public.support_threads t
      where t.id = thread_id and t.user_id = (select auth.uid())
    )
  );
drop policy if exists "message staff insert" on public.support_messages;
create policy "message staff insert" on public.support_messages for insert to authenticated
  with check (
    private.is_staff()
    and from_staff = true
    and user_id = (select auth.uid())
  );

drop policy if exists "device key read" on public.device_keys;
create policy "device key read" on public.device_keys for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "device key delete" on public.device_keys;
create policy "device key delete" on public.device_keys for delete to authenticated
  using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('identity', 'identity', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "identity file insert" on storage.objects;
create policy "identity file insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'identity'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp', 'pdf')
  );
drop policy if exists "identity file read" on storage.objects;
create policy "identity file read" on storage.objects for select to authenticated
  using (
    bucket_id = 'identity'
    and (
      (storage.foldername(name))[1] = (select auth.uid()::text)
      or private.is_staff()
    )
  );

-- Un compte qui a enregistré Face ID ou l'empreinte doit confirmer avant un débit.
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
  cid uuid;
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

  select id into cid
  from public.auth_confirmations
  where user_id = uid and used = false and expires_at > now()
  order by created_at desc
  limit 1
  for update;
  if cid is null then
    return jsonb_build_object('ok', false, 'reason', 'confirm');
  end if;
  update public.auth_confirmations set used = true where id = cid;

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


drop view if exists public.users;
create view public.users
with (security_invoker = true) as
select id, email, full_name, phone, city, country, created_at
from public.profiles;
comment on view public.users is
  'Alias RLS de public.profiles. Les comptes Auth sont dans auth.users.';
grant select on public.users to authenticated;
revoke all on public.users from anon, public;

alter table public.profiles add column if not exists avatar_url text;

create table if not exists public.catalog_events (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{2,40}$'),
  name text not null check (char_length(name) >= 2 and char_length(name) <= 120),
  city text not null check (char_length(city) >= 2 and char_length(city) <= 80),
  country text not null default '',
  place text not null default '',
  cat text not null default 'Festivals',
  starts_on date not null,
  starts_at text not null default '18:00',
  body text not null default '',
  organizer text not null default '',
  image_url text not null default '',
  lat double precision,
  lng double precision,
  tickets jsonb not null default '[]'::jsonb,
  program jsonb not null default '[]'::jsonb,
  hidden boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.catalog_events enable row level security;

drop policy if exists "events anon read" on public.catalog_events;
create policy "events anon read" on public.catalog_events for select to anon
  using (hidden = false);

drop policy if exists "events auth read" on public.catalog_events;
create policy "events auth read" on public.catalog_events for select to authenticated
  using (hidden = false or (select private.is_staff()));

drop policy if exists "events staff insert" on public.catalog_events;
create policy "events staff insert" on public.catalog_events for insert to authenticated
  with check ((select private.is_staff()));

drop policy if exists "events staff update" on public.catalog_events;
create policy "events staff update" on public.catalog_events for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

drop policy if exists "events staff delete" on public.catalog_events;
create policy "events staff delete" on public.catalog_events for delete to authenticated
  using ((select private.is_staff()));

grant select on public.catalog_events to anon, authenticated;
grant insert, update, delete on public.catalog_events to authenticated;

create or replace view public.catalog_event_flags
  with (security_invoker = false) as
  select id, hidden from public.catalog_events;

grant select on public.catalog_event_flags to anon, authenticated;
