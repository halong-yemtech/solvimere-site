-- =====================================================================
-- Solvimere Supabase dump: schema + data
-- Source project : jditwxzvfcjhzoufamir
-- Generated      : 2026-11-17 07:01 UTC
--
-- Schema : the project's migrations (supabase/migrations, from git HEAD),
--          which define every table, function, trigger, RLS policy, grant
--          and storage bucket the app uses.
-- Data   : public.pages (9 rows), public.team_members (12 rows).
--
-- NOT included (not readable with the anon key; needs the DB password):
--   auth.users (logins), public.profiles, public.staff_invites,
--   and storage files (only bucket definitions are created here).
--   After restoring, sign up once: the first account becomes admin.
--
-- Run it in the TARGET project: Dashboard -> SQL Editor -> paste -> Run,
-- or: psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f solvimere_dump.sql
-- It runs in one transaction and REPLACES all rows in pages and team_members.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. SCHEMA
-- ---------------------------------------------------------------------

-- >>> migration 20261016112216_admin_profiles_and_pages.sql
create schema if not exists private;

do $$
begin
  create type public.staff_role as enum ('admin', 'editor');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.staff_role not null default 'editor',
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  slug text primary key,
  title text not null,
  status text not null default 'published' check (status in ('draft', 'published')),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create table if not exists public.staff_invites (
  email text primary key,
  full_name text not null default '',
  role public.staff_role not null default 'editor',
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.staff_invites enable row level security;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('admin', 'editor')
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned public.staff_role := 'editor';
  invite_name text := '';
begin
  if not exists (select 1 from public.profiles where role = 'admin') then
    insert into public.profiles (id, email, full_name, role)
    values (
      new.id,
      coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      'admin'
    );
    return new;
  end if;

  select staff_invites.role, staff_invites.full_name
    into assigned, invite_name
  from public.staff_invites
  where email = lower(coalesce(new.email, ''))
  limit 1;

  if not found then
    return new;
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(invite_name, ''), new.raw_user_meta_data ->> 'full_name', ''),
    assigned
  );

  delete from public.staff_invites
  where email = lower(coalesce(new.email, ''));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.protect_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    if not private.is_admin() then
      raise exception 'Only admins can change roles';
    end if;
    if old.role = 'admin' and new.role <> 'admin' then
      if (select count(*) from public.profiles where role = 'admin' and id <> old.id) = 0 then
        raise exception 'At least one admin is required';
      end if;
    end if;
  end if;

  new.id := old.id;
  new.email := old.email;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile
  before update on public.profiles
  for each row execute function private.protect_profile();

create or replace function private.touch_page()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists touch_page on public.pages;
create trigger touch_page
  before update on public.pages
  for each row execute function private.touch_page();

revoke all on schema private from public;
revoke all on all functions in schema private from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.is_staff() to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.staff_invites to authenticated;
grant select on public.pages to anon, authenticated;
grant update on public.pages to authenticated;

drop policy if exists "read own profile or admin" on public.profiles;
create policy "read own profile or admin"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()) or private.is_admin());

drop policy if exists "update own profile or admin" on public.profiles;
create policy "update own profile or admin"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()) or private.is_admin())
with check (id = (select auth.uid()) or private.is_admin());

drop policy if exists "read published pages or staff drafts" on public.pages;
create policy "read published pages or staff drafts"
on public.pages
for select
to anon, authenticated
using (status = 'published' or private.is_staff());

drop policy if exists "admins manage staff invites" on public.staff_invites;
create policy "admins manage staff invites"
on public.staff_invites
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "staff update pages" on public.pages;
create policy "staff update pages"
on public.pages
for update
to authenticated
using (private.is_staff())
with check (private.is_staff());

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read site images" on storage.objects;
create policy "public read site images"
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('avatars', 'media'));

drop policy if exists "upload own avatar or admin" on storage.objects;
create policy "upload own avatar or admin"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or private.is_admin()
  )
);

drop policy if exists "update own avatar or admin" on storage.objects;
create policy "update own avatar or admin"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or private.is_admin()
  )
)
with check (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or private.is_admin()
  )
);

drop policy if exists "delete own avatar or admin" on storage.objects;
create policy "delete own avatar or admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or private.is_admin()
  )
);

drop policy if exists "staff upload media" on storage.objects;
create policy "staff upload media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'media' and private.is_staff());

drop policy if exists "staff update media" on storage.objects;
create policy "staff update media"
on storage.objects
for update
to authenticated
using (bucket_id = 'media' and private.is_staff())
with check (bucket_id = 'media' and private.is_staff());

drop policy if exists "staff delete media" on storage.objects;
create policy "staff delete media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'media' and private.is_staff());

