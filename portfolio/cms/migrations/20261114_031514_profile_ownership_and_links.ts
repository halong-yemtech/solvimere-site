import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * One owner per item + one place per link.
 *
 * - Every list item gets a single owning profile (`profile_id`). Items that were
 *   shared by several profiles go to the first one and are COPIED to the others,
 *   so nothing disappears from any profile.
 * - Social links become the profile's "Links & accounts" (`profiles_links`), and
 *   every other stored URL (hire button, blog button, pricing "order now", stats
 *   cards, blog posts) becomes a reference to one of those accounts.
 * - Clients that were really just accounts (same URL) are removed.
 *
 * Plain SQL only (migrations must not depend on the current Payload schema).
 * Phase 1 only ADDs, phase 2 converts data, phase 3 drops the old columns/tables.
 * Anything that couldn't be mapped 1:1 is logged as a migration report.
 */

type Row = Record<string, unknown>
type Acc = { platform: string; url: string; label: string; icon: string | null; color: string | null; info: string | null; show: boolean }

// Frozen copy of the platform table (lib/profileLinks.ts may change later).
const PLATFORMS: [key: string, icon: string, hosts: string[]][] = [
  ['upwork', 'SiUpwork', ['upwork.com']],
  ['github', 'FaGithub', ['github.com']],
  ['linkedin', 'FaLinkedin', ['linkedin.com']],
  ['whatsapp', 'FaWhatsapp', ['wa.me', 'whatsapp.com']],
  ['fiverr', 'SiFiverr', ['fiverr.com']],
  ['x', 'FaTwitter', ['x.com', 'twitter.com']],
  ['facebook', 'FaFacebook', ['facebook.com', 'fb.com']],
  ['instagram', 'FaInstagram', ['instagram.com']],
  ['youtube', 'FaYoutube', ['youtube.com', 'youtu.be']],
  ['telegram', 'FaTelegram', ['t.me', 'telegram.me']],
  ['medium', 'FaMedium', ['medium.com']],
  ['stackoverflow', 'FaStackOverflow', ['stackoverflow.com']],
  ['devto', 'FaDev', ['dev.to']],
]

function guessPlatform(url: unknown, icon?: unknown): string {
  let host = ''
  try {
    host = new URL(String(url ?? '')).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    /* not a URL */
  }
  const byHost = host ? PLATFORMS.find(([, , hosts]) => hosts.some((h) => host === h || host.endsWith(`.${h}`))) : undefined
  if (byHost) return byHost[0]
  const byIcon = icon ? PLATFORMS.find(([, i]) => i === icon) : undefined
  if (byIcon) return byIcon[0]
  return /^https?:\/\//.test(String(url ?? '')) ? 'website' : 'other'
}

const norm = (u: unknown) =>
  String(u ?? '')
    .replace(/[​-‏‪-‮⁦-⁩﻿]/g, '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')
