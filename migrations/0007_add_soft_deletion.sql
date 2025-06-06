-- Migration: Add soft deletion support to clients table
-- Date: January 2025
-- Purpose: Enable soft deletion for clients to preserve historical data

-- Add deleted_at column to clients table
ALTER TABLE "public"."clients" ADD COLUMN "deleted_at" timestamp;

-- Add index for better performance when filtering deleted clients
CREATE INDEX "idx_clients_deleted_at" ON "public"."clients" ("deleted_at");

-- Add index for active clients (deleted_at IS NULL)
CREATE INDEX "idx_clients_active" ON "public"."clients" ("deleted_at") WHERE "deleted_at" IS NULL;

-- Update existing status enum to include 'archived' status
-- This is for display purposes while maintaining the deleted_at field for actual deletion
ALTER TABLE "public"."clients" DROP CONSTRAINT IF EXISTS "clients_status_check";
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_status_check" 
  CHECK (status = ANY (ARRAY['prospect'::text, 'active'::text, 'inactive'::text, 'suspended'::text, 'archived'::text]));

-- Add comment for documentation
COMMENT ON COLUMN "public"."clients"."deleted_at" IS 'Timestamp when client was soft deleted (archived). NULL means active client.'; 