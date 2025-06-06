# MSSP Client Manager - Production Deployment Guide

This guide provides comprehensive instructions for deploying the MSSP Client Manager application to a production RedHat/CentOS/RHEL server.

## 📋 Prerequisites

### System Requirements
- **Operating System**: RedHat Enterprise Linux 8/9, CentOS 8/9, or Fedora 36+
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: Minimum 20GB free space
- **Network**: Internet connectivity for package downloads
- **User**: Non-root user with sudo privileges

### Required Software (Installed automatically)
- Node.js 20 LTS
- PostgreSQL 14+
- Git
- Nginx (optional, for reverse proxy)
- Firewalld

## 🚀 Quick Deployment

### Step 1: Download the Deployment Script

```bash
# Download the deployment script
curl -o deploy-production.sh https://raw.githubusercontent.com/yassermemo1/MsspClientManager/main/deploy-production.sh

# Make it executable
chmod +x deploy-production.sh
```

### Step 2: Run the Deployment

```bash
# Run the deployment script
./deploy-production.sh
```

The script will:
1. ✅ Install all system dependencies
2. ✅ Install Node.js 20 LTS
3. ✅ Check and resolve port conflicts (2999, 4999)
4. ✅ Setup PostgreSQL database
5. ✅ Clone the application repository
6. ✅ Install application dependencies
7. ✅ Create environment configuration
8. ✅ Setup database schema and tables
9. ✅ Build the application
10. ✅ Configure firewall rules
11. ✅ Start the application
12. ✅ Perform health checks

### Step 3: Access Your Application

Once deployment completes successfully:

- **Frontend**: `http://YOUR_SERVER_IP:4999`
- **Backend API**: `http://YOUR_SERVER_IP:2999`

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Security Note**: Change the default admin password immediately after first login!

## 🛠️ Management Operations

### Download Management Script

```bash
# Download the management script
curl -o manage-production.sh https://raw.githubusercontent.com/yassermemo1/MsspClientManager/main/manage-production.sh

# Make it executable
chmod +x manage-production.sh
```

### Common Management Commands

```bash
# Check application status
./manage-production.sh status

# Start the application
./manage-production.sh start

# Stop the application
./manage-production.sh stop

# Restart the application
./manage-production.sh restart

# View logs (last 50 lines)
./manage-production.sh logs

# View backend logs only
./manage-production.sh logs backend 100

# Follow logs in real-time
./manage-production.sh follow backend

# Perform health check
./manage-production.sh health

# Update application to latest version
./manage-production.sh update

# Create database backup
./manage-production.sh database backup

# Restore database from backup
./manage-production.sh database restore backup_20241130_120000.sql
```

## 📁 Directory Structure

After deployment, the application will be installed in:

```
/opt/mssp-client-manager/
├── client/                 # Frontend application
│   ├── dist/              # Built frontend files
│   └── node_modules/      # Frontend dependencies
├── server/                # Backend application
├── shared/                # Shared utilities
├── uploads/               # File uploads directory
├── .env                   # Environment configuration
├── backend.log            # Backend application logs
├── frontend.log           # Frontend application logs
├── backend.pid            # Backend process ID
├── frontend.pid           # Frontend process ID
└── package.json           # Backend dependencies
```

## 🔧 Configuration

### Environment Variables (.env)

The deployment script automatically creates a `.env` file with:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/mssp_client_manager

# Server Configuration
NODE_ENV=production
PORT=2999
CLIENT_PORT=4999
HOST=0.0.0.0

# Security (automatically generated)
JWT_SECRET=<random-32-byte-string>
SESSION_SECRET=<random-32-byte-string>

# Application URLs
CLIENT_URL=http://YOUR_IP:4999
SERVER_URL=http://YOUR_IP:2999

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Database Configuration

During deployment, you'll be prompted for:
- PostgreSQL username (default: postgres)
- PostgreSQL password
- Database name (default: mssp_client_manager)

### Port Configuration

Default ports:
- **Backend**: 2999
- **Frontend**: 4999

To change ports, edit the scripts:
```bash
BACKEND_PORT=2999
FRONTEND_PORT=4999
```

## 🔥 Firewall Configuration

The deployment script automatically configures firewalld:

```bash
# View current firewall status
sudo firewall-cmd --list-all

# Manually open additional ports if needed
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## 🗄️ Database Management

### Manual Database Operations

```bash
# Connect to database
psql -h localhost -U postgres -d mssp_client_manager

