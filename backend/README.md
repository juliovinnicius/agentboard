# AgentBoard API

NestJS + Prisma API. Setup, environment variables and URLs are documented in
the [repository README](../README.md).

```bash
npm run start:dev   # http://localhost:3001/api/v1
npm run test        # unit tests
npm run test:e2e    # e2e tests
npm run lint
npm run build
```

## Domain persistence

The initial Prisma migration creates users, workspaces, memberships, projects,
tasks, and executions. Memberships are unique per user and workspace, while
projects and tasks use `archivedAt` for retention. Executions retain their
input snapshot and result history; PostgreSQL permits only one queued or
running execution for a task at a time. Foreign keys use restrictive deletes
so historical authorship is preserved.

With `DATABASE_URL` pointing at PostgreSQL, apply the schema and load the
deterministic development data with:

```bash
npx prisma migrate deploy
npm run prisma:seed
```
