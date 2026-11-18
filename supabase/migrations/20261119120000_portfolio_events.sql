-- What visitors do on a portfolio: sections opened, links and buttons clicked, projects
-- viewed, scrolling, time spent, forms started and sent. Shown and deleted in
-- Admin -> Portfolio -> Views.
--
-- Each action belongs to a visit (portfolio_views), so it holds no IP address of its own and
-- disappears with the visit. Text typed into forms is never sent or stored.

create table if not exists public.portfolio_events (
  id bigint generated always as identity primary key,
  view_id bigint not null references public.portfolio_views (id) on delete cascade,
  profile_id bigint not null references public.portfolio_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  type text not null check (type in (
    'section_view', 'section_leave', 'link_click', 'button_click', 'work_open', 'work_close',
    'work_filter', 'work_image', 'scroll_depth', 'form_start', 'form_submit', 'form_error',
    'text_copy', 'page_leave', 'page_return'
  )),
  channel text check (channel ~ '^[a-z0-9_-]{1,30}$'),
  section text check (section ~ '^[a-z0-9_-]{1,30}$'),
  area text check (char_length(area) <= 60),
  label text check (char_length(label) <= 120),
  target text check (char_length(target) <= 300),
  value integer check (value between 0 and 86400)
);

create index if not exists portfolio_events_view on public.portfolio_events (view_id, created_at, id);
create index if not exists portfolio_events_profile_time on public.portfolio_events (profile_id, created_at desc);
create index if not exists portfolio_events_time on public.portfolio_events (created_at desc);
create index if not exists portfolio_events_channel
  on public.portfolio_events (channel, view_id) where type = 'link_click';

alter table public.portfolio_events enable row level security;
revoke all on public.portfolio_events from public, anon, authenticated;

-- ── helpers ───────────────────────────────────────────────────────────────

