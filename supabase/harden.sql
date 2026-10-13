-- Durcissement : plus de promotion automatique, code PIN vérifié sur le serveur,
-- journal de la console, plafond d'inscription, synchronisation des listes.

create extension if not exists pgcrypto with schema extensions;

-- La console n'ouvre plus un accès au premier visiteur.
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
  if to_regclass('public.partner_access') is not null
     and exists (select 1 from public.partner_access where auth_user_id = auth.uid()) then
    return 'denied';
  end if;
  if exists (select 1 from public.staff where user_id = auth.uid()) then
    return 'member';
  end if;
  return 'denied';
end;
$$;

-- Code PIN : bcrypt sur le serveur. Un ancien condensé SHA-256 encore en base
-- est accepté une fois, puis remplacé. Le navigateur ne reçoit jamais le condensé.
create or replace function private.apply_pin(p_pin text, p_next text, p_grant boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_stored text;
  v_failures integer;
  v_locked timestamptz;
  v_chosen text;
  v_matched boolean := false;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'message', 'Connectez-vous.');
  end if;
  if p_pin is null or p_pin !~ '^\d{4}$' then
    return jsonb_build_object('ok', false, 'message', 'Saisissez les 4 chiffres du code.');
  end if;
  if p_next is not null and p_next <> '' and p_next !~ '^\d{4}$' then
    return jsonb_build_object('ok', false, 'message', 'Saisissez les 4 chiffres du code.');
  end if;

  select a.failures, a.locked_until into v_failures, v_locked
  from public.pin_attempts a where a.user_id = v_uid;
  if v_locked is not null and v_locked > now() then
    return jsonb_build_object('ok', false, 'message', 'Trop de codes incorrects. Réessayez dans une heure.');
  end if;

  select p.pin_hash into v_stored from public.profiles p where p.id = v_uid for update;

  if v_stored is null or v_stored = '' then
    v_chosen := p_pin;
  else
    if left(v_stored, 3) = '$2a' or left(v_stored, 3) = '$2b' then
      v_matched := v_stored = extensions.crypt(p_pin, v_stored);
    else
      v_matched := v_stored = encode(extensions.digest(convert_to('youss-pin-v1:' || p_pin, 'UTF8'), 'sha256'), 'hex');
    end if;
    if not v_matched then
      v_failures := coalesce(v_failures, 0) + 1;
      if v_failures >= 5 then
        insert into public.pin_attempts as a (user_id, failures, locked_until)
        values (v_uid, 0, now() + interval '1 hour')
        on conflict (user_id) do update set failures = 0, locked_until = now() + interval '1 hour';
        return jsonb_build_object('ok', false, 'message', 'Trop de codes incorrects. Réessayez dans une heure.');
      end if;
      insert into public.pin_attempts as a (user_id, failures, locked_until)
      values (v_uid, v_failures, null)
      on conflict (user_id) do update set failures = excluded.failures, locked_until = null;
      return jsonb_build_object('ok', false, 'message', 'Code PIN incorrect.');
    end if;
    v_chosen := case when p_next ~ '^\d{4}$' and p_next <> p_pin then p_next else null end;
  end if;

  if v_chosen is not null and v_chosen in ('0000', '1111', '2222', '1234', '2580', '1212', '1122') then
    return jsonb_build_object('ok', false, 'message', 'Choisissez un code moins simple.');
  end if;

  if v_chosen is not null or v_stored is null or v_stored = '' or left(coalesce(v_stored, ''), 1) <> '$' then
    update public.profiles
      set pin_hash = extensions.crypt(coalesce(v_chosen, p_pin), extensions.gen_salt('bf', 10))
      where id = v_uid;
  end if;

  insert into public.pin_attempts as a (user_id, failures, locked_until)
  values (v_uid, 0, null)
  on conflict (user_id) do update set failures = 0, locked_until = null;

  if p_grant then
    insert into public.auth_confirmations (user_id, expires_at)
    values (v_uid, now() + interval '90 seconds');
  end if;

  return jsonb_build_object('ok', true, 'set', true);