# Create manual backup
pg_dump postgresql://username:password@localhost:5432/mssp_client_manager > backup.sql

# Restore from backup
psql postgresql://username:password@localhost:5432/mssp_client_manager < backup.sql

# Run migrations manually
cd /opt/mssp-client-manager
npx drizzle-kit migrate
```

### Database Schema

The application automatically creates all required tables:
- `users` - User accounts and authentication
- `clients` - Client information
- `clientContacts` - Client contact details
- `services` - Service definitions
- `contracts` - Client contracts
- `hardwareAssets` - Hardware inventory
- `licensePools` - Software license management
- And more...

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Automatic update (recommended)
./manage-production.sh update

# Manual update process
cd /opt/mssp-client-manager
git pull origin main
npm install
cd client && npm install && npm run build && cd ..
./manage-production.sh restart
```

### Log Management

```bash
# View logs
tail -f /opt/mssp-client-manager/backend.log
tail -f /opt/mssp-client-manager/frontend.log

# Rotate logs (create cron job)
logrotate -d /etc/logrotate.d/mssp-client-manager
```

### Performance Monitoring

```bash
# Check system resources
htop
free -h
df -h

# Check application processes
ps aux | grep node
ss -tulpn | grep -E '(2999|4999)'
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
lsof -i :2999
lsof -i :4999

# Kill process
kill -9 <PID>
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check database connectivity
psql -h localhost -U postgres -c "SELECT version();"
```

#### 3. Permission Issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /opt/mssp-client-manager

# Fix permissions
chmod +x /opt/mssp-client-manager/manage-production.sh
```

#### 4. Node.js Issues
```bash
# Check Node.js version
node --version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd /opt/mssp-client-manager
rm -rf node_modules package-lock.json
npm install
```

#### 5. Build Issues
```bash
# Clear build cache
cd /opt/mssp-client-manager/client
rm -rf dist node_modules
npm install
npm run build
```

### Log Analysis

```bash
# Check for errors in logs
grep -i error /opt/mssp-client-manager/backend.log
grep -i error /opt/mssp-client-manager/frontend.log

# Check application startup
head -50 /opt/mssp-client-manager/backend.log
```

## 🔒 Security Considerations

### Immediate Security Tasks

1. **Change Default Admin Password**
   - Login with admin/admin123
   - Go to User Settings
   - Change password immediately

2. **Setup SSL/TLS** (Recommended)
   ```bash
   # Install Certbot for Let's Encrypt
   sudo dnf install certbot python3-certbot-nginx
   
   # Configure Nginx reverse proxy
   sudo nginx -t
   sudo systemctl enable nginx
   ```

3. **Configure Firewall Rules**
   ```bash
   # Allow only necessary ports
   sudo firewall-cmd --permanent --remove-service=ssh
   sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="YOUR_MANAGEMENT_IP" service name="ssh" accept'
   ```

4. **Database Security**
   ```bash
   # Set strong PostgreSQL password
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'strong_password_here';"
   
   # Restrict database access
   sudo vi /var/lib/pgsql/data/pg_hba.conf
   ```

5. **File Permissions**
   ```bash
   # Secure configuration files
   chmod 600 /opt/mssp-client-manager/.env
   ```

### Regular Maintenance

- Keep system packages updated: `sudo dnf update`
- Monitor application logs regularly
- Backup database weekly
- Review user access quarterly
- Update application monthly

## 📞 Support

### Getting Help

1. **Check Logs**: Always check application logs first
2. **Health Check**: Run `./manage-production.sh health`
3. **System Status**: Check `./manage-production.sh status`
4. **Documentation**: Review this guide and application README
5. **GitHub Issues**: Report bugs on the GitHub repository

### Useful Commands

```bash
# System information
hostnamectl
cat /etc/os-release
free -h && df -h

# Network status
ss -tulpn
curl -I http://localhost:2999/api/health

# Application status
ps aux | grep node
systemctl status postgresql
```

---

## 🎉 Congratulations!

Your MSSP Client Manager application is now deployed and ready for production use. Remember to:

- ✅ Change default admin password
- ✅ Configure regular backups
- ✅ Setup monitoring and alerting
- ✅ Plan for regular updates
- ✅ Review security settings

For additional features and customization, refer to the main application documentation. 