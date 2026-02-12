#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Simple test run: copy the existing dry-run post and commit with today's date
DRY_SRC="scripts/dry-run-output/auto-generated-post.mdx"
DATE=$(date +%F)
SLUG="${DATE}-top-5-gym-equipment-boost-strength.mdx"
DEST="src/content/post/$SLUG"
if [ ! -f "$DRY_SRC" ]; then
  echo "Dry-run source not found: $DRY_SRC"
  exit 1
fi
cp "$DRY_SRC" "$DEST"
# Update publishDate inside the file to today's date
sed -i "s/publishDate: .*/publishDate: ${DATE}/" "$DEST"
# Commit & push
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-Workout Quest Bot}"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-bot@workoutquest.local}"

git add "$DEST"
GIT_AUTHOR_NAME="$GIT_AUTHOR_NAME" GIT_AUTHOR_EMAIL="$GIT_AUTHOR_EMAIL" git commit -m "chore(blog): auto-generated post — Top 5 Gym Equipment That Actually Boost Strength"
git push origin main
# Log
mkdir -p logs
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) - pushed $DEST" >> logs/cron-blog.log
# Discord notification (if DISCORD_WEBHOOK set)
if [ -n "${DISCORD_WEBHOOK:-}" ]; then
  TITLE_LINE=$(grep -m1 '^title:' "$DEST" | sed 's/title: //')
  PAYLOAD=$(jq -nc --arg content "New blog post pushed: $TITLE_LINE" '{content: $content}')
  curl -s -H "Content-Type: application/json" -d "$PAYLOAD" "$DISCORD_WEBHOOK" >/dev/null || true
fi

echo "Done: $DEST"