-- Migration: Enhance audit logging system
-- Date: 2025-06-01
-- Description: Add indexes and optimize audit tables for better performance

-- Add indexes to audit_logs table for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);

-- Add indexes to change_history table
CREATE INDEX IF NOT EXISTS idx_change_history_entity_type ON change_history(entity_type);
CREATE INDEX IF NOT EXISTS idx_change_history_entity_id ON change_history(entity_id);
CREATE INDEX IF NOT EXISTS idx_change_history_user_id ON change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_change_history_timestamp ON change_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_change_history_batch_id ON change_history(batch_id);

-- Composite indexes for change_history
CREATE INDEX IF NOT EXISTS idx_change_history_entity_type_id ON change_history(entity_type, entity_id);

-- Add indexes to security_events table
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_success ON security_events(success);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);

-- Add indexes to data_access_logs table
CREATE INDEX IF NOT EXISTS idx_data_access_logs_user_id ON data_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_timestamp ON data_access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_entity_type ON data_access_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_entity_id ON data_access_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_access_type ON data_access_logs(access_type);

-- Add comments to clarify table purposes
COMMENT ON TABLE audit_logs IS 'General audit logging for all system activities';
COMMENT ON TABLE change_history IS 'Detailed change tracking with rollback capabilities';
COMMENT ON TABLE security_events IS 'Security-related events and access attempts';
COMMENT ON TABLE data_access_logs IS 'Data access tracking for compliance and auditing';

-- Create a view for recent activity across all audit tables
CREATE OR REPLACE VIEW recent_audit_activity AS
SELECT 
    'audit_log' as source_table,
    id,
    user_id,
    action,
    entity_type,
    entity_id,
    entity_name,
    description,
    timestamp
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
    'change_history' as source_table,
    id,
    user_id,
    action,
    entity_type,
    entity_id,
    entity_name,
    CONCAT('Changed ', field_name, ' from "', old_value, '" to "', new_value, '"') as description,
    timestamp
FROM change_history
WHERE timestamp >= NOW() - INTERVAL '7 days'

ORDER BY timestamp DESC;

-- Grant permissions to mssp_user
GRANT SELECT ON recent_audit_activity TO mssp_user; 