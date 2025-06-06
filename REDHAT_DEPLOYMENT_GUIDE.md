# 🚀 MSSP Client Manager - RedHat Linux Deployment Guide

## ✅ **Quick Setup for RedHat Systems**

This guide is specifically for **RedHat Enterprise Linux (RHEL)**, **CentOS**, **Fedora**, and similar RPM-based distributions.

---

## 📋 **Prerequisites**

### 1. **System Requirements**
```bash
# Check your system
cat /etc/redhat-release
uname -a
```

### 2. **Install Required Packages**
```bash
# Update system
sudo dnf update -y  # For RHEL 8+/Fedora
# OR
sudo yum update -y  # For RHEL 7/CentOS 7

# Install Node.js 18+ (recommended: use NodeSource repository)
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs  # or yum install -y nodejs

# Install PostgreSQL
sudo dnf install -y postgresql postgresql-server postgresql-contrib
# OR
sudo yum install -y postgresql postgresql-server postgresql-contrib

# Install Git
sudo dnf install -y git
# OR  
sudo yum install -y git

# Install development tools
sudo dnf groupinstall -y "Development Tools"
# OR
sudo yum groupinstall -y "Development Tools"
```

### 3. **Setup PostgreSQL**
```bash
# Initialize PostgreSQL (first time only)
sudo postgresql-setup --initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE mssp_production;"
sudo -u postgres psql -c "CREATE USER mssp_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mssp_production TO mssp_user;"
```

### 4. **PostgreSQL 16 Path Configuration**

**⚠️ IMPORTANT**: On RedHat systems, PostgreSQL 16 binaries are installed in `/usr/pgsql-16/bin/` and are **NOT** in the system PATH by default.

#### Quick Path Setup
Run our helper script to configure paths:
```bash
./set-pg16-path.sh
```

#### Manual Path Setup
```bash
# Add to current session
export PATH="/usr/pgsql-16/bin:$PATH"

# Add permanently to your profile
echo 'export PATH="/usr/pgsql-16/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### Verify PostgreSQL 16 Path
```bash
# Should work after path configuration
psql --version

# Always works (full path)
/usr/pgsql-16/bin/psql --version
```

**Note**: All our deployment scripts now use the full path `/usr/pgsql-16/bin/psql` to ensure compatibility.

---

## 🔧 **Installation Steps**

### 1. **Clone Repository**
```bash
cd /opt  # or your preferred directory
sudo git clone https://github.com/your-username/MsspClientManager.git
sudo chown -R $USER:$USER MsspClientManager
cd MsspClientManager
```

### 2. **Install Dependencies**
```bash
# Install npm dependencies
npm install

# Install TypeScript types for speakeasy (fixes compilation errors)
npm install --save-dev @types/speakeasy
```

### 3. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # or vim .env
```

**Required Environment Variables:**
```bash
# Database Configuration
DATABASE_URL="postgresql://mssp_user:your_secure_password@localhost:5432/mssp_production"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mssp_production"
DB_USER="mssp_user"
DB_PASSWORD="your_secure_password"

# Application Configuration
NODE_ENV="production"
PORT="5001"
SESSION_SECRET="your_very_long_random_session_secret_here"

# LDAP Configuration (optional)
LDAP_URL="ldap://your-ldap-server:389"
LDAP_BIND_DN="cn=admin,dc=example,dc=com"
LDAP_BIND_CREDENTIALS="admin_password"
LDAP_SEARCH_BASE="dc=example,dc=com"
LDAP_SEARCH_FILTER="(uid={{username}})"
```

### 4. **Database Setup**
```bash
# Run database setup script
chmod +x setup-database.sh
./setup-database.sh
```

### 5. **Build Application**
```bash
# Build the frontend
npm run build
```

---

## 🚀 **Running the Application**

### **Option 1: Using Management Script (Recommended)**
```bash
# Make script executable
chmod +x manage-app.sh

# Start the application
./manage-app.sh start

# Check status
./manage-app.sh status

# Stop the application
./manage-app.sh stop

# Restart the application
./manage-app.sh restart
```

### **Option 2: Direct npm Commands**
```bash
# Start in production mode
npm start

# Start in development mode
npm run dev
```

### **Option 3: Using systemd (Production)**
Create a systemd service file:

```bash
sudo nano /etc/systemd/system/mssp-client-manager.service
```

