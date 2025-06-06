# MSSP Client Manager - Version Management Guide

## 🚀 Automatic Version Incrementing

This project includes an automated version management system that intelligently increments version numbers based on your commit messages and changes.

## 📋 Available Commands

### Manual Version Bumping

```bash
# Bump patch version (1.0.0 → 1.0.1)
npm run version:patch

# Bump minor version (1.0.0 → 1.1.0)  
npm run version:minor

# Bump major version (1.0.0 → 2.0.0)
npm run version:major
```

### Quick Shell Script

```bash
# Patch version (default)
./scripts/version-bump.sh

# Specific version types
./scripts/version-bump.sh patch
./scripts/version-bump.sh minor  
./scripts/version-bump.sh major
```

### Intelligent Auto-Versioning

```bash
# Analyzes commits and auto-determines version bump type
npm run auto-version
```

### Release Management

```bash
# Create releases with git tags
npm run release:patch   # Bump patch + create tag
npm run release:minor   # Bump minor + create tag  
npm run release:major   # Bump major + create tag
```

## 🤖 Auto-Version Intelligence

The `auto-version` script analyzes your commit messages to determine the appropriate version bump:

### Major Version (Breaking Changes)
- `breaking change` in commit message
- `major:` prefix
- `feat!:` or `fix!:` (conventional commits with !)

### Minor Version (New Features)
- `feat:` or `feature:` prefix
- `minor:` prefix
- Messages containing `add` or `new`

### Patch Version (Bug Fixes & Maintenance)
- `fix:` or `bug:` prefix
- `patch:`, `hotfix:`, `chore:` prefix
- `refactor:`, `docs:`, `style:`, `test:` prefix

## 📝 Recommended Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Patch version bumps
fix: resolve contract creation bug
chore: update dependencies
docs: add API documentation

# Minor version bumps  
feat: add client export functionality
feature: implement bulk import
add: version display in header

# Major version bumps
feat!: redesign authentication system
fix!: breaking change in API endpoints
feat: add user roles (BREAKING CHANGE: removes old permissions)
```

## 🔄 Automated Workflow

### Option 1: Manual Trigger
After making changes and committing:
```bash
npm run auto-version
```

### Option 2: Git Hook Integration
You can set up a git hook to automatically run versioning:

```bash
# Create pre-push hook
echo '#!/bin/bash\nnpm run auto-version' > .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

### Option 3: GitHub Actions (Future)
Create `.github/workflows/version.yml` for automatic versioning on push.

## 🏷️ Git Tags and Releases

All version bumps automatically create git tags in the format `v1.2.3`:

```bash
git tag -l          # List all version tags
git log --oneline   # See version commit history
```

## 📊 Version Display

Version information is displayed in multiple places:

1. **Header**: Click the version badge for details
2. **Sidebar**: Bottom footer shows version and environment  
3. **Settings Page**: Comprehensive version information
4. **API Endpoint**: `/api/version` returns version data

## 🛠️ Configuration

### package.json Scripts
The version management scripts are defined in `package.json`:

```json
{
  "scripts": {
    "version:patch": "npm version patch --no-git-tag-version && git add package.json && git commit -m \"chore: bump version to $(node -p \"require('./package.json').version\")\" && git push",
    "auto-version": "node scripts/auto-version.js"
  }
}
```

### Environment Variables
No additional environment variables needed. The system uses:
- Git commit history
- package.json version field
- Git tags for tracking releases

## 🚨 Important Notes

1. **Always commit changes first** before running version commands
2. **Version commits are automatic** - don't manually commit version changes
3. **Git tags are pushed automatically** to remote repository
4. **Semantic versioning** (SemVer) is strictly followed
5. **Rollbacks** can be done by checking out previous tags

## 🔍 Troubleshooting

### Uncommitted Changes Error
```bash
⚠️ Warning: You have uncommitted changes. Please commit them first.
```
**Solution**: Commit or stash your changes before running version commands.

