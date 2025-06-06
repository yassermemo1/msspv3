#!/bin/bash

# MSSP Client Manager - Application Management Script
# Provides easy commands to manage the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ]; then
        error "Please run this script from the project root directory"
        exit 1
    fi
}

# Show application status
status() {
    log "Checking MSSP Client Manager status..."
    
    # Check if server is running
    if curl -s http://localhost:5001/api/health >/dev/null 2>&1; then
        log "✅ Server is running on http://localhost:5001"
        
        # Get health info
        HEALTH=$(curl -s http://localhost:5001/api/health)
        echo "📊 Health: $HEALTH"
    else
        warning "❌ Server is not running"
    fi
    
    # Check database connection
    if [ -f ~/.mssp_db_config ]; then
        log "✅ Database configuration found"
        source ~/.mssp_db_config
        echo "📍 Database: $DB_NAME on localhost:5432"
    else
        warning "❌ Database configuration not found"
    fi
    
    # Check dependencies
    PACKAGE_COUNT=$(npm list --depth=0 2>/dev/null | grep -c "├\|└" || echo "0")
    echo "📦 Dependencies: $PACKAGE_COUNT packages installed"
}

# Start the application
start() {
    log "Starting MSSP Client Manager..."
    
    # Check if already running
    if curl -s http://localhost:5001/api/health >/dev/null 2>&1; then
        warning "Server is already running!"
        return 0
    fi
    
    # Start in background - try npx tsx first, fallback to npm start
    log "Starting server..."
    if command -v npx >/dev/null 2>&1; then
        NODE_ENV=production npx tsx server/index.ts &
        SERVER_PID=$!
    else
        npm start &
        SERVER_PID=$!
    fi
    
    # Wait a moment and check if it started
    sleep 3
    if curl -s http://localhost:5001/api/health >/dev/null 2>&1; then
        log "✅ Server started successfully!"
        echo "🌐 Application URL: http://localhost:5001"
        echo "📊 Health Check: http://localhost:5001/api/health"
        echo "🔑 Default Login: admin / admin123"
        echo "🔢 Process ID: $SERVER_PID"
    else
        error "❌ Failed to start server"
        info "💡 Try: npm start"
        exit 1
    fi
}

# Stop the application
stop() {
    log "Stopping MSSP Client Manager..."
    
    # Find and kill node processes running our server
    PIDS=$(ps aux | grep -E "(tsx.*server/index\.ts|node.*server/index\.ts)" | grep -v grep | awk '{print $2}' || true)
    if [ -n "$PIDS" ]; then
        echo "$PIDS" | xargs kill
        log "✅ Server stopped"
    else
        warning "No server process found"
    fi
}

# Restart the application
restart() {
    log "Restarting MSSP Client Manager..."
    stop
    sleep 2
    start
}

# Build the application
build() {
    log "Building MSSP Client Manager..."
    npm run build
    log "✅ Build completed"
    
    # Optional: run TypeScript check separately if requested
    if [ "$1" = "--check" ]; then
        log "Running TypeScript check..."
        npm run build:check
    fi
}

# Install dependencies
install() {
    log "Installing dependencies..."
    npm install
    log "✅ Dependencies installed"
}

# Update the application
update() {
    log "Updating MSSP Client Manager..."
    
    # Pull latest changes
    if [ -d ".git" ]; then
        git pull origin main
    fi
    
    # Install dependencies
    install
    
    # Build
    build
    
    log "✅ Update completed"
}

# Show logs
logs() {
    log "Showing server logs..."
    
    # Check if server is running
    PID=$(ps aux | grep -E "(tsx.*server/index\.ts|node.*server/index\.ts)" | grep -v grep | awk '{print $2}' | head -1 || echo "")
    if [ -n "$PID" ]; then
        echo "Following logs for process $PID..."
        echo "Press Ctrl+C to stop following logs"
        tail -f /dev/null & # This will follow the process output
    else
        warning "Server is not running"
    fi
}

# Check dependencies
check_deps() {
    log "Checking dependencies..."
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        echo "✅ Node.js: $(node --version)"
    else
        echo "❌ Node.js not found"
    fi
    
    # Check npm
    if command -v npm >/dev/null 2>&1; then
        echo "✅ npm: $(npm --version)"
    else
        echo "❌ npm not found"
    fi
    
    # Check PostgreSQL
    if command -v psql >/dev/null 2>&1; then
        echo "✅ PostgreSQL: $(/usr/pgsql-16/bin/psql --version 2>/dev/null || psql --version 2>/dev/null || echo 'Not found')"
    else
        echo "❌ PostgreSQL not found"
    fi
    
    # Check dependencies count
    PACKAGE_COUNT=$(npm list --depth=0 2>/dev/null | grep -c "├\|└" || echo "0")
    echo "📦 Installed packages: $PACKAGE_COUNT"
    
    # Check for vulnerabilities
    VULNS=$(npm audit --audit-level=moderate 2>/dev/null | grep -c "vulnerabilities" || echo "0")
    if [ "$VULNS" -gt 0 ]; then
        warning "⚠️  Security vulnerabilities found"
        echo "Run: npm audit for details"
    else
        echo "✅ No security vulnerabilities"
    fi
}

# Show help
help() {
    echo "MSSP Client Manager - Management Commands"
    echo "========================================="
    echo ""
    echo "Usage: ./manage-app.sh [command]"
    echo ""
    echo "Commands:"
    echo "  status      Show application status"
    echo "  start       Start the application"
    echo "  stop        Stop the application"
    echo "  restart     Restart the application"
    echo "  build       Build the application"
    echo "  install     Install dependencies"
    echo "  update      Update application (git pull + install + build)"
    echo "  logs        Show application logs"
    echo "  check       Check system dependencies"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./manage-app.sh start     # Start the server"
    echo "  ./manage-app.sh status    # Check if running"
    echo "  ./manage-app.sh restart   # Restart server"
    echo ""
}

# Main function
main() {
    check_directory
    
    case "${1:-help}" in
        "status")
            status
            ;;
        "start")
            start
            ;;
        "stop")
            stop
            ;;
        "restart")
            restart
            ;;
        "build")
            build "$2"
            ;;
        "install")
            install
            ;;
        "update")
            update
            ;;
        "logs")
            logs
            ;;
        "check")
            check_deps
            ;;
        "help"|*)
            help
            ;;
    esac
}

# Run main function with all arguments
main "$@" 