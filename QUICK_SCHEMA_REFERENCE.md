# 🚀 Quick Schema Reference: When to Run setup-database.sh

## ⚡ **TL;DR: One Command Tells You Everything**

```bash
npm run detect-schema-changes
```

**Outputs:**
- ✅ **No database setup required** → Deploy normally
- 🚨 **Database setup required** → Run `./setup-database.sh` first

---

## 🔍 **How to Know If Schema Changes Were Made**

### **Option 1: Automatic Detection (Recommended)**
```bash
# This command checks everything automatically:
npm run detect-schema-changes

# It scans for:
# ✅ Version mismatches between app and database  
# ✅ Recent commits with [DB REQUIRED] tags
# ✅ Changes to schema files (migrations/, shared/schema.ts, etc.)
# ✅ New migration files
```

### **Option 2: Manual Indicators**
Look for these signs that database setup is needed:

**📝 In Commit Messages:**
- Commits with `[DB REQUIRED]` tag
- Commits mentioning "schema", "migration", "database"

**📁 In Changed Files:**
- `migrations/` directory has new files
- `shared/schema.ts` was modified
- `setup-database.sh` was updated
- `drizzle.config.ts` was changed

**📋 In Documentation:**
- New entries in `SCHEMA_CHANGELOG.md`
- Version marked with ✅ **NEW SCHEMA VERSION**

---

## 🎯 **Simple Decision Tree**

```
Did I pull new code? 
    ↓
Run: npm run detect-schema-changes
    ↓
✅ No setup needed? → npm run build && deploy
🚨 Setup required? → ./setup-database.sh → then deploy
```

---

## 🔧 **Quick Commands**

### **Check if setup is needed:**
```bash
npm run detect-schema-changes
```

### **If setup is required:**
```bash
./setup-database.sh
npm run verify-versions  # Confirm everything is synchronized
```

### **If no setup needed:**
```bash
npm run build
npm run start  # Standard deployment
```

---

## 📊 **What the Detection Script Checks**

| Check | What It Does | Why It Matters |
|-------|-------------|----------------|
| **Version Sync** | Compares app vs database versions | Catches version mismatches |
| **Git History** | Scans last 14 days for `[DB REQUIRED]` | Finds schema commits |
| **File Changes** | Monitors schema-related files | Detects modifications |
| **Migration Files** | Checks for new/modified migrations | Finds pending changes |

---

## 🚨 **When to ALWAYS Run setup-database.sh**

- Fresh installation (new environment)
- After pulling major version updates  
- When detection script says "🚨 DATABASE SETUP REQUIRED"
- If you see database connection errors
- When unsure (it's safe to run - no harm if not needed)

---

## ✅ **When setup-database.sh is NOT Needed**

- UI-only changes (React components, styling)
- Bug fixes that don't touch database
- Configuration updates (environment variables)
- Documentation updates
- When detection script says "✅ No database setup required"

---

## 🔗 **Related Commands**

```bash
# Full deployment check (versions + schema)
npm run deploy-check

# Just version synchronization
npm run verify-versions

# Update setup script version to match app
npm run sync-setup-version

# Detailed schema change analysis
npm run detect-schema-changes --verbose
```

---

## 💡 **Pro Tips**

1. **Always run detection before deploying:**
   ```bash
   npm run detect-schema-changes
   ```

2. **Look for `[DB REQUIRED]` tags in recent commits:**
   ```bash
   git log --oneline --grep="DB REQUIRED" -10
   ```

3. **When in doubt, run setup (it's safe):**
   ```bash
   ./setup-database.sh  # Won't break anything if not needed
   ```

4. **Check the changelog for version info:**
   ```bash
   cat SCHEMA_CHANGELOG.md | head -50
   ```

---

## 🎯 **Summary**

**Before this system:**
- "I don't know if you changed anything in the schema or not"
- Manual file checking and guesswork

**With automated detection:**
- One command: `npm run detect-schema-changes`
- Clear YES/NO answer
- No more guesswork!

**The system is smart enough to only recommend setup when truly needed.** 