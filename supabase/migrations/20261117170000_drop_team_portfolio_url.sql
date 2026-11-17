-- Portfolios are served by this project at /team/<name> (derived from the member's
-- name), so the external portfolio URL column is no longer read or written anywhere.
alter table public.team_members
  drop constraint if exists team_members_portfolio_url_check;

alter table public.team_members
  drop column if exists portfolio_url;
