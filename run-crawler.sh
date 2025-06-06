#!/bin/bash

echo "🕷️ Web Crawler Error Checker"
echo "=========================="
echo ""

# Check if node_modules exists for Playwright
if [ ! -d "node_modules/playwright" ]; then
    echo "📦 Installing Playwright..."
    npm install playwright
    echo "✅ Playwright installed"
else
    echo "✅ Playwright already installed"
fi

# Check if ts-node is installed globally or locally
if ! command -v ts-node &> /dev/null && [ ! -f "node_modules/.bin/ts-node" ]; then
    echo "📦 Installing ts-node..."
    npm install --save-dev ts-node typescript @types/node
    echo "✅ ts-node installed"
else
    echo "✅ ts-node already available"
fi

# Install Playwright browsers if not already installed
echo "🌐 Ensuring Playwright browsers are installed..."
npx playwright install chromium

echo ""
echo "🚀 Starting crawler..."
echo "=========================="
echo ""

# Run the crawler
if [ -f "node_modules/.bin/ts-node" ]; then
    npx ts-node --project tsconfig.crawler.json crawl-check-errors.ts
else
    ts-node --project tsconfig.crawler.json crawl-check-errors.ts
fi 