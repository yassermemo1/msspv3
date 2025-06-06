# Database Sync - Quick Reference

## 🚀 **Quick Commands**

### **Local Development**
```bash
# Option 1: Using npm scripts (recommended)
npm run db:sync              # Sync with mssp_production (default)
npm run sync:local           # Same as above
npm run db:reset             # Reset and sync mssp_production

# Option 2: Using scripts directly
./scripts/sync-local-dev.sh                     # Uses mssp_production (default)
./scripts/sync-local-dev.sh my_custom_db_name   # Uses custom database name
```

### **Production Deployment**
```bash
# Create .env.production first with your production credentials
npm run sync:production      # Run production sync script
./scripts/sync-production.sh # Same as above
```

## 🗄️ **Database Configuration**

### **Option A: Use mssp_production (Default)**
```bash
# Start with default mssp_production database
npm run dev

# Or explicitly specify environment
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" npm run dev
```

### **Manual Database Creation**
```bash
# Create database manually if needed
createdb mssp_production

# Or using SQL
psql -c "CREATE DATABASE mssp_production;"
```

## 🔄 **Common Workflows**

### **Fresh Setup**
```bash
npm run db:sync    # Creates mssp_production, sets up schema & data
npm run dev        # Start development server
```

### **Reset Everything**  
```bash
npm run db:reset   # Drops and recreates mssp_production
npm run dev        # Start fresh
```

### **Production Deployment**
```bash
# Set up .env.production with real credentials
DATABASE_URL="postgresql://prod_user:secure_pass@prod-host:5432/mssp_production"
SMTP_HOST="smtp.gmail.com"
# ... other production settings

npm run sync:production  # Deploy to production
```

## 🛠️ **Environment Variables**

### **Development (.env)**
```bash
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production"
NODE_ENV="development"
LDAP_URL="ldap://ldap.forumsys.com:389"
```

### **Production (.env.production)**
```bash
export DATABASE_URL="postgresql://prod_user:secure_pass@prod-host:5432/mssp_production"
export NODE_ENV="production"
export LDAP_URL="ldap://your-ldap-server:389"
```

## ⚡ **Quick Troubleshooting**

### **Database Connection Issues**
```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql -h localhost -U mssp_user -d mssp_production -c "SELECT version();"

# Recreate database
npm run db:reset
```

### **Schema Issues**
```bash
# Check current schema version
psql -h localhost -U mssp_user -d mssp_production -c "SELECT version FROM schema_version ORDER BY applied_at DESC LIMIT 1;"

# Force schema update
npm run db:reset
```

### **Permission Issues**
```bash
# Grant permissions manually
psql -h localhost -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE mssp_production TO mssp_user;"
```

---

**📝 Note**: All scripts default to `mssp_production` database. Custom database names can be passed as arguments to the sync scripts.

## 🔧 **Manual Database Operations**

### **Create Database**
```bash
# As postgres superuser
createdb mssp_production
createdb mssp_development

# Or using psql
psql -c "CREATE DATABASE mssp_production;"
psql -c "CREATE DATABASE mssp_development;"
```

### **Apply Schema Changes**
```bash
# Apply to specific database
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" npx drizzle-kit push

# Check for changes first
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" npx drizzle-kit check
```

### **Create Users**
```bash
# Create admin user
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" node create-admin-user.cjs

# Create specific user
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" node create-admin-user.cjs admin@test.mssp.local SecureTestPass123! testadmin Test Admin
```

## 🔍 **Troubleshooting**

### **Database Connection Issues**
```bash
# Check PostgreSQL is running
brew services list | grep postgres
brew services start postgresql

# Check databases exist
psql -l | grep mssp

# Test connection
psql -h localhost -U mssp_user -d mssp_production -c "SELECT 1;"
```

### **Permission Issues**
```bash
# Grant permissions (as postgres user)
psql -c "GRANT ALL PRIVILEGES ON DATABASE mssp_production TO mssp_user;"
psql -c "ALTER USER mssp_user CREATEDB;"
```

### **Schema Issues**
```bash
# Check current schema version
psql -h localhost -U mssp_user -d mssp_production -c "SELECT * FROM schema_versions ORDER BY created_at DESC;"

# Check tables exist
psql -h localhost -U mssp_user -d mssp_production -c "\\dt"

# Force schema push
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" npx drizzle-kit push --force
```

## 🎯 **Best Practices**

1. **Always backup before production changes**
   ```bash
   pg_dump database_name > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test schema changes locally first**
   ```bash
   npm run db:sync          # Test locally
   npm run sync:production  # Deploy to production
   ```

3. **Verify deployment success**
   ```bash
   curl -f http://localhost:5001/api/health
   psql -c "SELECT * FROM schema_versions ORDER BY created_at DESC LIMIT 1;"
   ```

4. **Monitor logs**
   ```bash
   tail -f /var/log/app/application.log
   ```

## 🚨 **Emergency Rollback**

### **Database Rollback**
```bash
# Restore from backup
psql database_name < backup_TIMESTAMP.sql
```

### **Application Rollback**
```bash
git checkout PREVIOUS_COMMIT
npm ci --production
npm run build
pm2 restart all
```

---

**Need Help?**
- Check `PRODUCTION_SYNC_GUIDE.md` for detailed instructions
- Review terminal logs for specific error messages
- Test locally before applying to production 