-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "client_satisfaction_surveys" (
	"id" serial NOT NULL,
	"client_id" integer NOT NULL,
	"contract_id" integer,
	"service_scope_id" integer,
	"survey_date" timestamp NOT NULL,
	"survey_type" text NOT NULL,
	"overall_satisfaction" integer NOT NULL,
	"service_quality" integer,
	"response_time" integer,
	"communication" integer,
	"technical_expertise" integer,
	"value_for_money" integer,
	"likelihood_to_recommend" integer,
	"feedback" text,
	"improvements" text,
	"compliments" text,
	"concerns" text,
	"status" text DEFAULT 'completed',
	"conducted_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "client_satisfaction_surveys_survey_type_check" CHECK (survey_type = ANY (ARRAY['quarterly'::text, 'annual'::text, 'project_completion'::text, 'incident_followup'::text])),
	CONSTRAINT "client_satisfaction_surveys_overall_satisfaction_check" CHECK ((overall_satisfaction >= 1) AND (overall_satisfaction <= 5)),
	CONSTRAINT "client_satisfaction_surveys_service_quality_check" CHECK ((service_quality >= 1) AND (service_quality <= 5)),
	CONSTRAINT "client_satisfaction_surveys_response_time_check" CHECK ((response_time >= 1) AND (response_time <= 5)),
	CONSTRAINT "client_satisfaction_surveys_communication_check" CHECK ((communication >= 1) AND (communication <= 5)),
	CONSTRAINT "client_satisfaction_surveys_technical_expertise_check" CHECK ((technical_expertise >= 1) AND (technical_expertise <= 5)),
	CONSTRAINT "client_satisfaction_surveys_value_for_money_check" CHECK ((value_for_money >= 1) AND (value_for_money <= 5)),
	CONSTRAINT "client_satisfaction_surveys_likelihood_to_recommend_check" CHECK ((likelihood_to_recommend >= 1) AND (likelihood_to_recommend <= 10)),
	CONSTRAINT "client_satisfaction_surveys_status_check" CHECK (status = ANY (ARRAY['sent'::text, 'in_progress'::text, 'completed'::text, 'expired'::text]))
);
--> statement-breakpoint
CREATE TABLE "client_feedback" (
	"id" serial NOT NULL,
	"client_id" integer NOT NULL,
	"contract_id" integer,
	"service_scope_id" integer,
	"feedback_date" timestamp DEFAULT now(),
	"feedback_type" text NOT NULL,
	"category" text,
	"priority" text DEFAULT 'medium',
	"title" text NOT NULL,
	"description" text NOT NULL,
	"contact_method" text,
	"satisfaction_rating" integer,
	"status" text DEFAULT 'open',
	"assigned_to" integer,
	"resolved_by" integer,
	"resolved_at" timestamp,
	"resolution_notes" text,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "client_feedback_feedback_type_check" CHECK (feedback_type = ANY (ARRAY['compliment'::text, 'complaint'::text, 'suggestion'::text, 'inquiry'::text, 'escalation'::text])),
	CONSTRAINT "client_feedback_category_check" CHECK (category = ANY (ARRAY['service_delivery'::text, 'communication'::text, 'billing'::text, 'technical'::text, 'other'::text])),
	CONSTRAINT "client_feedback_priority_check" CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])),
	CONSTRAINT "client_feedback_contact_method_check" CHECK (contact_method = ANY (ARRAY['phone'::text, 'email'::text, 'portal'::text, 'meeting'::text, 'ticket'::text])),
	CONSTRAINT "client_feedback_satisfaction_rating_check" CHECK ((satisfaction_rating >= 1) AND (satisfaction_rating <= 5)),
	CONSTRAINT "client_feedback_status_check" CHECK (status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text]))
);
--> statement-breakpoint
CREATE TABLE "saved_searches" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"search_config" text NOT NULL,
	"entity_types" text[] NOT NULL,
	"is_public" boolean NOT NULL,
	"is_quick_filter" boolean NOT NULL,
	"use_count" integer NOT NULL,
	"last_used" timestamp,
	"tags" text[],
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"field_name" text NOT NULL,
	"field_type" text NOT NULL,
	"field_options" jsonb,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"search_query" text NOT NULL,
	"search_config" text,
	"entity_types" text[] NOT NULL,
	"results_count" integer NOT NULL,
	"execution_time" integer,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_hardware_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"hardware_asset_id" integer NOT NULL,
	"service_scope_id" integer,
	"assigned_date" timestamp DEFAULT now() NOT NULL,
	"returned_date" timestamp,
	"installation_location" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"company_size" text,
	"status" text DEFAULT 'prospect' NOT NULL,
	"source" text,
	"address" text,
	"website" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"document_type" text NOT NULL,
	"client_id" integer,
	"contract_id" integer,
	"uploaded_by" integer NOT NULL,
	"tags" text[],
	"expiration_date" timestamp,
	"compliance_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hardware_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"manufacturer" text,
	"model" text,
	"serial_number" text,
	"purchase_date" timestamp,
	"purchase_cost" numeric(10, 2),
	"warranty_expiry" timestamp,
	"status" text DEFAULT 'available' NOT NULL,
	"location" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"purchase_request_number" text,
	"purchase_order_number" text,
	CONSTRAINT "hardware_assets_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "license_pools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"vendor" text NOT NULL,
	"product_name" text NOT NULL,
	"license_type" text,
	"total_licenses" integer NOT NULL,
	"available_licenses" integer NOT NULL,
	"cost_per_license" numeric(8, 2),
	"renewal_date" timestamp,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ordered_licenses" integer DEFAULT 0 NOT NULL,
	"purchase_request_number" text,
	"purchase_order_number" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"two_factor_secret" text,
	"two_factor_backup_codes" text,
	"auth_provider" text DEFAULT 'local',
	"ldap_id" text,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"push_notifications" boolean DEFAULT false NOT NULL,
	"contract_reminders" boolean DEFAULT true NOT NULL,
	"financial_alerts" boolean DEFAULT true NOT NULL,
	"two_factor_auth" boolean DEFAULT false NOT NULL,
	"session_timeout" boolean DEFAULT true NOT NULL,
	"dark_mode" boolean DEFAULT false NOT NULL,
	"timezone" text DEFAULT 'America/New_York' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"auto_save_forms" boolean DEFAULT true NOT NULL,
	"data_export" boolean DEFAULT true NOT NULL,
	"api_access" boolean DEFAULT false NOT NULL,
	"data_retention_period" text DEFAULT '5years' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"title" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" integer NOT NULL,
	"type" text NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"document_url" text,
	"proposed_value" numeric(12, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"delivery_model" text NOT NULL,
	"base_price" numeric(10, 2),
	"pricing_unit" text,
	"scope_definition_template" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_scopes" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"scope_definition" jsonb,
	"saf_document_url" text,
	"saf_start_date" timestamp,
	"saf_end_date" timestamp,
	"saf_status" text DEFAULT 'pending',
	"monthly_value" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_widget_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"dashboard_id" integer NOT NULL,
	"widget_id" integer NOT NULL,
	"position" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates_of_compliance" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"contract_id" integer,
	"service_scope_id" integer,
	"saf_id" integer,
	"coc_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"compliance_type" text NOT NULL,
	"issue_date" timestamp NOT NULL,
	"expiry_date" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"document_url" text,
	"issued_by" integer,
	"audit_date" timestamp,
	"next_audit_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_of_compliance_coc_number_unique" UNIQUE("coc_number")
);
--> statement-breakpoint
CREATE TABLE "individual_licenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"service_scope_id" integer,
	"name" text NOT NULL,
	"vendor" text NOT NULL,
	"product_name" text NOT NULL,
	"license_key" text,
	"license_type" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"cost_per_license" numeric(8, 2),
	"purchase_date" timestamp,
	"expiry_date" timestamp,
	"renewal_date" timestamp,
	"purchase_request_number" text,
	"purchase_order_number" text,
	"document_url" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"data_source_id" integer,
	"config" jsonb NOT NULL,
	"position" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"api_endpoint" text NOT NULL,
	"auth_type" text NOT NULL,
	"auth_config" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp,
	"sync_frequency" text DEFAULT 'manual',
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"default_page_size" integer DEFAULT 100,
	"max_page_size" integer DEFAULT 1000,
	"supports_pagination" boolean DEFAULT true,
	"pagination_type" text DEFAULT 'offset',
	"pagination_config" jsonb
);
--> statement-breakpoint
CREATE TABLE "external_systems" (
	"id" serial PRIMARY KEY NOT NULL,
	"system_name" text NOT NULL,
	"display_name" text NOT NULL,
	"base_url" text NOT NULL,
	"auth_type" text NOT NULL,
	"auth_config" jsonb,
	"api_endpoints" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "external_systems_system_name_unique" UNIQUE("system_name")
);
--> statement-breakpoint
CREATE TABLE "client_external_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"system_name" text NOT NULL,
	"external_identifier" text NOT NULL,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_dashboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"layout" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_source_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"data_source_id" integer NOT NULL,
	"source_field" text NOT NULL,
	"target_field" text NOT NULL,
	"field_type" text NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"default_value" text,
	"transformation" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer,
	"entity_name" text,
	"description" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"severity" text DEFAULT 'info' NOT NULL,
	"category" text NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "change_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"entity_name" text,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"field_name" text,
	"old_value" text,
	"new_value" text,
	"change_reason" text,
	"automatic_change" boolean DEFAULT false NOT NULL,
	"batch_id" text,
	"rollback_data" jsonb,
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"event_type" text NOT NULL,
	"source" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"location" text,
	"device_fingerprint" text,
	"success" boolean NOT NULL,
	"failure_reason" text,
	"risk_score" integer,
	"blocked" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_access_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer,
	"entity_name" text,
	"access_type" text NOT NULL,
	"access_method" text NOT NULL,
	"data_scope" text,
	"filters" jsonb,
	"result_count" integer,
	"sensitive_data" boolean DEFAULT false NOT NULL,
	"purpose" text,
	"ip_address" text,
	"user_agent" text,
	"session_duration" integer,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"source" text NOT NULL,
	"severity" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"details" jsonb,
	"affected_entities" jsonb,
	"resolution" text,
	"resolved_at" timestamp,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
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
	"ldap_certificate_verification" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_field_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"custom_field_id" integer NOT NULL,
	"entity_id" integer NOT NULL,
	"value" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"version" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"change_notes" text,
	"uploaded_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_permissions" (
	"id" serial NOT NULL,
	"page_name" text NOT NULL,
	"page_url" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'main' NOT NULL,
	"icon" text,
	"admin_access" boolean DEFAULT true NOT NULL,
	"manager_access" boolean DEFAULT false NOT NULL,
	"engineer_access" boolean DEFAULT false NOT NULL,
	"user_access" boolean DEFAULT false NOT NULL,
	"requires_special_permission" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_team_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"assigned_date" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"auto_renewal" boolean DEFAULT false NOT NULL,
	"renewal_terms" text,
	"total_value" numeric(12, 2),
	"status" text DEFAULT 'draft' NOT NULL,
	"document_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_licenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"license_pool_id" integer NOT NULL,
	"service_scope_id" integer,
	"assigned_licenses" integer NOT NULL,
	"assigned_date" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"client_id" integer,
	"contract_id" integer,
	"service_scope_id" integer,
	"license_pool_id" integer,
	"hardware_asset_id" integer,
	"transaction_date" timestamp NOT NULL,
	"category" text,
	"reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"access_type" text NOT NULL,
	"granted_by" integer NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "service_authorization_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"contract_id" integer NOT NULL,
	"service_scope_id" integer,
	"saf_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"document_url" text,
	"approved_by" integer,
	"approved_date" timestamp,
	"value" numeric(12, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_authorization_forms_saf_number_unique" UNIQUE("saf_number")
);
--> statement-breakpoint
CREATE TABLE "widgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"dashboard_id" integer NOT NULL,
	"title" text NOT NULL,
	"widget_type" text NOT NULL,
	"data_source" text NOT NULL,
	"config" jsonb NOT NULL,
	"position" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrated_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"data_source_id" integer NOT NULL,
	"raw_data" jsonb NOT NULL,
	"mapped_data" jsonb NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	"record_identifier" text
);
--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_service_scope_id_fkey" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_conducted_by_fkey" FOREIGN KEY ("conducted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_service_scope_id_fkey" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_hardware_assignments" ADD CONSTRAINT "client_hardware_assignments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_hardware_assignments" ADD CONSTRAINT "client_hardware_assignments_hardware_asset_id_hardware_assets_i" FOREIGN KEY ("hardware_asset_id") REFERENCES "public"."hardware_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_hardware_assignments" ADD CONSTRAINT "client_hardware_assignments_service_scope_id_service_scopes_id_" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_scopes" ADD CONSTRAINT "service_scopes_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_scopes" ADD CONSTRAINT "service_scopes_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widget_assignments" ADD CONSTRAINT "dashboard_widget_assignments_dashboard_id_user_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."user_dashboards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widget_assignments" ADD CONSTRAINT "dashboard_widget_assignments_widget_id_dashboard_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."dashboard_widgets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ADD CONSTRAINT "certificates_of_compliance_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ADD CONSTRAINT "certificates_of_compliance_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ADD CONSTRAINT "certificates_of_compliance_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ADD CONSTRAINT "certificates_of_compliance_service_scope_id_service_scopes_id_f" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ADD CONSTRAINT "certificates_of_compliance_saf_id_service_authorization_forms_i" FOREIGN KEY ("saf_id") REFERENCES "public"."service_authorization_forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_licenses" ADD CONSTRAINT "individual_licenses_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_licenses" ADD CONSTRAINT "individual_licenses_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."data_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_systems" ADD CONSTRAINT "external_systems_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_external_mappings" ADD CONSTRAINT "client_external_mappings_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dashboards" ADD CONSTRAINT "user_dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_source_mappings" ADD CONSTRAINT "data_source_mappings_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."data_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_history" ADD CONSTRAINT "change_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_access_logs" ADD CONSTRAINT "data_access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_custom_field_id_custom_fields_id_fk" FOREIGN KEY ("custom_field_id") REFERENCES "public"."custom_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_team_assignments" ADD CONSTRAINT "client_team_assignments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_team_assignments" ADD CONSTRAINT "client_team_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_licenses" ADD CONSTRAINT "client_licenses_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_licenses" ADD CONSTRAINT "client_licenses_license_pool_id_license_pools_id_fk" FOREIGN KEY ("license_pool_id") REFERENCES "public"."license_pools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_licenses" ADD CONSTRAINT "client_licenses_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_license_pool_id_license_pools_id_fk" FOREIGN KEY ("license_pool_id") REFERENCES "public"."license_pools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_hardware_asset_id_hardware_assets_id_fk" FOREIGN KEY ("hardware_asset_id") REFERENCES "public"."hardware_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access" ADD CONSTRAINT "document_access_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access" ADD CONSTRAINT "document_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access" ADD CONSTRAINT "document_access_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ADD CONSTRAINT "service_authorization_forms_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ADD CONSTRAINT "service_authorization_forms_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ADD CONSTRAINT "service_authorization_forms_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ADD CONSTRAINT "service_authorization_forms_service_scope_id_service_scopes_id_" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dashboard_id_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."dashboards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrated_data" ADD CONSTRAINT "integrated_data_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."data_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_satisfaction_surveys_client_date" ON "client_satisfaction_surveys" USING btree ("client_id" int4_ops,"survey_date" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_satisfaction_surveys_date" ON "client_satisfaction_surveys" USING btree ("survey_date" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_client_feedback_client_date" ON "client_feedback" USING btree ("client_id" int4_ops,"feedback_date" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_client_feedback_status" ON "client_feedback" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_client_feedback_type" ON "client_feedback" USING btree ("feedback_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_saved_searches_is_public" ON "saved_searches" USING btree ("is_public" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_saved_searches_is_quick_filter" ON "saved_searches" USING btree ("is_quick_filter" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_saved_searches_user_id" ON "saved_searches" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_search_history_created_at" ON "search_history" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_search_history_user_id" ON "search_history" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_ldap_id_unique" ON "users" USING btree ("ldap_id" text_ops) WHERE (ldap_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_proposals_contract_id" ON "proposals" USING btree ("contract_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_proposals_contract_type" ON "proposals" USING btree ("contract_id" int4_ops,"type" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_proposals_type_status" ON "proposals" USING btree ("type" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity_type" int4_ops,"entity_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs" USING btree ("timestamp" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_change_history_batch_id" ON "change_history" USING btree ("batch_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_change_history_entity" ON "change_history" USING btree ("entity_type" text_ops,"entity_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_change_history_timestamp" ON "change_history" USING btree ("timestamp" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_change_history_user_id" ON "change_history" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_security_events_event_type" ON "security_events" USING btree ("event_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_security_events_timestamp" ON "security_events" USING btree ("timestamp" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_security_events_user_id" ON "security_events" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_entity" ON "data_access_logs" USING btree ("entity_type" text_ops,"entity_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_timestamp" ON "data_access_logs" USING btree ("timestamp" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_user_id" ON "data_access_logs" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_system_events_category" ON "system_events" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_system_events_timestamp" ON "system_events" USING btree ("timestamp" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_company_settings_ldap_enabled" ON "company_settings" USING btree ("ldap_enabled" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_page_permissions_active" ON "page_permissions" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_page_permissions_category" ON "page_permissions" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_page_permissions_url" ON "page_permissions" USING btree ("page_url" text_ops);--> statement-breakpoint
CREATE INDEX "idx_contracts_client_id" ON "contracts" USING btree ("client_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_contracts_client_id_name" ON "contracts" USING btree ("client_id" int4_ops,"name" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_service_authorization_forms_client_contract" ON "service_authorization_forms" USING btree ("client_id" int4_ops,"contract_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_service_authorization_forms_saf_number" ON "service_authorization_forms" USING btree ("saf_number" text_ops);
*/