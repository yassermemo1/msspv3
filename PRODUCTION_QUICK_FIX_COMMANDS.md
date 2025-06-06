# Production Database Quick Fix Commands

## SSH to Production Server

```bash
ssh your-production-server
```

## Navigate to App Directory

```bash
cd /root/v/MsspClientManager
```

## Run Production Schema Fix

```bash
# Option 1: Use the automated fix script
bash scripts/fix-production-schema.sh

# Option 2: Manual drizzle push (if script fails)
npx drizzle-kit push --force

# Option 3: Manual database setup (if needed)
./setup-database.sh
```

## Restart Production Application

```bash
# If using PM2
pm2 restart all

# If using systemd
sudo systemctl restart your-app-service

# If using Docker
docker-compose restart

# If manual node process
pkill -f "node\|tsx" && nohup npm start &
```

## Verify Fix

```bash
# Test API endpoint
curl http://localhost:5001/api/status

# Check application logs
pm2 logs
# OR
journalctl -u your-app-service -f
```

## What This Fixes

- ❌ `column "deleted_at" does not exist`
- ❌ `column "type" does not exist` 
- ❌ `column "title" does not exist`
- ❌ `database "mssp_production" does not exist`

## Expected Result

- ✅ Database schema synchronized with latest version
- ✅ All missing columns added
- ✅ Application starts without database errors
- ✅ API endpoints return proper responses

## Troubleshooting

If the fix script fails:

1. **Check database connection:**
   ```bash
   psql -h localhost -U mssp_user -d mssp_production -c "SELECT version();"
   ```

2. **Manually create database if missing:**
   ```bash
   createdb -h localhost -U mssp_user mssp_production
   ```

3. **Run migrations manually:**
   ```bash
   npx drizzle-kit push --force
   ```

4. **Check application logs for specific errors:**
   ```bash
   tail -f /var/log/your-app.log
   ``` 