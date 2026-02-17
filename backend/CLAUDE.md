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
    database.py      — SQLAlchemy engine, SessionLocal, Base, init_db(), get_db() dependency
    db_models.py     — SQLAlchemy ORM models (User, Meal, Goal)
    models.py        — Pydantic request/response models
    routes/
      __init__.py
      meals.py       — POST /api/meal, PUT /api/meal/{id}, DELETE /api/meal/{id}
      daily.py       — GET /api/daily/{date}?user_id=
      weekly.py      — GET /api/weekly?user_id=
      users.py       — GET /api/users, POST /api/users
      goals.py       — GET /api/goals?user_id=, POST /api/goals
  pyproject.toml
  brotein.db         — SQLite database (created on first startup)
```

## SQLAlchemy Setup

- **Engine**: SQLite via `create_engine("sqlite:///...brotein.db")` with `check_same_thread=False`
- **SessionLocal**: `sessionmaker(bind=engine)` — creates DB sessions
- **Base**: `DeclarativeBase` subclass — all ORM models inherit from this
- **get_db()**: FastAPI dependency (generator) that yields a session and closes it after the request
- **init_db()**: Called in FastAPI lifespan; imports `db_models` and runs `Base.metadata.create_all()`

ORM models live in `db_models.py` (separate from Pydantic `models.py`).

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

Three tables: `users`, `meals`, `goals`. Created by `init_db()` on app startup via lifespan. DB file: `backend/brotein.db`.

- **users** — id (TEXT PK), name (TEXT), created_at (DATETIME)
- **meals** — id (TEXT PK), user_id (TEXT FK), meal_date (DATE), text_input (TEXT nullable), calories (INT), protein (REAL), carbs (REAL), sugar (REAL), created_at (DATETIME)
- **goals** — user_id (TEXT PK FK), calories_goal (INT), protein_goal (REAL), carbs_goal (REAL), sugar_goal (REAL), updated_at (DATETIME)

## Key Dependencies

- fastapi, uvicorn, python-multipart, sqlalchemy

## Current Status

All endpoints are wired to SQLite via SQLAlchemy ORM. CRUD operations work for users, meals, goals, daily summaries, and weekly reports. OpenAI integration for meal macro extraction is not yet implemented.
