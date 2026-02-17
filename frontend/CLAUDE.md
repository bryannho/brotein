# Frontend — React + Vite + TypeScript

## Commands

```bash
cd frontend
pnpm install    # install deps
pnpm dev        # dev server (:5173, proxies /api -> :8000)
pnpm build      # production build -> dist/
```

## File Structure

```
frontend/
  src/
    main.tsx                         — Entry point, wraps App in BrowserRouter
    App.tsx                          — Routes: / -> /daily, /daily, /weekly, /account
    App.css                          — Root container styles (max-width 960px)
    index.css                        — Global styles (fonts, colors, buttons)
    types.ts                         — Shared TS interfaces (User, Meal, MacroTotals, DailyData, DayEntry, WeeklyData, Goals)
    components/
      Header.tsx                     — Nav bar: brand + NavLinks (Daily/Weekly/Account) + UserSelector
      UserSelector.tsx               — User dropdown (hardcoded placeholder users)
      DailySummaryCard.tsx           — 4-column macro totals display
      MealList.tsx                   — Table of meals with column headers
      MealRowEditable.tsx            — Single meal row with inline-editable inputs + delete
      MealEntryForm.tsx              — Text input + image file picker + submit
      WeeklyCharts.tsx               — Two recharts BarCharts (calories + macros)
      GoalForm.tsx                   — 4 number inputs for daily goals + save
    pages/
      DailyPage.tsx                  — Date nav + summary + meal list + entry form
      WeeklyPage.tsx                 — Weekly overview with charts
      AccountPage.tsx                — Create user + goal setting
  index.html
  vite.config.ts
  package.json
  tsconfig*.json
```

## Routing

Uses react-router-dom with 3 routes:
- `/daily` — DailyPage (default, `/` redirects here)
- `/weekly` — WeeklyPage
- `/account` — AccountPage

## Key Dependencies

- react-router-dom (client-side routing)
- recharts (bar charts for weekly view)

## Conventions

- Inline styles throughout (no CSS framework yet)
- All pages use hardcoded sample data as placeholders
- UserSelector uses local component state (will lift to React context when wiring API)

## Current Status

All views render with **hardcoded sample data**. No API calls yet. Next step: wire components to real backend endpoints and lift user state to context/global.
