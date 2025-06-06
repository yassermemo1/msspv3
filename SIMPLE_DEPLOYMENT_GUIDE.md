# MSSP Client Manager - Simple Deployment Guide

## 🚀 Quick Start (One Command)

```bash
# Run the complete deployment
./simple-deploy.sh
```

**That's it!** The script handles everything automatically.

---

## 📋 What This Does

### ✅ Uses Your Current User
- **No system user creation** (no more `mssp` user confusion)
- **Uses your home directory**: `~/MsspClientManager`
- **Simple permissions** - everything runs as you

### ✅ Segmented & Simple
- **Database setup**: `setup-database.sh`
- **Application setup**: `setup-application.sh` 
- **Coordinator**: `simple-deploy.sh` (runs both)
- **Verification**: `verify-database-schema.sh` (optional check)

### ✅ Fixes All Previous Issues
- ✅ Correct GitHub repository URL
- ✅ PostgreSQL 15 (fixes version conflicts)
- ✅ Node.js permission fixes
- ✅ Complete database migration handling
- ✅ Proper error handling

---

## 🔧 Individual Scripts

### 1. Database Setup Only
```bash
./setup-database.sh
```
**What it does:**
- Detects existing PostgreSQL installation
- Creates database `mssp_production` (if needed)
- Creates user `mssp_user` (if needed)
- **Applies all database migrations automatically**
- Verifies schema completeness
- Saves credentials to `~/.mssp_db_config`

### 2. Application Setup Only
```bash
./setup-application.sh
```
**What it does:**
- Checks for database config
- Sets up Node.js environment
- Clones repository to `~/MsspClientManager`
- Installs dependencies & builds frontend
- Creates environment configuration
- Starts with PM2

### 3. Database Schema Verification
```bash
./verify-database-schema.sh
```
**What it does:**
- Verifies all essential tables exist
- Checks foreign key relationships
- Validates database indexes
- Tests basic CRUD operations
- Shows database statistics

---

## 🗄️ Database Migration System

The deployment now includes **comprehensive migration handling**:

### Automatic Migration Detection
- Detects if database schema is incomplete
- Applies SQL migrations in correct sequence
- Supports both manual SQL and Drizzle migrations
- Verifies migration success

### Migration Files Applied
```
migrations/
├── 0000_typical_longshot.sql          # Core schema
├── 0000_magenta_hellion.sql          # Additional tables
├── 0001_warm_mathemanic.sql          # Schema fixes
├── 0002_bouncy_rick_jones.sql        # Enhancements
├── 0003_fix_documents_column.sql     # Document fixes
├── 0004_enhance_audit_system.sql     # Audit improvements
├── 0005_fix_documents_schema_mismatch.sql  # Schema alignment
├── 0006_cleanup_all_data.sql         # Data cleanup
├── 0007_simple_cleanup.sql           # Final cleanup
├── add-ldap-settings.sql             # LDAP support
└── add-data-sources-fields.sql       # Data source features
```

### Essential Database Tables
The system creates and verifies:
- **Core**: `users`, `clients`, `contracts`, `services`
- **Financial**: `financial_transactions`, `proposals`
- **Assets**: `hardware_assets`, `certificates_of_compliance`
- **Audit**: `audit_logs`, `change_history`, `security_events`
- **Documents**: `documents`, `document_versions`
- **Settings**: `company_settings`, `user_settings`
- **External**: `external_systems`, `client_external_mappings`
- **Data**: `data_sources`, `data_source_mappings`

---

## 🖥️ System Requirements

### Prerequisites
```bash
# Install Node.js 18+ (if not already installed)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Verify
node --version  # Should be 18+
```

### User Requirements
- **Regular user** (not root)
- **Sudo privileges**
- **Internet connectivity**
- **Existing PostgreSQL installation** (any version 10-16)

---

## 📍 Installation Locations

After deployment:

```
🏠 Your Home Directory
├── ~/.mssp_db_config          # Database credentials
└── MsspClientManager/         # Application directory
    ├── .env                   # Environment config
    ├── ecosystem.config.js    # PM2 config
    ├── uploads/               # File uploads
    ├── logs/                  # Application logs
    ├── migrations/            # Database migrations
    └── ...                    # Source code
```

---

## 🌐 Access Your Application

After successful deployment:

- **🔗 Local URL**: http://localhost:5001
- **🔗 Network URL**: http://YOUR_SERVER_IP:5001
- **🔍 Health Check**: http://localhost:5001/api/health