insert into public.pages (slug, title, status, content) values
  ('home', 'Home', 'published', $pagejson${"hero":{"eyebrow":"Software studio","title":"Intelligent Software,\nBuilt For Production","emphasis":"Production","lede":"We design, build, and operate custom platforms, applied AI, and computer vision that hold up on the floor, not just in a demo."}}$pagejson$::jsonb),
  ('settings', 'Site settings', 'published', $pagejson${"email":"hello@solvimere.com","siteName":"Solvimere","tagline":"A software studio for custom platforms, applied AI, and computer vision. Built to last in production, not just in a demo."}$pagejson$::jsonb),
  ('team', 'Team', 'published', $pagejson${"hero":{"eyebrow":"Our team","title":"Meet the people behind Solvimere","emphasis":"Solvimere","lede":"A team of developers, designers, and AI specialists building intelligent products and automation systems that help businesses grow faster, smarter, and with more control."},"members":[{"name":"Mathieu Blais","roles":["AI/ML Engineer","Project Manager","Data Scientist"],"image":"/images/team/mathieu-blais.jpg","bio":"Combines expertise in AI/ML engineering, data science, and project management to develop intelligent, data-driven solutions. Experienced in leading AI initiatives from planning and development through deployment, with a focus on delivering scalable, reliable, and business-oriented technology solutions."},{"name":"Indra Santosa","roles":["Applied AI Engineer","Data Architect"],"image":"/images/team/indra-santosa.jpg","bio":"Specializes in applied AI and data architecture, developing intelligent solutions and scalable data systems that support reliable, data-driven applications. Focused on transforming complex data and AI requirements into practical, high-performance solutions."},{"name":"Ming Liu","roles":["AI/ML Engineer","DevOps","MLOps"],"image":"/images/team/ming-liu.jpg","bio":"Specializes in AI/ML engineering, DevOps, and MLOps, with a focus on building, deploying, and maintaining reliable machine learning systems. Experienced in streamlining AI development workflows and creating scalable infrastructure for production-ready solutions."},{"name":"Ren Xingyu","roles":["AI/ML Engineer","Cloud Engineer","DBA"],"image":"/images/team/ren-xingyu.jpg","bio":"Combines expertise in AI/ML engineering, cloud infrastructure, and database administration to build scalable and dependable technology solutions. Focused on designing efficient architectures and ensuring the performance, availability, and reliability of AI-driven systems."},{"name":"Li Chen","roles":["AI/ML Engineer","Security Engineer"],"image":"/images/team/li-chen.jpg","bio":"Specializes in AI/ML engineering and cybersecurity, focusing on developing intelligent systems with strong security, reliability, and data protection. Experienced in integrating security principles throughout the design and deployment of AI-driven solutions."}]}$pagejson$::jsonb),
  ('products', 'Products', 'published', $pagejson${"hero":{"eyebrow":"Our products","title":"Smarter technology for every part of your business.","emphasis":"your business.","lede":"Explore the Solvimere platform suite — integrated AI products built to automate operations, deepen customer intelligence, and turn data into decisive action."},"stats":[["40+","AI agents deployed"],["10×","Faster workflows"],["120+","Businesses served"],["99.9%","Platform uptime"]],"items":[{"category":"Digital Platforms","name":"AI Agent Platform","description":"Autonomous agents that can reason, use tools, retrieve information, and execute multi-step business tasks.","skills":["FastAPI","LangGraph","OpenAI/Anthropic APIs","RAG"],"href":"https://agentco.ai/portfolio","image":"/images/photos/insight-ml.jpg"},{"category":"Automation","name":"AI Workflow Automation","description":"Connects AI with existing business applications to automate repetitive workflows.","skills":["Webhooks","LLMs","Workflow design"],"href":"https://agentlabs.agency/portfolio","image":"/images/photos/laptop.jpg"},{"category":"Digital Platforms","name":"AI Marketing Agent","description":"AI agents automate marketing tasks such as content generation, lead handling, and campaign workflows.","skills":["LLMs","Agents","Python","APIs","CRM integrations"],"href":"https://hyperloop-ai.com/portfolio","image":"/images/photos/insight-product.jpg"},{"category":"Intelligence","name":"AI Voice Agent","description":"AI voice agents that communicate with customers over the phone and perform tasks such as qualification, scheduling, and support.","skills":["Python","LLMs","Speech-to-text","Text-to-speech","Telephony APIs"],"href":"https://zencia.ai/case-studies","image":"/images/photos/session.jpg"},{"category":"Intelligence","name":"AI Contract Analyzer","description":"Extracts important clauses, entities, and information from contracts and allows users to query documents.","skills":["OCR","NLP","LLMs","RAG","Vector DB"],"href":"https://unicoconnect.com","image":"/images/photos/work.webp"},{"category":"AI Agent","name":"Sim","description":"Visual, open-source platform for building and deploying autonomous AI agents.","skills":["Python","LLMs","Agents","APIs"],"href":"https://sim.ai","image":"/images/photos/engineer.png"},{"category":"AI Agent","name":"Bluejay","description":"Tests, monitors, and evaluates voice and chat AI agents.","skills":["LLM evaluation","APIs","Observability"],"href":"https://getbluejay.ai","image":"/images/photos/insight-vision.jpg"},{"category":"AI Infrastructure","name":"AgentMail","description":"Email inbox and API infrastructure designed specifically for AI agents.","skills":["Python","APIs","MCP","AI agents"],"href":"https://www.agentmail.to","image":"/images/photos/laptop.jpg"},{"category":"Automation","name":"Yutori","description":"Autonomous browser and computer-use agents that research and perform web tasks.","skills":["Python","Browser automation","LLMs","Agents"],"href":"https://yutori.com","image":"/images/photos/robot.jpg"},{"category":"Automation","name":"Lapis","description":"AI agents create, launch, and optimize paid advertising campaigns.","skills":["AI agents","Marketing automation","Analytics","APIs"],"href":"https://trylapis.com","image":"/images/photos/retail.jpg"},{"category":"Data & Analytics","name":"Context.dev","description":"API for scraping, searching, crawling, and researching live web data for AI products.","skills":["Python","Web scraping","APIs","RAG"],"href":"https://www.context.dev","image":"/images/photos/inspection.jpg"}]}$pagejson$::jsonb),
  ('solutions', 'Solutions', 'published', $pagejson${"hero":{"eyebrow":"Solutions","title":"Tailored AI solutions for real business impact.","emphasis":"real business impact.","lede":"Solvimere helps businesses turn AI, automation, and data into practical solutions. We design and build intelligent systems that solve real challenges and drive measurable growth."},"items":[{"title":"AI business automation","body":"Automate repetitive processes and turn complex workflows into intelligent systems.","icon":"nodes"},{"title":"AI customer intelligence","body":"Deliver faster, smarter support, more personalized experiences, and deeper customer insights.","icon":"people"},{"title":"Data & analytics","body":"Transform business data into actionable intelligence and better decisions.","icon":"spark"},{"title":"Digital platforms & software","body":"Design and build scalable software products tailored to your business needs.","icon":"code"}],"needs":[{"title":"Automate operations","body":"Reduce manual work and operational complexity.","icon":"box"},{"title":"Improve customer experience","body":"Deliver faster, smarter interactions.","icon":"heart"},{"title":"Unlock business intelligence","body":"Turn data into useful decisions.","icon":"spark"},{"title":"Build and scale digital products","body":"Launch and evolve modern software.","icon":"share"}],"advantages":[{"title":"Custom-built for your needs","body":"No one-size-fits-all. Every solution is tailored.","icon":"spark"},{"title":"Secure and reliable","body":"Enterprise-grade security and compliance.","icon":"shield"},{"title":"Expert team","body":"AI specialists, engineers, and designers.","icon":"people"},{"title":"Long-term partnership","body":"We grow with you, not just for you.","icon":"heart"}],"platformPoints":["AI-powered workflows","Seamless integrations","Intelligent agents","Automated decision-making","Real-time analytics"]}$pagejson$::jsonb),
  ('industries', 'Industries', 'published', $pagejson${"hero":{"eyebrow":"Industries","title":"Industry-specific solutions for a smarter tomorrow.","emphasis":"smarter tomorrow.","lede":"Every industry faces unique challenges. Solvimere builds AI-powered software, automation systems, and digital solutions tailored to the work — helping you work smarter, serve better, and grow faster."},"items":[{"title":"Financial services","body":"Enhance risk management, detect fraud, and automate operations with AI-driven solutions.","icon":"bank","image":"/images/photos/laptop.jpg"},{"title":"Healthcare","body":"Improve patient experiences, streamline operations, and enable better decision-making.","icon":"pulse","image":"/images/photos/clinical.jpg"},{"title":"Retail & e-commerce","body":"Personalize customer journeys, optimize inventory, and increase sales with intelligent systems.","icon":"cart","image":"/images/photos/retail.jpg"},{"title":"Logistics & supply chain","body":"Improve visibility, automate processes, and reduce operational costs across your supply chain.","icon":"box","image":"/images/photos/robot.jpg"},{"title":"Professional services","body":"Boost productivity, automate workflows, and deliver greater value to your clients.","icon":"people","image":"/images/photos/session.jpg"},{"title":"Technology","body":"Build scalable platforms, integrate systems, and accelerate innovation with modern technology.","icon":"code","image":"/images/photos/insight-ml.jpg"},{"title":"Real estate","body":"Simplify property management, improve customer engagement, and increase operational efficiency.","icon":"building","image":"/images/photos/about-right.webp"},{"title":"Manufacturing","body":"Enable smart factories, predict maintenance, and optimize production processes.","icon":"factory","image":"/images/photos/inspection.jpg"}],"strengths":[{"title":"Domain experts","body":"Real-world experience across industries."},{"title":"Flexible solutions","body":"Tailored to your business and goals."},{"title":"Scalable growth","body":"Built for today, ready for tomorrow."},{"title":"Long-term partnership","body":"We grow with you."}],"results":[{"category":"Financial services","title":"Automating KYC & compliance","metrics":[["70%","Faster verification"],["50%","Less manual review"]]},{"category":"Healthcare","title":"AI-powered patient support","metrics":[["3×","Faster response"],["40%","Higher satisfaction"]]},{"category":"Retail & e-commerce","title":"Intelligent recommendation engine","metrics":[["35%","Higher conversion"],["25%","Higher order value"]]},{"category":"Logistics & supply chain","title":"Smart fleet optimization","metrics":[["20%","Lower fuel costs"],["45%","More on-time delivery"]]}]}$pagejson$::jsonb),
  ('case-studies', 'Case studies', 'published', $pagejson${"hero":{"eyebrow":"Case studies","title":"See how smart technology drives real business results.","emphasis":"real business results.","lede":"From customer experience to operational intelligence, Solvimere helps businesses turn complex challenges into measurable outcomes across every stage of growth."},"stats":[["35%","Average efficiency gain"],["3×","Faster service delivery"],["92%","Customer satisfaction uplift"]],"studies":[{"category":"Financial services","title":"Automated loan processing system","summary":"Built a streamlined underwriting workflow that reduced manual review time and improved decision consistency.","image":"/images/photos/laptop.jpg","metrics":[["65%","Less manual processing"],["2.5×","Faster application turnaround"]]},{"category":"Healthcare","title":"Intelligent patient data platform","summary":"Connected fragmented patient information into a single operational view for faster care coordination and reporting.","image":"/images/photos/clinical.jpg","metrics":[["50%","Less data processing time"],["35%","Better operational efficiency"]]},{"category":"Retail & e-commerce","title":"AI-powered customer support","summary":"Helped a retail brand automate support workflows while delivering a more consistent and personalized customer experience.","image":"/images/photos/session.jpg","metrics":[["3×","Faster customer response"],["40%","Higher customer satisfaction"]]},{"category":"Logistics & supply chain","title":"Smart fleet optimization","summary":"Created a predictive operations layer that gave teams better route visibility, asset planning, and on-time performance.","image":"/images/photos/robot.jpg","metrics":[["20%","Lower fuel costs"],["45%","Higher on-time delivery"]]},{"category":"Manufacturing","title":"Predictive maintenance network","summary":"Unified machine telemetry and maintenance data to reduce downtime and improve operational resilience.","image":"/images/photos/inspection.jpg","metrics":[["28%","Lower maintenance costs"],["60%","Fewer unplanned shutdowns"]]},{"category":"Retail & e-commerce","title":"Omnichannel revenue intelligence","summary":"Turned fragmented retail signals into a single growth dashboard that informed pricing, inventory, and campaign decisions.","image":"/images/photos/retail.jpg","metrics":[["31%","Increase in conversion"],["24%","Higher average order value"]]}]}$pagejson$::jsonb),
  ('resources', 'Resources', 'published', $pagejson${"hero":{"eyebrow":"Resources","title":"Insights and expertise for a smarter digital future.","emphasis":"smarter digital future.","lede":"Articles, guides, and notes on AI, automation, software, and digital transformation — practical material for teams that need to operate faster."},"topics":[["All","All"],["AI & Automation","24"],["Product Updates","12"],["Guides & How-Tos","18"],["Case Studies","10"],["Industry Insights","14"]],"featured":{"topic":"AI & Automation","title":"The future of AI agents in business operations","description":"Discover how AI agents are transforming workflows, reducing manual work, and creating new opportunities for business growth.","image":"/images/photos/insight-ml.jpg","date":"Featured"},"articles":[{"topic":"AI & Automation","title":"5 ways AI automation can improve your business efficiency","description":"Discover practical ways to automate repetitive tasks and free up your team for higher-value work.","date":"Apr 28, 2025","image":"/images/photos/laptop.jpg"},{"topic":"Guides & How-Tos","title":"A complete guide to building AI-powered chatbots","description":"A step-by-step guide to building and integrating AI chatbots for better customer engagement.","date":"Apr 22, 2025","image":"/images/photos/session.jpg"},{"topic":"Data & Analytics","title":"Turning data into decisions: the power of business intelligence","description":"How modern analytics tools help businesses make faster, smarter, more confident decisions.","date":"Apr 16, 2025","image":"/images/photos/insight-product.jpg"},{"topic":"Industry Insights","title":"Digital transformation trends in Southeast Asia (2025)","description":"Key trends and opportunities shaping the future of digital business in the region.","date":"Apr 10, 2025","image":"/images/photos/about-left.webp"},{"topic":"Case Studies","title":"How a retail brand increased sales with AI recommendations","description":"See how AI-driven personalization helped a retail client boost conversion rates.","date":"Apr 4, 2025","image":"/images/photos/retail.jpg"},{"topic":"Technology","title":"The benefits of cloud-native applications for modern businesses","description":"Why cloud-native architecture is essential for scalability, flexibility, and long-term growth.","date":"Mar 28, 2025","image":"/images/photos/insight-vision.jpg"},{"topic":"Product Updates","title":"Introducing Solvimere Automation Platform v2.0","description":"New features, better performance, and more integrations to help you automate faster.","date":"Mar 20, 2025","image":"/images/photos/engineer.png"},{"topic":"Guides & How-Tos","title":"How to choose the right AI solution for your business","description":"A practical checklist to help you find the best AI solution for your goals, budget, and industry.","date":"Mar 12, 2025","image":"/images/photos/work.webp"}]}$pagejson$::jsonb),
  ('about', 'About', 'published', $pagejson${"hero":{"eyebrow":"About Solvimere","title":"Technology built around possibility.","emphasis":"possibility.","lede":"Solvimere is a technology company based in Singapore, bringing together developers, designers, and AI specialists to create intelligent digital products and automation systems that help businesses grow faster, smarter, and with more control."},"mission":"To build intelligent digital solutions that help businesses grow faster, smarter, and more efficiently.","vision":"To create a future where technology empowers people and businesses worldwide.","values":["Innovation","Customer success","Collaboration","Integrity","Long-term thinking"],"stats":[["50+","Team members"],["10+","Nationalities"],["4","Offices, Singapore and remote"],["100%","Focus on customer success"]],"journey":[["2020","Solvimere founded in Singapore with a vision to build intelligent digital solutions."],["2021","Launched our first AI-powered product and welcomed our early customers."],["2022","Expanded our team, product portfolio, and global partnerships."],["2024","Serving businesses across industries and scaling for the future."]],"presence":[["Singapore","Headquarters"],["Europe","Clients and partners"],["Americas","Clients and partners"],["APAC","Partner network"]]}$pagejson$::jsonb)
