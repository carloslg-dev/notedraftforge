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

---

## Phase 1: PLAN

**Objective:** Understand the task, propose a strategy, identify risks and needed context.

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
- Approved plan and selected context
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
- Run `./scripts/ai/validate.sh` if available (or equivalent: `ng test`, `ng lint`)
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
- Run `./scripts/ai/final-review.sh` if available
- Validate against spec, not intuition
- Check domain consistency and architectural boundaries

---

## Phase 6: RETRO

**Objective:** Learn from the process. Improve docs, scripts, prompts.

**Outputs:**
- Retrospective notes in `.ai/current-task.md`

**Questions to answer:**
- What context was missing at the start?
- Which document was most useful?
- Which rule was ambiguous?
- What validation should be automated?
- What should be moved to `docs/ai/`?

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
| Execution checklist | `docs/ai/templates/checklist-execution.md` |
| Review checklist | `openspec/templates/checklist-review.md` |
