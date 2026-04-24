# Definition of Done — Agent Tasks

A task implemented by an AI agent is only complete when all of the following are true.

The project's base Definition of Done is in `openspec/workflow/workflow-rules.md`.
This document adds the operational layer specific to AI-assisted tasks.

---

## Process

- [ ] Task was documented in `.ai/current-task.md` before implementation started
- [ ] All 6 phases (PLAN → CONTEXT → IMPLEMENT → VALIDATE → REVIEW → RETRO) were followed
- [ ] Plan was documented before any code was written
- [ ] Context used was documented with justification

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

## Review

- [ ] Change was validated against the spec, not just the prompt
- [ ] `./scripts/ai/final-review.sh` passes (when available)
- [ ] No open blockers remain
