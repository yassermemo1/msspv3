CREATE TABLE "service_scope_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"field_type" text NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"placeholder_text" text,
	"help_text" text,
	"default_value" text,
	"select_options" jsonb,
	"validation_rules" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_authorization_forms" DROP CONSTRAINT "service_authorization_forms_saf_number_unique";--> statement-breakpoint
ALTER TABLE "service_authorization_forms" DROP CONSTRAINT "client_contract_consistency";--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_service_scope_id_service_scopes_id_fk";
--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "file_size" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "mime_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "file_path" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "expiration_date" timestamp;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "compliance_type" text;--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ADD COLUMN "requested_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ADD COLUMN "expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "service_scope_fields" ADD CONSTRAINT "service_scope_fields_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_clients_active" ON "clients" USING btree ("deleted_at") WHERE "clients"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_clients_deleted_at" ON "clients" USING btree ("deleted_at");--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "file_url";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "service_scope_id";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "is_public";--> statement-breakpoint
ALTER TABLE "service_authorization_forms" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "service_authorization_forms" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "service_authorization_forms" DROP COLUMN "end_date";--> statement-breakpoint
ALTER TABLE "service_authorization_forms" DROP COLUMN "document_url";--> statement-breakpoint
ALTER TABLE "service_authorization_forms" DROP COLUMN "value";--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_status_check" CHECK (status = ANY (ARRAY['prospect'::text, 'active'::text, 'inactive'::text, 'suspended'::text, 'archived'::text]));