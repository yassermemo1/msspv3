-- MSSP Client Manager - Comprehensive RBAC Fix
-- This script sets up proper role-based access control for all pages and features

-- First, let's see current permissions
SELECT page_name, page_url, admin_access, manager_access, engineer_access, user_access 
FROM page_permissions 
ORDER BY category, sort_order;

-- Update permissions based on role hierarchy
-- Admin: Full access to everything
-- Manager: Access to most features except system administration
-- Engineer: Access to technical features and read-only to business features
-- User: Limited access to basic features

-- Core Management Pages
UPDATE page_permissions SET 
  admin_access = true,
  manager_access = true,
  engineer_access = true,
  user_access = true
WHERE page_name = 'dashboard';

UPDATE page_permissions SET 
  admin_access = true,
  manager_access = true,
  engineer_access = true,
  user_access = false
WHERE page_name = 'clients';

UPDATE page_permissions SET 
  admin_access = true,
  manager_access = true,
  engineer_access = false,
  user_access = false
WHERE page_name IN ('contracts', 'proposals', 'financial');

UPDATE page_permissions SET 
  admin_access = true,
  manager_access = true,
  engineer_access = true,
  user_access = false
WHERE page_name IN ('services', 'service-scopes');

UPDATE page_permissions SET 
  admin_access = true,
  manager_access = true,
  engineer_access = true,
  user_access = false
WHERE page_name IN ('hardware', 'licenses', 'license-pools');

UPDATE page_permissions SET 
  admin_access = true,
  manager_access = true,
  engineer_access = true,
  user_access = true
WHERE page_name IN ('documents', 'team');

UPDATE page_permissions SET 
  admin_access = true,
  manager_access = true,
  engineer_access = true,
  user_access = true
WHERE page_name = 'reports';

-- SAF and COC Pages
UPDATE page_permissions SET 
  admin_access = true,
  manager_access = true,
  engineer_access = false,
  user_access = false
WHERE page_name IN ('saf', 'coc', 'create-saf', 'create-coc');

-- Integration Pages
UPDATE page_permissions SET 
  admin_access = true,
  manager_access = true,
  engineer_access = false,
  user_access = false
WHERE page_name IN ('integration-engine', 'bulk-import', 'comprehensive-bulk-import');

-- Admin Pages - Admin only
UPDATE page_permissions SET 
  admin_access = true,
  manager_access = false,
  engineer_access = false,
  user_access = false
WHERE page_name IN ('admin', 'admin-users', 'admin-rbac', 'admin-audit', 'audit-logs', 'external-systems');

-- User Pages - Everyone
UPDATE page_permissions SET 
  admin_access = true,
  manager_access = true,
  engineer_access = true,
  user_access = true
WHERE page_name IN ('settings', 'profile');

-- Analytics/Dashboards
UPDATE page_permissions SET 
  admin_access = true,
  manager_access = true,
  engineer_access = true,
  user_access = true
WHERE page_name = 'dashboards';

-- Test/Demo Pages - Admin and Engineers only
UPDATE page_permissions SET 
  admin_access = true,
  manager_access = false,
  engineer_access = true,
  user_access = false
WHERE page_name IN ('test-dashboard', 'entity-navigation-demo');

-- Create test users for each role if they don't exist
DO $$
BEGIN
  -- Create manager user
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager@mssp.local') THEN
    INSERT INTO users (username, email, "firstName", "lastName", role, "authProvider", "isActive", password)
    VALUES ('manager', 'manager@mssp.local', 'Manager', 'User', 'manager', 'local', true, 
            '$2b$10$npwGdgpxeekPykyAqbJmVOVrATjp0d.Qn1YbF5FMCXVN1z0gJNWGy'); -- Password: SecureTestPass123!
  END IF;

  -- Create engineer user
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'engineer@mssp.local') THEN
    INSERT INTO users (username, email, "firstName", "lastName", role, "authProvider", "isActive", password)
    VALUES ('engineer', 'engineer@mssp.local', 'Engineer', 'User', 'engineer', 'local', true, 
            '$2b$10$npwGdgpxeekPykyAqbJmVOVrATjp0d.Qn1YbF5FMCXVN1z0gJNWGy'); -- Password: SecureTestPass123!
  END IF;

  -- Create regular user
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@mssp.local') THEN
    INSERT INTO users (username, email, "firstName", "lastName", role, "authProvider", "isActive", password)
    VALUES ('user', 'user@mssp.local', 'Regular', 'User', 'user', 'local', true, 
            '$2b$10$npwGdgpxeekPykyAqbJmVOVrATjp0d.Qn1YbF5FMCXVN1z0gJNWGy'); -- Password: SecureTestPass123!
  END IF;
