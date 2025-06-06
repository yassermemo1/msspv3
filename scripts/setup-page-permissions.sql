-- Setup page permissions table and initial data
-- This script creates the page_permissions table and populates it with standard pages

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS page_permissions (
  id SERIAL PRIMARY KEY,
  page_name TEXT NOT NULL UNIQUE,
  page_url TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'main',
  icon TEXT,
  admin_access BOOLEAN NOT NULL DEFAULT true,
  manager_access BOOLEAN NOT NULL DEFAULT false,
  engineer_access BOOLEAN NOT NULL DEFAULT false,
  user_access BOOLEAN NOT NULL DEFAULT false,
  requires_special_permission BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_permissions_active ON page_permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_page_permissions_category ON page_permissions(category);
CREATE INDEX IF NOT EXISTS idx_page_permissions_url ON page_permissions(page_url);

-- Insert initial page permissions
INSERT INTO page_permissions (page_name, page_url, display_name, description, category, icon, admin_access, manager_access, engineer_access, user_access, sort_order) VALUES
('Dashboard', '/', 'Dashboard', 'Overview and key metrics', 'main', 'LayoutDashboard', true, true, true, true, 1),
('Clients', '/clients', 'Clients', 'Manage client information and contacts', 'main', 'Building', true, true, true, true, 2),
('Contracts', '/contracts', 'Contracts', 'Contract management and tracking', 'main', 'FileText', true, true, false, false, 3),
('Services', '/services', 'Services', 'Service catalog and offerings', 'main', 'ServerCog', true, false, true, false, 4),
('Assets', '/assets', 'Assets', 'Hardware and license management', 'main', 'Server', true, true, true, true, 5),
('Financial', '/financial', 'Financial', 'Financial transactions and reporting', 'main', 'DollarSign', true, true, false, false, 6),
('Team', '/team', 'Team', 'Team member and role management', 'main', 'Users', true, true, false, false, 7),
('Proposals', '/proposals', 'Proposals', 'Technical and financial proposals', 'advanced', 'BookOpen', true, true, true, false, 10),
('Service Scopes', '/service-scopes', 'Service Scopes', 'Service scope definitions and SAFs', 'advanced', 'Target', true, false, true, false, 11),
('Documents', '/documents', 'Documents', 'Document management system', 'advanced', 'FolderOpen', true, true, true, true, 12),
('Integration Engine', '/integration-engine', 'Integration Engine', 'External API integrations and data sync', 'integration', 'Zap', true, false, true, false, 20),
('External Systems', '/external-systems', 'External Systems', 'External system configurations', 'integration', 'Zap', true, false, true, false, 21),
('Bulk Import', '/bulk-import', 'Bulk Import', 'Import client data from CSV files', 'integration', 'Upload', true, true, false, false, 22),
('Comprehensive Bulk Import', '/comprehensive-bulk-import', 'Comprehensive Bulk Import', 'Import comprehensive client data with multiple entities', 'integration', 'Upload', true, true, false, false, 23),
('Reports', '/reports', 'Reports', 'Analytics and reporting', 'reports', 'BarChart3', true, true, true, false, 30),
('Dynamic Dashboards', '/dashboards', 'Dynamic Dashboards', 'Customizable dashboard management', 'reports', 'BarChart3', true, true, false, false, 31),
('Settings', '/settings', 'Settings', 'Application and user settings', 'admin', 'Settings', true, false, false, false, 40),
('User Management', '/admin/users', 'User Management', 'Manage users and roles', 'admin', 'Users', true, false, false, false, 41),
('RBAC Management', '/admin/rbac', 'RBAC Management', 'Configure role-based access control', 'admin', 'Shield', true, false, false, false, 42),
('Audit Logs', '/admin/audit', 'Audit Logs', 'View system audit logs', 'admin', 'FileText', true, false, false, false, 43)
ON CONFLICT (page_name) DO UPDATE SET
  page_url = EXCLUDED.page_url,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  manager_access = EXCLUDED.manager_access,
  engineer_access = EXCLUDED.engineer_access,
  user_access = EXCLUDED.user_access,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON page_permissions TO mssp_user;
GRANT ALL PRIVILEGES ON SEQUENCE page_permissions_id_seq TO mssp_user;

-- Display the created permissions
SELECT 
  category,
  display_name,
  page_url,
  admin_access,
  manager_access,
  engineer_access,
  user_access
FROM page_permissions 
ORDER BY category, sort_order; 