const sameUrl = (a: unknown, b: unknown) => norm(a) !== '' && norm(a) === norm(b)
const hex = () => crypto.randomUUID().replace(/-/g, '').slice(0, 24)
const q = (v: unknown) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`)

// Categories first, so copied works can point at the copied categories.
const CONTENT = ['work_categories', 'services', 'pricing_plans', 'clients', 'testimonials', 'facts', 'statistics', 'resume_entries', 'works', 'blog_posts']

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const all = async (s: string) => (await db.all(sql.raw(s))) as Row[]
  const run = (s: string) => db.run(sql.raw(s))
  const report: string[] = []
  const tableExists = async (t: string) => (await all(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=${q(t)}`)).length > 0
  const columns = async (t: string) => (await all(`PRAGMA table_info("${t}")`)).map((r) => String(r.name))

  // Locks are transient; clearing them lets the lock table be rebuilt safely.
  await run(`DELETE FROM payload_locked_documents_rels`)
  await run(`DELETE FROM payload_locked_documents`)

  // ── 1. Read what the old schema says ──────────────────────
  const profiles = (await all(`SELECT id FROM profiles ORDER BY _order, id`)).map((r) => Number(r.id))
  const relsOf = (t: string) => (t === 'works' ? 'works_rels' : `${t}_rels`)

  /** item id → profiles that showed it (restricted list, or all profiles when shared). */
  const visibleOn = async (t: string) => {
    const out = new Map<number, number[]>()
    const ids = (await all(`SELECT id FROM "${t}" ORDER BY id`)).map((r) => Number(r.id))
    const rels = (await tableExists(relsOf(t)))
      ? await all(`SELECT parent_id, profiles_id FROM "${relsOf(t)}" WHERE path = 'profiles' AND profiles_id IS NOT NULL ORDER BY "order", id`)
      : []
    for (const id of ids) {
      const listed = rels.filter((r) => Number(r.parent_id) === id).map((r) => Number(r.profiles_id)).filter((p) => profiles.includes(p))
      out.set(id, listed.length ? [...new Set(listed)] : [...profiles])
    }
    return out
  }

  const social = (await tableExists('social_links'))
    ? await all(`SELECT id, label, url, icon, color, info FROM social_links ORDER BY _order, id`)
    : []
  const socialVis = social.length ? await visibleOn('social_links') : new Map<number, number[]>()
  const oldProfiles = await all(`SELECT id, hire_link_url, hire_link_icon, phone_link, blog_button_url FROM profiles`)
  const oldProfileVersions = await all(`SELECT id, parent_id, version_hire_link_url, version_hire_link_icon, version_blog_button_url FROM _profiles_v`)
  const vis: Record<string, Map<number, number[]>> = {}
  for (const t of CONTENT) vis[t] = await visibleOn(t)

  // ── 2. Add the new schema ─────────────────────────────────
  await db.run(sql`CREATE TABLE \`profiles_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`platform\` text DEFAULT 'website',
  	\`url\` text,
  	\`label\` text,
  	\`info\` text,
  	\`show_in_icons\` integer DEFAULT true,
  	\`icon\` text,
  	\`color\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`profiles_links_order_idx\` ON \`profiles_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`profiles_links_parent_id_idx\` ON \`profiles_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_profiles_v_version_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`platform\` text DEFAULT 'website',
  	\`url\` text,
  	\`label\` text,
  	\`info\` text,
  	\`show_in_icons\` integer DEFAULT true,
  	\`icon\` text,
  	\`color\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profiles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_links_order_idx\` ON \`_profiles_v_version_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_links_parent_id_idx\` ON \`_profiles_v_version_links\` (\`_parent_id\`);`)
  await db.run(sql`DROP INDEX \`work_categories_name_idx\`;`)
  await db.run(sql`ALTER TABLE \`work_categories\` ADD \`profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`work_categories_profile_idx\` ON \`work_categories\` (\`profile_id\`);`)
  await db.run(sql`DROP INDEX \`_work_categories_v_version_version_name_idx\`;`)
  await db.run(sql`ALTER TABLE \`_work_categories_v\` ADD \`version_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_version_version_profile_idx\` ON \`_work_categories_v\` (\`version_profile_id\`);`)
  await db.run(sql`ALTER TABLE \`profiles\` ADD \`hire_link_account\` text;`)
  await db.run(sql`ALTER TABLE \`profiles\` ADD \`blog_account\` text;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` ADD \`version_hire_link_account\` text;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` ADD \`version_blog_account\` text;`)
  await db.run(sql`ALTER TABLE \`services\` ADD \`profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`services_profile_idx\` ON \`services\` (\`profile_id\`);`)
  await db.run(sql`ALTER TABLE \`_services_v\` ADD \`version_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_services_v_version_version_profile_idx\` ON \`_services_v\` (\`version_profile_id\`);`)
  await db.run(sql`ALTER TABLE \`pricing_plans\` ADD \`order_link_account\` text;`)
  await db.run(sql`ALTER TABLE \`pricing_plans\` ADD \`order_link_custom_url\` text;`)
  await db.run(sql`ALTER TABLE \`pricing_plans\` ADD \`profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`pricing_plans_profile_idx\` ON \`pricing_plans\` (\`profile_id\`);`)
  await db.run(sql`ALTER TABLE \`_pricing_plans_v\` ADD \`version_order_link_account\` text;`)
  await db.run(sql`ALTER TABLE \`_pricing_plans_v\` ADD \`version_order_link_custom_url\` text;`)
  await db.run(sql`ALTER TABLE \`_pricing_plans_v\` ADD \`version_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_version_version_profile_idx\` ON \`_pricing_plans_v\` (\`version_profile_id\`);`)
  await db.run(sql`ALTER TABLE \`clients\` ADD \`profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`clients_profile_idx\` ON \`clients\` (\`profile_id\`);`)
  await db.run(sql`ALTER TABLE \`_clients_v\` ADD \`version_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_clients_v_version_version_profile_idx\` ON \`_clients_v\` (\`version_profile_id\`);`)
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`testimonials_profile_idx\` ON \`testimonials\` (\`profile_id\`);`)
  await db.run(sql`ALTER TABLE \`_testimonials_v\` ADD \`version_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_version_version_profile_idx\` ON \`_testimonials_v\` (\`version_profile_id\`);`)
  await db.run(sql`ALTER TABLE \`facts\` ADD \`profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`facts_profile_idx\` ON \`facts\` (\`profile_id\`);`)
  await db.run(sql`ALTER TABLE \`_facts_v\` ADD \`version_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_facts_v_version_version_profile_idx\` ON \`_facts_v\` (\`version_profile_id\`);`)
  await db.run(sql`ALTER TABLE \`statistics\` ADD \`link_account\` text;`)
  await db.run(sql`ALTER TABLE \`statistics\` ADD \`link_custom_url\` text;`)
  await db.run(sql`ALTER TABLE \`statistics\` ADD \`profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`statistics_profile_idx\` ON \`statistics\` (\`profile_id\`);`)
  await db.run(sql`ALTER TABLE \`_statistics_v\` ADD \`version_link_account\` text;`)
  await db.run(sql`ALTER TABLE \`_statistics_v\` ADD \`version_link_custom_url\` text;`)
  await db.run(sql`ALTER TABLE \`_statistics_v\` ADD \`version_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_statistics_v_version_version_profile_idx\` ON \`_statistics_v\` (\`version_profile_id\`);`)
  await db.run(sql`ALTER TABLE \`blog_posts\` ADD \`profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`blog_posts_profile_idx\` ON \`blog_posts\` (\`profile_id\`);`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` ADD \`version_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_version_profile_idx\` ON \`_blog_posts_v\` (\`version_profile_id\`);`)
  await db.run(sql`ALTER TABLE \`resume_entries\` ADD \`profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`resume_entries_profile_idx\` ON \`resume_entries\` (\`profile_id\`);`)
  await db.run(sql`ALTER TABLE \`_resume_entries_v\` ADD \`version_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_version_version_profile_idx\` ON \`_resume_entries_v\` (\`version_profile_id\`);`)
  await db.run(sql`ALTER TABLE \`works\` ADD \`profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`works_profile_idx\` ON \`works\` (\`profile_id\`);`)
  await db.run(sql`ALTER TABLE \`_works_v\` ADD \`version_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_works_v_version_version_profile_idx\` ON \`_works_v\` (\`version_profile_id\`);`)
  // ── 3. Ownership: one owner per item, copies for the other profiles ──
  const children = async (t: string) => {
    const names = (await all(`SELECT name FROM sqlite_master WHERE type='table'`)).map((r) => String(r.name))
    const out: string[] = []
    for (const n of names) {
      if (!n.startsWith(`${t}_`) || n.endsWith('_rels') || n === `${t}_v`) continue
      if ((await columns(n)).includes('_parent_id')) out.push(n)
    }
    return out
  }
  const categoryCopies = new Map<number, Map<number, number>>() // profile → old category id → its copy

  async function copyRow(t: string, id: number, profileId: number): Promise<number> {
    const cols = (await columns(t)).filter((c) => c !== 'id')
    const select = cols.map((c) => (c === 'profile_id' ? String(profileId) : `"${c}"`)).join(', ')
    const [created] = await all(`INSERT INTO "${t}" (${cols.map((c) => `"${c}"`).join(', ')}) SELECT ${select} FROM "${t}" WHERE id = ${id} RETURNING id`)
    const newId = Number(created.id)
    for (const child of await children(t)) {
      const ccols = (await columns(child)).filter((c) => c !== 'id' && c !== '_parent_id')
      for (const r of await all(`SELECT id FROM "${child}" WHERE _parent_id = ${id}`)) {
        await run(`INSERT INTO "${child}" (id, _parent_id, ${ccols.map((c) => `"${c}"`).join(', ')}) SELECT ${q(hex())}, ${newId}, ${ccols.map((c) => `"${c}"`).join(', ')} FROM "${child}" WHERE id = ${q(r.id)}`)
      }
    }
    if (t === 'works') {
      for (const r of await all(`SELECT "order", path, media_id, work_categories_id FROM works_rels WHERE parent_id = ${id} AND path <> 'profiles'`)) {
        let cat = r.work_categories_id == null ? null : Number(r.work_categories_id)
        if (cat !== null) {
          // Same profile → keep; otherwise use that profile's copy of the category (if it has one).
          const owner = (await all(`SELECT profile_id FROM work_categories WHERE id = ${cat}`))[0]?.profile_id
          if (Number(owner) !== profileId) cat = categoryCopies.get(profileId)?.get(cat) ?? null
          if (cat === null) continue
        }
        await run(`INSERT INTO works_rels ("order", parent_id, path, media_id, work_categories_id) VALUES (${q(r.order)}, ${newId}, ${q(r.path)}, ${q(r.media_id)}, ${q(cat)})`)
      }
    }
    return newId
  }

  let copies = 0
  for (const t of CONTENT) {
    for (const [id, pids] of vis[t]) {
      const [owner, ...others] = pids
      if (owner === undefined) continue // no profiles at all
      await run(`UPDATE "${t}" SET profile_id = ${owner} WHERE id = ${id}`)
      await run(`UPDATE "_${t}_v" SET version_profile_id = ${owner} WHERE parent_id = ${id}`)
      for (const p of others) {
        const newId = await copyRow(t, id, p)
        copies++
        if (t === 'work_categories') {
          if (!categoryCopies.has(p)) categoryCopies.set(p, new Map())
          categoryCopies.get(p)!.set(id, newId)
        }
      }
    }
  }
  if (copies) report.push(`${copies} shared item(s) were copied so that each profile owns its own.`)

  // ── 4. Links & accounts ───────────────────────────────────
  const accounts = new Map<number, Acc[]>(profiles.map((p) => [p, []]))
  const findAcc = (p: number, platform: string) => accounts.get(p)?.find((a) => a.platform === platform)

  for (const s of social) {
    for (const p of socialVis.get(Number(s.id)) ?? []) {
      let platform = guessPlatform(s.url, s.icon)
      const existing = platform !== 'other' ? findAcc(p, platform) : undefined
      if (existing) {
        if (sameUrl(existing.url, s.url)) continue
        report.push(`Profile ${p}: second ${platform} link “${s.label}” (${s.url}) kept as an “Other” account.`)
        platform = 'other'
      }
      accounts.get(p)!.push({
        platform, url: String(s.url ?? ''), label: String(s.label ?? ''), icon: (s.icon as string) ?? null,
        color: (s.color as string) ?? null, info: (s.info as string) ?? null, show: true,
      })
    }
  }

  /** Turn a stored URL into a reference to one of the profile's accounts. */
  function toRef(p: number, url: unknown, what: string, opts: { icon?: unknown; create?: boolean } = {}): { account: string | null; custom: string | null } {
    const u = String(url ?? '').trim()
    if (!u) return { account: null, custom: null }
    const platform = guessPlatform(u, opts.icon)
    if (platform === 'website' || platform === 'other') {
      const same = accounts.get(p)?.find((a) => sameUrl(a.url, u) && a.platform !== 'other')
      return same ? { account: same.platform, custom: null } : { account: 'custom', custom: u }
    }
    const acc = findAcc(p, platform)
    if (acc) {
      if (!sameUrl(acc.url, u) && opts.create !== false) {
        report.push(`Profile ${p}: ${what} used ${u}, but the ${platform} account is ${acc.url}. It now uses the account.`)
      }
      return { account: platform, custom: null }
    }
    if (opts.create === false) return { account: 'custom', custom: u }
    accounts.get(p)!.push({ platform, url: u, label: '', icon: null, color: null, info: null, show: false })
    report.push(`Profile ${p}: added a ${platform} account (${u}) from ${what} — not shown as an icon.`)
    return { account: platform, custom: null }
  }

  for (const r of oldProfiles) {
    const p = Number(r.id)
    if (!accounts.has(p)) continue
    const hire = toRef(p, r.hire_link_url, 'the hire button', { icon: r.hire_link_icon })
    const blog = toRef(p, r.blog_button_url, 'the blog button')
    if (r.phone_link && guessPlatform(r.phone_link) === 'whatsapp') toRef(p, r.phone_link, 'the phone link')
    await run(`UPDATE profiles SET hire_link_account = ${q(hire.account === 'custom' ? null : hire.account)}, blog_account = ${q(blog.account === 'custom' ? null : blog.account)} WHERE id = ${p}`)
    if (hire.account === 'custom') report.push(`Profile ${p}: hire button URL ${hire.custom} isn't an account link; add it under Links & accounts and pick it again.`)
    if (blog.account === 'custom') report.push(`Profile ${p}: blog button URL ${blog.custom} isn't an account link; add it under Links & accounts and pick it again.`)
  }
  for (const r of oldProfileVersions) {
    const p = Number(r.parent_id)
    if (!accounts.has(p)) continue
    const hire = toRef(p, r.version_hire_link_url, '', { icon: r.version_hire_link_icon, create: false })
    const blog = toRef(p, r.version_blog_button_url, '', { create: false })
    await run(`UPDATE _profiles_v SET version_hire_link_account = ${q(hire.account === 'custom' ? null : hire.account)}, version_blog_account = ${q(blog.account === 'custom' ? null : blog.account)} WHERE id = ${Number(r.id)}`)
  }

  // Pricing "order now" and statistic links (rows include the copies made above).
  for (const r of await all(`SELECT id, name, profile_id, order_url FROM pricing_plans`)) {
    const ref = toRef(Number(r.profile_id), r.order_url, `pricing plan “${r.name}”`)
    await run(`UPDATE pricing_plans SET order_link_account = ${q(ref.account)}, order_link_custom_url = ${q(ref.custom)} WHERE id = ${Number(r.id)}`)
  }
  for (const r of await all(`SELECT v.id, v.version_order_url AS url, p.profile_id FROM _pricing_plans_v v JOIN pricing_plans p ON p.id = v.parent_id`)) {
    const ref = toRef(Number(r.profile_id), r.url, '', { create: false })
    await run(`UPDATE _pricing_plans_v SET version_order_link_account = ${q(ref.account)}, version_order_link_custom_url = ${q(ref.custom)} WHERE id = ${Number(r.id)}`)
  }
  for (const r of await all(`SELECT id, title, profile_id, link FROM statistics`)) {
    const ref = r.link ? toRef(Number(r.profile_id), r.link, `stats card “${r.title}”`) : { account: 'none', custom: null }
    await run(`UPDATE statistics SET link_account = ${q(ref.account)}, link_custom_url = ${q(ref.custom)} WHERE id = ${Number(r.id)}`)
  }
  for (const r of await all(`SELECT v.id, v.version_link AS url, s.profile_id FROM _statistics_v v JOIN statistics s ON s.id = v.parent_id`)) {
    const ref = r.url ? toRef(Number(r.profile_id), r.url, '', { create: false }) : { account: 'none', custom: null }
    await run(`UPDATE _statistics_v SET version_link_account = ${q(ref.account)}, version_link_custom_url = ${q(ref.custom)} WHERE id = ${Number(r.id)}`)
  }
  // Blog posts now link to the account of their platform.
  for (const r of await all(`SELECT id, title, platform, profile_id, url FROM blog_posts`)) {
    if (!r.url || r.platform === 'other') continue
    toRef(Number(r.profile_id), r.url, `blog post “${r.title}”`)
  }

  // ── 5. Clients that are really accounts ──────────────────
  // "Clients" are companies; a link to an account or a platform profile isn't one.
  const removedClients: number[] = []
  for (const r of await all(`SELECT id, name, url, profile_id FROM clients`)) {
    const p = Number(r.profile_id)
    const list = accounts.get(p) ?? []
    const platform = guessPlatform(r.url)
    const isAccount = list.some((a) => sameUrl(a.url, r.url))
    const isPlatformProfile = platform !== 'website' && platform !== 'other'
    if (!isAccount && !isPlatformProfile) continue
    if (!isAccount) {
      const acc = findAcc(p, platform)
      // Keep the URL as a hidden account: under its platform if free, else as "Other".
      list.push({ platform: acc ? 'other' : platform, url: String(r.url), label: String(r.name ?? ''), icon: null, color: null, info: null, show: false })
      report.push(`Moved client “${r.name}” of profile ${p} to Links & accounts as a hidden ${acc ? '“Other”' : platform} account (${r.url}).`)
    }
    removedClients.push(Number(r.id))
    const id = Number(r.id)
    await run(`DELETE FROM _clients_v_rels WHERE parent_id IN (SELECT id FROM _clients_v WHERE parent_id = ${id})`)
    await run(`DELETE FROM _clients_v WHERE parent_id = ${id}`)
    await run(`DELETE FROM clients_rels WHERE parent_id = ${id}`)
    await run(`DELETE FROM clients WHERE id = ${id}`)
    if (isAccount) report.push(`Removed client “${r.name}” (same link as an account of profile ${p}).`)
  }

  // Write the accounts into every profile and every saved profile version (drafts read versions).
  for (const [p, list] of accounts) {
    for (const [i, a] of list.entries()) {
      const vals = `${q(a.platform)}, ${q(a.url)}, ${q(a.label || null)}, ${q(a.info)}, ${a.show ? 1 : 0}, ${q(a.icon)}, ${q(a.color)}`
      await run(`INSERT INTO profiles_links (_order, _parent_id, id, platform, url, label, info, show_in_icons, icon, color) VALUES (${i + 1}, ${p}, ${q(hex())}, ${vals})`)
      await run(`INSERT INTO _profiles_v_version_links (_order, _parent_id, platform, url, label, info, show_in_icons, icon, color, _uuid) SELECT ${i + 1}, id, ${vals}, ${q(hex())} FROM _profiles_v WHERE parent_id = ${p}`)
    }
  }

  // ── 6. Remove the old structures ─────────────────────────
  await run(`DELETE FROM works_rels WHERE path = 'profiles'`)
  await run(`DELETE FROM _works_v_rels WHERE path = 'version.profiles'`)
  for (const t of ['_social_links_v_rels', '_social_links_v', 'social_links_rels', 'social_links']) {
    if (await tableExists(t)) await run(`DELETE FROM "${t}"`)
  }
  await db.run(sql`DROP TABLE \`_social_links_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_social_links_v\`;`)
  await db.run(sql`DROP TABLE \`social_links_rels\`;`)
  await db.run(sql`DROP TABLE \`social_links\`;`)
  await db.run(sql`DROP TABLE \`services_rels\`;`)
  await db.run(sql`DROP TABLE \`_services_v_rels\`;`)
  await db.run(sql`DROP TABLE \`pricing_plans_rels\`;`)
  await db.run(sql`DROP TABLE \`_pricing_plans_v_rels\`;`)
  await db.run(sql`DROP TABLE \`clients_rels\`;`)
  await db.run(sql`DROP TABLE \`_clients_v_rels\`;`)
  await db.run(sql`DROP TABLE \`testimonials_rels\`;`)
  await db.run(sql`DROP TABLE \`_testimonials_v_rels\`;`)
  await db.run(sql`DROP TABLE \`facts_rels\`;`)
  await db.run(sql`DROP TABLE \`_facts_v_rels\`;`)
  await db.run(sql`DROP TABLE \`statistics_rels\`;`)
  await db.run(sql`DROP TABLE \`_statistics_v_rels\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_rels\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_rels\`;`)
  await db.run(sql`DROP TABLE \`resume_entries_rels\`;`)
  await db.run(sql`DROP TABLE \`_resume_entries_v_rels\`;`)
  await db.run(sql`DROP TABLE \`work_categories_rels\`;`)
  await db.run(sql`DROP TABLE \`_work_categories_v_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_works_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	\`work_categories_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`work_categories_id\`) REFERENCES \`work_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_works_rels\`("id", "order", "parent_id", "path", "media_id", "work_categories_id") SELECT "id", "order", "parent_id", "path", "media_id", "work_categories_id" FROM \`works_rels\`;`)
  await db.run(sql`DROP TABLE \`works_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_works_rels\` RENAME TO \`works_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`works_rels_order_idx\` ON \`works_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_parent_idx\` ON \`works_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_path_idx\` ON \`works_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_media_id_idx\` ON \`works_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_work_categories_id_idx\` ON \`works_rels\` (\`work_categories_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__works_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	\`work_categories_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_works_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`work_categories_id\`) REFERENCES \`work_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__works_v_rels\`("id", "order", "parent_id", "path", "media_id", "work_categories_id") SELECT "id", "order", "parent_id", "path", "media_id", "work_categories_id" FROM \`_works_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_works_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new__works_v_rels\` RENAME TO \`_works_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_order_idx\` ON \`_works_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_parent_idx\` ON \`_works_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_path_idx\` ON \`_works_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_media_id_idx\` ON \`_works_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_work_categories_id_idx\` ON \`_works_v_rels\` (\`work_categories_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`contact_messages_id\` integer,
  	\`guestbook_entries_id\` integer,
  	\`profiles_id\` integer,
  	\`services_id\` integer,
  	\`pricing_plans_id\` integer,
  	\`clients_id\` integer,
  	\`testimonials_id\` integer,
  	\`facts_id\` integer,
  	\`statistics_id\` integer,
  	\`blog_posts_id\` integer,
  	\`resume_entries_id\` integer,
  	\`works_id\` integer,
  	\`work_categories_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_messages_id\`) REFERENCES \`contact_messages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`guestbook_entries_id\`) REFERENCES \`guestbook_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pricing_plans_id\`) REFERENCES \`pricing_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`clients_id\`) REFERENCES \`clients\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`facts_id\`) REFERENCES \`facts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`statistics_id\`) REFERENCES \`statistics\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`blog_posts_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`resume_entries_id\`) REFERENCES \`resume_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`works_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`work_categories_id\`) REFERENCES \`work_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "contact_messages_id", "guestbook_entries_id", "profiles_id", "services_id", "pricing_plans_id", "clients_id", "testimonials_id", "facts_id", "statistics_id", "blog_posts_id", "resume_entries_id", "works_id", "work_categories_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "contact_messages_id", "guestbook_entries_id", "profiles_id", "services_id", "pricing_plans_id", "clients_id", "testimonials_id", "facts_id", "statistics_id", "blog_posts_id", "resume_entries_id", "works_id", "work_categories_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_messages_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_messages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_guestbook_entries_id_idx\` ON \`payload_locked_documents_rels\` (\`guestbook_entries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_profiles_id_idx\` ON \`payload_locked_documents_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pricing_plans_id_idx\` ON \`payload_locked_documents_rels\` (\`pricing_plans_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_clients_id_idx\` ON \`payload_locked_documents_rels\` (\`clients_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_facts_id_idx\` ON \`payload_locked_documents_rels\` (\`facts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_statistics_id_idx\` ON \`payload_locked_documents_rels\` (\`statistics_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blog_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`blog_posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_resume_entries_id_idx\` ON \`payload_locked_documents_rels\` (\`resume_entries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_works_id_idx\` ON \`payload_locked_documents_rels\` (\`works_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_work_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`work_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`ALTER TABLE \`profiles\` DROP COLUMN \`hire_link_url\`;`)
  await db.run(sql`ALTER TABLE \`profiles\` DROP COLUMN \`hire_link_icon\`;`)
  await db.run(sql`ALTER TABLE \`profiles\` DROP COLUMN \`phone_link\`;`)
  await db.run(sql`ALTER TABLE \`profiles\` DROP COLUMN \`blog_button_url\`;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` DROP COLUMN \`version_hire_link_url\`;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` DROP COLUMN \`version_hire_link_icon\`;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` DROP COLUMN \`version_phone_link\`;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` DROP COLUMN \`version_blog_button_url\`;`)
  await db.run(sql`ALTER TABLE \`pricing_plans\` DROP COLUMN \`order_url\`;`)
  await db.run(sql`ALTER TABLE \`_pricing_plans_v\` DROP COLUMN \`version_order_url\`;`)
  await db.run(sql`ALTER TABLE \`statistics\` DROP COLUMN \`link\`;`)
  await db.run(sql`ALTER TABLE \`_statistics_v\` DROP COLUMN \`version_link\`;`)
  await db.run(sql`ALTER TABLE \`blog_posts\` DROP COLUMN \`location\`;`)
  await db.run(sql`ALTER TABLE \`blog_posts\` DROP COLUMN \`url\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` DROP COLUMN \`version_location\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` DROP COLUMN \`version_url\`;`)
  if (report.length) payload.logger.warn(`[migration] profile_ownership_and_links:\n  - ${report.join('\n  - ')}`)
  else payload.logger.info('[migration] profile_ownership_and_links: everything mapped 1:1.')
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Merging per-profile copies back into shared items can't be done reliably.
  // Restore the database backup taken before deploying instead.
  throw new Error('profile_ownership_and_links cannot be reverted; restore a backup.')
}