### Default Login
- **👤 Username**: `admin`
- **🔐 Password**: `admin123`

⚠️ **Change the password immediately after first login!**

---

## 🔧 Management Commands

```bash
# Check application status
pm2 status

# View application logs
pm2 logs mssp-client-manager

# Restart application
pm2 restart mssp-client-manager

# Stop application
pm2 stop mssp-client-manager

# View database credentials
cat ~/.mssp_db_config

# Verify database schema
./verify-database-schema.sh
```

---

## 🔍 Troubleshooting

### If Database Setup Fails
```bash
# Check PostgreSQL service
sudo systemctl status postgresql-15

# Check PostgreSQL logs
sudo journalctl -u postgresql-15 -f

# Verify database schema
./verify-database-schema.sh
```

### If Application Setup Fails
```bash
# Check PM2 logs
pm2 logs mssp-client-manager --lines 50

# Check if database config exists
cat ~/.mssp_db_config

# Test database connection manually
source ~/.mssp_db_config
PGPASSWORD="$DB_PASSWORD" /usr/pgsql-15/bin/psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT 1;"
```

### If Migrations Fail
```bash
# Run database setup again (it's safe to re-run)
./setup-database.sh

# Check specific migration files exist
ls -la migrations/

# Verify schema after migration attempt
./verify-database-schema.sh
```

### If Application Won't Start
```bash
# Check Node.js version
node --version

# Check if port 5001 is available
sudo lsof -i :5001

# Restart PM2 daemon
pm2 kill
pm2 resurrect
```

---

## 🗄️ Database Management

### Connection Information
```bash
# View database connection details
source ~/.mssp_db_config
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Connection: postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
```

### Manual Database Access
```bash
# Connect to database
source ~/.mssp_db_config
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U $DB_USER -d $DB_NAME

# Backup database
source ~/.mssp_db_config
PGPASSWORD="$DB_PASSWORD" pg_dump -h localhost -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql

# View database statistics
./verify-database-schema.sh
```

---

## 🆚 Differences from Previous Scripts

| **Old Complex Scripts** | **New Simple Scripts** |
|-------------------------|------------------------|
| Creates system users | Uses your current user |
| Complex directory structure | Simple home directory |
| Single large script | Segmented scripts |
| Hard to debug | Easy to debug step-by-step |
| Permission issues | No permission issues |
| Multiple PostgreSQL versions | Uses existing PostgreSQL |
| Manual migration handling | Automatic migration detection |
| No schema verification | Built-in schema verification |

---

## ⚡ Quick Commands Reference

```bash
# Complete deployment (fresh start)
./simple-deploy.sh

# Database only
./setup-database.sh

# Application only (after database)
./setup-application.sh

# Verify everything is working
./verify-database-schema.sh
pm2 status
curl -I http://localhost:5001/api/health

# View all credentials and info
cat ~/.mssp_db_config
pm2 logs mssp-client-manager --lines 10
```

---

## 🎯 Migration & Schema Details

### What Gets Created
- **25+ database tables** with proper relationships
- **20+ foreign key constraints** for data integrity
- **15+ indexes** for performance optimization
- **Default admin user** for initial access
- **Company settings** structure for customization

### Migration Safety
- **Idempotent migrations** - safe to run multiple times
- **Automatic detection** of existing schema
- **Graceful handling** of failed migrations
- **Verification system** to ensure completeness

### Troubleshooting Migrations
```bash
# If migrations seem incomplete
./setup-database.sh  # Re-run database setup

# Check what's missing
./verify-database-schema.sh

# Manual migration check
cd ~/MsspClientManager
ls -la migrations/
```

---

## 🔒 Security Notes

1. **Change default password** immediately after login
2. **Database credentials** are saved in `~/.mssp_db_config`
3. **Environment file** is at `~/MsspClientManager/.env`
4. **Consider firewall** setup for production use
5. **Regular backups** of database and application

---

## 🎯 Next Steps After Deployment

1. **🔑 Change default admin password**
2. **📧 Configure SMTP** for email notifications (optional)
3. **🔐 Setup LDAP** authentication (optional)
4. **🛡️ Configure firewall** for production
5. **📅 Setup automated backups**

---

**🎉 Your MSSP Client Manager is ready to use!**

Much simpler than before - no system users, no complex permissions, just straightforward deployment using your current user account. 