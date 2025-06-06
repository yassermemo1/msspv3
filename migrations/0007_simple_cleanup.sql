-- ========================================
-- SIMPLE DATA CLEANUP MIGRATION
-- ========================================
-- This migration removes ALL data from existing client-related tables
-- Only operates on tables that exist in the current schema
-- 
-- WARNING: This will permanently delete all data!
-- ========================================

-- Get current counts first
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
    
    -- Only check service_scopes if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_scopes') THEN
        SELECT COUNT(*) INTO service_scope_count FROM service_scopes;
    ELSE
        service_scope_count := 0;
    END IF;
    
    RAISE NOTICE 'Starting cleanup:';
    RAISE NOTICE 'Current clients: %', client_count;
    RAISE NOTICE 'Current contracts: %', contract_count;
    RAISE NOTICE 'Current documents: %', document_count;
    RAISE NOTICE 'Current service scopes: %', service_scope_count;
END $$;

-- Start transaction for safety
BEGIN;

-- Log the cleanup operation (if audit_logs table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
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
            'Simple data cleanup - deleting all clients, contracts, documents, and related data', 
            'critical', 
            'data_management', 
            NOW()
        );
        RAISE NOTICE 'Cleanup logged to audit_logs';
    END IF;
END $$;

-- ========================================
-- STEP 1: Delete dependent records first
-- ========================================

-- Delete document-related data (if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_access') THEN
        DELETE FROM document_access;
        RAISE NOTICE 'Deleted document_access records';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_versions') THEN
        DELETE FROM document_versions;
        RAISE NOTICE 'Deleted document_versions records';
    END IF;
END $$;

-- Delete client assets and licenses (if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_licenses') THEN
        DELETE FROM client_licenses;
        RAISE NOTICE 'Deleted client_licenses records';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hardware_assets') THEN
        DELETE FROM hardware_assets WHERE client_id IS NOT NULL;
        RAISE NOTICE 'Deleted client hardware_assets records';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'software_assets') THEN
        DELETE FROM software_assets WHERE client_id IS NOT NULL;
        RAISE NOTICE 'Deleted client software_assets records';
    END IF;
END $$;

-- Delete service-related data (if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_incidents') THEN
        DELETE FROM service_incidents WHERE service_scope_id IN (SELECT id FROM service_scopes);
        RAISE NOTICE 'Deleted service_incidents records';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_deliverables') THEN
        DELETE FROM service_deliverables WHERE service_scope_id IN (SELECT id FROM service_scopes);
        RAISE NOTICE 'Deleted service_deliverables records';
    END IF;
END $$;

-- Delete certificates and authorizations (if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificates_of_compliance') THEN
        DELETE FROM certificates_of_compliance;
        RAISE NOTICE 'Deleted certificates_of_compliance records';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_authorization_forms') THEN
        DELETE FROM service_authorization_forms;
        RAISE NOTICE 'Deleted service_authorization_forms records';
    END IF;
END $$;

-- Delete proposals and feedback (if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'proposals') THEN
        DELETE FROM proposals;
        RAISE NOTICE 'Deleted proposals records';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_feedback') THEN
        DELETE FROM client_feedback;
        RAISE NOTICE 'Deleted client_feedback records';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_satisfaction_surveys') THEN
        DELETE FROM client_satisfaction_surveys;
        RAISE NOTICE 'Deleted client_satisfaction_surveys records';
    END IF;
END $$;

-- Delete financial data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_transactions') THEN
        DELETE FROM financial_transactions WHERE client_id IS NOT NULL OR contract_id IS NOT NULL;
        RAISE NOTICE 'Deleted client/contract financial_transactions records';
    END IF;
END $$;

-- ========================================
-- STEP 2: Delete core entity relationships
-- ========================================

-- Delete service scopes (which depend on contracts)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_scopes') THEN
        DELETE FROM service_scopes WHERE contract_id IS NOT NULL;
        RAISE NOTICE 'Deleted contract service_scopes records';
    END IF;
END $$;

-- Delete documents
DELETE FROM documents;
RAISE NOTICE 'Deleted all documents records';

-- Delete client contacts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_contacts') THEN
        DELETE FROM client_contacts;
        RAISE NOTICE 'Deleted client_contacts records';
    END IF;
END $$;

-- ========================================
-- STEP 3: Delete contracts
-- ========================================
DELETE FROM contracts;
RAISE NOTICE 'Deleted all contracts records';

-- ========================================
-- STEP 4: Delete clients (final step)
-- ========================================
DELETE FROM clients;
RAISE NOTICE 'Deleted all clients records';

-- ========================================
-- STEP 5: Clean up orphaned data
-- ========================================

-- Clean up any remaining orphaned service scopes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_scopes') THEN
        DELETE FROM service_scopes WHERE contract_id IS NULL AND client_id IS NULL;
        RAISE NOTICE 'Deleted orphaned service_scopes records';
    END IF;
END $$;

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
    
    -- Only check service_scopes if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_scopes') THEN
        SELECT COUNT(*) INTO service_scope_count FROM service_scopes;
    ELSE
        service_scope_count := 0;
    END IF;
    
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

-- Log completion (if audit_logs table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
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
            'Simple data cleanup finished successfully', 
            'info', 
            'data_management', 
            NOW()
        );
        RAISE NOTICE 'Cleanup completion logged to audit_logs';
    END IF;
END $$;

-- Commit the transaction
COMMIT;

RAISE NOTICE 'Data cleanup completed successfully!'; 