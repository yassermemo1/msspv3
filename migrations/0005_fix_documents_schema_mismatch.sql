-- Migration: Fix documents table schema mismatch
-- Date: 2025-06-01
-- Description: Resolve schema inconsistency between file_url and file_path columns

-- Check current schema and fix the column naming
-- The database currently has file_url but code expects file_path

-- First, check if file_url exists and file_path doesn't exist
DO $$ 
BEGIN
    -- If file_url exists and file_path doesn't, rename file_url to file_path
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'file_url'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'file_path'
    ) THEN
        ALTER TABLE documents RENAME COLUMN file_url TO file_path;
        RAISE NOTICE 'Renamed file_url column to file_path';
    END IF;
    
    -- If both exist, migrate data from file_url to file_path and drop file_url
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'file_url'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'file_path'
    ) THEN
        -- Update file_path with file_url data where file_path is null
        UPDATE documents 
        SET file_path = file_url 
        WHERE file_path IS NULL OR file_path = '';
        
        -- Drop the file_url column
        ALTER TABLE documents DROP COLUMN file_url;
        RAISE NOTICE 'Migrated data from file_url to file_path and dropped file_url column';
    END IF;
END $$;

-- Ensure file_path column has proper constraints
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'file_path'
    ) THEN
        -- Make sure file_path is not null
        ALTER TABLE documents ALTER COLUMN file_path SET NOT NULL;
        RAISE NOTICE 'Set file_path column to NOT NULL';
    END IF;
END $$;

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_documents_file_path ON documents(file_path);
CREATE INDEX IF NOT EXISTS idx_documents_type_client ON documents(document_type, client_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Add column comments for clarity
COMMENT ON COLUMN documents.file_path IS 'Path to the stored document file (standardized from file_url)';
COMMENT ON COLUMN documents.document_type IS 'Type of document: contract, compliance, technical, financial, general';
COMMENT ON COLUMN documents.client_id IS 'Associated client ID (nullable for global documents)';

-- Update related tables to ensure consistency
-- Fix any remaining issues with other tables that might reference old column names

-- Add missing columns that might be expected
DO $$
BEGIN
    -- Add version column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'version'
    ) THEN
        ALTER TABLE documents ADD COLUMN version integer DEFAULT 1 NOT NULL;
        RAISE NOTICE 'Added version column to documents table';
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE documents ADD COLUMN is_active boolean DEFAULT true NOT NULL;
        RAISE NOTICE 'Added is_active column to documents table';
    END IF;
    
    -- Add expiration_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'expiration_date'
    ) THEN
        ALTER TABLE documents ADD COLUMN expiration_date timestamp;
        RAISE NOTICE 'Added expiration_date column to documents table';
    END IF;
    
    -- Add compliance_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'compliance_type'
    ) THEN
        ALTER TABLE documents ADD COLUMN compliance_type text;
        RAISE NOTICE 'Added compliance_type column to documents table';
    END IF;
END $$; 