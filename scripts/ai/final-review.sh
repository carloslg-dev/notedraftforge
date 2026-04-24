#!/usr/bin/env bash
# final-review.sh — Run at the end of RETRO phase, before committing.
# Quality gate for task closure:
#   1. Checks .ai/current-task.md: authorization, validation result, blockers, retro.
#   2. Checks openspec/changes/<change-name>/execution-record.md: existence and content.
#
# Usage:
#   ./scripts/ai/final-review.sh <change-name>
#
# <change-name> must match a directory under openspec/changes/.
set -euo pipefail

LABEL="[final-review]"
TASK_FILE=".ai/current-task.md"
FAILED=0

# --- Argument: change-name is mandatory ---
if [ -z "${1:-}" ]; then
  echo "$LABEL ERROR: Missing required argument <change-name>." >&2
  echo "$LABEL Usage: $0 <change-name>" >&2
  echo "$LABEL        <change-name> must match a directory under openspec/changes/" >&2
  exit 1
fi
CHANGE_NAME="$1"

# ============================================================
# Part 1: .ai/current-task.md checks
# ============================================================

if [ ! -f "$TASK_FILE" ]; then
  echo "$LABEL ERROR: $TASK_FILE not found." >&2
  exit 1
fi

echo "$LABEL Checking $TASK_FILE..."

