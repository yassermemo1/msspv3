# MSSP Client Manager - Production Debugging Guide

## Quick Start - Finding Error Logs

### 1. Check Live Application Logs 
```bash
# Watch live logs as they happen
./debug-logs.sh live

# Or manually restart with logging
npm start 2>&1 | tee application.log
```

### 2. Check Contract Creation Errors Specifically
```bash
# Show contract-related errors
./debug-logs.sh contracts

# Show general API errors
./debug-logs.sh api
```

### 3. Save All Debug Information
```bash
# Create a comprehensive debug report
./debug-logs.sh save
```

## Common Production Issues

### Contract Creation Failures

**Issue Fixed**: The contract creation route had a bug where it was trying to return `newSAF` instead of `contract`. This has been fixed.

**How to Debug Contract Issues:**

1. **Watch Live Logs During Contract Creation:**
   ```bash
   ./debug-logs.sh live
   ```
   Then try creating a contract in another browser/terminal.

2. **Check Specific Contract Errors:**
   ```bash
   ./debug-logs.sh contracts
   ```

3. **Common Contract Errors to Look For:**
   - Database connection errors
   - Validation errors (missing required fields)
   - Client ID not found
   - Date format issues
   - Permission/authentication errors

### Authentication Issues

**Check Session/Login Problems:**
```bash
# Look for authentication errors
grep -i "auth\|login\|session" application.log | tail -20

# Check specific authentication logs
./debug-logs.sh startup
```

### Database Connection Issues

**Check Database Problems:**
```bash
# Show database-related errors
./debug-logs.sh database

# Test database connection directly
./test-database-connection.sh
```

## Application Log Structure

### Log Locations

**On RedHat Production Server:**
1. **Application Console Output**: Captured when running `npm start`
2. **System Logs**: `/var/log/messages` or `journalctl`
3. **Application Log File**: `application.log` (if redirected)

### Creating Application Log File

**For Production Debugging:**
```bash
# Start application with log file
npm start 2>&1 | tee application.log

# In another terminal, watch the log
tail -f application.log
```

### Understanding Log Messages

**Contract Creation Process:**
```
[timestamp] Creating contract...
[timestamp] Validating client exists...
[timestamp] Contract data prepared: {...}
[timestamp] ✅ Audit logging completed for contract creation
[timestamp] Contract created successfully
```

**Error Examples:**
```
[timestamp] Create contract error: [specific error]
[timestamp] ❌ Database connection failed
[timestamp] ⚠️ Audit logging failed for contract creation
```

## Debug Script Commands

### Available Commands

```bash
./debug-logs.sh live        # Watch live logs
./debug-logs.sh errors      # Show today's errors
./debug-logs.sh contracts   # Contract-specific logs
./debug-logs.sh audit       # Database audit logs
./debug-logs.sh startup     # Application startup logs
./debug-logs.sh database    # Database connection issues
./debug-logs.sh api         # API request/response logs
./debug-logs.sh save        # Save debug report to file
./debug-logs.sh clear       # Clear old log files
```

### Example Usage

**Debug Contract Creation Issue:**
```bash
# 1. Clear old logs
./debug-logs.sh clear

# 2. Start live monitoring
./debug-logs.sh live

# 3. In browser/another terminal, try creating contract

# 4. Save debug information
./debug-logs.sh save
```

## Common Error Patterns

### 1. Database Errors
```
Error: connect ECONNREFUSED
Error: database "mssp_client_manager" does not exist
Error: relation "contracts" does not exist
```

**Solutions:**
- Check database is running: `./test-database-connection.sh`
- Run database setup: `./setup-database.sh`
- Verify schema: `./verify-database-schema.sh`

### 2. Authentication Errors
```
Error: Failed to authenticate user
Session creation failed
Contact your administrator
```

**Solutions:**
- Check user exists: `node check-current-users.cjs`
- Setup page permissions: `node setup-page-permissions.cjs`
- Create admin user: `node create-admin-user.cjs`

### 3. API Validation Errors
```
Invalid client data
Client not found
Failed to create contract
```

