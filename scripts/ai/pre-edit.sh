#!/usr/bin/env bash
# pre-edit.sh — Run before editing any application file.
# Blocks (exit 1) if task state is missing, phase is not IMPLEMENT,
# or execution authorization is not approved.
# Warns if the context table appears empty.
set -euo pipefail

LABEL="[pre-edit]"
TASK_FILE=".ai/current-task.md"

# --- Task state must exist ---
if [ ! -f "$TASK_FILE" ]; then
  echo "$LABEL ERROR: $TASK_FILE not found." >&2
  echo "$LABEL       Create it first: cp docs/ai/current-task.template.md $TASK_FILE" >&2
  exit 1
fi

# --- Phase must be IMPLEMENT ---
# Reads the first non-blank, non-comment line after "## Current phase"
CURRENT_PHASE=$(awk '
  /^## Current phase/ { found=1; next }
  found && /^## /     { exit }
  found && NF && !/^<!--/ { print; exit }
' "$TASK_FILE" | tr -d '[:space:]')

if [ "${CURRENT_PHASE}" != "IMPLEMENT" ]; then
  echo "$LABEL ERROR: Current phase is '${CURRENT_PHASE:-not set}', expected IMPLEMENT." >&2
  echo "$LABEL       Set 'Current phase' to IMPLEMENT in $TASK_FILE before editing." >&2
  exit 1
fi

# --- Execution authorization must be approved ---
# Reads Status field from the "## Execution authorization" section.
# Expected: Status: approved  (case-insensitive)
AUTH_STATUS=$(awk '
  /^## Execution authorization/ { found=1; next }
  found && /^## /               { exit }
  found && /^Status:/           { print; exit }
' "$TASK_FILE" | sed 's/^Status:[[:space:]]*//' | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')

if [ "${AUTH_STATUS}" != "approved" ]; then
  echo "$LABEL ERROR: Execution authorization status is '${AUTH_STATUS:-not set}', expected 'approved'." >&2
  echo "$LABEL       Set in $TASK_FILE under '## Execution authorization':" >&2
  echo "$LABEL         Status: approved" >&2
  echo "$LABEL         Source: human | agent | delegated | ci" >&2
  exit 1
fi

# --- Context: warn if table has no data rows ---
# Filters out: separator rows (|---|), empty rows (| | | |), and the header row (| Source |)
CONTEXT_DATA=$(awk '
  /^## Context selected/ { f=1; next }
  f && /^## /            { exit }
  f && /^\|/             { print }
' "$TASK_FILE" \
  | grep -v '^|[-: |]*$' \
  | grep -vF '| Source |' \
  | grep -v '^| *|' \
  || true)

if [ -z "$CONTEXT_DATA" ]; then
  echo "$LABEL WARN: Context selected table appears empty."
  echo "$LABEL       Document your context before editing (docs/ai/context-strategy.md)."
fi

echo "$LABEL Phase: IMPLEMENT. Execution authorization: approved. Proceeding."
exit 0
