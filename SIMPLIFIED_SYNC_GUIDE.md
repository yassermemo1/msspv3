# Simplified Database Sync Guide

## Overview

All database setup, schema synchronization, version management, and application building has been consolidated into a single command:

```bash
npm run sync:production
```

## What It Does

The `sync:production` command automatically performs **ALL** of the following operations:

### ✅ **Step 1: Database Connection**
- Tests database connectivity
- Validates credentials and connection

### ✅ **Step 2: Database Backup**
- Creates automatic backup with timestamp
- Stored in `./backups/` directory

### ✅ **Step 3: Schema Versioning Setup**
- Creates `schema_versions` table if missing
- Initializes version tracking

### ✅ **Step 4: Version Management**
- Checks current app vs database versions
- Displays version information

### ✅ **Step 5: Schema Synchronization**
- Uses Drizzle-kit to check for schema changes
- Prompts for confirmation if changes detected
- Applies schema migrations automatically

### ✅ **Step 6: Version Updates**
- Updates database version to match app version
- Records deployment in schema_versions table

### ✅ **Step 7: Database Statistics**
- Collects and displays database health info
- Shows table counts and record counts

### ✅ **Step 8: Application Build**
- Builds the application with `npm run build`
- Ensures everything compiles correctly

### ✅ **Step 9: Health Testing**
- Tests application endpoints (if server running)
- Basic connectivity validation

### ✅ **Step 10: Documentation**
- Generates deployment summary report
- Creates rollback instructions

## Usage

### Basic Usage
```bash
npm run sync:production
```

### With Custom Database URL
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db" npm run sync:production
```

### Environment Variables
The script will use these environment variables (in order of preference):
- `DATABASE_URL`
- `PROD_DATABASE_URL` 
- Default: `postgresql://mssp_user:devpass123@localhost:5432/mssp_production`

## Sample Output

```
================================================================================
🚀 COMPREHENSIVE PRODUCTION SYNC
================================================================================
Performing all database setup, sync, and build operations...

1. Testing Database Connection
--------------------------------------------------
🔌 Testing database connection...
✅ Database connection successful

2. Creating Database Backup
--------------------------------------------------
📦 Creating database backup...
✅ Backup created: ./backups/backup_2025-06-03T08-30-15.sql

3. Setting Up Schema Versioning
--------------------------------------------------
📋 Ensuring schema_versions table exists...
✅ schema_versions table already exists

4. Checking Version Information
--------------------------------------------------
📱 App Version: 1.6.0
🗄️  Database Version: 1.6.0
📅 Last Updated: 6/2/2025, 2:28:25 PM

5. Checking Schema Synchronization
--------------------------------------------------
🔍 Checking schema synchronization with Drizzle...
✅ Schema is synchronized

6. Updating Version Information
--------------------------------------------------
✅ Version information is current

7. Collecting Database Statistics
--------------------------------------------------
📊 Database contains 47 tables
   • clients: 25 records
   • contracts: 12 records
   • users: 4 records
   • services: 8 records

8. Building Application
--------------------------------------------------
🏗️  Building application...
✅ Application built successfully

9. Testing Application Health
--------------------------------------------------
🧪 Testing application endpoints...
✅ Health endpoint responding

10. Generating Deployment Summary
--------------------------------------------------
📄 Deployment summary saved: ./backups/deployment_summary_2025-06-03T08-30-15.txt

================================================================================
✅ COMPREHENSIVE SYNC COMPLETED SUCCESSFULLY
================================================================================
🎉 All operations completed in 15.3 seconds
🗄️  Database version: 1.6.0
📦 Application built and ready
💾 Backup available: ./backups/backup_2025-06-03T08-30-15.sql

🚀 Ready to start application:
   • Development: npm run dev
   • Production: npm run start
   • With auto-sync: npm run start:sync
```

## Alternative Commands

For specific operations, these commands are still available:

- **Local development sync**: `npm run sync:local`
- **Manual Drizzle sync**: `npm run sync:drizzle`
- **Quick database sync**: `npm run db:sync` (alias for `sync:production`)

## Rollback

If anything goes wrong, restore from the automatic backup:

```bash
# Find your backup file
ls -la backups/

# Restore database
psql "postgresql://user:pass@host:5432/db" < backups/backup_TIMESTAMP.sql
```

## Benefits

### Before (Multiple Commands)
```bash
npm run db:schema-setup        # Setup versioning
npm run db:compare            # Check schema
npm run sync:drizzle          # Sync with Drizzle
npm run db:migrate            # Apply migrations
npm run build                 # Build app
# ... plus manual version tracking
```

### Now (Single Command)
```bash
npm run sync:production       # Does everything!
```

### Time Savings
- **Before**: 5+ commands, manual checks, 3-5 minutes
- **Now**: 1 command, fully automated, 15-30 seconds

### Error Prevention
- Automatic backups before any changes
- Version consistency checks
- Schema synchronization validation
- Build verification
- Rollback instructions provided

## Troubleshooting

If the sync fails:

1. **Check the error message** - it will tell you exactly what went wrong
2. **Review the backup** - automatic backup is always created first
3. **Check database credentials** - ensure DATABASE_URL is correct
4. **Verify Drizzle config** - make sure drizzle.config.ts is valid
5. **Restore if needed** - use the backup file to rollback

## Migration from Old Scripts

The following old commands are **deprecated** and replaced by `sync:production`:

- ❌ `npm run db:schema`
- ❌ `npm run db:quick`
- ❌ `npm run db:check`
- ❌ `npm run db:compare`
- ❌ `npm run db:schema-setup`
- ❌ `npm run sync-setup-version`
- ❌ `npm run verify-versions`
- ❌ `npm run detect-schema-changes`
- ❌ `npm run pre-deploy`
- ❌ `npm run deploy-check`

**Just use**: ✅ `npm run sync:production` 