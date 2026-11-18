-- Visits to team members' portfolios (/team/<slug>), shown in Admin -> Portfolio -> Views.
--
-- Nobody reads or writes the table directly. Visitors can only call
-- record_portfolio_view(); staff read through the functions below, which return IP
-- addresses and browser details to admins only.
--
-- A repeat visit by the same visitor to the same portfolio within 30 minutes is not counted.
-- After 90 days the IP address, visitor key, browser details and referrer are erased; the
-- anonymous view (member, time, device, country) stays so totals remain correct.

create table if not exists public.portfolio_views (
  id bigint generated always as identity primary key,
  profile_id bigint not null references public.portfolio_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  device text not null default 'desktop' check (device in ('desktop', 'mobile', 'tablet')),
  country text check (country ~ '^[A-Z]{2}$'),
  ip inet,
  visitor_key text,
  user_agent text check (char_length(user_agent) <= 400),
  referrer text check (char_length(referrer) <= 253)
);

create index if not exists portfolio_views_profile_time on public.portfolio_views (profile_id, created_at desc);
create index if not exists portfolio_views_time on public.portfolio_views (created_at desc);
create index if not exists portfolio_views_visitor
  on public.portfolio_views (visitor_key, profile_id, created_at desc) where visitor_key is not null;
create index if not exists portfolio_views_ip on public.portfolio_views (ip, created_at desc) where ip is not null;
create index if not exists portfolio_views_to_purge on public.portfolio_views (created_at) where visitor_key is not null;

-- RLS on with no policies, and no table privileges: functions are the only way in.
alter table public.portfolio_views enable row level security;
revoke all on public.portfolio_views from public, anon, authenticated;

-- ── helpers ───────────────────────────────────────────────────────────────

-- The visitor's address. cf-connecting-ip is set by Supabase's edge and can't be supplied by
-- the visitor, so it is preferred over the forwarding headers.
create or replace function private.request_ip(headers json)
returns inet
language plpgsql
immutable
set search_path = ''
as $$
declare
  candidate text;
begin
  foreach candidate in array array[
    headers ->> 'cf-connecting-ip',
    headers ->> 'x-real-ip',
    split_part(coalesce(headers ->> 'x-forwarded-for', ''), ',', 1)
  ] loop
    begin
      if nullif(btrim(candidate), '') is not null then
        return btrim(candidate)::inet;
      end if;
    exception when others then
      null; -- not an address: try the next header
    end;
  end loop;
  return null;
end;
$$;

create or replace function private.purge_old_view_details()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.portfolio_views
  set ip = null, visitor_key = null, user_agent = null, referrer = null
  where visitor_key is not null
    and created_at < now() - interval '90 days';
$$;

create or replace function private.require_staff()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_staff() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
end;
$$;

-- ── recording (public) ────────────────────────────────────────────────────

create or replace function public.record_portfolio_view(p_slug text, p_referrer text default '')
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  agent text := left(coalesce(headers ->> 'user-agent', ''), 400);
  address inet := private.request_ip(headers);
  region text := upper(coalesce(headers ->> 'cf-ipcountry', ''));
  target bigint;
  visitor text;
begin
  perform private.purge_old_view_details();

  -- Crawlers, link previews, monitoring and scripts are not visitors.
  if agent = ''
    or (agent !~* 'cubot' and agent ~* 'bot')
    or agent ~* 'crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|bingpreview|facebookexternalhit|^whatsapp|^telegram|^curl|^wget|python-|axios|node-fetch|go-http|okhttp|^java/|phantomjs|puppeteer|playwright|selenium'
  then
    return false;
  end if;

  select id into target
  from public.portfolio_profiles
  where slug = p_slug and visibility = 'public';
  if target is null then
    return false;
  end if;

  visitor := encode(sha256(convert_to(coalesce(host(address), '') || '|' || agent, 'UTF8')), 'hex');

  -- Two requests from one page load must not both pass the check below.
  perform pg_advisory_xact_lock(hashtextextended(visitor || ':' || target::text, 0));

  if exists (
    select 1 from public.portfolio_views
    where visitor_key = visitor and profile_id = target
      and created_at > now() - interval '30 minutes'
  ) then
    return false;
  end if;

  -- One address can't flood the log by changing its browser string.
  if address is not null and (
    select count(*) from public.portfolio_views
    where ip = address and created_at > now() - interval '1 hour'
  ) >= 120 then
    return false;
  end if;

  insert into public.portfolio_views (profile_id, device, country, ip, visitor_key, user_agent, referrer)
  values (
    target,
    case
      when agent ~* 'ipad|tablet|playbook|silk' or (agent ~* 'android' and agent !~* 'mobile') then 'tablet'
      when agent ~* 'mobi|iphone|ipod|android' then 'mobile'
      else 'desktop'
    end,
    case when region ~ '^[A-Z]{2}$' and region <> 'XX' then region end,
    address,
    visitor,
    agent,
    -- The site name only: full addresses can contain private details.
    left(lower(substring(coalesce(p_referrer, '') from '^https?://(?:[^/@?#]*@)?([^/:?#]+)')), 253)
  );
  return true;
