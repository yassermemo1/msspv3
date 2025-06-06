#!/bin/bash

# MSSP Client Manager - Debug Logs Script
# Helps view and monitor application logs for debugging production issues

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Show help
show_help() {
    echo -e "${CYAN}🔍 MSSP Client Manager - Debug Logs Helper${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  live        - Show live logs from running application"
    echo "  errors      - Show only error logs from today"
    echo "  all         - Show ALL error types (comprehensive)"
    echo "  monitor     - Monitor all errors in real-time"
    echo "  stats       - Show error statistics and patterns"
    echo "  health      - Check overall system health"
    echo "  test        - Test application endpoints"
    echo "  contracts   - Show contract-related logs"
    echo "  audit       - Show audit logs from database"
    echo "  startup     - Show application startup logs"
    echo "  database    - Show database-related errors"
    echo "  api         - Show API request/response logs"
    echo "  clear       - Clear old log files"
    echo "  save        - Save current logs to file"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all                  # Show all error types"
    echo "  $0 monitor              # Watch all errors in real-time"
    echo "  $0 health               # Check system health"
    echo "  $0 stats                # Show error statistics"
    echo "  $0 live                 # Watch live application logs"
    echo "  $0 contracts            # Show contract creation issues"
    echo ""
    echo "Quick Troubleshooting:"
    echo "  1. Run: $0 health       # Check if everything is working"
    echo "  2. Run: $0 all          # See all recent errors"
    echo "  3. Run: $0 monitor      # Watch errors as they happen"
    echo "  4. Run: $0 save         # Save debug report for support"
    echo ""
}

# Check if application is running
check_app_status() {
    APP_PID=$(ps aux | grep '[t]sx server/index.ts' | awk '{print $2}' | head -1)
    if [ -n "$APP_PID" ]; then
        log "✅ Application is running (PID: $APP_PID)"
        return 0
    else
        warning "❌ Application is not running"
        return 1
    fi
}

# Watch live logs from the running application
watch_live_logs() {
    log "🔴 Watching live application logs..."
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    
    if check_app_status; then
        # Follow the application process logs
        APP_PID=$(ps aux | grep '[t]sx server/index.ts' | awk '{print $2}' | head -1)
        echo -e "${PURPLE}Following application process (PID: $APP_PID)${NC}"
        echo "=================================================="
        
        # If using systemd service
        if systemctl is-active --quiet mssp-client-manager 2>/dev/null; then
            journalctl -u mssp-client-manager -f --no-pager
        # If using PM2
        elif command -v pm2 >/dev/null 2>&1 && pm2 list | grep -q mssp; then
            pm2 logs mssp --lines 50
        # If running directly with npm/node
        else
            echo "Monitoring console output..."
            echo "To see live logs, restart the application with:"
            echo "  npm start 2>&1 | tee application.log"
            echo ""
            echo "Then run: tail -f application.log"
        fi
    else
        error "Application is not running. Start it first with:"
        echo "  npm start"
    fi
}

# Show error logs from today
show_error_logs() {
    log "🔍 Searching for error logs from today..."
    
    # Check common log locations
    TODAY=$(date +%Y-%m-%d)
    
    echo -e "${YELLOW}Checking application logs...${NC}"
    
    # Check current directory for log files
    if [ -f "application.log" ]; then
        echo -e "${GREEN}Found application.log${NC}"
        grep -i "error\|fail\|exception" application.log | tail -20
    fi
    
    # Check for npm logs
    if [ -f "npm-debug.log" ]; then
        echo -e "${GREEN}Found npm-debug.log${NC}"
        tail -20 npm-debug.log
    fi
    
    # Check system logs
    if command -v journalctl >/dev/null 2>&1; then
        echo -e "${GREEN}Checking system logs for today...${NC}"
        journalctl --since="$TODAY" | grep -i "mssp\|error\|fail" | tail -10
    fi
    
    # Check if running in systemd
    if systemctl is-active --quiet mssp-client-manager 2>/dev/null; then
        echo -e "${GREEN}Found systemd service logs${NC}"
        journalctl -u mssp-client-manager --since="$TODAY" | tail -20
    fi
}

