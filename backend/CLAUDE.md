# Backend — FastAPI

## Commands

```bash
cd backend
poetry install                                        # install deps
poetry run uvicorn app.main:app --reload --port 8000  # dev server
```

## File Structure

```
backend/
  app/
    main.py          — FastAPI entry point, lifespan (init_db), router includes, SPA static serving
    database.py      — SQLite init_db() + get_connection() context manager
    models.py        — Pydantic request/response models
    routes/
      __init__.py
      meals.py       — POST /api/meal, PUT /api/meal/{id}, DELETE /api/meal/{id}
      daily.py       — GET /api/daily/{date}?user_id=
      weekly.py      — GET /api/weekly?user_id=
      users.py       — GET /api/users, POST /api/users
      goals.py       — GET /api/goals?user_id=, POST /api/goals
  pyproject.toml
  bigger.db          — SQLite database (created on first startup)
```

## API Endpoints

| Method | Path                  | Description                  |
|--------|-----------------------|------------------------------|
| GET    | /api/health           | Health check                 |
| POST   | /api/meal             | Create meal (multipart)      |
| PUT    | /api/meal/{meal_id}   | Edit meal macros             |
| DELETE | /api/meal/{meal_id}   | Delete meal                  |
| GET    | /api/daily/{date}     | Daily meals + totals         |
| GET    | /api/weekly           | 7-day goals vs actuals       |
| GET    | /api/users            | List all users               |
| POST   | /api/users            | Create user                  |
| GET    | /api/goals            | Get user goals               |
| POST   | /api/goals            | Set user goals               |

## Database Schema (SQLite)

Three tables: `users`, `meals`, `goals`. Created by `init_db()` on app startup via lifespan. DB file: `backend/bigger.db`.

- **users** — id (TEXT PK), name (TEXT), created_at (DATETIME)
- **meals** — id (TEXT PK), user_id (TEXT FK), meal_date (DATE), text_input (TEXT nullable), calories (INT), protein (REAL), carbs (REAL), sugar (REAL), created_at (DATETIME)
- **goals** — user_id (TEXT PK FK), calories_goal (INT), protein_goal (REAL), carbs_goal (REAL), sugar_goal (REAL), updated_at (DATETIME)

## Key Dependencies

- fastapi, uvicorn, python-multipart

## Current Status

All endpoints return **stub/hardcoded responses**. Database tables are created but not yet read/written by routes. Next step: wire routes to actual DB queries and OpenAI integration.
