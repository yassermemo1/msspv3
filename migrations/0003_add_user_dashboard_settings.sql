CREATE TABLE "user_dashboard_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"card_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"category" text DEFAULT 'dashboard' NOT NULL,
	"data_source" text NOT NULL,
	"size" text DEFAULT 'small' NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"is_built_in" boolean DEFAULT false NOT NULL,
	"is_removable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_dashboard_settings_user_id_card_id_unique" UNIQUE("user_id","card_id")
);
--> statement-breakpoint
ALTER TABLE "user_dashboard_settings" ADD CONSTRAINT "user_dashboard_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;