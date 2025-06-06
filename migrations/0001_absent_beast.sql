CREATE TABLE "client_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_satisfaction_surveys" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_permissions_page_name_unique" UNIQUE("page_name")
);
--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" DROP CONSTRAINT "certificates_of_compliance_coc_number_unique";--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ALTER COLUMN "issued_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates_of_compliance" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "api_endpoint" text;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "auth_type" text;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "auth_config" jsonb;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "sync_frequency" text DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "last_sync_at" timestamp;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "default_page_size" integer DEFAULT 100;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "max_page_size" integer DEFAULT 1000;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "supports_pagination" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "pagination_type" text DEFAULT 'offset';--> statement-breakpoint
ALTER TABLE "data_sources" ADD COLUMN "pagination_config" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "auth_provider" text DEFAULT 'local' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ldap_id" text;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_service_scope_id_service_scopes_id_fk" FOREIGN KEY ("service_scope_id") REFERENCES "public"."service_scopes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_satisfaction_surveys" ADD CONSTRAINT "client_satisfaction_surveys_conducted_by_users_id_fk" FOREIGN KEY ("conducted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_ldap_id_unique" UNIQUE("ldap_id");--> statement-breakpoint
ALTER TABLE "service_authorization_forms" ADD CONSTRAINT "client_contract_consistency" CHECK ((SELECT client_id FROM contracts WHERE id = "service_authorization_forms"."contract_id") = "service_authorization_forms"."client_id");