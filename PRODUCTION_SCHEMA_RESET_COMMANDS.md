# 🔄 Production Schema Reset Commands (RedHat Server)

## 🚨 IMPORTANT: Use these commands on your RedHat production server

### **Option 1: Automated Script (Recommended)**

```bash
# Make the script executable (if not already)
chmod +x reset-production-schema.sh

# Run the reset script
./reset-production-schema.sh
```

### **Option 2: Manual Step-by-Step Commands**

If you prefer to run commands manually or the script fails:

#### **1. Stop Production Server**
```bash
# Stop any running production server
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "node server/index.js" 2>/dev/null || true
```

#### **2. Reset Database (Using PostgreSQL 16 Path)**
```bash
# Connect as postgres user using sudo and reset database
sudo -u postgres /usr/pgsql-16/bin/psql -c "DROP DATABASE IF EXISTS mssp_production;"
sudo -u postgres /usr/pgsql-16/bin/psql -c "CREATE DATABASE mssp_production OWNER mssp_user;"
```

#### **3. Apply Fresh Schema**
```bash
# Apply latest schema using Drizzle
npm run db:push
# OR if using yarn
yarn db:push
```

#### **4. Create Admin User**
```bash
# Create default admin user
node create-admin-user.cjs
# OR if using tsx
tsx create-admin-user.cjs
```

#### **5. Verify Setup (Optional)**
```bash
# Check table count (should be around 46 tables)
sudo -u postgres /usr/pgsql-16/bin/psql -d mssp_production -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"

# Check admin user exists
sudo -u postgres /usr/pgsql-16/bin/psql -d mssp_production -c "SELECT COUNT(*) as user_count FROM users;"
```

#### **6. Start Production Server**
```bash
# Start the production server
./start-production.sh
```

---

## 🔐 **Default Admin Credentials**

After reset, use these credentials to log in:

- **URL:** `http://localhost:5001`
- **Email:** `admin@mssp.local`
- **Password:** `admin123`
- **Username:** `admin`

---

## 🛠️ **Troubleshooting**

### **PostgreSQL Command Not Found**
If you get "psql: command not found", use the full path:
```bash
# For PostgreSQL 16 on RedHat/CentOS
/usr/pgsql-16/bin/psql

# For other versions, check:
ls /usr/pgsql-*/bin/psql
```

### **Permission Issues**
```bash
# Ensure postgres user can access the database
sudo -u postgres /usr/pgsql-16/bin/psql -l

# Check if mssp_user exists
sudo -u postgres /usr/pgsql-16/bin/psql -c "SELECT rolname FROM pg_roles WHERE rolname = 'mssp_user';"
```

### **Database Connection Issues**
```bash
# Test database connection
sudo -u postgres /usr/pgsql-16/bin/psql -d mssp_production -c "SELECT current_database();"
```

### **Schema Application Failed**
```bash
# Check if .env has correct database URL
cat .env | grep DATABASE_URL

# Manually check Drizzle config
npx drizzle-kit introspect
```

---

## 📋 **Alternative PostgreSQL Paths**

Depending on your PostgreSQL installation:

```bash
# Standard PostgreSQL 16 on RedHat/CentOS/Rocky Linux
/usr/pgsql-16/bin/psql

# Standard PostgreSQL 15
/usr/pgsql-15/bin/psql

# Standard PostgreSQL 14
/usr/pgsql-14/bin/psql

# System default (if in PATH)
psql
```

---

## ⚠️ **Important Notes**

1. **Backup Warning:** This will completely delete all existing data
2. **Environment:** Ensure you're running this on the production server
3. **Dependencies:** Make sure npm/yarn and node/tsx are installed
4. **PostgreSQL:** Ensure PostgreSQL service is running
5. **Permissions:** You need sudo access to switch to postgres user

## 🔍 Verification Commands

After reset, verify everything is working:

```bash
# Check database connection
psql "postgresql://mssp_user:devpass123@localhost:5432/mssp_production" -c "SELECT version();"

# Check tables created
psql "postgresql://mssp_user:devpass123@localhost:5432/mssp_production" -c "\dt"

# Check admin user
psql "postgresql://mssp_user:devpass123@localhost:5432/mssp_production" -c "SELECT email, role FROM users WHERE role = 'admin';"

# Check server status (after starting)
./production-status.sh
```

## 🚀 Expected Results

After successful reset:

- ✅ **Tables**: ~46 tables created
- ✅ **Admin User**: 1 admin user created
- ✅ **Database**: Fresh `mssp_production` database
- ✅ **Schema**: Latest version applied
- ✅ **Server**: Ready to start

## 🌐 Access Information

Once reset and server started:

- **URL**: http://localhost:5001
- **Admin Login**: 
  - Email: `admin@mssp.local`
  - Password: `admin123`

## 🛠️ Troubleshooting

### **Permission Issues**
```bash
# Ensure mssp_user has proper permissions
sudo -u postgres psql -c "ALTER USER mssp_user CREATEDB;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mssp_production TO mssp_user;"
```

### **PostgreSQL Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL if stopped
sudo systemctl start postgresql
```

### **Database User Issues**
```bash
# Check if mssp_user exists
sudo -u postgres psql -c "\du"

# Create user if missing
sudo -u postgres psql -c "CREATE USER mssp_user WITH PASSWORD 'devpass123';"
sudo -u postgres psql -c "ALTER USER mssp_user CREATEDB;"
```

---

**🎉 Your production schema will be completely fresh and ready to use!** 