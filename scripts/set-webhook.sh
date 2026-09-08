#!/bin/bash
set -euo pipefail

PROJECT_REF="wwirhsiivcmtizeibmer"
BOT_TOKEN="${BOT_TOKEN:-}"
WEBHOOK_URL="https://${PROJECT_REF}.supabase.co/functions/v1/telegram-bot"

if [ -z "$BOT_TOKEN" ]; then
  BOT_TOKEN=$(grep -oP 'BOT_TOKEN=\K.*' "$(dirname "$0")/../bot/.env" 2>/dev/null || true)
fi

if [ -z "$BOT_TOKEN" ]; then
  echo "Ошибка: BOT_TOKEN не задан. Укажите: BOT_TOKEN=... $0"
  exit 1
fi

echo "Регистрация webhook: $WEBHOOK_URL"
curl -s -F "url=${WEBHOOK_URL}" "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" | python3 -m json.tool 2>/dev/null || \
curl -s -F "url=${WEBHOOK_URL}" "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook"

echo ""
echo "Проверка webhook:"
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | python3 -m json.tool 2>/dev/null || \
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"