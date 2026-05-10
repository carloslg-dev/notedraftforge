# Agent Workflow

This document defines the mandatory phases an AI agent must follow on any task in this project.

The underlying SDD development process (spec-first, issue rules, commit convention) is defined in
`openspec/workflow/workflow-rules.md`. This document defines how the agent executes within that process.

---

## Phase sequence

```
PLAN → CONTEXT → IMPLEMENT → VALIDATE → REVIEW → RETRO
```

Phases must not be skipped. No code changes before IMPLEMENT phase.
Update `.ai/current-task.md` at the start and end of each phase.

## Conversation continuity and task state

`.ai/current-task.md` is **live state**, not long-term history. It must not be overwritten just because the user asks a follow-up question.

Before starting PLAN for any user message, classify the message:

| Classification | Meaning | Required state behavior |
|---|---|---|
| Continuation | Follow-up, clarification, correction, review, or next step for the active analysis/change | Keep the existing `.ai/current-task.md`; append new commands, decisions, blockers, and phase transitions to the same task |
| Side question | Short question that does not change the active task scope | Keep `.ai/current-task.md`; answer directly; log only material decisions or constraints |
| New task | New goal, unrelated scope, or explicit request to start different work | Roll the current task into `.ai/task-log.md` before reusing `.ai/current-task.md` |

If unsure whether a message is a continuation or a new task, default to **continuation** and ask only if state separation matters.

### Rollover rule

Before replacing `.ai/current-task.md` for a new task:

1. If `.ai/task-log.md` does not exist, create it from `docs/ai/task-log.template.md`.
2. Append a summary of the current task to `.ai/task-log.md`.
3. Include at least: task ID, change reference, goal, final phase, validation result, files changed, decisions, blockers, retrospective notes, and follow-up items.
4. Only then reset `.ai/current-task.md` from `docs/ai/current-task.template.md` or rewrite it for the new task.

Never discard `.ai/current-task.md` contents without either:
- rolling them into `.ai/task-log.md`, or
- explicit user instruction to discard the state.

### Retrospective cadence

Task-level retrospective notes remain in `.ai/current-task.md` and `.ai/task-log.md`.

Versioned execution records under `openspec/changes/<change-name>/execution-record.md` are closure artifacts. They may be written:
- per issue/change when a small change is being closed, or
- per epic/sprint when the user wants to review a batch of completed tasks.

For epic/sprint closure, synthesize the execution record from `.ai/task-log.md`, the current task, and the relevant `openspec/changes/` artifacts.

`final-review.sh <change-name>` is still required before considering a versioned change/epic/sprint closure ready to commit, but ordinary follow-up questions must not force a new execution record.

> **Scripts note:** Scripts in `scripts/ai/` are V1 minimum guardrails.
> They enforce a structural baseline but do not replace agent judgment or human review.

---

## Phase 1: PLAN

**Objective:** Understand the task, propose a strategy, identify risks and needed context.

**Before PLAN:**
- Classify the user message as continuation, side question, or new task.
- If it is a new task, apply the rollover rule before resetting `.ai/current-task.md`.
- If it is a continuation, update the existing `.ai/current-task.md` in place.

**Inputs:**
- GitHub issue (with spec reference, acceptance criteria, scope)
- `openspec/project.md`
- Relevant spec from `openspec/specs/<feature>/spec.md`

**Outputs:**
- Documented plan: goal, strategy, risks, unknowns
- Initial list of documents and files to review
- `.ai/current-task.md` updated (phase: PLAN, goal, task ID)

**Constraints:**
- No code changes in this phase
- If the issue is ambiguous, flag it before proceeding

---

## Phase 2: CONTEXT

**Objective:** Select minimum sufficient context. Justify each source. Detect missing context.

**Inputs:**
- Plan from PLAN phase
- `docs/ai/context-strategy.md`

**Outputs:**
- Context table (source, reason, confidence)
- List of intentionally excluded context
- List of missing context with impact assessment
- `.ai/current-task.md` updated (phase: CONTEXT, context selected)

