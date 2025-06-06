# Database Schema Tracking Guide

This guide covers the comprehensive schema tracking and change detection tools available in the MSSP Client Manager system.

## Current Schema Status

Your development database currently has **46 tables**. This is the standard development schema configuration.

## Schema Tracking Tools

### 1. Quick Schema Check (`npm run db:quick`)

Provides a fast overview of your database schema:

```bash
npm run db:quick
# or
node quick-schema-check.cjs
```

**Output includes:**
- Total table count (46 expected for dev)
- Total row count across all tables
- Foreign key count
- Index count
- Tables with data (if any)
- Quick confirmation if you have 46-table or 51-table schema

### 2. Full Schema Analysis (`npm run db:compare`)

Comprehensive schema comparison and change tracking:

```bash
npm run db:compare
# or
node check-schema-changes.cjs
```

**Features:**
- **Complete table analysis** with column details
- **Change detection** between schema snapshots
- **New tables** tracking
- **Dropped tables** detection
- **Column changes** (new, dropped, modified)
- **Row count changes**
- **Detailed table information** (columns, indexes, foreign keys)

### 3. Available NPM Scripts

```bash
# Quick schema overview
npm run db:quick
npm run db:check      # alias for db:quick

# Full schema analysis and comparison
npm run db:compare
npm run db:schema     # alias for db:compare

# Standard database operations
npm run db:studio     # Open Drizzle Studio
npm run db:generate   # Generate new migration
npm run db:migrate    # Apply migrations
```

## Schema Change Detection

### How It Works

1. **First Run**: Creates a baseline snapshot (`schema-snapshot.json`)
2. **Subsequent Runs**: Compares current schema with the snapshot
3. **Automatic Tracking**: Detects and reports all changes

### Types of Changes Tracked

#### 🆕 New Tables
- Table name
- Column count
- Initial row count

#### ❌ Dropped Tables
- Previously existing tables that no longer exist
- Historical column and row information

#### 🔄 Modified Tables
- **New columns**: Name and type information
- **Dropped columns**: Previously existing columns
- **Modified columns**: Data type, nullable, default value changes
- **Row count changes**: Data growth or reduction

#### 📊 Schema Statistics
- Table count changes
- Foreign key relationship changes
- Index modifications

## Current 46-Table Schema

Your database includes these core table categories:

### Core Business Tables (12)
- `clients` - Client information
- `contracts` - Service contracts
- `services` - Service definitions
- `service_scopes` - Service scope definitions
- `proposals` - Client proposals
- `financial_transactions` - Financial records
- `hardware_assets` - Hardware inventory
- `license_pools` - License management
- `client_licenses` - License assignments
- `individual_licenses` - Individual license tracking
- `company_settings` - System configuration
- `users` - User accounts

### Document Management (4)
- `documents` - Document storage
- `document_versions` - Version control
- `document_access` - Access permissions
- `certificates_of_compliance` - Compliance certificates

### Audit & Tracking (4)
- `audit_logs` - System audit trail
- `change_history` - Change tracking
- `data_access_logs` - Data access logging
- `security_events` - Security event tracking

### Client Relations (8)
- `client_contacts` - Contact information
- `client_team_assignments` - Team assignments
- `client_hardware_assignments` - Hardware assignments
- `client_external_mappings` - External system mappings
- `client_feedback` - Client feedback
- `client_satisfaction_surveys` - Satisfaction surveys
- `service_authorization_forms` - Service authorizations
- `service_scope_fields` - Service scope field definitions

### System & Integration (10)
- `external_systems` - External system definitions
- `data_sources` - Data source configurations
- `data_source_mappings` - Data mapping definitions
- `integrated_data` - Integrated data storage
- `custom_fields` - Custom field definitions
- `custom_field_values` - Custom field values
- `page_permissions` - Page-level permissions
- `user_settings` - User preferences
- `system_events` - System event logging
- `global_search_index` - Search index

### Dashboard & UI (8)
- `dashboards` - Dashboard definitions
- `user_dashboards` - User dashboard assignments
- `user_dashboard_settings` - Dashboard preferences
- `widgets` - Widget definitions
- `dashboard_widgets` - Dashboard widget assignments
- `dashboard_widget_assignments` - Widget assignments
- `saved_searches` - Saved search queries
- `search_history` - Search history tracking

## Schema Snapshot File

The system maintains a `schema-snapshot.json` file that contains:

```json
{
  "timestamp": "2025-06-03T21:08:52.000Z",
  "table_count": 46,
  "tables": {
    "table_name": {
      "type": "BASE TABLE",
      "columns": [...],
      "indexes": [...],
      "foreign_keys": [...],
      "constraints": [...],
      "row_count": 0
    }
  }
}
```

## Migration Workflow

### Development Process

1. **Check Current State**:
   ```bash
   npm run db:quick
   ```

2. **Make Schema Changes**:
   - Modify `shared/schema.ts`
   - Update table definitions

3. **Generate Migration**:
   ```bash
   npm run db:generate
   ```

4. **Apply Changes**:
   ```bash
   npm run db:migrate
   ```

5. **Verify Changes**:
   ```bash
   npm run db:compare
   ```

### Change Documentation

The schema comparison tool provides detailed output for all changes:

```
🆕 NEW TABLES
  ✅ new_table_name
     Columns: 8, Rows: 0

🔄 MODIFIED TABLE: existing_table
  ➕ New columns (2):
     + new_column_1
     + new_column_2
  🔄 Modified columns (1):
     ~ column_name
       Type: text → varchar(255)
       Nullable: YES → NO
```

## Best Practices

### Before Making Changes
1. Run `npm run db:quick` to check current state
2. Document planned changes
3. Create a backup if working with data

### After Making Changes
1. Run `npm run db:compare` to verify changes
2. Review the change summary
3. Update documentation if needed
4. Commit both schema and snapshot files

### Regular Maintenance
- Run schema checks before deployments
- Keep snapshot files in version control
- Document significant schema changes
- Monitor table growth and performance

## Troubleshooting

### Schema Mismatch Issues
```bash
# Reset to baseline
rm schema-snapshot.json
npm run db:compare  # Creates new baseline
```

### Connection Issues
```bash
# Check database connectivity
DATABASE_URL="your_connection_string" npm run db:quick
```

### Migration Conflicts
```bash
# Force schema push (development only)
npm run db:migrate
```

## Integration with CI/CD

### Pre-deployment Checks
```bash
# Add to your CI pipeline
npm run db:compare  # Check for unexpected changes
npm run db:quick    # Verify table count
```

### Deployment Validation
```bash
# Post-deployment verification
npm run db:quick    # Confirm schema integrity
```

## Advanced Usage

### Custom Database URL
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db" npm run db:quick
```

### Schema Comparison Between Environments
```bash
# Save production snapshot
DATABASE_URL="$PROD_URL" node check-schema-changes.cjs > prod-schema.json

# Compare with development
npm run db:compare
```

### Automated Schema Monitoring
```bash
# Add to cron job or monitoring system
npm run db:quick | grep "Total Tables"
```

This comprehensive schema tracking system ensures you always know the exact state of your database and can confidently track changes over time. 