# Quick Deployment Checklist

## 🚀 Automated Deployment (Recommended)

### Option 1: One-Command Deployment
```bash
# Clone the repository
git clone https://github.com/yassermemo1/MsspClientManager.git
cd MsspClientManager

# Run automated deployment
chmod +x deploy-to-new-machine.sh
sudo ./deploy-to-new-machine.sh
```

**That's it!** The script will handle everything automatically.

---

## 📋 Manual Deployment Steps

### Prerequisites Checklist
- [ ] Fresh Ubuntu 20.04+ / CentOS 8+ / RHEL 8+ server
- [ ] Sudo access
- [ ] Internet connectivity
- [ ] At least 4GB RAM and 50GB storage

### Step 1: System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# OR
sudo dnf update -y  # CentOS/RHEL

# Install basic tools
sudo apt install -y git curl wget  # Ubuntu/Debian
# OR
sudo dnf install -y git curl wget  # CentOS/RHEL
```

### Step 2: Install Dependencies
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Step 3: Database Setup
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE mssp_production;
CREATE USER mssp_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mssp_production TO mssp_user;
ALTER USER mssp_user CREATEDB;
\q
EOF
```

### Step 4: Application Deployment
```bash
# Create application user
sudo useradd -m -s /bin/bash mssp
sudo usermod -aG sudo mssp

# Switch to application user
sudo su - mssp

# Clone repository
git clone https://github.com/yassermemo1/MsspClientManager.git
cd MsspClientManager

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..
```

### Step 5: Environment Configuration
```bash
# Create .env file
cp .env.example .env
nano .env

# Update these key values:
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://mssp_user:your_password@localhost:5432/mssp_production
SESSION_SECRET=generate_32_char_secret
JWT_SECRET=generate_32_char_secret
```

### Step 6: Run Migrations
```bash
# Make scripts executable
chmod +x deploy-latest.sh

# Run migrations
./deploy-latest.sh
```

### Step 7: Setup Process Manager
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mssp-client-manager',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    autorestart: true,
    watch: false
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 8: Configure Nginx
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/mssp-client-manager > /dev/null << 'EOF'
server {
    listen 80;
    server_name your_domain_or_ip;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/mssp-client-manager /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9: Configure Firewall
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL (Firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## ✅ Verification Steps

### Check Services
```bash
# Check PM2 status
pm2 status

# Check application health
curl http://localhost:5001/api/health

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql
```

### Access Application
- **Direct Access**: `http://your_server_ip:5001`
- **Through Nginx**: `http://your_domain_or_ip`

---

## 🔧 Quick Commands Reference

### Application Management
```bash
# Check status
pm2 status

# View logs
pm2 logs mssp-client-manager

# Restart application
pm2 restart mssp-client-manager

# Stop application
pm2 stop mssp-client-manager
```

### Database Operations
```bash
# Connect to database
psql -h localhost -U mssp_user -d mssp_production

# Create backup
pg_dump -h localhost -U mssp_user -d mssp_production > backup.sql

# Restore backup
psql -h localhost -U mssp_user -d mssp_production < backup.sql
```

### Nginx Operations
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

---

## 🚨 Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs mssp-client-manager --lines 50

# Check environment variables
cat .env

# Restart application
pm2 restart mssp-client-manager
```

### Database Connection Issues
```bash
# Test database connection
psql -h localhost -U mssp_user -d mssp_production -c "SELECT 1;"

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Nginx Issues
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Check if port is in use
sudo lsof -i :80
```

---

## 🔒 Security Checklist

- [ ] Change default admin password after first login
- [ ] Configure SSL certificate with `certbot`
- [ ] Update session and JWT secrets
- [ ] Configure proper firewall rules
- [ ] Set up regular backups
- [ ] Enable audit logging
- [ ] Configure SMTP for email notifications
- [ ] Review and update environment variables

---

## 📞 Need Help?

1. **Check the logs first**: `pm2 logs mssp-client-manager`
2. **Verify all services are running**: `pm2 status && sudo systemctl status nginx postgresql`
3. **Review the full documentation**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
4. **Check troubleshooting section**: Look for common issues and solutions

---

**🎉 Your MSSP Client Manager should now be deployed and accessible!**

**Default Login:**
- URL: `http://your_server_ip` or `http://your_domain`
- Username: `admin@test.mssp.local`
- Password: `testpassword123`

**⚠️ Important: Change the default credentials immediately after first login!** 