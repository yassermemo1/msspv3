-- Fix Navigation Visibility - Add all missing pages to page_permissions table

-- Add missing pages with correct column structure
INSERT INTO page_permissions (page_name, page_url, display_name, description, category, icon, sort_order, is_active, admin_access, manager_access, engineer_access, user_access)
VALUES 
-- Core Management Pages
('service-scopes', '/service-scopes', 'Service Scopes', 'Service scope management', 'management', 'Target', 5, true, true, true, false, false),
('proposals', '/proposals', 'Proposals', 'Proposal management', 'management', 'BookOpen', 6, true, true, true, false, false),
('financial', '/financial', 'Financial', 'Financial transactions', 'management', 'DollarSign', 7, true, true, true, false, false),
('team', '/team', 'Team', 'Team management', 'management', 'Users', 8, true, true, true, true, false),
('documents', '/documents', 'Documents', 'Document management', 'management', 'FolderOpen', 9, true, true, true, true, true),
('license-pools', '/license-pools', 'License Pools', 'License pool management', 'management', 'Server', 10, true, true, true, true, false),

-- Integration Pages
('integration-engine', '/integration-engine', 'Integration Engine', 'External API integrations', 'integration', 'Zap', 15, true, true, true, false, false),
('bulk-import', '/bulk-import', 'Bulk Import', 'Import data from CSV', 'integration', 'Upload', 16, true, true, true, false, false),
('dashboards', '/dashboards', 'Dashboards', 'Dashboard management', 'analytics', 'LayoutDashboard', 18, true, true, true, true, true),

-- Admin Pages
('admin-users', '/admin/users', 'User Management', 'Manage system users', 'admin', 'Users', 20, true, true, false, false, false),
('admin-rbac', '/admin/rbac', 'Role Management', 'Role-based access control', 'admin', 'Shield', 21, true, true, false, false, false),

-- Settings Pages
('settings', '/settings', 'Settings', 'Application settings', 'system', 'Settings', 25, true, true, true, true, true),
('profile', '/profile', 'Profile', 'User profile', 'system', 'User', 26, true, true, true, true, true),

-- Form Creation Pages
('create-saf', '/create-saf', 'Create SAF', 'Create Service Authorization Form', 'forms', 'FileCheck', 35, true, true, true, false, false),
('create-coc', '/create-coc', 'Create COC', 'Create Certificate of Compliance', 'forms', 'Award', 36, true, true, true, false, false)
ON CONFLICT (page_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Update existing pages that point to wrong URLs
UPDATE page_permissions SET page_url = '/assets' WHERE page_name = 'hardware' AND page_url != '/assets';
UPDATE page_permissions SET page_url = '/admin/audit' WHERE page_name = 'audit-logs';

-- Fix the licenses page to point to the correct URL
UPDATE page_permissions SET page_url = '/license-pools' WHERE page_name = 'licenses';

-- Verify the results
SELECT page_name, page_url, display_name, category, is_active 
FROM page_permissions 
ORDER BY category, sort_order; 