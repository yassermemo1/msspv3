# 🔄 Production Schema Update Commands (Preserve Data)

## 🚀 **Update Schema Without Data Loss**

Use these commands to update your production schema while keeping all existing data.

### **Option 1: Automated Script (Recommended)**

```bash
# Make the script executable (if not already)
chmod +x update-production-schema.sh

# Run the update script
./update-production-schema.sh
```

### **Option 2: Manual Step-by-Step Commands**

If you prefer to run commands manually:

#### **1. Check Database Status**
```bash
# Verify database is accessible
sudo -u postgres /usr/pgsql-16/bin/psql -d mssp_production -c "\dt"
```

#### **2. Generate New Migrations**
```bash
# Generate migrations for any schema changes
npm run db:generate
```

#### **3. Apply Migrations**
```bash
# Apply migrations to update schema (preserves data)
npm run db:migrate
```

#### **4. Verify Schema Update**
```bash
# Check that tables exist and schema is updated
sudo -u postgres /usr/pgsql-16/bin/psql -d mssp_production -c "\dt"

# Verify admin user still exists
sudo -u postgres /usr/pgsql-16/bin/psql -d mssp_production -c "SELECT COUNT(*) FROM users WHERE role = 'admin';"
```

## 🔍 **What This Does:**

✅ **Preserves all existing data**
- Users, clients, contracts, services remain intact
- Audit logs, transactions, and history preserved
- No data loss during schema updates

✅ **Applies only new changes**
- Adds new tables if defined
- Modifies existing columns safely
- Adds new indexes and constraints

✅ **Safe migration process**
- Uses Drizzle's migration system
- Rollback capability if issues occur
- Validates schema after updates

## 🆚 **Difference from Full Reset:**

| Action | Full Reset | Schema Update |
|--------|------------|---------------|
| **Data** | ❌ Lost | ✅ Preserved |
| **Users** | ❌ Recreated | ✅ Preserved |
| **Schema** | ✅ Fresh | ✅ Updated |
| **Speed** | Fast | Moderate |
| **Risk** | High | Low |

## 🛠️ **When to Use Each:**

### **Use Schema Update When:**
- You have important production data
- Users are already using the system
- You want to apply new features/changes
- You need zero-downtime updates

### **Use Full Reset When:**
- Database is corrupted
- Starting fresh is preferred
- Test/development environment
- Data can be safely lost

## 🚨 **Backup Recommendation:**

Even though this preserves data, it's always good practice to backup:

```bash
# Create a backup before updating
sudo -u postgres /usr/pgsql-16/bin/pg_dump mssp_production > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🔧 **Troubleshooting:**

### **If migration fails:**
```bash
# Check migration status
npm run db:status

# If needed, rollback last migration
npm run db:rollback
```

### **If schema conflicts:**
```bash
# Force push schema (use carefully)
npm run db:push

# Or reset migrations and try again
rm -rf migrations/*
npm run db:generate
npm run db:migrate
``` 