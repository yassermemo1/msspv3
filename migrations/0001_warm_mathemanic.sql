CREATE TABLE "global_search_index" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"search_content" text NOT NULL,
	"keywords" text[],
	"last_indexed" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" DROP CONSTRAINT "certificates_of_compliance_coc_number_unique";--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_survey_type_check";--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_overall_satisfaction_check";--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_service_quality_check";--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_response_time_check";--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_communication_check";--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_technical_expertise_check";--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_value_for_money_check";--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_likelihood_to_recommend_check";--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_status_check";--> statement-breakpoint
ALTER TABLE "client_feedback" DROP CONSTRAINT "client_feedback_feedback_type_check";--> statement-breakpoint
ALTER TABLE "client_feedback" DROP CONSTRAINT "client_feedback_category_check";--> statement-breakpoint
ALTER TABLE "client_feedback" DROP CONSTRAINT "client_feedback_priority_check";--> statement-breakpoint
ALTER TABLE "client_feedback" DROP CONSTRAINT "client_feedback_contact_method_check";--> statement-breakpoint
ALTER TABLE "client_feedback" DROP CONSTRAINT "client_feedback_satisfaction_rating_check";--> statement-breakpoint
ALTER TABLE "client_feedback" DROP CONSTRAINT "client_feedback_status_check";--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_client_id_fkey";
--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_contract_id_fkey";
--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_service_scope_id_fkey";
--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" DROP CONSTRAINT "client_satisfaction_surveys_conducted_by_fkey";
--> statement-breakpoint
ALTER TABLE "client_feedback" DROP CONSTRAINT "client_feedback_client_id_fkey";
--> statement-breakpoint
ALTER TABLE "client_feedback" DROP CONSTRAINT "client_feedback_contract_id_fkey";
--> statement-breakpoint
ALTER TABLE "client_feedback" DROP CONSTRAINT "client_feedback_service_scope_id_fkey";
--> statement-breakpoint
ALTER TABLE "client_feedback" DROP CONSTRAINT "client_feedback_assigned_to_fkey";
--> statement-breakpoint
ALTER TABLE "client_feedback" DROP CONSTRAINT "client_feedback_resolved_by_fkey";
--> statement-breakpoint
ALTER TABLE "saved_searches" DROP CONSTRAINT "saved_searches_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "search_history" DROP CONSTRAINT "search_history_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "client_hardware_assignments" DROP CONSTRAINT "client_hardware_assignments_hardware_asset_id_hardware_assets_i";
--> statement-breakpoint
ALTER TABLE "client_hardware_assignments" DROP CONSTRAINT "client_hardware_assignments_service_scope_id_service_scopes_id_";
--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" DROP CONSTRAINT "certificates_of_compliance_service_scope_id_service_scopes_id_f";
--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" DROP CONSTRAINT "certificates_of_compliance_saf_id_service_authorization_forms_i";
--> statement-breakpoint
ALTER TABLE "user_dashboards" DROP CONSTRAINT "user_dashboards_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "change_history" DROP CONSTRAINT "change_history_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "security_events" DROP CONSTRAINT "security_events_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "data_access_logs" DROP CONSTRAINT "data_access_logs_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "company_settings" DROP CONSTRAINT "company_settings_updated_by_fkey";
--> statement-breakpoint
ALTER TABLE "service_authorization_forms" DROP CONSTRAINT "service_authorization_forms_service_scope_id_service_scopes_id_";
--> statement-breakpoint
DROP INDEX "idx_satisfaction_surveys_client_date";--> statement-breakpoint
DROP INDEX "idx_satisfaction_surveys_date";--> statement-breakpoint
DROP INDEX "idx_client_feedback_client_date";--> statement-breakpoint
DROP INDEX "idx_client_feedback_status";--> statement-breakpoint
DROP INDEX "idx_client_feedback_type";--> statement-breakpoint
DROP INDEX "idx_saved_searches_is_public";--> statement-breakpoint
DROP INDEX "idx_saved_searches_is_quick_filter";--> statement-breakpoint
DROP INDEX "idx_saved_searches_user_id";--> statement-breakpoint
DROP INDEX "idx_search_history_created_at";--> statement-breakpoint
DROP INDEX "idx_search_history_user_id";--> statement-breakpoint
DROP INDEX "users_ldap_id_unique";--> statement-breakpoint
DROP INDEX "idx_proposals_contract_id";--> statement-breakpoint
DROP INDEX "idx_proposals_contract_type";--> statement-breakpoint
DROP INDEX "idx_proposals_type_status";--> statement-breakpoint
DROP INDEX "idx_audit_logs_action";--> statement-breakpoint
DROP INDEX "idx_audit_logs_entity";--> statement-breakpoint
DROP INDEX "idx_audit_logs_timestamp";--> statement-breakpoint
DROP INDEX "idx_audit_logs_user_id";--> statement-breakpoint
DROP INDEX "idx_change_history_batch_id";--> statement-breakpoint
DROP INDEX "idx_change_history_entity";--> statement-breakpoint
DROP INDEX "idx_change_history_timestamp";--> statement-breakpoint
DROP INDEX "idx_change_history_user_id";--> statement-breakpoint
DROP INDEX "idx_security_events_event_type";--> statement-breakpoint
DROP INDEX "idx_security_events_timestamp";--> statement-breakpoint
DROP INDEX "idx_security_events_user_id";--> statement-breakpoint
DROP INDEX "idx_data_access_logs_entity";--> statement-breakpoint
DROP INDEX "idx_data_access_logs_timestamp";--> statement-breakpoint
DROP INDEX "idx_data_access_logs_user_id";--> statement-breakpoint
DROP INDEX "idx_system_events_category";--> statement-breakpoint
DROP INDEX "idx_system_events_timestamp";--> statement-breakpoint
DROP INDEX "idx_company_settings_ldap_enabled";--> statement-breakpoint
DROP INDEX "idx_page_permissions_active";--> statement-breakpoint
DROP INDEX "idx_page_permissions_category";--> statement-breakpoint
DROP INDEX "idx_page_permissions_url";--> statement-breakpoint
DROP INDEX "idx_contracts_client_id";--> statement-breakpoint
DROP INDEX "idx_contracts_client_id_name";--> statement-breakpoint
DROP INDEX "idx_service_authorization_forms_client_contract";--> statement-breakpoint
DROP INDEX "idx_service_authorization_forms_saf_number";--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "client_feedback" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "saved_searches" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "saved_searches" ALTER COLUMN "is_public" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "saved_searches" ALTER COLUMN "is_quick_filter" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "saved_searches" ALTER COLUMN "use_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "saved_searches" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "saved_searches" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "search_history" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "search_history" ALTER COLUMN "results_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "search_history" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "file_size" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "mime_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "auth_provider" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "data_sources" ALTER COLUMN "api_endpoint" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "data_sources" ALTER COLUMN "auth_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_dashboards" ALTER COLUMN "layout" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "change_history" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "security_events" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "data_access_logs" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "system_events" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "page_permissions" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "file_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "service_scope_id" integer;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "service_scopes" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "service_scopes" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "service_scopes" ADD COLUMN "status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD COLUMN "widget_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD COLUMN "refresh_interval" integer;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "connection_string" text;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "config" jsonb;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "last_connected" timestamp;--> statement-breakpoint
ALTER TABLE "user_dashboards" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_conducted_by_users_id_fk" FOREIGN KEY ("conducted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_hardware_assignments" ADD CONSTRAINT "client_hardware_assignments_hardware_asset_id_hardware_assets_id_fk" FOREIGN KEY ("hardware_asset_id") REFERENCES "public"."hardware_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_hardware_assignments" ADD CONSTRAINT "client_hardware_assignments_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ADD CONSTRAINT "certificates_of_compliance_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ADD CONSTRAINT "certificates_of_compliance_saf_id_service_authorization_forms_id_fk" FOREIGN KEY ("saf_id") REFERENCES "public"."service_authorization_forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dashboards" ADD CONSTRAINT "user_dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_history" ADD CONSTRAINT "change_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_access_logs" ADD CONSTRAINT "data_access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ADD CONSTRAINT "service_authorization_forms_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "file_path";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "version";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "expiration_date";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "compliance_type";--> statement-breakpoint
ALTER TABLE "dashboard_widgets" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "dashboard_widgets" DROP COLUMN "position";--> statement-breakpoint
ALTER TABLE "user_dashboards" DROP COLUMN "is_shared";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_ldap_id_unique" UNIQUE("ldap_id");--> statement-breakpoint
ALTER TABLE "page_permissions" ADD CONSTRAINT "page_permissions_page_name_unique" UNIQUE("page_name");--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ADD CONSTRAINT "client_contract_consistency" CHECK ((SELECT client_id FROM contracts WHERE id = "service_authorization_forms"."contract_id") = "service_authorization_forms"."client_id");