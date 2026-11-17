import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`blog_posts_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_badges_order_idx\` ON \`blog_posts_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_badges_parent_id_idx\` ON \`blog_posts_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_stats_order_idx\` ON \`blog_posts_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_stats_parent_id_idx\` ON \`blog_posts_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_order_idx\` ON \`blog_posts_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_parent_id_idx\` ON \`blog_posts_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`platform\` text DEFAULT 'other',
  	\`title\` text,
  	\`headline\` text,
  	\`location\` text,
  	\`body\` text,
  	\`url\` text,
  	\`button_label\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts__order_idx\` ON \`blog_posts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_updated_at_idx\` ON \`blog_posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_created_at_idx\` ON \`blog_posts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts__status_idx\` ON \`blog_posts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_rels_order_idx\` ON \`blog_posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_rels_parent_idx\` ON \`blog_posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_rels_path_idx\` ON \`blog_posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_rels_profiles_id_idx\` ON \`blog_posts_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_version_badges\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_badges_order_idx\` ON \`_blog_posts_v_version_badges\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_badges_parent_id_idx\` ON \`_blog_posts_v_version_badges\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_version_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_stats_order_idx\` ON \`_blog_posts_v_version_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_stats_parent_id_idx\` ON \`_blog_posts_v_version_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_version_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_tags_order_idx\` ON \`_blog_posts_v_version_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_tags_parent_id_idx\` ON \`_blog_posts_v_version_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_platform\` text DEFAULT 'other',
  	\`version_title\` text,
  	\`version_headline\` text,
  	\`version_location\` text,
  	\`version_body\` text,
  	\`version_url\` text,
  	\`version_button_label\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_parent_idx\` ON \`_blog_posts_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_version__order_idx\` ON \`_blog_posts_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_version_updated_at_idx\` ON \`_blog_posts_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_version_created_at_idx\` ON \`_blog_posts_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_version__status_idx\` ON \`_blog_posts_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_created_at_idx\` ON \`_blog_posts_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_updated_at_idx\` ON \`_blog_posts_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_latest_idx\` ON \`_blog_posts_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_rels_order_idx\` ON \`_blog_posts_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_rels_parent_idx\` ON \`_blog_posts_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_rels_path_idx\` ON \`_blog_posts_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_rels_profiles_id_idx\` ON \`_blog_posts_v_rels\` (\`profiles_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`blog_posts_id\` integer REFERENCES blog_posts(id) ON DELETE cascade;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blog_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`blog_posts_id\`);`)
  await seedStarterPosts(db)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`blog_posts_badges\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_stats\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_tags\`;`)
  await db.run(sql`DROP TABLE \`blog_posts\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_rels\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_version_badges\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_version_stats\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_version_tags\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`contact_messages_id\` integer,
  	\`guestbook_entries_id\` integer,
  	\`profiles_id\` integer,
  	\`social_links_id\` integer,
  	\`services_id\` integer,
  	\`pricing_plans_id\` integer,
  	\`clients_id\` integer,
  	\`testimonials_id\` integer,
  	\`facts_id\` integer,
  	\`statistics_id\` integer,
  	\`resume_entries_id\` integer,
  	\`works_id\` integer,
  	\`work_categories_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_messages_id\`) REFERENCES \`contact_messages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`guestbook_entries_id\`) REFERENCES \`guestbook_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`social_links_id\`) REFERENCES \`social_links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pricing_plans_id\`) REFERENCES \`pricing_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`clients_id\`) REFERENCES \`clients\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`facts_id\`) REFERENCES \`facts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`statistics_id\`) REFERENCES \`statistics\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`resume_entries_id\`) REFERENCES \`resume_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`works_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`work_categories_id\`) REFERENCES \`work_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "contact_messages_id", "guestbook_entries_id", "profiles_id", "social_links_id", "services_id", "pricing_plans_id", "clients_id", "testimonials_id", "facts_id", "statistics_id", "resume_entries_id", "works_id", "work_categories_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "contact_messages_id", "guestbook_entries_id", "profiles_id", "social_links_id", "services_id", "pricing_plans_id", "clients_id", "testimonials_id", "facts_id", "statistics_id", "resume_entries_id", "works_id", "work_categories_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_messages_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_messages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_guestbook_entries_id_idx\` ON \`payload_locked_documents_rels\` (\`guestbook_entries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_profiles_id_idx\` ON \`payload_locked_documents_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_social_links_id_idx\` ON \`payload_locked_documents_rels\` (\`social_links_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pricing_plans_id_idx\` ON \`payload_locked_documents_rels\` (\`pricing_plans_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_clients_id_idx\` ON \`payload_locked_documents_rels\` (\`clients_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_facts_id_idx\` ON \`payload_locked_documents_rels\` (\`facts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_statistics_id_idx\` ON \`payload_locked_documents_rels\` (\`statistics_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_resume_entries_id_idx\` ON \`payload_locked_documents_rels\` (\`resume_entries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_works_id_idx\` ON \`payload_locked_documents_rels\` (\`works_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_work_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`work_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
}

