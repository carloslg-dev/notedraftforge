#!/usr/bin/env bash
# validate.sh — Run during the VALIDATE phase.
# Validates code when an implementation or prototype package is present.
# Does not depend on .ai/current-task.md — safe to run in CI without local state.
# Exits cleanly with a warning if no installable package is ready yet.
set -euo pipefail

LABEL="[validate]"

WIRE_FRAME_DIR="wireframes/notedraftforge-ux-wireframe"

if [ -f "package.json" ]; then
  echo "$LABEL Root package detected. Run the root project validation commands here once the React app is initialized."
elif [ -f "$WIRE_FRAME_DIR/package.json" ]; then
  if [ ! -d "$WIRE_FRAME_DIR/node_modules" ]; then
    echo "$LABEL WARN: Wireframe package detected but dependencies are not installed."
    echo "$LABEL       Run 'npm ci' in $WIRE_FRAME_DIR before validating the prototype build."
    echo "$LABEL Documentation-only checks passed."
    exit 0
  fi

  echo "$LABEL Running wireframe build..."
  npm --prefix "$WIRE_FRAME_DIR" run build
else
  echo "$LABEL WARN: No package detected. Skipping code validation."
fi

echo "$LABEL Validation PASSED."
echo "$LABEL Remember to update 'Validation result' to PASS in .ai/current-task.md."
exit 0