# Show contract-related logs
show_contract_logs() {
    log "📋 Searching for contract-related logs..."
    
    if [ -f "application.log" ]; then
        echo -e "${GREEN}Contract creation attempts:${NC}"
        grep -i "contract\|/api/contracts" application.log | tail -20
        
        echo -e "${GREEN}Contract errors:${NC}"
        grep -i "contract.*error\|failed.*contract\|create contract error" application.log | tail -10
    else
        warning "No application.log file found. To create one, restart the app with:"
        echo "  npm start 2>&1 | tee application.log"
    fi
}

# Show database audit logs
show_audit_logs() {
    log "📊 Fetching recent audit logs from database..."
    
    if [ -f ".env" ]; then
        source .env
        
        if [ -n "$DATABASE_URL" ]; then
            echo -e "${GREEN}Recent audit logs:${NC}"
            
            # Use psql to query audit logs
            if command -v /usr/pgsql-16/bin/psql >/dev/null 2>&1; then
                PSQL_CMD="/usr/pgsql-16/bin/psql"
            else
                PSQL_CMD="psql"
            fi
            
            $PSQL_CMD "$DATABASE_URL" -c "
                SELECT created_at, action, entity_type, entity_name, description, severity 
                FROM audit_logs 
                WHERE created_at >= CURRENT_DATE 
                ORDER BY created_at DESC 
                LIMIT 20;
            " 2>/dev/null || warning "Could not connect to database to fetch audit logs"
        else
            warning "DATABASE_URL not found in .env file"
        fi
    else
        warning ".env file not found"
    fi
}

# Show application startup logs
show_startup_logs() {
    log "🚀 Searching for application startup logs..."
    
    if [ -f "application.log" ]; then
        echo -e "${GREEN}Latest startup sequence:${NC}"
        grep -i "environment\|configuration\|serving\|database\|ldap\|email" application.log | tail -15
    fi
    
    # Check systemd startup logs
    if systemctl is-active --quiet mssp-client-manager 2>/dev/null; then
        echo -e "${GREEN}Systemd service startup:${NC}"
        journalctl -u mssp-client-manager --since="1 hour ago" | tail -10
    fi
}

# Show database-related errors
show_database_logs() {
    log "🗄️  Searching for database-related errors..."
    
    if [ -f "application.log" ]; then
        echo -e "${GREEN}Database connection issues:${NC}"
        grep -i "database\|postgres\|connection\|sql" application.log | grep -i "error\|fail" | tail -10
        
        echo -e "${GREEN}Query errors:${NC}"
        grep -i "query\|insert\|update\|delete" application.log | grep -i "error\|fail" | tail -10
    fi
}

# Show API request/response logs
show_api_logs() {
    log "🌐 Searching for API logs..."
    
    if [ -f "application.log" ]; then
        echo -e "${GREEN}Recent API requests:${NC}"
        grep -E "(POST|GET|PUT|DELETE) /api/" application.log | tail -15
        
        echo -e "${GREEN}API errors:${NC}"
        grep -i "/api/.*error\|api.*fail\|status.*[45][0-9][0-9]" application.log | tail -10
    fi
}

# Save current logs to timestamped file
save_logs() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    LOG_FILE="debug_logs_$TIMESTAMP.txt"
    
    log "💾 Saving debug information to $LOG_FILE..."
    
    {
        echo "=== MSSP Client Manager Debug Logs ==="
        echo "Generated: $(date)"
        echo "======================================="
        echo ""
        
        echo "=== APPLICATION STATUS ==="
        check_app_status || true
        echo ""
        
        echo "=== ENVIRONMENT INFO ==="
        echo "Node version: $(node --version 2>/dev/null || echo 'Not found')"
        echo "NPM version: $(npm --version 2>/dev/null || echo 'Not found')"
        echo "PostgreSQL: $(/usr/pgsql-16/bin/psql --version 2>/dev/null || psql --version 2>/dev/null || echo 'Not found')"
        echo ""
        
        echo "=== RECENT ERROR LOGS ==="
        show_error_logs 2>/dev/null || echo "No error logs found"
        echo ""
        
        echo "=== CONTRACT LOGS ==="
        show_contract_logs 2>/dev/null || echo "No contract logs found"
        echo ""
        
        echo "=== DATABASE LOGS ==="
        show_database_logs 2>/dev/null || echo "No database logs found"
        echo ""
        
    } > "$LOG_FILE"
    
    log "✅ Debug logs saved to: $LOG_FILE"
    echo "You can share this file for debugging assistance."
}

