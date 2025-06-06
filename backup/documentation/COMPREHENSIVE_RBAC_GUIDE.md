# Comprehensive Role-Based Access Control (RBAC) Guide

## Table of Contents
1. [User Roles & Types](#user-roles--types)
2. [Permission Matrix](#permission-matrix)
3. [Page Access Control](#page-access-control)
4. [Implementation Architecture](#implementation-architecture)
5. [Testing Strategy](#testing-strategy)
6. [API Endpoint Protection](#api-endpoint-protection)
7. [Frontend Component Guards](#frontend-component-guards)
8. [Implementation Examples](#implementation-examples)

## User Roles & Types

### 1. **Admin** (Super Administrator)
- **Full system access and control**
- Can manage all users, settings, and data
- Access to audit logs and system configuration
- Can perform all CRUD operations on all entities

### 2. **Manager** (Management Level)
- **Client relationship management focus**
- Can manage clients, contracts, and financial data
- Can view reports and analytics
- Can manage team assignments for their clients
- Limited access to system configuration

### 3. **Engineer** (Technical Staff)
- **Technical service delivery focus**
- Can manage service scopes and technical implementations
- Can access client technical data and assets
- Can create and update technical documentation
- Read-only access to contracts and financial data

### 4. **User** (General Staff)
- **Basic access for general operations**
- Can view assigned clients and basic information
- Can update basic client information
- Read-only access to most data
- Cannot access financial or sensitive information

## Permission Matrix

| Feature Area | Admin | Manager | Engineer | User |
|--------------|-------|---------|----------|------|
| **User Management** | ✅ Full | ❌ None | ❌ None | ❌ None |
| **Client Management** | ✅ Full | ✅ Full | 📖 Read + Assigned | 📖 Read + Assigned |
| **Contract Management** | ✅ Full | ✅ Full | 📖 Read Only | 📖 Read Only |
| **Service Management** | ✅ Full | 📖 Read Only | ✅ Technical Only | 📖 Read Only |
| **Financial Data** | ✅ Full | ✅ Full | ❌ None | ❌ None |
| **Reports & Analytics** | ✅ Full | ✅ Full | 📊 Technical Reports | 📖 Basic Reports |
| **Hardware Assets** | ✅ Full | ✅ Management | ✅ Technical | 📖 Read Only |
| **License Management** | ✅ Full | ✅ Full | ✅ Technical | 📖 Read Only |
| **Team Management** | ✅ Full | ✅ Assignments | 📖 View Only | 📖 View Only |
| **Settings & Config** | ✅ Full | ⚙️ Limited | ❌ None | ❌ None |
| **Audit Logs** | ✅ Full | 📖 Read Only | ❌ None | ❌ None |
| **External Systems** | ✅ Full | ⚙️ Limited | ✅ Technical | ❌ None |
| **Bulk Operations** | ✅ Full | ✅ Client Data | ❌ None | ❌ None |

**Legend:**
- ✅ Full = Create, Read, Update, Delete
- 📖 Read Only = View access only
- ⚙️ Limited = Specific functionality only
- 📊 Technical Reports = Service/technical reports only
- ❌ None = No access

## Page Access Control

### **Admin Access (All Pages)**
```
✅ Dashboard
✅ Clients (Full CRUD)
✅ Contracts (Full CRUD)
✅ Services (Full CRUD + Configuration)
✅ Financial (Full Access)
✅ Assets (Full CRUD)
✅ Team Management (Full CRUD)
✅ Reports (All Reports)
✅ Settings (Full Configuration)
✅ External Systems (Full Configuration)
✅ Bulk Import (All Operations)
✅ User Management
✅ Audit Logs
```

### **Manager Access**
```
✅ Dashboard (Business Focus)
✅ Clients (Full CRUD)
✅ Contracts (Full CRUD)
✅ Services (Read Only)
✅ Financial (Full Access)
✅ Assets (Management View)
✅ Team Management (Assignment Only)
✅ Reports (Business & Financial)
⚙️ Settings (User Preferences Only)
❌ External Systems
✅ Bulk Import (Client Data Only)
❌ User Management
📖 Audit Logs (Read Only)
```

### **Engineer Access**
```
✅ Dashboard (Technical Focus)
📖 Clients (Assigned Clients + Technical Data)
📖 Contracts (Read Only)
✅ Services (Technical Management)
❌ Financial
✅ Assets (Technical Management)
📖 Team Management (View Only)
📊 Reports (Technical Reports Only)
❌ Settings
✅ External Systems (Technical Configuration)
❌ Bulk Import
❌ User Management
❌ Audit Logs
```

### **User Access**
```
📖 Dashboard (Basic View)
📖 Clients (Assigned Clients - Basic Info)
📖 Contracts (Read Only - Basic Info)
📖 Services (Read Only)
❌ Financial
📖 Assets (Read Only)
📖 Team Management (View Only)
📖 Reports (Basic Reports Only)
❌ Settings
❌ External Systems
❌ Bulk Import
❌ User Management
❌ Audit Logs
```

## Implementation Architecture

### 1. **Backend Role Middleware**

Create role-based middleware functions:

```typescript
// Role checking middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: "Insufficient permissions",
        required: allowedRoles,
        current: userRole,
        code: "INSUFFICIENT_PERMISSIONS"
      });
    }

    next();
  };
};

// Convenience functions
export const requireAdmin = () => requireRole(['admin']);
export const requireManagerOrAbove = () => requireRole(['admin', 'manager']);
export const requireEngineerOrAbove = () => requireRole(['admin', 'manager', 'engineer']);
export const requireAnyRole = () => requireRole(['admin', 'manager', 'engineer', 'user']);
```

### 2. **Frontend Route Protection**

Create route guards for page-level access control:

```typescript
interface RouteGuardProps {
  allowedRoles: string[];
  fallbackPath?: string;
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  allowedRoles, 
  fallbackPath = '/unauthorized', 
  children 
}) => {
  const { user, hasAnyRole } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
};
```

### 3. **Component-Level Guards**

Create component guards for UI element protection:

```typescript
interface PermissionGuardProps {
  requiredRoles: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredRoles,
  fallback = null,
  children
}) => {
  const { hasAnyRole } = useAuth();
  
  if (!hasAnyRole(requiredRoles)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
```

## Testing Strategy

### 1. **Automated Role Testing**

Create comprehensive test suites for each role:

```typescript
// Example test structure
describe('RBAC System Tests', () => {
  describe('Admin Role', () => {
    test('should access all endpoints', async () => {
      // Test all API endpoints with admin user
    });
    
    test('should see all UI components', async () => {
      // Test UI visibility with admin user
    });
  });
  
  describe('Manager Role', () => {
    test('should access manager endpoints only', async () => {
      // Test manager-specific access
    });
    
    test('should be denied admin endpoints', async () => {
      // Test access denial
    });
  });
  
  // Similar tests for Engineer and User roles
});
```

### 2. **Manual Testing Checklist**

Create role-specific testing checklists:

```markdown
## Admin Role Testing
- [ ] Can access User Management
- [ ] Can modify system settings
- [ ] Can view audit logs
- [ ] Can perform all CRUD operations
- [ ] Can access all pages

## Manager Role Testing
- [ ] Cannot access User Management
- [ ] Can manage clients and contracts
- [ ] Can access financial data
- [ ] Cannot modify system settings
- [ ] Cannot view audit logs

## Engineer Role Testing
- [ ] Cannot access financial data
- [ ] Can manage technical services
- [ ] Can access assigned client technical data
- [ ] Cannot manage users or system settings

## User Role Testing
- [ ] Can only view assigned data
- [ ] Cannot access financial information
- [ ] Cannot perform administrative tasks
- [ ] Cannot access sensitive configurations
```

## API Endpoint Protection

### Protected Endpoint Examples

```typescript
// User Management (Admin Only)
app.get('/api/users', requireAdmin(), getUsersHandler);
app.post('/api/users', requireAdmin(), createUserHandler);
app.put('/api/users/:id', requireAdmin(), updateUserHandler);
app.delete('/api/users/:id', requireAdmin(), deleteUserHandler);

// Financial Data (Admin + Manager)
app.get('/api/financial', requireManagerOrAbove(), getFinancialHandler);
app.post('/api/financial', requireManagerOrAbove(), createFinancialHandler);

// Service Configuration (Admin Only)
app.put('/api/services/:id/scope-template', requireAdmin(), updateScopeTemplateHandler);

// Client Data (All authenticated users with data filtering)
app.get('/api/clients', requireAnyRole(), getClientsWithRoleFilterHandler);

// Technical Services (Admin + Engineer)
app.put('/api/services/:id/technical', requireRole(['admin', 'engineer']), updateTechnicalServiceHandler);
```

## Frontend Component Guards

### Navigation Menu Example

```typescript
const NavigationMenu = () => {
  const { isAdmin, isManager, isEngineer } = useAuth();
  
  return (
    <nav>
      <NavItem to="/dashboard">Dashboard</NavItem>
      <NavItem to="/clients">Clients</NavItem>
      
      <PermissionGuard requiredRoles={['admin', 'manager']}>
        <NavItem to="/contracts">Contracts</NavItem>
        <NavItem to="/financial">Financial</NavItem>
      </PermissionGuard>
      
      <PermissionGuard requiredRoles={['admin']}>
        <NavItem to="/users">User Management</NavItem>
        <NavItem to="/settings">Settings</NavItem>
        <NavItem to="/audit">Audit Logs</NavItem>
      </PermissionGuard>
      
      <PermissionGuard requiredRoles={['admin', 'engineer']}>
        <NavItem to="/services">Services</NavItem>
        <NavItem to="/external-systems">External Systems</NavItem>
      </PermissionGuard>
    </nav>
  );
};
```

### Button-Level Protection Example

```typescript
const ClientActionsPanel = ({ client }: { client: Client }) => {
  const { isAdmin, isManager } = useAuth();
  
  return (
    <div className="actions-panel">
      <Button variant="outline">View Details</Button>
      
      <PermissionGuard requiredRoles={['admin', 'manager']}>
        <Button>Edit Client</Button>
        <Button>Create Contract</Button>
      </PermissionGuard>
      
      <PermissionGuard requiredRoles={['admin']}>
        <Button variant="destructive">Delete Client</Button>
      </PermissionGuard>
    </div>
  );
};
```

## Implementation Examples

### 1. **Data Filtering by Role**

```typescript
// Backend: Filter data based on user role
const getClientsWithRoleFilter = async (req: Request, res: Response) => {
  const user = req.user!;
  let query = db.select().from(clients);
  
  // Users can only see assigned clients
  if (user.role === 'user') {
    query = query
      .innerJoin(clientTeamAssignments, eq(clients.id, clientTeamAssignments.clientId))
      .where(eq(clientTeamAssignments.userId, user.id));
  }
  
  // Engineers can see assigned clients + technical data
  if (user.role === 'engineer') {
    query = query
      .innerJoin(clientTeamAssignments, eq(clients.id, clientTeamAssignments.clientId))
      .where(eq(clientTeamAssignments.userId, user.id));
  }
  
  // Managers and Admins see all clients
  const clients = await query;
  res.json(clients);
};
```

### 2. **Dynamic UI Based on Permissions**

```typescript
const ServiceManagementPage = () => {
  const { isAdmin, isEngineer } = useAuth();
  
  return (
    <div>
      <h1>Service Management</h1>
      
      {/* All authenticated users can view services */}
      <ServicesList />
      
      {/* Only engineers and admins can manage technical aspects */}
      <PermissionGuard requiredRoles={['admin', 'engineer']}>
        <TechnicalConfigurationPanel />
      </PermissionGuard>
      
      {/* Only admins can configure scope templates */}
      <PermissionGuard requiredRoles={['admin']}>
        <ScopeTemplateBuilder />
      </PermissionGuard>
    </div>
  );
};
```

## Security Best Practices

### 1. **Defense in Depth**
- Backend API protection (primary)
- Frontend route guards (secondary)
- Component-level guards (tertiary)
- Database-level row security (where applicable)

### 2. **Principle of Least Privilege**
- Users start with minimal permissions
- Permissions are explicitly granted
- Regular permission audits

### 3. **Secure Defaults**
- New users default to 'user' role
- Sensitive operations require explicit permission
- Failed authorization attempts are logged

### 4. **Audit Trail**
- All permission checks are logged
- Role changes are tracked
- Access attempts are monitored

## Next Steps for Implementation

1. **Update Backend Routes** - Apply role middleware to all API endpoints
2. **Implement Frontend Guards** - Add route and component guards
3. **Create Test Suite** - Comprehensive role-based testing
4. **Update Documentation** - Document all protected resources
5. **User Training** - Train users on role-specific features
6. **Security Audit** - Regular review of permissions and access patterns

This RBAC system provides comprehensive security while maintaining usability for each user type in your MSSP Client Manager system. 