---
name: deploy-cf
description: Use when deploying to Cloudflare Pages or configuring CI/CD — build settings, env vars, domain, auto-deploy from GitHub.
---

# Deploy to Cloudflare Pages Skill

## Context

Static frontend on Cloudflare Pages. Bot on separate host (Worker/VPS/Render).

## Frontend Deploy Steps

1. Push code to GitHub `main` branch
2. Cloudflare Dashboard → Pages → "Create project" → Connect GitHub repo
3. Build config:
   - Root directory: `public`
   - Build command: none (static)
4. Environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Save → Deploy

## Auto-deploy

- Every push to `main` triggers rebuild
- PRs → preview deployment

## Bot Deploy Options

| Option | Cost | Complexity |
|--------|------|------------|
| Cloudflare Workers | Free | Medium |
| Railway free tier | Free | Low |
| Render free | Free | Low |
| VPS ($1-2/mo) | Low | Low |

## Post-Deploy Checks

- [ ] HTTPS working
- [ ] Site loads < 2s
- [ ] Realtime subscription active
- [ ] Bot responds < 1s
- [ ] RLS policies not blocking reads

## Do's / Don'ts

- DO test locally before deploy
- DO verify env vars are set in CF dashboard
- DON'T deploy with missing `SUPABASE_ANON_KEY`
- DON'T commit `.env` to repo
