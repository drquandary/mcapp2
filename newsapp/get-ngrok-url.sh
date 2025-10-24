#!/bin/bash

echo "=================================================="
echo "           NEWSBADGER NGROK URL"
echo "=================================================="
echo ""

# Check if ngrok is running
if ! curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    echo "❌ Ngrok is not running!"
    echo ""
    echo "To start ngrok, run:"
    echo "   ngrok http 8080"
    echo ""
    exit 1
fi

# Get the ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Could not get ngrok URL"
    exit 1
fi

echo "✅ Ngrok is running!"
echo ""
echo "📱 Your NewsBadger App URL:"
echo "   $NGROK_URL/newsapp/index.html"
echo ""
echo "🌍 Share this URL with anyone to access your app"
echo ""
echo "=================================================="

# Copy to clipboard if pbcopy is available
if command -v pbcopy > /dev/null 2>&1; then
    echo "$NGROK_URL/newsapp/index.html" | pbcopy
    echo "📋 URL copied to clipboard!"
    echo ""
fi
