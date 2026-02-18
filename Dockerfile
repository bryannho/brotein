# Stage 1 — build frontend
FROM node:20-slim AS frontend-build
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY frontend/ ./frontend/
RUN cd frontend && CI=true pnpm install --frozen-lockfile && pnpm build

# Stage 2 — runtime
FROM python:3.12-slim
RUN pip install poetry && poetry config virtualenvs.create false
COPY backend/ ./backend/
RUN cd backend && poetry install --only main --no-root
COPY --from=frontend-build /frontend/dist ./frontend/dist
WORKDIR /backend
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
