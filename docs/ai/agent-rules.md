# Agent Rules

This document defines the operational behavior rules for any AI agent (Claude, Codex, etc.)
working on this project.

For the SDD process, issue rules, commit convention, and development flow,
see `openspec/workflow/workflow-rules.md`. These rules are not duplicated here.

---

## General Behavior

- Follow the issue strictly
- Do not invent requirements
- Do not assume missing behavior
- If something is unclear, ask or flag it before proceeding

---

## Architecture Rules

- Respect DDD boundaries
- Respect hexagonal architecture
- Domain must not depend on infrastructure
- Adapters must not contain business logic

---

## Implementation Rules

- Prefer simple and explicit code
- Avoid unnecessary abstractions
- Do not introduce new patterns unless required by the spec
- Follow existing naming conventions (`openspec/terminology.md`)

---

## Safety Rules

- Do not modify files outside the declared scope
- Do not refactor outside the scope of the current issue
- Do not introduce breaking changes unless explicitly specified

---

## Output Expectations

- Code must be readable and consistent with the existing codebase
- Changes must be minimal and focused
- The result must be easy to review
