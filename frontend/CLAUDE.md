# Frontend — React + Vite + TypeScript

## Commands

```bash
cd frontend
pnpm install    # install deps
pnpm dev        # dev server (:5173, proxies /api -> :8000)
pnpm build      # production build -> dist/
```

### Linting & Formatting

```bash
pnpm lint           # ESLint
pnpm format         # Prettier (auto-fix)
pnpm format:check   # Prettier (check only)
```

## File Structure

```
frontend/
  src/
    main.tsx                         — Entry point, wraps App in BrowserRouter + UserProvider
    App.tsx                          — Routes: / -> /daily, /daily, /weekly, /account
    App.css                          — Layout, .card, .date-nav, .header nav, .meal-cards, .autocomplete-dropdown, .modal-overlay classes
    index.css                        — Design tokens (CSS custom properties), base element styles
    types.ts                         — Shared TS interfaces (User, Meal, MacroTotals, DailyData, DayEntry, WeeklyData, Goals, MealSuggestion)
    api.ts                           — Centralized fetch wrappers for all /api/* endpoints
    context/
      UserContext.tsx                 — UserProvider + useUser() hook, persists selected user to localStorage
    hooks/
      useDebounce.ts                 — Generic useDebounce<T>(value, delay) hook for search-as-you-type
    components/
      Header.tsx                     — Nav bar: brand + NavLinks (Daily/Weekly/Account) + UserSelector
      UserSelector.tsx               — User dropdown (driven by UserContext)
      CalorieRingChart.tsx           — Calorie ring (SVG with glow) + horizontal macro progress bars (side-by-side layout)
      DailySummaryCard.tsx           — Wraps CalorieRingChart with totals + goals
      MealList.tsx                   — Cards-only meal list with inline-editable macro inputs
      MealEntryForm.tsx              — Text input + hidden file input with camera button + submit + meal memory autocomplete dropdown
      MealMemoryModal.tsx            — Modal for editing macros before re-adding a past meal (skips OpenAI)
      WeeklyCharts.tsx               — Averages card + Calories LineChart (with goal ReferenceArea) + Macros LineChart (Protein/Carbs/Fat/Sugar lines) + custom tooltip
      GoalForm.tsx                   — Goal inputs (uses type="text" + inputMode="decimal" + regex validation instead of type="number" to allow clearing) + save
    pages/
      DailyPage.tsx                  — Date nav > ring chart > meal form > meal cards
      WeeklyPage.tsx                 — Weekly overview with charts
      AccountPage.tsx                — Create user + goal setting
  index.html                         — Google Fonts (DM Sans + JetBrains Mono), theme-color meta
  vite.config.ts
  package.json
  tsconfig*.json
```

## Design System

### CSS Custom Properties (defined in `index.css`)

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-bg` | `#141210` | Page background (warm very dark brown) |
| `--color-surface` | `#1c1a17` | Cards/surfaces (warm) |
| `--color-surface-alt` | `#242119` | Inputs, hover states (warm) |
| `--color-border` | `#2a2722` | Borders (warm) |
| `--color-text` | `#f0ebe4` | Primary text (warm off-white) |
| `--color-text-secondary` | `#7a7268` | Labels, secondary text (warm gray) |
| `--color-calories` | `#c4885a` | Calories accent (amber/copper) |
| `--color-protein` | `#7daa92` | Protein (warm sage green) |
| `--color-carbs` | `#e8c468` | Carbs (warm gold) |
| `--color-fat` | `#d4896a` | Fat (terra cotta) |
| `--color-sugar` | `#cf6679` | Sugar (warm rose) |
| `--color-danger` | `#cf6679` | Delete/destructive actions (warm rose) |
| `--font-body` | `'DM Sans', system-ui, sans-serif` | Body text font |
| `--font-mono` | `'JetBrains Mono', 'SF Mono', monospace` | Numerical data font |

### Fonts

- **DM Sans** (400, 500, 600, 700) — body text, loaded via Google Fonts in `index.html`
- **JetBrains Mono** (400, 500, 600) — numerical data displays, loaded via Google Fonts in `index.html`

### Reusable CSS Classes (defined in `App.css`)

- `.card` — Standard card container (surface bg, border, 16px radius)
- `.primary` — Accent-colored button (on `<button>`)
- `.date-nav` — Centered flex row for date navigation arrows
- `.meal-cards` — Vertical flex column for meal card list
- `.goal-input` — Full-width input for goal fields
- `.autocomplete-dropdown` — Absolutely positioned dropdown below text input (z-index: 10)
- `.autocomplete-item` — Individual dropdown item with hover state
- `.modal-overlay` — Fixed full-screen overlay with centered content (z-index: 100)

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
- recharts (line charts for weekly view)

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
- Use `var(--font-mono)` for numerical data displays (calorie counts, macro values, chart labels)

## Current Status

All pages are wired to real API endpoints via `api.ts` and `useUser()` hook. No hardcoded sample data remains.

### Callback Patterns

- `DailyPage` passes `onMealCreated` to `MealEntryForm` and `onMutated` to `MealList` — both trigger a re-fetch of daily data
- `MealEntryForm` accepts `userId`, `date`, and `onMealCreated` props; shows loading state while submitting; includes meal memory autocomplete (debounced search → dropdown → MealMemoryModal → quickCreateMeal)
- `MealList` accepts `onMutated` prop; calls `updateMeal` (with all five macro fields) on blur and `deleteMeal` on delete
- `WeeklyPage` fetches weekly data when selectedUser changes
- `AccountPage` fetches goals per user, creates users via `createUser` + `refreshUsers`, saves goals via `saveGoals`
- `GoalForm` receives `key={selectedUser.id}` to reset internal state on user switch

## Claude Code Hooks

A PostToolUse hook auto-runs linting and formatting after Claude edits frontend files:

- `pnpm lint --fix` — ESLint auto-fix
- `pnpm format` — Prettier auto-fix

Config: `.claude/settings.json` | Script: `.claude/hooks/lint-format.sh`

## Documentation Policy

When making changes to the frontend, update this file to reflect those changes. This includes:

- **File structure changes**: Adding, removing, or renaming components, pages, or modules
- **New components or pages**: Add to the File Structure section with a brief description
- **Routing changes**: New routes, changed paths, or navigation flow updates
- **Design system changes**: New CSS custom properties, reusable classes, or design tokens
- **API integration changes**: New fetch wrappers in `api.ts`, changed request/response shapes
- **State management changes**: New context providers, hooks, or data flow patterns
- **Key dependency additions/removals**: New libraries or removed packages
- **Convention changes**: New coding patterns, styling approaches, or architectural decisions

Do NOT update this file for trivial bug fixes, minor styling tweaks, or changes that don't affect how a developer understands or works with the frontend.
