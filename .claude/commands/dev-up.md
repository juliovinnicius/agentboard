---
description: Bring up the local dev environment (Postgres via Docker, then remind how to start backend/frontend)
---

Bring up AgentBoard's local dev environment:

1. Run `make env` (creates `.env` files from the examples if missing — do not
   overwrite existing ones).
2. Run `make db-up` and wait for it to report the healthcheck passed.
3. Tell the user to run `make backend` and `make frontend` in two separate
   terminals (these are long-running dev servers and should not be started
   in the background of this command).

If `make db-up` fails, show the Docker error and check `make db-logs` before
suggesting anything destructive like `make db-down` — never run `docker
compose down -v` or otherwise drop the data volume without explicit
confirmation.
