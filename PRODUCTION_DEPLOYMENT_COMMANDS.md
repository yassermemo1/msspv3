# Production Deployment Commands

## Quick Fix for Current Issue

Run these commands on your production server:

```bash
# 1. Install all dependencies (including postgres package)
npm install

# 2. Verify postgres package is installed
npm list postgres

# 3. Start the production server
npm start
```

## Complete Production Deployment Process

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Install Dependencies
```bash
# Install all production dependencies
npm install --only=production

# Or install all dependencies (including dev dependencies for build)
npm install
```

### 3. Build the Application
```bash
npm run build
```

### 4. Start Production Server
```bash
npm start
```

## Environment Variables Setup

Create a production environment file:
```bash
# Create production environment file
cat > .env.production << EOF
DATABASE_URL="postgresql://mssp_user:12345678@localhost:5432/mssp_production"
NODE_ENV="production"
PORT="5001"
JIRA_USERNAME="your-working-username"
JIRA_PASSWORD="your-password"
NODE_TLS_REJECT_UNAUTHORIZED="0"
EOF

# Load environment and start
source .env.production && npm start
```

## Troubleshooting

### If postgres package is missing:
```bash
npm install postgres@^3.4.7
```

### If drizzle-orm is missing:
```bash
npm install drizzle-orm@^0.39.3
```

### Check all critical dependencies:
```bash
npm list postgres drizzle-orm tsx express
```

### Verify database connection:
```bash
# Test database connection
node -e "
const postgres = require('postgres');
const sql = postgres('postgresql://mssp_user:12345678@localhost:5432/mssp_production');
sql\`SELECT NOW()\`.then(result => {
  console.log('✅ Database connected:', result[0].now);
  process.exit(0);
}).catch(err => {
  console.error('❌ Database error:', err.message);
  process.exit(1);
});
"
```

## Production Server Status Check

```bash
# Check if server is running
ps aux | grep tsx

# Check port usage
lsof -i :5001

# Check logs
tail -f /var/log/mssp-manager.log  # if using systemd
```

## Quick Recovery Commands

If you need to restart everything:
```bash
# Kill any existing processes
pkill -f "tsx server/index.ts"

# Clean install
rm -rf node_modules package-lock.json
npm install

# Start fresh
npm start
```

## 🎯 **NEW: Automatic Schema Detection**

**Before any deployment, run:**
```bash
npm run detect-schema-changes
```

**Outputs:**
- ✅ **No database setup required** - Proceed with standard deployment
- 🚨 **Database setup required** - Run `./setup-database.sh` first

---

## 🔄 **Standard Deployment (No DB Changes)**

```bash
# 1. Check if database setup is needed
npm run deploy-check

# 2. If no schema changes detected, proceed:
npm run build
git push origin main

# 3. Deploy (production server)
npm install --production
npm run start
```

## 🗄️ **Database Schema Deployment (With DB Changes)**

```bash
# 1. Automatic detection will tell you if setup is needed
npm run detect-schema-changes

# 2. If setup required, run:
./setup-database.sh

# 3. Verify everything is synchronized
npm run verify-versions

# 4. Build and deploy
npm run build
git push origin main
```

## 🤖 **How the Automatic Detection Works**

The `detect-schema-changes` script checks:

### ✅ **Version Synchronization**
- Compares `package.json` version with `setup-database.sh` version
- Checks database schema version (if available)

### ✅ **Recent Code Changes**
- Scans last 14 days of git commits for `[DB REQUIRED]` tags
- Monitors changes to schema-related files:
  - `migrations/` directory
  - `shared/schema.ts`
  - `setup-database.sh`
  - `drizzle.config.ts`

### ✅ **Migration Files**
- Detects new or modified migration files
- Checks for recent database migrations

---

## 📊 **Quick Decision Matrix**

