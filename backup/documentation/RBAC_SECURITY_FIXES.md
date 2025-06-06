# RBAC Security Fixes - IMMEDIATE ACTION REQUIRED

## 🔴 Critical Security Vulnerabilities Found

### 1. Client Deletion Access Control Fix
**File:** `server/routes.ts` (Line ~316)
**Current Code:**
```javascript
app.delete("/api/clients/:id", requireAuth, async (req, res) => {
```
**Fixed Code:**
```javascript
app.delete("/api/clients/:id", requireManagerOrAbove, async (req, res) => {
```

### 2. Service Update Access Control Fix  
**File:** `server/routes.ts` (Line ~543)
**Current Code:**
```javascript
app.put("/api/services/:id", requireAuth, async (req, res) => {
```
**Fixed Code:**
```javascript
app.put("/api/services/:id", requireAdmin, async (req, res) => {
```

### 3. Service Deletion Access Control Fix
**File:** `server/routes.ts` (Line ~564)
**Current Code:**
```javascript
app.delete("/api/services/:id", requireAuth, async (req, res) => {
```
**Fixed Code:**
```javascript
app.delete("/api/services/:id", requireAdmin, async (req, res) => {
```

### 4. Contract Management RBAC Implementation
**File:** `server/routes.ts` (Lines ~352-450)
**Current Vulnerable Endpoints:**
```javascript
app.get("/api/contracts", requireAuth, async (req, res) => {
app.post("/api/contracts", requireAuth, async (req, res) => {
app.put("/api/contracts/:id", requireAuth, async (req, res) => {
app.delete("/api/contracts/:id", requireAuth, async (req, res) => {
```

**Recommended Fixes:**
```javascript
// Read access - all authenticated users
app.get("/api/contracts", requireAuth, async (req, res) => {

// Create contracts - manager level and above
app.post("/api/contracts", requireManagerOrAbove, async (req, res) => {

// Update contracts - manager level and above  
app.put("/api/contracts/:id", requireManagerOrAbove, async (req, res) => {

// Delete contracts - manager level and above
app.delete("/api/contracts/:id", requireManagerOrAbove, async (req, res) => {
```

## 🟡 Medium Priority Fixes

### 5. Add Data Scoping for Client Assignments
**Implementation needed:** User-specific data filtering
```javascript
// Example implementation for client filtering
async function getAssignedClients(userId, userRole) {
  if (userRole === 'admin' || userRole === 'manager') {
    // Admin and managers see all clients
    return await storage.getAllClients();
  } else {
    // Engineers and users see only assigned clients
    return await storage.getAssignedClients(userId);
  }
}
```

### 6. Service Authorization Forms (SAF) Access Control
**File:** `server/routes.ts` (Lines ~2744-2797)
**Recommendation:** Implement role-based restrictions
```javascript
// Current: All auth users can create SAFs
app.post("/api/service-authorization-forms", requireAuth, async (req, res) => {

// Recommended: Manager+ can create SAFs
app.post("/api/service-authorization-forms", requireManagerOrAbove, async (req, res) => {
```

## 🟢 Enhancement Recommendations

### 7. Frontend Role-Based UI Elements
**Files:** Various React components
**Implementation:** Add role-based conditional rendering
```typescript
// Example component with role-based rendering
const ClientActions = () => {
  const { user } = useAuth();
  const canManageClients = ['admin', 'manager'].includes(user.role);
  
  return (
    <div>
      {canManageClients && (
        <Button onClick={handleCreateClient}>Create Client</Button>
      )}
      {canManageClients && (
        <Button onClick={handleEditClient}>Edit Client</Button>
      )}
      {/* Delete button should only show for admin/manager */}
      {canManageClients && (
        <Button onClick={handleDeleteClient} variant="destructive">
          Delete Client
        </Button>
      )}
    </div>
  );
};
```

### 8. Audit Logging for RBAC Violations
**Implementation:** Log all permission denials
```javascript
function requireManagerOrAbove(req, res, next) {
  return requireRole(['admin', 'manager'])(req, res, (error) => {
    if (error || !['admin', 'manager'].includes(req.user?.role)) {
      // Log RBAC violation
      console.warn(`RBAC Violation: User ${req.user?.id} (${req.user?.role}) attempted ${req.method} ${req.path}`);
      return res.status(403).json({ 
        message: "Insufficient permissions",
        required: ['admin', 'manager'],
        current: req.user?.role
      });
    }
    next();
  });
}
```

## Implementation Priority Order

1. **IMMEDIATE (Today):**
   - Fix client deletion access control
   - Fix service update/delete access control
   - Implement contract management RBAC

2. **This Week:**
   - Add data scoping for user assignments
   - Implement SAF access controls
   - Add RBAC violation logging

3. **Next Sprint:**
   - Frontend role-based UI components
   - Comprehensive testing of all endpoints
   - Documentation updates

## Testing After Implementation

After applying these fixes, run the RBAC test suite:
```bash
# 1. Create test users
node setup-rbac-test-users.cjs

# 2. Install dependencies  
npm install node-fetch

# 3. Run RBAC tests
node rbac-test-suite.js

# 4. Verify all tests pass
# Expected: 100% pass rate after fixes
```

## Risk Assessment

**Before Fixes:**
- 🔴 HIGH RISK: Critical business data exposure
- 🔴 Users can delete clients/services they shouldn't access
- 🔴 Contracts have no access controls

**After Fixes:**
- 🟢 LOW RISK: Proper role-based access controls
- 🟢 Data integrity protected
- 🟢 Compliance with security best practices 