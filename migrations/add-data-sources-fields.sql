-- Migration to add missing integration engine fields to data_sources table

-- Add new columns to data_sources table
ALTER TABLE data_sources 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS api_endpoint TEXT,
ADD COLUMN IF NOT EXISTS auth_type TEXT,
ADD COLUMN IF NOT EXISTS auth_config JSONB,
ADD COLUMN IF NOT EXISTS sync_frequency TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS default_page_size INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS max_page_size INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS supports_pagination BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS pagination_type TEXT DEFAULT 'offset',
ADD COLUMN IF NOT EXISTS pagination_config JSONB;

-- Update any existing records to have sensible defaults
UPDATE data_sources 
SET 
  sync_frequency = COALESCE(sync_frequency, 'manual'),
  is_active = COALESCE(is_active, true),
  default_page_size = COALESCE(default_page_size, 100),
  max_page_size = COALESCE(max_page_size, 1000),
  supports_pagination = COALESCE(supports_pagination, true),
  pagination_type = COALESCE(pagination_type, 'offset');

-- Add comments for documentation
COMMENT ON COLUMN data_sources.description IS 'Human-readable description of the data source';
COMMENT ON COLUMN data_sources.api_endpoint IS 'API endpoint URL for external APIs';
COMMENT ON COLUMN data_sources.auth_type IS 'Authentication type: api_key, bearer_token, basic_auth, oauth2, none';
COMMENT ON COLUMN data_sources.auth_config IS 'Authentication configuration (keys, tokens, etc.)';
COMMENT ON COLUMN data_sources.sync_frequency IS 'How often to sync data: manual, hourly, daily, weekly';
COMMENT ON COLUMN data_sources.is_active IS 'Whether the data source is active and enabled';
COMMENT ON COLUMN data_sources.last_sync_at IS 'Timestamp of the last successful data sync';
COMMENT ON COLUMN data_sources.default_page_size IS 'Default number of records per page for pagination';
COMMENT ON COLUMN data_sources.max_page_size IS 'Maximum allowed page size for pagination';
COMMENT ON COLUMN data_sources.supports_pagination IS 'Whether the data source supports paginated queries';
COMMENT ON COLUMN data_sources.pagination_type IS 'Type of pagination: offset, cursor';
COMMENT ON COLUMN data_sources.pagination_config IS 'Additional pagination configuration'; 