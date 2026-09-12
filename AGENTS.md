# AGENTS.md

Instructions for any AI coding agent (Claude Code, Cursor, Codex, ...) working
in this repository.

## Project overview

AgentBoard is an AI-assisted development lab, currently in its **foundation
stage**: a running frontend, a running API, a PostgreSQL container, and the
quality tooling around them. There is no business domain yet — no auth, no
domain models, no product features. Do not add any of those unless explicitly
asked; see "Out of scope" below.

Full architecture and setup details live in [README.md](README.md) — read it
before making non-trivial changes. This file only covers what an agent needs
to build, test, and behave correctly.

## Repository layout

Two independent npm packages plus local infra, no shared root workspace:

- `backend/` — NestJS 12 + TypeScript + Prisma 7 API.
- `frontend/` — Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui.
- `docker-compose.yml` — PostgreSQL only; frontend and backend run on the host.
- `Makefile` — canonical entry points for local dev (see `make help`).

## Build & test commands

Run from the repository root unless noted otherwise.

```bash
make install         # npm install in both backend/ and frontend/
make lint             # lint both projects
make test             # backend unit + e2e tests (vitest)
make build            # build both projects
```

Per-package (useful when iterating on one side only):

```bash
cd backend  && npm run lint && npm run test && npm run test:e2e && npm run build
cd frontend && npm run lint && npm run typecheck && npm run build
```

CI (`.github/workflows/ci.yml`) runs the same lint/test/build steps per
package on every push and pull request — treat a red CI run as blocking, not
advisory.

## Conventions

- Keep `backend/` and `frontend/` independent: no cross-imports, no shared
  root `node_modules` dependency between them (the root `package.json` exists
  only for repo-wide tooling like `husky`/`lint-staged`, not app code).
- Follow the API conventions documented in the README (`/api/v1` prefix,
  global `ValidationPipe`, global exception filter, `CORS_ORIGIN` handling)
  instead of introducing new patterns.
- Never commit `.env`, `.env.local`, or any file with real credentials — only
  the `.env.example` files are versioned. Use `${VAR}`-style placeholders in
  examples and docs, never literal secrets.
- Match the existing code style (ESLint + Prettier configs already in each
  package); do not introduce a second formatter or a different lint config.
- Prefer small, focused diffs. This repo is intentionally minimal — don't add
  abstractions, dependencies, or scaffolding beyond what the current task
  requires.

## Out of scope (do not implement unless explicitly requested)

Authentication, domain models (`User`, `Project`, `Task`, ...), AI
integrations, containerized application services, and any UI beyond the
current health-check home page.
