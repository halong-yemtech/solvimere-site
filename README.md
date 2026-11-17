# Solvimere

The Solvimere website with team members' portfolios, and its admin panel. Two Vite + React apps, one Supabase
project.

| App         | Folder   | Dev URL               |
| ----------- | -------- | --------------------- |
| Site        | `src/`   | http://localhost:5173 |
| Admin panel | `admin/` | http://localhost:5174 |

## How the pieces fit

- **Site** (`src/`): marketing pages, team page, contact form, and the “Send us a message” / “Book a meeting”
  widget. Visitors have no accounts; the site reads and writes Supabase with the public anon key, limited by
  row-level security.
- **Portfolios** (`src/portfolio/`): each team member's portfolio at `/team/<address>` (the name in lowercase letters
  and digits, e.g. `/team/halong`) and a generated PDF CV at `/team/<address>/cv`. Loaded on demand; styled with
  Tailwind scoped to the portfolio pages (`tailwind.config.js`, `src/portfolio/portfolio.css`), so the rest of the
  site is unaffected. Data comes from `src/portfolio/lib/site.ts`.
- **Admin** (`admin/`): staff sign in with Supabase and edit pages, the team, messages, appointments, staff, and
  everything in the portfolios (profiles, works, résumé, media, guest book, settings). Portfolio forms are generated
  from `admin/src/portfolio/schemas.json`.

### Data (Supabase)

| Where                        | What                                                                      |
| ---------------------------- | ------------------------------------------------------------------------- |
| `public.pages`               | Editable page content (merged over defaults in `src/cms/defaults.js`)     |
| `public.team_members`        | Team page / cards                                                         |
| `public.profiles`            | Staff accounts and roles (`admin`, `editor`); first sign-up becomes admin |
| `public.contact_messages`    | Messages from every contact form, including portfolios                    |
| `public.appointments`        | Booked meetings (weekdays 9:00–17:00 New York, 30 min)                    |
| `public.portfolio_profiles`  | One portfolio per member: address, visibility, content (JSON)             |
| `public.portfolio_items`     | Works, résumé entries, services, testimonials, … per portfolio            |
| `public.portfolio_media`     | Portfolio files (public Storage bucket `portfolio`)                       |
| `public.portfolio_settings`  | Sections shown, theme, maintenance mode                                   |
| `public.portfolio_guestbook` | Guest-book comments                                                       |
| Storage `media`, `avatars`   | Site images                                                               |

Schema changes live in [supabase/migrations](supabase/migrations); apply them in the Supabase SQL Editor or with
`bun x supabase db push`.

## Getting started

```bash
bun install && (cd admin && bun install)

cp .env-example .env               # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
cp admin/.env.example admin/.env   # same values, plus VITE_SITE_URL in production

bun run dev     # site on :5173
bun run admin   # admin on :5174
```

## Scripts

| Command                | What it does                               |
| ---------------------- | ------------------------------------------ |
| `bun run dev`          | Site dev server                            |
| `bun run build`        | Site production build (`dist/`)            |
| `bun run typecheck`    | Type-check the portfolio code (TypeScript) |
| `bun run admin`        | Admin dev server                           |
| `bun run build:admin`  | Admin production build (`admin/dist/`)     |
| `bun run format`       | Format everything with Prettier            |
| `bun run format:check` | Check formatting (CI)                      |

## Deployment (Vercel)

- **Site**: this repository's root. Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. `vercel.json` serves the app
  for every path, including `/team/<address>`.
- **Admin**: Root Directory `admin`. Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL` (the site's
  address, for “View” links).

## Code style

Prettier ([.prettierrc.json](.prettierrc.json)) and [.editorconfig](.editorconfig): 2 spaces, double quotes,
semicolons, 120-column lines. Run `bun run format` before committing.
