# Page Routing Analysis

## Summary
✅ **All pages are already standardized to use wouter** - No React Router usage found!

## Routing Library Used
- **Framework**: Wouter (lightweight React router)
- **Main Router**: App.tsx uses `Switch` and `Route` from wouter
- **Navigation Hooks**: `useLocation`, `useParams` from wouter

## Complete Page List

### Authentication Pages
| Page | File | Route | Uses Wouter |
|------|------|-------|-------------|
| Login | `login-page.tsx` | `/login` | ✅ Yes |
| Register | `register-page.tsx` | `/register` | ✅ Yes |
| Auth (legacy) | `auth-page.tsx` | Not routed | ✅ Yes |
| Simple Auth | `simple-auth.tsx` | Not routed | ✅ Yes |

### Main Application Pages
| Page | File | Route in App.tsx | Uses Wouter |
|------|------|------------------|-------------|
| Home/Dashboard | `home-page.tsx` | `/` | ✅ Yes |
| Dashboard | `dashboard-page.tsx` | `/dashboards/:dashboardId` | ✅ Yes |
| Dashboards List | `dashboards-page.tsx` | `/dashboards` | ✅ Yes |
| Clients | `clients-page.tsx` | `/clients` | ✅ Yes |
| Client Detail | `client-detail-page.tsx` | `/clients/:id` | ✅ Yes |
| Contracts | `contracts-page.tsx` | `/contracts` | ✅ Yes |
| Contract Detail | `contract-detail-page.tsx` | `/contracts/:id` | ✅ Yes |
| Services | `services-page.tsx` | `/services` | ✅ Yes |
| Service Scopes | `service-scopes-page.tsx` | `/service-scopes` | ✅ Yes |
| Proposals | `proposals-page.tsx` | `/proposals` | ✅ Yes |
| Assets | `assets-page.tsx` | `/assets` | ✅ Yes |
| Financial | `financial-page.tsx` | `/financial` | ✅ Yes |
| Team | `team-page.tsx` | `/team` | ✅ Yes |
| Documents | `documents-page.tsx` | `/documents` | ✅ Yes |
| Reports | `reports-page.tsx` | `/reports` | ✅ Yes |
| Settings | `settings-page.tsx` | `/settings` | ✅ Yes |

### Specialized Pages
| Page | File | Route in App.tsx | Uses Wouter |
|------|------|------------------|-------------|
| License Pool Detail | `license-pool-detail-page.tsx` | `/license-pools/:id` | ✅ Yes |
| Create SAF | `create-saf-page.tsx` | `/create-saf` | ✅ Yes |
| Create COC | `create-coc-page.tsx` | `/create-coc` | ✅ Yes |
| External Systems | `external-systems-page.tsx` | `/external-systems` | ✅ Yes |
| Integration Engine | `integration-engine-page.tsx` | `/integration-engine` | ✅ Yes |
| Bulk Import | `bulk-import-page.tsx` | `/bulk-import` | ✅ Yes |
| Comprehensive Import | `comprehensive-bulk-import.tsx` | `/comprehensive-bulk-import` | ✅ Yes |
| Entity Navigation Demo | `entity-navigation-demo.tsx` | `/entity-navigation-demo` | ✅ Yes |
| Test Dashboard | `test-dashboard-page.tsx` | `/test-dashboard` | ✅ Yes |

### Admin Pages
| Page | File | Route in App.tsx | Uses Wouter |
|------|------|------------------|-------------|
| User Management | `admin/user-management-page.tsx` | `/admin/users` | ✅ Yes |
| Audit Management | `admin/audit-management-page.tsx` | `/admin/audit` | ✅ Yes |
| RBAC Management | `rbac-management-page.tsx` | `/admin/rbac` | ✅ Yes |
| Service Template Demo | `admin/service-template-demo.tsx` | Not routed | ✅ Yes |

### Missing/Not Routed Pages
| Page | File | Should Be Routed As | Status |
|------|------|---------------------|---------|
| SAF Page | `saf-page.tsx` | `/saf` | ❌ Not in App.tsx |
| COC Page | `coc-page.tsx` | `/coc` | ❌ Not in App.tsx |
| Search Page | `search-page.tsx` | `/search` | ❌ Not in App.tsx |
| Not Found | `not-found.tsx` | `/:rest*` (catch-all) | ❌ Not in App.tsx |
| RBAC Example | `rbac-example-page.tsx` | N/A | Empty file |

## Navigation Patterns Used

### 1. Programmatic Navigation
```tsx
const [, setLocation] = useLocation();
setLocation('/clients'); // Navigate to clients page
```

### 2. Getting Route Parameters
```tsx
const { id } = useParams();
```

### 3. Reading Current Location
```tsx
const [location] = useLocation();
```

## Issues Found

### 1. Missing Routes
These pages exist but are not routed in App.tsx:
- `/saf` → Should show `saf-page.tsx`
- `/coc` → Should show `coc-page.tsx`
- `/search` → Should show `search-page.tsx`
- `/:rest*` → Should show `not-found.tsx` for 404s

### 2. Route Mismatches
From the navigation API vs actual routes:
- Navigation shows `/dashboard` but route is `/dashboards/:dashboardId`
- Navigation shows `/licenses` but no route exists
- Navigation shows `/hardware` but route is `/assets`
- Navigation shows `/users` but route is `/admin/users`
- Navigation shows `/admin` but no route exists
- Navigation shows `/audit-logs` but route is `/admin/audit`

## Recommendations

1. **Add Missing Routes** to App.tsx:
```tsx
<Route path="/saf" component={() => (
  <AuthGuard><PageGuard pageUrl="/saf"><SafPage /></PageGuard></AuthGuard>
)} />
<Route path="/coc" component={() => (
  <AuthGuard><PageGuard pageUrl="/coc"><CocPage /></PageGuard></AuthGuard>
)} />
<Route path="/search" component={() => (
  <AuthGuard><PageGuard pageUrl="/search"><SearchPage /></PageGuard></AuthGuard>
)} />
<Route component={NotFound} /> // Catch-all 404
```

2. **Fix Navigation Database** to match actual routes
3. **Consider Route Aliases** for backward compatibility 