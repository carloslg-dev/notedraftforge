# Development Workflow (Light GitFlow) — NoteDraftForge

This repo follows a **lightweight GitFlow** optimized for:
- single maintainer development
- clean traceability via Issues/Milestones
- safe contributions via PRs
- automated checks (CI, SonarCloud, Pages)

## Branching model

### Long-lived branches
- **main**
  - Always deployable.
  - Protected: merge via PR only.
  - GitHub Pages deploy is triggered from `main`.

(Optional if needed later)
- **develop**
  - Not used by default. We keep the flow simple with PRs into `main`.

### Short-lived branches
Create one branch per issue/ticket.

**Naming conventions**
- `feat/<issue-id>-short-description` → new functionality
- `fix/<issue-id>-short-description` → bug fixes
- `chore/<issue-id>-short-description` → tooling/CI/build/refactor without feature change
- `docs/<issue-id>-short-description` → documentation changes
- `test/<issue-id>-short-description` → tests only (or test-first work)

Examples:
- `feat/12-editor-metadata-ux`
- `chore/18-sonarcloud-integration`
- `docs/21-deploy-guide`
- `fix/17-library-crud-reactivity`

## Labels taxonomy (how to interpret issues)

### Type labels (what kind of work is it?)
- `type: feature` → user-facing capability or behavior change
- `type: fix` → bug fix (unexpected behavior)
- `type: chore` → tooling, CI/CD, refactor, dependency bumps, repo maintenance
- `type: docs` → documentation-only change
- `type: test` → tests-only change or test suite improvements

### Area labels (where does it belong?)
- `area: editor` → song editing UI/logic
- `area: library` → data loading, state management, CRUD, import/export
- `area: ci-cd` → GitHub Actions, Pages deployment, automation
- `area: quality` → SonarCloud, linting, quality gates, static analysis
- `area: docs` → documentation folder, README, guides
- `area: demo` → mock data, demo configuration, presentation polish

### Priority labels (when should it be done?)
- `priority: p0` → required for the current milestone; blocks release/demo
- `priority: p1` → strongly recommended; improves release quality
- `priority: p2` → optional polish / backlog

## Issue → branch → PR workflow

### 1) Pick an issue (from the active milestone)
- Make sure the issue has:
  - `type:*`
  - `area:*`
  - `priority:*`
  - clear Acceptance Criteria (AC)
- Assign the issue to yourself.

### 2) Create a branch from `main`
```bash
git checkout main
git pull
git checkout -b feat/<issue-id>-short-description
````

### 3) Commit conventions

Use Conventional Commits:

* `feat:` new user-facing functionality
* `fix:` bug fix
* `chore:` tooling/refactor/build changes
* `docs:` docs changes
* `test:` tests changes

Examples:

* `feat: improve song metadata form and validation`
* `chore: add CI workflow for lint/test/build`
* `docs: add deploy guide`

Prefer small commits that map to progress:

* one commit for scaffolding
* one commit per meaningful chunk
* final commit for cleanup/refactor

### 4) Open a PR early

Even if you’re the only developer, open PRs early to:

* keep a reviewable history
* trigger CI + SonarCloud checks
* make changes easy to revert

PR title format:

* `[v0.1] <Issue title> (#<issue-id>)`

PR description should include:

* Links: `Closes #<issue-id>`
* Summary (what/why)
* Checklist:

  * [ ] tests added/updated (if applicable)
  * [ ] docs updated (if applicable)
  * [ ] CI green
  * [ ] SonarCloud green

### 5) CI / quality gates (required before merge)

A PR is mergeable only if:

* CI workflow is ✅ (lint, tests, build)
* SonarCloud quality gate is ✅ (when enabled)
* Demo build works (if it affects routing or deploy)

### 6) Merge strategy

* Use **Squash and merge** for most PRs:

  * keeps `main` clean
  * one PR = one logical change
* Keep the squash commit message aligned with Conventional Commits:

  * `feat: ...`
  * `chore: ...`

### 7) After merge

* Delete the feature branch.
* Verify GitHub Pages deploy (if applicable).
* Close the issue (auto-closed by `Closes #...`).

## Release model (milestones → tags)

### Milestone completion (e.g., v0.1)

When all `priority: p0` issues in the milestone are done:

1. Create a release tag:

```bash
git checkout main
git pull
git tag v0.1.0
git push origin v0.1.0
```

2. Create a GitHub Release (optional but recommended):

* include demo URL
* include “What’s included” + “Next steps”

## Hotfixes

If a critical issue is found on `main`:

* create a `fix/<issue-id>-...` branch from `main`
* open PR, run CI
* merge ASAP
* tag patch release if needed: `v0.1.1`

## Collaboration guidelines (future-proof)

If external contributors join:

* keep `main` protected (PR only)
* require CI checks
* require “1 approval” (you)
* encourage:

  * one issue per PR
  * small PRs
  * no drive-by refactors without an issue

## Definition of Done (DoD)

An issue is “Done” when:

* Acceptance Criteria are met
* CI passes
* No obvious regressions in demo
* Docs updated when behavior/usage changes
* Linked issue is closed (`Closes #...`)

## Notes for this project

* The app is expected to work with in-memory data for v0.1.
* Persistence (Google Drive) is planned for v0.2.
* Prefer incremental improvements over big rewrites.
