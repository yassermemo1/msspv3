CREATE TABLE "company_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text DEFAULT 'MSSP Client Manager' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"timezone" text DEFAULT 'America/New_York' NOT NULL,
	"fiscal_year_start" text DEFAULT '01-01' NOT NULL,
	"date_format" text DEFAULT 'MM/DD/YYYY' NOT NULL,
	"time_format" text DEFAULT '12h' NOT NULL,
	"logo_url" text,
	"primary_color" text DEFAULT '#3b82f6' NOT NULL,
	"secondary_color" text DEFAULT '#64748b' NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"website" text,
	"tax_id" text,
	"registration_number" text,
	"email_notifications_enabled" boolean DEFAULT true NOT NULL,
	"sms_notifications_enabled" boolean DEFAULT false NOT NULL,
	"session_timeout_minutes" integer DEFAULT 480 NOT NULL,
	"password_expiry_days" integer DEFAULT 90 NOT NULL,
	"max_login_attempts" integer DEFAULT 5 NOT NULL,
	"audit_log_retention_days" integer DEFAULT 2555 NOT NULL,
	"backup_retention_days" integer DEFAULT 365 NOT NULL,
	"api_rate_limit" integer DEFAULT 1000 NOT NULL,
	"webhook_retry_attempts" integer DEFAULT 3 NOT NULL,
	"advanced_search_enabled" boolean DEFAULT true NOT NULL,
	"audit_logging_enabled" boolean DEFAULT true NOT NULL,
	"two_factor_required" boolean DEFAULT false NOT NULL,
	"data_export_enabled" boolean DEFAULT true NOT NULL,
	"ldap_enabled" boolean DEFAULT false NOT NULL,
	"ldap_url" text,
	"ldap_bind_dn" text,
	"ldap_bind_password" text,
	"ldap_search_base" text,
	"ldap_search_filter" text DEFAULT '(uid={{username}})',
	"ldap_username_attribute" text DEFAULT 'uid',
	"ldap_email_attribute" text DEFAULT 'mail',
	"ldap_first_name_attribute" text DEFAULT 'givenName',
	"ldap_last_name_attribute" text DEFAULT 'sn',
	"ldap_default_role" text DEFAULT 'user',
	"ldap_group_search_base" text,
	"ldap_group_search_filter" text,
	"ldap_admin_group" text,
	"ldap_manager_group" text,
	"ldap_engineer_group" text,
	"ldap_connection_timeout" integer DEFAULT 5000,
	"ldap_search_timeout" integer DEFAULT 10000,
	"ldap_certificate_verification" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
ALTER TABLE "user_dashboards" DROP CONSTRAINT "user_dashboards_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "change_history" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "client_team_assignments" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ALTER COLUMN "created_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "dashboards" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data_access_logs" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data_sources" ALTER COLUMN "created_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "document_access" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "document_access" ALTER COLUMN "granted_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "document_versions" ALTER COLUMN "uploaded_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "file_size" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "mime_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "uploaded_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "external_systems" ALTER COLUMN "created_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "saved_searches" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "search_history" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "security_events" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ALTER COLUMN "approved_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "user_dashboards" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "file_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "service_scope_id" integer;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "service_scopes" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "service_scopes" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "service_scopes" ADD COLUMN "status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dashboards" ADD CONSTRAINT "user_dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "file_path";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "version";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "expiration_date";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "compliance_type";