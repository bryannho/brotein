# brotein

## Architecture

Monorepo with two packages:
- `frontend/` — Vite + React + TypeScript, managed with **pnpm**
- `backend/` — FastAPI (Python 3.12), managed with **Poetry**

## How the pieces connect

- **Dev**: Vite dev server (`:5173`) proxies `/api` requests to FastAPI (`:8000`)
- **Prod**: FastAPI serves the built frontend static files from `frontend/dist/`
- Deployed as a **single Docker container** on a PaaS

## Environment

- `PORT` env var controls the server port (default: `8000`)
- SQLite database file lives alongside the backend (configure path in app as needed)

## Key Commands

### Backend
```bash
cd backend
poetry install                                    # install deps
poetry run uvicorn app.main:app --reload --port 8000  # dev server
poetry run ruff check app/                        # lint
poetry run ruff check --fix app/                  # lint + auto-fix
poetry run ruff format app/                       # format
```

### Frontend
```bash
cd frontend
pnpm install    # install deps
pnpm dev        # dev server (:5173, proxies /api → :8000)
pnpm build      # production build → dist/
pnpm lint       # ESLint
pnpm format     # Prettier (auto-fix)
```

### Docker
```bash
docker build -t brotein .
docker run -p 8000:8000 --env-file .env brotein
```
- Builds frontend in a Node stage, then copies `dist/` into a Python runtime stage
- Requires `.env` with `OPENAI_API_KEY`
- App available at `http://localhost:8000`
- Custom port: `docker run -p 3000:3000 -e PORT=3000 --env-file .env brotein`

## Project File Structure

```
brotein/
  CLAUDE.md
  Dockerfile
  backend/
    CLAUDE.md
    pyproject.toml
    brotein.db                         (created on first startup)
    app/
      __init__.py
      main.py                          — FastAPI entry point, lifespan, router includes, SPA serving
      database.py                      — SQLAlchemy engine, SessionLocal, Base, get_db() dependency
      db_models.py                     — SQLAlchemy ORM models (User, Meal, Goal)
      models.py                        — Pydantic request/response models
      routes/
        __init__.py
        meals.py                       — POST/PUT/DELETE /api/meal
        daily.py                       — GET /api/daily/{date}
        weekly.py                      — GET /api/weekly
        users.py                       — GET/POST /api/users
        goals.py                       — GET/POST /api/goals
  frontend/
    CLAUDE.md
    index.html
    package.json
    vite.config.ts
    src/
      main.tsx                         — Entry point (BrowserRouter + UserProvider)
      App.tsx                          — Routes + Header
      App.css                          — Root container styles
      index.css                        — Global styles
      types.ts                         — Shared TS interfaces
      api.ts                           — Typed fetch wrappers for all API endpoints
      context/
        UserContext.tsx                — UserProvider + useUser() hook (localStorage persistence)
      components/
        Header.tsx                     — Nav bar + UserSelector
        UserSelector.tsx               — User dropdown (context-driven)
        DailySummaryCard.tsx           — Macro totals card
        MealList.tsx                   — Meal cards with inline editing + API calls
        MealEntryForm.tsx              — Meal input form + API submission
        WeeklyCharts.tsx               — Recharts bar charts
        GoalForm.tsx                   — Goal setting form
      pages/
        DailyPage.tsx                  — Daily view (fetches daily data + goals)
        WeeklyPage.tsx                 — Weekly view (fetches weekly data)
        AccountPage.tsx                — Account/goals view (create users + set goals)
```

## Full MVP Spec

### Overview

A lightweight web app for tracking daily calories and macros (protein, carbs, fat, sugar). Users can log meals via **text and/or image**, and the backend will use the **OpenAI API** to extract macro totals in a structured format. The app supports multiple users, but **no authentication**—users simply switch accounts via dropdown.

---

# 1. Core Views / Pages

## 1.1 Daily View (Primary View)

### Purpose

Track meals for a specific day and see daily totals.

### Features

- Shows **daily totals**:
    - Calories
    - Protein (g)
    - Carbs (g)
    - Fat (g)
    - Sugar (g)
- Shows a **list of meals logged for that day**
    - Each meal entry includes:
        - Meal text (if provided)
        - Calories
        - Protein
        - Carbs
        - Fat
        - Sugar
        - Timestamp (or created time)
- Meal macros must be **editable**
    - User can manually edit any of:
        - calories
        - protein
        - carbs
        - fat
        - sugar
    - Changes should immediately persist to DB (save button or autosave)
- Meal input supports:
    - **Text input**
    - **Image upload**
    - **Both**
    - Must require at least one (text OR image)
