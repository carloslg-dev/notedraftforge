# Workflow Rules — Doc Init

- SDD first: no code without spec
- GitHub issue must include: goal, scope, constraints, acceptance criteria, non-goals
- If underspecified → refuse with guidance
- Docs must be updated with code changes
- DoD: code + tests(if any) + docs + lint OK

## Commit Message Convention

Use Conventional Commits in English:
- `type(scope): message`

Common types:
- `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
- `feat(annotation): add needsReview resolution flow`
- `fix(snapshot): prevent duplicate regeneration on toggle`
- `chore(docs): update README and workflow conventions`
