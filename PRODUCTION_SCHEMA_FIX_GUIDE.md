# Production Database Schema Fix Guide

## Problem

Your production environment is showing the error:
```
Get clients error: error: column "deleted_at" does not exist
```

This indicates that the production database schema is outdated and missing recent migrations, specifically the soft deletion functionality added to the clients table.

## Solution

We've created a dedicated script to fix this issue: `scripts/fix-production-schema.sh`

### Option 1: Quick Fix (Recommended)

**On your production server:**

1. Navigate to your application directory:
   ```bash
   cd /root/v/MsspClientManager
   ```

2. Run the production schema fix script:
   ```bash
   bash scripts/fix-production-schema.sh
   ```

3. Follow the prompts and confirm the fixes when asked

4. Restart your application:
   ```bash
   # If using systemd service
   sudo systemctl restart mssp-app
   
   # Or if running manually
   pkill -f "node.*server"
   npm run start
   ```

### Option 2: Using DATABASE_URL (If custom database config)

If you're using a custom database configuration:

```bash
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_db" bash scripts/fix-production-schema.sh
```

### Option 3: Manual Fix (If script fails)

If the automated script doesn't work, you can apply the fix manually:

1. Connect to your database:
   ```bash
   PGPASSWORD="12345678" psql -h localhost -U mssp_user -d mssp_production
   ```

2. Add the missing column:
   ```sql
   -- Add deleted_at column to clients table
   ALTER TABLE "public"."clients" ADD COLUMN "deleted_at" timestamp;
   
   -- Add indexes for performance
   CREATE INDEX IF NOT EXISTS "idx_clients_deleted_at" ON "public"."clients" ("deleted_at");
   CREATE INDEX IF NOT EXISTS "idx_clients_active" ON "public"."clients" ("deleted_at") WHERE "deleted_at" IS NULL;
   
   -- Update status constraint
   ALTER TABLE "public"."clients" DROP CONSTRAINT IF EXISTS "clients_status_check";
   ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_status_check" 
     CHECK (status = ANY (ARRAY['prospect'::text, 'active'::text, 'inactive'::text, 'suspended'::text, 'archived'::text]));
   ```

3. Create/update schema_versions table:
   ```sql
   CREATE TABLE IF NOT EXISTS schema_versions (
       id SERIAL PRIMARY KEY,
       version VARCHAR(20) NOT NULL,
       script_version VARCHAR(20),
       app_version VARCHAR(20),
       schema_version VARCHAR(20),
       applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       environment VARCHAR(20),
       notes TEXT
   );
   
   INSERT INTO schema_versions (version, script_version, app_version, schema_version, environment, notes) 
   VALUES ('1.4.2', '1.4.2', '1.4.2', '1.4.2', 'production', 'Manual schema fix applied')
   ON CONFLICT DO NOTHING;
   ```

4. Exit psql and restart your application

## What the Fix Does

The script will:

1. **Check Current Schema**: Analyzes what's missing from your database
2. **Add Missing Columns**: Specifically adds the `deleted_at` column to the clients table
3. **Create Indexes**: Adds performance indexes for the new column
4. **Update Constraints**: Updates status checks to include 'archived' status
5. **Version Tracking**: Creates/updates the schema_versions table for future tracking
6. **Verify Fixes**: Tests that all changes work correctly

## Verification

After running the fix, verify it worked:

1. Check that the column exists:
   ```bash
   PGPASSWORD="12345678" psql -h localhost -U mssp_user -d mssp_production -c "
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name='clients' AND column_name='deleted_at';"
   ```

2. Test a simple query:
   ```bash
   PGPASSWORD="12345678" psql -h localhost -U mssp_user -d mssp_production -c "
   SELECT id, name, deleted_at FROM clients LIMIT 5;"
   ```

3. Check your application logs for the "deleted_at" error - it should be gone

## Prevention

To prevent this issue in the future:

1. **Always run the full setup script** when deploying updates:
   ```bash
   ./setup-database.sh
   ```

2. **Use the schema detection script** before starting the application:
   ```bash
   npm run detect-schema-changes
   ```

3. **Monitor schema versions** in the database to ensure they match your application version

## Troubleshooting

### Script fails with "PostgreSQL psql command not found"
- Install PostgreSQL client tools or specify the full path to psql
- On RedHat: `sudo yum install postgresql16`

### Script fails with "Cannot connect to database"
- Verify PostgreSQL is running: `sudo systemctl status postgresql-16`
- Check database exists: `sudo -u postgres psql -l | grep mssp_production`
- Verify user permissions

### Application still shows "deleted_at" error after fix
- Restart the application completely
- Check that you're connecting to the correct database
- Verify the DATABASE_URL environment variable

## Contact

If you continue to have issues, the script provides detailed logging to help diagnose the problem. Review the script output and check that all steps completed successfully. 