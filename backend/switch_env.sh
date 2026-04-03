#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
  echo "Usage: ./switch_env.sh [local|supabase]"
  exit 1
fi

case "$TARGET" in
  local)
    cp ".env.local.example" ".env"
    echo "Switched to LOCAL database config (.env)"
    ;;
  supabase)
    cp ".env.supabase.example" ".env"
    echo "Switched to SUPABASE template (.env)"
    echo "Reminder: update .env with your real Supabase password and project ref."
    ;;
  *)
    echo "Unknown target: $TARGET"
    echo "Usage: ./switch_env.sh [local|supabase]"
    exit 1
    ;;
esac
