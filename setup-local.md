# Local Development Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL locally
2. Create database and user:
```sql
CREATE DATABASE mssp_production;
CREATE USER mssp_user WITH PASSWORD 'mssp_password';
GRANT ALL PRIVILEGES ON DATABASE mssp_production TO mssp_user;
```

#### Option B: Use Neon (Cloud PostgreSQL)
1. Sign up at https://neon.tech/
2. Create a new project
3. Copy the connection string

### 3. Environment Variables
Create a `.env` file in the project root:
```env
# Database Configuration
DATABASE_URL=postgresql://mssp_user:mssp_password@localhost:5432/mssp_production

# Session Security (generate a secure random string)
SESSION_SECRET=your-secure-random-string-minimum-32-characters-long

# Application Environment
NODE_ENV=development

# Optional: Stripe Configuration (if using payment features)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Database Migration
Push the database schema:
```bash
npm run db:push
```

### 5. Create Initial User (Optional)
The app has registration functionality, but you can also create a user directly in the database.

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Common Issues

### Database Connection
- Ensure PostgreSQL is running
- Check connection string format
- Verify user permissions

### Session Issues
- Make sure SESSION_SECRET is at least 32 characters
- Clear browser cookies if having auth issues

### Port Conflicts
- The app runs on port 5000 by default
- Make sure no other services are using this port

## Test Credentials
Once you have a user created, you can use the test credentials mentioned in the README:
- Username: `yaser`
- Password: (ask system administrator or create your own)

## Features Available
- Dashboard with client metrics
- Client management (CRUD operations)
- Contract lifecycle management
- Service scope tracking
- Financial transaction management
- Asset management (hardware & licenses)
- Team assignments
- Document management
- Reporting and analytics 