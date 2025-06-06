# MSSP Client Manager - Production Update Guide

## Overview

This guide covers the safe updating of your MSSP Client Manager production deployment. **Never** just run `git pull` in production - follow these procedures to ensure zero data loss and minimal downtime.

## Quick Update Workflow

For most updates, use the automated update script:

```bash
# On your production server
cd /opt/mssp-client-manager
./update-production.sh
```

## Update Methods

### 1. 🎯 **Recommended: Automated Update Script**

```bash
# Check for available updates
./update-production.sh --check-only

# Run full update with safety checks
./update-production.sh

# Quick update without rebuilding (for small changes)
./update-production.sh --skip-build

# Emergency update (skip backups - not recommended)
./update-production.sh --skip-backup
```

**What the script does:**
- ✅ Creates database and code backups
- ✅ Stops services gracefully
- ✅ Updates code from GitHub
- ✅ Updates dependencies
- ✅ Runs database migrations
- ✅ Rebuilds application
- ✅ Starts services
- ✅ Tests functionality
- ✅ Automatic rollback on failure

### 2. 🔧 **Manual Update Process**

For custom updates or troubleshooting:

```bash
# 1. Create backups
cd /opt/mssp-client-manager
./backup.sh

# 2. Stop services
sudo systemctl stop mssp-frontend.service
sudo systemctl stop mssp-backend.service

# 3. Update code
git fetch origin
git pull origin main

# 4. Update dependencies (if needed)
npm install --production
cd client && npm install && cd ..

# 5. Run migrations (if needed)
./db_migrate.sh --skip-backup

# 6. Build application
cd client && npm run build && cd ..

# 7. Start services
sudo systemctl start mssp-backend.service
sudo systemctl start mssp-frontend.service

# 8. Test application
curl http://localhost:5001/api/health
curl http://localhost:3000
```

## Update Scenarios

### 📝 **Code-Only Changes** (No database changes)
```bash
./update-production.sh --skip-deps
```

### 🗄️ **Database Schema Changes** 
```bash
./update-production.sh
# Full update with migrations
```

### 📦 **Dependency Updates**
```bash
./update-production.sh
# Full update including npm dependencies
```

### 🎨 **Frontend-Only Changes**
```bash
cd /opt/mssp-client-manager
git pull origin main
cd client && npm run build && cd ..
sudo systemctl restart mssp-frontend.service
```

### ⚙️ **Backend-Only Changes**
```bash
cd /opt/mssp-client-manager
git pull origin main
npm install --production
sudo systemctl restart mssp-backend.service
```

### 🚨 **Emergency Hotfix**
```bash
./update-production.sh --skip-backup --force
```

## Development to Production Workflow

### 1. **Development Phase**
```bash
# On your local machine
git add .
git commit -m "Feature: Add new functionality"
git push origin main
```

### 2. **Testing Phase** (Optional but recommended)
```bash
# Deploy to staging environment first
# Test functionality
# Verify database migrations
```

### 3. **Production Deployment**
```bash
# On production server
cd /opt/mssp-client-manager
./update-production.sh --check-only  # See what will be updated
./update-production.sh               # Apply updates
```

## Best Practices

### ✅ **DO:**
- Always create backups before updates
- Test updates in a staging environment first
- Use the automated update script
- Monitor logs during and after updates
- Verify application functionality after updates
- Keep multiple backup copies
- Update during low-traffic periods
- Communicate maintenance windows to users

### ❌ **DON'T:**
- Run `git pull` directly in production
- Update without backups
- Skip database migration testing
- Update during peak hours
- Ignore post-update testing
- Delete old backups immediately

## Rollback Procedures

### Automatic Rollback
The update script automatically rolls back on failure, but you can also manually rollback:

