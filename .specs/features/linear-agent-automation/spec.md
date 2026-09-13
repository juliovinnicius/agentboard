# Linear Agent Automation Specification

## Problem Statement

AgentBoard has working application foundations and CI, but its agent workflows are split between undiscoverable Claude skills, GitHub Issue commands, and an unprotected default branch. The automation must use Linear as the task system of record while retaining GitHub for code delivery and enforce a completion gate that reflects the merged state.

## Goals

- [ ] Make four AgentBoard workflow skills discoverable by Codex under `.agents/skills`.
- [ ] Make every task-state mutation target Linear issue identifiers `AGB-N`.
- [ ] Protect `main` with both CI jobs as required checks.
- [ ] Reconcile AGB-7 and AGB-10 with verified repository and GitHub state.
- [ ] Add reusable Linear labels and an agent-ready issue template when the connected workspace surface supports creation.
- [ ] Version the stable TLC harness configuration while excluding runtime state.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Authentication, domain models, product UI, or AI provider integration | The repository remains in its foundation stage and AGB-7 has not defined the product domain. |
| Automatic delegation or Linear Loops | Both require plan/integration setup beyond a safe manual pilot. |
| Automatic merge | Human review and confirmed merge are mandatory gates. |
| A second GitHub-based task/status system | Linear is the canonical task tracker. |

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Tracker authority | Linear owns issue data; GitHub owns code delivery | Explicit user architecture | yes |
| Completion transition | `Done` requires green required checks, human review, and merged PR | Explicit safety gate | yes |
| AGB-7 product decisions | Do not invent them; label and comment the missing specification | The repository explicitly says no domain exists | yes |
| Retry/idempotency | Skills re-read current labels, state, comments, PRs, and relations before writes | Prevent duplicate comments, labels, branches, and PRs | assumed |
| External partial failure | Preserve the last verified state, stop the transition, and report exact recovery steps | Linear and GitHub cannot be updated atomically | assumed |
| Template creation unavailable through MCP | Use authenticated UI if available; otherwise report the exact remaining manual action | The connected Linear tools expose template reads but no template write | assumed |

**Open questions:** none — all unresolved decisions are recorded above.

## User Stories

### P1: Execute AgentBoard work from Linear

**User Story**: As a maintainer, I want Codex skills to operate on AGB issues so that the board reflects the real delivery state.

**Acceptance Criteria**:

1. WHEN Codex scans the repository THEN it SHALL find exactly the four AgentBoard skills under `.agents/skills/*/SKILL.md`.
2. WHEN a skill receives an issue reference THEN it SHALL require `AGB-N` and use Linear MCP operations for issue content, relations, comments, labels, priority, and status.
3. WHEN implementation opens a PR THEN it SHALL link the Linear issue without using GitHub closing syntax for `#N`.
4. WHEN review evaluates delivery THEN it SHALL keep `Done` gated on green required checks, human review, and confirmed merge.

**Independent Test**: Inspect and validate all four skill folders, then verify that forbidden GitHub Issue commands and `Closes #N` conventions are absent.

### P1: Enforce the CI merge gate

**User Story**: As a maintainer, I want `main` protected by both CI jobs so that failing backend or frontend validation blocks merge.

**Acceptance Criteria**:

1. WHEN branch settings are read after configuration THEN `main` SHALL be protected.
2. WHEN required checks are read THEN they SHALL include `Backend (lint, test, build)` and `Frontend (lint, typecheck, build)` with strict/up-to-date enforcement.
3. WHEN changes target `main` THEN pull-request review SHALL be required and direct force pushes/deletions SHALL remain disabled.

**Independent Test**: Read the branch protection/ruleset configuration from GitHub and compare exact required check names.

### P1: Reconcile board metadata and foundation issues

**User Story**: As a maintainer, I want the Linear board to describe what is truly ready, blocked, or complete so that automation starts from reliable state.

**Acceptance Criteria**:

