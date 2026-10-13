-- Correctifs d'intégrité YOUSS CONNECT.
-- À coller dans le SQL Editor du projet, puis Run.
-- Couvre : FK 23503 (profiles / staff), 42501 partner_places, vue users, compte sans profil.

-- 1. Le trigger d'inscription ne doit jamais faire échouer auth.users.
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

-- 2. Création atomique profil + wallet uniquement si la ligne existe dans auth.users.
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

-- Le client n'insère plus un profil : évite 23503 / 409 si le JWT ne correspond plus à auth.users.
drop policy if exists "own profile insert" on public.profiles;
revoke insert on table public.profiles from anon, authenticated;
grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.wallets to service_role;

-- 3. staff référence auth.users (pas profiles) : claim_console ne casse plus si le profil arrive après.
do $$
declare r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public' and t.relname = 'staff' and c.contype = 'f'
  loop
    execute format('alter table public.staff drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.staff
  add constraint staff_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

create or replace function private.claim_console()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return 'denied';
  end if;
  if not exists (select 1 from auth.users where id = uid) then
    return 'denied';
  end if;
  if to_regclass('public.partner_access') is not null
     and exists (select 1 from public.partner_access where auth_user_id = uid) then
    return 'denied';
  end if;
  if exists (select 1 from public.staff where user_id = uid) then
    return 'member';
  end if;

  insert into public.profiles (id, phone, full_name, email)
  select uid, u.phone, coalesce(u.raw_user_meta_data->>'full_name', ''), coalesce(u.email, '')
  from auth.users u
  where u.id = uid
  on conflict (id) do nothing;
  insert into public.wallets (user_id) values (uid)
  on conflict (user_id) do nothing;

  perform pg_advisory_xact_lock(2041301);
  if exists (select 1 from public.staff) then
    return 'denied';
  end if;
  begin
    insert into public.staff (user_id, role) values (uid, 'admin');
  exception
    when unique_violation then
      return 'member';
    when foreign_key_violation then
      return 'denied';
  end;
  return 'created';
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

revoke all on function public.claim_console() from public, anon;
grant execute on function public.claim_console() to authenticated;

-- 4. partner_places : REVOKE FROM public avait retiré INSERT à service_role (42501).
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.partner_places to service_role;
grant select, insert, update, delete on table public.partner_access to service_role;
grant select, insert, update, delete on table public.partner_dishes to service_role;
grant select, insert, update, delete on table public.partner_orders to service_role;
grant select, insert, update, delete on table public.service_requests to service_role;

grant insert, delete on table public.partner_places to authenticated;

drop policy if exists "places staff insert" on public.partner_places;
create policy "places staff insert" on public.partner_places
  for insert to authenticated
  with check (private.is_staff());

drop policy if exists "places staff delete" on public.partner_places;
create policy "places staff delete" on public.partner_places
  for delete to authenticated
  using (private.is_staff());

-- 5. Compatibilité SQL : il n'existe pas de table public.users (42P01).
-- « user » est un mot réservé (42601) : écrire auth.users ou public.profiles.
drop view if exists public.users;
create view public.users
with (security_invoker = true) as
select id, email, full_name, phone, city, country, created_at
from public.profiles;
comment on view public.users is
  'Alias RLS de public.profiles. Les comptes Auth sont dans auth.users, pas dans public.users ni public.user.';
grant select on public.users to authenticated;
revoke all on public.users from anon, public;