### Manual Rollback
```bash
cd /opt/mssp-client-manager

# Stop services
sudo systemctl stop mssp-frontend.service
sudo systemctl stop mssp-backend.service

# Reset to previous commit
git reset --hard HEAD~1

# Restore database (if needed)
# Use latest backup from /opt/mssp-client-manager/backups/
export PGPASSWORD="your_password"
psql -h localhost -U postgres -d mssp_client_manager < backups/backup_YYYYMMDD_HHMMSS.sql

# Rebuild and restart
npm install --production
cd client && npm install && npm run build && cd ..
sudo systemctl start mssp-backend.service
sudo systemctl start mssp-frontend.service
```

## Monitoring Updates

### Log Locations
- **Update Log**: `/opt/mssp-client-manager/logs/update.log`
- **Application Logs**: `/opt/mssp-client-manager/logs/`
- **System Service Logs**: `sudo journalctl -u mssp-backend.service -f`

### Health Checks
```bash
# Application health
curl http://localhost:5001/api/health

# Service status
sudo systemctl status mssp-backend.service
sudo systemctl status mssp-frontend.service

# Database connectivity
./db_migrate.sh --verify-only
```

## Troubleshooting Updates

### Update Fails at Dependencies
```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules
npm install --production
cd client && npm install && cd ..
```

### Database Migration Fails
```bash
# Check migration status
./db_migrate.sh --verify-only

# Force re-run migrations
./db_migrate.sh --force-recreate  # ⚠️ DESTRUCTIVE
```

### Services Won't Start
```bash
# Check logs
sudo journalctl -u mssp-backend.service --lines=50
sudo journalctl -u mssp-frontend.service --lines=50

# Check configuration
cat .env
node --version
```

### Port Conflicts
```bash
# Check what's using ports
sudo lsof -i :5001
sudo lsof -i :3000

# Kill conflicting processes
sudo kill -9 <PID>
```

## Update Schedule Recommendations

### 🔄 **Regular Updates**
- **Weekly**: Minor updates and security patches
- **Monthly**: Dependency updates and feature releases
- **Quarterly**: Major version updates

### 📅 **Maintenance Windows**
- **Small Updates**: 5-10 minutes downtime
- **Major Updates**: 15-30 minutes downtime
- **Database Migrations**: 10-20 minutes downtime

### 🕐 **Timing**
- Off-peak hours (e.g., 2-4 AM local time)
- Weekends or scheduled maintenance windows
- Coordinate with business operations

## Security Considerations

### 🔐 **Access Control**
- Limit who can perform production updates
- Use dedicated deployment keys
- Log all update activities
- Require approval for major changes

### 🛡️ **Security Updates**
- Apply security patches immediately
- Monitor security advisories
- Keep dependencies updated
- Regular security audits

## Backup Strategy

### Automated Backups
```bash
# Add to crontab for daily backups
0 2 * * * cd /opt/mssp-client-manager && ./backup.sh

# Weekly cleanup of old backups
0 0 * * 0 find /opt/mssp-client-manager/backups -name "*.gz" -mtime +30 -delete
```

### Backup Verification
```bash
# Test backup restoration regularly
# Verify backup file integrity
# Document restoration procedures
```

## Communication

### Update Notifications
```bash
# Before update
echo "🚀 Starting maintenance window - Application will be unavailable for ~10 minutes"

# After update
echo "✅ Maintenance complete - Application is now available with latest updates"
```

### Status Page (Recommended)
- Set up a status page for maintenance announcements
- Communicate planned maintenance windows
- Provide real-time update status

---

## Quick Reference

### Emergency Commands
```bash
# Emergency stop
sudo systemctl stop mssp-backend.service mssp-frontend.service

# Emergency start
sudo systemctl start mssp-backend.service mssp-frontend.service

# Quick rollback
cd /opt/mssp-client-manager && git reset --hard HEAD~1 && ./restart.sh

# View logs
tail -f /opt/mssp-client-manager/logs/update.log
```

### Update Script Options
```bash
./update-production.sh --help           # Show all options
./update-production.sh --check-only     # Check for updates
./update-production.sh --skip-backup    # Skip backup (risky)
./update-production.sh --skip-deps      # Skip dependency updates
./update-production.sh --skip-build     # Skip rebuild
./update-production.sh --force          # Force update
```

**Remember: Safe updates = Happy users! 🎉** 