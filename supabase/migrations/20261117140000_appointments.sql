-- Meetings booked from the site's assistant (bottom-right "Book a meeting").
-- Visitors can only create a pending, 30-minute booking on a free weekday slot inside
-- business hours (09:00–17:00 America/New_York). Only staff can read or manage bookings.

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  duration_minutes integer not null default 30,
  name text not null,
  email text not null,
  company text not null default '',
  topic text not null default '',
  visitor_timezone text not null default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint appointments_name_length check (char_length(name) between 1 and 120),
  constraint appointments_email_format check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' and char_length(email) <= 254),
  constraint appointments_company_length check (char_length(company) <= 160),
  constraint appointments_topic_length check (char_length(topic) <= 2000),
  constraint appointments_timezone_length check (char_length(visitor_timezone) <= 64)
);

-- One active booking per slot (cancelled ones free the slot again).
create unique index if not exists appointments_active_slot
  on public.appointments (starts_at)
  where status <> 'cancelled';

create index if not exists appointments_starts_at on public.appointments (starts_at);

alter table public.appointments enable row level security;

grant insert on public.appointments to anon, authenticated;
grant select, update, delete on public.appointments to authenticated;

-- A slot visitors may book: on the half hour, a weekday, 09:00–16:30 New York time,
-- at least two hours ahead and at most 60 days out.
create or replace function private.is_bookable_slot(slot timestamptz)
returns boolean
language sql
stable
set search_path = ''
as $$
  select
    slot >= now() + interval '2 hours'
    and slot <= now() + interval '60 days'
    and extract(second from slot) = 0
    and extract(minute from (slot at time zone 'America/New_York')) in (0, 30)
    and extract(isodow from (slot at time zone 'America/New_York')) between 1 and 5
    and (slot at time zone 'America/New_York')::time >= time '09:00'
    and (slot at time zone 'America/New_York')::time <= time '16:30';
$$;

grant execute on function private.is_bookable_slot(timestamptz) to anon, authenticated;

drop policy if exists "visitors book open slots" on public.appointments;
create policy "visitors book open slots"
on public.appointments
for insert
to anon, authenticated
with check (
  status = 'pending'
  and duration_minutes = 30
  and private.is_bookable_slot(starts_at)
  and (user_id is null or user_id = (select auth.uid()))
);

drop policy if exists "staff read appointments" on public.appointments;
create policy "staff read appointments"
on public.appointments
for select
to authenticated
using (private.is_staff());

drop policy if exists "staff manage appointments" on public.appointments;
create policy "staff manage appointments"
on public.appointments
for update
to authenticated
using (private.is_staff())
with check (private.is_staff());

drop policy if exists "staff delete appointments" on public.appointments;
create policy "staff delete appointments"
on public.appointments
for delete
to authenticated
using (private.is_staff());

-- Which slots are taken in a range, without revealing who booked them.
create or replace function public.appointment_busy_slots(range_start timestamptz, range_end timestamptz)
returns setof timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select a.starts_at
  from public.appointments a
  where a.status <> 'cancelled'
    and a.starts_at >= range_start
    and a.starts_at < least(range_end, range_start + interval '62 days')
  order by a.starts_at;
$$;

revoke all on function public.appointment_busy_slots(timestamptz, timestamptz) from public;
grant execute on function public.appointment_busy_slots(timestamptz, timestamptz) to anon, authenticated;
