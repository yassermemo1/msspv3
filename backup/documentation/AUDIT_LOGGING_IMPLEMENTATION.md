# Audit Logging & Change History Implementation

## Overview

This document describes the comprehensive audit logging and change history system implemented for the MSSP Client Management platform. The system provides complete compliance tracking, security audit trails, and git-like change history with rollback capabilities.

## Impact & Compliance

**Impact**: High - Security & Compliance Critical  
**Effort**: Low-Medium  
**Compliance Standards**: SOC 2, ISO 27001, GDPR, HIPAA-compatible

## Features Implemented

### 1. **System Activity Logs**
- Comprehensive tracking of all user actions (create, update, delete)
- Automatic logging with metadata capture
- Severity-based categorization (info, low, medium, high, critical)
- Category classification (authentication, data_access, data_modification, security, compliance, system)

### 2. **Login/Logout Tracking**
- Security event logging for authentication attempts
- Success/failure tracking with failure reason capture
- Risk scoring for suspicious activities
- IP address and user agent tracking
- Session management and duration tracking

### 3. **Data Access Logs**
- Who accessed what client data when
- Scope tracking (full, partial, summary)
- Purpose documentation for sensitive data access
- Access method classification (web_ui, api, bulk_export, etc.)
- Sensitive data flags for GDPR/HIPAA compliance

### 4. **Change History (Git-like)**
- Before/after value tracking for all data changes
- Field-level granular change tracking
- Batch operation grouping
- Rollback capabilities with safety checks
- Automatic change reason capturing
- Commit-like batch operations

### 5. **Security Events**
- Failed login attempts with risk scoring
- Suspicious IP tracking
- Blocked activities logging
- Location-based anomaly detection
- Automated threat response logging

## Database Schema

### Core Audit Tables

```sql
-- Main audit log for all system activities
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INTEGER,
  entity_name VARCHAR(255),
  description TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  category VARCHAR(50) NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Detailed change history with rollback support
CREATE TABLE change_history (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INTEGER NOT NULL,
  entity_name VARCHAR(255),
  user_id INTEGER NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT,
  automatic_change BOOLEAN DEFAULT FALSE,
  batch_id VARCHAR(100),
  rollback_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Security-specific events
CREATE TABLE security_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL,
  source VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  location VARCHAR(255),
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  risk_score INTEGER DEFAULT 0,
  blocked BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Data access logging for compliance
CREATE TABLE data_access_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  entity_type VARCHAR(100) NOT NULL,
  entity_id INTEGER,
  entity_name VARCHAR(255),
  access_type VARCHAR(50) NOT NULL,
  access_method VARCHAR(50) NOT NULL,
  data_scope VARCHAR(20) NOT NULL,
  result_count INTEGER DEFAULT 1,
  sensitive_data BOOLEAN DEFAULT FALSE,
  purpose TEXT,
  filters JSONB,
  session_duration INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- System-wide events
CREATE TABLE system_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  source VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  details JSONB,
  affected_entities JSONB,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- Change history indexes
CREATE INDEX idx_change_history_entity ON change_history(entity_type, entity_id);
CREATE INDEX idx_change_history_user_id ON change_history(user_id);
CREATE INDEX idx_change_history_timestamp ON change_history(timestamp DESC);
CREATE INDEX idx_change_history_batch_id ON change_history(batch_id);

-- Security events indexes
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);
CREATE INDEX idx_security_events_type ON security_events(event_type);

-- Data access logs indexes
CREATE INDEX idx_data_access_user_id ON data_access_logs(user_id);
CREATE INDEX idx_data_access_entity ON data_access_logs(entity_type, entity_id);
CREATE INDEX idx_data_access_timestamp ON data_access_logs(timestamp DESC);
CREATE INDEX idx_data_access_sensitive ON data_access_logs(sensitive_data);
```

## Backend Implementation

### Audit Service (`server/lib/audit.ts`)

The audit service provides a comprehensive logging framework with the following key components:

#### Core Functions
- **`logAudit()`** - Main audit logging function
- **`logSecurityEvent()`** - Security-specific event logging  
- **`logDataAccess()`** - Data access tracking
- **`logChange()`** - Change history with rollback data
- **`logSystemEvent()`** - System-wide event logging

#### AuditLogger Class
Enhanced logging class with method chaining and context management:

```typescript
const auditLogger = new AuditLogger(req, userId).setBatchId(generateBatchId());

// Log entity creation
await auditLogger.logCreate('client', clientId, clientName, clientData);

// Log field-level updates
await auditLogger.logUpdate('client', clientId, clientName, [
  { field: 'name', oldValue: 'Old Name', newValue: 'New Name' },
  { field: 'industry', oldValue: 'Tech', newValue: 'Finance' }
]);

// Log deletion with rollback data
await auditLogger.logDelete('client', clientId, clientName, fullClientData);
```

#### Automatic Change Detection
```typescript
// Utility to detect changes between objects
const changes = detectChanges(oldClientData, newClientData);
// Returns: [{ field: 'name', oldValue: 'Old', newValue: 'New' }]
```

### API Endpoints

#### Change History
- **GET** `/api/audit/change-history` - Retrieve change history with filtering
- **POST** `/api/audit/rollback/:changeId` - Rollback specific changes

#### Audit Logs
- **GET** `/api/audit/logs` - Retrieve audit logs with filtering

#### Security Events
- **GET** `/api/audit/security-events` - Retrieve security events

#### Data Access
- **GET** `/api/audit/data-access` - Retrieve data access logs

#### Filtering Support
All endpoints support comprehensive filtering:
- **Time filters**: today, week, month, quarter, all
- **Entity filters**: entityType, entityId
- **User filters**: specific user ID
- **Action filters**: create, update, delete, view, export
- **Search**: full-text search across relevant fields
- **Pagination**: limit, offset support

## Frontend Implementation

### History Timeline Component

The `HistoryTimeline` component (`client/src/components/ui/history-timeline.tsx`) provides a comprehensive view of all activity:

#### Features
- **Tabbed Interface**: Change History, Audit Logs, Security Events, Data Access
- **Advanced Filtering**: Time range, action type, user, search
- **Batch Operation Display**: Grouped changes with expand/collapse
- **Rollback Interface**: One-click rollback with confirmation
- **Real-time Updates**: Auto-refresh capabilities
- **Mobile Responsive**: Touch-friendly interface

#### Integration
```tsx
<HistoryTimeline 
  entityType="client"
  entityId={clientId}
  entityName={client?.name}
/>
```

### Client Detail Page Integration

Added as a new "History" tab in the client detail page with full context:
- All client-specific activities
- Related entity changes (contracts, services, etc.)
- User activity tracking
- Document access logs

## Security Features

### Access Control
- **Role-based permissions**: Admin/Manager for rollbacks
- **User context tracking**: All actions tied to authenticated users
- **IP-based monitoring**: Suspicious activity detection
- **Session management**: Session-based activity correlation

### Data Privacy
- **GDPR compliance**: Purpose tracking for data access
- **Sensitive data flags**: Special handling for PII/PHI
- **Data minimization**: Only relevant fields logged
- **Retention policies**: Configurable log retention

### Threat Detection
- **Risk scoring**: Automated threat assessment
- **Anomaly detection**: Unusual access patterns
- **Failed attempt tracking**: Brute force detection
- **Geolocation monitoring**: Location-based alerts

## Rollback System

### Git-like Functionality
The system provides git-like rollback capabilities:

#### Supported Operations
- **Field Updates**: Revert specific field changes
- **Record Deletion**: Mark deletion rollbacks (recreation requires manual intervention)
- **Batch Operations**: Rollback entire batch transactions

#### Safety Features
- **Permission checks**: Only admin/manager roles can rollback
- **Audit trail**: All rollbacks are logged
- **Rollback prevention**: Some operations cannot be automatically rolled back
- **Confirmation required**: UI confirmation for all rollback operations

#### Example Rollback Data
```json
{
  "action": "update",
  "entityType": "client", 
  "entityId": 123,
  "field": "name",
  "value": "Original Name",
  "fullData": { /* complete record snapshot */ }
}
```

## Compliance Benefits

### SOC 2 Type II
- **CC6.1**: Complete activity logging
- **CC6.2**: User access monitoring  
- **CC6.3**: Change management tracking
- **CC7.1**: System monitoring and logging

### ISO 27001
- **A.12.4.1**: Event logging procedures
- **A.12.4.2**: Protection of log information
- **A.12.4.3**: Administrator and operator logs
- **A.12.4.4**: Clock synchronization

