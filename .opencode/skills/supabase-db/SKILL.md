---
name: supabase-db
description: Use when working with Supabase — migrations, RLS policies, table schema, queries, realtime channels, environment variables.
---

# Supabase DB Skill

## Context

Database for buttons (label, url, position, timestamps). Free tier.

## Table Schema

```sql
create table buttons (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  url text not null,
  position int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter publication supabase_realtime add table buttons;
```

## RLS Policy (anon read only)

```sql
create policy "Public read access"
  on buttons for select
  using (true);
```

Bot uses `service_role` key — no RLS check.

## Env Variables

- `SUPABASE_URL` — project URL
- `SUPABASE_SERVICE_KEY` — bot only
- `SUPABASE_ANON_KEY` — frontend only

## Client Usage

```js
// Frontend (anon)
const { data, error } = await supabase.from('buttons').select('*').order('position');

// Bot (service)
const { data, error } = await supabase.from('buttons').upsert({ id, label, url });
```

## Do's / Don'ts

- DO use service key server-side only
- DO enable Realtime on table
- DON'T commit `.env`
- DON'T write raw SQL from client