// ── Starter posts ────────────────────────────────────────────
// Plain SQL on purpose: migrations must not depend on the current Payload schema.
// They are only added for the "Ali Abbas" profile (and only linked to it), so
// other profiles' Blog sections stay unchanged. Baseline versions are created on
// start-up by cms/hooks/ensureVersions.ts.

type StarterPost = {
  platform: string
  title: string
  headline: string
  location: string
  url: string
  buttonLabel: string
  badges: string[]
  stats: [string, string][]
  tags: string[]
  body: string
}

const STARTER_POSTS: StarterPost[] = [
  {
    platform: 'upwork',
    title: 'Over on Upwork: AI agents, RAG & full-stack builds',
    headline: 'Senior AI Engineer | AI Agents & RAG in Production SaaS',
    location: 'Ottawa, Canada',
    url: 'https://www.upwork.com/freelancers/~01be3a028688e1fee8',
    buttonLabel: 'Hire me on Upwork',
    badges: ['100% Job Success', 'Top Rated Plus', 'Open for work', 'ID verified'],
    stats: [
      ['$100K+', 'earned'],
      ['36', 'jobs done'],
      ['4,122', 'hours logged'],
      ['$50/hr', 'rate'],
    ],
    tags: ['AI agents', 'RAG', 'OpenAI & Claude APIs', 'Node.js / NestJS', 'React / Next.js', 'PostgreSQL', 'Stripe Connect', 'AWS'],
    body: `Quick version: I'm a full-stack engineer who ships AI features into real, paying SaaS products, not just demos. Before freelancing full time I worked at **American Airlines** (Senior AI Engineer), **Ericsson Canada** (Senior Software Engineer) and **Strava**.

A favourite project: I came in as the *only* engineer on a half-broken advertising platform and turned it into a live product. That meant a NestJS backend, a multi-tenant Postgres schema, Stripe Connect payouts between advertisers and publishers, a real-time bidding pipeline, a React frontend and the whole AWS setup, with zero-downtime migrations along the way.

Another one I'm proud of: a V1 booking platform for a luxury vacation-rental business, built from scratch with Next.js, Express and MongoDB. The client summed it up nicely: *"Ali delivered our V1 website… functional and live."* ⭐⭐⭐⭐⭐

These days I mostly wire OpenAI and Claude into production apps: agents, retrieval (RAG) and all the not-so-glamorous plumbing that makes them reliable. I'm available full time right now, usually reply within a few hours, and can put in 30+ hours a week. If you've got something in mind, come say hi 👋`,
  },
  {
    platform: 'github',
    title: "What I'm tinkering with on GitHub",
    headline: '@aliabbas12 · FullStack Developer',
    location: 'Ottawa, Canada',
    url: 'https://github.com/aliabbas12',
    buttonLabel: 'Peek at my GitHub',
    badges: ['On GitHub since 2017', '3 achievements'],
    stats: [
      ['259', 'contributions last year'],
      ['7', 'public repos'],
      ['3.5K', 'profile views'],
    ],
    tags: [
      'TypeScript', 'JavaScript', 'React', 'Next.js', 'Angular', 'Vue', 'Ionic', 'Flutter', 'Node.js', 'Laravel', 'PHP',
      'Python', 'Java', 'Swift', 'Android', 'Tailwind', 'Bootstrap', 'Sass', 'Material UI', 'GraphQL', 'PostgreSQL',
      'MySQL', 'MongoDB', 'Firebase', 'AWS', 'Azure', 'Docker', 'Git', 'GitLab', 'Bitbucket', 'Jira', 'Figma', 'Salesforce',
    ],
    body: `Hey, I'm Ali 👋 My GitHub README sums me up pretty well, so here's the gist:

- 👨‍💻 I work as a **Frontend / FullStack engineer**.
- 💭 I love bringing ideas to reality.
- 🏆 I've worked on high-achieving products like **Strava** and **DeerCast**.
- 🔍 I'm always picking up new tech, and lately that means **AI & ML**.
- 📫 The easiest way to reach me is email.

The README also has a big grid of the frameworks, languages and tools I reach for. It's a long list (below), from Angular and Flutter all the way to Docker and AWS. Pop in to see what I've been poking at lately.`,
  },
  {
    platform: 'linkedin',
    title: 'The LinkedIn version (a bit more buttoned-up)',
    headline: 'Full-stack software developer & tester',
    location: 'Nepean, Ontario, Canada',
    url: 'https://ca.linkedin.com/in/ali-abbas-dev',
    buttonLabel: 'Connect on LinkedIn',
    badges: ['Five Pack', 'Carleton University'],
    stats: [
      ['500+', 'connections'],
      ['968', 'followers'],
    ],
    tags: [
      'Web Design', 'Web Development', 'Software Testing', 'SaaS Development', 'Database Development',
      'Application Development', 'User Experience Design (UED)', 'Mobile Application Development',
    ],
    body: `LinkedIn is where the slightly more formal version of me lives. The short version of my About section: I'm a seasoned **full-stack software developer *and* tester**, so I care just as much about whether something actually works as whether it ships on time.

You'll find **Five Pack** and **Carleton University** up top, plus the services I offer, from web and SaaS development to UX design, testing and mobile apps.

Hiring, want to compare notes, or just like to connect with other builders? Send a request. I'm friendly, promise 🙂`,
  },
]

