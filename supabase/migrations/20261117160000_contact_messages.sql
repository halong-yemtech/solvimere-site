-- Messages sent from the site's corner widget ("Send us a message").
-- Visitors can only submit; staff read, triage and delete them in the admin.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  page text not null default '',
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now(),
  constraint contact_messages_name_length check (char_length(name) between 1 and 120),
  constraint contact_messages_email_format check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' and char_length(email) <= 254),
  constraint contact_messages_message_length check (char_length(message) between 1 and 4000),
  constraint contact_messages_page_length check (char_length(page) <= 300)
);

create index if not exists contact_messages_created_at on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

drop policy if exists "visitors send messages" on public.contact_messages;
create policy "visitors send messages"
on public.contact_messages
for insert
to anon, authenticated
with check (status = 'new');

drop policy if exists "staff read messages" on public.contact_messages;
create policy "staff read messages"
on public.contact_messages
for select
to authenticated
using (private.is_staff());

drop policy if exists "staff manage messages" on public.contact_messages;
create policy "staff manage messages"
on public.contact_messages
for update
to authenticated
using (private.is_staff())
with check (private.is_staff());

drop policy if exists "staff delete messages" on public.contact_messages;
create policy "staff delete messages"
on public.contact_messages
for delete
to authenticated
using (private.is_staff());
