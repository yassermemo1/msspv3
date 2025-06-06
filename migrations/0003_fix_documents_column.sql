-- Migration: Fix documents table column reference
-- Date: 2025-06-01
-- Description: Fix references to file_url column which should be file_path

-- Update any queries or code that references 'file_url' to use 'file_path'
-- The documents table already has 'file_path' column, but some code may be referencing the old 'file_url' name

-- Add a comment to clarify the correct column name
COMMENT ON COLUMN documents.file_path IS 'File path for the document (previously referenced as file_url in some code)';

-- Ensure the file_path column has proper constraints
ALTER TABLE documents ALTER COLUMN file_path SET NOT NULL;

-- Create an index on file_path for better performance
CREATE INDEX IF NOT EXISTS idx_documents_file_path ON documents(file_path);

-- Create an index on document_type for filtering
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- Create an index on client_id for client-specific document queries
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id); 