### Git Repository Error
```bash
❌ Error: Not in a git repository
```
**Solution**: Ensure you're in the project root directory.

### Permission Denied
```bash
Permission denied: ./scripts/version-bump.sh
```
**Solution**: Make script executable with `chmod +x scripts/version-bump.sh`

## 📈 Version History

You can track version history using:

```bash
# See all version tags
git tag -l --sort=-version:refname

# See commits for a specific version
git log v1.0.0..v1.1.0 --oneline

# Compare versions
git diff v1.0.0..v1.1.0
```

## 🎯 Best Practices

1. **Use descriptive commit messages** that clearly indicate the type of change
2. **Follow conventional commit format** for automatic version detection
3. **Run `npm run auto-version`** after significant feature additions
4. **Check version in UI** after updates to confirm changes are reflected
5. **Document breaking changes** clearly in commit messages

---

## Quick Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `npm run auto-version` | Smart version bump | Analyzes commits → v1.0.1 |
| `npm run version:patch` | Manual patch bump | 1.0.0 → 1.0.1 |
| `npm run version:minor` | Manual minor bump | 1.0.0 → 1.1.0 |
| `npm run version:major` | Manual major bump | 1.0.0 → 2.0.0 |
| `./scripts/version-bump.sh` | Quick shell script | Interactive version bump |

**Remember**: Version changes are automatically committed, tagged, and pushed to the remote repository! 🚀 

# Version Management System

## Overview

The MSSP Client Manager project uses a comprehensive version management system to ensure consistency between the application version and database setup scripts. This system automatically synchronizes versions across all components during the release process.

## Version Tracking Components

### 1. Application Version (`package.json`)
- Primary source of truth for version numbers
- Updated using npm version commands
- Follows semantic versioning (semver) format: `MAJOR.MINOR.PATCH`

### 2. Database Setup Script Version (`setup-database.sh`)
- Contains multiple version variables that must stay synchronized:
  - `SCRIPT_VERSION`: Version of the setup script itself
  - `REQUIRED_APP_VERSION`: Minimum application version required
  - `DB_SCHEMA_VERSION`: Database schema version
- All three variables are automatically updated to match `package.json`

### 3. Database Schema Tracking
- New `schema_versions` table tracks version history in the database
- Records each setup execution with version information
- Provides audit trail for database updates

## Automated Synchronization

### Scripts Overview

#### `scripts/sync-setup-version.sh`
Automatically synchronizes `setup-database.sh` versions with `package.json`:
```bash
npm run sync-setup-version
```

Features:
- Extracts version from `package.json`
- Updates all version variables in `setup-database.sh`
- Creates backup before making changes
- Verifies changes were applied correctly

#### `scripts/verify-versions.sh`
Verifies all versions are synchronized:
```bash
npm run verify-versions
```

Features:
- Checks version consistency across all files
- Validates presence of version checking functions
- Provides detailed error reporting
- Used in release process to prevent version mismatches

### Integration with Release Process

The version management is integrated into the npm scripts:

```json
{
  "sync-setup-version": "bash scripts/sync-setup-version.sh",
  "verify-versions": "bash scripts/verify-versions.sh",
  "version:patch": "npm version patch --no-git-tag-version && npm run sync-setup-version && git add package.json setup-database.sh && git commit -m \"chore: bump version to $(node -p \"require('./package.json').version\")\" && git push",
  "version:minor": "npm version minor --no-git-tag-version && npm run sync-setup-version && git add package.json setup-database.sh && git commit -m \"chore: bump version to $(node -p \"require('./package.json').version\")\" && git push",
  "version:major": "npm version major --no-git-tag-version && npm run sync-setup-version && git add package.json setup-database.sh && git commit -m \"chore: bump version to $(node -p \"require('./package.json').version\")\" && git push",
  "release:patch": "npm run verify-versions && npm run version:patch && npm run release:tag",
  "release:minor": "npm run verify-versions && npm run version:minor && npm run release:tag",
  "release:major": "npm run verify-versions && npm run version:major && npm run release:tag"
}
```

