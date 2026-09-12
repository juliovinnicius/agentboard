# Linear Agent Automation Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `spec-driven-development` skill: activate it by name and follow its Execute flow and Critical Rules.

**Design**: `.specs/features/linear-agent-automation/design.md`
**Status**: Approved

## Test Coverage Matrix

> Generated from `AGENTS.md`, `README.md`, `.github/workflows/ci.yml`, package manifests, existing Vitest tests, and the feature spec.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Skill/config Markdown and JSON | none | Structural validation plus every AUTO requirement checked by invariant search | `.agents/skills/**`, `.tlc/**`, `.specs/**` | bundled `quick_validate.py`, `git check-ignore`, `rg` invariants |
| Backend application | unit + e2e | Existing three unit and one e2e tests remain green | `backend/src/**/*.spec.ts`, `backend/test/**/*.e2e-spec.ts` | `make test` |
| Frontend application/config | none | Lint, typecheck, and production build remain green | `frontend/src/**` | `make lint && make build` |
| External Linear/GitHub state | integration/read-back | Every write postcondition re-read from the authoritative service | Linear MCP / GitHub API or UI | connector reads after writes |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Individual skill/config task | skill validator plus scoped `rg`/JSON check |
| Full | External state transition | authoritative read-back of labels, issue state/comments, or branch protection |
| Build | Phase completion | `make lint && make test && make build` |

## Execution Plan

### Phase 1: Repository contract

`T1 → T2`

### Phase 2: Codex skills

`T2 → T3 → T4 → T5 → T6`

### Phase 3: External gates

`T6 → T7 → T8`

## Task Breakdown

### T1: Record the automation contract

**What**: Persist the specification, decisions, design, and execution plan as one feature contract.
**Where**: `.specs/STATE.md`, `.specs/features/linear-agent-automation/`
**Depends on**: None
**Reuses**: User-provided architecture and repository evidence
**Requirement**: AUTO-01 through AUTO-08
**Tools**: filesystem; skills `spec-driven-development`, `openai-docs`
**Done when**: documents contain closed assumptions, requirement traceability, approved design, coverage matrix, and eight consistent tasks.
**Tests**: none
**Gate**: Quick
**Commit**: `docs(automation): record Linear workflow specification`

### T2: Finalize the TLC harness tracking boundary

**What**: Track stable harness configuration while ignoring generated runtime state.
**Where**: `.gitignore`, `.tlc/harness/config.json`
**Depends on**: T1
**Reuses**: Existing user-created harness configuration
**Requirement**: AUTO-08
**Tools**: filesystem, Git
**Done when**: config parses, state is ignored, and config remains visible to Git.
**Tests**: none
**Gate**: Build
**Commit**: `chore(harness): track stable TLC configuration`

### T3: Port triage-agentboard

**What**: Install the triage workflow in the Codex repository skill path and align its transitions and validation with this contract.
**Where**: `.agents/skills/triage-agentboard/SKILL.md`
**Depends on**: T2
**Reuses**: `.claude/skills/triage-agentboard/SKILL.md`
**Requirement**: AUTO-01, AUTO-02
**Tools**: filesystem, Linear MCP; skill `skill-creator`
**Done when**: validator passes and the workflow accepts only `AGB-N`, never GitHub Issues.
**Tests**: none
**Gate**: Quick
**Commit**: `feat(skills): port AgentBoard triage to Codex`

### T4: Port prepare-agentboard-issue

**What**: Replace the GitHub-based preparation skill with a Linear-native readiness workflow.
**Where**: `.agents/skills/prepare-agentboard-issue/SKILL.md`
**Depends on**: T3
**Reuses**: `.claude/skills/prepare-for-codex/SKILL.md`
**Requirement**: AUTO-01, AUTO-02, AUTO-04
**Tools**: filesystem, Linear MCP; skill `skill-creator`
**Done when**: validator passes; readiness writes Linear handoff, `agent:ready`, and `ToDo` only after all guards pass.
**Tests**: none
**Gate**: Quick
**Commit**: `feat(skills): prepare Linear issues for agents`

### T5: Port implement-agentboard-issue

