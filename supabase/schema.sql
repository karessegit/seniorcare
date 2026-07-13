-- Diese Datei erstellt die Datenbank-Struktur fuer Supabase.
create extension if not exists "pgcrypto";

do $$
begin
  create type public.app_role as enum ('senior', 'caregiver');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'senior',
  first_name text not null,
  last_name text not null default '',
  selected_senior_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.caregivers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.seniors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  age integer not null default 72,
  code text not null unique,
  last_active text not null default '',
  current_mood text,
  complaint text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_selected_senior_id_fkey;

alter table public.profiles
  add constraint profiles_selected_senior_id_fkey
  foreign key (selected_senior_id) references public.seniors(id) on delete set null;

create table if not exists public.caregiver_seniors (
  caregiver_id uuid not null references public.caregivers(id) on delete cascade,
  senior_id uuid not null references public.seniors(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (caregiver_id, senior_id)
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references public.seniors(id) on delete cascade,
  name text not null,
  amount integer not null default 1,
  unit text not null default 'Tablette',
  time text not null,
  notes text not null default '',
  taken boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references public.seniors(id) on delete cascade,
  doctor text not null,
  date date not null,
  time text not null,
  address text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references public.seniors(id) on delete cascade,
  text text not null,
  is_me boolean not null default false,
  time_label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.exercise_templates (
  id bigserial primary key,
  exercise_key text not null unique,
  emoji text not null,
  name text not null,
  duration text not null,
  level text not null,
  description text not null,
  steps jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0
);

create table if not exists public.exercise_progress (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references public.seniors(id) on delete cascade,
  exercise_key text not null references public.exercise_templates(exercise_key) on delete cascade,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (senior_id, exercise_key)
);

create index if not exists caregivers_profile_id_idx on public.caregivers (profile_id);
create index if not exists seniors_profile_id_idx on public.seniors (profile_id);
create index if not exists caregiver_seniors_caregiver_id_idx on public.caregiver_seniors (caregiver_id);
create index if not exists caregiver_seniors_senior_id_idx on public.caregiver_seniors (senior_id);
create index if not exists medications_senior_id_idx on public.medications (senior_id);
create index if not exists appointments_senior_id_idx on public.appointments (senior_id);
create index if not exists assistant_messages_senior_id_idx on public.assistant_messages (senior_id);
create index if not exists exercise_progress_senior_id_idx on public.exercise_progress (senior_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_exercise_progress_updated_at on public.exercise_progress;
create trigger set_exercise_progress_updated_at
before update on public.exercise_progress
for each row execute function public.set_updated_at();

create or replace function public.generate_six_digit_code()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists(select 1 from public.seniors where code = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function public.bootstrap_senior_data(target_senior_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.medications (senior_id, name, amount, unit, time, notes, taken)
  values (target_senior_id, 'Aspirine', 1, 'Tablette', '20:00', 'eine Tablette mit einem Glas Wasser', false)
  on conflict do nothing;

  insert into public.appointments (senior_id, doctor, date, time, address)
  values (target_senior_id, 'Dr. Schmidt', date '2026-06-15', '11:00', 'Berliner Str. 8, 67437 Darmstadt')
  on conflict do nothing;

  insert into public.assistant_messages (senior_id, text, is_me, time_label)
  values (target_senior_id, 'Hallo! Wie kann ich dir heute helfen?', false, '09:41')
  on conflict do nothing;

  insert into public.exercise_progress (senior_id, exercise_key, done)
  select target_senior_id, exercise_key, false
  from public.exercise_templates
  on conflict (senior_id, exercise_key) do nothing;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text := coalesce(new.raw_user_meta_data->>'role', 'senior');
  first_name text := coalesce(nullif(new.raw_user_meta_data->>'first_name', ''), split_part(coalesce(new.email, 'Benutzer'), '@', 1));
  last_name text := coalesce(nullif(new.raw_user_meta_data->>'last_name', ''), '');
  new_senior_id uuid;
begin
  if user_role not in ('senior', 'caregiver') then
    user_role := 'senior';
  end if;

  insert into public.profiles (id, role, first_name, last_name)
  values (new.id, user_role::public.app_role, first_name, last_name);

  if user_role = 'caregiver' then
    insert into public.caregivers (profile_id)
    values (new.id);
  else
    insert into public.seniors (profile_id, age, code, last_active, current_mood, complaint)
    values (
      new.id,
      coalesce((new.raw_user_meta_data->>'age')::integer, 72),
      public.generate_six_digit_code(),
      to_char(now(), '"Heute" HH24:MI'),
      null,
      ''
    )
    returning id into new_senior_id;

    perform public.bootstrap_senior_data(new_senior_id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.can_access_senior(target_senior_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select
    exists (
      select 1
      from public.seniors s
      where s.id = target_senior_id
        and s.profile_id = auth.uid()
    )
    or exists (
      select 1
      from public.caregivers c
      join public.caregiver_seniors cs on cs.caregiver_id = c.id
      where c.profile_id = auth.uid()
        and cs.senior_id = target_senior_id
    );
$$;

create or replace function public.can_manage_senior(target_senior_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select public.can_access_senior(target_senior_id);
$$;

create or replace function public.is_senior_owner(target_senior_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.seniors s
    where s.id = target_senior_id
      and s.profile_id = auth.uid()
  );
$$;

create or replace function public.link_senior_by_code(senior_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caregiver_profile_id uuid := auth.uid();
  caregiver_id uuid;
  senior_id uuid;
begin
  if caregiver_profile_id is null then
    raise exception 'not authenticated';
  end if;

  select c.id
  into caregiver_id
  from public.caregivers c
  where c.profile_id = caregiver_profile_id;

  if caregiver_id is null then
    raise exception 'current user is not a caregiver';
  end if;

  select s.id
  into senior_id
  from public.seniors s
  where s.code = senior_code;

  if senior_id is null then
    raise exception 'senior not found';
  end if;

  -- TODO: If this caregiver is already linked to the same senior, reject the request and show that the caregiver is already connected.
  insert into public.caregiver_seniors (caregiver_id, senior_id)
  values (caregiver_id, senior_id)
  on conflict do nothing;

  update public.profiles
  set selected_senior_id = senior_id
  where id = caregiver_profile_id;

  return senior_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.caregivers enable row level security;
alter table public.seniors enable row level security;
alter table public.caregiver_seniors enable row level security;
alter table public.medications enable row level security;
alter table public.appointments enable row level security;
alter table public.assistant_messages enable row level security;
alter table public.exercise_templates enable row level security;
alter table public.exercise_progress enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_select_linked_seniors" on public.profiles;
create policy "profiles_select_linked_seniors"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.caregivers c
    join public.caregiver_seniors cs on cs.caregiver_id = c.id
    join public.seniors s on s.id = cs.senior_id
    where c.profile_id = auth.uid()
      and s.profile_id = profiles.id
  )
);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "caregivers_select_own" on public.caregivers;
create policy "caregivers_select_own"
on public.caregivers
for select
to authenticated
using (profile_id = auth.uid());

drop policy if exists "caregivers_update_own" on public.caregivers;
create policy "caregivers_update_own"
on public.caregivers
for update
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

drop policy if exists "seniors_select_accessible" on public.seniors;
create policy "seniors_select_accessible"
on public.seniors
for select
to authenticated
using (public.can_access_senior(id));

drop policy if exists "seniors_update_owner" on public.seniors;
drop policy if exists "seniors_update_accessible" on public.seniors;
create policy "seniors_update_accessible"
on public.seniors
for update
to authenticated
using (public.can_manage_senior(id))
with check (public.can_manage_senior(id));

drop policy if exists "caregiver_seniors_select_own" on public.caregiver_seniors;
create policy "caregiver_seniors_select_own"
on public.caregiver_seniors
for select
to authenticated
using (
  exists (
    select 1
    from public.caregivers c
    where c.id = caregiver_seniors.caregiver_id
      and c.profile_id = auth.uid()
  )
);

drop policy if exists "caregiver_seniors_delete_own" on public.caregiver_seniors;
create policy "caregiver_seniors_delete_own"
on public.caregiver_seniors
for delete
to authenticated
using (
  exists (
    select 1
    from public.caregivers c
    where c.id = caregiver_seniors.caregiver_id
      and c.profile_id = auth.uid()
  )
);

drop policy if exists "medications_select_accessible" on public.medications;
create policy "medications_select_accessible"
on public.medications
for select
to authenticated
using (public.can_access_senior(senior_id));

drop policy if exists "medications_write_owner" on public.medications;
drop policy if exists "medications_write_accessible" on public.medications;
create policy "medications_write_accessible"
on public.medications
for all
to authenticated
using (public.can_manage_senior(senior_id))
with check (public.can_manage_senior(senior_id));

drop policy if exists "appointments_select_accessible" on public.appointments;
create policy "appointments_select_accessible"
on public.appointments
for select
to authenticated
using (public.can_access_senior(senior_id));

drop policy if exists "appointments_write_owner" on public.appointments;
drop policy if exists "appointments_write_accessible" on public.appointments;
create policy "appointments_write_accessible"
on public.appointments
for all
to authenticated
using (public.can_manage_senior(senior_id))
with check (public.can_manage_senior(senior_id));

drop policy if exists "assistant_select_accessible" on public.assistant_messages;
create policy "assistant_select_accessible"
on public.assistant_messages
for select
to authenticated
using (public.can_access_senior(senior_id));

drop policy if exists "assistant_write_owner" on public.assistant_messages;
drop policy if exists "assistant_write_accessible" on public.assistant_messages;
create policy "assistant_write_accessible"
on public.assistant_messages
for all
to authenticated
using (public.can_manage_senior(senior_id))
with check (public.can_manage_senior(senior_id));

drop policy if exists "exercise_templates_select_authenticated" on public.exercise_templates;
create policy "exercise_templates_select_authenticated"
on public.exercise_templates
for select
to authenticated
using (true);

drop policy if exists "exercise_templates_write_authenticated" on public.exercise_templates;
drop policy if exists "exercise_templates_insert_authenticated" on public.exercise_templates;
drop policy if exists "exercise_templates_update_authenticated" on public.exercise_templates;
create policy "exercise_templates_insert_authenticated"
on public.exercise_templates
for insert
to authenticated
with check (true);

create policy "exercise_templates_update_authenticated"
on public.exercise_templates
for update
to authenticated
using (true)
with check (true);

drop policy if exists "exercise_progress_select_accessible" on public.exercise_progress;
create policy "exercise_progress_select_accessible"
on public.exercise_progress
for select
to authenticated
using (public.can_access_senior(senior_id));

drop policy if exists "exercise_progress_write_owner" on public.exercise_progress;
drop policy if exists "exercise_progress_write_accessible" on public.exercise_progress;
create policy "exercise_progress_write_accessible"
on public.exercise_progress
for all
to authenticated
using (public.can_manage_senior(senior_id))
with check (public.can_manage_senior(senior_id));

-- Realtime publication keeps senior and caregiver sessions synchronized
-- across different tabs and browsers as soon as a visible row changes.
do $$
begin
  begin
    alter publication supabase_realtime add table public.profiles;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.caregiver_seniors;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.seniors;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.medications;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.appointments;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.assistant_messages;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.exercise_progress;
  exception
    when duplicate_object then null;
  end;
end
$$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.caregivers to authenticated;
grant select, insert, update, delete on public.seniors to authenticated;
grant select, insert, update, delete on public.caregiver_seniors to authenticated;
grant select, insert, update, delete on public.medications to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert, update, delete on public.assistant_messages to authenticated;
grant select, insert, update, delete on public.exercise_templates to authenticated;
grant select, insert, update, delete on public.exercise_progress to authenticated;

insert into public.exercise_templates (exercise_key, emoji, name, duration, level, description, steps, sort_order)
values
  ('walking', '🚶', 'Laufen', '10 Min', 'Leicht', 'Gehe in ruhigem Tempo und halte den Rücken aufrecht.', '["Aufrecht stehen", "Langsam losgehen", "10 Minuten gleichmäßig gehen", "Kurz pausieren"]'::jsonb, 1),
  ('back', '🤸', 'Rückenübung', '8 Min', 'Mittel', 'Sanfte Beweglichkeit für den unteren Rücken.', '["Aufrecht sitzen", "Arme nach vorne strecken", "Langsam kreisen", "Tief atmen"]'::jsonb, 2),
  ('meditation', '🧘', 'Meditation', '5 Min', 'Leicht', 'Eine beruhigende Atemübung zur Entspannung.', '["Bequem sitzen", "Augen schließen", "Langsam ein- und ausatmen", "Gedanken ziehen lassen"]'::jsonb, 3),
  ('legs', '🦵', 'Beineübung', '7 Min', 'Leicht', 'Aktiviere die Beine mit kleinen kontrollierten Bewegungen.', '["Am Stuhl festhalten", "Ein Bein anheben", "Langsam senken", "Mit dem anderen Bein wiederholen"]'::jsonb, 4),
  ('arms', '👐', 'Armkreisen', '6 Min', 'Leicht', 'Lockere die Schultern mit sanften Kreisbewegungen.', '["Arme seitlich anheben", "Kleine Kreise nach vorne", "Kleine Kreise nach hinten", "Locker ausschütteln"]'::jsonb, 5),
  ('breathing', '💨', 'Atemübung', '4 Min', 'Leicht', 'Bewusstes Atmen für mehr Ruhe und Klarheit.', '["Durch die Nase einatmen", "Vier Sekunden halten", "Langsam ausatmen", "Mehrfach wiederholen"]'::jsonb, 6)
on conflict (exercise_key) do nothing;
