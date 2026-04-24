# AI Pipeline — Baseline V1

> This is a snapshot, not a living document.
> It marks the reproducible starting point for experiments with Claude Code Cloud and Codex Cloud.
> Do not evolve this file — create new experiment entries in `log.md` instead.

## Tag

```
ai-pipeline-v1
```

## Purpose

Establish a stable, portable baseline that can be reproduced in any Claude Code or Codex Cloud
session without local state. Experiments branching from this baseline can be compared against it
without ambiguity.

## What the baseline contains

### Operational layer — `docs/ai/`

| File | Role |
|---|---|
| `workflow.md` | Mandatory phase sequence: PLAN → CONTEXT → IMPLEMENT → VALIDATE → REVIEW → RETRO |
| `agent-rules.md` | Implementation constraints and boundaries |
| `context-strategy.md` | Progressive context loading strategy |
| `done-definition.md` | Agent definition of done |
| `current-task.template.md` | Local task state template (gitignored when active) |
| `execution-record.template.md` | Versioned change record template |

### Enforcement layer — `scripts/ai/`

| Script | CI-safe | Role |
|---|---|---|
| `pre-plan.sh` | Yes | Blocks if required docs/ai/ or openspec/ documents are missing |
| `pre-edit.sh` | No | Blocks edits if phase ≠ IMPLEMENT or authorization ≠ approved |
| `post-edit.sh` | No | Lists changed files, reminds agent to update current-task.md |
| `validate.sh` | Yes | Runs ng lint + ng test; exits cleanly if no Angular project yet |
| `final-review.sh` | No | RETRO gate: validates current-task.md and execution-record.md |
| `resolve-change-name.sh` | No | Reads Change reference from current-task.md; always exits 0 |

### Claude Code adapter layer — `.claude/`

| File | Role |
|---|---|
| `settings.json` | Hook wiring: PreToolUse / PostToolUse / Stop |
| `hooks/pre-edit-hook.sh` | Translates pre-edit.sh exit 1 → exit 2 for Claude blocking |
| `hooks/post-edit-hook.sh` | Calls post-edit.sh after resolving repo root |
| `hooks/stop-hook.sh` | Phase-gated: only runs final-review.sh when phase is RETRO |

### CI layer — `.github/workflows/`

| File | Triggers | Steps |
|---|---|---|
| `ai-pipeline.yml` | push to main / docs/create-agent-pipeline, PR to main | pre-plan.sh + validate.sh |

### Product spec layer — `openspec/`

Not part of the pipeline itself. The pipeline enforces that key openspec files exist
(`project.md`, `workflow/workflow-rules.md`) but does not validate their content.

## What the baseline does NOT include

- `ci-review.sh` — CI-safe replacement for `final-review.sh` (planned)
- Commit message linting
- Automatic issue/PR management
- Any Angular application code

## Design principles captured at this baseline

- **Three-layer separation**: `openspec/` (product/spec) | `docs/ai/` (agent operational) | `scripts/ai/` (enforcement)
- **Portability**: scripts are plain bash, runnable by any agent or human without Claude Code
- **Thin adapters**: `.claude/hooks/` contains no logic — only translation (exit codes, cwd)
- **Defensive redundancy**: repo root resolved in both `settings.json` command and hook scripts
- **CI-safety by design**: `validate.sh` and `pre-plan.sh` have zero dependency on `.ai/` (gitignored)
