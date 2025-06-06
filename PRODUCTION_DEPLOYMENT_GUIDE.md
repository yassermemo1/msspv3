# MSSP Client Manager - Production Deployment Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Pre-Deployment Setup](#pre-deployment-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Migration Execution](#migration-execution)
7. [Security Configuration](#security-configuration)
8. [Service Setup](#service-setup)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

### Minimum Hardware Requirements
- **CPU**: 2 cores (4 cores recommended)
- **RAM**: 4GB (8GB recommended)
- **Storage**: 50GB SSD
- **Network**: Stable internet connection

### Software Prerequisites
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v13.0 or higher
- **Git**: Latest version
- **Process Manager**: PM2 (recommended)
- **Reverse Proxy**: Nginx (recommended)

---

## 🚀 Pre-Deployment Setup

### 1. Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo dnf update -y
```

### 2. Install Node.js
```bash
# Install Node.js 18+ via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib -y

# CentOS/RHEL
sudo dnf install postgresql postgresql-server postgresql-contrib -y
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 4. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 5. Install Nginx (Optional but Recommended)
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo dnf install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6. Create Application User
```bash
sudo useradd -m -s /bin/bash mssp
sudo usermod -aG sudo mssp
```

---

## 🗄️ Database Setup

### 1. Configure PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE mssp_production;
CREATE USER mssp_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE mssp_production TO mssp_user;
ALTER USER mssp_user CREATEDB;
\q
```

### 2. Configure PostgreSQL Authentication
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/13/main/pg_hba.conf

# Add this line for local connections:
local   mssp_production    mssp_user                     md5
host    mssp_production    mssp_user    127.0.0.1/32     md5
```

### 3. Restart PostgreSQL
```bash
sudo systemctl restart postgresql
```

### 4. Test Database Connection
```bash
psql -h localhost -U mssp_user -d mssp_production -c "SELECT version();"
```

---

## 📦 Application Deployment

### 1. Clone Repository
```bash
# Switch to application user
sudo su - mssp

# Clone the repository
git clone https://github.com/yassermemo1/MsspClientManager.git
cd MsspClientManager

# Checkout production branch (if applicable)
git checkout main
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Build Frontend
```bash
cd client
npm run build
cd ..
```

---

## ⚙️ Environment Configuration

### 1. Create Production Environment File
```bash
cp .env.example .env
nano .env
```

### 2. Configure Environment Variables
```bash
# === PRODUCTION ENVIRONMENT CONFIGURATION ===

# Application
NODE_ENV=production
PORT=5001
SESSION_SECRET=your_ultra_secure_session_secret_here_minimum_32_chars

# Database
DATABASE_URL=postgresql://mssp_user:your_secure_password_here@localhost:5432/mssp_production

# LDAP Configuration (if using LDAP)
LDAP_URL=ldaps://your-ldap-server.com:636
LDAP_BIND_DN=cn=admin,dc=company,dc=com
LDAP_BIND_PASSWORD=your_ldap_password
LDAP_SEARCH_BASE=dc=company,dc=com
LDAP_SEARCH_FILTER=(uid={{username}})

# Email Configuration (SMTP)
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@company.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM=noreply@company.com

# File Upload Configuration
UPLOAD_PATH=/var/lib/mssp/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,png,jpg,jpeg

# Security
BCRYPT_ROUNDS=12
JWT_SECRET=your_jwt_secret_here_minimum_32_chars
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/mssp/application.log

# Features
ENABLE_2FA=true
ENABLE_AUDIT_LOGGING=true
ENABLE_EMAIL_NOTIFICATIONS=true
```

### 3. Create Required Directories
```bash
sudo mkdir -p /var/lib/mssp/uploads
sudo mkdir -p /var/log/mssp
sudo chown -R mssp:mssp /var/lib/mssp
sudo chown -R mssp:mssp /var/log/mssp
```

---

## 🚚 Migration Execution

### 1. Run Database Migrations
```bash
# Make sure you're in the application directory
cd /home/mssp/MsspClientManager

# Make migration scripts executable
chmod +x deploy-latest.sh
chmod +x db_migrate.sh

# Run all migrations
./deploy-latest.sh
```

### 2. Verify Migration Success
```bash
# Check database tables
psql -h localhost -U mssp_user -d mssp_production -c "\dt"

# Check migration status
psql -h localhost -U mssp_user -d mssp_production -c "SELECT * FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 5;"
```

---

## 🔒 Security Configuration

### 1. Configure Firewall
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5001/tcp  # Application port
sudo ufw enable

# CentOS/RHEL (Firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=5001/tcp
sudo firewall-cmd --reload
```

### 2. Set File Permissions
```bash
# Set secure permissions
chmod 600 .env
chmod 700 /var/lib/mssp/uploads
chmod 755 /var/log/mssp

# Set ownership
sudo chown -R mssp:mssp /home/mssp/MsspClientManager
```

### 3. Configure SSL/TLS (Recommended)
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 Service Setup

### 1. Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'mssp-client-manager',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    cwd: '/home/mssp/MsspClientManager',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: '/var/log/mssp/pm2-error.log',
    out_file: '/var/log/mssp/pm2-out.log',
    log_file: '/var/log/mssp/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'uploads', 'logs']
  }]
};
```

### 2. Start Application with PM2
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions provided by PM2
```

