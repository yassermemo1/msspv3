# Schema Synchronization Guide

This guide covers the comprehensive schema synchronization system that ensures your database always matches the latest schema definitions from Drizzle.

## 🎯 **Problem Solved**

The new system addresses the issue where `npm run sync:production` failed because the `schema_versions` table didn't exist, and provides automatic schema comparison against the latest Drizzle definitions.

## 🛠️ **Core Components**

### 1. **Schema Versions Table Management**
- Automatically creates `schema_versions` table if missing
- Tracks version history with timestamps
- Maintains compatibility with different column naming conventions

### 2. **Drizzle-Based Synchronization** 
- Uses Drizzle-kit as the source of truth for schema definitions
- Compares database against latest TypeScript schema definitions
- Provides interactive schema migration prompts

### 3. **Comprehensive Version Tracking**
- Tracks script versions, app versions, and schema versions
- Records migration history and environment information
- Provides detailed audit trail of all schema changes

## 📋 **Available Commands**

### Quick Schema Check
```bash
npm run db:quick
# Fast overview: table count, data status, version check
```

### Drizzle Synchronization (Recommended)
```bash
npm run sync:drizzle
# Interactive sync with latest Drizzle schema
# Prompts before applying changes
# Always uses latest schema as source of truth
```

### Production Deployment Sync
```bash
npm run sync:production
# Full production deployment workflow
# Creates backups, applies changes, builds app
```

### Schema Setup (One-time)
```bash
npm run db:schema-setup
# Creates schema_versions table if missing
# Sets up initial version tracking
```

### Detailed Schema Analysis
```bash
npm run db:compare
# Comprehensive change tracking and comparison
# Shows detailed differences between snapshots
```

## 🔄 **How It Works**

### 1. **Version Detection**
The system automatically:
- Reads current app version from `package.json`
- Queries database for latest schema version
- Compares versions to detect mismatches

### 2. **Drizzle Schema Comparison**
Using `drizzle-kit check`:
- Compares database structure against TypeScript schema definitions
- Detects missing tables, columns, indexes, and constraints
- Identifies type mismatches and constraint differences

### 3. **Interactive Migration**
When differences are found:
- Displays detailed summary of required changes
- Prompts for user confirmation before applying
- Creates backup before making changes
- Updates version tracking after successful migration

### 4. **Automatic Recovery**
If `schema_versions` table is missing:
- Automatically creates the table with proper structure
- Inserts initial version record based on current app version
- Continues with normal synchronization process

## 🎚️ **Configuration**

### Environment Variables
```bash
# Database connection (required)
DATABASE_URL="postgresql://user:pass@host:port/database"

# Production database settings (for sync:production)
PROD_DB_HOST=localhost
PROD_DB_USER=mssp_user  
PROD_DB_PASS=your_password
PROD_DB_NAME=mssp_production
PROD_DATABASE_URL="postgresql://mssp_user:your_password@localhost:5432/mssp_production"
```

### Schema Versions Table Structure
```sql
CREATE TABLE schema_versions (
  id SERIAL PRIMARY KEY,
  script_version VARCHAR(20),
  app_version VARCHAR(20),
  schema_version VARCHAR(20) NOT NULL,
  version VARCHAR(20), -- For compatibility
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  environment VARCHAR(20) DEFAULT 'production',
  notes TEXT,
  migration_file VARCHAR(255),
  description TEXT
);
```

## 🚀 **Usage Scenarios**

### Development Workflow
```bash
# 1. Check current status
npm run db:quick

# 2. Sync with latest schema definitions
npm run sync:drizzle

# 3. If changes needed, apply them interactively
# Script will prompt: "Apply schema changes to database? (y/N)"
```

### Production Deployment
```bash
# 1. Full production sync (includes backup)
npm run sync:production

# 2. Or just schema sync for production
DATABASE_URL="$PROD_DATABASE_URL" npm run sync:drizzle
```

