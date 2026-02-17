# brotein

Full-stack monorepo: Vite + React frontend, FastAPI backend, SQLite database — deployed as a single Docker container.

## Tech Stack

- **Frontend**: React + TypeScript, built with Vite, managed with pnpm
- **Backend**: FastAPI (Python), managed with Poetry
- **Database**: SQLite
- **Deployment**: Single Docker container (multi-stage build)

## Prerequisites

- Node.js 20+
- pnpm
- Python 3.12+
- Poetry

## Dev Setup

### Backend

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` requests to the backend at `:8000`.

## Docker

Build and run the production container:

```bash
docker build -t brotein .
docker run -p 8000:8000 brotein
```

The app will be available at `http://localhost:8000`.

Set a custom port with the `PORT` env var:

```bash
docker run -p 3000:3000 -e PORT=3000 brotein
```

## Project Structure

```
brotein/
├── frontend/          # Vite + React + TypeScript
│   ├── src/
│   ├── public/
│   ├── vite.config.ts
│   └── package.json
├── backend/           # FastAPI + Python
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   └── pyproject.toml
├── Dockerfile         # Multi-stage production build
├── .dockerignore
├── .gitignore
├── .python-version
├── CLAUDE.md
└── README.md
```
