#!/bin/bash

# ===================================================================
# MSSP Client Manager - Production Stop Script
# ===================================================================

echo "🛑 Stopping MSSP Client Manager Production Server..."
echo "=================================================="

# Find and kill production processes
PIDS=$(pgrep -f "tsx server/index.ts" || true)

if [ -z "$PIDS" ]; then
    echo "ℹ️  No production server processes found running."
else
    echo "🔍 Found production processes: $PIDS"
    echo "🛑 Stopping processes gracefully..."
    
    # Send SIGTERM first (graceful shutdown)
    kill -TERM $PIDS 2>/dev/null || true
    
    # Wait for graceful shutdown
    sleep 3
    
    # Check if processes are still running
    REMAINING=$(pgrep -f "tsx server/index.ts" || true)
    
    if [ ! -z "$REMAINING" ]; then
        echo "⚠️  Processes still running, forcing shutdown..."
        kill -KILL $REMAINING 2>/dev/null || true
        sleep 1
    fi
    
    echo "✅ Production server stopped successfully"
fi

# Check if port is now free
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 5001 is still in use by another process"
    lsof -Pi :5001 -sTCP:LISTEN
else
    echo "✅ Port 5001 is now available"
fi

echo "=================================================="
echo "🏁 Production shutdown complete" 