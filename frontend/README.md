# brotein — Frontend

React + TypeScript + Vite frontend for the brotein macro tracking app.

## Development

```bash
pnpm install    # install deps
pnpm dev        # dev server (:5173, proxies /api → :8000)
pnpm build      # production build → dist/
```

## Linting & Formatting

- **ESLint** for TypeScript/React linting
- **Prettier** for code formatting (config in `.prettierrc`)
- `eslint-config-prettier` disables ESLint rules that conflict with Prettier

```bash
pnpm lint           # run ESLint
pnpm format         # format with Prettier (auto-fix)
pnpm format:check   # check formatting without writing
```