**Solutions:**
- Check client exists before creating contract
- Verify all required fields are provided
- Check data format (dates, numbers)

### 4. Permission Errors
```
Access denied
Insufficient permissions
requireManagerOrAbove failed
```

**Solutions:**
- Check user role in database
- Update page permissions: `node setup-page-permissions.cjs`
- Verify session is valid

## Production Monitoring

### Real-time Monitoring Setup

**Option 1: Screen Session**
```bash
# Start screen session
screen -S mssp-logs

# Inside screen, start logging
npm start 2>&1 | tee application.log

# Detach with Ctrl+A, D
# Reattach with: screen -r mssp-logs
```

**Option 2: systemd Service (Recommended)**
```bash
# Create service file
sudo nano /etc/systemd/system/mssp-client-manager.service

# View logs with
journalctl -u mssp-client-manager -f
```

### Log Rotation

**Prevent Log Files from Growing Too Large:**
```bash
# Add to crontab (crontab -e)
0 0 * * * cd /path/to/MsspClientManager && ./debug-logs.sh clear
```

## Sharing Debug Information

### Creating Debug Report for Support

```bash
# Generate comprehensive debug report
./debug-logs.sh save

# This creates: debug_logs_YYYYMMDD_HHMMSS.txt
# Share this file for support
```

### What to Include in Bug Reports

1. **Debug Log File** (from `./debug-logs.sh save`)
2. **Steps to Reproduce** the issue
3. **Expected vs Actual Behavior**
4. **Environment Details**:
   - RedHat version
   - PostgreSQL version
   - Node.js version
   - Browser being used

### Sensitive Information

**Before Sharing Logs:**
- Remove any passwords, API keys, or sensitive data
- The debug script automatically excludes sensitive environment variables
- Check for personally identifiable information (PII)

## Advanced Debugging

### Database Query Debugging

**Enable Query Logging in PostgreSQL:**
```sql
-- Connect to PostgreSQL
/usr/pgsql-16/bin/psql -d mssp_client_manager

-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Check logs at: /var/lib/pgsql/16/data/log/
```

### Network Issues

**Check API Connectivity:**
```bash
# Test API endpoints
curl -v http://localhost:5001/api/health
curl -v http://localhost:5001/api/clients

# Check if server is listening
netstat -tlnp | grep 5001
```

### Browser Developer Tools

**Check Frontend Errors:**
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for JavaScript errors
4. Check Network tab for failed API requests

## Emergency Procedures

### Application Won't Start

```bash
# Check what's using port 5001
lsof -i :5001

# Kill existing processes
pkill -f "tsx server/index.ts"

# Restart fresh
npm start
```

### Database Connection Lost

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql-16

# Test connection
./test-database-connection.sh

# Reset database if needed
./fix-redhat-database.sh
```

### Critical Production Issues

1. **Save Current State**: `./debug-logs.sh save`
2. **Stop Application**: `Ctrl+C` or `pkill -f tsx`
3. **Backup Database**: `pg_dump mssp_client_manager > backup.sql`
4. **Check System Resources**: `top`, `df -h`, `free -m`
5. **Restart Application**: `npm start 2>&1 | tee application.log`

## Prevention

### Regular Health Checks

**Add to Daily Routine:**
```bash
# Check application status
./debug-logs.sh startup

# Verify database
./verify-database-schema.sh

# Test basic functionality
curl http://localhost:5001/api/health
```

### Monitoring Setup

**Consider Setting Up:**
- Log aggregation (ELK stack, Fluentd)
- Application monitoring (Prometheus, Grafana)
- Error tracking (Sentry)
- Uptime monitoring (Pingdom, UptimeRobot)

---

## Quick Reference Card

**Most Common Commands:**
```bash
./debug-logs.sh live       # Watch live logs
./debug-logs.sh contracts  # Contract issues
./debug-logs.sh save       # Create debug report
npm start 2>&1 | tee application.log  # Start with logging
```

**Emergency Restart:**
```bash
pkill -f tsx
npm start 2>&1 | tee application.log
```

**Database Issues:**
```bash
./test-database-connection.sh
./setup-database.sh
``` 