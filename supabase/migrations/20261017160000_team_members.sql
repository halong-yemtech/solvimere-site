create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  email text not null default '',
  avatar_url text not null default '',
  bio text not null default '',
  highlight_label text not null default '',
  highlight_text text not null default '',
  expertise_label text not null default '',
  expertise_text text not null default '',
  quote text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function private.touch_team_member()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists touch_team_member on public.team_members;
create trigger touch_team_member
  before update on public.team_members
  for each row execute function private.touch_team_member();

alter table public.team_members enable row level security;

grant select on public.team_members to anon, authenticated;
grant insert, update, delete on public.team_members to authenticated;

drop policy if exists "public read team members" on public.team_members;
create policy "public read team members"
on public.team_members
for select
to anon, authenticated
using (true);

drop policy if exists "staff manage team members" on public.team_members;
create policy "staff manage team members"
on public.team_members
for all
to authenticated
using (private.is_staff())
with check (private.is_staff());

insert into public.team_members (
  name, role, email, avatar_url, bio,
  highlight_label, highlight_text, expertise_label, expertise_text, quote, sort_order
)
select
  item->>'name',
  coalesce(item->>'role', ''),
  coalesce(item->>'email', ''),
  coalesce(item->>'image', ''),
  coalesce(item->>'bio', ''),
  coalesce(item->'highlight'->>'label', ''),
  coalesce(item->'highlight'->>'text', ''),
  coalesce(item->'expertise'->>'label', ''),
  coalesce(item->'expertise'->>'text', ''),
  coalesce(item->>'quote', ''),
  coalesce((item->>'sort')::integer, 0)
