# Agents Configuration — Site-Vizitka

## Project Overview

Односторінковий сайт-візитка з Telegram ботом для управління кнопками.
- **Frontend**: Static HTML/CSS/JS на Cloudflare Pages
- **Backend/DB**: Supabase (PostgreSQL + Realtime)
- **Bot**: Telegram Bot → Supabase REST API
- **Realtime**: Supabase channels for live updates

## Coding Standards

### JavaScript
- ES2022+, `const`/`let`, no `var`
- Arrow functions for callbacks
- Optional chaining `?.`, nullish coalescing `??`
- Async/await, no raw promises chains
- JSDoc for all public functions
- No global variables — wrap in IIFE or modules

### HTML
- Semantic tags (`<header>`, `<main>`, `<section>`, `<footer>`)
- ARIA labels for accessibility
- `lang="uk"` on `<html>`
- Meta viewport, charset UTF-8

### CSS
- Mobile-first, BEM naming
- CSS custom properties for colors/spacing
- No inline styles
- `prefers-reduced-motion` respect

### Environment & Secrets
- `.env` for all secrets — never commit
- `.env.example` with placeholder values in repo
- Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `BOT_TOKEN`, `SITE_URL`
- Service role key only in bot, never frontend

## Architecture Rules

- Frontend reads only via Supabase anon key (public)
- Bot writes via Supabase service role key (admin)
- No direct DB access from frontend except RLS-safe reads
- All button mutations go through bot or RLS-compliant functions
- Realtime channel: `postgres_changes` on `buttons` table

## File Conventions

```
site/
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js          # main entry, IIFE or module
├── bot/
│   ├── index.js            # bot entry
│   ├── services/           # business logic
│   ├── handlers/           # command handlers
│   └── .env                # secrets (gitignored)
├── supabase/
│   └── migrations/
│       └── 001_init.sql
└── .env.example
```

## Git & Commits

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Branch naming: `feature/<desc>`, `fix/<desc>`, `main`
- No secrets in commits — use `.env.example` template

## Testing

- Bot: manual test via Telegram before deploy
- Frontend: Lighthouse audit (perf, a11y, SEO ≥ 90)
- Validate RLS policies in Supabase dashboard

## Deployment

- Cloudflare Pages: auto-deploy from `main` branch on push
- Bot: deploy after frontend is live
- Post-deploy: verify realtime subscription works end-to-end

## Do's & Don'ts

- DO use Supabase client SDK, not raw fetch
- DO handle errors gracefully (empty state, network fail)
- DO optimize images (WebP, lazy load)
- DON'T store tokens in client-side code
- DON'T disable RLS on public tables
- DON'T use `alert()` — use custom UI notifications
