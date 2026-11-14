alter table public.team_members
  add column if not exists avatar_scale numeric not null default 1;

alter table public.team_members
  drop constraint if exists team_members_avatar_scale_check;

alter table public.team_members
  add constraint team_members_avatar_scale_check
  check (avatar_scale >= 0.5 and avatar_scale <= 2.5);
