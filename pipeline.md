# Pipeline — Site-Vizitka Development

## Stage Overview

```
□ 1. Account Setup          ← USER
□ 2. Supabase Project       ← USER
□ 3. Cloudflare Account     ← USER
□ 4. GitHub Repository      ← USER
□ 5. Telegram Bot Token     ← USER
□ 6. DB Schema + RLS        ← AGENT
□ 7. Telegram Bot Dev       ← AGENT
□ 8. Frontend Development   ← AGENT
□ 9. Local Testing          ← BOTH
□ 10. Deploy Frontend       ← AGENT
□ 11. Deploy Bot            ← AGENT
□ 12. E2E Verification      ← BOTH
□ 13. Domain + HTTPS        ← USER (optional)
```

---

## Stage 1 — Account Setup [USER]

**Action**: Create accounts
- [ ] GitHub → github.com (verify email)
- [ ] Supabase → supabase.com (sign up with GitHub)
- [ ] Cloudflare → cloudflare.com (free account)
- [ ] Telegram → @BotFather → create bot → copy token

**Deliverables**: GitHub account, Supabase project, Cloudflare account, Bot token

---

## Stage 2 — Supabase Project [USER]

**Action**: Initialize project
- [ ] Create new project in Supabase dashboard
- [ ] Note Project URL (Settings → API)
- [ ] Note anon key (Settings → API → Project API)
- [ ] Note service_role key (Settings → API → Project API, scroll)
- [ ] Save to `.env.example`

**Deliverables**: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY

---

## Stage 3 — Cloudflare Account [USER]

**Action**: Prepare hosting
- [ ] Login to Cloudflare dashboard
- [ ] Note Account ID (top-right profile → My Profile)
- [ ] Optional: add custom domain

**Deliverables**: Cloudflare account ID, Pages access ready

---

## Stage 4 — GitHub Repository [USER]

**Action**: Create repo
- [ ] New repo on GitHub (public or private)
- [ ] Push initial structure (or agent does it)

**Deliverables**: GitHub repo URL

---

## Stage 5 — Telegram Bot Token [USER]

**Action**: Get token
- [ ] Open @BotFather in Telegram
- [ ] `/newbot` → choose name → choose username
- [ ] Copy token (format: `123456:ABC-def`)
- [ ] Save to `.env.example`

**Deliverables**: BOT_TOKEN

---

## Stage 6 — DB Schema + RLS [AGENT]

**Action**: Create table and policies
- [ ] Run migration `supabase/migrations/001_buttons.sql`
- [ ] Enable Realtime on `buttons` table
- [ ] Create RLS policy: anon select only
- [ ] Verify with Supabase SQL editor

**Files**: `supabase/migrations/001_buttons.sql`

---

## Stage 7 — Telegram Bot Dev [AGENT]

**Action**: Build bot
- [ ] Initialize `bot/package.json`
- [ ] Install deps: `node-telegram-bot-api`, `@supabase/supabase-js`, `dotenv`
- [ ] Create `bot/index.js` entry
- [ ] Create `bot/handlers/add.js`, `list.js`, `edit.js`, `delete.js`
- [ ] Create `bot/services/buttons.js` (CRUD logic)
- [ ] Test all commands via Telegram

**Files**: `bot/index.js`, `bot/handlers/*.js`, `bot/services/buttons.js`

---

## Stage 8 — Frontend Development [AGENT]

**Action**: Build site
- [ ] Create `public/index.html` (semantic, accessible)
- [ ] Create `public/css/style.css` (glassmorphism, mobile-first, bg image)
- [ ] Create `public/js/app.js` (Supabase client, fetch buttons, realtime subscription)
- [ ] Test locally with `npx serve public`

**Files**: `public/index.html`, `public/css/style.css`, `public/js/app.js`

---

## Stage 9 — Local Testing [BOTH]

**Action**: Verify everything works
- [ ] User: start bot (`node bot/index.js`)
- [ ] User: test `/add`, `/list`, `/edit`, `/delete` in Telegram
- [ ] Agent: verify frontend fetches and renders buttons
- [ ] Agent: test realtime — add button via bot, site updates instantly
- [ ] Both: check mobile view, Lighthouse audit

**Checklist**: All CRUD works, realtime fires, no console errors

---

## Stage 10 — Deploy Frontend [AGENT]

**Action**: Push to Cloudflare Pages
- [ ] Connect GitHub repo to Cloudflare Pages
- [ ] Set build config (root: `public`, no build command)
- [ ] Add env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- [ ] Trigger deploy
- [ ] Verify site URL loads

**Deliverable**: Live site URL

---

## Stage 11 — Deploy Bot [AGENT]

**Action**: Deploy bot server
- [ ] Choose: Cloudflare Workers / Railway / Render / VPS
- [ ] Configure env vars: `BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- [ ] Deploy
- [ ] Verify bot responds to commands

**Deliverable**: Live bot URL/process

---

## Stage 12 — E2E Verification [BOTH]

**Action**: Full flow test
- [ ] User: add button via bot
- [ ] Verify: button appears on site instantly
- [ ] User: edit button via bot
- [ ] Verify: changes reflected on site
- [ ] User: delete button via bot
- [ ] Verify: card removed from site
- [ ] Test: mobile, desktop, slow network

**Gate**: All flows pass → project complete

---

## Stage 13 — Domain + HTTPS [USER — OPTIONAL]

**Action**: Custom domain
- [ ] Buy domain (Namecheap, Cloudflare Registrar)
- [ ] Add DNS records in Cloudflare
- [ ] Verify HTTPS auto-provisioned

**Deliverable**: Custom domain with SSL

---

## Status Tracker

| Stage | Status | Owner |
|-------|--------|-------|
| 1. Account Setup | ⬜ | USER |
| 2. Supabase Project | ⬜ | USER |
| 3. Cloudflare Account | ⬜ | USER |
| 4. GitHub Repository | ⬜ | USER |
| 5. Bot Token | ⬜ | USER |
| 6. DB Schema + RLS | ⬜ | AGENT |
| 7. Bot Development | ⬜ | AGENT |
| 8. Frontend | ⬜ | AGENT |
| 9. Local Testing | ⬜ | BOTH |
| 10. Deploy Frontend | ⬜ | AGENT |
| 11. Deploy Bot | ⬜ | AGENT |
| 12. E2E Verification | ⬜ | BOTH |
| 13. Custom Domain | ⬜ | USER (opt) |
