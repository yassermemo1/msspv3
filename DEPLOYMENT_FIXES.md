# MSSP Client Manager - Deployment Issues & Fixes

## 🚨 Issues Identified from Your Deployment Log

Based on your deployment error log, here are the main issues and their fixes:

### 1. **GitHub Repository URL Mismatch** ❌
**Problem**: Deployment scripts were using placeholder URL `https://github.com/your-org/MsspClientManager.git`
**Status**: ✅ **FIXED**

**Files Updated**:
- `deploy-to-new-machine.sh` - Line 225
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Line 137  
- `QUICK_DEPLOYMENT_CHECKLIST.md` - Lines 7, 82

**Solution**: All URLs now correctly point to `https://github.com/yassermemo1/MsspClientManager.git`

### 2. **PostgreSQL Version Conflicts** ❌
**Problem**: Multiple PostgreSQL versions installed causing library conflicts
```
psql: /usr/pgsql-16/lib/libpq.so.5: no version information available
ERROR: Data directory /var/lib/pgsql/data is not empty!
```
**Status**: ✅ **FIXED in deploy-production-fixed.sh**

**Solution**: 
- Clean removal of conflicting PostgreSQL versions
- Install PostgreSQL 15 (stable version)
- Proper initialization and configuration

### 3. **Node.js/PM2 Permission Issues** ❌
**Problem**: PM2 cannot spawn Node.js processes
```
spawn /usr/bin/node EACCES
[PM2][ERROR] File ecosystem.config.js not found
```
**Status**: ✅ **FIXED in deploy-production-fixed.sh**

**Solution**:
- Fix npm global directory permissions
- Proper PM2 installation with correct permissions
- Create proper ecosystem.config.js file

### 4. **Directory and File Structure Issues** ❌
**Problem**: Application directory not created due to failed Git clone
```
bash: line 10: cd: MsspClientManager: No such file or directory
tee: /home/mssp/MsspClientManager/.env: No such file or directory
```
**Status**: ✅ **FIXED in deploy-production-fixed.sh**

**Solution**:
- Proper directory creation and ownership
- Error handling for Git clone operations
- Fallback mechanisms for failed operations

---

## 🛠️ Quick Fix Solutions

### Option 1: Use the Fixed Deployment Script (Recommended)

**New Fixed Script**: `deploy-production-fixed.sh`

```bash
# Download or use the fixed script
chmod +x deploy-production-fixed.sh
./deploy-production-fixed.sh
```

**What it fixes**:
- ✅ Correct GitHub repository URL
- ✅ PostgreSQL version conflicts resolution  
- ✅ Node.js permission fixes
- ✅ Proper directory structure creation
- ✅ Enhanced error handling
- ✅ Better service configuration

### Option 2: Manual Fixes for Current Deployment

If you want to fix your current broken deployment:

#### Fix 1: Clean PostgreSQL Installation
```bash
# Stop all PostgreSQL services
sudo systemctl stop postgresql*

# Remove conflicting versions
sudo dnf remove -y postgresql-server postgresql13-contrib

# Install PostgreSQL 15
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/repopackages/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf install -y postgresql15-server postgresql15-contrib

# Initialize database
sudo /usr/pgsql-15/bin/postgresql-15-setup initdb
sudo systemctl enable postgresql-15
sudo systemctl start postgresql-15
```

#### Fix 2: Correct Repository Clone
```bash
# Remove failed directory
sudo rm -rf /home/mssp/MsspClientManager

# Clone with correct URL  
sudo -u mssp git clone https://github.com/yassermemo1/MsspClientManager.git /home/mssp/MsspClientManager
```

#### Fix 3: Fix Node.js Permissions
```bash
# Switch to mssp user
sudo su - mssp

# Fix npm permissions
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Install PM2 properly
npm install -g pm2
```

#### Fix 4: Create Missing Configuration
```bash
cd /home/mssp/MsspClientManager

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mssp-backend',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF

# Create required directories
mkdir -p logs uploads

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..
```

---

## 🔍 Verification Steps

After running the fixes, verify your deployment:

### 1. Check PostgreSQL
```bash
sudo systemctl status postgresql-15
/usr/pgsql-15/bin/psql -h localhost -U mssp_user -d mssp_production -c "SELECT version();"
```

### 2. Check Application
```bash
cd /opt/mssp-client-manager  # or /home/mssp/MsspClientManager
pm2 status
pm2 logs mssp-backend
```

### 3. Test Health Endpoint
```bash
curl http://localhost:5001/api/health
```

### 4. Check Firewall
```bash
sudo firewall-cmd --list-all
```

---

## 📋 Additional Hardcoded Items That Should Be Dynamic

Based on the deployment analysis, these hardcoded items should also be made configurable:

### Configuration Items to Move to Environment Variables:

1. **Application Settings**:
   - `PORT=5001` → `${PORT:-5001}`
   - `NODE_ENV=production` → `${NODE_ENV:-production}`
   - Application directory paths

2. **Database Configuration**:
   - Database name: `mssp_production` → `${DB_NAME}`
   - Database user: `mssp_user` → `${DB_USER}`
   - Connection strings

3. **Service Settings**:
   - PM2 configuration (instances, memory limits)
   - Log file paths
   - Upload directory paths

4. **Security Settings**:
   - Session secrets (already using generated values ✅)
   - JWT secrets (already using generated values ✅)
   - Firewall port configurations

5. **System Paths**:
   - Application installation directory
   - Log directories
   - Upload directories

---

## 🎯 Next Steps

1. **Use the fixed deployment script** for fresh installations
2. **Update existing deployments** using the manual fix steps
3. **Consider creating a configuration management system** for dynamic settings
4. **Set up monitoring** to catch deployment issues early
5. **Document environment-specific configurations** for different deployment scenarios

---

## 📞 Support

If you encounter issues with the fixes:

1. **Check logs**: `pm2 logs` or `sudo journalctl -xe`
2. **Verify services**: `sudo systemctl status postgresql-15`
3. **Test connections**: Database and application health endpoints
4. **Review firewall**: Ensure ports are open and accessible

The fixed deployment script includes comprehensive error handling and troubleshooting guidance. 