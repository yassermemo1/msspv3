#!/bin/bash

# ===================================================================
# MSSP Client Manager - Production Status Script
# ===================================================================

echo "📊 MSSP Client Manager Production Status"
echo "=================================================="

# Check if server processes are running
PIDS=$(pgrep -f "tsx server/index.ts" || true)

if [ -z "$PIDS" ]; then
    echo "❌ Production server: NOT RUNNING"
    SERVER_RUNNING=false
else
    echo "✅ Production server: RUNNING (PIDs: $PIDS)"
    SERVER_RUNNING=true
fi

# Check port status
echo ""
echo "🔌 Port Status:"
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Port 5001: IN USE"
    lsof -Pi :5001 -sTCP:LISTEN | head -2
else
    echo "❌ Port 5001: FREE"
fi

# Check database connection
echo ""
echo "🗄️  Database Status:"
if psql "postgresql://mssp_user:devpass123@localhost:5432/mssp_production" -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database: CONNECTED"
    
    # Get table count
    TABLE_COUNT=$(psql "postgresql://mssp_user:devpass123@localhost:5432/mssp_production" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
    echo "📋 Tables: $TABLE_COUNT"
    
    # Get user count
    USER_COUNT=$(psql "postgresql://mssp_user:devpass123@localhost:5432/mssp_production" -t -c "SELECT count(*) FROM users;" 2>/dev/null | xargs)
    echo "👥 Users: $USER_COUNT"
else
    echo "❌ Database: DISCONNECTED"
fi

# Check server health endpoint
echo ""
echo "🏥 Server Health:"
if [ "$SERVER_RUNNING" = true ]; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/user 2>/dev/null || echo "000")
    
    case $HTTP_STATUS in
        401)
            echo "✅ Server: HEALTHY (Authentication required - expected)"
            ;;
        200)
            echo "✅ Server: HEALTHY (Endpoint accessible)"
            ;;
        000)
            echo "⚠️  Server: STARTING (Connection refused)"
            ;;
        *)
            echo "⚠️  Server: UNKNOWN STATUS (HTTP $HTTP_STATUS)"
            ;;
    esac
else
    echo "❌ Server: NOT RUNNING"
fi

# System resources
echo ""
echo "💻 System Resources:"
echo "🔧 CPU Load: $(uptime | awk -F'load average:' '{print $2}' | cut -d',' -f1 | xargs)"
echo "💾 Memory: $(free -h 2>/dev/null | grep '^Mem:' | awk '{print $3 "/" $2}' || echo "N/A")"
echo "💽 Disk: $(df -h . | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"

echo ""
echo "=================================================="

if [ "$SERVER_RUNNING" = true ]; then
    echo "🟢 Overall Status: RUNNING"
    echo "🌐 Access URL: http://localhost:5001"
    echo "👤 Admin Login: admin@mssp.local / admin123"
else
    echo "🔴 Overall Status: STOPPED"
    echo "💡 To start: ./start-production.sh"
fi 