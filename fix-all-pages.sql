-- Fix Navigation Visibility - Add all missing pages to page_permissions table

-- First, let's see what's already there
SELECT * FROM page_permissions ORDER BY sort_order;

-- Add missing pages
INSERT INTO page_permissions (page_name, page_url, display_name, description, category, icon, sort_order, is_active, requires_auth)
VALUES 
-- Core Management Pages
('service-scopes', '/service-scopes', 'Service Scopes', 'Service scope management', 'management', 'Target', 5, true, true),
('proposals', '/proposals', 'Proposals', 'Proposal management', 'management', 'BookOpen', 6, true, true),
('financial', '/financial', 'Financial', 'Financial transactions', 'management', 'DollarSign', 7, true, true),
('team', '/team', 'Team', 'Team management', 'management', 'Users', 8, true, true),
('documents', '/documents', 'Documents', 'Document management', 'management', 'FolderOpen', 9, true, true),
('license-pools', '/license-pools', 'License Pools', 'License pool management', 'management', 'Server', 10, true, true),

-- Integration Pages
('integration-engine', '/integration-engine', 'Integration Engine', 'External API integrations', 'integration', 'Zap', 15, true, true),
('bulk-import', '/bulk-import', 'Bulk Import', 'Import data from CSV', 'integration', 'Upload', 16, true, true),
('comprehensive-bulk-import', '/comprehensive-bulk-import', 'Advanced Import', 'Comprehensive data import', 'integration', 'Upload', 17, true, true),
('dashboards', '/dashboards', 'Dashboards', 'Dashboard management', 'analytics', 'LayoutDashboard', 18, true, true),

-- Admin Pages
('admin-users', '/admin/users', 'User Management', 'Manage system users', 'admin', 'Users', 20, true, true),
('admin-rbac', '/admin/rbac', 'Role Management', 'Role-based access control', 'admin', 'Shield', 21, true, true),
('admin-audit', '/admin/audit', 'Audit Management', 'System audit logs', 'admin', 'FileText', 22, true, true),

-- Settings Pages
('settings', '/settings', 'Settings', 'Application settings', 'system', 'Settings', 25, true, true),
('profile', '/profile', 'Profile', 'User profile', 'system', 'User', 26, true, true),

-- Test/Demo Pages
('test-dashboard', '/test-dashboard', 'Test Dashboard', 'Dashboard testing', 'development', 'TestTube', 30, true, true),
('entity-navigation-demo', '/entity-navigation-demo', 'Entity Navigation', 'Entity relationship demo', 'development', 'Network', 31, true, true),

-- Form Creation Pages
('create-saf', '/create-saf', 'Create SAF', 'Create Service Authorization Form', 'forms', 'FileCheck', 35, true, true),
('create-coc', '/create-coc', 'Create COC', 'Create Certificate of Compliance', 'forms', 'Award', 36, true, true)
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

-- Grant admin access to all pages
INSERT INTO user_page_permissions (user_id, page_permission_id)
SELECT 1, pp.id 
FROM page_permissions pp
WHERE NOT EXISTS (
  SELECT 1 FROM user_page_permissions upp 
  WHERE upp.user_id = 1 AND upp.page_permission_id = pp.id
);

-- Verify the results
SELECT page_name, page_url, display_name, category, is_active 
FROM page_permissions 
ORDER BY category, sort_order; 