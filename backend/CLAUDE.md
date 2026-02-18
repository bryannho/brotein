# Backend — FastAPI

## Commands

```bash
cd backend
poetry install                                        # install deps
poetry run uvicorn app.main:app --reload --port 8000  # dev server
```

### Linting & Formatting

```bash
poetry run ruff check app/          # lint
poetry run ruff check --fix app/    # lint + auto-fix
poetry run ruff format app/         # format
poetry run ruff format --check app/ # format (check only)
```

## File Structure

```
backend/
  app/
    main.py          — FastAPI entry point, lifespan (init_db), router includes, SPA static serving
    database.py      — SQLAlchemy engine, SessionLocal, Base, init_db(), get_db() dependency
    db_models.py     — SQLAlchemy ORM models (User, Meal, Goal)
    models.py        — Pydantic request/response models
    openai_service.py — OpenAI integration for macro extraction
    routes/
      __init__.py
      meals.py       — POST /api/meal (with OpenAI extraction), PUT /api/meal/{id}, DELETE /api/meal/{id}
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
| GET    | /api/weekly           | Last 7 days with meals (goals vs actuals) |
| GET    | /api/users            | List all users               |
| POST   | /api/users            | Create user                  |
| GET    | /api/goals            | Get user goals               |
| POST   | /api/goals            | Set user goals               |

## Database Schema (SQLite)

Three tables: `users`, `meals`, `goals`. Created by `init_db()` on app startup via lifespan. DB file: `backend/brotein.db`.

- **users** — id (TEXT PK), name (TEXT), created_at (DATETIME)
- **meals** — id (TEXT PK), user_id (TEXT FK), meal_date (DATE), text_input (TEXT nullable), calories (INT), protein (REAL), carbs (REAL), fat (REAL), sugar (REAL), created_at (DATETIME)
- **goals** — user_id (TEXT PK FK), calories_goal (INT), protein_goal (REAL), carbs_goal (REAL), fat_goal (REAL), sugar_goal (REAL), updated_at (DATETIME)

## OpenAI Integration (`openai_service.py`)

- **Public API**: `extract_macros(text: str | None, image_bytes: bytes | None) -> ExtractionResult`
  - `ExtractionResult` is a dataclass with fields: `calories` (int), `protein` (float), `carbs` (float), `fat` (float), `sugar` (float), `error` (str), `description` (str)
- **Requires** `OPENAI_API_KEY` env var (loaded from `.env` at project root `/bigger/.env` via `python-dotenv`)
- **Model**: `gpt-4o` (supports both text and image inputs)
- **Structured outputs**: Uses `response_format` with a JSON schema (`strict: True`) to guarantee valid JSON. Schema includes `calories`, `protein`, `carbs`, `fat`, `sugar`, `description`, `reasoning`, and `error` fields. No markdown fence stripping needed.
- **Chain-of-thought**: The user prompt instructs the model to break meals into ingredients, estimate per-ingredient macros, then sum totals. The `reasoning` field captures this breakdown (logged but not stored in DB).
- **Few-shot examples**: System prompt includes 5 USDA-verified examples (scrambled egg, Chipotle bowl, pepperoni pizza, whey protein, grilled salmon + broccoli) to anchor estimates.
- **Retry behavior**: Makes an initial attempt plus up to 2 retries when the OpenAI response contains a non-empty `error` field
- **Failure mode**: On total failure (exceptions or all retries exhausted), returns zeros for all macro fields with an error message
- **Image handling**: Images are base64-encoded in memory and sent as `image_url` content parts; no persistent image storage

## Key Dependencies

- fastapi, uvicorn, python-multipart, sqlalchemy, openai, python-dotenv
- ruff (dev — linting & formatting)

## Current Status

All endpoints are wired to SQLite via SQLAlchemy ORM. CRUD operations work for users, meals, goals, daily summaries, and weekly reports. OpenAI integration is implemented: `POST /api/meal` calls the OpenAI API to extract macro nutrients from meal text and/or images.

## Claude Code Hooks

A PostToolUse hook auto-runs linting and formatting after Claude edits Python files in `backend/`:

- `poetry run ruff check --fix <file>` — lint + auto-fix
- `poetry run ruff format <file>` — format

Config: `.claude/settings.json` | Script: `.claude/hooks/lint-format.sh`

## Documentation Policy

When making changes to the backend, update this file to reflect those changes. This includes:

- **File structure changes**: Adding, removing, or renaming modules or route files
- **API endpoint changes**: New endpoints, changed request/response schemas, removed routes (update API Endpoints table)
- **Database schema changes**: New tables, column additions/removals, relationship changes
- **OpenAI integration changes**: Model changes, prompt updates, retry logic modifications
- **New services or modules**: Add to File Structure with a brief description
- **Key dependency additions/removals**: New libraries or removed packages
- **Convention changes**: New patterns, middleware, error handling approaches

Do NOT update this file for trivial bug fixes, minor refactors, or changes that don't affect how a developer understands or works with the backend.
