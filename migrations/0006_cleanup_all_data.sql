-- ========================================
-- COMPLETE DATA CLEANUP MIGRATION
-- ========================================
-- This migration removes ALL data from client-related tables
-- while respecting foreign key constraints
-- 
-- WARNING: This will permanently delete all data!
-- ========================================

-- Start transaction for safety
BEGIN;

-- Log the cleanup operation
INSERT INTO audit_logs (
    action, 
    entity_type, 
    description, 
    severity, 
    category, 
    timestamp
) VALUES (
    'BULK_DELETE', 
    'SYSTEM', 
    'Complete system data cleanup - deleting all clients, contracts, documents, and related data', 
    'critical', 
    'data_management', 
    NOW()
);

-- ========================================
-- STEP 1: Delete dependent records first
-- ========================================

-- Delete document-related data
DELETE FROM document_access;
DELETE FROM document_versions;

-- Delete external system mappings
DELETE FROM external_system_mappings;

-- Delete client assets and licenses
DELETE FROM client_licenses;
DELETE FROM hardware_assets WHERE client_id IS NOT NULL;
DELETE FROM software_assets WHERE client_id IS NOT NULL;

-- Delete service-related data
DELETE FROM service_incidents WHERE service_scope_id IN (SELECT id FROM service_scopes);
DELETE FROM service_deliverables WHERE service_scope_id IN (SELECT id FROM service_scopes);

-- Delete certificates and authorizations
DELETE FROM certificates_of_compliance;
DELETE FROM service_authorization_forms;

-- Delete proposals and feedback
DELETE FROM proposals;
DELETE FROM client_feedback;
DELETE FROM client_satisfaction_surveys;

-- Delete financial data
DELETE FROM financial_transactions WHERE client_id IS NOT NULL OR contract_id IS NOT NULL;

-- Delete search and audit data related to clients/contracts
DELETE FROM search_history WHERE query LIKE '%client%' OR results::text LIKE '%client%';
DELETE FROM global_search_index WHERE entity_type IN ('client', 'contract', 'document', 'service_scope');

-- ========================================
-- STEP 2: Delete core entity relationships
-- ========================================

-- Delete service scopes (which depend on contracts)
DELETE FROM service_scopes WHERE contract_id IS NOT NULL;

-- Delete documents
DELETE FROM documents;

-- Delete client contacts
DELETE FROM client_contacts;

-- ========================================
-- STEP 3: Delete contracts
-- ========================================
DELETE FROM contracts;

-- ========================================
-- STEP 4: Delete clients (final step)
-- ========================================
DELETE FROM clients;

-- ========================================
-- STEP 5: Clean up orphaned data
-- ========================================

-- Clean up any remaining orphaned service scopes
DELETE FROM service_scopes WHERE contract_id IS NULL AND client_id IS NULL;

-- Clean up any remaining license pools that are client-specific
DELETE FROM license_pools WHERE description LIKE '%client%' OR notes LIKE '%client%';

-- Clean up any remaining hardware/software assets
DELETE FROM hardware_assets WHERE client_id IS NULL AND notes LIKE '%client%';
DELETE FROM software_assets WHERE client_id IS NULL AND notes LIKE '%client%';

-- ========================================
-- STEP 6: Clean up audit data (optional)
-- ========================================

-- Remove audit logs related to deleted entities
DELETE FROM audit_logs WHERE entity_type IN ('client', 'contract', 'document', 'service_scope', 'proposal');
DELETE FROM change_history WHERE entity_type IN ('client', 'contract', 'document', 'service_scope', 'proposal');
DELETE FROM data_access_logs WHERE entity_type IN ('client', 'contract', 'document', 'service_scope', 'proposal');
DELETE FROM security_events WHERE description LIKE '%client%' OR description LIKE '%contract%';

-- ========================================
-- STEP 7: Reset sequences (optional)
-- ========================================

-- Reset auto-increment sequences to start fresh
-- ALTER SEQUENCE clients_id_seq RESTART WITH 1;
-- ALTER SEQUENCE contracts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE documents_id_seq RESTART WITH 1;
-- ALTER SEQUENCE service_scopes_id_seq RESTART WITH 1;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Count remaining records
DO $$
DECLARE
    client_count INTEGER;
    contract_count INTEGER;
    document_count INTEGER;
    service_scope_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO client_count FROM clients;
    SELECT COUNT(*) INTO contract_count FROM contracts;
    SELECT COUNT(*) INTO document_count FROM documents;
    SELECT COUNT(*) INTO service_scope_count FROM service_scopes;
    
    RAISE NOTICE 'Cleanup completed:';
    RAISE NOTICE 'Remaining clients: %', client_count;
    RAISE NOTICE 'Remaining contracts: %', contract_count;
    RAISE NOTICE 'Remaining documents: %', document_count;
    RAISE NOTICE 'Remaining service scopes: %', service_scope_count;
    
    IF client_count = 0 AND contract_count = 0 AND document_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All client, contract, and document data has been removed';
    ELSE
        RAISE WARNING 'Some data may still remain - please verify manually';
    END IF;
END $$;

-- Log completion
INSERT INTO audit_logs (
    action, 
    entity_type, 
    description, 
    severity, 
    category, 
    timestamp
) VALUES (
    'BULK_DELETE_COMPLETE', 
    'SYSTEM', 
    'Complete system data cleanup finished successfully', 
    'info', 
    'data_management', 
    NOW()
);

-- Commit the transaction
COMMIT;

-- ========================================
-- POST-CLEANUP RECOMMENDATIONS
-- ========================================
/*
After running this cleanup:

1. Verify the cleanup was successful:
   SELECT COUNT(*) FROM clients;
   SELECT COUNT(*) FROM contracts;
   SELECT COUNT(*) FROM documents;

2. If you want to reset auto-increment sequences:
   ALTER SEQUENCE clients_id_seq RESTART WITH 1;
   ALTER SEQUENCE contracts_id_seq RESTART WITH 1;
   ALTER SEQUENCE documents_id_seq RESTART WITH 1;

3. Consider running VACUUM ANALYZE to reclaim disk space:
   VACUUM ANALYZE;

4. If you deleted uploaded files, clean up the uploads directory:
   rm -rf uploads/*

Note: This migration does not handle True Positives (TP) or False Positives (FP) 
as these tables were not found in the current schema. If such tables exist,
they would need to be added to this cleanup script.
*/ 