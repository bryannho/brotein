#!/usr/bin/env bash
# PostToolUse hook: auto lint + format after Edit/Write.
# Receives JSON on stdin with tool_input.file_path.

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null || true)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# Frontend files (.ts, .tsx, .css, .js, .jsx)
if echo "$FILE_PATH" | grep -q "${PROJECT_ROOT}/frontend/.*\.\(ts\|tsx\|css\|js\|jsx\)$"; then
  cd "${PROJECT_ROOT}/frontend"
  pnpm lint --fix 2>/dev/null || true
  pnpm format 2>/dev/null || true
  exit 0
fi

# Backend files (.py)
if echo "$FILE_PATH" | grep -q "${PROJECT_ROOT}/backend/.*\.py$"; then
  cd "${PROJECT_ROOT}/backend"
  RELATIVE_PATH="${FILE_PATH#${PROJECT_ROOT}/backend/}"
  poetry run ruff check --fix "$RELATIVE_PATH" 2>/dev/null || true
  poetry run ruff format "$RELATIVE_PATH" 2>/dev/null || true
  exit 0
fi

exit 0
