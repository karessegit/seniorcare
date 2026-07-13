-- Diese Datei ergaenzt Rechte und Realtime fuer Caregiver.
-- Apply this patch in Supabase SQL Editor to unlock caregiver write access
-- for linked seniors and to publish the relevant tables to Realtime.

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

drop policy if exists "seniors_update_owner" on public.seniors;
drop policy if exists "seniors_update_accessible" on public.seniors;
create policy "seniors_update_accessible"
on public.seniors
for update
to authenticated
using (public.can_manage_senior(id))
with check (public.can_manage_senior(id));

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

drop policy if exists "medications_write_owner" on public.medications;
drop policy if exists "medications_write_accessible" on public.medications;
create policy "medications_write_accessible"
on public.medications
for all
to authenticated
using (public.can_manage_senior(senior_id))
with check (public.can_manage_senior(senior_id));

drop policy if exists "appointments_write_owner" on public.appointments;
drop policy if exists "appointments_write_accessible" on public.appointments;
create policy "appointments_write_accessible"
on public.appointments
for all
to authenticated
using (public.can_manage_senior(senior_id))
with check (public.can_manage_senior(senior_id));

drop policy if exists "assistant_write_owner" on public.assistant_messages;
drop policy if exists "assistant_write_accessible" on public.assistant_messages;
create policy "assistant_write_accessible"
on public.assistant_messages
for all
to authenticated
using (public.can_manage_senior(senior_id))
with check (public.can_manage_senior(senior_id));

drop policy if exists "exercise_progress_write_owner" on public.exercise_progress;
drop policy if exists "exercise_progress_write_accessible" on public.exercise_progress;
create policy "exercise_progress_write_accessible"
on public.exercise_progress
for all
to authenticated
using (public.can_manage_senior(senior_id))
with check (public.can_manage_senior(senior_id));

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
