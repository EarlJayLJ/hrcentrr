#!/bin/bash
echo "==================================================="
echo "    National Youth Authority - Ghana"
echo "    NYA HR Central - Local LAN Server Engine"
echo "==================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Install it via: curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs"
    exit 1
fi

# Install dependencies if missing
if [ ! -d "node_modules" ]; then
    echo "[1/3] Installing dependencies..."
    npm install
fi

# Build production assets if missing
if [ ! -d "dist" ]; then
    echo "[2/3] Building production assets..."
    npm run build
fi

echo "[3/3] Starting NYA HR Central Server..."
echo "Server is live on http://0.0.0.0:3000"
echo ""

export NODE_ENV=production
export PORT=3000
exec node server.ts
