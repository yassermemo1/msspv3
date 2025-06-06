# MSSP Client Manager - Complete Production Error Monitoring

## 🚨 Immediate Fix for Your Current Issue

Your application is failing because the client build directory is missing:

```bash
# 1. Build the client first
npm run build

# 2. Start with comprehensive logging
npm start 2>&1 | tee application.log
```

## 🔍 Complete Error Monitoring Commands

### **Show All Error Types**
```bash
./debug-logs.sh all          # Comprehensive error overview
./debug-logs.sh monitor      # Real-time error monitoring
./debug-logs.sh stats        # Error statistics and patterns
./debug-logs.sh health       # System health check
```

### **Specific Error Categories**
```bash
./debug-logs.sh errors       # General errors
./debug-logs.sh contracts    # Contract-specific errors  
./debug-logs.sh database     # Database errors
./debug-logs.sh api          # API endpoint errors
./debug-logs.sh startup      # Application startup errors
./debug-logs.sh audit        # Audit log errors
```

## 📊 Error Categories We Monitor

### 1. **Application Errors**
- Runtime exceptions
- Unhandled promise rejections  
- Module loading failures
- Memory leaks
- Performance issues

### 2. **API Errors**
- HTTP 4xx/5xx responses
- Request timeouts
- Validation failures
- Authorization errors
- Rate limiting

### 3. **Database Errors**
- Connection failures
- Query timeouts
- Schema mismatches
- Transaction rollbacks
- Connection pool exhaustion

### 4. **Authentication Errors**
- Login failures
- Session expiration
- LDAP connection issues
- Permission denied
- Token validation failures

### 5. **Build/Deployment Errors**
- Missing build files
- Static file serving issues
- Environment configuration
- Dependency issues
- Port conflicts

### 6. **System-Level Errors**
- Out of memory
- Disk space issues
- Network connectivity
- File permission errors
- Process crashes

## 🛠️ Complete Debugging Workflow

### **Step 1: Quick Health Check**
```bash
./debug-logs.sh health
```
This shows:
- ✅/❌ Application running status
- ✅/❌ Database connectivity  
- ✅/❌ Port availability
- System resource usage

### **Step 2: See All Recent Errors**
```bash
./debug-logs.sh all
```
Shows categorized errors:
- Application errors (last 30)
- Startup issues (last 10)
- API failures (last 15)
- Database problems (last 10)
- Auth issues (last 10)
- Build/deployment errors (last 10)
- Recent crashes (last 10)

### **Step 3: Monitor Live Errors**
```bash
./debug-logs.sh monitor
```
Real-time monitoring of ALL error types as they occur.

### **Step 4: Analyze Error Patterns**
```bash
./debug-logs.sh stats
```
Shows:
- Most common error types
- Error frequency by hour
- API endpoint failure rates
- Error trends

### **Step 5: Test Application Functions**
```bash
./debug-logs.sh test
```
Tests:
- Health endpoint
- Static file serving
- Authentication endpoints
- API connectivity

## 🚀 Production Setup Guide

### **1. Start Application with Full Logging**
```bash
# Option A: Direct logging
npm start 2>&1 | tee application.log

# Option B: Screen session (recommended)
screen -S mssp-app
npm start 2>&1 | tee application.log
# Detach: Ctrl+A, D
# Reattach: screen -r mssp-app
```

### **2. Set Up Real-Time Monitoring**
```bash
# In another terminal
./debug-logs.sh monitor
```

### **3. Set Up Periodic Health Checks**
```bash
# Add to crontab (crontab -e)
*/5 * * * * cd /path/to/MsspClientManager && ./debug-logs.sh health >> health.log 2>&1
```

## 📝 Error Log Analysis

### **Reading Error Patterns**

**Application Start Failure:**
```
Failed to start server: Error: Could not find the build directory
```
**Solution:** Run `npm run build` first

**Database Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Check PostgreSQL is running

