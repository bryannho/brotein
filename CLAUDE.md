# Bigger

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
```

### Frontend
```bash
cd frontend
pnpm install    # install deps
pnpm dev        # dev server (:5173, proxies /api → :8000)
pnpm build      # production build → dist/
```

## File Layout

- `backend/app/main.py` — FastAPI app entry point, API routes, static file serving
- `frontend/src/App.tsx` — React root component
- `frontend/vite.config.ts` — Vite config with `/api` proxy
- `Dockerfile` — Multi-stage build (Node for frontend, Python for runtime)
