-- ========================================
-- COMPLETE PRODUCTION DATABASE MIGRATION
-- This script will migrate your production database from the old basic schema
-- to the full enterprise schema that your application expects
-- ========================================

-- CRITICAL: BACKUP YOUR DATABASE BEFORE RUNNING THIS!
-- psql -h localhost -U mssp_user -d production_backup -c "CREATE DATABASE production_backup;"
-- pg_dump -h localhost -U mssp_user production_db > production_backup.sql

BEGIN;

-- First, add the missing columns to the existing clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS short_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS domain TEXT;

-- Add indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_short_name ON clients(short_name);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at);

-- Update short_name for existing clients
UPDATE clients SET short_name = name WHERE short_name IS NULL;

-- Now create all the missing tables...

-- 1. Users table (Critical - needed for authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  auth_provider TEXT DEFAULT 'local',
  ldap_id TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  two_factor_secret TEXT,
  two_factor_backup_codes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 2. Company Settings (Core configuration)
CREATE TABLE IF NOT EXISTS company_settings (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'MSSP Client Manager',
  currency TEXT NOT NULL DEFAULT 'USD',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  fiscal_year_start TEXT NOT NULL DEFAULT '01-01',
  date_format TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
  time_format TEXT NOT NULL DEFAULT '12h',
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3b82f6',
  secondary_color TEXT NOT NULL DEFAULT '#64748b',
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_id TEXT,
  registration_number TEXT,
  email_notifications_enabled BOOLEAN DEFAULT true,
  sms_notifications_enabled BOOLEAN DEFAULT false,
  session_timeout_minutes INTEGER DEFAULT 30,
  password_expiry_days INTEGER DEFAULT 90,
  max_login_attempts INTEGER DEFAULT 5,
  audit_log_retention_days INTEGER DEFAULT 365,
  backup_retention_days INTEGER DEFAULT 30,
  api_rate_limit INTEGER DEFAULT 1000,
  webhook_retry_attempts INTEGER DEFAULT 3,
  advanced_search_enabled BOOLEAN DEFAULT true,
  audit_logging_enabled BOOLEAN DEFAULT true,
  two_factor_required BOOLEAN DEFAULT false,
  data_export_enabled BOOLEAN DEFAULT true,
  ldap_enabled BOOLEAN DEFAULT false,
  ldap_url TEXT,
  ldap_bind_dn TEXT,
  ldap_bind_password TEXT,
  ldap_search_base TEXT,
  ldap_search_filter TEXT,
  ldap_username_attribute TEXT DEFAULT 'uid',
  ldap_email_attribute TEXT DEFAULT 'mail',
  ldap_first_name_attribute TEXT DEFAULT 'givenName',
  ldap_last_name_attribute TEXT DEFAULT 'sn',
  ldap_default_role TEXT DEFAULT 'user',
  ldap_group_search_base TEXT,
  ldap_group_search_filter TEXT,
  ldap_admin_group TEXT,
  ldap_manager_group TEXT,
  ldap_engineer_group TEXT,
  ldap_connection_timeout INTEGER DEFAULT 5000,
  ldap_search_timeout INTEGER DEFAULT 5000,
  ldap_certificate_verification BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT now(),
  updated_by INTEGER REFERENCES users(id)
);

-- 3. Audit Logs (Critical for compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  entity_name TEXT,
  description TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  category TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP NOT NULL DEFAULT now()
);

-- 4. Contracts (Core business logic)
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  auto_renewal BOOLEAN DEFAULT false,
  renewal_terms TEXT,
  total_value NUMERIC(15,2),
  status TEXT DEFAULT 'active',
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 5. Services (Core business logic)
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  delivery_model TEXT,
  base_price NUMERIC(15,2),
  pricing_unit TEXT DEFAULT 'monthly',
  scope_definition_template JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- 6. Service Scopes
CREATE TABLE IF NOT EXISTS service_scopes (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER NOT NULL REFERENCES contracts(id),
  service_id INTEGER NOT NULL REFERENCES services(id),
  scope_definition JSONB,
  saf_document_url TEXT,
  saf_start_date TIMESTAMP,
  saf_end_date TIMESTAMP,
  saf_status TEXT DEFAULT 'pending',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT DEFAULT 'active',
  monthly_value NUMERIC(15,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 7. Client Contacts
CREATE TABLE IF NOT EXISTS client_contacts (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  title TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 8. Page Permissions (Critical for UI)
CREATE TABLE IF NOT EXISTS page_permissions (
  id SERIAL PRIMARY KEY,
  page_name TEXT UNIQUE NOT NULL,
  page_url TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon TEXT,
  admin_access BOOLEAN DEFAULT false,
  manager_access BOOLEAN DEFAULT false,
  engineer_access BOOLEAN DEFAULT false,
  user_access BOOLEAN DEFAULT false,
  requires_special_permission BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 9. Schema Versions (Critical for tracking)
CREATE TABLE IF NOT EXISTS schema_versions (
  id SERIAL PRIMARY KEY,
  script_version VARCHAR(50),
  app_version VARCHAR(50),
  schema_version VARCHAR(50),
  version VARCHAR(100),
  applied_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  environment VARCHAR(50) DEFAULT 'production',
  notes TEXT,
  migration_file VARCHAR(255),
  description TEXT
);

-- 10. User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  contract_reminders BOOLEAN DEFAULT true,
  financial_alerts BOOLEAN DEFAULT true,
  two_factor_auth BOOLEAN DEFAULT false,
  session_timeout BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'America/New_York',
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'USD',
  auto_save_forms BOOLEAN DEFAULT true,
  data_export BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  data_retention_period TEXT DEFAULT '1_year',
  updated_at TIMESTAMP DEFAULT now()
);

-- 11. Dashboards and Widgets
CREATE TABLE IF NOT EXISTS dashboards (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  widget_type TEXT NOT NULL,
  config JSONB,
  data_source_id INTEGER,
  refresh_interval INTEGER DEFAULT 300,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard_widget_assignments (
  id SERIAL PRIMARY KEY,
  dashboard_id INTEGER NOT NULL REFERENCES dashboards(id),
  widget_id INTEGER NOT NULL REFERENCES dashboard_widgets(id),
  position JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- 12. User Dashboard Settings
CREATE TABLE IF NOT EXISTS user_dashboard_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  card_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  data_source TEXT,
  size TEXT DEFAULT 'medium',
  visible BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  config JSONB,
  is_built_in BOOLEAN DEFAULT false,
  is_removable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, card_id)
);

-- Insert essential data

-- Insert default company settings
INSERT INTO company_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Insert current schema version
INSERT INTO schema_versions (version, description, environment) 
VALUES ('1.6.0', 'Complete production migration', 'production')
ON CONFLICT DO NOTHING;

-- Create essential indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_service_scopes_contract_id ON service_scopes(contract_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON client_contacts(client_id);

-- Add foreign key constraints
ALTER TABLE user_settings ADD CONSTRAINT fk_user_settings_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

COMMIT;

-- Success message
SELECT 'Production database migration completed successfully!' as status;
SELECT count(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';
SELECT 'Remember to create an admin user and restart your application' as next_step; 