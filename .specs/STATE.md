# STATE

## Decisions

### AD-001
- **Decision**: Linear issues with identifiers `AGB-N` are the canonical source for task scope, priority, dependencies, comments, and workflow state.
- **Reason**: The AgentBoard board already lives in Linear and GitHub Issues do not reflect its real state.
- **Trade-off**: Local automation requires an authenticated Linear MCP connection.
- **Scope**: Repository skills and every AgentBoard delivery workflow.
- **Date**: 2026-09-12
- **Status**: active

### AD-002
- **Decision**: GitHub is used only for code, branches, pull requests, reviews, merge state, and CI evidence.
- **Reason**: Keeping work state in one tracker avoids competing status systems.
- **Trade-off**: A PR cannot close a Linear issue through `Closes #N`; the issue is linked and updated through Linear instead.
- **Scope**: Repository skills and pull-request conventions.
- **Date**: 2026-09-12
- **Status**: active

### AD-003
- **Decision**: An AgentBoard issue reaches `Done` only after required CI checks pass, a human review is present, and the linked pull request is merged.
- **Reason**: Opening or approving a pull request alone does not prove that the delivered change is on the protected default branch.
- **Trade-off**: Completion remains partly human-gated and cannot be inferred from an agent review alone.
- **Scope**: All AgentBoard issue state transitions.
- **Date**: 2026-09-12
- **Status**: active

### AD-004
- **Decision**: Repository-scoped Codex skills live under `.agents/skills`.
- **Reason**: This is the repository discovery location documented for Codex.
- **Trade-off**: Claude-specific discovery through `.claude/skills` is not maintained in parallel.
- **Scope**: Repository automation skills.
- **Date**: 2026-09-12
- **Status**: active

## Handoff

- **Feature**: linear-agent-automation / `.specs/features/linear-agent-automation`
- **Phase / Task**: Execute complete through T7; external T8 remains blocked
- **Completed**: T1–T7; AgentBoard template verified in Linear; PR #1 merged
- **In-progress** (external): T8 branch protection, missing formal human approval, and AGB-10 closure
- **Next step**: An administrator must protect `main` and decide how formal human approval is recorded for this already-merged solo-owner PR; then AGB-10 can be reconciled.
- **Blockers**: GitHub connector lacks administration permission (403); browser extension remains unreachable.
- **Uncommitted files**: none
- **Branch**: `chore/linear-agent-automation`
