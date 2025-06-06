# 🚀 MSSP Client Manager - Production Mode Guide

This guide explains how to run the MSSP Client Manager in production mode using the same environment setup.

## 📋 Prerequisites

- ✅ PostgreSQL running with `mssp_production` database
- ✅ Production database populated (46 tables, admin user created)
- ✅ Node.js and npm installed

## 🚀 Quick Start Commands

### **1. Start Production Server**

```bash
# Option A: Using the production script (Recommended)
./start-production.sh

# Option B: Direct command
NODE_ENV=production DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" npm run start

# Option C: Using package.json script with environment
NODE_ENV=production DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" npm run start
```

### **2. Check Server Status**

```bash
./production-status.sh
```

### **3. Stop Production Server**

```bash
./stop-production.sh
```

## 🔧 Production Configuration

The application automatically configures itself for production when `NODE_ENV=production`:

### **Key Production Settings:**
- ✅ **Environment**: Production mode
- ✅ **Database**: `mssp_production`
- ✅ **Port**: 5001
- ✅ **Security**: Enhanced security settings
- ✅ **Logging**: Structured JSON logging
- ✅ **Sessions**: Secure session handling
- ✅ **LDAP**: Enabled (test server)
- ✅ **Testing**: Disabled
- ✅ **Debug**: Disabled

## 🌐 Access Information

Once running in production mode:

- **URL**: http://localhost:5001
- **Admin Login**: 
  - Email: `admin@mssp.local`
  - Password: `admin123`

## 📊 Available Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| **Start Production** | Launch server in production mode | `./start-production.sh` |
| **Stop Production** | Gracefully stop production server | `./stop-production.sh` |
| **Check Status** | View server health and statistics | `./production-status.sh` |

## 🔍 Production vs Development Differences

| Feature | Development | Production |
|---------|-------------|------------|
| **Environment** | `NODE_ENV=development` | `NODE_ENV=production` |
| **Database** | `mssp_db` (optional) | `mssp_production` |
| **Test Data** | Enabled | Disabled |
| **Debug Logging** | Enabled | Disabled |
| **Auto-sync** | Enabled | Disabled by default |
| **Security** | Relaxed | Enhanced |
| **Sessions** | Development settings | Production secure |
| **Error Handling** | Detailed errors | Sanitized errors |

## 🛠️ Advanced Production Commands

### **Start with Auto-sync (if needed)**
```bash
NODE_ENV=production DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" npm run start:sync
```

### **Build Frontend (if needed)**
```bash
npm run build
```

### **Database Operations**
```bash
# Sync production database
npm run sync:production

# Check database connection
psql "postgresql://mssp_user:devpass123@localhost:5432/mssp_production" -c "SELECT version();"
```

## 🔒 Security Considerations

When running in production:

1. **Session Security**: Uses secure session settings
2. **CORS**: Configured for production origins
3. **Rate Limiting**: Enhanced API rate limiting
4. **Error Handling**: Sanitized error responses
5. **Authentication**: Production-grade auth settings

## 🐛 Troubleshooting

### **Port Already in Use**
```bash
# Check what's using port 5001
lsof -i :5001

# Stop existing processes
./stop-production.sh
```

### **Database Connection Issues**
```bash
# Test database connection
psql "postgresql://mssp_user:devpass123@localhost:5432/mssp_production" -c "SELECT 1;"

# Check database status
./production-status.sh
```

### **Permission Issues**
```bash
# Make scripts executable
chmod +x *.sh
```

## 📝 Environment Variables

The production scripts set these key environment variables:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://mssp_user:devpass123@localhost:5432/mssp_production
SESSION_SECRET=production-secret-key-minimum-64-characters-long-for-security-purposes
PORT=5001
HOST=0.0.0.0
FRONTEND_URL=http://localhost:5001
BASE_URL=http://localhost:5001
CLIENT_URL=http://localhost:5001
CORS_ORIGINS=http://localhost:5001
REQUIRE_2FA=false
LDAP_ENABLED=true
ENABLE_TESTING=false
LOG_LEVEL=info
```

## 🚀 Production Deployment Checklist

- [ ] ✅ Database created and populated
- [ ] ✅ Production scripts created and executable
- [ ] ✅ Environment variables configured
- [ ] ✅ Security settings reviewed
- [ ] ✅ Port 5001 available
- [ ] ✅ PostgreSQL running
- [ ] ✅ Admin user created
- [ ] ✅ LDAP configured (if needed)

## 📞 Support

If you encounter issues:

1. Check the production status: `./production-status.sh`
2. Review server logs in the terminal
3. Verify database connectivity
4. Ensure all prerequisites are met

---

**🎉 Your MSSP Client Manager is now running in production mode!**

Access it at: **http://localhost:5001** 