1. WHEN automation metadata is listed THEN labels `agent:ready`, `agent:blocked`, `needs:spec`, `human:required`, and `risk:high` SHALL exist for AgentBoard.
2. WHEN AGB-7 is inspected before its product decisions exist THEN it SHALL remain open and carry `needs:spec` plus `human:required`, with a comment naming the unresolved acceptance criteria.
3. WHEN AGB-10 is inspected before branch protection THEN it SHALL remain open; after protection is verified and all five criteria have evidence, it SHALL move to `Done` with an evidence comment.
4. WHEN an agent-ready issue template can be created through an authenticated supported surface THEN it SHALL include Context, Objective, Scope, Out of scope, Dependencies, Acceptance criteria, Likely files, Verification commands, and Agent handoff sections.

**Independent Test**: Re-read labels, AGB-7, AGB-10, their comments, and available templates from Linear.

### P2: Preserve local automation configuration

**User Story**: As a contributor, I want stable harness configuration versioned without runtime state so that clean worktrees are reproducible.

**Acceptance Criteria**:

1. WHEN Git status is inspected THEN `.tlc/harness/config.json` SHALL be trackable and `.tlc/harness/state/` SHALL be ignored.
2. WHEN the full repository gate runs THEN existing application lint, tests, typecheck, and builds SHALL still pass.

**Independent Test**: Use `git check-ignore`, `git status`, and the canonical Makefile gates.

## Edge Cases

- WHEN the Linear MCP is unavailable THEN a skill SHALL stop before changing state and explain how to reconnect it; it SHALL NOT fall back to GitHub Issues.
- WHEN a requested issue lacks `agent:ready` or has unresolved blockers THEN implementation SHALL stop without creating a branch or moving it to `In Progress`.
- WHEN a Linear or GitHub write partially fails THEN the skill SHALL comment only verified evidence and leave the issue in the last valid state.
- WHEN the worktree contains changes unrelated to the requested AGB issue THEN implementation SHALL stop instead of overwriting or staging them.
- WHEN a PR is approved but not merged THEN review SHALL keep the Linear issue in `In Review`, not `Done`.

## Implicit-Requirement Dimensions

| Dimension | Resolution |
| --- | --- |
| Input validation & bounds | Accept only `AGB-[1-9][0-9]*` issue identifiers and positive PR numbers. |
| Failure / partial-failure states | Stop at the last verified state and report the failed external write. |
| Idempotency / retry / duplicate handling | Re-read state and reuse existing labels, comments, branches, and PRs before creating them. |
| Auth boundaries & rate limits | Use authenticated connectors/browser; do not capture or print credentials. |
| Concurrency / ordering | Status transitions are sequential and revalidated immediately before mutation. |
| Data lifecycle / expiry | N/A because the feature creates durable configuration and tracker metadata, not expiring data. |
| Observability | Linear evidence comments and PR test summaries form the audit trail. |
| External-dependency failure | No GitHub-Issue fallback; actionable stop for unavailable Linear/GitHub capabilities. |
| State-transition integrity | `Triagem → ToDo → In Progress → In Review → Done`, with explicit guards for each transition. |

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| AUTO-01 | P1: discoverable skills | Execute | Verified |
| AUTO-02 | P1: Linear operations | Execute | Verified |
| AUTO-03 | P1: PR linking | Execute | Verified |
| AUTO-04 | P1: safe completion | Execute | Verified |
| AUTO-05 | P1: protected main | Execute | Pending |
| AUTO-06 | P1: Linear metadata | Execute | Pending |
| AUTO-07 | P1: issue reconciliation | Execute | Pending |
| AUTO-08 | P2: harness hygiene | Execute | Verified |

**Coverage:** 8 total, 8 mapped to tasks, 0 unmapped.

## Success Criteria

- [ ] All four skills pass the bundled skill validator from `.agents/skills`.
- [ ] No AgentBoard skill uses GitHub Issues as a task/status store.
- [ ] GitHub reports `main` protected with both named CI checks.
- [ ] Linear metadata and AGB-7/AGB-10 states match verified evidence.
- [ ] The repository-wide quality gate passes with no application behavior changes.
