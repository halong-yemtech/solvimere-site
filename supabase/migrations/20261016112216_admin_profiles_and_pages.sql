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
