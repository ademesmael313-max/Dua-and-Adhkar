#!/usr/bin/env bash
# Builds the Noor web app and copies the production bundle into the Android
# WebView shell. Run this after changing anything under src/ or public/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/android/app/src/main/assets/www"

cd "$ROOT"
npm run build

rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$ROOT/dist/." "$DEST"

COUNT="$(find "$DEST" -type f | wc -l | tr -d ' ')"
echo "Synced $COUNT files into android/app/src/main/assets/www"