- Navigation
    - Default shows **today**
    - Back arrow / previous day navigation to view prior dates
    - Optional forward arrow if not on today

---

## 1.2 Weekly View

### Purpose

Show progress vs goals across recent days with logged meals.

### Features

- Displays up to the last 7 days that have logged meals for the selected user (not necessarily a continuous 7-day calendar window)
- Shows **goals vs actual** per day

### Graphs

1. **Calories graph**
    - 7-day calories actual
    - goal overlay line (optional)
2. **Macros graph**
    - Protein actual vs goal
    - Carbs actual vs goal
    - Fat actual vs goal
    - Sugar actual vs goal
    - displayed together

### Weekly View Output

Each day should have:

- Date
- Goal calories vs actual calories
- Goal protein vs actual protein
- Goal carbs vs actual carbs
- Goal fat vs actual fat
- Goal sugar vs actual sugar

---

## 1.3 Account View

### Purpose

User selection + goal setting.

### Features

- User dropdown selector (no login/auth)
- Ability to create a new user
- Ability to set daily goals:
    - calories_goal (int)
    - protein_goal (float)
    - carbs_goal (float)
    - fat_goal (float)
    - sugar_goal (float)

Goals update affects:

- Daily view comparisons (optional)
- Weekly view charts + comparisons

---

# 2. Multi-User Behavior (No Auth)

### Approach

- No passwords, no sessions, no JWT.
- UI contains a dropdown like:
    - Bryan
    - Mom
    - Dad
    - etc.

### How it works

- Every request includes `user_id`
    - either as query param (`?user_id=123`)
    - or header (`X-User-ID`)
    - or stored in local storage on frontend

---

# 3. Meal Logging Flow (Core UX)

### Step-by-step

1. User selects account from dropdown
2. User is on Daily View
3. User submits meal with:
    - text only OR image only OR both
4. Backend calls OpenAI API
5. OpenAI returns structured macros
6. Backend saves meal row
7. Daily totals update
8. User may edit macro values manually afterward

---

# 4. OpenAI Integration

## 4.1 OpenAI Input Types

Meal entry can include:

- meal text description
- image upload (nutrition label, food photo, screenshot)

No model switching needed—just use a vision-capable model.

## 4.2 Structured Output JSON Schema

All OpenAI responses must follow this structure:

```json
{
  "calories": 0,
  "protein": 0.0,
  "carbs": 0.0,
  "fat": 0.0,
  "sugar": 0.0,
  "error": ""
}
```

### Rules

- `calories` must be an integer
- macros are floats (grams)
- `error` is a string
    - empty string means success
    - non-empty means model could not confidently extract

## 4.3 Retry Logic

- Backend checks `error`
- If `error != ""`:
    - retry the request (up to N times, e.g. 2 retries)
- If still failing:
    - store meal anyway but with macros set to 0 and return error message to UI

---

# 5. Sample Prompt (Backend → OpenAI)

### System Prompt (Recommended)

> You are a nutrition extraction engine. Your job is to extract calories and macro nutrients from meal descriptions and nutrition label images.

### User Prompt Template

```
Extract nutritional information from the provided input.

You may receive:
- a meal description (text),
- an image (nutrition label, meal photo, screenshot),
- or both.

Return ONLY valid JSON with the following keys:
- calories (int)
- protein (float, grams)
- carbs (float, grams)
- fat (float, grams)
- sugar (float, grams)
- error (string)

Rules:
- If all values are confidently determined, set error to "".
- If values are missing or unclear, set error to a descriptive message.
- Do not guess. Only use explicit information from the input.
- If the input is a meal description without explicit macros, return error explaining why.
- JSON only. No extra text.
```

---

# 6. API Endpoints (FastAPI)

## 6.1 Meals

### POST `/api/meal`

Creates a meal entry using OpenAI extraction.

**Request**

- multipart/form-data
- required: `user_id`
- optional: `text`
- optional: `image`

**Rules**

- Must include at least one of: `text` or `image`

**Response**

```json
{
  "meal_id": "uuid",
  "user_id": "uuid",
  "date": "2026-02-16",
  "text_input": "chipotle bowl",
  "calories": 650,
  "protein": 42.0,
  "carbs": 70.0,
  "fat": 20.0,
  "sugar": 6.0,
  "error": ""
}
```

---

### PUT `/api/meal/{meal_id}`

Allows editing macros manually.

**Request**

```json
{
  "calories": 700,
  "protein": 45.0,
  "carbs": 75.0,
  "fat": 22.0,
  "sugar": 6.0
}
```

**Response**

Returns updated meal object.

---

### DELETE `/api/meal/{meal_id}` *(optional but recommended)*

