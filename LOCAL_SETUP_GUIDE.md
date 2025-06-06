# MSSP Client Manager - Local Development Setup Guide

## Quick Start

This guide helps you set up the MSSP Client Manager for local development on your current machine.

### Prerequisites

Before running the setup script, ensure you have:

1. **Node.js 18+** installed
   - Check with: `node --version`
   - Download from: [nodejs.org](https://nodejs.org/)

2. **PostgreSQL 13+** installed and running
   - Check with: `psql --version`
   - **macOS**: `brew install postgresql && brew services start postgresql`
   - **Ubuntu/Debian**: `sudo apt install postgresql postgresql-contrib`
   - **CentOS/RHEL**: `sudo dnf install postgresql postgresql-server postgresql-contrib`

3. **Git** (already installed since you cloned the repo)

### Installation Steps

1. **Run the local setup script:**
   ```bash
   ./setup-local-development.sh
   ```

2. **Follow the prompts:**
   - Confirm you want to continue (y/N)
   - Provide database credentials (or use defaults)
   - The script will automatically:
     - Install npm dependencies
     - Create database and user
     - Configure environment
     - Run migrations
     - Build the application

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Open your browser to: `http://localhost:5001`
   - Login with default credentials:
     - **Admin**: `admin@test.mssp.local` / `testpassword123`
     - **Manager**: `manager@test.mssp.local` / `testpassword123`
     - **Engineer**: `engineer@test.mssp.local` / `testpassword123`
     - **User**: `user@test.mssp.local` / `testpassword123`

## What the Script Does

✅ **No remote server setup** - Works on your local machine  
✅ **No GitHub cloning** - Uses existing repository  
✅ **No IP/SSL prompts** - Configured for localhost  
✅ **Automatic dependency installation** - Installs all npm packages  
✅ **Database setup** - Creates development database with credentials you provide  
✅ **Environment configuration** - Creates `.env` file with development settings  
✅ **SSL disabled** - Works with local PostgreSQL without SSL  

## Default Configuration

The script creates a development environment with:

- **Database**: `mssp_development` (or your custom name)
- **User**: `mssp_dev_user` (or your custom username)
- **Port**: `5001`
- **Environment**: `development`
- **SSL**: Disabled for local database
- **2FA**: Disabled for development
- **Email**: Disabled for development

## Available Commands

After setup, you can use these commands:

```bash
# Development with hot reload
npm run dev

# Production build and start
npm run build
npm start

# Run tests
npm test

# Database operations
npm run db:migrate
npm run db:seed
npm run db:reset
```

## Troubleshooting

### PostgreSQL Issues

If you get database connection errors:

1. **Check if PostgreSQL is running:**
   ```bash
   # macOS (Homebrew)
   brew services list | grep postgresql
   brew services start postgresql

   # Linux (systemd)
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. **Test database connection manually:**
   ```bash
   psql postgres -c "SELECT 1;"
   ```

3. **Reset database if needed:**
   ```bash
   dropdb mssp_development  # or your custom db name
   ./setup-local-development.sh  # run setup again
   ```

### Node.js Issues

If you get Node.js version errors:

1. **Update Node.js to 18+:**
   - Download from [nodejs.org](https://nodejs.org/)
   - Or use a version manager like `nvm`

2. **Clear npm cache if needed:**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

### Port Issues

If port 5001 is already in use:

1. **Kill existing process:**
   ```bash
   lsof -ti:5001 | xargs kill -9
   ```

2. **Or change port in `.env`:**
   ```bash
   PORT=5002
   ```

## Manual Setup (Alternative)

If the script doesn't work, you can set up manually:

1. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Create database:**
   ```bash
   createdb mssp_development
   ```

3. **Copy environment template:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run migrations:**
   ```bash
   ./deploy-latest.sh
   ```

5. **Build and start:**
   ```bash
   cd client && npm run build && cd ..
   npm run dev
   ```

## Need Help?

- Check the main `README.md` for detailed documentation
- Review logs in the terminal output
- Ensure all prerequisites are properly installed
- Try the manual setup steps if the script fails

## Production Deployment

For production deployment on a new server, use:
```bash
./deploy-to-new-machine.sh
```

This local setup script is specifically designed for development on your current machine. 