**Constraints:**
- Load context progressively — see `docs/ai/context-strategy.md`
- If critical context is missing and cannot be resolved, stop and report before continuing

---

## Phase 3: IMPLEMENT

**Objective:** Make the change. Small, focused, reviewable.

**Inputs:**
- Execution authorization with status `approved` in `.ai/current-task.md`
- Selected context from CONTEXT phase
- Relevant spec and domain model

**Before editing:**
- Confirm phase is IMPLEMENT in `.ai/current-task.md`
- Run `./scripts/ai/pre-edit.sh` if available

**After editing:**
- Run `./scripts/ai/post-edit.sh` if available
- Update `.ai/current-task.md` (files actually changed)

**Constraints:**
- See `docs/ai/agent-rules.md` for implementation rules
- See `docs/ai/templates/checklist-execution.md` before starting
- Do not refactor outside scope
- Do not mix multiple concerns in one change

---

## Phase 4: VALIDATE

**Objective:** Verify changes automatically before human review.

**Outputs:**
- Validation result: PASS / FAIL / PARTIAL
- `.ai/current-task.md` updated (validation result)

**Constraints:**
- Run `./scripts/ai/validate.sh` if available, or the equivalent project lint/test/build commands
- If validation fails: attempt fix within scope
- If validation fails twice: stop and report — do not proceed to REVIEW

---

## Phase 5: REVIEW

**Objective:** Verify coherence, spec compliance, and absence of side effects.

**Inputs:**
- Changed files
- Original spec and acceptance criteria
- `openspec/templates/checklist-review.md`

**Outputs:**
- Review result
- `.ai/current-task.md` updated (decisions, blockers if any)

**Constraints:**
- Validate against spec, not intuition
- Check domain consistency and architectural boundaries
- Do not run `final-review.sh` here — that is the RETRO gate

---

## Phase 6: RETRO

**Objective:** Learn from the process. Write execution record. Close the task.

**Outputs:**
- Retrospective notes in `.ai/current-task.md` (mandatory — see below)
- `.ai/task-log.md` updated before the task state is reused
- `openspec/changes/<change-name>/execution-record.md` created and filled when closing a versioned change, epic, or sprint checkpoint

**Questions to answer (required):**
- What context was missing at the start?
- Which document was most useful?
- Which rule was ambiguous?
- What validation should be automated?
- What should be moved to `docs/ai/`?

**Closing gate:**

Run `./scripts/ai/final-review.sh <change-name>` at the end of this phase when closing a versioned change, epic, or sprint checkpoint.
`<change-name>` is mandatory. It must match:
- The `Change reference` field in `.ai/current-task.md` (canonical source during local work)
- The folder name under `openspec/changes/`
- In future CI runs: derived from branch name or PR metadata

The script blocks if retrospective notes are empty or if `execution-record.md` is incomplete.
Only after it passes is the task ready for commit.

---

## Reference

| Need | File |
|---|---|
| SDD process and issue rules | `openspec/workflow/workflow-rules.md` |
| Agent behavior rules | `docs/ai/agent-rules.md` |
| Context selection strategy | `docs/ai/context-strategy.md` |
| Definition of Done | `docs/ai/done-definition.md` |
| Task state (local, not versioned) | `.ai/current-task.md` |
| Task state template | `docs/ai/current-task.template.md` |
| Rolling task log (local, not versioned) | `.ai/task-log.md` |
| Rolling task log template | `docs/ai/task-log.template.md` |
| Execution record (versioned, per change) | `openspec/changes/<change>/execution-record.md` |
| Execution record template | `docs/ai/execution-record.template.md` |
| Execution checklist | `docs/ai/templates/checklist-execution.md` |
| Review checklist | `openspec/templates/checklist-review.md` |

### Script scope

| Script | CI-safe | Purpose |
|---|---|---|
| `validate.sh` | Yes | Code validation only — no local state required |
| `final-review.sh` | No | Local/agent closure gate — reads `.ai/current-task.md` |
| `ci-review.sh` | Yes (future) | Will read only versioned artifacts in `openspec/changes/` |