# Clear old log files
clear_logs() {
    log "🧹 Clearing old log files..."
    
    rm -f application.log npm-debug.log debug_logs_*.txt 2>/dev/null || true
    
    log "✅ Old log files cleared"
}

# Test contract creation with detailed logging
test_contract_creation() {
    log "🧪 Testing contract creation with detailed logging..."
    
    echo "This will:"
    echo "1. Show live logs"
    echo "2. Wait for you to try creating a contract"
    echo "3. Capture any errors"
    echo ""
    echo "Press Enter to start, then try creating a contract in another terminal/browser..."
    read
    
    watch_live_logs
}

# Show all errors (not just specific types)
show_all_errors() {
    log "🔍 Searching for ALL production errors..."
    
    echo -e "${YELLOW}=== APPLICATION ERRORS ===${NC}"
    if [ -f "application.log" ]; then
        echo -e "${GREEN}Found application.log - checking for errors:${NC}"
        grep -i "error\|fail\|exception\|refuse\|timeout\|denied\|invalid\|missing\|not found" application.log | tail -30
        echo ""
    fi
    
    echo -e "${YELLOW}=== STARTUP ERRORS ===${NC}"
    if [ -f "application.log" ]; then
        echo -e "${GREEN}Checking startup sequence for issues:${NC}"
        grep -i "failed to start\|could not find\|missing\|configuration error\|build" application.log | tail -10
        echo ""
    fi
    
    echo -e "${YELLOW}=== API ERRORS ===${NC}"
    if [ -f "application.log" ]; then
        echo -e "${GREEN}API request/response errors:${NC}"
        grep -E "(POST|GET|PUT|DELETE).*error|status.*[45][0-9][0-9]|api.*fail" application.log | tail -15
        echo ""
    fi
    
    echo -e "${YELLOW}=== DATABASE ERRORS ===${NC}"
    if [ -f "application.log" ]; then
        echo -e "${GREEN}Database connection and query errors:${NC}"
        grep -i "postgres\|database\|connection.*error\|query.*error\|sql.*error" application.log | tail -10
        echo ""
    fi
    
    echo -e "${YELLOW}=== AUTHENTICATION ERRORS ===${NC}"
    if [ -f "application.log" ]; then
        echo -e "${GREEN}Login, session, and permission errors:${NC}"
        grep -i "auth.*error\|login.*fail\|session.*error\|permission.*denied\|access.*denied" application.log | tail -10
        echo ""
    fi
    
    echo -e "${YELLOW}=== BUILD/DEPLOYMENT ERRORS ===${NC}"
    if [ -f "application.log" ]; then
        echo -e "${GREEN}Build and deployment issues:${NC}"
        grep -i "build.*error\|vite.*error\|tsx.*error\|compilation.*error\|missing.*directory" application.log | tail -10
        echo ""
    fi
    
    echo -e "${YELLOW}=== RECENT CRASHES ===${NC}"
    if [ -f "application.log" ]; then
        echo -e "${GREEN}Application crashes and exits:${NC}"
        grep -i "sigterm\|exit\|crash\|shutdown\|fatal" application.log | tail -10
        echo ""
    fi
}

# Monitor all error types in real-time
monitor_all_errors() {
    log "🔴 Monitoring ALL error types in real-time..."
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    
    if [ ! -f "application.log" ]; then
        warning "No application.log found. Start application with:"
        echo "  npm start 2>&1 | tee application.log"
        echo ""
        echo "Then run this command again."
        return 1
    fi
    
    echo -e "${PURPLE}Following all errors in application.log...${NC}"
    echo "=================================================="
    
    # Follow the log file and highlight errors
    tail -f application.log | grep --line-buffered -i "error\|fail\|exception\|refuse\|timeout\|denied\|invalid\|missing\|not found\|crash\|fatal"
}

