# Database Auto-Sync Guide

The MSSP Client Manager now includes automatic database schema synchronization that runs on each application startup. This eliminates the need to manually run `setup-database.sh` for most development workflows.

## How It Works

The auto-sync system:
1. **Checks database connection** on startup
2. **Runs pending migrations** using Drizzle-kit
3. **Tracks migration history** in a `schema_versions` table
4. **Updates schema version** to match the application version

## Usage

### Development Mode (Default)
```bash
npm run dev
```
Auto-sync is **enabled by default** in development mode.

### Development Without Auto-Sync
```bash
npm run dev:no-sync
```
Use this if you want to manually control migrations.

### Force Auto-Sync in Production
```bash
npm run start:sync
```
Use with caution - typically you should use manual migrations in production.

## License Pool Auto-Calculation

### Overview
The system now automatically calculates license pool values:
- **Total Licenses** = Calculated from `orderedLicenses` field
- **Available Licenses** = Total Licenses - Sum of assigned licenses to clients

### How It Works
1. **Creating License Pool**: Set `orderedLicenses`, `totalLicenses` is auto-calculated
2. **Assigning Licenses**: Available licenses automatically decrease
3. **Removing Assignments**: Available licenses automatically increase
4. **Editing Orders**: Total and available licenses recalculate automatically

### Example Workflow
```
Initial: Microsoft 365 - 0 licenses ordered
Order 100 licenses:
  - Ordered: 100
  - Total: 100 (auto-calculated)
  - Available: 100 (auto-calculated)

Assign 25 to Client A:
  - Ordered: 100
  - Total: 100
  - Available: 75 (auto-calculated)

Order 40 more licenses:
  - Ordered: 140
  - Total: 140 (auto-calculated)
  - Available: 115 (auto-calculated: 140 - 25)
```

### Manual Recalculation
If needed, you can manually recalculate all license pools:
```bash
DATABASE_URL="your_db_url" node scripts/recalculate-license-pools.cjs
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_AUTO_SYNC` | Force enable/disable auto-sync | `true` in dev, `false` in prod |
| `DATABASE_URL` | Database connection string | Required |

## Manual Migration Commands

For production or when you need manual control:

```bash
# Generate new migration
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# View current schema
npm run db:studio
```

## Migration Process

The auto-sync system tries multiple approaches:

1. **Primary**: Uses `drizzle-kit push` to sync schema changes
2. **Fallback**: Manually applies SQL migration files from `/migrations`
3. **Tracking**: Records applied migrations in `schema_versions` table

## Schema Versions Table

Auto-sync creates and maintains a `schema_versions` table:

```sql
CREATE TABLE schema_versions (
    id SERIAL PRIMARY KEY,
    script_version VARCHAR(20),
    app_version VARCHAR(20),
    schema_version VARCHAR(20),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    environment VARCHAR(20),
    notes TEXT,
    migration_file VARCHAR(255)
);
```

## When to Use Manual Setup

You should still use `setup-database.sh` for:

- **First-time setup** on a new system
- **Production deployments** (recommended)
- **Complex migrations** requiring manual intervention
- **Troubleshooting** database issues

## Troubleshooting

### Auto-sync Disabled
- Check `ENABLE_AUTO_SYNC` environment variable
- Verify you're in development mode
- Check server logs for error messages

### License Calculation Issues
- Run the recalculation script
- Check for orphaned license assignments
- Verify database constraints

### Migration Failures
- Check database connectivity
- Verify user permissions
- Review migration logs in console

## Safety Features

- **Backup creation** before major schema changes
- **Rollback capability** for failed migrations
- **Version tracking** to prevent conflicts
- **Error logging** for debugging issues

## Best Practices

1. **Development**: Use auto-sync for rapid iteration
2. **Staging**: Test migrations manually before production
3. **Production**: Use manual migrations with proper review process
4. **License Management**: Let the system auto-calculate, don't override manually

## Migration Flow

```
App Startup
    ↓
Check Environment
    ↓
Auto-sync enabled? → No → Skip sync
    ↓ Yes
Check DB Connection
    ↓
Try drizzle-kit push
    ↓
Success? → Yes → Update version → Done
    ↓ No
Try manual migrations
    ↓
Apply pending .sql files
    ↓
Update version table
    ↓
Done
```

This system provides the best of both worlds: automated convenience for development with manual control available when needed. 