### 3. Configure Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/mssp-client-manager
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # File Upload Size
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Static file serving (if needed)
    location /uploads/ {
        alias /var/lib/mssp/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. Enable Nginx Site
```bash
sudo ln -s /etc/nginx/sites-available/mssp-client-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 Monitoring & Maintenance

### 1. Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/mssp-client-manager
```

```
/var/log/mssp/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 mssp mssp
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. Setup Health Monitoring
```bash
# Create health check script
nano /home/mssp/health-check.sh
```

```bash
#!/bin/bash
HEALTH_URL="http://localhost:5001/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): Service is healthy"
else
    echo "$(date): Service is down (HTTP $RESPONSE)" >&2
    pm2 restart mssp-client-manager
fi
```

```bash
chmod +x /home/mssp/health-check.sh

# Add to crontab
crontab -e
# Add: */5 * * * * /home/mssp/health-check.sh >> /var/log/mssp/health-check.log 2>&1
```

### 3. Setup Database Backup
```bash
nano /home/mssp/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mssp"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mssp_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U mssp_user -d mssp_production > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "$(date): Database backup completed: $BACKUP_FILE.gz"
```

```bash
chmod +x /home/mssp/backup-db.sh

# Add to crontab for daily backup
crontab -e
# Add: 0 2 * * * /home/mssp/backup-db.sh >> /var/log/mssp/backup.log 2>&1
```

---

## 🔍 Verification Steps

### 1. Application Health Check
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs mssp-client-manager --lines 50

# Test API endpoint
curl -I http://localhost:5001/api/health
```

### 2. Database Verification
```bash
# Check database connection
psql -h localhost -U mssp_user -d mssp_production -c "SELECT COUNT(*) FROM users;"

# Check audit tables
psql -h localhost -U mssp_user -d mssp_production -c "SELECT COUNT(*) FROM audit_logs;"
```

### 3. File Upload Test
```bash
# Check upload directory permissions
ls -la /var/lib/mssp/uploads/

# Test file upload endpoint (if API is ready)
curl -X POST -F "file=@test.txt" http://localhost:5001/api/upload/test
```

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start
```bash
# Check PM2 logs
pm2 logs mssp-client-manager

# Check environment variables
pm2 env 0

# Restart application
pm2 restart mssp-client-manager
```

#### 2. Database Connection Issues
```bash
# Test PostgreSQL connection
sudo -u postgres psql -c "SELECT version();"

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### 3. File Upload Issues
```bash
# Check directory permissions
ls -la /var/lib/mssp/

# Check disk space
df -h

# Check Nginx configuration
sudo nginx -t
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -t
```

---

## 📞 Support and Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Check application logs and performance metrics
2. **Monthly**: Update system packages and Node.js dependencies
3. **Quarterly**: Review security configurations and access logs
4. **Annually**: Update SSL certificates and review backup procedures

### Emergency Contacts
- **System Administrator**: [Your contact information]
- **Database Administrator**: [Your contact information]
- **Application Developer**: [Your contact information]

### Documentation Links
- [API Documentation](./API_TESTING_GUIDE.md)
- [Migration Summary](./MIGRATION_SUMMARY.md)
- [LDAP Authentication Guide](./LDAP_AUTHENTICATION_GUIDE.md)
- [Role-Based Access Control](./ROLE_BASED_ACCESS_CONTROL_GUIDE.md)

---

## ✅ Post-Deployment Checklist

- [ ] System requirements met
- [ ] PostgreSQL installed and configured
- [ ] Application deployed and dependencies installed
- [ ] Environment variables configured
- [ ] Database migrations executed successfully
- [ ] PM2 process manager configured
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed (if applicable)
- [ ] Firewall configured
- [ ] Log rotation configured
- [ ] Backup procedures implemented
- [ ] Health monitoring setup
- [ ] Application accessible via domain/IP
- [ ] User authentication working
- [ ] File upload functionality tested
- [ ] Email notifications working (if configured)
- [ ] LDAP integration working (if configured)

---

**🎉 Congratulations! Your MSSP Client Manager is now deployed and ready for production use.**

For any issues or questions, refer to the troubleshooting section or contact the support team. 