```ini
[Unit]
Description=MSSP Client Manager
After=network.target postgresql.service

[Service]
Type=simple
User=mssp
WorkingDirectory=/opt/MsspClientManager
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Create service user
sudo useradd -r -s /bin/false mssp
sudo chown -R mssp:mssp /opt/MsspClientManager

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable mssp-client-manager
sudo systemctl start mssp-client-manager

# Check status
sudo systemctl status mssp-client-manager
```

---

## 🔥 **Firewall Configuration**

### **For firewalld (RHEL/CentOS/Fedora)**
```bash
# Open port 5001
sudo firewall-cmd --permanent --add-port=5001/tcp
sudo firewall-cmd --reload

# Check open ports
sudo firewall-cmd --list-ports
```

### **For iptables**
```bash
# Open port 5001
sudo iptables -A INPUT -p tcp --dport 5001 -j ACCEPT
sudo service iptables save  # CentOS 7
```

---

## 🛠 **Troubleshooting RedHat-Specific Issues**

### **1. TypeScript Compilation Errors**
If you see 559 TypeScript errors:
```bash
# Use the build script that skips strict checking
npm run build

# For development with type checking
npm run build:check
```

### **2. Permission Issues**
```bash
# Fix ownership
sudo chown -R $USER:$USER /opt/MsspClientManager

# Fix permissions
chmod +x manage-app.sh
chmod +x setup-database.sh
```

### **3. PostgreSQL Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if PostgreSQL is listening
sudo netstat -tlnp | grep 5432

# Edit PostgreSQL configuration if needed
sudo nano /var/lib/pgsql/data/postgresql.conf
sudo nano /var/lib/pgsql/data/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### **4. Node.js Version Issues**
```bash
# Check Node.js version (should be 18+)
node --version

# If version is too old, install from NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

### **5. SELinux Issues**
If SELinux is enabled and causing issues:
```bash
# Check SELinux status
sestatus

# Temporarily disable (not recommended for production)
sudo setenforce 0

# Or configure SELinux policies for your application
sudo setsebool -P httpd_can_network_connect 1
```

---

## 📊 **Verification**

### **1. Check Application Status**
```bash
# Using management script
./manage-app.sh status

# Manual check
curl http://localhost:5001/api/health
```

### **2. Check Logs**
```bash
# Application logs
./manage-app.sh logs

# System logs (if using systemd)
sudo journalctl -u mssp-client-manager -f
```

### **3. Access Application**
Open your browser and navigate to:
- **Application:** http://your-server-ip:5001
- **Health Check:** http://your-server-ip:5001/api/health

**Default Login:**
- Username: `admin`
- Password: `admin123`

---

## 🔒 **Security Recommendations**

### **1. Change Default Passwords**
```bash
# Change admin password after first login
# Update database passwords
# Generate strong session secrets
```

### **2. Configure SSL/TLS**
```bash
# Use nginx or Apache as reverse proxy
# Configure SSL certificates
# Update firewall rules
```

### **3. Database Security**
```bash
# Configure PostgreSQL authentication
# Restrict database access
# Regular backups
```

---

## 📝 **Common Commands**

```bash
# Application Management
./manage-app.sh start      # Start application
./manage-app.sh stop       # Stop application  
./manage-app.sh restart    # Restart application
./manage-app.sh status     # Check status
./manage-app.sh build      # Build application
./manage-app.sh update     # Update from git

# System Management
sudo systemctl status mssp-client-manager    # Check service
sudo systemctl restart mssp-client-manager   # Restart service
sudo journalctl -u mssp-client-manager       # View logs

# Database Management
sudo -u postgres psql mssp_production        # Connect to database
./setup-database.sh                          # Reset database
```

---

## 🆘 **Support**

If you encounter issues:

1. **Check logs:** `./manage-app.sh logs`
2. **Verify dependencies:** `./manage-app.sh check`
3. **Check database:** `sudo systemctl status postgresql`
4. **Review firewall:** `sudo firewall-cmd --list-ports`
5. **Check SELinux:** `sestatus`

---

## ✅ **Success Indicators**

Your deployment is successful when:
- ✅ `./manage-app.sh status` shows server running
- ✅ `curl http://localhost:5001/api/health` returns `{"status":"ok"}`
- ✅ Web interface loads at http://your-server:5001
- ✅ You can login with admin/admin123
- ✅ Database connection is working

---

**🎉 Congratulations! Your MSSP Client Manager is now running on RedHat Linux!** 