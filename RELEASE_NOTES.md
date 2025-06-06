# Release Notes

## Version 1.4.3 (2025-06-02)

### 🔧 **Database Configuration Fix**
- **BREAKING**: Fixed inconsistent database naming across the application
- All scripts and configurations now use `mssp_production` as the default database name
- Removed references to deprecated `mssp_db` and `mssp_development` databases

### 📝 **Script Updates**
- Updated `scripts/sync-local-dev.sh` to default to `mssp_production`
- Fixed npm scripts in `package.json`:
  - `npm run db:sync` - Sync with mssp_production (default)
  - `npm run sync:local` - Same as above  
  - `npm run db:reset` - Reset and sync mssp_production
- Removed deprecated `sync:local:dev` script

### 📚 **Documentation Updates**
- Updated `DATABASE_SYNC_QUICK_REFERENCE.md` to reflect new database naming
- Improved sync command documentation with clear examples
- Added safety notes about production vs local databases

### 🐛 **Bug Fixes**
- Fixed import path in `entity-relationship-tree.tsx` component
- Resolved database connection issues in local development
- Fixed email service initialization errors

### 🛠️ **Development Improvements**
- Added `create-sample-data.js` script for populating test data
- Streamlined database setup process
- Improved error handling in sync scripts

### ⚠️ **Migration Notes**
If you have existing local development databases:
1. Run `npm run db:sync` to create the new `mssp_production` database
2. Your existing data will be preserved in the old database names
3. Update any custom scripts to use `mssp_production`

---

## Version 1.4.2 (Previous)

### 🏗️ **Infrastructure & Database**
- Enhanced database schema with soft deletion support
- Added missing columns: `requested_date`, `expiry_date`
- Improved contract management system
- Fixed production schema synchronization issues

### 🖼️ **UI/UX Improvements**
- Comprehensive contract detail page with tabbed interface
- Interactive entity relationship tree component
- Enhanced client detail page with better navigation
- Improved visual hierarchy and responsive design

### 🔐 **Authentication & Security**
- Strengthened session management
- Enhanced API endpoint security
- Improved error handling for authentication failures

### 📊 **Features**
- Contract overview with client sidebar
- Service Scopes, SAFs, COCs management
- Document handling and entity relationships
- Click-to-navigate functionality throughout the application

### 🧪 **Testing & Quality**
- Comprehensive test coverage for all major workflows
- Load testing and performance optimization
- Visual regression testing setup
- AI-powered autonomous testing framework

---

## Previous Versions

For complete version history, see [SCHEMA_CHANGELOG.md](./SCHEMA_CHANGELOG.md) and git commit history.

## Version 1.3.0 - JQL Integration & Enhanced External Systems (2025-01-02)

### 🚀 New Features

#### JQL Query Interface
- **Integration Engine UI**: Full JQL query builder interface at `/integration-engine`
- **Client External Mappings**: Client-specific JQL configuration interface
- **Real-time Testing**: Live JQL query testing with JIRA connectivity
- **Query Templates**: Pre-built JQL templates for common use cases
- **Field Mapping**: Dynamic JIRA field mapping and data transformation

#### External Systems Management
- **Enhanced JIRA Integration**: Full JIRA REST API v3 support
- **Connection Testing**: One-click testing for external system connectivity
- **Authentication Support**: Basic Auth, Bearer Token, and API Key authentication
- **Data Source Management**: Complete CRUD interface for external data sources
- **SiTCO JIRA Integration**: Pre-configured SiTCO Service Desk integration

#### Database Enhancements
- **Standardized Schema**: Unified `mssp_production` database across environments
- **Data Sources Table**: New schema for external API integrations
- **Integration Engine Tables**: Full schema for data mapping and processing
- **Migration Scripts**: Automated database schema updates

### 🛠️ Technical Improvements

#### Backend Enhancements
- **External API Service**: Robust service layer for external integrations
- **Connection Testing**: Comprehensive connection validation and error handling
- **Data Mapping Engine**: Flexible field mapping and transformation system
- **Authentication Layer**: Secure credential storage and management