end;
$$;

create or replace function public.apply_pin(p_pin text, p_next text default null, p_grant boolean default false)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select private.apply_pin(p_pin, p_next, p_grant);
$$;

create or replace function public.pin_status()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and pin_hash is not null and pin_hash <> ''
  );
$$;

revoke all on function private.apply_pin(text, text, boolean) from public, anon, authenticated;
revoke all on function public.apply_pin(text, text, boolean) from public, anon, authenticated;
revoke all on function public.pin_status() from public, anon, authenticated;
grant execute on function private.apply_pin(text, text, boolean) to authenticated;
grant execute on function public.apply_pin(text, text, boolean) to authenticated;
grant execute on function public.pin_status() to authenticated;

-- Un débit du portefeuille exige une confirmation récente (PIN ou biométrie).
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

-- Listes du compte : activités, commandes, billets, adresses, favoris, points.
alter table public.user_records drop constraint if exists user_records_kind_check;
alter table public.user_records add constraint user_records_kind_check
  check (kind in ('activity', 'ticket', 'order', 'notification', 'address', 'reward', 'favorite', 'saved'));
alter table public.user_records add column if not exists updated_at timestamptz not null default now();

drop function if exists public.save_records(jsonb);

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
    delete from public.user_records
    where user_id = uid and kind = k and local_id = lid;
  end loop;
end;
$$;

revoke all on function public.save_records(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.save_records(jsonb, jsonb) to authenticated;

-- Journal des actions de la console. Le client ne peut pas écrire la ligne lui-même.
create table if not exists public.staff_events (
  id uuid primary key default gen_random_uuid(),
  actor uuid not null references public.profiles (id) on delete cascade,
  action text not null check (action in ('identity_approved', 'identity_rejected', 'restaurant_created', 'restaurant_reset')),
  subject text not null default '' check (char_length(subject) <= 120),
  created_at timestamptz not null default now()
);
alter table public.staff_events enable row level security;
drop policy if exists "staff read events" on public.staff_events;
create policy "staff read events" on public.staff_events for select to authenticated
  using ((select private.is_staff()));
create index if not exists staff_events_created_idx on public.staff_events (created_at desc);

create or replace function public.staff_note(p_action text, p_subject text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not private.is_staff() then
    return;
  end if;
  if p_action not in ('identity_approved', 'identity_rejected', 'restaurant_created', 'restaurant_reset') then
    return;
  end if;
  insert into public.staff_events (actor, action, subject)
  values (auth.uid(), p_action, left(coalesce(p_subject, ''), 120));
end;
$$;

revoke all on function public.staff_note(text, text) from public, anon, authenticated;
grant execute on function public.staff_note(text, text) to authenticated;

-- Plafond d'ouvertures de compte, appelé uniquement par la fonction serveur.
create table if not exists private.signup_buckets (
  bucket text primary key,
  hits integer not null,
  window_start timestamptz not null
);
revoke all on table private.signup_buckets from public, anon, authenticated;

create or replace function public.signup_slot(p_key text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
  started timestamptz;
  key text := left(coalesce(p_key, ''), 80);
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    return false;
  end if;
  if key = '' then
    return false;
  end if;
  select hits, window_start into n, started
  from private.signup_buckets where bucket = key for update;
  if started is null or started < now() - interval '1 hour' then
    insert into private.signup_buckets (bucket, hits, window_start)
    values (key, 1, now())
    on conflict (bucket) do update set hits = 1, window_start = now();
    return true;
  end if;
  if n >= 5 then
    return false;
  end if;
  update private.signup_buckets set hits = hits + 1 where bucket = key;
  return true;
end;
$$;

revoke all on function public.signup_slot(text) from public, anon, authenticated;
grant execute on function public.signup_slot(text) to service_role;

-- Le navigateur ne peut plus écrire le condensé du code PIN.
revoke update (pin_hash) on public.profiles from public, anon, authenticated;