## Release Workflow

### 1. Version Bump and Sync
```bash
# For patch releases (bug fixes)
npm run release:patch

# For minor releases (new features)
npm run release:minor

# For major releases (breaking changes)
npm run release:major
```

### 2. Automatic Process
Each release command:
1. **Verifies** current version synchronization
2. **Updates** package.json version
3. **Syncs** setup-database.sh versions
4. **Commits** both files with version message
5. **Pushes** changes to repository
6. **Creates** git tag
7. **Pushes** tag to repository

### 3. Manual Version Sync (if needed)
```bash
# Sync versions manually
npm run sync-setup-version

# Verify sync worked
npm run verify-versions
```

## Database Schema Versioning

### Version Tracking Table
The `setup-database.sh` script creates a `schema_versions` table:

```sql
CREATE TABLE schema_versions (
    id SERIAL PRIMARY KEY,
    script_version VARCHAR(20) NOT NULL,
    app_version VARCHAR(20),
    schema_version VARCHAR(20) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    environment VARCHAR(20),
    notes TEXT
);
```

### Version Checks
The setup script now:
- Checks compatibility between script and app versions
- Warns about version mismatches
- Records version information in database
- Provides detailed version output

### Enhanced Output
Setup script now displays comprehensive version information:
```
📦 Version Information:
  Setup Script: 1.4.0
  App Version: 1.4.0
  Schema Version: 1.4.0
  Applied: 2024-06-03 14:05:24

📊 Version tracking: schema_versions table in database
```

## Development Workflow

### For Developers

1. **Before Making Changes**
   ```bash
   npm run verify-versions
   ```

2. **After Code Changes**
   ```bash
   # Test your changes
   npm test
   
   # Verify versions are still in sync
   npm run verify-versions
   ```

3. **Before Release**
   ```bash
   # Run full verification
   npm run verify-versions
   
   # Create release (automatically syncs versions)
   npm run release:patch  # or minor/major
   ```

### For Database Updates

1. **Schema Changes**
   - Add new migration files to `migrations/` directory
   - Update `setup-database.sh` if needed
   - Version sync will happen automatically during release

2. **Testing Setup Script**
   ```bash
   # Test database setup
   ./setup-database.sh
   
   # Verify version tracking
   npm run verify-versions
   ```

## Troubleshooting

### Version Mismatch Errors
If versions become out of sync:
```bash
# Fix automatically
npm run sync-setup-version

# Verify fix
npm run verify-versions
```

### Manual Version Update
If automatic sync fails:
1. Edit `setup-database.sh` manually
2. Update all three version variables:
   - `SCRIPT_VERSION`
   - `REQUIRED_APP_VERSION` 
   - `DB_SCHEMA_VERSION`
3. Verify with `npm run verify-versions`

### Database Version Issues
Check database version history:
```sql
SELECT * FROM schema_versions ORDER BY applied_at DESC;
```

## Security Considerations

### Password Updates
The development password has been updated for better security:
- Development: `devpass123` (changed from `12345678`)
- Production: `12345678` (unchanged for compatibility)

### Version Validation
- Scripts validate version format
- Backup files are created before changes
- Git commits include both package.json and setup-database.sh

## Monitoring and Maintenance

### Regular Checks
- Version verification runs automatically in CI/CD
- Database setup includes version audit trail
- Release process enforces version consistency

### Backup Strategy
- Setup script creates automatic backups
- Git history maintains version change trail
- Database tracks all schema version changes

## Future Enhancements

### Planned Features
- Version compatibility matrix
- Automated migration rollback based on versions
- Integration with CI/CD version checks
- Database schema diff reporting

### Migration Path
For existing installations:
1. Run `npm run sync-setup-version` once
2. Run `./setup-database.sh` to create version tracking
3. Verify with `npm run verify-versions`

This ensures all future releases maintain proper version synchronization. 