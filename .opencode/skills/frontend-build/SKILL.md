---
name: frontend-build
description: Use when building or editing the static frontend — HTML structure, CSS styles, responsive layout, realtime button rendering, glassmorphism cards, background image setup.
---

# Frontend Build Skill

## Context

Static one-page site-vizitka. Cloudflare Pages hosting. Supabase for data.

## Rules

- Mobile-first CSS, BEM naming: `.card`, `.card__title`, `.card__link`
- CSS custom properties in `:root` for colors/spacing
- Semantic HTML: `<header>`, `<main>`, `<section>`, `<footer>`
- `lang="uk"` on `<html>`, meta viewport + charset
- Background: `background-image` with `cover`, `no-repeat`, `center`
- Cards: glassmorphism — `backdrop-filter: blur(10px)`, semi-transparent bg
- `prefers-reduced-motion` respect
- No `alert()` — custom toast/notification UI
- Vanilla JS only, no frameworks
- IIFE or ES modules, no globals

## Realtime Rendering

```js
const channel = supabase
  .channel('buttons')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'buttons' },
    () => fetchAndRenderButtons()
  )
  .subscribe();
```

## File Locations

- `public/index.html`
- `public/css/style.css`
- `public/js/app.js`

## Do's / Don'ts

- DO use `?.` and `??`
- DO JSDoc on public functions
- DON'T put secrets in frontend code
- DON'T disable accessibility (aria-labels, focus states)
