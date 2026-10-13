-- Restaurants tenus par la console KYA.
-- Le mot de passe n'est jamais stocké : la fonction partenaire le crée et le remet une seule fois.
-- À exécuter après supabase/schema.sql.

create table if not exists public.partner_places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  city text not null check (char_length(city) between 2 and 60),
  country_code text not null check (country_code in ('BJ', 'SN', 'TG', 'GH')),
  area text not null default '' check (char_length(area) <= 80),
  address text not null default '' check (char_length(address) <= 160),
  phone text not null default '' check (char_length(phone) <= 24),
  hours text not null default '11:00 – 22:00' check (char_length(hours) <= 80),
  paused boolean not null default false,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);
alter table public.partner_places enable row level security;

create table if not exists public.partner_access (
  place_id uuid primary key references public.partner_places (id) on delete cascade,
  login_id text not null unique check (login_id ~ '^[A-Z0-9][A-Z0-9-]{2,22}[A-Z0-9]$'),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.partner_access enable row level security;

create table if not exists public.partner_dishes (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.partner_places (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 200),
  price integer not null check (price > 0 and price <= 500000),
  grp text not null default 'Plats' check (grp in ('Entrées', 'Plats', 'Boissons')),
  available boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.partner_dishes enable row level security;
create index if not exists partner_dishes_place_idx on public.partner_dishes (place_id);

create table if not exists public.partner_orders (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.partner_places (id) on delete cascade,
  customer_id uuid not null references auth.users (id) on delete cascade,
  number text not null check (char_length(number) between 4 and 24),
  client_name text not null default '' check (char_length(client_name) <= 80),
  items jsonb not null,
  total integer not null check (total >= 0 and total <= 2000000),
  status text not null default 'Nouvelle' check (status in ('Nouvelle', 'En préparation', 'Prête', 'Livrée', 'Annulée')),
  method text not null check (method in ('cash', 'wallet')),
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.partner_orders enable row level security;
create index if not exists partner_orders_place_idx on public.partner_orders (place_id, created_at desc);
create index if not exists partner_orders_customer_idx on public.partner_orders (customer_id, created_at desc);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('ride', 'delivery')),
  provider text not null default 'pending' check (provider in ('pending', 'gozem', 'indrive', 'wedrive', 'internal')),
  status text not null default 'waiting_partner' check (status in ('waiting_partner', 'cancelled')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.service_requests enable row level security;
create index if not exists service_requests_user_idx on public.service_requests (user_id, created_at desc);

revoke all on table public.partner_places from public, anon, authenticated;
grant select on table public.partner_places to anon, authenticated;
grant update on table public.partner_places to authenticated;

revoke all on table public.partner_access from public, anon, authenticated;
grant select on table public.partner_access to authenticated;

revoke all on table public.partner_dishes from public, anon, authenticated;
grant select on table public.partner_dishes to anon, authenticated;
grant insert, update, delete on table public.partner_dishes to authenticated;

revoke all on table public.partner_orders from public, anon, authenticated;
grant select, update on table public.partner_orders to authenticated;

revoke all on table public.service_requests from public, anon, authenticated;
grant select, insert, update on table public.service_requests to authenticated;

drop policy if exists "places public read" on public.partner_places;
create policy "places public read" on public.partner_places for select to anon, authenticated
  using (true);
drop policy if exists "places owner update" on public.partner_places;
create policy "places owner update" on public.partner_places for update to authenticated
  using (
    private.is_staff()
    or exists (select 1 from public.partner_access a where a.place_id = id and a.auth_user_id = (select auth.uid()))
  )
  with check (
    private.is_staff()
    or exists (select 1 from public.partner_access a where a.place_id = id and a.auth_user_id = (select auth.uid()))
  );

drop policy if exists "access own read" on public.partner_access;
create policy "access own read" on public.partner_access for select to authenticated
  using (auth_user_id = (select auth.uid()) or private.is_staff());

drop policy if exists "dishes public read" on public.partner_dishes;
create policy "dishes public read" on public.partner_dishes for select to anon, authenticated
  using (true);
drop policy if exists "dishes owner insert" on public.partner_dishes;
create policy "dishes owner insert" on public.partner_dishes for insert to authenticated
  with check (
    private.is_staff()
    or exists (select 1 from public.partner_access a where a.place_id = partner_dishes.place_id and a.auth_user_id = (select auth.uid()))
  );
drop policy if exists "dishes owner update" on public.partner_dishes;
create policy "dishes owner update" on public.partner_dishes for update to authenticated
  using (
    private.is_staff()
    or exists (select 1 from public.partner_access a where a.place_id = partner_dishes.place_id and a.auth_user_id = (select auth.uid()))
  )
  with check (
    private.is_staff()
    or exists (select 1 from public.partner_access a where a.place_id = partner_dishes.place_id and a.auth_user_id = (select auth.uid()))
  );
drop policy if exists "dishes owner delete" on public.partner_dishes;
create policy "dishes owner delete" on public.partner_dishes for delete to authenticated
  using (
    private.is_staff()
    or exists (select 1 from public.partner_access a where a.place_id = partner_dishes.place_id and a.auth_user_id = (select auth.uid()))
  );

drop policy if exists "orders read" on public.partner_orders;
create policy "orders read" on public.partner_orders for select to authenticated
  using (
    customer_id = (select auth.uid())
    or private.is_staff()
    or exists (select 1 from public.partner_access a where a.place_id = partner_orders.place_id and a.auth_user_id = (select auth.uid()))
  );
drop policy if exists "orders kitchen update" on public.partner_orders;
create policy "orders kitchen update" on public.partner_orders for update to authenticated
  using (
    private.is_staff()
    or exists (select 1 from public.partner_access a where a.place_id = partner_orders.place_id and a.auth_user_id = (select auth.uid()))
  )
  with check (
    private.is_staff()
    or exists (select 1 from public.partner_access a where a.place_id = partner_orders.place_id and a.auth_user_id = (select auth.uid()))
  );

drop policy if exists "requests own read" on public.service_requests;
create policy "requests own read" on public.service_requests for select to authenticated
  using (user_id = (select auth.uid()) or private.is_staff());
drop policy if exists "requests own insert" on public.service_requests;
create policy "requests own insert" on public.service_requests for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'waiting_partner'
    and provider = 'pending'
    and kind in ('ride', 'delivery')
    and octet_length(payload::text) < 4000
  );
drop policy if exists "requests own update" on public.service_requests;
create policy "requests own update" on public.service_requests for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and status in ('waiting_partner', 'cancelled') and provider = 'pending');

create or replace function private.guard_partner_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not private.is_staff() then
    if not exists (select 1 from public.partner_access a where a.place_id = old.place_id and a.auth_user_id = auth.uid()) then
      raise exception 'denied';
    end if;
    new.place_id := old.place_id;
    new.customer_id := old.customer_id;
    new.number := old.number;
    new.client_name := old.client_name;
    new.items := old.items;
    new.total := old.total;
    new.method := old.method;
    new.note := old.note;
    new.created_at := old.created_at;
  end if;
  if new.status not in ('Nouvelle', 'En préparation', 'Prête', 'Livrée', 'Annulée') then
    raise exception 'statut';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists partner_order_guard on public.partner_orders;
create trigger partner_order_guard
  before update on public.partner_orders
  for each row execute procedure private.guard_partner_order();

create or replace function private.place_partner_order(
  p_place uuid,
  p_items jsonb,
  p_note text,
  p_method text,
  p_fee integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  place public.partner_places;
  item jsonb;
  dish public.partner_dishes;
  qty integer;
  total integer := 0;
  fee integer := coalesce(p_fee, 0);
  built jsonb := '[]'::jsonb;
  client_name text;
  num text;
  oid uuid;
  pay jsonb;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated', 'message', 'Connectez-vous.');
  end if;
  if p_method not in ('cash', 'wallet') then
    return jsonb_build_object('ok', false, 'reason', 'unavailable', 'message', 'Ce paiement n''est pas encore ouvert.');
  end if;
  if fee < 0 or fee > 5000 then
    return jsonb_build_object('ok', false, 'reason', 'error', 'message', 'Frais de livraison invalides.');
  end if;
  select * into place from public.partner_places where id = p_place;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'error', 'message', 'Restaurant introuvable.');
  end if;
  if place.paused then
    return jsonb_build_object('ok', false, 'reason', 'paused', 'message', 'Ce restaurant est en pause.');
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 30 then
    return jsonb_build_object('ok', false, 'reason', 'error', 'message', 'Commande vide.');
  end if;
  for item in select value from jsonb_array_elements(p_items)
  loop
    begin
      qty := (item->>'qty')::integer;
    exception when others then
      return jsonb_build_object('ok', false, 'reason', 'error', 'message', 'Quantité invalide.');
    end;
    if qty is null or qty < 1 or qty > 20 then
      return jsonb_build_object('ok', false, 'reason', 'error', 'message', 'Quantité invalide.');
    end if;
    begin
      select * into dish from public.partner_dishes
        where id = (item->>'id')::uuid and place_id = p_place and available = true;
    exception when others then
      return jsonb_build_object('ok', false, 'reason', 'error', 'message', 'Un plat n''est plus disponible.');
    end;
    if dish.id is null then
      return jsonb_build_object('ok', false, 'reason', 'error', 'message', 'Un plat n''est plus disponible.');
    end if;
    total := total + dish.price * qty;
    built := built || jsonb_build_array(jsonb_build_object('id', dish.id, 'name', dish.name, 'qty', qty, 'price', dish.price));
  end loop;
  total := total + fee;
  if total <= 0 or total > 2000000 then
    return jsonb_build_object('ok', false, 'reason', 'error', 'message', 'Montant invalide.');
  end if;
  if p_method = 'wallet' then
    pay := public.wallet_pay(total, left('Commande ' || place.name, 160), 'restaurant', least(total / 100, 500), '{}'::jsonb);
    if coalesce((pay->>'ok')::boolean, false) is not true then
      return pay;
    end if;
  end if;
  select left(coalesce(full_name, 'Client'), 80) into client_name from public.profiles where id = uid;
  num := 'YC-R-' || lpad((floor(random() * 900000) + 100000)::integer::text, 6, '0');
  insert into public.partner_orders (place_id, customer_id, number, client_name, items, total, status, method, note)
  values (p_place, uid, num, coalesce(client_name, 'Client'), built, total, 'Nouvelle', p_method, left(coalesce(p_note, ''), 300))
  returning id into oid;
  return jsonb_build_object('ok', true, 'id', oid, 'number', num, 'total', total, 'balance', pay->>'balance', 'points', pay->>'points');
exception when others then
  return jsonb_build_object('ok', false, 'reason', 'error', 'message', 'Commande impossible.');
end;
$$;

create or replace function public.place_partner_order(
  p_place uuid,
  p_items jsonb,
  p_note text,
  p_method text,
  p_fee integer
) returns jsonb
language sql
security invoker
set search_path = public
as $$
  select private.place_partner_order(p_place, p_items, p_note, p_method, p_fee);
$$;

revoke all on function private.guard_partner_order() from public, anon, authenticated;
revoke all on function private.place_partner_order(uuid, jsonb, text, text, integer) from public, anon, authenticated;
revoke all on function public.place_partner_order(uuid, jsonb, text, text, integer) from public, anon, authenticated;
grant execute on function private.place_partner_order(uuid, jsonb, text, text, integer) to authenticated;
grant execute on function public.place_partner_order(uuid, jsonb, text, text, integer) to authenticated;

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
  perform pg_advisory_xact_lock(2041301);
  if exists (select 1 from public.staff) then
    return 'denied';
  end if;
  insert into public.staff (user_id, role) values (auth.uid(), 'admin');
  return 'created';
end;
$$;

create or replace function private.guard_partner_place()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not private.is_staff() then
    new.id := old.id;
    new.name := old.name;
    new.city := old.city;
    new.country_code := old.country_code;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists partner_place_guard on public.partner_places;
create trigger partner_place_guard
  before update on public.partner_places
  for each row execute procedure private.guard_partner_place();

revoke all on function private.guard_partner_place() from public, anon, authenticated;
