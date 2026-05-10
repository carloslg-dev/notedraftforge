# Definition of Done — Agent Tasks

A task implemented by an AI agent is only complete when all of the following are true.

The project's base Definition of Done is in `openspec/workflow/workflow-rules.md`.
This document adds the operational layer specific to AI-assisted tasks.

> Scripts in `scripts/ai/` are V1 minimum guardrails. Passing `final-review.sh`
> is a necessary condition for closure, not a sufficient one.

---

## Process

- [ ] Task was documented in `.ai/current-task.md` before implementation started
- [ ] Existing `.ai/current-task.md` was classified as continuation, side question, or new task before reuse
- [ ] If `.ai/current-task.md` was reused for a new task, the previous state was appended to `.ai/task-log.md` first
- [ ] All 6 phases (PLAN → CONTEXT → IMPLEMENT → VALIDATE → REVIEW → RETRO) were followed
- [ ] Execution authorization set to `approved` before IMPLEMENT phase
- [ ] Plan was documented before any code was written
- [ ] Context used was documented with justification
- [ ] `openspec/changes/<change>/execution-record.md` created and filled when closing a versioned change, epic, or sprint checkpoint

## Scope

- [ ] Changes are within the scope defined by the issue
- [ ] No files were modified outside the declared scope
- [ ] No unrelated refactors were introduced

## Quality

- [ ] Tests relevant to the change pass
- [ ] Lint passes
- [ ] Type checks pass
- [ ] No business logic was placed in adapters
- [ ] Domain boundaries were respected (DDD + hexagonal)

## Documentation

- [ ] Spec was updated if behavior changed
- [ ] Decisions were logged in `openspec/decisions/decisions.md` if applicable
- [ ] `.ai/current-task.md` reflects the final state (validation result, decisions, retro notes)
- [ ] `.ai/task-log.md` contains the prior task summary before `.ai/current-task.md` is reset

## Review

- [ ] Change was validated against the spec, not just the prompt
- [ ] No open blockers remain
- [ ] `./scripts/ai/final-review.sh <change-name>` passes when closing a versioned change, epic, or sprint checkpoint
