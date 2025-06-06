# Production Database Sync & Update Guide

## 🎯 **Current Issues Identified**

From your terminal logs, here are the main issues:

1. **Database Connection Issues**: App trying to connect to `mssp_production` but only `mssp_db` exists locally
2. **Email Service Error**: `nodemailer.createTransporter` should be `nodemailer.createTransport`
3. **Import Errors**: Missing `apiRequest` import path in components
4. **Syntax Errors**: Duplicate `enabled` keys and JSX syntax issues

## 🔧 **Step 1: Fix Immediate Issues**

### **Fix Email Service**
```bash
# This should already be fixed, but verify:
grep -n "createTransporter" server/email.ts
# Should show: this.transporter = nodemailer.createTransport(config);
```

### **Fix Import Paths**
```bash
# Fix the apiRequest import in entity-relationship-tree.tsx
sed -i '' 's|@/lib/apiRequest|@/lib/queryClient|g' client/src/components/ui/entity-relationship-tree.tsx
```

## 🗄️ **Step 2: Database Synchronization Strategy**

### **Option A: Local Development (Recommended)**
Use `mssp_db` for local development:

```bash
# Create/recreate the local database
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_db" ./setup-database.sh

# Run with correct database
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_db" npm run dev
```

### **Option B: Match Production Database Name**
Create `mssp_production` locally to match production:

```bash
# Create production-named database locally
PGPASSWORD=devpass123 psql -h localhost -U mssp_user -d postgres -c "CREATE DATABASE mssp_production;"

# Set up schema and data
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" ./setup-database.sh

# Run development server
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" npm run dev
```

## 🚀 **Step 3: Production Deployment Strategy**

### **3.1 Schema Migration Process**

```bash
# 1. Backup current production database
pg_dump -h PROD_HOST -U PROD_USER -d mssp_production > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Check current schema version
psql -h PROD_HOST -U PROD_USER -d mssp_production -c "SELECT version, created_at FROM schema_versions ORDER BY created_at DESC LIMIT 1;"

# 3. Apply new migrations (if any)
DATABASE_URL="postgresql://PROD_USER:PROD_PASS@PROD_HOST:5432/mssp_production" npx drizzle-kit push

# 4. Update schema version
DATABASE_URL="postgresql://PROD_USER:PROD_PASS@PROD_HOST:5432/mssp_production" node -e "
const { db } = require('./server/index.js');
const { schemaVersions } = require('./shared/schema.js');
db.insert(schemaVersions).values({
  version: '1.4.2',
  description: 'Entity relationships and UI improvements'
});
"
```

### **3.2 Code Deployment Process**

```bash
# 1. Test locally first
npm run test
npm run build

# 2. Push to repository
git add .
git commit -m "feat: Database sync and production updates"
git push origin main

# 3. Deploy to production server
# (Depends on your deployment method - PM2, Docker, etc.)
```

## 📊 **Step 4: Verification & Testing**

### **4.1 Database Health Check**

```bash
# Check all tables exist
psql -h PROD_HOST -U PROD_USER -d mssp_production -c "\\dt"

# Verify data integrity
psql -h PROD_HOST -U PROD_USER -d mssp_production -c "
SELECT 
  'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts  
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'schema_versions', COUNT(*) FROM schema_versions;
"

# Check latest schema version
psql -h PROD_HOST -U PROD_USER -d mssp_production -c "
SELECT version, description, created_at 
FROM schema_versions 
ORDER BY created_at DESC 
LIMIT 5;
"
```

### **4.2 Application Health Check**

```bash
# Test critical endpoints
curl -f http://PROD_HOST:5001/api/health
curl -f http://PROD_HOST:5001/api/clients
curl -f http://PROD_HOST:5001/api/contracts

# Test login functionality
curl -X POST http://PROD_HOST:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.mssp.local","password":"testpassword123"}'
```

## 🔄 **Step 5: Automated Sync Scripts**

### **5.1 Local Development Sync Script**