async function seedStarterPosts(db: MigrateUpArgs['db']) {
  const profile = (await db.all(
    sql`SELECT id FROM profiles WHERE lower(name) = 'ali abbas' OR slug = 'ali-abbas' ORDER BY id LIMIT 1`,
  )) as { id: number }[]
  const profileId = profile[0]?.id
  if (!profileId) return

  const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 24)
  for (const [i, p] of STARTER_POSTS.entries()) {
    const rows = (await db.all(sql`
      INSERT INTO blog_posts (_order, platform, title, headline, location, body, url, button_label, _status)
      VALUES (${'a' + i}, ${p.platform}, ${p.title}, ${p.headline}, ${p.location}, ${p.body}, ${p.url}, ${p.buttonLabel}, 'published')
      RETURNING id`)) as { id: number }[]
    const id = rows[0].id
    for (const [o, label] of p.badges.entries()) {
      await db.run(sql`INSERT INTO blog_posts_badges (_order, _parent_id, id, label) VALUES (${o + 1}, ${id}, ${uid()}, ${label})`)
    }
    for (const [o, [value, label]] of p.stats.entries()) {
      await db.run(sql`INSERT INTO blog_posts_stats (_order, _parent_id, id, value, label) VALUES (${o + 1}, ${id}, ${uid()}, ${value}, ${label})`)
    }
    for (const [o, tag] of p.tags.entries()) {
      await db.run(sql`INSERT INTO blog_posts_tags (_order, _parent_id, id, tag) VALUES (${o + 1}, ${id}, ${uid()}, ${tag})`)
    }
    await db.run(sql`INSERT INTO blog_posts_rels ("order", parent_id, path, profiles_id) VALUES (1, ${id}, 'profiles', ${profileId})`)
  }
}
