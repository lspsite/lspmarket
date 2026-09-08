# Roadmap: Односторінковий сайт-візитка з Telegram ботом

## Архітектура

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│  Cloudflare │◄────►│   Supabase   │◄────►│ Telegram Bot    │
│   Pages     │      │  (DB + RT)   │      │ (Node.js)       │
│  (Frontend) │      │              │      │                 │
└─────────────┘      └──────────────┘      └─────────────────┘
```

- **Frontend**: Static HTML/CSS/JS → Cloudflare Pages
- **DB + Realtime**: Supabase (PostgreSQL + Realtime subscriptions)
- **Bot**: Telegram Bot API → Supabase REST API
- **Realtime updates**: Frontend підписується на Supabase channel → авто-оновлення кнопок

---

## Крок 1: Створення проєкту та репозиторію

1. Ініціалізувати Git-репозиторій
2. Створити структуру папок:
   ```
   site/
   ├── public/              # Для Cloudflare Pages
   │   ├── index.html
   │   ├── css/
   │   │   └── style.css
   │   └── js/
   │       └── app.js
   ├── bot/                 # Telegram бот
   │   ├── package.json
   │   ├── index.js
   │   └── .env
   ├── supabase/
   │   └── migrations/
   │       └── 001_buttons.sql
   └── README.md
   ```

---

## Крок 2: Налаштування Supabase

1. Створити проєкт на [supabase.com](https://supabase.com) (free tier)
2. Створити таблицю `buttons`:
   ```sql
   create table buttons (
     id uuid default gen_random_uuid() primary key,
     label text not null,
     url text not null,
     position int default 0,
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );
   ```
3. Увімкнути Realtime для таблиці `buttons`
4. Створитиanon-ключ (public read) та service role key (bot write)
5. Зберегти URL проєкту та ключі в `.env` бота

---

## Крок 3: Розробка Telegram бота

1. Створити бота через @BotFather → отримати token
2. Встановити залежності: `npm init -y`, `npm install node-telegram-bot-api @supabase/supabase-js dotenv`
3. Реалізувати команди:
   - `/add` — створити кнопку (label + url)
   - `/list` — список кнопок
   - `/edit <id>` — редагувати кнопку
   - `/delete <id>` — видалити кнопку
4. Бот записує/оновлює/видаляє записи в таблицю `buttons` через Supabase client
5. Тестувати бота локально

---

## Крок 4: Розробка фронтенду (сайт-візитка)

### HTML (`index.html`)
- Семантична структука: header, hero, cards section, footer
- Контейнер для карток кнопок

### CSS (`style.css`)
- Фон: повноекранне зображення через `background-image: url(...)` + `background-size: cover`
- Карти: glassmorphism або сучасний стиль
- Responsive (mobile-first)
- Анімації входу карт

### JS (`app.js`)
1. Підключитися до Supabase (`createClient`)
2. Завантажити кнопки: `supabase.from('buttons').select('*').order('position')`
3. Рендерити картки на сторінці
4. Підписатися на Realtime:
   ```js
   supabase.channel('buttons')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'buttons' },
       () => fetchAndRenderButtons()
     ).subscribe();
   ```
5. Кожна карта — посилання на URL з label

---

## Крок 5: Тестування

1. Локально запустити бот та перевірити CRUD операції
2. Відкрити сайт локально — перевірити що кнопки відображаються
3. Через бот додати/редагувати/видалити кнопку → сайт оновлюється в реальному часі
4. Перевірити мобільну версію

---

## Крок 6: Деплой

### Cloudflare Pages (фронтенд)
1. Залити код у GitHub репозиторій
2. У Cloudflare Dashboard → Pages → "Create project" → підключити GitHub repo
3. Build config: Root directory = `public`, Build command = невідомо (static)
4. Додати environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
5. Deploy

### Telegram Bot (серверна частина)
Варіант A — Cloudflare Workers (безсерверно, без сервера):
- Переписати бота на Cloudflare Worker + Telegram Bot API чер�з webhook
- Варіант Б — VPS за $1-2/міс (найдешевший)
- Варіант В — Railway / Render free tier

### Supabase
- Безкоштовний tier достатній для цього проєкту

---

## Крок 7: Фінальні перевірки

- [ ] Домен налаштовано (опціонально)
- [ ] HTTPS працює
- [ ] Бот відповідає за < 1s
- [ ] Сайт оновлює кнопки в реальному часі
- [ ] Зображення фону оптимізовано (WebP, стиснення)

---

## Стек підсумок

| Компонент | Технологія |
|-----------|-----------|
| Хостинг фронтенду | Cloudflare Pages (free) |
| БД + Realtime | Supabase (free tier) |
| Telegram Bot | Node.js / Cloudflare Workers |
| Фронтенд | HTML + CSS + Vanilla JS |
| CDN / Images | Cloudflare R2 (free) або Supabase Storage |
