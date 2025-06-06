# MSSP Client Management Platform

A comprehensive Managed Security Service Provider (MSSP) client management platform built with modern web technologies. This enterprise-grade application provides complete client lifecycle management, service delivery tracking, asset management, financial operations, and **dynamic external systems integration**.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Authentication System](#authentication-system)
- [Application Structure](#application-structure)
- [Key Features](#key-features)
- [External Systems Integration](#external-systems-integration)
- [Integration Engine & Dashboard Widgets](#integration-engine--dashboard-widgets)
- [Known Issues](#known-issues)
- [Development Guidelines](#development-guidelines)
- [API Endpoints](#api-endpoints)
- [Installation & Setup](#installation--setup)

## Architecture Overview

The platform follows a modern full-stack architecture with **dynamic external systems integration**:

- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **External Integration**: Dynamic API aggregator with parallel processing
- **Security**: Multi-authentication support (Basic, Bearer, API Key)

## Technology Stack

### Core Dependencies
- **React 18**: Frontend framework
- **TypeScript**: Type safety across the stack
- **Express**: Backend server framework
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Primary database
- **Passport.js**: Authentication middleware
- **TanStack Query**: Server state management
- **Zod**: Schema validation
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library

### Development Tools
- **Vite**: Build tool and development server
- **ESBuild**: Fast JavaScript bundler
- **TSX**: TypeScript execution for Node.js

## Database Schema

### Core Entities

#### Users
- Authentication and user management
- Role-based access control (admin, user)
- User settings and preferences

#### Clients
- Core client information (name, industry, status, source)
- Company details (size, contact information)
- Status tracking (active, prospect, inactive, archived)

#### Contracts
- Client agreements and service contracts
- Contract lifecycle management
- Auto-renewal and termination tracking

#### Services
- Service catalog with delivery models
- Pricing structure and scope definitions
- Service categorization

#### Service Scopes
- Specific service implementations per contract
- Timeline and deliverable tracking
- Status management (active, pending, on_hold)

#### Proposals
- Service proposals and quotes
- Client proposal tracking
- Approval workflow management

#### Financial Transactions
- Invoice and payment tracking
- Transaction categorization
- Financial reporting data

#### Asset Management
- Hardware asset inventory
- License pool management
- Client asset assignments

#### Team Management
- Client team assignments
- Role-based client access
- Resource allocation tracking

#### Document Management
- Document storage and versioning
- Access control and permissions
- Compliance document tracking

#### Custom Fields
- Flexible data extension system
- Entity-specific custom attributes
- Dynamic field configuration

### Key Relationships

```
Users → Clients (many-to-many via team assignments)
Clients → Contracts (one-to-many)
Contracts → Service Scopes (one-to-many)
Contracts → Proposals (one-to-many)
Clients → Financial Transactions (one-to-many)
Clients → Hardware Assignments (one-to-many)
Clients → Documents (one-to-many)
Services → Service Scopes (one-to-many)
```

## Authentication System

### Implementation Details
- **Session-based authentication** using express-session
- **Password hashing** with Node.js crypto (scrypt)
- **PostgreSQL session store** for session persistence
- **Passport.js** local strategy for login

### Known Authentication Issues
1. **Session Persistence**: Intermittent 401 errors after successful login
2. **Session Store**: Database connectivity issues with session storage
3. **Cookie Management**: Session cookies not always properly synchronized

### Test Credentials
- **Username**: `yaser`
- **Password**: (ask system administrator)

## Application Structure

### Frontend Pages

#### Dashboard (`/`)
- **Purpose**: Overview of key metrics and recent activity
- **Features**: Client statistics, financial summaries, recent transactions
- **Components**: DashboardStats, activity feeds, quick actions

#### Clients (`/clients`)
- **Purpose**: Complete client management
- **Features**: Client CRUD operations, search/filter, export functionality
- **Status Management**: Active, Prospect, Inactive status tracking

#### Contracts (`/contracts`)
- **Purpose**: Contract lifecycle management
- **Features**: Contract creation, status tracking, client association
- **Workflow**: Draft → Active → Expired/Terminated

#### Services (`/services`)
- **Purpose**: Service catalog management
- **Features**: Service definitions, pricing models, delivery methods
- **Categories**: Consulting, Managed Services, Training, Support

#### Service Scopes (`/service-scopes`)
- **Purpose**: Service implementation tracking
- **Features**: Scope definition, timeline management, deliverable tracking
- **Status Flow**: Pending → Active → On Hold → Completed

#### Proposals (`/proposals`)
- **Purpose**: Client proposal management
- **Features**: Proposal creation, status tracking, approval workflow
- **Integration**: Links to contracts and service scopes

#### Financial (`/financial`)
- **Purpose**: Financial transaction management
- **Features**: Transaction CRUD, payment tracking, financial reporting
- **Types**: Invoice, Payment, Credit, Refund

#### Assets (`/assets`)
- **Purpose**: Hardware and license management
- **Features**: Asset inventory, client assignments, maintenance tracking
- **Categories**: Hardware assets, software licenses

#### Team (`/team`)
- **Purpose**: Team and client assignment management
- **Features**: User-client relationships, role assignments, access control

#### Documents (`/documents`)
- **Purpose**: Document management and version control
- **Features**: File upload, version tracking, access permissions
- **Types**: Contracts, Compliance, Technical, General

#### Reports (`/reports`)
- **Purpose**: Business intelligence and reporting
- **Features**: Client reports, financial summaries, service utilization

#### Settings (`/settings`)
- **Purpose**: System configuration and user preferences
- **Features**: User settings, system configuration, integrations

### Backend Structure

#### Authentication (`server/auth.ts`)
- Passport.js configuration
- Session management
- Password hashing utilities
- Authentication middleware

#### Database (`server/db.ts`)
- Drizzle ORM configuration
- PostgreSQL connection
- Database schema imports

#### Storage (`server/storage.ts`)
- Data access layer
- CRUD operations for all entities
- Business logic implementation
- Session store configuration

#### Routes (`server/routes.ts`)
- API endpoint definitions
- Request validation
- Authentication middleware
- Error handling

## Key Features

### 1. Client Management
- **Comprehensive client profiles** with industry classification
- **Status tracking** throughout client lifecycle
- **Contact management** with multiple contacts per client
- **Search and filtering** capabilities
- **Export functionality** for reporting

### 2. Service Delivery
- **Service catalog** with standardized offerings
- **Service scope management** for project tracking
- **Timeline and deliverable tracking**
- **Status monitoring** and reporting

### 3. Contract Management
- **Contract lifecycle tracking**
- **Auto-renewal management**
- **Contract-service scope relationships**
- **Document association**

### 4. Financial Management
- **Transaction tracking** (invoices, payments, credits)
- **Client financial history**
- **Payment status monitoring**
- **Financial reporting capabilities**

### 5. Asset Management
- **Hardware inventory management**
- **Software license tracking**
- **Client asset assignments**
- **Maintenance and status tracking**

### 6. Document Management
- **Version control system**
- **Access permissions**
- **Document categorization**
- **Compliance tracking**

### 7. Team Management
- **User-client assignments**
- **Role-based access control**
- **Team collaboration features**

### 8. External Systems Integration
- **Dynamic API aggregator** with parallel processing
- **Multi-authentication support** (Basic, Bearer, API Key)
- **Real-time data consolidation** from multiple external sources
- **Configurable system mappings** per client
- **Graceful error handling** with timeout protection
- **Scalable architecture** supporting unlimited external systems

### 9. Integration Engine
- **External API data source management** with real-time sync
- **Field mapping configuration** for data transformation
- **Dashboard widget creation** with multiple visualization types
- **Data source testing** and connection validation
- **Automated data synchronization** with configurable frequencies
- **Reusable widget library** for dashboard composition

### 10. Advanced Dashboard System
- **Dynamic widget-based dashboards** with drag-and-drop interface
- **Real-time data visualization** from integrated external sources
- **Multiple widget types**: Metrics, Charts, Tables, Lists
- **Customizable layouts** with responsive grid system
- **Widget configuration management** with live preview
- **Dashboard sharing** and collaboration features

### 11. Comprehensive Reporting
- **Financial reports** with revenue and cost analysis
- **Client performance reports** with service utilization metrics
- **Security reports** with incident summaries and threat analysis
- **Compliance reporting** with automated compliance tracking
- **Custom report generation** with flexible parameters
- **Export functionality** in multiple formats (PDF, Excel, CSV)

### 12. Enhanced Document Management
- **Version control system** with complete audit trail
- **Document categorization** by type and compliance requirements
- **Access control** with role-based permissions
- **Preview functionality** for supported file types
- **Bulk upload** and batch processing capabilities
- **Document search** with metadata and content indexing

### 10. Bulk Data Import
- **CSV file upload** with validation and error handling
- **Multiple data types** support (clients, contracts, services, scopes, SAFs, COCs)
- **Template downloads** with example data formats
- **Progress tracking** with real-time status updates
- **Error reporting** with detailed failure messages
- **Data validation** ensuring referential integrity

### 11. Enhanced Client Management
- **Comprehensive client profiles** with all related data
- **Service Authorization Forms (SAF)** management and tracking
- **Certificates of Compliance (COC)** with expiry monitoring
- **External API integration** for real-time data aggregation
- **Document management** with version control
- **Financial transaction** tracking and reporting

## External Systems Integration

### Overview

The MSSP Client Management Platform features a powerful **API Aggregator for Dynamic Client Data** that enables real-time integration with multiple external systems. This feature consolidates data from various sources (Jira, Grafana, ServiceNow, etc.) into a single, unified API response.

### Architecture

```
Frontend Request → API Aggregator → External Systems (Parallel) → Consolidated Response
     ↓                ↓                    ↓                         ↓
GET /api/clients/    Fetch Client      [Jira, Grafana,          Combined JSON
{clientId}/          External          ServiceNow, etc.]        with all data
aggregated-data      Mappings               ↓                        ↓
                         ↓            Promise.allSettled()      Error handling
                    Parallel API           ↓                    & timeouts
                    Calls (10s timeout)  Results aggregation
```

### Key Features

#### 1. Dynamic System Configuration
- **External Systems Management**: Configure unlimited external systems via UI
- **Authentication Support**: Basic Auth, Bearer Token, API Key
- **Flexible Endpoints**: Configurable API endpoints per system
- **Metadata Storage**: JSON configuration for system-specific settings

#### 2. Client-System Mappings
- **Per-Client Configuration**: Map clients to specific external system entities
- **Flexible Identifiers**: Support for various external ID formats
- **Metadata Support**: Store additional mapping configuration
- **Real-time Management**: Add/remove mappings via UI

#### 3. Parallel Data Processing
- **Concurrent API Calls**: All external systems called simultaneously
- **Timeout Protection**: 10-second timeout per system call
- **Graceful Degradation**: Failed systems don't break the response
- **Error Isolation**: Individual system failures are contained

#### 4. Built-in System Adapters

##### Jira Integration
- **JQL Query Execution**: Custom JQL queries per client
- **Issue Aggregation**: Count and categorize issues
- **Project Data**: Fetch project-specific information
- **Authentication**: Basic Auth or API Token support

##### Grafana Integration
- **Dashboard Metadata**: Fetch dashboard information
- **Panel Data**: Extract specific panel metrics
- **Organization Support**: Multi-tenant Grafana instances
- **API Key Authentication**: Secure Grafana API access

##### ServiceNow Integration
- **Incident Counting**: Aggregate incident statistics
- **Table Queries**: Flexible ServiceNow table access
- **Custom Filters**: Client-specific incident filtering
- **OAuth Support**: Modern ServiceNow authentication

##### Generic System Support
- **REST API Integration**: Support for any REST API
- **Custom Headers**: Configurable request headers
- **Response Mapping**: Flexible response data extraction
- **Authentication Flexibility**: Multiple auth methods

### Database Schema

#### External Systems Table
```sql
CREATE TABLE external_systems (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  base_url VARCHAR(500) NOT NULL,
  auth_type VARCHAR(50) NOT NULL, -- 'basic', 'bearer', 'api_key'
  auth_config JSONB NOT NULL,     -- Authentication configuration
  api_endpoints JSONB,            -- System-specific endpoints
  metadata JSONB,                 -- Additional configuration
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Client External Mappings Table
```sql
CREATE TABLE client_external_mappings (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  system_name VARCHAR(255) NOT NULL,
  external_identifier VARCHAR(255) NOT NULL,
  metadata JSONB,                 -- Mapping-specific configuration
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

#### Main Aggregation Endpoint
```http
GET /api/clients/{clientId}/aggregated-data
```

**Response Format:**
```json
{
  "clientId": 1,
  "timestamp": "2024-01-15T10:30:00Z",
  "systems": {
    "jira": {
      "success": true,
      "data": {
        "totalIssues": 45,
        "openIssues": 12,
        "projects": ["PROJ-1", "PROJ-2"]
      },
      "responseTime": 1250
    },
    "grafana": {
      "success": true,
      "data": {
        "dashboards": 8,
        "alerts": 2,
        "lastUpdate": "2024-01-15T10:25:00Z"
      },
      "responseTime": 890
    },
    "servicenow": {
      "success": false,
      "error": "Connection timeout",
      "responseTime": 10000
    }
  },
  "summary": {
    "totalSystems": 3,
    "successfulSystems": 2,
    "failedSystems": 1,
    "totalResponseTime": 12140
  }
}
```

#### External Systems Management
```http
GET    /api/external-systems           # List all systems
POST   /api/external-systems           # Create new system
PUT    /api/external-systems/:id       # Update system
DELETE /api/external-systems/:id       # Delete system
```

#### Client Mappings Management
```http
GET    /api/clients/:id/external-mappings     # Get client mappings
POST   /api/clients/:id/external-mappings     # Create mapping
PUT    /api/external-mappings/:id             # Update mapping
DELETE /api/external-mappings/:id             # Delete mapping
```

### Configuration Examples

#### Jira System Configuration
```json
{
  "name": "Production Jira",
  "baseUrl": "https://company.atlassian.net",
  "authType": "basic",
  "authConfig": {
    "username": "api-user@company.com",
    "password": "api-token-here"
  },
  "apiEndpoints": {
    "search": "/rest/api/3/search",
    "projects": "/rest/api/3/project"
  },
  "metadata": {
    "defaultJql": "project = {projectKey} AND status != Done",
    "maxResults": 100
  }
}
```

#### Grafana System Configuration
```json
{
  "name": "Monitoring Grafana",
  "baseUrl": "https://grafana.company.com",
  "authType": "api_key",
  "authConfig": {
    "apiKey": "eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk"
  },
  "apiEndpoints": {
    "dashboards": "/api/search",
    "dashboard": "/api/dashboards/uid/{uid}"
  },
  "metadata": {
    "orgId": 1,
    "defaultType": "dash-db"
  }
}
```

#### Client Mapping Example
```json
{
  "clientId": 1,
  "systemName": "Production Jira",
  "externalIdentifier": "ACME",
  "metadata": {
    "projectKey": "ACME",
    "customJql": "project = ACME AND priority = High",
    "includeSubtasks": true
  }
}
```

### Frontend Integration

#### External Systems Management Page
- **Location**: `/external-systems`
- **Features**: Full CRUD interface for system configuration
- **Components**: System list, configuration forms, test connections
- **Validation**: Real-time configuration validation

#### Client External Mappings Component
- **Location**: Client detail pages (new tab)
- **Features**: Real-time aggregated data display, mapping management
- **Components**: Data widgets, mapping forms, refresh controls
- **Error Handling**: Individual system error display

### Security Considerations

#### Authentication Storage
- **Encryption**: All authentication credentials encrypted at rest
- **Environment Variables**: Sensitive data stored in environment variables
- **Access Control**: Admin-only access to system configuration
- **Audit Logging**: All configuration changes logged

#### API Security
- **Rate Limiting**: Prevent abuse of external API calls
- **Timeout Protection**: 10-second timeout prevents hanging requests
- **Error Isolation**: Failed systems don't expose sensitive information
- **HTTPS Only**: All external API calls use HTTPS

### Performance Optimization

#### Parallel Processing
- **Promise.allSettled()**: All external calls made simultaneously
- **Non-blocking**: Failed systems don't block successful ones
- **Timeout Management**: Configurable timeouts per system
- **Response Caching**: Optional caching for frequently accessed data

#### Error Handling
- **Graceful Degradation**: Partial data better than no data
- **Detailed Error Reporting**: Specific error messages per system
- **Retry Logic**: Configurable retry attempts for failed calls
- **Circuit Breaker**: Prevent cascading failures

### Usage Examples

#### Setting Up Jira Integration
1. Navigate to External Systems page
2. Click "Add New System"
3. Configure Jira connection details
4. Test connection
5. Go to client detail page
6. Add external mapping with Jira project key
7. View aggregated data in real-time

#### Monitoring Multiple Systems
1. Configure multiple external systems (Jira, Grafana, ServiceNow)
2. Map client to relevant external entities
3. Use aggregated data endpoint for dashboard widgets
4. Monitor system health via response times and success rates

### Quick Start Guide for Bulk Import

#### 1. Access Bulk Import
```bash
# Start the development server
npm run dev

# Navigate to http://localhost:5000/bulk-import
```

#### 2. Import Your First Dataset (Clients Example)
1. Click on the "Clients" tab
2. Click "Download Template" to get the CSV format
3. Fill in your client data using the template
4. Upload the completed CSV file
5. Click "Start Import" and monitor progress
6. Review results and fix any errors

#### 3. Import Related Data (Contracts Example)
1. Ensure clients are imported first
2. Switch to "Contracts" tab
3. Download and fill the contracts template
4. Reference existing client names in the `clientName` column
5. Upload and import the contracts data

#### 4. Verify Imported Data
1. Navigate to Clients page to see imported clients
2. Click on a client to view their details
3. Check the Contracts tab to see imported contracts
4. Verify all relationships are correctly established

## Integration Engine & Dashboard Widgets

### Overview

The Integration Engine is a powerful feature that enables you to connect external APIs, transform data, and create dynamic dashboard widgets. This system provides a complete data integration pipeline from external sources to visual dashboards.

### Architecture

```
External APIs → Data Sources → Field Mapping → Data Sync → Dashboard Widgets → Live Dashboards
     ↓              ↓             ↓            ↓              ↓                ↓
[Cat Facts API]  [Configure]   [Transform]   [Store]      [Visualize]    [Display]
[GitHub API]     [Test Conn]   [Map Fields]  [Sync Data]  [Create Widget] [Real-time]
[Custom APIs]    [Validate]    [Validate]    [Schedule]   [Configure]     [Interactive]
```

### Key Features

#### 1. Data Source Management
- **External API Integration**: Connect to any REST API
- **Authentication Support**: API Key, Basic Auth, Bearer Token
- **Connection Testing**: Validate API connectivity and response format
- **Sync Scheduling**: Manual, Hourly, Daily, Weekly synchronization
- **Error Handling**: Comprehensive error logging and retry mechanisms

#### 2. Field Mapping System
- **Automatic Field Detection**: Discover fields from API responses
- **Data Type Mapping**: String, Number, Boolean, Date transformations
- **Required Field Validation**: Ensure data integrity
- **Default Value Assignment**: Handle missing data gracefully
- **Custom Transformations**: Apply business logic during mapping

#### 3. Dashboard Widget Creation
- **Multiple Widget Types**: Metric, Chart, Table, List visualizations
- **Real-time Data**: Live updates from synchronized data sources
- **Custom Configuration**: Flexible widget settings and appearance
- **Responsive Design**: Automatic layout adaptation
- **Interactive Elements**: Clickable and filterable widgets

#### 4. Data Synchronization
- **Automated Sync**: Scheduled data updates from external sources
- **Manual Sync**: On-demand data refresh
- **Incremental Updates**: Efficient data synchronization
- **Conflict Resolution**: Handle data conflicts and duplicates
- **Audit Trail**: Complete synchronization history

### Widget Types

#### Metric Widget
**Purpose**: Display single numerical values with trends
**Configuration**:
- `valueField`: Field containing the numeric value
- `label`: Display label for the metric
- `format`: Number formatting (currency, percentage, etc.)
- `trend`: Show increase/decrease indicators

**Example Use Cases**:
- Total number of API calls
- Revenue metrics
- System uptime percentages
- User count statistics

#### Chart Widget
**Purpose**: Visualize data relationships and trends
**Configuration**:
- `xField`: X-axis data field
- `yField`: Y-axis data field
- `chartType`: Bar, Line, Area charts
- `aggregation`: Sum, Average, Count functions

**Example Use Cases**:
- Monthly revenue trends
- API usage over time
- Client distribution by industry
- Service performance metrics

#### Table Widget
**Purpose**: Display structured data in rows and columns
**Configuration**:
- `columns`: Array of column definitions
- `sortable`: Enable column sorting
- `filterable`: Add column filters
- `pagination`: Configure page size

**Example Use Cases**:
- Client contact lists
- Transaction histories
- Asset inventories
- Service scope details

#### List Widget
**Purpose**: Show items with badges and metadata
**Configuration**:
- `titleField`: Primary display field
- `subtitleField`: Secondary information
- `badgeField`: Status or category badges
- `linkField`: Clickable links

**Example Use Cases**:
- Recent activities
- Status updates
- Notification lists
- Quick action items

### Step-by-Step User Guides

#### Setting Up Your First Data Source

**Step 1: Access Integration Engine**
1. Navigate to the main menu
2. Click on "Integration Engine" (marked with ⚡ icon)
3. You'll see four tabs: Data Sources, Field Mapping, Integrated Data, Dashboard Widgets

**Step 2: Create a Data Source**
1. Click "Add Data Source" button
2. Fill in the configuration:
   - **Name**: "Cat Facts API" (example)
   - **Description**: "Random cat facts for testing"
   - **API Endpoint**: "https://catfact.ninja/fact"
   - **Auth Type**: "none" (for public APIs)
   - **Sync Frequency**: "manual" (for testing)
3. Click "Save Data Source"

**Step 3: Test the Connection**
1. Find your new data source in the list
2. Click "Test Connection" button
3. Review the sample data returned
4. Verify the API response structure

**Step 4: Configure Field Mapping**
1. Click on the "Field Mapping" tab
2. Select your data source from the dropdown
3. Click "Add Mapping" for each field you want to store:
   - **Source Field**: "fact" → **Target Field**: "content"
   - **Source Field**: "length" → **Target Field**: "length"
4. Set field types (string, number) and mark required fields
5. Save each mapping

**Step 5: Sync Data**
1. Return to "Data Sources" tab
2. Click "Sync Data" on your data source
3. Monitor the sync progress
4. Check "Integrated Data" tab to see stored data

#### Creating Your First Dashboard Widget

**Step 1: Access Widget Creation**
1. Go to "Dashboard Widgets" tab in Integration Engine
2. Click "Create Widget" button

**Step 2: Configure Basic Settings**
1. **Widget Name**: "Cat Facts Counter"
2. **Description**: "Shows total number of cat facts"
3. **Widget Type**: "Metric"
4. **Data Source**: Select your configured data source

**Step 3: Configure Metric Widget**
1. **Value Field**: Select the field to count (usually "id")
2. **Label**: "Total Cat Facts"
3. **Aggregation**: "Count"
4. **Format**: "Number"

**Step 4: Save and View**
1. Click "Save Widget"
2. Navigate to the main Dashboard (/)
3. Your widget will appear automatically
4. Use the refresh button to update data

#### Advanced Widget Configuration

**Creating a Table Widget**
1. Choose "Table" widget type
2. Configure columns:
   ```json
   [
     {"field": "content", "label": "Cat Fact", "type": "string"},
     {"field": "length", "label": "Length", "type": "number"}
   ]
   ```
3. Enable sorting and pagination
4. Set page size (default: 10)

**Creating a Chart Widget**
1. Choose "Chart" widget type
2. Set chart configuration:
   - **Chart Type**: "bar"
   - **X Field**: "length" (fact length)
   - **Y Field**: "id" (count)
   - **Aggregation**: "count"
3. Configure chart appearance and colors

#### Managing Multiple Data Sources

**Adding GitHub API Integration**
1. Create new data source:
   - **Name**: "GitHub Repository Stats"
   - **API Endpoint**: "https://api.github.com/repos/owner/repo"
   - **Auth Type**: "bearer"
   - **Token**: Your GitHub personal access token
2. Map fields: stars, forks, issues, language
3. Create widgets for repository metrics

**Setting Up Automated Sync**
1. Edit your data source
2. Change sync frequency to "daily"
3. Set sync time preference
4. Enable error notifications
5. Monitor sync logs for issues

#### Dashboard Customization

**Organizing Widgets**
1. Widgets appear automatically on the main dashboard
2. Use the Integration Engine to edit widget configurations
3. Create multiple widgets from the same data source
4. Combine different data sources for comprehensive views

**Widget Performance Optimization**
1. Limit data size with pagination
2. Use appropriate aggregations
3. Cache frequently accessed data
4. Monitor widget load times

### API Endpoints for Integration Engine

#### Data Sources Management
```http
GET    /api/data-sources              # List all data sources
POST   /api/data-sources              # Create new data source
PUT    /api/data-sources/:id          # Update data source
DELETE /api/data-sources/:id          # Delete data source
POST   /api/data-sources/:id/test     # Test connection
POST   /api/data-sources/:id/sync     # Sync data
```

#### Field Mappings
```http
GET    /api/data-sources/:id/mappings    # Get mappings for data source
POST   /api/data-source-mappings         # Create new mapping
PUT    /api/data-source-mappings/:id     # Update mapping
DELETE /api/data-source-mappings/:id     # Delete mapping
```

#### Dashboard Widgets
```http
GET    /api/dashboard-widgets            # List all widgets
POST   /api/dashboard-widgets            # Create new widget
PUT    /api/dashboard-widgets/:id        # Update widget
DELETE /api/dashboard-widgets/:id        # Delete widget
GET    /api/dashboard-widgets/:id/data   # Get widget data
```

#### Integrated Data
```http
GET    /api/data-sources/:id/data        # Get integrated data
GET    /api/integrated-data              # Get all integrated data
DELETE /api/integrated-data/:id          # Delete data record
```

### Database Schema for Integration Engine

#### Data Sources Table
```sql
CREATE TABLE data_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  api_endpoint VARCHAR(500) NOT NULL,
  auth_type VARCHAR(50) NOT NULL,
  auth_config JSONB NOT NULL,
  sync_frequency VARCHAR(50) DEFAULT 'manual',
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Data Source Mappings Table
```sql
CREATE TABLE data_source_mappings (
  id SERIAL PRIMARY KEY,
  data_source_id INTEGER REFERENCES data_sources(id),
  source_field VARCHAR(255) NOT NULL,
  target_field VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Dashboard Widgets Table
```sql
CREATE TABLE dashboard_widgets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  data_source_id INTEGER REFERENCES data_sources(id),
  config JSONB NOT NULL,
  position JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Integrated Data Table
```sql
CREATE TABLE integrated_data (
  id SERIAL PRIMARY KEY,
  data_source_id INTEGER REFERENCES data_sources(id),
  original_data JSONB NOT NULL,
  mapped_data JSONB NOT NULL,
  sync_timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Troubleshooting Integration Engine

#### Common Issues

**Connection Test Fails**
- Verify API endpoint URL is correct
- Check authentication credentials
- Ensure API is accessible from your server
- Review API rate limits and quotas

**Field Mapping Errors**
- Confirm source fields exist in API response
- Check data type compatibility
- Verify required fields are mapped
- Test with sample data first

**Widget Not Displaying Data**
- Ensure data source has synced data
- Check widget configuration matches data structure
- Verify field names in widget config
- Review browser console for errors

**Sync Failures**
- Check API authentication status
- Monitor API rate limits
- Review error logs in Integration Engine
- Verify network connectivity

#### Performance Optimization

**Data Source Optimization**
- Use pagination for large datasets
- Implement incremental sync where possible
- Cache frequently accessed data
- Monitor API response times

**Widget Performance**
- Limit data size with appropriate filters
- Use aggregations instead of raw data
- Implement client-side caching
- Optimize database queries

### Security Considerations

#### API Security
- Store credentials securely in environment variables
- Use HTTPS for all API communications
- Implement rate limiting for external calls
- Validate all incoming data

#### Data Protection
- Encrypt sensitive data at rest
- Implement access controls for data sources
- Audit all data access and modifications
- Regular security reviews of integrations

## Bulk Data Import System

### Overview

The Bulk Data Import system enables efficient import of client-related data from CSV files. This feature supports importing clients, contracts, services, service scopes, SAFs, and COCs with comprehensive validation and error handling.

### Supported Import Types

1. **Clients** - Company information and primary contacts
2. **Contracts** - Client agreements and terms
3. **Services** - Service catalog and offerings
4. **Service Scopes** - Detailed service definitions and deliverables
5. **Service Authorization Forms (SAFs)** - Authorization documents
6. **Certificates of Compliance (COCs)** - Compliance certificates and audit records

### CSV Format Requirements

#### General Guidelines
- Use UTF-8 encoding
- Include header row with exact field names
- Use comma (,) as delimiter
- Enclose text containing commas in double quotes
- Date format: YYYY-MM-DD
- Boolean values: true/false
- Empty fields are allowed for optional data

#### Import Order Recommendation
For best results, import data in this order to ensure proper relationships:
1. **Clients** (establishes base entities)
2. **Services** (defines available services)
3. **Contracts** (links clients to agreements)
4. **Service Scopes** (defines specific service implementations)
5. **SAFs** (authorization documents)
6. **COCs** (compliance certificates)

### Step-by-Step Import Process

#### 1. Access Bulk Import
```bash
# Navigate to the bulk import page
http://localhost:5000/bulk-import
```

#### 2. Select Import Type
1. Choose the data type you want to import
2. Review the required fields for that type
3. Download the CSV template with example data

#### 3. Prepare Your CSV File
1. Use the downloaded template as a starting point
2. Replace example data with your actual data
3. Ensure all required fields are populated
4. Validate date formats and data types

#### 4. Upload and Import
1. Select your prepared CSV file
2. Click "Start Import" to begin the process
3. Monitor the progress bar and status messages
4. Review the import results and any error messages

#### 5. Verify Imported Data
1. Navigate to the relevant section (Clients, Contracts, etc.)
2. Verify that all data was imported correctly
3. Check relationships between related entities
4. Review any failed imports and correct issues

### CSV Templates and Examples

#### Clients Template
```csv
name,industry,companySize,status,source,address,website,notes,contactName,contactEmail,contactPhone,contactTitle
"Acme Corporation","Technology","Large","active","referral","123 Main St, New York, NY 10001","https://acme.com","Primary technology client","John Smith","john.smith@acme.com","+1-555-0123","CTO"
```

#### Contracts Template
```csv
clientName,contractName,startDate,endDate,totalValue,status,autoRenewal,renewalTerms,notes
"Acme Corporation","SOC Monitoring Agreement","2024-01-01","2024-12-31","120000.00","active","true","12 months","Annual SOC monitoring contract"
```

#### Services Template
```csv
name,category,description,deliveryModel,basePrice,pricingUnit,isActive
"24/7 SOC Monitoring","Security Operations","Continuous security monitoring and threat detection","Managed Service","5000.00","monthly","true"
```

#### Service Scopes Template
```csv
clientName,contractName,serviceName,description,startDate,endDate,status,deliverables,timeline,notes
"Acme Corporation","SOC Monitoring Agreement","24/7 SOC Monitoring","Comprehensive security monitoring for production environment","2024-01-01","2024-12-31","active","Threat detection|Incident response|Monthly reports","12 months","Primary monitoring scope"
```

#### Service Authorization Forms Template
```csv
clientName,contractName,serviceScopeName,safNumber,title,description,startDate,endDate,status,value,notes
"Acme Corporation","SOC Monitoring Agreement","24/7 SOC Monitoring","SAF-2024-001","SOC Monitoring Authorization","Authorization for 24/7 security monitoring services","2024-01-01","2024-12-31","approved","60000.00","First half payment authorization"
```

#### Certificates of Compliance Template
```csv
clientName,contractName,serviceScopeName,safNumber,cocNumber,title,description,complianceType,issueDate,expiryDate,status,auditDate,nextAuditDate,notes
"Acme Corporation","SOC Monitoring Agreement","24/7 SOC Monitoring","SAF-2024-001","COC-2024-001","SOC 2 Type II Compliance","SOC 2 Type II compliance certificate","SOC2","2024-06-01","2025-06-01","active","2024-05-15","2025-05-15","Annual SOC 2 certification"
```

### Error Handling and Troubleshooting

#### Common Import Errors
1. **Missing Required Fields** - Ensure all required fields have values
2. **Invalid Date Formats** - Use YYYY-MM-DD format for all dates
3. **Duplicate Records** - Check for existing records with same identifiers
4. **Missing References** - Ensure referenced entities exist (e.g., client names for contracts)
5. **Invalid Data Types** - Verify numeric fields contain valid numbers

#### Data Validation Rules
- Client names must be unique
- Contract names must be unique per client
- Service names must be unique globally
- SAF numbers must be unique globally
- COC numbers must be unique globally
- All date fields must be valid dates
- Numeric fields must contain valid numbers
- Email addresses must be properly formatted

### Security Considerations
- All imports require authentication
- File uploads are validated for type and size
- Temporary files are automatically cleaned up
- Import activities are logged for audit purposes
- Data validation prevents injection attacks

## Complete Feature User Guides

### 1. Client Management - Step by Step

#### Adding a New Client
1. **Navigate to Clients**
   - Click "Clients" in the main navigation
   - You'll see the client management dashboard

2. **Create New Client**
   - Click "Add Client" button (top right)
   - Fill in the client form:
     - **Name**: Company name (required)
     - **Industry**: Select from dropdown
     - **Status**: Active, Prospect, Inactive, or Archived
     - **Source**: How you acquired this client
     - **Company Size**: Small, Medium, Large, Enterprise
     - **Website**: Company website URL
     - **Description**: Brief company description

3. **Add Contact Information**
   - **Primary Contact**: Main point of contact
   - **Email**: Primary email address
   - **Phone**: Primary phone number
   - **Address**: Complete business address

4. **Save and Manage**
   - Click "Save Client"
   - Use the search and filter options to find clients
   - Export client data using the export button

#### Managing Client Details
1. **View Client Details**
   - Click on any client name to open detail page
   - Navigate through tabs: Overview, Contracts, Financial, Team, Documents, External Systems

2. **Update Client Information**
   - Click "Edit Client" button
   - Modify any field and save changes
   - View audit trail of changes

3. **Client Status Management**
   - Change status from Active → Prospect → Inactive → Archived
   - Each status change is tracked with timestamps

### 2. Contract Management - Step by Step

#### Creating a New Contract
1. **Access Contracts**
   - Navigate to "Contracts" in main menu
   - View existing contracts and their statuses

2. **Create Contract**
   - Click "Add Contract" button
   - Fill in contract details:
     - **Client**: Select from dropdown
     - **Contract Type**: Service Agreement, MSA, SOW, etc.
     - **Start Date**: Contract effective date
     - **End Date**: Contract expiration date
     - **Value**: Total contract value
     - **Status**: Draft, Active, Expired, Terminated

3. **Contract Terms**
   - **Auto Renewal**: Enable automatic renewal
   - **Renewal Period**: Monthly, Quarterly, Annually
   - **Notice Period**: Required notice for termination
   - **Payment Terms**: Net 30, Net 60, etc.

4. **Document Attachment**
   - Upload signed contract documents
   - Attach related proposals and amendments
   - Maintain version control

#### Contract Lifecycle Management
1. **Monitor Contract Status**
   - View contracts approaching expiration
   - Track renewal dates and notifications
   - Manage contract amendments

2. **Financial Tracking**
   - Link contracts to financial transactions
   - Track payments and outstanding amounts
   - Generate contract-based reports

### 3. Service Management - Step by Step

#### Setting Up Service Catalog
1. **Access Services**
   - Navigate to "Services" in main menu
   - View existing service offerings

2. **Create New Service**
   - Click "Add Service" button
   - Configure service details:
     - **Name**: Service name (e.g., "24/7 SOC Monitoring")
     - **Category**: Consulting, Managed Services, Training, Support
     - **Delivery Model**: On-site, Remote, Hybrid
     - **Pricing Model**: Fixed, Hourly, Monthly, Project-based
     - **Base Price**: Starting price for the service

3. **Service Scope Definition**
   - **Description**: Detailed service description
   - **Deliverables**: What the client receives
   - **SLA Requirements**: Service level agreements
   - **Prerequisites**: Client requirements

#### Managing Service Scopes
1. **Create Service Scope**
   - Navigate to "Service Scopes"
   - Click "New Service Scope"
   - Link to contract and service
   - Define specific implementation details

2. **Track Service Delivery**
   - Monitor scope status: Pending → Active → On Hold → Completed
   - Track deliverables and milestones
   - Manage timeline and resources

### 4. Financial Management - Step by Step

#### Recording Financial Transactions
1. **Access Financial Module**
   - Navigate to "Financial" in main menu
   - View transaction dashboard with summaries

2. **Create New Transaction**
   - Click "Add Transaction" button
   - Select transaction type:
     - **Revenue**: Client payments, invoices
     - **Cost**: Expenses, vendor payments

3. **Transaction Details**
   - **Amount**: Transaction value
   - **Client**: Associated client (for revenue)
   - **Description**: Transaction description
   - **Date**: Transaction date
   - **Status**: Pending, Completed, Failed

4. **Financial Reporting**
   - View revenue vs. cost analysis
   - Generate client financial summaries
   - Export financial data for accounting

#### Invoice and Payment Tracking
1. **Invoice Management**
   - Create invoices linked to contracts
   - Track invoice status and payment dates
   - Send payment reminders

2. **Payment Processing**
   - Record payments against invoices
   - Handle partial payments
   - Manage payment methods and terms

### 5. Asset Management - Step by Step

#### Hardware Asset Management
1. **Access Assets Module**
   - Navigate to "Assets" in main menu
   - Switch to "Hardware Assets" tab

2. **Add Hardware Asset**
   - Click "Add Hardware Asset"
   - Fill in asset details:
     - **Name**: Asset identifier
     - **Type**: Server, Laptop, Network Equipment, etc.
     - **Model**: Manufacturer and model
     - **Serial Number**: Unique identifier
     - **Purchase Date**: Acquisition date
     - **Warranty**: Warranty expiration date

3. **Asset Assignment**
   - Assign assets to clients
   - Track asset location and status
   - Manage maintenance schedules

#### License Pool Management
1. **Create License Pool**
   - Switch to "License Pools" tab
   - Click "Add License Pool"
   - Configure license details:
     - **Software Name**: Licensed software
     - **License Type**: Per User, Per Device, Site License
     - **Total Licenses**: Available license count
     - **Expiration Date**: License expiration

2. **License Assignment**
   - Assign licenses to clients
   - Track license utilization
   - Monitor compliance and renewals

### 6. Team Management - Step by Step

#### Managing Team Members
1. **Access Team Module**
   - Navigate to "Team" in main menu
   - View current team members

2. **Add Team Member**
   - Click "Add Team Member"
   - Create user account:
     - **Username**: Login username
     - **Email**: Contact email
     - **Role**: Admin or User
     - **Full Name**: Display name

3. **Client Assignments**
   - Switch to "Client Assignments" tab
   - Assign team members to specific clients
   - Define roles and responsibilities
   - Set access permissions

#### Role-Based Access Control
1. **User Roles**
   - **Admin**: Full system access
   - **User**: Limited access based on assignments

2. **Client Access**
   - Assign users to specific clients
   - Control data visibility
   - Manage collaboration permissions

### 7. Document Management - Step by Step

#### Document Upload and Organization
1. **Access Documents**
   - Navigate to "Documents" in main menu
   - View document categories

2. **Upload Documents**
   - Click "Upload Document"
   - Select file and configure:
     - **Document Type**: Contract, Compliance, Technical, General
     - **Client**: Associated client
     - **Description**: Document description
     - **Access Level**: Public, Private, Restricted

3. **Document Categories**
   - **Contracts**: Legal agreements and amendments
   - **Compliance**: Regulatory and compliance documents
   - **Technical**: Technical specifications and documentation
   - **General**: Other business documents

#### Document Version Control
1. **Version Management**
   - Upload new versions of existing documents
   - Track version history and changes
   - Compare document versions

2. **Access Control**
   - Set document permissions
   - Control who can view, edit, or download
   - Audit document access

### 8. Reports and Analytics - Step by Step

#### Generating Financial Reports
1. **Access Reports**
   - Navigate to "Reports" in main menu
   - Select "Financial Reports" section

2. **Create Financial Report**
   - Click "Generate Financial Report"
   - Select report parameters:
     - **Date Range**: Reporting period
     - **Client Filter**: Specific clients or all
     - **Report Type**: Revenue, Costs, Profit/Loss

3. **Export Reports**
   - Download reports in PDF, Excel, or CSV format
   - Schedule automated report generation
   - Share reports with stakeholders

#### Client Performance Reports
1. **Client Analytics**
   - Select "Client Reports" section
   - Choose client performance metrics

2. **Service Utilization Reports**
   - Track service delivery performance
   - Monitor SLA compliance
   - Analyze client satisfaction metrics

### 9. Settings and Configuration - Step by Step

#### User Profile Management
1. **Access Settings**
   - Navigate to "Settings" in main menu
   - View user profile section

2. **Update Profile**
   - Modify personal information
   - Change password
   - Set notification preferences

3. **Security Settings**
   - Enable two-factor authentication
   - Review login history
   - Manage API access tokens

#### System Configuration
1. **Application Settings**
   - Configure system-wide preferences
   - Set default values for forms
   - Manage currency and localization

2. **Integration Settings**
   - Configure external system connections
   - Manage API credentials
   - Set sync schedules

### 10. External Systems Integration - Step by Step

#### Setting Up External System Integration
1. **Access External Systems**
   - Navigate to "External Systems" in main menu (if available in navigation)
   - Or access via client detail pages → "External Systems" tab

2. **Configure External System**
   - Click "Add New System"
   - Fill in system configuration:
     - **Name**: "Production Jira"
     - **Base URL**: "https://company.atlassian.net"
     - **Auth Type**: Basic, Bearer, or API Key
     - **Credentials**: Username/password or API tokens

3. **Test Connection**
   - Click "Test Connection" to validate setup
   - Review sample data returned
   - Verify authentication is working

#### Creating Client Mappings
1. **Map Client to External System**
   - Go to client detail page
   - Click "External Systems" tab
   - Click "Add Mapping"

2. **Configure Mapping**
   - Select external system
   - Enter external identifier (e.g., Jira project key)
   - Add metadata configuration:
     ```json
     {
       "projectKey": "ACME",
       "customJql": "project = ACME AND priority = High"
     }
     ```

3. **View Aggregated Data**
   - Data appears automatically in the External Systems tab
   - Use refresh button for real-time updates
   - Monitor system health and response times

#### Using the Main Aggregation Endpoint
1. **API Access**
   - Use the main endpoint: `GET /api/clients/{clientId}/aggregated-data`
   - Returns consolidated data from all mapped external systems
   - Includes success/failure status for each system

2. **Response Format**
   - JSON response with data from each system
   - Error handling for failed systems
   - Performance metrics and response times

### Quick Start Checklist

#### Essential Setup (First 30 minutes)
- [ ] Create your first client
- [ ] Add a service to the catalog
- [ ] Create a contract for the client
- [ ] Record a financial transaction
- [ ] Upload a document
- [ ] Set up a team member

#### Advanced Setup (Next hour)
- [ ] Configure Integration Engine data source
- [ ] Create dashboard widgets
- [ ] Set up external system integration
- [ ] Generate your first report
- [ ] Configure automated sync schedules

#### Power User Features (Ongoing)
- [ ] Create custom dashboard layouts
- [ ] Set up automated reporting
- [ ] Configure complex external system mappings
- [ ] Implement advanced field mappings
- [ ] Optimize widget performance

### Navigation Quick Reference

| Feature | Location | Icon | Description |
|---------|----------|------|-------------|
| Dashboard | `/` | 📊 | Overview and widgets |
| Clients | `/clients` | 🏢 | Client management |
| Contracts | `/contracts` | 📄 | Contract lifecycle |
| Proposals | `/proposals` | 📖 | Proposal management |
| Service Scopes | `/service-scopes` | 🎯 | Service delivery |
| Services | `/services` | ⚙️ | Service catalog |
| Assets | `/assets` | 🖥️ | Hardware & licenses |
| Financial | `/financial` | 💰 | Financial tracking |
| Team | `/team` | 👥 | Team management |
| Documents | `/documents` | 📁 | Document management |
| Integration Engine | `/integration-engine` | ⚡ | API integrations |
| Reports | `/reports` | 📈 | Analytics & reporting |
| Settings | `/settings` | ⚙️ | Configuration |

## Known Issues

### Critical Issues
1. **Session Persistence**: Users experience 401 errors after login due to session synchronization problems
2. **Database Schema Mismatches**: Some tables have column discrepancies requiring manual fixes
3. **TypeScript Errors**: Form validation and type mismatches in several components

### Minor Issues
1. **Status Badge Styling**: Recently fixed - removed grey backgrounds
2. **Navigation Consistency**: Recently fixed - standardized AppLayout usage
3. **Loading States**: Some components lack proper loading indicators

### Performance Considerations
1. **Database Queries**: Some queries could benefit from optimization
2. **Frontend Bundle Size**: Large component library affects initial load
3. **Session Store**: Database-backed sessions may impact performance

## Development Guidelines

### Code Organization
- **Shared Types**: All database types in `shared/schema.ts`
- **API Layer**: Consistent API patterns in `server/routes.ts`
- **Component Structure**: Reusable components with TypeScript
- **Form Handling**: React Hook Form with Zod validation

### Database Changes
1. Update schema in `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Never use manual SQL migrations
4. Always update TypeScript types

### Authentication Flow
1. User submits login form
2. Passport.js validates credentials
3. Session created and stored in database
4. Subsequent requests use session cookie
5. API routes check authentication via middleware

### State Management
- **Server State**: TanStack Query for API data
- **Form State**: React Hook Form for form management
- **UI State**: React useState for component state

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/register` - User registration
- `GET /api/user` - Get current user

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Contracts
- `GET /api/contracts` - List all contracts
- `POST /api/contracts` - Create new contract
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Financial Transactions
- `GET /api/financial-transactions` - List transactions
- `POST /api/financial-transactions` - Create transaction
- `PUT /api/financial-transactions/:id` - Update transaction

### External Systems Integration
- `GET /api/clients/:id/aggregated-data` - **Main aggregation endpoint** - Get consolidated data from all mapped external systems for a client
- `GET /api/external-systems` - List all configured external systems
- `POST /api/external-systems` - Create new external system configuration
- `PUT /api/external-systems/:id` - Update external system configuration
- `DELETE /api/external-systems/:id` - Delete external system configuration
- `GET /api/clients/:id/external-mappings` - Get client's external system mappings
- `POST /api/clients/:id/external-mappings` - Create new client-system mapping
- `PUT /api/external-mappings/:id` - Update external mapping
- `DELETE /api/external-mappings/:id` - Delete external mapping

### Integration Engine & Dashboard Widgets
- `GET /api/data-sources` - List all data sources
- `POST /api/data-sources` - Create new data source
- `PUT /api/data-sources/:id` - Update data source
- `DELETE /api/data-sources/:id` - Delete data source
- `POST /api/data-sources/:id/test` - Test data source connection
- `POST /api/data-sources/:id/sync` - Trigger data synchronization
- `GET /api/data-source-mappings` - List field mappings
- `POST /api/data-source-mappings` - Create field mapping
- `PUT /api/data-source-mappings/:id` - Update field mapping
- `DELETE /api/data-source-mappings/:id` - Delete field mapping
- `GET /api/dashboard-widgets` - List dashboard widgets
- `POST /api/dashboard-widgets` - Create dashboard widget
- `PUT /api/dashboard-widgets/:id` - Update dashboard widget
- `DELETE /api/dashboard-widgets/:id` - Delete dashboard widget
- `GET /api/dashboard-widgets/:id/data` - Get widget data

### Bulk Data Import
- `POST /api/bulk-import` - **Main import endpoint** - Upload and process CSV files for bulk data import
  - **Form Data**: `file` (CSV file), `type` (import type: clients, contracts, services, service-scopes, safs, cocs)
  - **Response**: Import results with success/failure counts and error details

### Proposals Management
- `GET /api/proposals` - List all proposals
- `POST /api/proposals` - Create new proposal
- `PUT /api/proposals/:id` - Update proposal
- `DELETE /api/proposals/:id` - Delete proposal
- `GET /api/proposals/:id/documents` - Get proposal documents
- `POST /api/proposals/:id/documents` - Upload proposal document

### Service Scopes Management
- `GET /api/service-scopes` - List all service scopes
- `POST /api/service-scopes` - Create new service scope
- `PUT /api/service-scopes/:id` - Update service scope
- `DELETE /api/service-scopes/:id` - Delete service scope
- `GET /api/service-scopes/:id/deliverables` - Get scope deliverables

### Asset Management
- `GET /api/hardware-assets` - List all hardware assets
- `POST /api/hardware-assets` - Create new hardware asset
- `PUT /api/hardware-assets/:id` - Update hardware asset
- `DELETE /api/hardware-assets/:id` - Delete hardware asset
- `GET /api/license-pools` - List all license pools
- `POST /api/license-pools` - Create new license pool
- `PUT /api/license-pools/:id` - Update license pool
- `DELETE /api/license-pools/:id` - Delete license pool
- `GET /api/client-licenses` - List client license assignments
- `POST /api/client-licenses` - Assign license to client
- `DELETE /api/client-licenses/:id` - Remove license assignment

### Team Management
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/client-team-assignments` - List team assignments
- `POST /api/client-team-assignments` - Create team assignment
- `PUT /api/client-team-assignments/:id` - Update assignment
- `DELETE /api/client-team-assignments/:id` - Remove assignment

### Document Management
- `GET /api/documents` - List all documents
- `POST /api/documents` - Upload new document
- `PUT /api/documents/:id` - Update document metadata
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/download` - Download document
- `GET /api/documents/:id/preview` - Preview document (if supported)
- `GET /api/clients/:id/documents` - Get client-specific documents

### Reports & Analytics
- `GET /api/reports/financial` - Generate financial reports
- `GET /api/reports/clients` - Generate client reports
- `GET /api/reports/services` - Generate service utilization reports
- `GET /api/reports/security` - Generate security reports
- `POST /api/reports/custom` - Generate custom reports
- `GET /api/analytics/dashboard` - Get dashboard analytics data

### System & Configuration
- `GET /api/system/health` - System health check
- `GET /api/system/datasources` - Get available data sources for reports
- `GET /api/user-settings` - Get user settings
- `PUT /api/user-settings` - Update user settings
- `POST /api/auth/change-password` - Change user password
- `POST /api/auth/setup-2fa` - Setup two-factor authentication

### Other Endpoints
- Similar CRUD patterns for all other entities
- All endpoints require authentication
- Consistent error handling and validation
- **New**: External systems endpoints support JSON configuration and real-time data aggregation
- **New**: Integration Engine endpoints for complete data pipeline management
- **New**: Dashboard widget endpoints for dynamic visualization creation

## Installation & Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Environment variables configured

### Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/mssp_production
PGHOST=localhost
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=mssp_production

# Session Configuration
SESSION_SECRET=your-secure-random-string-min-32-chars

# Application Configuration
NODE_ENV=production
PORT=5000

# External Systems Integration (Optional)
# These can be configured via UI, but environment variables provide defaults
EXTERNAL_API_TIMEOUT=10000
EXTERNAL_API_MAX_RETRIES=3
EXTERNAL_API_RATE_LIMIT=100

# Bulk Import Configuration
BULK_IMPORT_MAX_FILE_SIZE=10485760
BULK_IMPORT_ALLOWED_TYPES=text/csv,application/vnd.ms-excel
BULK_IMPORT_MAX_RECORDS_PER_BATCH=1000

# Example External System Credentials (Configure via UI instead)
# JIRA_BASE_URL=https://company.atlassian.net
# JIRA_USERNAME=api-user@company.com
# JIRA_API_TOKEN=your-jira-api-token
# GRAFANA_BASE_URL=https://grafana.company.com
# GRAFANA_API_KEY=your-grafana-api-key
```

### Development Installation
1. Clone repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL database
4. Configure environment variables
5. **Run comprehensive sync**: `npm run sync:production`
6. Start development server: `npm run dev`

### Essential Commands
- `npm run sync:production` - **Complete database setup, schema sync, and build** (replaces multiple scripts)
- `npm run dev` - Start development server
- `npm run build` - Build for production only
- `npm run start` - Start production server

### Simplified Database Management

**NEW: All-in-One Database Sync**
```bash
# This single command does EVERYTHING:
npm run sync:production
```

**What it includes:**
- ✅ Database connection testing
- ✅ Automatic database backup
- ✅ Schema versioning setup
- ✅ Version checking and updates
- ✅ Schema synchronization with Drizzle
- ✅ Application building
- ✅ Health endpoint testing
- ✅ Deployment summary generation

**OLD Commands (deprecated):**
- ❌ `npm run db:push` - Use `npm run sync:production` instead
- ❌ `npm run db:schema-setup` - Included in sync
- ❌ `npm run db:compare` - Included in sync
- ❌ `npm run db:check` - Included in sync

**Time Savings:**
- **Before**: 5+ commands, manual checks, 3-5 minutes
- **Now**: 1 command, fully automated, 15-30 seconds

### Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database (includes new external systems tables)
- `npm run build` - Build for production

### New Features in Latest Version
- **API Aggregator**: Dynamic external systems integration
- **External Systems Management**: Configure Jira, Grafana, ServiceNow, and custom systems
- **Client Data Consolidation**: Single endpoint for all external client data
- **Parallel Processing**: Concurrent API calls with timeout protection
- **Real-time Integration**: Live data from multiple external sources
- **Bulk Data Import**: CSV file upload for clients, contracts, services, SAFs, and COCs
- **Enhanced Client Management**: Comprehensive SAF and COC tracking with expiry monitoring
- **Improved Client Details**: Integrated external systems data and document management
- **Template Downloads**: Pre-formatted CSV templates with example data
- **Advanced Validation**: Data integrity checks and error reporting

### Quick Start Guide for External Systems Integration

#### 1. Access External Systems Management
```bash
# Start the development server
npm run dev

# Navigate to http://localhost:5000/external-systems
```

#### 2. Configure Your First External System (Jira Example)
1. Click "Add New System"
2. Fill in the configuration:
   - **Name**: "Production Jira"
   - **Base URL**: "https://your-company.atlassian.net"
   - **Auth Type**: "basic"
   - **Username**: "your-email@company.com"
   - **Password/Token**: "your-jira-api-token"
3. Click "Save System"

#### 3. Map Client to External System
1. Go to any client detail page
2. Click the "External Systems" tab
3. Click "Add Mapping"
4. Select your configured system
5. Enter the external identifier (e.g., Jira project key "ACME")
6. Click "Save Mapping"

#### 4. View Aggregated Data
- The aggregated data will automatically appear in the External Systems tab
- Use the refresh button to get real-time updates
- Check the main aggregation endpoint: `GET /api/clients/{clientId}/aggregated-data`

#### 5. Test the API Directly
```bash
# Test the aggregation endpoint
curl -X GET "http://localhost:5000/api/clients/1/aggregated-data" \
  -H "Content-Type: application/json" \
  -b "your-session-cookie"
```

## Deployment Guide

### Production Architecture

The application is designed as a monolithic full-stack application with the following deployment structure:

```
Production Server
├── Node.js Application (Express + React)
├── PostgreSQL Database
├── Session Store (PostgreSQL)
├── Static File Serving (Vite Build)
└── Process Management (PM2/Docker)
```

### Deployment Options

#### Option 1: Traditional VPS/Cloud Server

**Server Requirements:**
- Ubuntu 20.04+ or CentOS 8+
- 2+ CPU cores
- 4GB+ RAM
- 50GB+ storage
- Node.js 20+
- PostgreSQL 13+

**Deployment Steps:**

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Database Setup**
```bash
# Create database user and database
sudo -u postgres psql
CREATE USER mssp_user WITH PASSWORD 'secure_password';
CREATE DATABASE mssp_production OWNER mssp_user;
GRANT ALL PRIVILEGES ON DATABASE mssp_production TO mssp_user;
\q
```

3. **Application Deployment**
```bash
# Clone repository
git clone <repository-url>
cd mssp-platform

# Install dependencies
npm ci --production

# Complete database setup and build application
npm run sync:production

# Configure environment variables
sudo nano /etc/environment
# Add all required environment variables

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'mssp-platform',
    script: 'server/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **Nginx Reverse Proxy Setup**
```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/mssp-platform

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/mssp-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Option 2: Docker Deployment

**Dockerfile**
```dockerfile
# Create Dockerfile in project root
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --production

# Copy application code
COPY . .

# Build application
RUN npm run build

EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://mssp_user:secure_password@db:5432/mssp_production
      - SESSION_SECRET=your-secure-session-secret
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=mssp_production
      - POSTGRES_USER=mssp_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

**Deploy with Docker Compose:**
```bash
# Clone repository
git clone <repository-url>
cd mssp-platform

# Create environment file
cp .env.example .env
# Edit .env with production values

# Deploy
docker-compose up -d

# Run comprehensive database setup and sync
docker-compose exec app npm run sync:production
```

#### Option 3: Cloud Platform Deployment

**Heroku**
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secure-session-secret

# Deploy
git push heroku main

# Run comprehensive database setup and sync
heroku run npm run sync:production
```

**Railway/Render/DigitalOcean App Platform**
- Similar process with platform-specific configuration
- Automatic builds from Git repository
- Managed PostgreSQL databases available

### Production Environment Variables

```bash
# Required Environment Variables
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=minimum-32-character-random-string

# Optional Configuration
TRUST_PROXY=true
CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=info
MAX_FILE_SIZE=50mb
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Database Management

**Backup Strategy:**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
rm backup_$DATE.sql
```

**Monitoring Queries:**
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size('mssp_production'));

-- Table sizes
SELECT schemaname,tablename,pg_size_pretty(size) as size
FROM (
  SELECT schemaname,tablename,pg_relation_size(tablename::text) as size
  FROM pg_tables WHERE schemaname NOT IN ('information_schema','pg_catalog')
) t ORDER BY size DESC;
```

### Security Checklist

**Production Security:**
- [ ] Change default session secret
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall (UFW/iptables)
- [ ] Set up fail2ban for SSH protection
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] Environment variable protection
- [ ] CORS configuration
- [ ] Rate limiting implementation
- [ ] Security headers (Helmet.js)

### Monitoring & Maintenance

**Application Monitoring:**
```bash
# PM2 monitoring
pm2 monit

# System monitoring
htop
iotop
netstat -tulpn

# Application logs
pm2 logs
tail -f /var/log/nginx/access.log
```

**Health Checks:**
```bash
# API health check endpoint
curl https://your-domain.com/api/health

# Database connectivity
psql $DATABASE_URL -c "SELECT 1;"
```

### Scaling Considerations

**Horizontal Scaling:**
- Load balancer (Nginx/HAProxy)
- Multiple application instances
- Database read replicas
- Session store clustering (Redis)

**Vertical Scaling:**
- Increase server resources
- Database performance tuning
- Application optimization
- CDN for static assets

### Troubleshooting

**Common Issues:**
1. **Session Issues**: Check database connectivity and session store
2. **Database Connections**: Monitor connection pool limits
3. **Memory Leaks**: Use PM2 memory restart limits
4. **SSL Problems**: Verify certificate chain and renewal
5. **Performance**: Monitor query execution times and optimize

**Log Locations:**
- Application: PM2 logs or Docker logs
- Nginx: `/var/log/nginx/`
- PostgreSQL: `/var/log/postgresql/`
- System: `/var/log/syslog`

## Security Considerations

### Authentication Security
- Password hashing with scrypt
- Secure session management
- CSRF protection via session tokens
- Secure cookie configuration

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention via Drizzle ORM
- Role-based access control
- Audit logging for sensitive operations

### Known Security Issues
1. Session hijacking vulnerability due to session persistence issues
2. Need for HTTPS enforcement in production
3. Rate limiting not implemented for API endpoints

### 6. Enhanced Client Detail Management - Step by Step

#### Viewing Comprehensive Client Information
1. **Navigate to Client Details**
   - Go to Clients page
   - Click on any client name or "View Details"
   - You'll see the enhanced client detail page

2. **Client Overview Section**
   - View basic client information (industry, size, status)
   - See contact information and website
   - Review client notes and address
   - Check client source and acquisition method

3. **Service Authorization Forms (SAF) Management**
   - Click the "SAFs" tab to view all authorization forms
   - See SAF numbers, titles, and approval status
   - View authorization values and date ranges
   - Download SAF documents if available
   - Track approval workflow and status changes

4. **Certificates of Compliance (COC) Tracking**
   - Click the "COCs" tab to view compliance certificates
   - Monitor certificate expiry dates and renewal needs
   - View compliance types (SOC2, ISO27001, HIPAA, etc.)
   - Track audit dates and next audit schedules
   - Download compliance certificates

5. **External Systems Integration**
   - Click the "External Systems" tab
   - View real-time data from connected external systems
   - See aggregated information from Jira, Grafana, ServiceNow
   - Configure new external system mappings
   - Monitor API connection status and data freshness

6. **Service Scopes and Deliverables**
   - Click the "Services" tab to view active service scopes
   - See detailed service descriptions and deliverables
   - Track service timelines and milestones
   - Monitor service status and completion

7. **Document Management**
   - Click the "Documents" tab to access all client documents
   - Upload new documents with categorization
   - Download existing documents and contracts
   - View document versions and change history
   - Manage document access permissions

#### Adding New Client Data
1. **Adding Service Authorization Forms**
   - Navigate to Service Scopes page
   - Click "Create SAF" for the relevant scope
   - Fill in SAF details (number, title, dates, value)
   - Upload authorization document
   - Set approval workflow and status

2. **Adding Compliance Certificates**
   - Navigate to the COCs section
   - Click "Create COC" 
   - Enter certificate details (type, issue/expiry dates)
   - Link to related SAF or service scope
   - Upload certificate document
   - Set audit schedule and reminders

3. **Configuring External System Integration**
   - Go to External Systems page
   - Add new external system configuration
   - Set up authentication (API keys, tokens)
   - Configure data mapping for the client
   - Test connection and data retrieval
   - Enable real-time data aggregation

---

This platform represents a comprehensive MSSP management solution with room for continued development and optimization. The architecture supports scalability and maintainability while providing robust business functionality.