create or replace function private.is_bot_agent(agent text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select agent = ''
    or (agent !~* 'cubot' and agent ~* 'bot')
    or agent ~* 'crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|bingpreview|facebookexternalhit|^whatsapp|^telegram|^curl|^wget|python-|axios|node-fetch|go-http|okhttp|^java/|phantomjs|puppeteer|playwright|selenium';
$$;

create or replace function private.clean_event_text(input text, max_length integer)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(left(btrim(regexp_replace(coalesce(input, ''), '[[:cntrl:]]+', ' ', 'g')), max_length), '');
$$;

-- Web, mail and phone links only, without query strings or fragments.
create or replace function private.clean_event_target(input text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when input ~* '^(https?://|mailto:|tel:|/)'
      then private.clean_event_text(split_part(split_part(input, '?', 1), '#', 1), 300)
  end;
$$;

create or replace function private.require_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
end;
$$;

-- ── recording (public) ────────────────────────────────────────────────────

-- Adds a batch of actions to this visitor's latest visit. Without a recent visit nothing is
-- stored, so actions can't be written for portfolios nobody opened.
create or replace function public.record_portfolio_events(p_slug text, p_events jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  agent text := left(coalesce(headers ->> 'user-agent', ''), 400);
  address inet := private.request_ip(headers);
  visitor text;
  visit bigint;
  member bigint;
  added integer;
begin
  if private.is_bot_agent(agent) or jsonb_typeof(p_events) is distinct from 'array' then
    return 0;
  end if;

  visitor := encode(sha256(convert_to(coalesce(host(address), '') || '|' || agent, 'UTF8')), 'hex');

  select v.id, v.profile_id into visit, member
  from public.portfolio_views v
  join public.portfolio_profiles p on p.id = v.profile_id
  where p.slug = p_slug
    and p.visibility = 'public'
    and v.visitor_key = visitor
    and v.created_at > now() - interval '24 hours'
  order by v.id desc
  limit 1;
  if visit is null then
    return 0;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('portfolio-events:' || visit::text, 0));
  if (select count(*) from public.portfolio_events where view_id = visit) >= 2000 then
    return 0;
  end if;

  insert into public.portfolio_events (view_id, profile_id, created_at, type, channel, section, area, label, target, value)
  select
    visit,
    member,
    now() - make_interval(secs => case
      when jsonb_typeof(e -> 'ms_ago') = 'number' then least(greatest((e ->> 'ms_ago')::numeric, 0), 120000) / 1000
      else 0
    end::double precision),
    e ->> 'type',
    case when e ->> 'channel' ~ '^[a-z0-9_-]{1,30}$' then e ->> 'channel' end,
    case when e ->> 'section' ~ '^[a-z0-9_-]{1,30}$' then e ->> 'section' end,
    private.clean_event_text(e ->> 'area', 60),
    private.clean_event_text(e ->> 'label', 120),
    private.clean_event_target(e ->> 'target'),
    case when jsonb_typeof(e -> 'value') = 'number'
      then least(greatest(trunc((e ->> 'value')::numeric), 0), 86400)::integer
    end
  from jsonb_array_elements(p_events) with ordinality as batch(e, position)
  where position <= 40
    and jsonb_typeof(e) = 'object'
    and e ->> 'type' in (
      'section_view', 'section_leave', 'link_click', 'button_click', 'work_open', 'work_close',
      'work_filter', 'work_image', 'scroll_depth', 'form_start', 'form_submit', 'form_error',
      'text_copy', 'page_leave', 'page_return'
    )
  order by position;
  get diagnostics added = row_count;
  return added;
end;
$$;

-- ── reading (staff) ───────────────────────────────────────────────────────

-- Totals for the insight cards. kind: channel | section | work | form | action.
create or replace function public.portfolio_event_summary(p_profile_id bigint default null, p_days integer default 30)
returns table (kind text, key text, total bigint, visits bigint, avg_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  return query
  with recent as (
    select e.*
    from public.portfolio_events e
    where (p_profile_id is null or e.profile_id = p_profile_id)
      and e.created_at > now() - make_interval(days => greatest(1, least(p_days, 90)))
  )
  select 'channel', coalesce(r.channel, 'other'), count(*), count(distinct r.view_id), null::integer
  from recent r where r.type = 'link_click' group by 2
  union all
  select 'section', r.section,
    count(*) filter (where r.type = 'section_view'),
    count(distinct r.view_id),
    (coalesce(sum(r.value) filter (where r.type = 'section_leave'), 0) / count(distinct r.view_id))::integer
  from recent r
  where r.type in ('section_view', 'section_leave') and r.section is not null
  group by 2
  union all
  select 'work', r.label, count(*), count(distinct r.view_id), null::integer
  from recent r where r.type = 'work_open' and r.label is not null group by 2
  union all
  select 'form', coalesce(r.label, 'form'), count(*), count(distinct r.view_id), null::integer
  from recent r where r.type = 'form_submit' group by 2
  union all
  select 'action', r.type, count(*), count(distinct r.view_id), null::integer
  from recent r group by 2;
end;
$$;

-- Visits, newest first, with a summary of what happened in each.
create or replace function public.portfolio_visit_activity(
  p_profile_id bigint default null,
  p_limit integer default 25,
  p_before_id bigint default null,
  p_channel text default null
)
returns table (
  id bigint,
  profile_id bigint,
  slug text,
  name text,
  created_at timestamptz,
  device text,
  country text,
  referrer text,
  ip text,
  user_agent text,
  actions bigint,
  seconds bigint,
  channels text[]
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin boolean := private.is_admin();
begin
  perform private.require_staff();
  return query
  select
    v.id,
    v.profile_id,
    p.slug,
    coalesce(nullif(p.data ->> 'name', ''), p.slug),
    v.created_at,
    v.device,
    v.country,
    v.referrer,
    case when admin then host(v.ip) end,
    case when admin then v.user_agent end,
    coalesce(s.actions, 0),
    coalesce(s.seconds, 0),
    coalesce(s.channels, '{}')
  from public.portfolio_views v
  join public.portfolio_profiles p on p.id = v.profile_id
  left join lateral (
    select
      count(*) filter (where e.type not in ('section_leave', 'page_leave', 'page_return', 'work_close')) as actions,
      sum(e.value) filter (where e.type = 'page_leave') as seconds,
      array_agg(distinct e.channel) filter (where e.type = 'link_click' and e.channel is not null) as channels
    from public.portfolio_events e
    where e.view_id = v.id
  ) s on true
  where (p_profile_id is null or v.profile_id = p_profile_id)
    and (p_before_id is null or v.id < p_before_id)
    and (p_channel is null or exists (
      select 1 from public.portfolio_events e
      where e.view_id = v.id and e.type = 'link_click' and e.channel = p_channel
    ))
  order by v.id desc
  limit greatest(1, least(p_limit, 100));
end;
$$;

create or replace function public.portfolio_visit_events(p_view_id bigint)
returns table (
  id bigint,
  created_at timestamptz,
  type text,
  channel text,
  section text,
  area text,
  label text,
  target text,
  value integer
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  return query
  select e.id, e.created_at, e.type, e.channel, e.section, e.area, e.label, e.target, e.value
  from public.portfolio_events e
  where e.view_id = p_view_id
  order by e.created_at, e.id
  limit 2000;
end;
$$;

-- ── deleting (admins) ─────────────────────────────────────────────────────

-- Deleting a visit removes its actions too, and lowers the view counts.
create or replace function public.delete_portfolio_views(p_ids bigint[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted integer;
begin
  perform private.require_admin();
  delete from public.portfolio_views where id = any (p_ids);
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

create or replace function public.delete_portfolio_events(p_ids bigint[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted integer;
begin
  perform private.require_admin();
  delete from public.portfolio_events where id = any (p_ids);
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

-- Bulk delete for one member or everyone; p_older_than_days null means all dates.
create or replace function public.clear_portfolio_views(
  p_confirm text,
  p_profile_id bigint default null,
  p_older_than_days integer default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted integer;
begin
  perform private.require_admin();
  if p_confirm is distinct from 'DELETE' then
    raise exception 'Confirmation required' using errcode = '22023';
  end if;
  delete from public.portfolio_views v
  where (p_profile_id is null or v.profile_id = p_profile_id)
    and (p_older_than_days is null or v.created_at < now() - make_interval(days => greatest(p_older_than_days, 1)));
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

-- ── who may call what ─────────────────────────────────────────────────────

revoke all on function private.is_bot_agent(text) from public, anon, authenticated;
revoke all on function private.clean_event_text(text, integer) from public, anon, authenticated;
revoke all on function private.clean_event_target(text) from public, anon, authenticated;
revoke all on function private.require_admin() from public, anon, authenticated;

revoke all on function public.record_portfolio_events(text, jsonb) from public, anon, authenticated;
revoke all on function public.portfolio_event_summary(bigint, integer) from public, anon, authenticated;
revoke all on function public.portfolio_visit_activity(bigint, integer, bigint, text) from public, anon, authenticated;
revoke all on function public.portfolio_visit_events(bigint) from public, anon, authenticated;
revoke all on function public.delete_portfolio_views(bigint[]) from public, anon, authenticated;
revoke all on function public.delete_portfolio_events(bigint[]) from public, anon, authenticated;
revoke all on function public.clear_portfolio_views(text, bigint, integer) from public, anon, authenticated;

grant execute on function public.record_portfolio_events(text, jsonb) to anon, authenticated;
grant execute on function public.portfolio_event_summary(bigint, integer) to authenticated;
grant execute on function public.portfolio_visit_activity(bigint, integer, bigint, text) to authenticated;
grant execute on function public.portfolio_visit_events(bigint) to authenticated;
grant execute on function public.delete_portfolio_views(bigint[]) to authenticated;
grant execute on function public.delete_portfolio_events(bigint[]) to authenticated;
grant execute on function public.clear_portfolio_views(text, bigint, integer) to authenticated;