| Detection Result | Action Required | Commands |
|------------------|----------------|----------|
| ✅ No schema changes | Standard deploy | `npm run build && git push` |
| 🚨 Version mismatch | Run setup script | `./setup-database.sh` then deploy |
| 🚨 Schema changes found | Run setup script | `./setup-database.sh` then deploy |
| ⚠️ Cannot check DB | Run setup (safe) | `./setup-database.sh` then deploy |

---

## 🚀 **One-Command Deployment Check**

```bash
# This checks everything and tells you exactly what to do:
npm run deploy-check

# Example outputs:
# ✅ No database setup required! All versions synchronized (1.4.0)
# 🚨 DATABASE SETUP REQUIRED! Run: ./setup-database.sh
```

---

## 📋 **Development Workflow**

### **When Making Schema Changes:**

1. **Make your database changes**
2. **Mark commit with [DB REQUIRED] tag:**
   ```bash
   git commit -m "feat: Add entity relations system [DB REQUIRED]"
   ```
3. **Update SCHEMA_CHANGELOG.md** with new version section
4. **Test locally:**
   ```bash
   ./setup-database.sh
   npm run verify-versions
   ```

### **When Deploying:**

1. **Check for schema changes:**
   ```bash
   npm run detect-schema-changes
   ```
2. **Follow the script's recommendations**
3. **Deploy with confidence**

---

## 🔍 **Manual Verification Commands**

```bash
# Check current versions
npm run verify-versions

# Check for schema changes (detailed)
npm run detect-schema-changes

# Check database connection
curl http://localhost:5001/api/health

# Check entity navigation (if implemented)
curl http://localhost:5001/api/entities/definitions
```

---

## 📈 **Entity Relations Deployment**

Since we have the comprehensive entity navigation system, the detection script automatically handles:

- **Entity relations schema** (13 entity types, 22 relationship types)
- **Cross-entity relationship mappings**
- **Navigation API endpoints setup**
- **All migrations for the entity system**

**No manual intervention needed for entity relations!**

---

## 🔧 **Production Environment Variables**

```bash
# Required for production
export DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production"
export NODE_ENV="production"

# Run application
npm run start
```

---

## ✅ **Complete Deployment Example**

### **Scenario 1: No Schema Changes**
```bash
user@server:~$ npm run detect-schema-changes
✅ No database setup required! All versions synchronized (1.4.0)

user@server:~$ npm run build && git push origin main
# Deploy normally
```

### **Scenario 2: Schema Changes Detected**
```bash
user@server:~$ npm run detect-schema-changes
🚨 DATABASE SETUP REQUIRED! Run: ./setup-database.sh

user@server:~$ ./setup-database.sh
✅ Database setup completed successfully

user@server:~$ npm run build && git push origin main
# Deploy with updated schema
```

### **Scenario 3: Version Mismatch**
```bash
user@server:~$ npm run detect-schema-changes
🚨 Version mismatch detected!
  App: 1.5.0
  Database: 1.4.0
Run: ./setup-database.sh

user@server:~$ ./setup-database.sh
✅ Schema updated to v1.5.0

user@server:~$ npm run verify-versions
✅ All versions synchronized (1.5.0)
```

---

## 🆘 **Troubleshooting**

### **Script says setup required but I haven't changed anything:**
```bash
# Check what triggered the detection
npm run detect-schema-changes --verbose

# Force verify all versions
npm run verify-versions

# Safe approach: run setup anyway (no harm)
./setup-database.sh
```

### **Database connection errors:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Test connection manually
psql -U mssp_user -d mssp_production -c "SELECT 1;"

# Restart PostgreSQL if needed
brew services restart postgresql@14
```

### **Schema version table missing:**
```bash
# Run setup to create version tracking
./setup-database.sh
```

---

## 🎯 **Summary: No More Guesswork!**

**Before this system:** 
- "Did you change the database?"
- "I'm not sure, better run setup to be safe"
- Manual checking of multiple files

**With automated detection:**
- Run `npm run detect-schema-changes`
- Get clear YES/NO answer
- Automatic scanning of all relevant changes
- One command tells you exactly what to do

**The script is smart enough to only recommend setup when truly needed!** 