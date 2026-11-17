-- Team members linked to an external portfolio URL. Superseded the same day: portfolios
-- now live in this project at /team/<name> (portfolio/), so the column is dropped in
-- 20261117170000_drop_team_portfolio_url.sql. Kept so the history matches the database.
alter table public.team_members
  add column if not exists portfolio_url text not null default '';

alter table public.team_members
  drop constraint if exists team_members_portfolio_url_check;

alter table public.team_members
  add constraint team_members_portfolio_url_check
  check (portfolio_url = '' or portfolio_url ~* '^https?://[^\s/]+');
