---
name: telegram-bot
description: Use when developing or debugging the Telegram bot — commands, button CRUD, Supabase writes, handlers, webhook setup.
---

# Telegram Bot Skill

## Context

Node.js bot that manages buttons stored in Supabase. Users run bot commands to add/edit/delete buttons.

## Commands

| Command | Action |
|---------|--------|
| `/add <category> <label> <url>` | Create button (category: `magazine` or `exchange`) |
| `/list` | Show buttons grouped by category |
| `/edit <id> <label> <url>` | Update button |
| `/delete <id>` | Remove button |

## Stack

- `node-telegram-bot-api` or `node-telegram-bot-api`
- `@supabase/supabase-js`
- `dotenv` for secrets

## Bot Entry (`bot/index.js`)

```js
require('dotenv').config();
const Bot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot(process.env.BOT_TOKEN, { polling: true });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
```

## Handlers Location

`bot/handlers/` — one file per command: `add.js`, `list.js`, `edit.js`, `delete.js`

## Services Location

`bot/services/` — Supabase CRUD logic, validation

## Error Handling

- Try/catch around all Supabase calls
- User-friendly error messages in Telegram
- Log errors to console (no sensitive data)

## Do's / Don'ts

- DO validate URL format before insert
- DO confirm action to user (✅ / ❌)
- DON'T leak service role key in logs
- DON'T use `alert()` patterns — Telegram messages only
