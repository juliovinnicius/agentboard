# Linear Agent Automation Context

**Gathered:** 2026-09-12
**Spec:** `.specs/features/linear-agent-automation/spec.md`
**Status:** Ready for design

## Feature Boundary

Connect the existing foundation workflow to Linear, make its four skills discoverable by Codex, protect `main`, and reconcile only the foundation issues/metadata named by the user.

## Implementation Decisions

### Source of truth

- Linear issue `AGB-N` owns scope, dependencies, priority, comments, labels, and workflow state.
- GitHub owns branches, code, pull requests, checks, reviews, and merge state.

### Workflow transitions

- `Triagem`: normalized but not ready.
- `ToDo`: fully specified and labeled `agent:ready`.
- `In Progress`: implementation has started on a clean, issue-specific branch.
- `In Review`: PR exists, required checks are green, and automated review found no blocking gap.
- `Done`: a human review and confirmed merge are both present.

### Safety

- No automatic merge.
- No optimistic `Done` transition.
- External writes are preceded and followed by reads when the connector permits it.
- AGB-7 remains a human product-definition gate rather than receiving invented domain choices.

### Agent's Discretion

- Concise wording and colors for automation labels.
- Whether an external capability is exercised through its connector or authenticated browser, provided the postcondition is re-read.

### Declined / Undiscussed Gray Areas → Assumptions

- Duplicate comments are avoided by checking existing comments for the same evidence marker before adding a new one.
- An unavailable paid Codex delegation feature does not block local MCP-based workflows.

## Specific References

- Official Codex skill discovery: `https://learn.chatgpt.com/docs/build-skills`
- Official Codex in Linear setup and delegation: `https://learn.chatgpt.com/docs/third-party/linear`
- Linear Loops: `https://linear.app/docs/loops`

## Deferred Ideas

- Automatic Codex delegation through Linear triage rules.
- Scheduled board audits with Linear Loops.