end;
$$;

-- ── reading (staff) ───────────────────────────────────────────────────────

create or replace function public.portfolio_view_stats()
returns table (
  profile_id bigint,
  slug text,
  name text,
  visibility text,
  avatar_url text,
  total bigint,
  last_7 bigint,
  last_30 bigint,
  visitors_30 bigint,
  last_viewed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  perform private.purge_old_view_details();
  return query
  select
    p.id,
    p.slug,
    coalesce(nullif(p.data ->> 'name', ''), p.slug),
    p.visibility,
    m.url,
    count(v.id),
    count(v.id) filter (where v.created_at > now() - interval '7 days'),
    count(v.id) filter (where v.created_at > now() - interval '30 days'),
    count(distinct v.visitor_key) filter (where v.created_at > now() - interval '30 days'),
    max(v.created_at)
  from public.portfolio_profiles p
  left join public.portfolio_views v on v.profile_id = p.id
  left join public.portfolio_media m
    on (p.data ->> 'avatar') ~ '^[0-9]+$' and m.id = (p.data ->> 'avatar')::bigint
  group by p.id, m.url
  order by count(v.id) desc, p.sort_order, p.id;
end;
$$;

-- Views and distinct visitors over the last p_days (1-90), for all members or one.
create or replace function public.portfolio_view_totals(p_profile_id bigint default null, p_days integer default 30)
returns table (views bigint, visitors bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  return query
  select count(*), count(distinct v.visitor_key)
  from public.portfolio_views v
  where (p_profile_id is null or v.profile_id = p_profile_id)
    and v.created_at > now() - make_interval(days => greatest(1, least(p_days, 90)));
end;
$$;

-- One row per day (zero days included), in the viewer's time zone.
create or replace function public.portfolio_view_daily(
  p_profile_id bigint default null,
  p_days integer default 30,
  p_time_zone text default 'UTC'
)
returns table (day date, views bigint, visitors bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  zone text := case
    when exists (select 1 from pg_catalog.pg_timezone_names where name = p_time_zone) then p_time_zone
    else 'UTC'
  end;
  span integer := greatest(1, least(p_days, 90));
  today date := (now() at time zone zone)::date;
begin
  perform private.require_staff();
  return query
  select d::date, count(v.id), count(distinct v.visitor_key)
  from generate_series(today - (span - 1), today, interval '1 day') d
  left join public.portfolio_views v
    on (v.created_at at time zone zone)::date = d::date
    and (p_profile_id is null or v.profile_id = p_profile_id)
  group by d
  order by d;
end;
$$;

-- Newest first; pass the last id received as p_before_id for the next page.
create or replace function public.portfolio_recent_views(
  p_profile_id bigint default null,
  p_limit integer default 25,
  p_before_id bigint default null
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
  user_agent text
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
    case when admin then v.user_agent end
  from public.portfolio_views v
  join public.portfolio_profiles p on p.id = v.profile_id
  where (p_profile_id is null or v.profile_id = p_profile_id)
    and (p_before_id is null or v.id < p_before_id)
  order by v.id desc
  limit greatest(1, least(p_limit, 100));
end;
$$;

-- For someone asking to be removed: erases their address everywhere, keeps the counts.
create or replace function public.erase_portfolio_view_ip(p_ip text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  erased integer;
begin
  if not private.is_admin() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  update public.portfolio_views
  set ip = null, visitor_key = null, user_agent = null, referrer = null, country = null
  where ip = p_ip::inet;
  get diagnostics erased = row_count;
  return erased;
end;
$$;

-- ── who may call what ─────────────────────────────────────────────────────

revoke all on function private.request_ip(json) from public, anon, authenticated;
revoke all on function private.purge_old_view_details() from public, anon, authenticated;
revoke all on function private.require_staff() from public, anon, authenticated;

revoke all on function public.record_portfolio_view(text, text) from public, anon, authenticated;
revoke all on function public.portfolio_view_stats() from public, anon, authenticated;
revoke all on function public.portfolio_view_totals(bigint, integer) from public, anon, authenticated;
revoke all on function public.portfolio_view_daily(bigint, integer, text) from public, anon, authenticated;
revoke all on function public.portfolio_recent_views(bigint, integer, bigint) from public, anon, authenticated;
revoke all on function public.erase_portfolio_view_ip(text) from public, anon, authenticated;

grant execute on function public.record_portfolio_view(text, text) to anon, authenticated;
grant execute on function public.portfolio_view_stats() to authenticated;
grant execute on function public.portfolio_view_totals(bigint, integer) to authenticated;
grant execute on function public.portfolio_view_daily(bigint, integer, text) to authenticated;
grant execute on function public.portfolio_recent_views(bigint, integer, bigint) to authenticated;
grant execute on function public.erase_portfolio_view_ip(text) to authenticated;