#### Frontend Improvements
- **React Query Integration**: Optimized data fetching and caching
- **Real-time Updates**: Live data synchronization and refresh capabilities
- **Enhanced UI Components**: Improved forms, dialogs, and data tables
- **Error Handling**: Better error messages and user feedback

#### Security & Performance
- **Credential Encryption**: Secure storage of API credentials
- **Rate Limiting**: Protection against API abuse
- **Connection Timeouts**: Prevent hanging requests
- **Database Optimization**: Improved query performance

### 🔧 Configuration

#### JIRA Configuration
```json
{
  "baseUrl": "https://sd.sic.sitco.sa/",
  "username": "svc-scriptrunner", 
  "password": "YOUR_PASSWORD_HERE",
  "token": "YOUR_TOKEN_HERE"
}
```

#### Database Setup
- **Database**: `mssp_production`
- **User**: `mssp_user`
- **Password**: `12345678` (standardized)
- **Host**: `localhost:5432`

### 📖 Usage Guide

#### Accessing JQL Interface
1. **Login**: Use `admin@test.mssp.local` / `testpassword123`
2. **Integration Engine**: Navigate to `/integration-engine`
3. **Select Data Source**: Choose "SiTCO JIRA Service Desk"
4. **Field Mapping**: Configure field mappings
5. **Test Queries**: Use the testing interface for live validation

#### Example JQL Queries
```jql
# All open issues
status != Closed AND status != Resolved

# High priority issues
priority in (High, Highest)

# Recent updates (last 7 days)
updated >= -7d

# Project-specific queries
project = "MSSP-001" AND status != Done
```

#### Client-Specific Configuration
1. **Client Detail Page**: Navigate to any client
2. **External Systems Tab**: Click "External Systems"
3. **Add Mapping**: Configure JIRA project mapping
4. **Custom JQL**: Set client-specific queries

### 🐛 Bug Fixes

- Fixed React import issues in client components
- Resolved database permission issues for schema updates
- Corrected API routing conflicts between parameterized and specific routes
- Fixed authentication flow for external system testing
- Resolved session management issues

### 📋 Testing

#### Automated Tests
- **Unit Tests**: React component testing with Vitest
- **Integration Tests**: API endpoint validation
- **E2E Tests**: Full workflow testing with Playwright
- **Load Tests**: Performance validation under load

#### Manual Testing Checklist
- ✅ JIRA connection testing
- ✅ JQL query execution
- ✅ Data source management
- ✅ Field mapping configuration
- ✅ Client external mappings
- ✅ Authentication flows
- ✅ Database operations

### 🔄 Migration Guide

#### From Version 1.2.0
1. **Database Update**: Run `npm run db:migrate`
2. **Environment Variables**: Update `.env` with new database settings
3. **JIRA Configuration**: Data source will be auto-configured
4. **User Training**: Review new JQL interface documentation

#### Breaking Changes
- Database name standardized to `mssp_production`
- External systems schema updated
- Authentication flow modified for external systems

### 🚀 Deployment

#### Production Deployment
1. **Database Migration**: Apply schema updates
2. **Environment Setup**: Configure JIRA credentials
3. **Service Restart**: Restart application services
4. **Validation**: Test JIRA connectivity

#### Development Setup
1. **Database Setup**: Run `./setup-database.sh`
2. **Dependencies**: `npm install`
3. **Environment**: Copy `.env.example` to `.env`
4. **Start**: `npm run dev`

### 📊 Performance Metrics

- **API Response Time**: < 2s for JIRA queries
- **Database Operations**: < 500ms for complex queries
- **UI Load Time**: < 1s for page transitions
- **Memory Usage**: Optimized for production workloads

### 🔮 Next Release Preview

**Version 1.4.0 (Planned)**
- Grafana integration
- ServiceNow connector
- Advanced dashboard widgets
- Automated data synchronization
- Enhanced reporting features

---

### 👥 Contributors

This release includes contributions to:
- JQL integration development
- Database schema standardization  
- UI/UX improvements
- Testing framework enhancement
- Documentation updates

For technical support or questions about this release, please refer to the documentation or contact the development team. 