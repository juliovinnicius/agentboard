---
description: Run lint, tests, and build for both backend and frontend (the same checks CI runs)
---

Run the full local quality gate for AgentBoard, mirroring `.github/workflows/ci.yml`:

1. `cd backend && npm run lint && npm run test && npm run test:e2e && npm run build`
2. `cd frontend && npm run lint && npm run typecheck && npm run build`

Run each step and stop at the first failure. Report which command failed, the
relevant error output, and do not attempt a fix unless asked — this command is
for surfacing status, not for auto-remediation.