on conflict (slug) do nothing;

-- >>> migration 20261016212417_add_leadership_to_team.sql
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

-- >>> migration 20261016213300_replace_team_roster.sql
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

-- >>> migration 20261017160000_team_members.sql
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

-- >>> migration 20261017173000_team_avatar_scale.sql
alter table public.team_members
  add column if not exists avatar_scale numeric not null default 1;

alter table public.team_members
  drop constraint if exists team_members_avatar_scale_check;

alter table public.team_members
  add constraint team_members_avatar_scale_check
  check (avatar_scale >= 0.5 and avatar_scale <= 2.5);

-- >>> migration 20261017193000_page_images.sql
update public.pages
set content = content || $img${"photos":{"hero":"/images/photos/group.png","aboutLeft":"/images/photos/about-left.webp","aboutRight":"/images/photos/about-right.webp","engineer":"/images/photos/engineer.png","process":"/images/photos/work.webp","expertise":"/images/photos/laptop.jpg","session":"/images/photos/session.jpg","cta":"/images/photos/cta.jpg"},"avatars":[{"image":"/images/avatars/f2.jpg"},{"image":"/images/avatars/m1.jpg"},{"image":"/images/avatars/f5.jpg"},{"image":"/images/avatars/m4.jpg"},{"image":"/images/avatars/f6.jpg"}],"logos":[{"name":"Bellomy","image":"/images/logos/bellomy.png"},{"name":"Clariti","image":"/images/logos/clariti.png"},{"name":"ElevenMR","image":"/images/logos/eleven.png"},{"name":"Enos Answers","image":"/images/logos/enos.png"},{"name":"Fieldwork","image":"/images/logos/fieldwork.png"},{"name":"Full Circle Research","image":"/images/logos/fullcircle.png"},{"name":"Harmon Research","image":"/images/logos/harmon.png"},{"name":"Indiefield","image":"/images/logos/indiefield.png"},{"name":"Kantar","image":"/images/logos/kantar.png"},{"name":"Quantify AI","image":"/images/logos/quantify.png"},{"name":"Quest Mindshare","image":"/images/logos/quest.png"},{"name":"ReconMR","image":"/images/logos/recon.png"}],"works":[{"category":"Computer Vision","title":"Precision Inspection","image":"/images/photos/inspection.jpg"},{"category":"Applied AI","title":"Retail Perception","image":"/images/photos/retail.jpg"},{"category":"Robotics","title":"Autonomous Navigation","image":"/images/photos/robot.jpg"},{"category":"Healthcare","title":"Clinical Imaging","image":"/images/photos/clinical.jpg"}],"testimonials":[{"quote":"Solvimere did not hand us a prototype. They left a production inspection stack our plant team could operate on Monday morning.","name":"Maria Chen","role":"VP of Operations, Northline Manufacturing","avatar":"/images/avatars/f2.jpg"},{"quote":"The difference was rigor. Evaluation, rollout, and monitoring were part of the plan, not a phase we had to invent later.","name":"James Okonkwo","role":"Director of Product, Clariti","avatar":"/images/avatars/m1.jpg"},{"quote":"We needed a partner who could talk to researchers and still ship software. Solvimere sat comfortably in both rooms.","name":"Elena Voss","role":"Head of Insights Technology, Kantar","avatar":"/images/avatars/f5.jpg"},{"quote":"They treated our robots like production systems, not research demos. Navigation went live on a real site in twelve weeks, with monitoring our ops team actually uses.","name":"Daniel Reyes","role":"CTO, Brightpath Robotics","avatar":"/images/avatars/m3.jpg"},{"quote":"Solvimere fit into our clinical workflow instead of asking clinicians to change it. Review queues got shorter and our radiologists trusted the tool from week one.","name":"Priya Nair","role":"Head of Data Science, Meridian Health","avatar":"/images/avatars/f6.jpg"}],"insights":[{"day":"12","month":"Mar","year":"2026","date":"12 Mar 2026","tag":"Vision","title":"Shipping OpenCV pipelines that stay fast on the edge","body":"What we keep, what we drop, and how we measure latency before a model ever reaches a device.","image":"/images/photos/insight-vision.jpg"},{"day":"28","month":"Feb","year":"2026","date":"28 Feb 2026","tag":"Machine Learning","title":"What production AI teams get wrong about evaluation","body":"Accuracy on a notebook is not a launch criterion. Here is the evaluation loop we use instead.","image":"/images/photos/insight-ml.jpg"},{"day":"09","month":"Feb","year":"2026","date":"09 Feb 2026","tag":"Product","title":"Designing human-in-the-loop vision systems","body":"Operators should correct the model without becoming the model. A practical design for review queues.","image":"/images/photos/insight-product.jpg"}]}$img$::jsonb
where slug = 'home' and not (content ? 'photos');

