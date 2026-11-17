# Solvimere portfolios

Team members' portfolio sites, served by the Solvimere site at `/team/<name>` (Next.js `basePath: "/team"`). See the
[root README](../README.md) for how this app fits with the site and the admin panel.

- **Content**: Payload CMS. Data in Supabase Postgres (`payload` schema, `DATABASE_URI`), files in Supabase Storage
  (`portfolio` bucket, `SUPABASE_S3_*`).
- **Editing**: the Solvimere admin panel (Portfolio section) through [app/api/admin/route.ts](app/api/admin/route.ts),
  which checks the staff member's Supabase session ([lib/adminBridge.ts](lib/adminBridge.ts)) and runs the editing
  operations in [lib/edit/actions.ts](lib/edit/actions.ts) / [lib/dashboard/actions.ts](lib/dashboard/actions.ts).
- **Profile URLs**: a profile's slug is the member's name in lowercase letters and digits (`Ha Long` → `halong`);
  `ha-long` style slugs also resolve. See [lib/basePath.ts](lib/basePath.ts).
- **Draft previews**: signed 30-minute links (`?preview=…`) issued to staff ([lib/preview.ts](lib/preview.ts)).
- **CV**: `/team/cv/<slug>` renders a PDF from the profile ([lib/cv](lib/cv)).

## Develop

```bash
cp .env.example .env   # fill in DATABASE_URI, SUPABASE_S3_*, PAYLOAD_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY
bun install
bun run dev            # applies pending migrations, then http://localhost:3000/team/<slug>
```

Open portfolios through the site (`http://localhost:5173/team/<slug>`), which proxies `/team/*` here.

| Command                    | What it does                                                       |
| -------------------------- | ------------------------------------------------------------------ |
| `bun run dev`              | Migrate + dev server                                               |
| `bun run build`            | Production build                                                   |
| `bun test tests/`          | Unit tests                                                         |
| `bun run migrate:create`   | New Payload migration after changing collections (`cms/`)          |
| `bun run generate:types`   | Regenerate `payload-types.ts`                                      |
| `bun run seed:team`        | Draft profiles for team members who don't have one (from Supabase) |
| `bun run migrate:supabase` | One-time copy of the old local SQLite data into Supabase           |