### GDPR
- **Article 5**: Purpose limitation tracking
- **Article 25**: Data protection by design
- **Article 30**: Records of processing activities
- **Article 33**: Breach notification support

## Performance Optimization

### Database Optimizations
- **Strategic indexing**: Query-optimized indexes
- **Partitioning**: Time-based table partitioning for large datasets
- **Archival**: Automated old log archival
- **Compression**: JSONB compression for metadata

### Query Performance
- **Prepared statements**: Parameterized queries
- **Result limiting**: Pagination with reasonable defaults
- **Filter optimization**: Index-backed filtering
- **Caching**: Redis caching for frequent queries

## Usage Examples

### Basic Logging
```typescript
// In a route handler
const auditLogger = new AuditLogger(req, req.user.id);

// Log client access
await auditLogger.logView('client', clientId, clientName, 'full');

// Log client update
const changes = detectChanges(oldClient, newClient);
await auditLogger.logUpdate('client', clientId, clientName, changes, oldClient);
```

### Bulk Operations
```typescript
const batchId = generateBatchId();
const auditLogger = new AuditLogger(req, req.user.id).setBatchId(batchId);

// All operations in this batch will be grouped
await auditLogger.logBulkOperation('import', 'client', 50, 'Bulk client import from CSV');
```

### Security Monitoring
```typescript
// Failed login attempt
await auditLogger.logLogin(false, 'Invalid password');

// Successful login
await auditLogger.logLogin(true);

// Data export
await auditLogger.logExport('client', 'CSV', 100, { industry: 'Healthcare' });
```

## Testing

### Test Coverage
- **Unit tests**: All audit functions
- **Integration tests**: API endpoint testing
- **End-to-end tests**: UI workflow testing
- **Performance tests**: Large dataset handling

### Test Data
```javascript
// Example test for audit logging
test('should log client creation', async () => {
  const auditLogger = new AuditLogger(mockReq, userId);
  await auditLogger.logCreate('client', 123, 'Test Client', clientData);
  
  const logs = await db.query('SELECT * FROM audit_logs WHERE entity_id = $1', [123]);
  expect(logs.rows).toHaveLength(1);
  expect(logs.rows[0].action).toBe('create');
});
```

## Future Enhancements

### Planned Features
1. **AI-powered anomaly detection**: Machine learning for threat detection
2. **Real-time alerts**: Webhook-based notifications
3. **Advanced analytics**: Trend analysis and reporting
4. **Automated compliance reports**: SOC 2, ISO 27001 report generation
5. **API versioning**: Audit trail for API changes
6. **Blockchain integration**: Immutable audit trails

### Integration Opportunities
- **SIEM integration**: Export to security information systems
- **Compliance platforms**: Direct integration with GRC tools
- **Notification systems**: Slack, Teams, email alerts
- **Backup systems**: Automated audit log backup

## Deployment

### Migration Scripts
```sql
-- Run these migration scripts to add audit tables
-- See shared/schema.ts for complete table definitions
```

### Environment Variables
```env
# Audit retention settings
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years for compliance
CHANGE_HISTORY_RETENTION_DAYS=2555
SECURITY_EVENT_RETENTION_DAYS=2555

# Performance settings
AUDIT_BATCH_SIZE=1000
AUDIT_ASYNC_LOGGING=true

# Security settings
AUDIT_ENCRYPTION_KEY=your-encryption-key
AUDIT_INTEGRITY_CHECK=true
```

### Monitoring
- **Log volume monitoring**: Track audit log growth
- **Performance monitoring**: Query execution times
- **Error monitoring**: Failed audit operations
- **Compliance monitoring**: Coverage metrics

## Conclusion

This audit logging system provides enterprise-grade compliance tracking with git-like change management capabilities. It ensures complete visibility into all system activities while maintaining performance and usability.

The implementation supports major compliance frameworks and provides the foundation for advanced security monitoring and threat detection capabilities.

**Key Benefits:**
- ✅ Complete audit trail for compliance
- ✅ Git-like rollback capabilities  
- ✅ Real-time activity monitoring
- ✅ Advanced threat detection
- ✅ GDPR/HIPAA compliance support
- ✅ Performance optimized
- ✅ User-friendly interface
- ✅ Comprehensive API coverage 