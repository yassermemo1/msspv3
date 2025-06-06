# Fix Missing Routes

## Problem
Many navigation links lead to empty pages because the routes don't exist in App.tsx.

## Missing Routes to Add

### 1. Add these imports at the top of App.tsx:
```tsx
import SafPage from "@/pages/saf-page";
import CocPage from "@/pages/coc-page";
import SearchPage from "@/pages/search-page";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
```

### 2. Add these routes before the closing `</Switch>`:

```tsx
{/* SAF Management */}
<Route path="/saf" component={() => (
  <AuthGuard>
    <PageGuard pageUrl="/saf">
      <SafPage />
    </PageGuard>
  </AuthGuard>
)} />

{/* COC Management */}
<Route path="/coc" component={() => (
  <AuthGuard>
    <PageGuard pageUrl="/coc">
      <CocPage />
    </PageGuard>
  </AuthGuard>
)} />

{/* Search */}
<Route path="/search" component={() => (
  <AuthGuard>
    <PageGuard pageUrl="/search">
      <SearchPage />
    </PageGuard>
  </AuthGuard>
)} />

{/* Add alias for dashboard */}
<Route path="/dashboard" component={() => (
  <AuthGuard>
    <PageGuard pageUrl="/dashboard">
      <HomePage /> {/* or redirect to / */}
    </PageGuard>
  </AuthGuard>
)} />

{/* Add licenses route (redirects to assets) */}
<Route path="/licenses" component={() => (
  <AuthGuard>
    <PageGuard pageUrl="/licenses">
      <AssetsPage /> {/* Shows license pools in assets page */}
    </PageGuard>
  </AuthGuard>
)} />

{/* Add hardware route (alias for assets) */}
<Route path="/hardware" component={() => (
  <AuthGuard>
    <PageGuard pageUrl="/hardware">
      <AssetsPage />
    </PageGuard>
  </AuthGuard>
)} />

{/* Add users route (redirects to admin/users) */}
<Route path="/users">
  {() => {
    window.location.href = '/admin/users';
    return null;
  }}
</Route>

{/* Add audit-logs route (redirects to admin/audit) */}
<Route path="/audit-logs">
  {() => {
    window.location.href = '/admin/audit';
    return null;
  }}
</Route>

{/* Add admin dashboard */}
<Route path="/admin" component={() => (
  <AuthGuard>
    <PageGuard pageUrl="/admin">
      <SettingsPage /> {/* Or create a proper admin dashboard */}
    </PageGuard>
  </AuthGuard>
)} />

{/* Add profile route */}
<Route path="/profile" component={() => (
  <AuthGuard>
    <PageGuard pageUrl="/profile">
      <SettingsPage /> {/* Profile section is in settings */}
    </PageGuard>
  </AuthGuard>
)} />

{/* 404 catch-all - MUST BE LAST */}
<Route component={NotFound} />
```

## Alternative Solution: Fix the Database

Instead of adding all these routes, update the page_permissions table:

```sql
-- Fix navigation to use existing routes
UPDATE page_permissions SET page_url = '/' WHERE page_name = 'dashboard';
UPDATE page_permissions SET page_url = '/assets' WHERE page_name = 'hardware';
UPDATE page_permissions SET page_url = '/assets' WHERE page_name = 'licenses';  
UPDATE page_permissions SET page_url = '/admin/users' WHERE page_name = 'users';
UPDATE page_permissions SET page_url = '/admin/audit' WHERE page_name = 'audit-logs';
UPDATE page_permissions SET page_url = '/settings' WHERE page_name = 'admin';
UPDATE page_permissions SET page_url = '/settings' WHERE page_name = 'profile';
```

## Quick Test

After making changes, test these URLs:
- http://localhost:5001/dashboard
- http://localhost:5001/saf
- http://localhost:5001/coc
- http://localhost:5001/licenses
- http://localhost:5001/hardware
- http://localhost:5001/users
- http://localhost:5001/audit-logs
- http://localhost:5001/admin
- http://localhost:5001/profile
- http://localhost:5001/some-random-url (should show 404) 