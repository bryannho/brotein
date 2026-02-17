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
    main.tsx                         — Entry point, wraps App in BrowserRouter + UserProvider
    App.tsx                          — Routes: / -> /daily, /daily, /weekly, /account
    App.css                          — Layout, .card, .date-nav, .header nav, .meal-cards classes
    index.css                        — Design tokens (CSS custom properties), base element styles
    types.ts                         — Shared TS interfaces (User, Meal, MacroTotals, DailyData, DayEntry, WeeklyData, Goals)
    api.ts                           — Centralized fetch wrappers for all /api/* endpoints
    context/
      UserContext.tsx                 — UserProvider + useUser() hook, persists selected user to localStorage
    components/
      Header.tsx                     — Nav bar: brand + NavLinks (Daily/Weekly/Account) + UserSelector
      UserSelector.tsx               — User dropdown (driven by UserContext)
      CalorieRingChart.tsx           — Custom SVG radial chart (calorie ring + 4 macro rings)
      DailySummaryCard.tsx           — Wraps CalorieRingChart with totals + goals
      MealList.tsx                   — Cards-only meal list with inline-editable macro inputs
      MealEntryForm.tsx              — Text input + hidden file input with camera button + submit
      WeeklyCharts.tsx               — Five separate recharts BarCharts (Calories, Protein, Carbs, Fat, Sugar) via MacroChart helper + custom tooltip
      GoalForm.tsx                   — Goal inputs (uses type="text" + inputMode="decimal" + regex validation instead of type="number" to allow clearing) + save
    pages/
      DailyPage.tsx                  — Date nav > ring chart > meal form > meal cards
      WeeklyPage.tsx                 — Weekly overview with charts
      AccountPage.tsx                — Create user + goal setting
  index.html                         — Google Fonts (Inter), theme-color meta
  vite.config.ts
  package.json
  tsconfig*.json
```

## Design System

### CSS Custom Properties (defined in `index.css`)

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-bg` | `#1a1a1a` | Page background |
| `--color-surface` | `#242424` | Cards/surfaces |
| `--color-surface-alt` | `#2c2c2c` | Inputs, hover states |
| `--color-border` | `#333` | Borders |
| `--color-text` | `#f0f0f0` | Primary text |
| `--color-text-secondary` | `#888` | Labels, secondary text |
| `--color-calories` | `#7c83ff` | Calories accent (blue-violet) |
| `--color-protein` | `#4ecdc4` | Protein (teal) |
| `--color-carbs` | `#ffd43b` | Carbs (warm yellow) |
| `--color-fat` | `#f4a261` | Fat (orange) |
| `--color-sugar` | `#ff6b6b` | Sugar (red) |
| `--color-danger` | `#ff6b6b` | Delete/destructive actions |

### Font

Inter (400, 600, 700) loaded via Google Fonts in `index.html`.

### Reusable CSS Classes (defined in `App.css`)

- `.card` — Standard card container (surface bg, border, 12px radius)
- `.primary` — Accent-colored button (on `<button>`)
- `.date-nav` — Centered flex row for date navigation arrows
- `.meal-cards` — Vertical flex column for meal card list
- `.goal-input` — Full-width input for goal fields

### Base Element Styles (defined in `index.css`)

`input`, `select`, and `button` have global styles (border-radius, colors, padding). Components generally don't need to repeat these — only add inline styles for layout-specific overrides like `flex: 1` or `width: 100%`.

### Mobile-First Layout

- Base max-width: `520px` (bumps to `560px` at 600px+)
- Header stacks vertically below 600px
- All views are cards-only (no desktop table layouts)

## Routing

Uses react-router-dom with 3 routes:
- `/daily` — DailyPage (default, `/` redirects here)
- `/weekly` — WeeklyPage
- `/account` — AccountPage

## Key Dependencies

- react-router-dom (client-side routing)
- recharts (bar charts for weekly view)

## Conventions

- Dark mode only (no light mode / `prefers-color-scheme` handling)
- Use CSS custom properties (`var(--color-*)`) for all colors — never hardcode hex in components
- Use `.card` class for card containers instead of inline border/bg/radius styles
- Use `.primary` class for accent-colored action buttons
- Minimal inline styles — only for layout (flex, gap, margin) not theming
- `CalorieRingChart` is pure SVG (no charting library) for full control over ring rendering
- All pages use hardcoded sample data as placeholders
- `useUser()` hook provides `{ users, selectedUser, selectUser, refreshUsers }` — use it in any component that needs the current user
- Selected user ID is persisted to localStorage under key `brotein_user_id`
- All API calls go through `api.ts` — never call `fetch()` directly in components

## Current Status

All pages are wired to real API endpoints via `api.ts` and `useUser()` hook. No hardcoded sample data remains.

### Callback Patterns

- `DailyPage` passes `onMealCreated` to `MealEntryForm` and `onMutated` to `MealList` — both trigger a re-fetch of daily data
- `MealEntryForm` accepts `userId` and `onMealCreated` props; shows loading state while submitting
- `MealList` accepts `onMutated` prop; calls `updateMeal` (with all five macro fields) on blur and `deleteMeal` on delete
- `WeeklyPage` fetches weekly data when selectedUser changes
- `AccountPage` fetches goals per user, creates users via `createUser` + `refreshUsers`, saves goals via `saveGoals`
- `GoalForm` receives `key={selectedUser.id}` to reset internal state on user switch