update public.pages
set content = content || $img${"photos":{"portrait":"/images/photos/about-left.webp","presence":"/images/photos/about-right.webp"}}$img$::jsonb
where slug = 'about' and not (content ? 'photos');

update public.pages
set content = content || $img${"photos":{"feature":"/images/photos/insight-product.jpg"}}$img$::jsonb
where slug = 'solutions' and not (content ? 'photos');

update public.pages
set content = content || $img${"logo":"/images/logo-white.png"}$img$::jsonb
where slug = 'settings' and not (content ? 'logo');

-- >>> migration 20261024190000_product_images.sql
with images(name, old_image, new_image) as (
  values
    ('AI Agent Platform', '/images/photos/insight-ml.jpg', '/images/products/agentco.webp'),
    ('AI Workflow Automation', '/images/photos/laptop.jpg', '/images/products/agentlabs.jpg'),
    ('AI Marketing Agent', '/images/photos/insight-product.jpg', '/images/products/hyperloop.png'),
    ('AI Voice Agent', '/images/photos/session.jpg', '/images/products/zencia.png'),
    ('AI Contract Analyzer', '/images/photos/work.webp', '/images/products/unicoconnect.png'),
    ('Sim', '/images/photos/engineer.png', '/images/products/sim.png'),
    ('Bluejay', '/images/photos/insight-vision.jpg', '/images/products/bluejay.jpg'),
    ('AgentMail', '/images/photos/laptop.jpg', '/images/products/agentmail.png'),
    ('Yutori', '/images/photos/robot.jpg', '/images/products/yutori.png'),
    ('Lapis', '/images/photos/retail.jpg', '/images/products/lapis.png'),
    ('Context.dev', '/images/photos/inspection.jpg', '/images/products/context-dev.png')
)
update public.pages p
set content = jsonb_set(p.content, '{items}', (
  select jsonb_agg(
    case when i.new_image is not null
      then item || jsonb_build_object('image', i.new_image)
      else item
    end order by ord)
  from jsonb_array_elements(p.content->'items') with ordinality as e(item, ord)
  left join images i on i.name = item->>'name' and i.old_image = item->>'image'
))
where p.slug = 'products' and jsonb_typeof(p.content->'items') = 'array';

-- >>> migration 20261024193000_dataw_testimonials.sql
update public.pages
set content = jsonb_set(content, '{testimonials}', $json$[
  {
    "quote": "As a lean AI team we cannot afford bad data or payment disputes. Escrow on Data-W holds funds until I approve deliverables, and validation agents catch issues before they ever hit our training pipeline.",
    "name": "Jesse Schenk",
    "role": "Co-founder & CEO, Showfer Media LLC",
    "avatar": "/images/clients/jesse-schenk.png",
    "photo": "/images/clients/customer-stories.jpg"
  },
  {
    "quote": "We spent months chasing niche street-scene imagery for our perception stack. On Data-W we posted the spec once, matched with collectors in days, and had agent-validated batches in our pipeline before our next sprint review.",
    "name": "Ari X",
    "role": "Founder, CEO, Beejern",
    "avatar": "/images/clients/ari-x.png",
    "photo": "/images/clients/customer-stories.jpg"
  },
  {
    "quote": "Crowdsourcing through forums gave us inconsistent labels and almost no provenance. Data-W gave us structured submissions, clear consent, and enough volume to train our model without delaying the dissertation timeline.",
    "name": "Tracy West",
    "role": "EVP of Digital Content, Freecast",
    "avatar": "/images/clients/tracy-west.webp",
    "photo": "/images/clients/customer-stories.jpg"
  },
  {
    "quote": "Freelance platforms rarely reward specialty work. On Data-W, repeat requesters book me for consistent capture standards, and agent validation means fewer disputes and more predictable income month to month.",
    "name": "Joe Simonds",
    "role": "CEO, Saltstrong",
    "avatar": "/images/clients/joe-simonds.png",
    "photo": "/images/clients/customer-stories.jpg"
  }
]$json$::jsonb)
where slug = 'home'
  and (content->'testimonials') @> '[{"name":"Maria Chen"},{"name":"Priya Nair"}]'::jsonb;


