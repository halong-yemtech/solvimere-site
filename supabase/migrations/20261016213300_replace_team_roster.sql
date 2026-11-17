update public.pages
set content = jsonb_set(
  content,
  '{members}',
  '[
    {"name":"James Whitaker","roles":["Chief Executive Officer (CEO)"],"image":"/images/avatars/m1.jpg","bio":""},
    {"name":"Olivia Brennan","roles":["Chief Technology Officer (CTO)"],"image":"/images/avatars/f2.jpg","bio":""},
    {"name":"Daniel Harper","roles":["Chief Operating Officer (COO)"],"image":"/images/avatars/m3.jpg","bio":""},
    {"name":"Lauren Mitchell","roles":["Director of Engineering"],"image":"/images/avatars/f5.jpg","bio":""},
    {"name":"Emily Carter","roles":["Senior Software Architect"],"image":"/images/avatars/f6.jpg","bio":""},
    {"name":"Nathan Cole","roles":["Lead Full-Stack Engineer"],"image":"/images/avatars/m4.jpg","bio":""},
    {"name":"Sophia Grant","roles":["Senior Frontend Developer"],"image":"/images/avatars/f2.jpg","bio":""},
    {"name":"Ryan Bennett","roles":["Senior Backend Developer"],"image":"/images/avatars/m1.jpg","bio":""},
    {"name":"Marcus Hale","roles":["Full-Stack Developer"],"image":"/images/avatars/m3.jpg","bio":""},
    {"name":"Megan Walsh","roles":["DevOps & Cloud Engineer"],"image":"/images/avatars/f5.jpg","bio":""},
    {"name":"Andrew Keller","roles":["AI/ML Engineer"],"image":"/images/avatars/m4.jpg","bio":""},
    {"name":"Chloe Adams","roles":["QA Automation Engineer"],"image":"/images/avatars/f6.jpg","bio":""},
    {"name":"Grace Holloway","roles":["Product Manager"],"image":"/images/avatars/f2.jpg","bio":""},
    {"name":"Brandon Ellis","roles":["Senior UI/UX Designer"],"image":"/images/avatars/m1.jpg","bio":""},
    {"name":"Natalie Price","roles":["Technical Project Manager"],"image":"/images/avatars/f6.jpg","bio":""},
    {"name":"Tyler Brooks","roles":["Director of Business Development"],"image":"/images/avatars/m3.jpg","bio":""},
    {"name":"Christopher Lang","roles":["Marketing & Growth Manager"],"image":"/images/avatars/m4.jpg","bio":""},
    {"name":"Allison Reed","roles":["Customer Success & Onboarding Engineer"],"image":"/images/avatars/f5.jpg","bio":""}
  ]'::jsonb
)
where slug = 'team'
  and content ? 'members';
