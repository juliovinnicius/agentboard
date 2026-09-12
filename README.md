# AgentBoard

AI assisted development lab. This repository is the **foundation stage**: a
running frontend, a running API, a PostgreSQL container and the quality tooling
around them. There is no business domain yet — no auth, no models, no features.

## Stack

| Layer    | Tools                                                                             |
| -------- | --------------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, ESLint, Prettier   |
| Backend  | NestJS 12, TypeScript, Prisma 7, Swagger, class-validator/transformer, ESLint, Prettier |
| Database | PostgreSQL 18 in Docker                                                           |
| Tooling  | Docker Compose, Makefile, plain monorepo: two independent npm packages   |

## Repository layout

```text
agentboard/
├── backend/            NestJS API
│   ├── prisma/         schema (connection only, no models yet)
│   └── src/
│       ├── common/     cross-cutting pieces (global exception filter)
│       ├── config/     environment validation
│       ├── health/     GET /api/v1/health
│       └── prisma/     PrismaService / PrismaModule
├── frontend/           Next.js app
│   └── src/
│       ├── app/        App Router entry points
│       ├── components/ shared components (ui/ is shadcn-generated)
│       ├── features/   feature-scoped code (health/)
│       ├── hooks/      React hooks
│       ├── lib/        framework-agnostic helpers
│       ├── services/   HTTP access to the API
│       └── types/      shared types
├── docker-compose.yml  local PostgreSQL only
└── Makefile            developer entry points
```

## Prerequisites

- Node.js 22 LTS or newer (developed on Node 24)
- npm 10+
- Docker with Compose v2

## 1. Environment variables

```bash
make env
```

That copies the three examples if they do not exist yet:

| File                   | Used by            | Keys                                                      |
| ---------------------- | ------------------ | --------------------------------------------------------- |
| `.env`                 | docker-compose     | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` |
| `backend/.env`         | NestJS and Prisma  | `DATABASE_URL`, `PORT`, `CORS_ORIGIN`, `NODE_ENV`         |
| `frontend/.env.local`  | Next.js            | `NEXT_PUBLIC_API_URL`                                     |

Then edit them: set a local password in `.env` and use the same user, password,
database and port inside `backend/.env`'s `DATABASE_URL`. None of these files
are versioned — only the `.env.example` files are.

## 2. Start PostgreSQL

```bash
make db-up     # docker compose up -d --wait
make db-logs   # follow the container logs
make db-down   # stop it, keeping the data volume
```

`make db-up` returns only after the container healthcheck passes.

## 3. Install dependencies

```bash
make install
```

Backend `postinstall` runs `prisma generate`, which writes the client to
`backend/src/generated/prisma` (git-ignored).

## 4. Start the backend

```bash
make backend   # cd backend && npm run start:dev
```

## 5. Start the frontend

```bash
make frontend  # cd frontend && npm run dev
```

The home page shows `AgentBoard / AI Assisted Development Lab` and calls the
health endpoint, rendering `Backend Status: Online` or `Backend Status: Offline`.

## Local URLs

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:3001

Swagger:
http://localhost:3001/api/docs

Health:
http://localhost:3001/api/v1/health
```

The health endpoint answers:

```json
{ "status": "ok" }
```

## Scripts

### Backend (`cd backend`)

```bash
npm run start:dev      # watch mode
npm run build          # nest build
npm run lint           # eslint
npm run test           # vitest unit tests
npm run test:e2e       # vitest e2e tests
npm run format         # prettier --write
npm run prisma:generate
npm run prisma:migrate # once domain models exist
```

### Frontend (`cd frontend`)

```bash
npm run dev
npm run build
npm run lint
npm run typecheck      # next typegen && tsc --noEmit
npm run format
```

### Repository root

```bash
make help      # list every target
make lint      # lint both projects
make test      # backend unit + e2e tests
make build     # build both projects
```

## API conventions

- Global prefix `/api`, URI versioning with `v1` as the default, so routes live
  under `/api/v1/...`.
- Swagger UI at `/api/docs`, outside the version prefix.
- A global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`,
  implicit conversion) validates and transforms every DTO.
- A global exception filter turns thrown errors into
  `{ statusCode, message, error, path, timestamp }` and never leaks stack traces.
  Requests that match no route are still answered by Express' own 404.
- `CORS_ORIGIN` accepts a comma-separated list of origins, or `*`.
- Startup fails fast with a readable message when the environment is invalid
  (see `backend/src/config/env.validation.ts`).

## Not in this stage

Authentication, domain models (`User`, `Project`, `Task`, ...), AI integrations,
CI, containerized app services and any UI beyond the landing page.
