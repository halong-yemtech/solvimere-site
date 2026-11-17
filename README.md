# Solvimere

The Solvimere website, its admin panel, and team members' portfolios. One repository, three apps, one Supabase
project.

| App         | Folder       | Stack                                 | Dev URL                      |
| ----------- | ------------ | ------------------------------------- | ---------------------------- |
| Public site | `src/`       | Vite + React                          | http://localhost:5173        |
| Admin panel | `admin/`     | Vite + React                          | http://localhost:5174        |
| Portfolios  | `portfolio/` | Next.js + Payload CMS (under `/team`) | via the site: `/team/<name>` |

## How the pieces fit

- **Site** (`src/`): marketing pages, team page, contact form, “Send us a message” and “Book a meeting” widget.
  Reads page content and the team from Supabase with the public anon key; visitors have no accounts.
- **Admin** (`admin/`): staff sign in with Supabase. Edits pages, team, messages, appointments, staff and all
  portfolio content.
- **Portfolios** (`portfolio/`): each team member's portfolio at `/team/<name>` (e.g. `/team/halong`, the name in
  lowercase without spaces). Payload CMS stores its data in the same Supabase database (`payload` schema) and files in
  Supabase Storage (`portfolio` bucket). The admin panel manages it through `/team/api/admin`, which accepts a staff
  member's Supabase session.
- `/team` is the site's team page; everything below it (`/team/...`) is the portfolio app. Locally the site's dev
  server proxies it ([vite.config.js](vite.config.js)); in production [vercel.json](vercel.json) rewrites it.

### Data (Supabase)

| Where                      | What                                                                      |
| -------------------------- | ------------------------------------------------------------------------- |
| `public.pages`             | Editable page content (merged over defaults in `src/cms/defaults.js`)     |
| `public.team_members`      | Team page / cards                                                         |
| `public.profiles`          | Staff accounts and roles (`admin`, `editor`); first sign-up becomes admin |
| `public.contact_messages`  | Messages from the site's forms                                            |
| `public.appointments`      | Booked meetings (weekdays 9:00–17:00 New York, 30 min)                    |
| `payload.*`                | Portfolio profiles, works, résumé, media records, …                       |
| Storage `media`, `avatars` | Site images · Storage `portfolio`: portfolio media                        |

Schema changes live in [supabase/migrations](supabase/migrations) (site) and
[portfolio/cms/migrations-postgres](portfolio/cms/migrations-postgres) (portfolio, applied by Payload). Site
migrations are applied in the Supabase SQL Editor or with `bun x supabase db push`.

## Getting started

```bash
bun install && (cd admin && bun install) && (cd portfolio && bun install)

cp .env-example .env                     # site: Supabase URL + anon key
cp admin/.env.example admin/.env         # admin: same values
cp portfolio/.env.example portfolio/.env # portfolio: database, storage, secret, Supabase URL + anon key

bun run portfolio   # portfolio on :3000 (needed for /team/<name> and the admin's Portfolio pages)
bun run dev         # site on :5173
bun run admin       # admin on :5174
```

## Scripts

| Command                   | What it does                                           |
| ------------------------- | ------------------------------------------------------ |
| `bun run dev`             | Site dev server                                        |
| `bun run build`           | Site production build (`dist/`)                        |
| `bun run admin`           | Admin dev server                                       |
| `bun run build:admin`     | Admin production build (`admin/dist/`)                 |
| `bun run portfolio`       | Portfolio dev server (runs pending Payload migrations) |
| `bun run build:portfolio` | Portfolio production build                             |
| `bun run format`          | Format everything with Prettier                        |
| `bun run format:check`    | Check formatting (CI)                                  |

In `portfolio/`: `bun test tests/`, `bun run seed:team` (create draft portfolios for team members without one),
`bun run migrate:supabase` (one-time copy from the old SQLite file).

## Deployment (Vercel)

- **Site**: this repository's root. Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- **Portfolio**: a second Vercel project with Root Directory `portfolio`. Env as in
  [portfolio/.env.example](portfolio/.env.example). Update the rewrite destination in [vercel.json](vercel.json)
  if its URL changes.
- **Admin**: Root Directory `admin`. Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
  `VITE_PORTFOLIO_BASE` (e.g. `https://solvimere.com/team`) when it isn't served from the site's domain. Then
  add the admin's origin to the portfolio's `ADMIN_ORIGINS`.

## Code style

Prettier ([.prettierrc.json](.prettierrc.json)) and [.editorconfig](.editorconfig): 2 spaces, double quotes,
semicolons, 120-column lines. Run `bun run format` before committing.