**What**: Make implementation read/update Linear while using GitHub only for branch, PR, CI, and review evidence.
**Where**: `.agents/skills/implement-agentboard-issue/SKILL.md`
**Depends on**: T4
**Reuses**: `.claude/skills/implement-agentboard-issue/SKILL.md`
**Requirement**: AUTO-01, AUTO-02, AUTO-03
**Tools**: filesystem, Linear MCP, Git/GitHub; skills `skill-creator`, `github-pr-workflow`
**Done when**: validator passes; `AGB-N`, clean-worktree, blocker, idempotency, evidence-comment, and no-auto-merge guards are explicit.
**Tests**: none
**Gate**: Quick
**Commit**: `feat(skills): implement Linear-backed AgentBoard issues`

### T6: Port review-agentboard-pr

**What**: Make PR review reconcile its Linear issue through safe `In Progress`, `In Review`, and `Done` guards.
**Where**: `.agents/skills/review-agentboard-pr/SKILL.md`
**Depends on**: T5
**Reuses**: `.claude/skills/review-agentboard-pr/SKILL.md`
**Requirement**: AUTO-01, AUTO-02, AUTO-04
**Tools**: filesystem, Linear MCP, GitHub; skill `skill-creator`
**Done when**: validator passes; no GitHub status labels or automatic approval/merge; `Done` requires green checks, human approval, and merge.
**Tests**: none
**Gate**: Build
**Commit**: `feat(skills): review PRs against Linear issues`

### T7: Reconcile Linear automation metadata

**What**: Create the five labels, mark AGB-7's specification blockers, create the issue template if supported, and reconcile AGB-10 only from branch evidence.
**Where**: AgentBoard team and AGB-7/AGB-10 in Linear
**Depends on**: T6
**Reuses**: Existing statuses and issue relations
**Requirement**: AUTO-06, AUTO-07
**Tools**: Linear MCP; authenticated browser only for unsupported template creation
**Done when**: label/issue/comment/template state is re-read and matches the spec; AGB-10 remains open until T8 passes.
**Tests**: integration/read-back
**Gate**: Full
**Commit**: none (external state only)

### T8: Protect main and close the verified loop

**What**: Configure GitHub protection, verify both required checks, then finish AGB-10 and publish the feature branch/PR.
**Where**: GitHub repository settings, Linear AGB-10, remote branch/PR
**Depends on**: T7
**Reuses**: Exact CI job names from `.github/workflows/ci.yml`
**Requirement**: AUTO-05, AUTO-07
**Tools**: authenticated browser, Git/GitHub, Linear MCP; skill `github-pr-workflow`
**Done when**: protection read-back matches all ACs, AGB-10 has evidence and is `Done`, branch is pushed, and a reviewable PR exists.
**Tests**: integration/read-back
**Gate**: Full
**Commit**: none beyond prior atomic commits

## Phase Execution Map

```text
Phase 1: T1 -> T2
Phase 2:       T2 -> T3 -> T4 -> T5 -> T6
Phase 3:                              T6 -> T7 -> T8
```

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | One specification artifact set | ✅ Cohesive |
| T2 | One harness tracking boundary | ✅ Cohesive |
| T3 | One skill file | ✅ Granular |
| T4 | One skill file | ✅ Granular |
| T5 | One skill file | ✅ Granular |
| T6 | One skill file | ✅ Granular |
| T7 | One Linear board reconciliation | ✅ Cohesive external transaction with read-back |
| T8 | One merge-gate activation and closure | ✅ Cohesive guarded transition |

## Diagram-Definition Cross-Check

| Task | Depends On | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | Entry | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T2 | T2 → T3 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T5 | T5 → T6 | ✅ |
| T7 | T6 | T6 → T7 | ✅ |
| T8 | T7 | T7 → T8 | ✅ |

## Test Co-location Validation

| Task | Layer | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Docs/config | none + structural | none + Quick | ✅ |
| T2 | Config | none + build | none + Build | ✅ |
| T3 | Skill | none + structural | none + Quick | ✅ |
| T4 | Skill | none + structural | none + Quick | ✅ |
| T5 | Skill | none + structural | none + Quick | ✅ |
| T6 | Skill | none + structural + app regression | none + Build | ✅ |
| T7 | External state | integration/read-back | integration/read-back + Full | ✅ |
| T8 | External state | integration/read-back | integration/read-back + Full | ✅ |