-- ---------------------------------------------------------------------
-- 2. DATA
-- ---------------------------------------------------------------------
-- The migrations above seed placeholder content; replace it with the live rows.
delete from public.team_members;
delete from public.pages;

-- pages.updated_by references public.profiles, which is not part of this dump,
-- so it is restored as null.
insert into public.pages (slug, title, status, content, updated_at, updated_by) values
  ('case-studies', 'Case studies', 'published', $json${"hero":{"lede":"From customer experience to operational intelligence, Solvimere helps businesses turn complex challenges into measurable outcomes across every stage of growth.","title":"See how smart technology drives real business results.","eyebrow":"Case studies","emphasis":"real business results."},"stats":[["35%","Average efficiency gain"],["3×","Faster service delivery"],["92%","Customer satisfaction uplift"]],"studies":[{"image":"/images/photos/laptop.jpg","title":"Automated loan processing system","metrics":[["65%","Less manual processing"],["2.5×","Faster application turnaround"]],"summary":"Built a streamlined underwriting workflow that reduced manual review time and improved decision consistency.","category":"Financial services"},{"image":"/images/photos/clinical.jpg","title":"Intelligent patient data platform","metrics":[["50%","Less data processing time"],["35%","Better operational efficiency"]],"summary":"Connected fragmented patient information into a single operational view for faster care coordination and reporting.","category":"Healthcare"},{"image":"/images/photos/session.jpg","title":"AI-powered customer support","metrics":[["3×","Faster customer response"],["40%","Higher customer satisfaction"]],"summary":"Helped a retail brand automate support workflows while delivering a more consistent and personalized customer experience.","category":"Retail & e-commerce"},{"image":"/images/photos/robot.jpg","title":"Smart fleet optimization","metrics":[["20%","Lower fuel costs"],["45%","Higher on-time delivery"]],"summary":"Created a predictive operations layer that gave teams better route visibility, asset planning, and on-time performance.","category":"Logistics & supply chain"},{"image":"/images/photos/inspection.jpg","title":"Predictive maintenance network","metrics":[["28%","Lower maintenance costs"],["60%","Fewer unplanned shutdowns"]],"summary":"Unified machine telemetry and maintenance data to reduce downtime and improve operational resilience.","category":"Manufacturing"},{"image":"/images/photos/retail.jpg","title":"Omnichannel revenue intelligence","metrics":[["31%","Increase in conversion"],["24%","Higher average order value"]],"summary":"Turned fragmented retail signals into a single growth dashboard that informed pricing, inventory, and campaign decisions.","category":"Retail & e-commerce"}]}$json$::jsonb, '2026-10-16T11:38:50.062808+00:00', null),
  ('solutions', 'Solutions', 'published', $json${"hero":{"lede":"Solvimere helps businesses turn AI, automation, and data into practical solutions. We design and build intelligent systems that solve real challenges and drive measurable growth.","title":"Tailored AI solutions for real business impact.","eyebrow":"Solutions","emphasis":"real business impact."},"items":[{"body":"Automate repetitive processes and turn complex workflows into intelligent systems.","icon":"nodes","title":"AI business automation"},{"body":"Deliver faster, smarter support, more personalized experiences, and deeper customer insights.","icon":"people","title":"AI customer intelligence"},{"body":"Transform business data into actionable intelligence and better decisions.","icon":"spark","title":"Data & analytics"},{"body":"Design and build scalable software products tailored to your business needs.","icon":"code","title":"Digital platforms & software"}],"needs":[{"body":"Reduce manual work and operational complexity.","icon":"box","title":"Automate operations"},{"body":"Deliver faster, smarter interactions.","icon":"heart","title":"Improve customer experience"},{"body":"Turn data into useful decisions.","icon":"spark","title":"Unlock business intelligence"},{"body":"Launch and evolve modern software.","icon":"share","title":"Build and scale digital products"}],"photos":{"feature":"/images/photos/insight-product.jpg"},"advantages":[{"body":"No one-size-fits-all. Every solution is tailored.","icon":"spark","title":"Custom-built for your needs"},{"body":"Enterprise-grade security and compliance.","icon":"shield","title":"Secure and reliable"},{"body":"AI specialists, engineers, and designers.","icon":"people","title":"Expert team"},{"body":"We grow with you, not just for you.","icon":"heart","title":"Long-term partnership"}],"platformPoints":["AI-powered workflows","Seamless integrations","Intelligent agents","Automated decision-making","Real-time analytics"]}$json$::jsonb, '2026-10-17T18:05:00.220817+00:00', null),
  ('settings', 'Site settings', 'published', $json${"logo":"/images/logo-white.png","email":"hello@solvimere.com","tagline":"A software studio for custom platforms, applied AI, and computer vision. Built to last in production, not just in a demo.","siteName":"Solvimere"}$json$::jsonb, '2026-10-17T18:05:00.220817+00:00', null),
  ('products', 'Products', 'published', $json${"hero":{"lede":"Explore the Solvimere platform suite — integrated AI products built to automate operations, deepen customer intelligence, and turn data into decisive action.","title":"Smarter technology for every part of your business.","eyebrow":"Our products","emphasis":"your business."},"items":[{"href":"https://agentco.ai/portfolio","name":"AI Agent Platform","image":"/images/products/agentco.webp","skills":["FastAPI","LangGraph","OpenAI/Anthropic APIs","RAG"],"category":"Digital Platforms","description":"Autonomous agents that can reason, use tools, retrieve information, and execute multi-step business tasks."},{"href":"https://agentlabs.agency/portfolio","name":"AI Workflow Automation","image":"/images/products/agentlabs.jpg","skills":["Webhooks","LLMs","Workflow design"],"category":"Automation","description":"Connects AI with existing business applications to automate repetitive workflows."},{"href":"https://hyperloop-ai.com/portfolio","name":"AI Marketing Agent","image":"/images/products/hyperloop.png","skills":["LLMs","Agents","Python","APIs","CRM integrations"],"category":"Digital Platforms","description":"AI agents automate marketing tasks such as content generation, lead handling, and campaign workflows."},{"href":"https://zencia.ai/case-studies","name":"AI Voice Agent","image":"/images/products/zencia.png","skills":["Python","LLMs","Speech-to-text","Text-to-speech","Telephony APIs"],"category":"Intelligence","description":"AI voice agents that communicate with customers over the phone and perform tasks such as qualification, scheduling, and support."},{"href":"https://unicoconnect.com","name":"AI Contract Analyzer","image":"/images/products/unicoconnect.png","skills":["OCR","NLP","LLMs","RAG","Vector DB"],"category":"Intelligence","description":"Extracts important clauses, entities, and information from contracts and allows users to query documents."},{"href":"https://sim.ai","name":"Sim","image":"/images/products/sim.png","skills":["Python","LLMs","Agents","APIs"],"category":"AI Agent","description":"Visual, open-source platform for building and deploying autonomous AI agents."},{"href":"https://getbluejay.ai","name":"Bluejay","image":"/images/products/bluejay.jpg","skills":["LLM evaluation","APIs","Observability"],"category":"AI Agent","description":"Tests, monitors, and evaluates voice and chat AI agents."},{"href":"https://www.agentmail.to","name":"AgentMail","image":"/images/products/agentmail.png","skills":["Python","APIs","MCP","AI agents"],"category":"AI Infrastructure","description":"Email inbox and API infrastructure designed specifically for AI agents."},{"href":"https://yutori.com","name":"Yutori","image":"/images/products/yutori.png","skills":["Python","Browser automation","LLMs","Agents"],"category":"Automation","description":"Autonomous browser and computer-use agents that research and perform web tasks."},{"href":"https://trylapis.com","name":"Lapis","image":"/images/products/lapis.png","skills":["AI agents","Marketing automation","Analytics","APIs"],"category":"Automation","description":"AI agents create, launch, and optimize paid advertising campaigns."},{"href":"https://www.context.dev","name":"Context.dev","image":"/images/products/context-dev.png","skills":["Python","Web scraping","APIs","RAG"],"category":"Data & Analytics","description":"API for scraping, searching, crawling, and researching live web data for AI products."}],"stats":[["40+","AI agents deployed"],["10×","Faster workflows"],["120+","Businesses served"],["99.9%","Platform uptime"]]}$json$::jsonb, '2026-10-24T18:47:39.413677+00:00', null),
  ('home', 'Home', 'published', $json${"hero":{"lede":"We design, build, and operate custom platforms, applied AI, and computer vision that hold up on the floor, not just in a demo.","title":"Intelligent Software,\nBuilt For Production","eyebrow":"Software studio","emphasis":"Production"},"logos":[{"name":"Bellomy","image":"/images/logos/bellomy.png"},{"name":"Clariti","image":"/images/logos/clariti.png"},{"name":"ElevenMR","image":"/images/logos/eleven.png"},{"name":"Enos Answers","image":"/images/logos/enos.png"},{"name":"Fieldwork","image":"/images/logos/fieldwork.png"},{"name":"Full Circle Research","image":"/images/logos/fullcircle.png"},{"name":"Harmon Research","image":"/images/logos/harmon.png"},{"name":"Indiefield","image":"/images/logos/indiefield.png"},{"name":"Kantar","image":"/images/logos/kantar.png"},{"name":"Quantify AI","image":"/images/logos/quantify.png"},{"name":"Quest Mindshare","image":"/images/logos/quest.png"},{"name":"ReconMR","image":"/images/logos/recon.png"}],"works":[{"image":"/images/photos/inspection.jpg","title":"Precision Inspection","category":"Computer Vision"},{"image":"/images/photos/retail.jpg","title":"Retail Perception","category":"Applied AI"},{"image":"/images/photos/robot.jpg","title":"Autonomous Navigation","category":"Robotics"},{"image":"/images/photos/clinical.jpg","title":"Clinical Imaging","category":"Healthcare"}],"photos":{"cta":"/images/photos/cta.jpg","hero":"/images/photos/group.png","process":"/images/photos/work.webp","session":"/images/photos/session.jpg","engineer":"/images/photos/engineer.png","aboutLeft":"/images/photos/about-left.webp","expertise":"/images/photos/laptop.jpg","aboutRight":"/images/photos/about-right.webp"},"avatars":[{"image":"/images/avatars/f2.jpg"},{"image":"/images/avatars/m1.jpg"},{"image":"/images/avatars/f5.jpg"},{"image":"/images/avatars/m4.jpg"},{"image":"https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/home/1792260563149-image.png?v=1792260573543"}],"insights":[{"day":"12","tag":"Vision","body":"What we keep, what we drop, and how we measure latency before a model ever reaches a device.","date":"12 Mar 2026","year":"2026","image":"/images/photos/insight-vision.jpg","month":"Mar","title":"Shipping OpenCV pipelines that stay fast on the edge"},{"day":"28","tag":"Machine Learning","body":"Accuracy on a notebook is not a launch criterion. Here is the evaluation loop we use instead.","date":"28 Feb 2026","year":"2026","image":"/images/photos/insight-ml.jpg","month":"Feb","title":"What production AI teams get wrong about evaluation"},{"day":"09","tag":"Product","body":"Operators should correct the model without becoming the model. A practical design for review queues.","date":"09 Feb 2026","year":"2026","image":"/images/photos/insight-product.jpg","month":"Feb","title":"Designing human-in-the-loop vision systems"}],"testimonials":[{"name":"Jesse Schenk","role":"Co-founder & CEO, Showfer Media LLC","photo":"/images/clients/customer-stories.jpg","quote":"As a lean AI team we cannot afford bad data or payment disputes. Escrow on Data-W holds funds until I approve deliverables, and validation agents catch issues before they ever hit our training pipeline.","avatar":"/images/clients/jesse-schenk.png"},{"name":"Ari X","role":"Founder, CEO, Beejern","photo":"/images/clients/customer-stories.jpg","quote":"We spent months chasing niche street-scene imagery for our perception stack. On Data-W we posted the spec once, matched with collectors in days, and had agent-validated batches in our pipeline before our next sprint review.","avatar":"/images/clients/ari-x.png"},{"name":"Tracy West","role":"EVP of Digital Content, Freecast","photo":"/images/clients/customer-stories.jpg","quote":"Crowdsourcing through forums gave us inconsistent labels and almost no provenance. Data-W gave us structured submissions, clear consent, and enough volume to train our model without delaying the dissertation timeline.","avatar":"/images/clients/tracy-west.webp"},{"name":"Joe Simonds","role":"CEO, Saltstrong","photo":"/images/clients/customer-stories.jpg","quote":"Freelance platforms rarely reward specialty work. On Data-W, repeat requesters book me for consistent capture standards, and agent validation means fewer disputes and more predictable income month to month.","avatar":"/images/clients/joe-simonds.png"}]}$json$::jsonb, '2026-10-24T19:33:40.802608+00:00', null),
  ('industries', 'Industries', 'published', $json${"hero":{"lede":"Every industry faces unique challenges. Solvimere builds AI-powered software, automation systems, and digital solutions tailored to the work — helping you work smarter, serve better, and grow faster.","title":"Industry-specific solutions for a smarter tomorrow.","eyebrow":"Industries","emphasis":"smarter tomorrow."},"items":[{"body":"Enhance risk management, detect fraud, and automate operations with AI-driven solutions.","icon":"bank","image":"/images/photos/laptop.jpg","title":"Financial services"},{"body":"Improve patient experiences, streamline operations, and enable better decision-making.","icon":"pulse","image":"/images/photos/clinical.jpg","title":"Healthcare"},{"body":"Personalize customer journeys, optimize inventory, and increase sales with intelligent systems.","icon":"cart","image":"/images/photos/retail.jpg","title":"Retail & e-commerce"},{"body":"Improve visibility, automate processes, and reduce operational costs across your supply chain.","icon":"box","image":"/images/photos/robot.jpg","title":"Logistics & supply chain"},{"body":"Boost productivity, automate workflows, and deliver greater value to your clients.","icon":"people","image":"/images/photos/session.jpg","title":"Professional services"},{"body":"Build scalable platforms, integrate systems, and accelerate innovation with modern technology.","icon":"code","image":"/images/photos/insight-ml.jpg","title":"Technology"},{"body":"Simplify property management, improve customer engagement, and increase operational efficiency.","icon":"building","image":"/images/photos/about-right.webp","title":"Real estate"},{"body":"Enable smart factories, predict maintenance, and optimize production processes.","icon":"factory","image":"/images/photos/inspection.jpg","title":"Manufacturing"}],"results":[{"title":"Automating KYC & compliance","metrics":[["70%","Faster verification"],["50%","Less manual review"]],"category":"Financial services"},{"title":"AI-powered patient support","metrics":[["3×","Faster response"],["40%","Higher satisfaction"]],"category":"Healthcare"},{"title":"Intelligent recommendation engine","metrics":[["35%","Higher conversion"],["25%","Higher order value"]],"category":"Retail & e-commerce"},{"title":"Smart fleet optimization","metrics":[["20%","Lower fuel costs"],["45%","More on-time delivery"]],"category":"Logistics & supply chain"}],"strengths":[{"body":"Real-world experience across industries.","title":"Domain experts"},{"body":"Tailored to your business and goals.","title":"Flexible solutions"},{"body":"Built for today, ready for tomorrow.","title":"Scalable growth"},{"body":"We grow with you.","title":"Long-term partnership"}]}$json$::jsonb, '2026-10-24T19:46:39.615901+00:00', null),
  ('resources', 'Resources', 'published', $json${"hero":{"lede":"Articles, guides, and notes on AI, automation, software, and digital transformation — practical material for teams that need to operate faster.","title":"Insights and expertise for a smarter digital future.","eyebrow":"Resources","emphasis":"smarter digital future."},"topics":[["All","All"],["AI & Automation","24"],["Product Updates","12"],["Guides & How-Tos","18"],["Case Studies","10"],["Industry Insights","14"]],"articles":[{"date":"Apr 28, 2025","image":"/images/photos/laptop.jpg","title":"5 ways AI automation can improve your business efficiency","topic":"AI & Automation","description":"Discover practical ways to automate repetitive tasks and free up your team for higher-value work."},{"date":"Apr 22, 2025","image":"/images/photos/session.jpg","title":"A complete guide to building AI-powered chatbots","topic":"Guides & How-Tos","description":"A step-by-step guide to building and integrating AI chatbots for better customer engagement."},{"date":"Apr 16, 2025","image":"/images/photos/insight-product.jpg","title":"Turning data into decisions: the power of business intelligence","topic":"Data & Analytics","description":"How modern analytics tools help businesses make faster, smarter, more confident decisions."},{"date":"Apr 10, 2025","image":"/images/photos/about-left.webp","title":"Digital transformation trends in Southeast Asia (2025)","topic":"Industry Insights","description":"Key trends and opportunities shaping the future of digital business in the region."},{"date":"Apr 4, 2025","image":"/images/photos/retail.jpg","title":"How a retail brand increased sales with AI recommendations","topic":"Case Studies","description":"See how AI-driven personalization helped a retail client boost conversion rates."},{"date":"Mar 28, 2025","image":"/images/photos/insight-vision.jpg","title":"The benefits of cloud-native applications for modern businesses","topic":"Technology","description":"Why cloud-native architecture is essential for scalability, flexibility, and long-term growth."},{"date":"Mar 20, 2025","image":"/images/photos/engineer.png","title":"Introducing Solvimere Automation Platform v2.0","topic":"Product Updates","description":"New features, better performance, and more integrations to help you automate faster."},{"date":"Mar 12, 2025","image":"/images/photos/work.webp","title":"How to choose the right AI solution for your business","topic":"Guides & How-Tos","description":"A practical checklist to help you find the best AI solution for your goals, budget, and industry."}],"featured":{"date":"Featured","image":"/images/photos/insight-ml.jpg","title":"The future of AI agents in business operations","topic":"AI & Automation","description":"Discover how AI agents are transforming workflows, reducing manual work, and creating new opportunities for business growth."}}$json$::jsonb, '2026-10-16T11:38:50.062808+00:00', null),
  ('team', 'Team', 'published', $json${"hero":{"lede":"A team of developers, designers, and AI specialists building intelligent products and automation systems that help businesses grow faster, smarter, and with more control.","title":"Meet the people behind Solvimere","eyebrow":"Our team","emphasis":"Solvimere"}}$json$::jsonb, '2026-10-17T15:06:06.262712+00:00', null),
  ('about', 'About', 'published', $json${"hero":{"lede":"Solvimere is a technology company based in Singapore, bringing together developers, designers, and AI specialists to create intelligent digital products and automation systems that help businesses grow faster, smarter, and with more control.","title":"Technology built around possibility.","eyebrow":"About Solvimere","emphasis":"possibility."},"stats":[["50+","Team members"],["10+","Nationalities"],["4","Offices, Singapore and remote"],["100%","Focus on customer success"]],"photos":{"portrait":"/images/photos/about-left.webp","presence":"/images/photos/about-right.webp"},"values":["Innovation","Customer success","Collaboration","Integrity","Long-term thinking"],"vision":"To create a future where technology empowers people and businesses worldwide.","journey":[["2020","Solvimere founded in Singapore with a vision to build intelligent digital solutions."],["2021","Launched our first AI-powered product and welcomed our early customers."],["2022","Expanded our team, product portfolio, and global partnerships."],["2024","Serving businesses across industries and scaling for the future."]],"mission":"To build intelligent digital solutions that help businesses grow faster, smarter, and more efficiently.","presence":[["Singapore","Headquarters"],["Europe","Clients and partners"],["Americas","Clients and partners"],["APAC","Partner network"]]}$json$::jsonb, '2026-10-17T18:05:00.220817+00:00', null);