# Get error statistics
show_error_stats() {
    log "📊 Analyzing error patterns..."
    
    if [ ! -f "application.log" ]; then
        warning "No application.log found."
        return 1
    fi
    
    echo -e "${GREEN}Error Statistics from application.log:${NC}"
    echo "═══════════════════════════════════════"
    
    echo "🔥 Most common errors:"
    grep -i "error\|fail\|exception" application.log | cut -d':' -f3- | sort | uniq -c | sort -nr | head -10
    echo ""
    
    echo "📅 Errors by hour (today):"
    TODAY=$(date +%Y-%m-%d)
    grep "$TODAY" application.log | grep -i "error\|fail" | cut -d'[' -f2 | cut -d']' -f1 | cut -d':' -f1-2 | sort | uniq -c
    echo ""
    
    echo "🌐 API endpoint errors:"
    grep -E "POST|GET|PUT|DELETE" application.log | grep -i "error\|fail" | sed 's/.*\(POST\|GET\|PUT\|DELETE\)/\1/' | cut -d' ' -f1-2 | sort | uniq -c | sort -nr
    echo ""
}

# Check system health
check_system_health() {
    log "🏥 Checking overall system health..."
    
    echo -e "${GREEN}System Resources:${NC}"
    echo "Memory usage: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
    echo "Disk usage: $(df -h / | tail -1 | awk '{print $5 " used"}')"
    echo "Load average: $(uptime | awk -F'load average:' '{print $2}')"
    echo ""
    
    echo -e "${GREEN}Application Status:${NC}"
    if check_app_status >/dev/null 2>&1; then
        echo "✅ Application is running"
    else
        echo "❌ Application is not running"
    fi
    
    echo -e "${GREEN}Database Status:${NC}"
    if command -v /usr/pgsql-16/bin/psql >/dev/null 2>&1; then
        PSQL_CMD="/usr/pgsql-16/bin/psql"
    else
        PSQL_CMD="psql"
    fi
    
    if [ -f ".env" ] && [ -n "$(grep DATABASE_URL .env)" ]; then
        source .env
        if $PSQL_CMD "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
            echo "✅ Database is accessible"
        else
            echo "❌ Database connection failed"
        fi
    else
        echo "⚠️  Database configuration not found"
    fi
    
    echo -e "${GREEN}Port Status:${NC}"
    if netstat -tlnp 2>/dev/null | grep -q ":5001"; then
        echo "✅ Port 5001 is in use"
    else
        echo "❌ Port 5001 is not in use"
    fi
    echo ""
}

# Test all major application functions
test_application_health() {
    log "🧪 Testing application endpoints..."
    
    BASE_URL="http://localhost:5001"
    
    echo -e "${GREEN}Testing API endpoints:${NC}"
    
    # Test health endpoint
    if curl -s "$BASE_URL/api/health" >/dev/null 2>&1; then
        echo "✅ Health endpoint working"
    else
        echo "❌ Health endpoint failed"
    fi
    
    # Test static files
    if curl -s "$BASE_URL/" >/dev/null 2>&1; then
        echo "✅ Static files serving"
    else
        echo "❌ Static files not accessible"
    fi
    
    # Test auth endpoint
    if curl -s "$BASE_URL/api/auth/me" >/dev/null 2>&1; then
        echo "✅ Auth endpoints responding"
    else
        echo "❌ Auth endpoints not responding"
    fi
    
    echo ""
}

# Main script logic
case "${1:-help}" in
    live|watch)
        watch_live_logs
        ;;
    errors|error)
        show_error_logs
        ;;
    all|all-errors)
        show_all_errors
        ;;
    monitor)
        monitor_all_errors
        ;;
    stats)
        show_error_stats
        ;;
    health)
        check_system_health
        ;;
    test)
        test_application_health
        ;;
    contracts|contract)
        show_contract_logs
        ;;
    audit)
        show_audit_logs
        ;;
    startup|start)
        show_startup_logs
        ;;
    database|db)
        show_database_logs
        ;;
    api)
        show_api_logs
        ;;
    save)
        save_logs
        ;;
    clear|clean)
        clear_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        show_help
        ;;
esac 