```bash
#!/bin/bash
# File: scripts/sync-local-dev.sh

echo "🔄 Syncing local development environment..."

# Choose database name
DB_NAME=${1:-mssp_db}  # Default to mssp_db, or pass mssp_production

# Stop any running servers
pkill -f "tsx server/index.ts" || true

# Create/recreate database
PGPASSWORD=devpass123 psql -h localhost -U mssp_user -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
PGPASSWORD=devpass123 psql -h localhost -U mssp_user -d postgres -c "CREATE DATABASE ${DB_NAME};"

# Set up schema and data
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/${DB_NAME}" ./setup-database.sh

# Start development server
echo "✅ Database ${DB_NAME} ready. Starting development server..."
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/${DB_NAME}" npm run dev
```

### **5.2 Production Sync Script**

```bash
#!/bin/bash
# File: scripts/sync-production.sh

echo "🚀 Syncing production environment..."

# Read production credentials
source .env.production

# Backup current database
echo "📦 Creating backup..."
pg_dump -h $PROD_DB_HOST -U $PROD_DB_USER -d $PROD_DB_NAME > "backup_$(date +%Y%m%d_%H%M%S).sql"

# Apply schema changes
echo "📊 Applying schema changes..."
DATABASE_URL="$PROD_DATABASE_URL" npx drizzle-kit push --force

# Update application
echo "🔄 Updating application..."
git pull origin main
npm ci --production
npm run build

# Restart services (adjust for your deployment)
echo "🔄 Restarting services..."
pm2 restart all || docker-compose restart || systemctl restart mssp-app

echo "✅ Production sync complete!"
```

## 🛡️ **Step 6: Safety Measures**

### **6.1 Pre-deployment Checklist**

- [ ] Local tests pass
- [ ] Database backup created
- [ ] Schema migrations tested
- [ ] Environment variables updated
- [ ] Dependencies updated
- [ ] Build successful
- [ ] No breaking changes

### **6.2 Rollback Plan**

```bash
# If something goes wrong, rollback:

# 1. Restore database from backup
psql -h PROD_HOST -U PROD_USER -d mssp_production < backup_TIMESTAMP.sql

# 2. Rollback code
git checkout PREVIOUS_COMMIT_HASH
npm ci --production
npm run build
pm2 restart all

# 3. Verify rollback
curl -f http://PROD_HOST:5001/api/health
```

## 📝 **Step 7: Environment-Specific Configurations**

### **Development (.env.local)**
```env
DATABASE_URL=postgresql://mssp_user:devpass123@localhost:5432/mssp_db
NODE_ENV=development
SMTP_DISABLED=true
```

### **Production (.env.production)**
```env
DATABASE_URL=postgresql://prod_user:secure_password@prod_host:5432/mssp_production
NODE_ENV=production
SMTP_HOST=smtp.example.com
SMTP_USER=notifications@company.com
SMTP_PASS=secure_smtp_password
```

## 🔍 **Step 8: Monitoring & Alerts**

### **Database Monitoring**
```sql
-- Monitor connection count
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = 'mssp_production';

-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **Application Monitoring**
```bash
# Monitor logs
tail -f /var/log/mssp-app/application.log

# Monitor memory usage
ps aux | grep "tsx server/index.ts"

# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5001/api/health
```

## 🎯 **Quick Commands Summary**

```bash
# Local development with mssp_db
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_db" npm run dev

# Local development with mssp_production (matching prod)
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" npm run dev

# Create admin user
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_db" node create-admin-user.cjs

# Reset database
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_db" ./setup-database.sh

# Apply schema changes
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_db" npx drizzle-kit push

# Test authentication
node test-auth-audit.cjs
```

## 🚨 **Troubleshooting Common Issues**

### **Issue 1: Database Connection Errors**
- Ensure PostgreSQL is running: `brew services start postgresql`
- Check database exists: `psql -l`
- Verify credentials in DATABASE_URL

### **Issue 2: Schema Mismatch**
- Run: `npx drizzle-kit push`
- Check schema versions: `SELECT * FROM schema_versions;`

### **Issue 3: Authentication Failures**
- Create test user: `node create-admin-user.cjs`
- Check session configuration
- Verify password hashing

### **Issue 4: Import/Build Errors**
- Clear node_modules: `rm -rf node_modules && npm ci`
- Check TypeScript: `npx tsc --noEmit`
- Verify import paths

---

**Next Steps:**
1. Choose your database strategy (Option A or B)
2. Fix the immediate issues
3. Test locally
4. Deploy to production using the sync scripts
5. Monitor and verify everything works 