Deletes a meal.

---

## 6.2 Daily

### GET `/api/daily/{date}?user_id=...`

Returns all meals + totals for that day.

**Response**

```json
{
  "date": "2026-02-16",
  "user_id": "uuid",
  "totals": {
    "calories": 2100,
    "protein": 160.0,
    "carbs": 220.0,
    "fat": 70.0,
    "sugar": 40.0
  },
  "meals": [
    {
      "meal_id": "uuid",
      "text_input": "in n out burger",
      "calories": 520,
      "protein": 35.0,
      "carbs": 40.0,
      "fat": 25.0,
      "sugar": 8.0,
      "created_at": "..."
    }
  ]
}
```

---

## 6.3 Weekly

### GET `/api/weekly?user_id=...`

Returns up to the last 7 days that have logged meals, with goals vs actual totals (not necessarily a continuous 7-day calendar window).

**Response**

```json
{
  "user_id": "uuid",
  "days": [
    {
      "date": "2026-02-10",
      "goal": { "calories": 2200, "protein": 160, "carbs": 200, "fat": 70, "sugar": 40 },
      "actual": { "calories": 2050, "protein": 150, "carbs": 180, "fat": 65, "sugar": 35 }
    }
  ]
}
```

---

## 6.4 Users

### GET `/api/users`

Returns all user profiles (for dropdown).

### POST `/api/users`

Creates a new user.

**Request**

```json
{
  "name": "Bryan"
}
```

---

## 6.5 Goals

### GET `/api/goals?user_id=...`

Returns current goals.

### POST `/api/goals`

Updates goals.

**Request**

```json
{
  "user_id": "uuid",
  "calories_goal": 2200,
  "protein_goal": 160,
  "carbs_goal": 200,
  "fat_goal": 70,
  "sugar_goal": 40
}
```

---

# 7. Database Schema (SQLite, Minimal)

## 7.1 users

| field | type | notes |
| --- | --- | --- |
| id | TEXT (UUID) | PK |
| name | TEXT | display name |
| created_at | DATETIME |  |

---

## 7.2 meals

| field | type | notes |
| --- | --- | --- |
| id | TEXT (UUID) | PK |
| user_id | TEXT | FK → users.id |
| meal_date | DATE | day this meal belongs to |
| text_input | TEXT | nullable |
| calories | INTEGER | default 0 |
| protein | REAL | default 0 |
| carbs | REAL | default 0 |
| fat | REAL | default 0 |
| sugar | REAL | default 0 |
| created_at | DATETIME |  |

> No image_path stored (since images are not persisted).

---

## 7.3 goals

| field | type | notes |
| --- | --- | --- |
| user_id | TEXT | PK + FK → users.id |
| calories_goal | INTEGER |  |
| protein_goal | REAL |  |
| carbs_goal | REAL |  |
| fat_goal | REAL |  |
| sugar_goal | REAL |  |
| updated_at | DATETIME |  |

---

# 8. Image Handling Design

### Requirement

App must accept image uploads but does not need to store them.

### Approach

- Frontend sends image as multipart/form-data
- Backend reads into memory (`UploadFile`)
- Backend converts to bytes/base64 (depending on OpenAI SDK)
- Backend sends image directly to OpenAI vision model
- After parsing, image is discarded

No S3, no disk storage, no thumbnails.

---

# 9. Frontend Design (React + Vite)

### Key UI Components

- `UserSelector` dropdown (global)
- `DailySummaryCard` (totals)
- `MealList`
- `MealEntryForm` (text input + upload button)
- `MealRowEditable` (inline macro editing)
- `WeeklyCharts` (calories + macros)

### Navigation

- `/daily`
- `/weekly`
- `/account`

---

# 10. Architectural / System Design Decisions

### Monolith Container

- Single Docker container runs:
    - FastAPI backend
    - React frontend static files (built via Vite)

### React Hosting

- React built output served by FastAPI as static files
- API routes under `/api/*`
- Non-API routes fallback to `index.html` (React Router)

### Database

- SQLite for simplicity
- Single file DB on persistent disk/volume

### Multi-User

- No authentication
- Users are switched via dropdown
- `user_id` is included in API requests

### OpenAI Integration

- One model that supports both text + image
- Structured output JSON schema enforced
- Backend validates output and retries if error field is populated

### Image Storage

- No persistent image storage
- Images processed in memory only

### Deployment

- One container deployed to Fly.io / Render / small VPS
- SQLite file stored on mounted persistent volume
- Single instance recommended (SQLite write safety)

### Scalability Path

- If app grows:
    - switch SQLite → Postgres
    - add real auth later if needed


