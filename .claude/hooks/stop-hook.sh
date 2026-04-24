#!/usr/bin/env bash
# stop-hook.sh — Stop hook adapter for Claude Code.
# Only runs final-review.sh when current phase is RETRO.
# Exits 0 silently for all other phases or missing task state.
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$REPO_ROOT"

TASK_FILE=".ai/current-task.md"
[ ! -f "$TASK_FILE" ] && exit 0

PHASE=$(awk '
  /^## Current phase/ { found=1; next }
  found && /^## /     { exit }
  found && NF && !/^<!--/ && !/^---/ { print; exit }
' "$TASK_FILE" | tr -d '[:space:]')

[ "$PHASE" != "RETRO" ] && exit 0

CHANGE_NAME=$(./scripts/ai/resolve-change-name.sh)
if [ -z "$CHANGE_NAME" ]; then
  echo "[stop-hook] Blocking RETRO close: Change reference is missing in .ai/current-task.md" >&2
  exit 2
fi

./scripts/ai/final-review.sh "$CHANGE_NAME" || exit 2