# --- Execution authorization must be approved ---
AUTH_STATUS=$(awk '
  /^## Execution authorization/ { found=1; next }
  found && /^## /               { exit }
  found && /^Status:/           { print; exit }
' "$TASK_FILE" | sed 's/^Status:[[:space:]]*//' | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')

if [ "${AUTH_STATUS}" != "approved" ]; then
  echo "$LABEL FAIL: Authorization status is '${AUTH_STATUS:-not set}', expected 'approved'." >&2
  FAILED=1
else
  echo "$LABEL   Authorization: approved."
fi

# --- Validation result must be PASS ---
VALIDATION_RESULT=$(awk '
  /^## Validation result/ { found=1; next }
  found && /^## /         { exit }
  found && NF && !/^<!--/ { print; exit }
' "$TASK_FILE" | tr -d '[:space:]')

if [ "${VALIDATION_RESULT}" != "PASS" ]; then
  echo "$LABEL FAIL: Validation result is '${VALIDATION_RESULT:-not set}', expected PASS." >&2
  echo "$LABEL      Run ./scripts/ai/validate.sh and update .ai/current-task.md." >&2
  FAILED=1
else
  echo "$LABEL   Validation: PASS."
fi

# --- Blockers must be resolved ---
# Accepted: None, No blockers, N/A, empty section, comment placeholder, bare dash
BLOCKER_CONTENT=$(awk '
  /^## Blockers/ { found=1; next }
  found && /^## / { exit }
  found          { print }
' "$TASK_FILE" | grep -v '^[[:space:]]*$' || true)

REAL_BLOCKERS=$(echo "$BLOCKER_CONTENT" \
  | grep -viE '^\s*-?\s*(none|no blockers?|n\/a)\s*$' \
  | grep -viE '^\s*-?\s*<!--.*-->\s*$' \
  | grep -v '^[[:space:]]*-[[:space:]]*$' \
  || true)

if [ -n "$REAL_BLOCKERS" ]; then
  echo "$LABEL FAIL: Open blockers found:" >&2
  echo "$REAL_BLOCKERS" | while IFS= read -r line; do
    echo "$LABEL   $line" >&2
  done
  FAILED=1
else
  echo "$LABEL   Blockers: none."
fi

# --- Retrospective notes must have content ---
RETRO_CONTENT=$(awk '
  /^## Retrospective notes/ { found=1; next }
  found && /^## /           { exit }
  found                     { print }
' "$TASK_FILE" | grep -v '^[[:space:]]*$' || true)

REAL_RETRO=$(echo "$RETRO_CONTENT" \
  | grep -viE '^\s*-?\s*<!--.*-->\s*$' \
  | grep -v '^[[:space:]]*-[[:space:]]*$' \
  || true)

if [ -z "$REAL_RETRO" ]; then
  echo "$LABEL FAIL: Retrospective notes are empty." >&2
  echo "$LABEL      Add notes under '## Retrospective notes' in $TASK_FILE." >&2
  FAILED=1
else
  echo "$LABEL   Retrospective: found."
fi

# ============================================================
# Part 2: execution-record.md checks
# ============================================================

RECORD_PATH="openspec/changes/${CHANGE_NAME}/execution-record.md"

echo "$LABEL Checking $RECORD_PATH..."

if [ ! -f "$RECORD_PATH" ]; then
  echo "$LABEL FAIL: Execution record not found: $RECORD_PATH" >&2
  echo "$LABEL       Copy docs/ai/execution-record.template.md and fill it in." >&2
  FAILED=1
else
  # 1. Task reference must not be empty
  TASK_REF=$(awk '
    /^## Task reference/ { found=1; next }
    found && /^## /      { exit }
    found && NF && !/^<!--/ { print; exit }
  ' "$RECORD_PATH" | tr -d '[:space:]')

  if [ -z "$TASK_REF" ]; then
    echo "$LABEL FAIL: execution-record: 'Task reference' is empty." >&2
    FAILED=1
  else
    echo "$LABEL   Task reference: OK ($TASK_REF)"
  fi

  # 2. Change reference must not be empty
  CHANGE_REF=$(awk '
    /^## Change reference/ { found=1; next }
    found && /^## /        { exit }
    found && NF && !/^<!--/ { print; exit }
  ' "$RECORD_PATH" | tr -d '[:space:]')

  if [ -z "$CHANGE_REF" ]; then
    echo "$LABEL FAIL: execution-record: 'Change reference' is empty." >&2
    FAILED=1
  else
    echo "$LABEL   Change reference: OK ($CHANGE_REF)"
  fi

  # 3. Execution authorization must be approved
  RECORD_AUTH=$(awk '
    /^## Execution authorization/ { found=1; next }
    found && /^## /               { exit }
    found && /^Status:/           { print; exit }
  ' "$RECORD_PATH" | sed 's/^Status:[[:space:]]*//' | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')

  if [ "${RECORD_AUTH}" != "approved" ]; then
    echo "$LABEL FAIL: execution-record: Authorization status is '${RECORD_AUTH:-not set}', expected 'approved'." >&2
    FAILED=1
  else
    echo "$LABEL   Authorization: OK"
  fi

  # 4. Validation result must be PASS
  RECORD_VALIDATION=$(awk '
    /^## Validation result/ { found=1; next }
    found && /^## /         { exit }
    found && NF && !/^<!--/ { print; exit }
  ' "$RECORD_PATH" | tr -d '[:space:]')

  if [ "${RECORD_VALIDATION}" != "PASS" ]; then
    echo "$LABEL FAIL: execution-record: Validation result is '${RECORD_VALIDATION:-not set}', expected PASS." >&2
    FAILED=1
  else
    echo "$LABEL   Validation result: OK"
  fi

  # 5. Retrospective summary must have content
  RECORD_RETRO=$(awk '
    /^## Retrospective summary/ { found=1; next }
    found && /^## /             { exit }
    found                       { print }
  ' "$RECORD_PATH" | grep -v '^[[:space:]]*$' \
    | grep -viE '^\s*-?\s*<!--.*-->\s*$' \
    | grep -v '^[[:space:]]*-[[:space:]]*$' \
    || true)

  if [ -z "$RECORD_RETRO" ]; then
    echo "$LABEL FAIL: execution-record: 'Retrospective summary' is empty." >&2
    FAILED=1
  else
    echo "$LABEL   Retrospective summary: OK"
  fi
fi

# ============================================================
# Final result
# ============================================================

if [ "$FAILED" -eq 1 ]; then
  echo "$LABEL Final review FAILED. Fix issues before committing." >&2
  exit 1
fi

echo "$LABEL Final review PASSED. Task is ready for commit."
exit 0
