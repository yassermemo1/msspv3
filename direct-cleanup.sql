-- Direct cleanup script - removes all client data
-- WARNING: This permanently deletes all data!

-- Show current counts
SELECT 'Before cleanup:' as status;
SELECT 'Clients: ' || COUNT(*) as count FROM clients;
SELECT 'Contracts: ' || COUNT(*) as count FROM contracts;
SELECT 'Documents: ' || COUNT(*) as count FROM documents;

-- Delete in order to respect foreign key constraints

-- Delete dependent data first
DELETE FROM document_access;
DELETE FROM document_versions;
DELETE FROM client_licenses;
DELETE FROM individual_licenses;
DELETE FROM certificates_of_compliance;
DELETE FROM service_authorization_forms;
DELETE FROM proposals;
DELETE FROM client_feedback;
DELETE FROM client_satisfaction_surveys;
DELETE FROM financial_transactions WHERE client_id IS NOT NULL OR contract_id IS NOT NULL;

-- Delete service scopes if they exist
DELETE FROM service_scopes WHERE contract_id IS NOT NULL;

-- Delete core data
DELETE FROM documents;
DELETE FROM client_contacts;
DELETE FROM contracts;
DELETE FROM clients;

-- Show final counts
SELECT 'After cleanup:' as status;
SELECT 'Clients: ' || COUNT(*) as count FROM clients;
SELECT 'Contracts: ' || COUNT(*) as count FROM contracts;
SELECT 'Documents: ' || COUNT(*) as count FROM documents;

-- Clean up uploads directory reference
SELECT 'Cleanup completed - all client, contract, and document data removed!' as result; 
 