from jsonb_array_elements($team$[{"name":"James Whitaker","role":"Chief Executive Officer (CEO)","email":"","image":"/images/avatars/m1.jpg","bio":"","highlight":{"label":"Leadership & Achievements","text":"Spearheaded initiatives to connect business strategy with modern technology solutions, emphasizing long-term client relationships, innovation, and sustainable growth."},"expertise":{"label":"Professional Expertise","text":"Business strategy, technology consulting, enterprise software delivery, and organizational leadership."},"quote":"Technology creates opportunities, but it's the people behind it who turn those opportunities into something meaningful.","sort":0},{"name":"Olivia Brennan","role":"Chief Technology Officer (CTO)","email":"","image":"/images/avatars/f2.jpg","bio":"","highlight":{"label":"Leadership & Achievements","text":"Led the development of scalable technology architectures and established engineering practices designed to improve application performance, security, and maintainability."},"expertise":{"label":"Technical Expertise","text":"Cloud-native architecture, distributed systems, AWS, microservices, API engineering, and software scalability."},"quote":"Great engineering isn't about using the newest technology. It's about choosing the right technology to solve the right problem.","sort":1},{"name":"Daniel Harper","role":"Chief Operating Officer (COO)","email":"","image":"/images/avatars/m3.jpg","bio":"","highlight":{"label":"Leadership & Achievements","text":"Championed operational improvements that strengthened collaboration between engineering, product, and client-facing teams while creating more predictable delivery processes."},"expertise":{"label":"Professional Expertise","text":"Operational strategy, Agile delivery, resource planning, process optimization, and organizational development."},"quote":"Consistency builds trust, and trust is what turns a successful project into a lasting partnership.","sort":2},{"name":"Lauren Mitchell","role":"Director of Engineering","email":"","image":"/images/avatars/f5.jpg","bio":"","highlight":{"label":"Leadership & Achievements","text":"Introduced engineering standards, collaborative code reviews, and automated development workflows to support reliable software delivery and stronger technical collaboration."},"expertise":{"label":"Technical Expertise","text":"Software architecture, CI/CD, TypeScript, system design, engineering leadership, and performance optimization."},"quote":"A great engineering team doesn't just deliver code. It creates solutions that other engineers are proud to build upon.","sort":3},{"name":"Emily Carter","role":"Senior Software Architect","email":"","image":"/images/avatars/f6.jpg","bio":"","highlight":{"label":"Technical Achievements","text":"Designed modular software architectures that simplify complex system integrations and support evolving business requirements without compromising maintainability."},"expertise":{"label":"Technical Expertise","text":"Distributed systems, domain-driven design, PostgreSQL, REST APIs, microservices, and enterprise application architecture."},"quote":"The most elegant architecture is the one that makes tomorrow's challenges easier to solve.","sort":4},{"name":"Nathan Cole","role":"Lead Full-Stack Engineer","email":"","image":"/images/avatars/m4.jpg","bio":"","highlight":{"label":"Technical Achievements","text":"Led end-to-end development initiatives connecting intuitive web interfaces with scalable backend services, establishing reusable patterns for faster product development."},"expertise":{"label":"Technical Expertise","text":"React, Next.js, Node.js, TypeScript, PostgreSQL, and full-stack application architecture."},"quote":"The best software feels simple to the user, even when the engineering behind it is anything but.","sort":5},{"name":"Sophia Grant","role":"Senior Frontend Developer","email":"","image":"/images/avatars/f2.jpg","bio":"","highlight":{"label":"Technical Achievements","text":"Helped establish reusable component libraries and responsive interface standards to improve consistency, accessibility, and performance across web applications."},"expertise":{"label":"Technical Expertise","text":"React, Next.js, TypeScript, JavaScript, Tailwind CSS, web accessibility, and frontend performance."},"quote":"Every detail matters because even the smallest interaction shapes how someone experiences a product.","sort":6},{"name":"Ryan Bennett","role":"Senior Backend Developer","email":"","image":"/images/avatars/m1.jpg","bio":"","highlight":{"label":"Technical Achievements","text":"Developed secure APIs, optimized database operations, and improved application architecture to support dependable performance under increasingly complex workloads."},"expertise":{"label":"Technical Expertise","text":"Node.js, Python, PostgreSQL, Redis, API security, database optimization, and backend architecture."},"quote":"The strongest systems are often the ones users never have to think about.","sort":7},{"name":"Marcus Hale","role":"Full-Stack Developer","email":"","image":"/images/avatars/m3.jpg","bio":"","highlight":{"label":"Technical Achievements","text":"Contributed to the development of modern web platforms, connecting frontend experiences with backend functionality and refining applications through continuous iteration."},"expertise":{"label":"Technical Expertise","text":"React, TypeScript, Node.js, Express, SQL databases, Git, and RESTful APIs."},"quote":"I love the moment when a complicated idea becomes something people can actually use.","sort":8},{"name":"Megan Walsh","role":"DevOps & Cloud Engineer","email":"","image":"/images/avatars/f5.jpg","bio":"","highlight":{"label":"Technical Achievements","text":"Developed infrastructure automation and streamlined deployment workflows to reduce manual configuration, improve consistency, and support reliable application releases."},"expertise":{"label":"Technical Expertise","text":"AWS, Docker, Kubernetes, Terraform, Linux, GitHub Actions, and CI/CD automation."},"quote":"Reliable infrastructure should make innovation easier, not stand in its way.","sort":9},{"name":"Andrew Keller","role":"AI/ML Engineer","email":"","image":"/images/avatars/m4.jpg","bio":"","highlight":{"label":"Technical Achievements","text":"Explored intelligent search, document processing, and AI-assisted automation to help transform complex data into practical, user-focused applications."},"expertise":{"label":"Technical Expertise","text":"Python, PyTorch, machine learning, large language models, vector databases, RAG architectures, and AI integration."},"quote":"The real value of AI isn't what it can generate. It's what it can help people accomplish.","sort":10},{"name":"Chloe Adams","role":"QA Automation Engineer","email":"","image":"/images/avatars/f6.jpg","bio":"","highlight":{"label":"Technical Achievements","text":"Established automated regression testing and quality assurance workflows designed to identify critical issues earlier and support more dependable releases."},"expertise":{"label":"Technical Expertise","text":"Playwright, Cypress, Selenium, API testing, automated test frameworks, and quality engineering."},"quote":"Quality isn't something you check at the finish line. It's something you build into every step.","sort":11},{"name":"Grace Holloway","role":"Product Manager","email":"","image":"/images/avatars/f2.jpg","bio":"","highlight":{"label":"Leadership & Achievements","text":"Guided product discovery and roadmap planning initiatives, transforming customer feedback and business requirements into clear, actionable development priorities."},"expertise":{"label":"Professional Expertise","text":"Product strategy, Agile methodologies, user research, product analytics, roadmap development, and stakeholder management."},"quote":"A successful product starts by understanding the problem better than anyone else.","sort":12},{"name":"Brandon Ellis","role":"Senior UI/UX Designer","email":"","image":"/images/avatars/m1.jpg","bio":"","highlight":{"label":"Creative Achievements","text":"Led interface design and usability improvement initiatives for complex digital workflows, bringing clarity to challenging experiences through thoughtful research and visual design."},"expertise":{"label":"Technical Expertise","text":"Figma, design systems, interaction design, usability testing, information architecture, and responsive UI design."},"quote":"Good design gets attention. Great design makes everything feel effortless.","sort":13},{"name":"Natalie Price","role":"Technical Project Manager","email":"","image":"/images/avatars/f6.jpg","bio":"","highlight":{"label":"Leadership & Achievements","text":"Coordinated cross-functional development initiatives, improving project visibility, risk management, milestone planning, and communication between technical teams and stakeholders."},"expertise":{"label":"Professional Expertise","text":"Agile and Scrum, technical project delivery, sprint planning, Jira, risk management, and software development lifecycles."},"quote":"A successful project isn't just delivered on time. It's delivered with clarity, trust, and shared purpose.","sort":14},{"name":"Tyler Brooks","role":"Director of Business Development","email":"","image":"/images/avatars/m3.jpg","bio":"","highlight":{"label":"Business Achievements","text":"Led strategic outreach and solution-focused client engagement initiatives, connecting business challenges with tailored technology services and partnership opportunities."},"expertise":{"label":"Professional Expertise","text":"Technology consulting, strategic partnerships, enterprise sales, solution development, and client relationship management."},"quote":"The strongest business relationships begin with listening, not selling.","sort":15},{"name":"Christopher Lang","role":"Marketing & Growth Manager","email":"","image":"/images/avatars/m4.jpg","bio":"","highlight":{"label":"Professional Achievements","text":"Developed integrated marketing initiatives connecting brand storytelling, organic discovery, and measurable campaign performance to support business growth."},"expertise":{"label":"Professional Expertise","text":"Digital marketing, SEO, Google Analytics, content strategy, campaign optimization, and brand positioning."},"quote":"Great marketing doesn't just attract attention. It gives people a reason to believe in what you're building.","sort":16},{"name":"Allison Reed","role":"Customer Success & Onboarding Engineer","email":"","image":"/images/avatars/f5.jpg","bio":"","highlight":{"label":"Professional Achievements","text":"Developed structured customer onboarding experiences, technical integration guidance, and troubleshooting processes to make adopting new software simpler and more approachable."},"expertise":{"label":"Technical Expertise","text":"API integration, SQL, technical documentation, product onboarding, troubleshooting, and customer success engineering."},"quote":"The best part of my job is seeing someone go from feeling overwhelmed to feeling completely confident with the technology they're using.","sort":17}]$team$::jsonb) as item
where not exists (select 1 from public.team_members);

update public.pages
set content = content - 'members'
where slug = 'team';