insert into public.team_members (id, name, role, email, avatar_url, avatar_scale, bio, highlight_label, highlight_text, expertise_label, expertise_text, quote, sort_order, updated_at) values
  ('d937983e-9231-41dc-a0ec-0347517fb439', 'Dashiell Voss', 'Chief Executive Officer (CEO)', 'dashiell@solvimere.com', 'https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/team/9cfb4caf-d193-4418-923e-98719d2f8d38-m3.jpg?v=1792251431754', 1, '', 'Leadership & Achievements', 'Spearheaded initiatives to connect business strategy with modern technology solutions, emphasizing long-term client relationships, innovation, and sustainable growth.', 'Professional Expertise', 'Business strategy, technology consulting, enterprise software delivery, and organizational leadership.', 'Technology creates opportunities, but it''s the people behind it who turn those opportunities into something meaningful.', 0, '2026-11-14T16:07:36.921803+00:00'),
  ('2cef5eec-4771-489a-8a3b-c3c1fd8f2a9c', 'Nathan Cole', 'Chief Technology Officer (CTO)', 'nathancole@solvimere.com', 'https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/team/3dedcae7-7dda-4468-b91b-07a03f5dfac0-avatar.jpg?v=1792873106408', 1, '', 'Leadership & Achievements', 'Led the development of scalable technology architectures and established engineering practices designed to improve application performance, security, and maintainability.', 'Technical Expertise', 'Cloud-native architecture, distributed systems, AWS, microservices, API engineering, and software scalability.', 'Great engineering isn''t about using the newest technology. It''s about choosing the right technology to solve the right problem.', 1, '2026-11-14T16:07:36.922543+00:00'),
  ('b295dc90-6528-484a-9ee3-9bd0c8a9ed27', 'Gracy Holloway', 'Hiring Manager', 'gracyholloway@solvimere.com', 'https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/team/37d4e6a6-0c43-4e32-87d1-7ccc02a1056c-f2.jpg?v=1792251531654', 1, '', 'Leadership & Achievements', 'Built structured hiring processes that connect engineering, product, and client-facing teams with the right talent, creating a faster, more predictable path from open role to productive team member.', 'Professional Expertise', 'Talent acquisition, technical recruiting, structured interviewing, candidate experience, onboarding, and workforce planning.', 'Great teams are built one thoughtful hire at a time, and every candidate deserves a clear, respectful process.', 2, '2026-11-14T16:07:36.926449+00:00'),
  ('390afd6d-7a0a-4ede-b2e7-cc7a5dd0c847', 'Zofia Kwiatkowska', 'Lead Full-Stack Engineer', 'zofiakwiatkowska@solvimere.com', '/images/avatars/m4.jpg', 1, '', 'Technical Achievements', 'Led end-to-end development initiatives connecting intuitive web interfaces with scalable backend services, establishing reusable patterns for faster product development.', 'Technical Expertise', 'React, Next.js, Node.js, TypeScript, PostgreSQL, and full-stack application architecture.', 'The best software feels simple to the user, even when the engineering behind it is anything but.', 3, '2026-11-14T16:07:36.927025+00:00'),
  ('edd0890d-1c6f-497d-87a0-4ff8e6e3d098', 'Brecken Halstead', 'Senior Software Architect', 'breckenhalstead@solvimere.com', 'https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/team/e90d8208-9f8c-4800-8369-97dfaa7e5b1f-avatar.jpg?v=1792873563770', 1, '', 'Technical Achievements', 'Designed modular software architectures that simplify complex system integrations and support evolving business requirements without compromising maintainability.', 'Technical Expertise', 'Distributed systems, domain-driven design, PostgreSQL, REST APIs, microservices, and enterprise application architecture.', 'The most elegant architecture is the one that makes tomorrow''s challenges easier to solve.', 4, '2026-11-14T16:07:36.922093+00:00'),
  ('39191840-e399-4a3f-b1b4-5444746f1e61', 'Ali Abbas', 'Senior Software Engineer', 'ali@solvimere.com', 'https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/team/b34e848f-a3dc-4e57-94ac-4a7d683643f6-avatar.jpg?v=1794672126372', 1, '', 'Technical Achievements', 'Turns complex ideas into dependable products, with the judgment to know what to build, what to simplify, and why.', 'Technical Expertise', 'Designing scalable systems, modernizing legacy platforms, resolving performance bottlenecks, and guiding critical technical decisions.', 'The best engineering decisions make life easier for both the people using the software and the team maintaining it.', 5, '2026-11-14T16:07:36.925974+00:00'),
  ('25ab63c5-e172-4378-9545-a75f8918c0dd', 'Ryan Bennett', 'Senior Backend Developer', '', 'https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/team/e39c6962-3942-4c33-9960-80727044fc31-avatar.jpg?v=1792874225859', 1, '', 'Technical Achievements', 'Developed secure APIs, optimized database operations, and improved application architecture to support dependable performance under increasingly complex workloads.', 'Technical Expertise', 'Node.js, Python, PostgreSQL, Redis, API security, database optimization, and backend architecture.', 'The strongest systems are often the ones users never have to think about.', 6, '2026-11-14T16:07:36.932655+00:00'),
  ('f4296a5c-ebf3-49a0-96f9-f266e0836eac', 'Ha Long', 'Senior Software Engineer', 'halong@solvimere.com', 'https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/team/e95f5b53-9646-4531-a9db-1a6f936a9380-avatar.jpg?v=1792874180140', 1, '', 'Software Development', 'Developed scalable web applications, optimized backend systems, and improved software performance through modern development practices.', 'Full-Stack Developer', 'React, Next.js, Node.js, TypeScript, Python, PostgreSQL, REST APIs, and System Architecture.', 'I build thoughtful, reliable software that solves real problems and makes life easier.', 7, '2026-11-14T16:07:36.942124+00:00'),
  ('fde7e9dc-0008-4dff-892e-729de1cb1e33', 'Sophia Grant', 'Senior Frontend Developer', 'sophiagrant@solvimere.com', 'https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/team/63d6c356-aec8-4aed-9f4f-cc05d7a54b0e-f5.jpg?v=1792251939187', 1, '', 'Technical Achievements', 'Helped establish reusable component libraries and responsive interface standards to improve consistency, accessibility, and performance across web applications.', 'Technical Expertise', 'React, Next.js, TypeScript, JavaScript, Tailwind CSS, web accessibility, and frontend performance.', 'Every detail matters because even the smallest interaction shapes how someone experiences a product.', 8, '2026-11-14T16:07:36.941327+00:00'),
  ('ac1b9bca-d284-474b-8604-e58b73d36555', 'Paul Geremy', 'Senior Software Engineer', 'paulgeremy@solvimere.com', 'https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/team/805ed3b6-1a53-4d4d-af71-fdc49ff6575a-avatar.jpg?v=1792261498691', 1, '', 'Software Development', 'Developed scalable web applications, optimized backend systems, and improved software performance through modern development practices.', 'Full-Stack Engineering', 'React, Next.js, Node.js, TypeScript, Python, PostgreSQL, REST APIs, and System Architecture.', '"Great software is built with clean code, thoughtful design, and a commitment to continuous improvement."', 9, '2026-11-14T16:07:36.949529+00:00'),
  ('e7eb7af3-c6a9-4624-a9e5-cde1d475be41', 'Anastasiia Honcharova', 'UI / UX Designer', 'anastasiiahoncharova@solvimere.com', 'https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/team/cc0b903b-86d8-4a59-98cf-dc1fce25827a-avatar.jpg?v=1792255227161', 1, '', 'Technical Achievements', 'Developed infrastructure automation and streamlined deployment workflows to reduce manual configuration, improve consistency, and support reliable application releases.', 'Technical Expertise', 'AWS, Docker, Kubernetes, Terraform, Linux, GitHub Actions, and CI/CD automation.', 'Reliable infrastructure should make innovation easier, not stand in its way.', 10, '2026-11-14T16:07:36.96088+00:00'),
  ('d72af45b-0297-4086-8a43-0757ce24f7ac', 'Lachlan Whitcombe', 'QA Automation Engineer', 'lachlanwhitcombe@solvimere.com', 'https://jditwxzvfcjhzoufamir.supabase.co/storage/v1/object/public/media/team/d7323068-1b23-40be-bcea-f10fdfe9678a-avatar.jpg?v=1792254615434', 1, '', 'Technical Achievements', 'Established automated regression testing and quality assurance workflows designed to identify critical issues earlier and support more dependable releases.', 'Technical Expertise', 'Playwright, Cypress, Selenium, API testing, automated test frameworks, and quality engineering.', 'Quality isn''t something you check at the finish line. It''s something you build into every step.', 11, '2026-11-14T16:07:36.96941+00:00');

commit;
