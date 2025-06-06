# Role-Based Access Control Implementation Guide

## Overview

This document describes the implementation of role-based access control (RBAC) for the Service Scope Definition Template system in the MSSP Client Manager platform.

## Security Model

### User Roles
The system supports the following user roles:
- **admin**: Full system access, can configure scope templates
- **manager**: Management-level access 
- **engineer**: Engineering-level access
- **user**: Basic user access (default)

### Access Levels
- **Public**: No authentication required
- **Authenticated**: Any logged-in user
- **Role-Based**: Specific roles required
- **Admin-Only**: Admin role required

## Implementation Details

### Backend Implementation

#### 1. Role-Based Middleware

```typescript
// Role-based authorization middleware
function requireRole(roles: string | string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(403).json({ message: "User role not found" });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Insufficient permissions",
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
}

// Convenience function for admin-only endpoints
function requireAdmin(req: any, res: any, next: any) {
  return requireRole('admin')(req, res, next);
}
```

#### 2. Protected Endpoints

The following endpoints now require admin access:

```typescript
// Service Scope Template Management (Admin-Only)
app.get("/api/services/:id/scope-template", requireAdmin, handler);
app.put("/api/services/:id/scope-template", requireAdmin, handler);
```

#### 3. Error Responses

When access is denied, the API returns structured error responses:

```json
{
  "message": "Insufficient permissions",
  "required": ["admin"],
  "current": "user"
}
```

### Frontend Implementation

#### 1. Auth Hook Enhancement

Extended the `useAuth` hook with role checking functions:

```typescript
interface AuthContextType {
  // Existing properties...
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isEngineer: () => boolean;
}
```

#### 2. Conditional UI Rendering

Services page now conditionally shows the Configure button:

```tsx
{isAdmin && (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleConfigure(service)}
    title="Configure service and scope template"
  >
    <Settings className="h-4 w-4" />
  </Button>
)}
```

#### 3. Route Protection

ServiceEditPage includes access control checks:

```tsx
// Access control check
useEffect(() => {
  if (!authLoading && !isAdmin) {
    toast({
      title: 'Access Denied',
      description: 'Admin access required to configure services and scope templates.',
      variant: 'destructive',
    });
    setLocation('/services');
  }
}, [authLoading, isAdmin, setLocation, toast]);
```

#### 4. Enhanced Error Handling

API calls include role-specific error handling:

```typescript
if (response.status === 403) {
  throw new Error('Admin access required to view scope templates');
}
```

## Testing

### Test Script

Run the role-based access control test:

```bash
node test-role-based-access.js
```

### Expected Results

| User Role | Services List | Scope Template GET | Scope Template PUT |
|-----------|---------------|-------------------|-------------------|
| Admin     | ✅ Access     | ✅ Access         | ✅ Access         |
| User      | ✅ Access     | ❌ Denied         | ❌ Denied         |
| Guest     | ❌ Denied     | ❌ Denied         | ❌ Denied         |

### Manual Testing

1. **Admin User Testing**:
   - Login as admin
   - Navigate to Services page
   - Verify Configure button is visible
   - Click Configure button
   - Verify access to scope template builder
   - Test template save functionality

2. **Regular User Testing**:
   - Login as regular user
   - Navigate to Services page
   - Verify Configure button is hidden
   - Attempt direct URL access to `/services/1/edit`
   - Verify redirect to services page with error message

## Security Considerations

### 1. Defense in Depth
- **Frontend**: UI elements hidden for unauthorized users
- **Backend**: API endpoints protected with middleware
- **Route Protection**: Frontend routes check permissions

### 2. Error Information
- Error messages indicate permission requirements
- Current user role included in responses for debugging
- No sensitive information exposed in error responses

### 3. Session Management
- Role checking occurs on every request
- No client-side role caching that could be manipulated
- Server-side session validation required

## Future Enhancements

### 1. Granular Permissions
Consider implementing more granular permissions:
- Read-only template access for managers
- Service-specific permissions
- Field-level access control

### 2. Audit Logging
All role-based access attempts should be logged:
- Successful admin access to templates
- Failed permission attempts
- Role changes and escalations

### 3. Role Hierarchies
Implement role inheritance:
- Admin inherits all lower role permissions
- Manager inherits engineer and user permissions
- Engineer inherits user permissions

## Troubleshooting

### Common Issues

1. **403 Forbidden Errors**
   - Check user role in database
   - Verify session is active
   - Confirm middleware is applied correctly

2. **UI Elements Not Hiding**
   - Check auth hook implementation
   - Verify role checking logic
   - Ensure component re-renders on auth changes

3. **Infinite Redirects**
   - Check access control logic in useEffect
   - Verify dependency array includes all required values
   - Ensure toast doesn't trigger re-renders

### Debug Commands

```bash
# Check user roles in database
psql -d mssp_db -c "SELECT username, email, role FROM users;"

# Test API endpoints directly
curl -X GET http://localhost:5001/api/services/1/scope-template \
  -H "Cookie: session=..." \
  -v

# Monitor server logs for role checking
tail -f server.log | grep -i "role\|permission\|auth"
```

## Deployment Checklist

Before deploying role-based access control:

- [ ] All admin users have correct role in database
- [ ] Test scripts pass for all user roles
- [ ] Frontend components conditionally render based on roles
- [ ] API endpoints properly protected
- [ ] Error handling provides clear feedback
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Backup admin account configured

## Related Files

### Backend
- `server/routes.ts` - Role middleware and protected endpoints
- `shared/schema.ts` - User role definitions

### Frontend
- `client/src/hooks/use-auth.tsx` - Auth hook with role checking
- `client/src/pages/services-page.tsx` - Conditional UI rendering
- `client/src/components/admin/services/service-edit-page.tsx` - Route protection
- `client/src/lib/api.ts` - Enhanced error handling

### Testing
- `test-role-based-access.js` - Comprehensive access control tests
- `ROLE_BASED_ACCESS_CONTROL_GUIDE.md` - This documentation

## Support

For questions about role-based access control implementation:
1. Review this documentation
2. Check the test scripts and expected results
3. Verify user roles in the database
4. Review server logs for authentication issues
5. Test with known admin and user accounts 