### First-Time Setup
```bash
# 1. Create schema_versions table
npm run db:schema-setup

# 2. Sync schema
npm run sync:drizzle

# 3. Verify setup
npm run db:quick
```

### Troubleshooting
```bash
# 1. Detailed analysis
npm run db:compare

# 2. Force schema setup
npm run db:schema-setup

# 3. Check with Drizzle directly
npx drizzle-kit check
```

## 📊 **Output Examples**

### Successful Sync
```
============================================================
DRIZZLE SCHEMA SYNCHRONIZATION
============================================================
📱 App Version: 1.6.0
🗄️  Database Version: 1.6.0
📅 Last Updated: 6/3/2025, 2:14:01 PM

✅ Database version matches app version
✅ Database schema is synchronized with Drizzle definitions

📊 Database Statistics:
   • Tables: 47
   • Total Rows: 3
   • Foreign Keys: 69
   • Indexes: 56

✅ SCHEMA SYNCHRONIZATION COMPLETED
✅ Database schema is fully synchronized
🎯 Current version: 1.6.0
🚀 Ready for production deployment
```

### Schema Changes Detected
```
⚠️  Database schema is NOT synchronized with Drizzle definitions
Details: Found 2 new tables: user_sessions, audit_logs

🤔 Apply schema changes to database? (y/N): y

🔧 Applying schema changes...
✅ Schema changes applied successfully
✅ Schema version updated to 1.6.0
```

## 🛡️ **Safety Features**

### Backup Creation
- `sync:production` automatically creates timestamped backups
- Backups stored in `./backups/` directory
- Rollback instructions provided in deployment summaries

### Interactive Prompts
- Never applies changes without user confirmation
- Shows detailed preview of changes before applying
- Allows cancellation at any step

### Version Validation
- Prevents accidental downgrades
- Validates version consistency across components
- Maintains audit trail of all changes

### Error Handling
- Graceful handling of missing tables/databases
- Detailed error messages with suggested solutions
- Automatic retry mechanisms for transient failures

## 🔧 **Advanced Usage**

### Manual Schema Operations
```bash
# Generate new migration
npm run db:generate

# Push changes without prompts (use with caution)
npx drizzle-kit push --force

# View schema in browser
npm run db:studio

# Direct database inspection
npx drizzle-kit introspect
```

### Custom Environment Sync
```bash
# Sync specific database
DATABASE_URL="postgresql://user:pass@host:port/db" npm run sync:drizzle

# Production environment
PROD_DATABASE_URL="..." npm run sync:production
```

## 📝 **Version History Tracking**

The system maintains detailed records of all schema changes:

```sql
-- View version history
SELECT schema_version, applied_at, description, environment 
FROM schema_versions 
ORDER BY applied_at DESC;

-- Check current version
SELECT schema_version, applied_at 
FROM schema_versions 
ORDER BY applied_at DESC 
LIMIT 1;
```

## 🎯 **Best Practices**

1. **Always run `npm run db:quick` first** to check current status
2. **Use `npm run sync:drizzle` for development** - it's interactive and safe
3. **Use `npm run sync:production` for deployments** - includes backup and verification
4. **Review changes carefully** before confirming schema migrations
5. **Keep backups** of important production data before major changes
6. **Test schema changes** in development environment first

## 🔍 **Troubleshooting**

### Common Issues

**"schema_versions table does not exist"**
```bash
npm run db:schema-setup
```

**"Database version mismatch"**
```bash
npm run sync:drizzle
```

**"Schema changes detected but won't apply"**
```bash
# Check Drizzle configuration
npx drizzle-kit check
# Or force recreate schema_versions
npm run db:schema-setup
```

**"Connection refused"**
- Verify DATABASE_URL is correct
- Ensure database server is running
- Check firewall/network settings

This system ensures your database schema is always synchronized with your latest code definitions while maintaining full audit trails and safety measures. 