END $$;

-- Create role_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  conditions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role, resource, action)
);

-- Define granular permissions for each role
INSERT INTO role_permissions (role, resource, action) VALUES
-- Admin permissions (full access)
('admin', 'clients', 'create'),
('admin', 'clients', 'read'),
('admin', 'clients', 'update'),
('admin', 'clients', 'delete'),
('admin', 'contracts', 'create'),
('admin', 'contracts', 'read'),
('admin', 'contracts', 'update'),
('admin', 'contracts', 'delete'),
('admin', 'services', 'create'),
('admin', 'services', 'read'),
('admin', 'services', 'update'),
('admin', 'services', 'delete'),
('admin', 'users', 'create'),
('admin', 'users', 'read'),
('admin', 'users', 'update'),
('admin', 'users', 'delete'),
('admin', 'audit_logs', 'read'),
('admin', 'settings', 'read'),
('admin', 'settings', 'update'),

-- Manager permissions
('manager', 'clients', 'create'),
('manager', 'clients', 'read'),
('manager', 'clients', 'update'),
('manager', 'contracts', 'create'),
('manager', 'contracts', 'read'),
('manager', 'contracts', 'update'),
('manager', 'services', 'read'),
('manager', 'services', 'update'),
('manager', 'financial', 'create'),
('manager', 'financial', 'read'),
('manager', 'financial', 'update'),
('manager', 'reports', 'read'),
('manager', 'team', 'read'),
('manager', 'team', 'update'),

-- Engineer permissions
('engineer', 'clients', 'read'),
('engineer', 'services', 'read'),
('engineer', 'hardware', 'create'),
('engineer', 'hardware', 'read'),
('engineer', 'hardware', 'update'),
('engineer', 'licenses', 'read'),
('engineer', 'licenses', 'update'),
('engineer', 'documents', 'create'),
('engineer', 'documents', 'read'),
('engineer', 'reports', 'read'),

-- User permissions (limited)
('user', 'dashboard', 'read'),
('user', 'documents', 'read'),
('user', 'reports', 'read'),
('user', 'profile', 'read'),
('user', 'profile', 'update')
ON CONFLICT (role, resource, action) DO NOTHING;

-- Create a function to check permissions
CREATE OR REPLACE FUNCTION check_permission(
  user_role TEXT,
  resource TEXT,
  action TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Admin has access to everything
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific permission
  RETURN EXISTS (
    SELECT 1 FROM role_permissions 
    WHERE role = user_role 
    AND role_permissions.resource = check_permission.resource 
    AND role_permissions.action = check_permission.action
  );
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger for permission changes
CREATE OR REPLACE FUNCTION audit_permission_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    "userId",
    action,
    "entityType",
    "entityId",
    "entityName",
    description,
    "ipAddress",
    "userAgent",
    severity,
    category
  ) VALUES (
    1, -- System user
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'CREATE'
      WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
      WHEN TG_OP = 'DELETE' THEN 'DELETE'
    END,
    'permission',
    NEW.id,
    NEW.page_name,
    'Permission ' || TG_OP || ' for ' || NEW.page_name,
    '127.0.0.1',
    'System',
    'info',
    'security'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'audit_permission_changes'
  ) THEN
    CREATE TRIGGER audit_permission_changes
    AFTER INSERT OR UPDATE OR DELETE ON page_permissions
    FOR EACH ROW EXECUTE FUNCTION audit_permission_change();
  END IF;
END $$;

-- Summary of permissions
SELECT 
  role,
  COUNT(*) as total_permissions,
  COUNT(DISTINCT resource) as resources_accessible,
  STRING_AGG(DISTINCT resource, ', ' ORDER BY resource) as resources
FROM role_permissions
GROUP BY role
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'engineer' THEN 3
    WHEN 'user' THEN 4
  END;

-- Show updated page permissions
SELECT 
  page_name,
  page_url,
  category,
  CASE WHEN admin_access THEN '✓' ELSE '✗' END as admin,
  CASE WHEN manager_access THEN '✓' ELSE '✗' END as manager,
  CASE WHEN engineer_access THEN '✓' ELSE '✗' END as engineer,
  CASE WHEN user_access THEN '✓' ELSE '✗' END as "user"
FROM page_permissions
ORDER BY category, sort_order;

-- Test users created
SELECT username, email, role, "isActive" 
FROM users 
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'engineer' THEN 3
    WHEN 'user' THEN 4
  END; 