**Authentication Error:**
```
Error: Failed to authenticate user
Session creation failed
```
**Solution:** Check user exists and has proper permissions

**API Validation Error:**
```
Invalid client data
Failed to create contract
```
**Solution:** Check request data format and required fields

### **Common Error Solutions**

| Error Type | Symptoms | Quick Fix |
|------------|----------|-----------|
| Build Missing | "Could not find build directory" | `npm run build` |
| DB Connection | "connect ECONNREFUSED" | `./test-database-connection.sh` |
| Port Conflict | "EADDRINUSE :::5001" | `pkill -f tsx && npm start` |
| Auth Issues | "Contact your administrator" | `node setup-page-permissions.cjs` |
| Memory Issues | "JavaScript heap out of memory" | Restart application |

## 🔧 Advanced Error Debugging

### **Enable Detailed Logging**
```bash
# Set debug environment
export DEBUG=*
export NODE_ENV=development
npm start 2>&1 | tee detailed.log
```

### **Database Query Logging**
```sql
-- Connect to PostgreSQL
/usr/pgsql-16/bin/psql -d mssp_client_manager

-- Enable query logging  
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- View logs
tail -f /var/lib/pgsql/16/data/log/postgresql-*.log
```

### **Network Debugging**
```bash
# Check API connectivity
curl -v http://localhost:5001/api/health
curl -v http://localhost:5001/api/clients

# Check what's using ports
netstat -tlnp | grep 5001
lsof -i :5001
```

## 📊 Error Monitoring Dashboard

### **Create Error Summary Report**
```bash
./debug-logs.sh save
```
This creates a timestamped file with:
- Application status
- Environment info  
- All error categories
- System health metrics
- Recent error logs

### **Share Debug Information**
The saved report file (`debug_logs_YYYYMMDD_HHMMSS.txt`) contains all necessary information for troubleshooting and can be safely shared for support.

## 🚨 Emergency Procedures

### **Application Won't Start**
```bash
# 1. Check what's blocking
./debug-logs.sh health

# 2. Kill existing processes
pkill -f "tsx server/index.ts"

# 3. Clean and restart
npm run build
npm start 2>&1 | tee application.log
```

### **High Error Rate**
```bash
# 1. See error patterns
./debug-logs.sh stats

# 2. Monitor in real-time
./debug-logs.sh monitor

# 3. Check system resources
./debug-logs.sh health

# 4. Save state for analysis
./debug-logs.sh save
```

### **Database Issues**
```bash
# 1. Test connection
./test-database-connection.sh

# 2. Check database-specific errors
./debug-logs.sh database

# 3. Restart PostgreSQL if needed
sudo systemctl restart postgresql-16
```

## 🔄 Continuous Monitoring

### **Set Up Automated Monitoring**
```bash
#!/bin/bash
# monitoring-script.sh

while true; do
    echo "=== $(date) ===" >> error-monitoring.log
    ./debug-logs.sh health >> error-monitoring.log 2>&1
    ./debug-logs.sh stats >> error-monitoring.log 2>&1
    sleep 300  # Check every 5 minutes
done
```

### **Alert on Critical Errors**
```bash
#!/bin/bash
# alert-script.sh

CRITICAL_ERRORS=$(./debug-logs.sh all | grep -c "fatal\|crash\|database.*error")

if [ "$CRITICAL_ERRORS" -gt 5 ]; then
    echo "CRITICAL: $CRITICAL_ERRORS errors found" | mail -s "MSSP Alert" admin@company.com
fi
```

---

## 🎯 Quick Reference

**Most Important Commands:**
```bash
./debug-logs.sh health      # Check if everything works
./debug-logs.sh all         # Show all error types  
./debug-logs.sh monitor     # Watch errors live
./debug-logs.sh save        # Create debug report
```

**Emergency Commands:**
```bash
pkill -f tsx && npm run build && npm start 2>&1 | tee application.log
```

**For Support:**
```bash
./debug-logs.sh save
# Share the created debug_logs_*.txt file
``` 