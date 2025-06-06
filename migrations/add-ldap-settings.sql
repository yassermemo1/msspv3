-- Add LDAP Configuration columns to company_settings table
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS ldap_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS ldap_url TEXT,
ADD COLUMN IF NOT EXISTS ldap_bind_dn TEXT,
ADD COLUMN IF NOT EXISTS ldap_bind_password TEXT,
ADD COLUMN IF NOT EXISTS ldap_search_base TEXT,
ADD COLUMN IF NOT EXISTS ldap_search_filter TEXT DEFAULT '(uid={{username}})',
ADD COLUMN IF NOT EXISTS ldap_username_attribute TEXT DEFAULT 'uid',
ADD COLUMN IF NOT EXISTS ldap_email_attribute TEXT DEFAULT 'mail',
ADD COLUMN IF NOT EXISTS ldap_first_name_attribute TEXT DEFAULT 'givenName',
ADD COLUMN IF NOT EXISTS ldap_last_name_attribute TEXT DEFAULT 'sn',
ADD COLUMN IF NOT EXISTS ldap_default_role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS ldap_group_search_base TEXT,
ADD COLUMN IF NOT EXISTS ldap_group_search_filter TEXT,
ADD COLUMN IF NOT EXISTS ldap_admin_group TEXT,
ADD COLUMN IF NOT EXISTS ldap_manager_group TEXT,
ADD COLUMN IF NOT EXISTS ldap_engineer_group TEXT,
ADD COLUMN IF NOT EXISTS ldap_connection_timeout INTEGER DEFAULT 5000,
ADD COLUMN IF NOT EXISTS ldap_search_timeout INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS ldap_certificate_verification BOOLEAN NOT NULL DEFAULT true;

-- Create an index on ldap_enabled for performance
CREATE INDEX IF NOT EXISTS idx_company_settings_ldap_enabled ON company_settings(ldap_enabled);

-- Insert default company_settings record if none exists
INSERT INTO company_settings (company_name) 
SELECT 'MSSP Client Manager' 
WHERE NOT EXISTS (SELECT 1 FROM company_settings); 