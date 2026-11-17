update public.pages
set content = jsonb_set(
  content,
  '{members}',
  '[
    {"name":"Eric Thompson","roles":["CTO"],"image":"/images/team/eric-thompson.jpg","bio":""},
    {"name":"David Harrison","roles":["CEO"],"image":"/images/team/david-harrison.jpg","bio":""},
    {"name":"Hannah Reynolds","roles":["Onboarding engineer"],"image":"/images/team/hannah-reynolds.jpg","bio":""}
  ]'::jsonb || (content->'members')
)
where slug = 'team'
  and jsonb_typeof(content->'members') = 'array'
  and not exists (
    select 1
    from jsonb_array_elements(content->'members') as member
    where member->>'name' = 'Eric Thompson'
  );
