import { pgTable, index, foreignKey, check, serial, integer, timestamp, text, boolean, unique, numeric, uniqueIndex, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const clientSatisfactionSurveys = pgTable("client_satisfaction_surveys", {
	id: serial().notNull(),
	clientId: integer("client_id").notNull(),
	contractId: integer("contract_id"),
	serviceScopeId: integer("service_scope_id"),
	surveyDate: timestamp("survey_date", { mode: 'string' }).notNull(),
	surveyType: text("survey_type").notNull(),
	overallSatisfaction: integer("overall_satisfaction").notNull(),
	serviceQuality: integer("service_quality"),
	responseTime: integer("response_time"),
	communication: integer(),
	technicalExpertise: integer("technical_expertise"),
	valueForMoney: integer("value_for_money"),
	likelihoodToRecommend: integer("likelihood_to_recommend"),
	feedback: text(),
	improvements: text(),
	compliments: text(),
	concerns: text(),
	status: text().default('completed'),
	conductedBy: integer("conducted_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_satisfaction_surveys_client_date").using("btree", table.clientId.asc().nullsLast().op("int4_ops"), table.surveyDate.asc().nullsLast().op("int4_ops")),
	index("idx_satisfaction_surveys_date").using("btree", table.surveyDate.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_satisfaction_surveys_client_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contractId],
			foreignColumns: [contracts.id],
			name: "client_satisfaction_surveys_contract_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.serviceScopeId],
			foreignColumns: [serviceScopes.id],
			name: "client_satisfaction_surveys_service_scope_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.conductedBy],
			foreignColumns: [users.id],
			name: "client_satisfaction_surveys_conducted_by_fkey"
		}).onDelete("set null"),
	check("client_satisfaction_surveys_survey_type_check", sql`survey_type = ANY (ARRAY['quarterly'::text, 'annual'::text, 'project_completion'::text, 'incident_followup'::text])`),
	check("client_satisfaction_surveys_overall_satisfaction_check", sql`(overall_satisfaction >= 1) AND (overall_satisfaction <= 5)`),
	check("client_satisfaction_surveys_service_quality_check", sql`(service_quality >= 1) AND (service_quality <= 5)`),
	check("client_satisfaction_surveys_response_time_check", sql`(response_time >= 1) AND (response_time <= 5)`),
	check("client_satisfaction_surveys_communication_check", sql`(communication >= 1) AND (communication <= 5)`),
	check("client_satisfaction_surveys_technical_expertise_check", sql`(technical_expertise >= 1) AND (technical_expertise <= 5)`),
	check("client_satisfaction_surveys_value_for_money_check", sql`(value_for_money >= 1) AND (value_for_money <= 5)`),
	check("client_satisfaction_surveys_likelihood_to_recommend_check", sql`(likelihood_to_recommend >= 1) AND (likelihood_to_recommend <= 10)`),
	check("client_satisfaction_surveys_status_check", sql`status = ANY (ARRAY['sent'::text, 'in_progress'::text, 'completed'::text, 'expired'::text])`),
]);

export const documents = pgTable("documents", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: text("mime_type").notNull(),
	version: integer().default(1).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	documentType: text("document_type").notNull(),
	clientId: integer("client_id"),
	contractId: integer("contract_id"),
	uploadedBy: integer("uploaded_by").notNull(),
	tags: text().array(),
	expirationDate: timestamp("expiration_date", { mode: 'string' }),
	complianceType: text("compliance_type"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "documents_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.contractId],
			foreignColumns: [contracts.id],
			name: "documents_contract_id_contracts_id_fk"
		}),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "documents_uploaded_by_users_id_fk"
		}),
]);

export const hardwareAssets = pgTable("hardware_assets", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	category: text().notNull(),
	manufacturer: text(),
	model: text(),
	serialNumber: text("serial_number"),
	purchaseDate: timestamp("purchase_date", { mode: 'string' }),
	purchaseCost: numeric("purchase_cost", { precision: 10, scale:  2 }),
	warrantyExpiry: timestamp("warranty_expiry", { mode: 'string' }),
	status: text().default('available').notNull(),
	location: text(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	purchaseRequestNumber: text("purchase_request_number"),
	purchaseOrderNumber: text("purchase_order_number"),
}, (table) => [
	unique("hardware_assets_serial_number_unique").on(table.serialNumber),
]);

export const licensePools = pgTable("license_pools", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	vendor: text().notNull(),
	productName: text("product_name").notNull(),
	licenseType: text("license_type"),
	totalLicenses: integer("total_licenses").notNull(),
	availableLicenses: integer("available_licenses").notNull(),
	costPerLicense: numeric("cost_per_license", { precision: 8, scale:  2 }),
	renewalDate: timestamp("renewal_date", { mode: 'string' }),
	notes: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	orderedLicenses: integer("ordered_licenses").default(0).notNull(),
	purchaseRequestNumber: text("purchase_request_number"),
	purchaseOrderNumber: text("purchase_order_number"),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text(),
	email: text().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	role: text().default('user').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	twoFactorSecret: text("two_factor_secret"),
	twoFactorBackupCodes: text("two_factor_backup_codes"),
	authProvider: text("auth_provider").default('local'),
	ldapId: text("ldap_id"),
}, (table) => [
	uniqueIndex("users_ldap_id_unique").using("btree", table.ldapId.asc().nullsLast().op("text_ops")).where(sql`(ldap_id IS NOT NULL)`),
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const userSettings = pgTable("user_settings", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	emailNotifications: boolean("email_notifications").default(true).notNull(),
	pushNotifications: boolean("push_notifications").default(false).notNull(),
	contractReminders: boolean("contract_reminders").default(true).notNull(),
	financialAlerts: boolean("financial_alerts").default(true).notNull(),
	twoFactorAuth: boolean("two_factor_auth").default(false).notNull(),
	sessionTimeout: boolean("session_timeout").default(true).notNull(),
	darkMode: boolean("dark_mode").default(false).notNull(),
	timezone: text().default('America/New_York').notNull(),
	language: text().default('en').notNull(),
	autoSaveForms: boolean("auto_save_forms").default(true).notNull(),
	dataExport: boolean("data_export").default(true).notNull(),
	apiAccess: boolean("api_access").default(false).notNull(),
	dataRetentionPeriod: text("data_retention_period").default('5years').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	currency: text().default('USD').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_settings_user_id_users_id_fk"
		}),
]);

export const clientContacts = pgTable("client_contacts", {
	id: serial().primaryKey().notNull(),
	clientId: integer("client_id").notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	title: text(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_contacts_client_id_clients_id_fk"
		}),
]);

export const proposals = pgTable("proposals", {
	id: serial().primaryKey().notNull(),
	contractId: integer("contract_id").notNull(),
	type: text().notNull(),
	version: text().default('1.0').notNull(),
	status: text().default('draft').notNull(),
	documentUrl: text("document_url"),
	proposedValue: numeric("proposed_value", { precision: 12, scale:  2 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_proposals_contract_id").using("btree", table.contractId.asc().nullsLast().op("int4_ops")),
	index("idx_proposals_contract_type").using("btree", table.contractId.asc().nullsLast().op("int4_ops"), table.type.asc().nullsLast().op("int4_ops")),
	index("idx_proposals_type_status").using("btree", table.type.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.contractId],
			foreignColumns: [contracts.id],
			name: "proposals_contract_id_contracts_id_fk"
		}),
]);

export const services = pgTable("services", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	category: text().notNull(),
	description: text(),
	deliveryModel: text("delivery_model").notNull(),
	basePrice: numeric("base_price", { precision: 10, scale:  2 }),
	pricingUnit: text("pricing_unit"),
	scopeDefinitionTemplate: jsonb("scope_definition_template"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const certificatesOfCompliance = pgTable("certificates_of_compliance", {
	id: serial().primaryKey().notNull(),
	clientId: integer("client_id").notNull(),
	contractId: integer("contract_id"),
	serviceScopeId: integer("service_scope_id"),
	safId: integer("saf_id"),
	cocNumber: text("coc_number").notNull(),
	title: text().notNull(),
	description: text(),
	complianceType: text("compliance_type").notNull(),
	issueDate: timestamp("issue_date", { mode: 'string' }).notNull(),
	expiryDate: timestamp("expiry_date", { mode: 'string' }),
	status: text().default('draft').notNull(),
	documentUrl: text("document_url"),
	issuedBy: integer("issued_by"),
	auditDate: timestamp("audit_date", { mode: 'string' }),
	nextAuditDate: timestamp("next_audit_date", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "certificates_of_compliance_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.contractId],
			foreignColumns: [contracts.id],
			name: "certificates_of_compliance_contract_id_contracts_id_fk"
		}),
	foreignKey({
			columns: [table.issuedBy],
			foreignColumns: [users.id],
			name: "certificates_of_compliance_issued_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.serviceScopeId],
			foreignColumns: [serviceScopes.id],
			name: "certificates_of_compliance_service_scope_id_service_scopes_id_f"
		}),
	foreignKey({
			columns: [table.safId],
			foreignColumns: [serviceAuthorizationForms.id],
			name: "certificates_of_compliance_saf_id_service_authorization_forms_i"
		}),
	unique("certificates_of_compliance_coc_number_unique").on(table.cocNumber),
]);

export const dashboardWidgets = pgTable("dashboard_widgets", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	dataSourceId: integer("data_source_id"),
	config: jsonb().notNull(),
	position: jsonb(),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.dataSourceId],
			foreignColumns: [dataSources.id],
			name: "dashboard_widgets_data_source_id_data_sources_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "dashboard_widgets_created_by_users_id_fk"
		}),
]);

export const dashboards = pgTable("dashboards", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "dashboards_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const dataSources = pgTable("data_sources", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	apiEndpoint: text("api_endpoint").notNull(),
	authType: text("auth_type").notNull(),
	authConfig: jsonb("auth_config"),
	isActive: boolean("is_active").default(true).notNull(),
	lastSyncAt: timestamp("last_sync_at", { mode: 'string' }),
	syncFrequency: text("sync_frequency").default('manual'),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	defaultPageSize: integer("default_page_size").default(100),
	maxPageSize: integer("max_page_size").default(1000),
	supportsPagination: boolean("supports_pagination").default(true),
	paginationType: text("pagination_type").default('offset'),
	paginationConfig: jsonb("pagination_config"),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "data_sources_created_by_users_id_fk"
		}),
]);

export const externalSystems = pgTable("external_systems", {
	id: serial().primaryKey().notNull(),
	systemName: text("system_name").notNull(),
	displayName: text("display_name").notNull(),
	baseUrl: text("base_url").notNull(),
	authType: text("auth_type").notNull(),
	authConfig: jsonb("auth_config"),
	apiEndpoints: jsonb("api_endpoints"),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "external_systems_created_by_users_id_fk"
		}),
	unique("external_systems_system_name_unique").on(table.systemName),
]);

export const clientExternalMappings = pgTable("client_external_mappings", {
	id: serial().primaryKey().notNull(),
	clientId: integer("client_id").notNull(),
	systemName: text("system_name").notNull(),
	externalIdentifier: text("external_identifier").notNull(),
	metadata: jsonb(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_external_mappings_client_id_clients_id_fk"
		}).onDelete("cascade"),
]);

export const userDashboards = pgTable("user_dashboards", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	name: text().notNull(),
	description: text(),
	layout: jsonb(),
	isDefault: boolean("is_default").default(false).notNull(),
	isShared: boolean("is_shared").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_dashboards_user_id_users_id_fk"
		}),
]);

export const dataSourceMappings = pgTable("data_source_mappings", {
	id: serial().primaryKey().notNull(),
	dataSourceId: integer("data_source_id").notNull(),
	sourceField: text("source_field").notNull(),
	targetField: text("target_field").notNull(),
	fieldType: text("field_type").notNull(),
	isRequired: boolean("is_required").default(false).notNull(),
	defaultValue: text("default_value"),
	transformation: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.dataSourceId],
			foreignColumns: [dataSources.id],
			name: "data_source_mappings_data_source_id_data_sources_id_fk"
		}),
]);

export const auditLogs = pgTable("audit_logs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	sessionId: text("session_id"),
	action: text().notNull(),
	entityType: text("entity_type").notNull(),
	entityId: integer("entity_id"),
	entityName: text("entity_name"),
	description: text().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	severity: text().default('info').notNull(),
	category: text().notNull(),
	metadata: jsonb(),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_audit_logs_action").using("btree", table.action.asc().nullsLast().op("text_ops")),
	index("idx_audit_logs_entity").using("btree", table.entityType.asc().nullsLast().op("int4_ops"), table.entityId.asc().nullsLast().op("int4_ops")),
	index("idx_audit_logs_timestamp").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("idx_audit_logs_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "audit_logs_user_id_fkey"
		}),
]);

export const changeHistory = pgTable("change_history", {
	id: serial().primaryKey().notNull(),
	entityType: text("entity_type").notNull(),
	entityId: integer("entity_id").notNull(),
	entityName: text("entity_name"),
	userId: integer("user_id").notNull(),
	action: text().notNull(),
	fieldName: text("field_name"),
	oldValue: text("old_value"),
	newValue: text("new_value"),
	changeReason: text("change_reason"),
	automaticChange: boolean("automatic_change").default(false).notNull(),
	batchId: text("batch_id"),
	rollbackData: jsonb("rollback_data"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_change_history_batch_id").using("btree", table.batchId.asc().nullsLast().op("text_ops")),
	index("idx_change_history_entity").using("btree", table.entityType.asc().nullsLast().op("text_ops"), table.entityId.asc().nullsLast().op("int4_ops")),
	index("idx_change_history_timestamp").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("idx_change_history_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "change_history_user_id_fkey"
		}),
]);

export const securityEvents = pgTable("security_events", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	eventType: text("event_type").notNull(),
	source: text().notNull(),
	ipAddress: text("ip_address").notNull(),
	userAgent: text("user_agent"),
	location: text(),
	deviceFingerprint: text("device_fingerprint"),
	success: boolean().notNull(),
	failureReason: text("failure_reason"),
	riskScore: integer("risk_score"),
	blocked: boolean().default(false).notNull(),
	metadata: jsonb(),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_security_events_event_type").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("idx_security_events_timestamp").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("idx_security_events_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "security_events_user_id_fkey"
		}),
]);

export const dataAccessLogs = pgTable("data_access_logs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: integer("entity_id"),
	entityName: text("entity_name"),
	accessType: text("access_type").notNull(),
	accessMethod: text("access_method").notNull(),
	dataScope: text("data_scope"),
	filters: jsonb(),
	resultCount: integer("result_count"),
	sensitiveData: boolean("sensitive_data").default(false).notNull(),
	purpose: text(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	sessionDuration: integer("session_duration"),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_data_access_logs_entity").using("btree", table.entityType.asc().nullsLast().op("text_ops"), table.entityId.asc().nullsLast().op("int4_ops")),
	index("idx_data_access_logs_timestamp").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("idx_data_access_logs_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "data_access_logs_user_id_fkey"
		}),
]);

export const systemEvents = pgTable("system_events", {
	id: serial().primaryKey().notNull(),
	eventType: text("event_type").notNull(),
	source: text().notNull(),
	severity: text().notNull(),
	category: text().notNull(),
	description: text().notNull(),
	details: jsonb(),
	affectedEntities: jsonb("affected_entities"),
	resolution: text(),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_system_events_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_system_events_timestamp").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
]);

export const individualLicenses = pgTable("individual_licenses", {
	id: serial().primaryKey().notNull(),
	clientId: integer("client_id").notNull(),
	serviceScopeId: integer("service_scope_id"),
	name: text().notNull(),
	vendor: text().notNull(),
	productName: text("product_name").notNull(),
	licenseKey: text("license_key"),
	licenseType: text("license_type"),
	quantity: integer().default(1).notNull(),
	costPerLicense: numeric("cost_per_license", { precision: 8, scale:  2 }),
	purchaseDate: timestamp("purchase_date", { mode: 'string' }),
	expiryDate: timestamp("expiry_date", { mode: 'string' }),
	renewalDate: timestamp("renewal_date", { mode: 'string' }),
	purchaseRequestNumber: text("purchase_request_number"),
	purchaseOrderNumber: text("purchase_order_number"),
	documentUrl: text("document_url"),
	status: text().default('active').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "individual_licenses_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.serviceScopeId],
			foreignColumns: [serviceScopes.id],
			name: "individual_licenses_service_scope_id_service_scopes_id_fk"
		}),
]);

export const companySettings = pgTable("company_settings", {
	id: serial().primaryKey().notNull(),
	companyName: text("company_name").default('MSSP Client Manager').notNull(),
	currency: text().default('USD').notNull(),
	timezone: text().default('America/New_York').notNull(),
	fiscalYearStart: text("fiscal_year_start").default('01-01').notNull(),
	dateFormat: text("date_format").default('MM/DD/YYYY').notNull(),
	timeFormat: text("time_format").default('12h').notNull(),
	logoUrl: text("logo_url"),
	primaryColor: text("primary_color").default('#3b82f6').notNull(),
	secondaryColor: text("secondary_color").default('#64748b').notNull(),
	address: text(),
	phone: text(),
	email: text(),
	website: text(),
	taxId: text("tax_id"),
	registrationNumber: text("registration_number"),
	emailNotificationsEnabled: boolean("email_notifications_enabled").default(true).notNull(),
	smsNotificationsEnabled: boolean("sms_notifications_enabled").default(false).notNull(),
	sessionTimeoutMinutes: integer("session_timeout_minutes").default(480).notNull(),
	passwordExpiryDays: integer("password_expiry_days").default(90).notNull(),
	maxLoginAttempts: integer("max_login_attempts").default(5).notNull(),
	auditLogRetentionDays: integer("audit_log_retention_days").default(2555).notNull(),
	backupRetentionDays: integer("backup_retention_days").default(365).notNull(),
	apiRateLimit: integer("api_rate_limit").default(1000).notNull(),
	webhookRetryAttempts: integer("webhook_retry_attempts").default(3).notNull(),
	advancedSearchEnabled: boolean("advanced_search_enabled").default(true).notNull(),
	auditLoggingEnabled: boolean("audit_logging_enabled").default(true).notNull(),
	twoFactorRequired: boolean("two_factor_required").default(false).notNull(),
	dataExportEnabled: boolean("data_export_enabled").default(true).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	updatedBy: integer("updated_by"),
	ldapEnabled: boolean("ldap_enabled").default(false).notNull(),
	ldapUrl: text("ldap_url"),
	ldapBindDn: text("ldap_bind_dn"),
	ldapBindPassword: text("ldap_bind_password"),
	ldapSearchBase: text("ldap_search_base"),
	ldapSearchFilter: text("ldap_search_filter").default('(uid={{username}})'),
	ldapUsernameAttribute: text("ldap_username_attribute").default('uid'),
	ldapEmailAttribute: text("ldap_email_attribute").default('mail'),
	ldapFirstNameAttribute: text("ldap_first_name_attribute").default('givenName'),
	ldapLastNameAttribute: text("ldap_last_name_attribute").default('sn'),
	ldapDefaultRole: text("ldap_default_role").default('user'),
	ldapGroupSearchBase: text("ldap_group_search_base"),
	ldapGroupSearchFilter: text("ldap_group_search_filter"),
	ldapAdminGroup: text("ldap_admin_group"),
	ldapManagerGroup: text("ldap_manager_group"),
	ldapEngineerGroup: text("ldap_engineer_group"),
	ldapConnectionTimeout: integer("ldap_connection_timeout").default(5000),
	ldapSearchTimeout: integer("ldap_search_timeout").default(10000),
	ldapCertificateVerification: boolean("ldap_certificate_verification").default(true).notNull(),
}, (table) => [
	index("idx_company_settings_ldap_enabled").using("btree", table.ldapEnabled.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "company_settings_updated_by_fkey"
		}),
]);

export const searchHistory = pgTable("search_history", {
	id: serial().notNull(),
	userId: integer("user_id").notNull(),
	searchQuery: text("search_query").notNull(),
	searchConfig: text("search_config"),
	entityTypes: text("entity_types").array().notNull(),
	resultsCount: integer("results_count").default(0).notNull(),
	executionTime: integer("execution_time"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_search_history_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_search_history_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "search_history_user_id_fkey"
		}),
]);

export const contracts = pgTable("contracts", {
	id: serial().primaryKey().notNull(),
	clientId: integer("client_id").notNull(),
	name: text().notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	autoRenewal: boolean("auto_renewal").default(false).notNull(),
	renewalTerms: text("renewal_terms"),
	totalValue: numeric("total_value", { precision: 12, scale:  2 }),
	status: text().default('draft').notNull(),
	documentUrl: text("document_url"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_contracts_client_id").using("btree", table.clientId.asc().nullsLast().op("int4_ops")),
	index("idx_contracts_client_id_name").using("btree", table.clientId.asc().nullsLast().op("int4_ops"), table.name.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "contracts_client_id_clients_id_fk"
		}),
]);

export const clientLicenses = pgTable("client_licenses", {
	id: serial().primaryKey().notNull(),
	clientId: integer("client_id").notNull(),
	licensePoolId: integer("license_pool_id").notNull(),
	serviceScopeId: integer("service_scope_id"),
	assignedLicenses: integer("assigned_licenses").notNull(),
	assignedDate: timestamp("assigned_date", { mode: 'string' }).defaultNow().notNull(),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_licenses_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.licensePoolId],
			foreignColumns: [licensePools.id],
			name: "client_licenses_license_pool_id_license_pools_id_fk"
		}),
	foreignKey({
			columns: [table.serviceScopeId],
			foreignColumns: [serviceScopes.id],
			name: "client_licenses_service_scope_id_service_scopes_id_fk"
		}),
]);

export const clientFeedback = pgTable("client_feedback", {
	id: serial().notNull(),
	clientId: integer("client_id").notNull(),
	contractId: integer("contract_id"),
	serviceScopeId: integer("service_scope_id"),
	feedbackDate: timestamp("feedback_date", { mode: 'string' }).defaultNow(),
	feedbackType: text("feedback_type").notNull(),
	category: text(),
	priority: text().default('medium'),
	title: text().notNull(),
	description: text().notNull(),
	contactMethod: text("contact_method"),
	satisfactionRating: integer("satisfaction_rating"),
	status: text().default('open'),
	assignedTo: integer("assigned_to"),
	resolvedBy: integer("resolved_by"),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	resolutionNotes: text("resolution_notes"),
	followUpRequired: boolean("follow_up_required").default(false),
	followUpDate: timestamp("follow_up_date", { mode: 'string' }),
	internalNotes: text("internal_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_client_feedback_client_date").using("btree", table.clientId.asc().nullsLast().op("int4_ops"), table.feedbackDate.asc().nullsLast().op("int4_ops")),
	index("idx_client_feedback_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_client_feedback_type").using("btree", table.feedbackType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_feedback_client_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contractId],
			foreignColumns: [contracts.id],
			name: "client_feedback_contract_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.serviceScopeId],
			foreignColumns: [serviceScopes.id],
			name: "client_feedback_service_scope_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "client_feedback_assigned_to_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.resolvedBy],
			foreignColumns: [users.id],
			name: "client_feedback_resolved_by_fkey"
		}).onDelete("set null"),
	check("client_feedback_feedback_type_check", sql`feedback_type = ANY (ARRAY['compliment'::text, 'complaint'::text, 'suggestion'::text, 'inquiry'::text, 'escalation'::text])`),
	check("client_feedback_category_check", sql`category = ANY (ARRAY['service_delivery'::text, 'communication'::text, 'billing'::text, 'technical'::text, 'other'::text])`),
	check("client_feedback_priority_check", sql`priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])`),
	check("client_feedback_contact_method_check", sql`contact_method = ANY (ARRAY['phone'::text, 'email'::text, 'portal'::text, 'meeting'::text, 'ticket'::text])`),
	check("client_feedback_satisfaction_rating_check", sql`(satisfaction_rating >= 1) AND (satisfaction_rating <= 5)`),
	check("client_feedback_status_check", sql`status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text])`),
]);

export const customFields = pgTable("custom_fields", {
	id: serial().primaryKey().notNull(),
	entityType: text("entity_type").notNull(),
	fieldName: text("field_name").notNull(),
	fieldType: text("field_type").notNull(),
	fieldOptions: jsonb("field_options"),
	isRequired: boolean("is_required").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const savedSearches = pgTable("saved_searches", {
	id: serial().notNull(),
	userId: integer("user_id").notNull(),
	name: text().notNull(),
	description: text(),
	searchConfig: text("search_config").notNull(),
	entityTypes: text("entity_types").array().notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
	isQuickFilter: boolean("is_quick_filter").default(false).notNull(),
	useCount: integer("use_count").default(0).notNull(),
	lastUsed: timestamp("last_used", { mode: 'string' }),
	tags: text().array(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_saved_searches_is_public").using("btree", table.isPublic.asc().nullsLast().op("bool_ops")),
	index("idx_saved_searches_is_quick_filter").using("btree", table.isQuickFilter.asc().nullsLast().op("bool_ops")),
	index("idx_saved_searches_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_searches_user_id_fkey"
		}),
]);

export const clientHardwareAssignments = pgTable("client_hardware_assignments", {
	id: serial().primaryKey().notNull(),
	clientId: integer("client_id").notNull(),
	hardwareAssetId: integer("hardware_asset_id").notNull(),
	serviceScopeId: integer("service_scope_id"),
	assignedDate: timestamp("assigned_date", { mode: 'string' }).defaultNow().notNull(),
	returnedDate: timestamp("returned_date", { mode: 'string' }),
	installationLocation: text("installation_location"),
	status: text().default('active').notNull(),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_hardware_assignments_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.hardwareAssetId],
			foreignColumns: [hardwareAssets.id],
			name: "client_hardware_assignments_hardware_asset_id_hardware_assets_i"
		}),
	foreignKey({
			columns: [table.serviceScopeId],
			foreignColumns: [serviceScopes.id],
			name: "client_hardware_assignments_service_scope_id_service_scopes_id_"
		}),
]);

export const clients = pgTable("clients", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	industry: text(),
	companySize: text("company_size"),
	status: text().default('prospect').notNull(),
	source: text(),
	address: text(),
	website: text(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const serviceScopes = pgTable("service_scopes", {
	id: serial().primaryKey().notNull(),
	contractId: integer("contract_id").notNull(),
	serviceId: integer("service_id").notNull(),
	scopeDefinition: jsonb("scope_definition"),
	safDocumentUrl: text("saf_document_url"),
	safStartDate: timestamp("saf_start_date", { mode: 'string' }),
	safEndDate: timestamp("saf_end_date", { mode: 'string' }),
	safStatus: text("saf_status").default('pending'),
	monthlyValue: numeric("monthly_value", { precision: 10, scale:  2 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.contractId],
			foreignColumns: [contracts.id],
			name: "service_scopes_contract_id_contracts_id_fk"
		}),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [services.id],
			name: "service_scopes_service_id_services_id_fk"
		}),
]);

export const dashboardWidgetAssignments = pgTable("dashboard_widget_assignments", {
	id: serial().primaryKey().notNull(),
	dashboardId: integer("dashboard_id").notNull(),
	widgetId: integer("widget_id").notNull(),
	position: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.dashboardId],
			foreignColumns: [userDashboards.id],
			name: "dashboard_widget_assignments_dashboard_id_user_dashboards_id_fk"
		}),
	foreignKey({
			columns: [table.widgetId],
			foreignColumns: [dashboardWidgets.id],
			name: "dashboard_widget_assignments_widget_id_dashboard_widgets_id_fk"
		}),
]);

export const customFieldValues = pgTable("custom_field_values", {
	id: serial().primaryKey().notNull(),
	customFieldId: integer("custom_field_id").notNull(),
	entityId: integer("entity_id").notNull(),
	value: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.customFieldId],
			foreignColumns: [customFields.id],
			name: "custom_field_values_custom_field_id_custom_fields_id_fk"
		}),
]);

export const documentVersions = pgTable("document_versions", {
	id: serial().primaryKey().notNull(),
	documentId: integer("document_id").notNull(),
	version: integer().notNull(),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileSize: integer("file_size").notNull(),
	changeNotes: text("change_notes"),
	uploadedBy: integer("uploaded_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_versions_document_id_documents_id_fk"
		}),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "document_versions_uploaded_by_users_id_fk"
		}),
]);

export const documentAccess = pgTable("document_access", {
	id: serial().primaryKey().notNull(),
	documentId: integer("document_id").notNull(),
	userId: integer("user_id").notNull(),
	accessType: text("access_type").notNull(),
	grantedBy: integer("granted_by").notNull(),
	grantedAt: timestamp("granted_at", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_access_document_id_documents_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "document_access_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.grantedBy],
			foreignColumns: [users.id],
			name: "document_access_granted_by_users_id_fk"
		}),
]);

export const serviceAuthorizationForms = pgTable("service_authorization_forms", {
	id: serial().primaryKey().notNull(),
	clientId: integer("client_id").notNull(),
	contractId: integer("contract_id").notNull(),
	serviceScopeId: integer("service_scope_id"),
	safNumber: text("saf_number").notNull(),
	title: text().notNull(),
	description: text(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	status: text().default('draft').notNull(),
	documentUrl: text("document_url"),
	approvedBy: integer("approved_by"),
	approvedDate: timestamp("approved_date", { mode: 'string' }),
	value: numeric({ precision: 12, scale:  2 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_service_authorization_forms_client_contract").using("btree", table.clientId.asc().nullsLast().op("int4_ops"), table.contractId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("idx_service_authorization_forms_saf_number").using("btree", table.safNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "service_authorization_forms_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.contractId],
			foreignColumns: [contracts.id],
			name: "service_authorization_forms_contract_id_contracts_id_fk"
		}),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "service_authorization_forms_approved_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.serviceScopeId],
			foreignColumns: [serviceScopes.id],
			name: "service_authorization_forms_service_scope_id_service_scopes_id_"
		}),
	unique("service_authorization_forms_saf_number_unique").on(table.safNumber),
]);

export const widgets = pgTable("widgets", {
	id: serial().primaryKey().notNull(),
	dashboardId: integer("dashboard_id").notNull(),
	title: text().notNull(),
	widgetType: text("widget_type").notNull(),
	dataSource: text("data_source").notNull(),
	config: jsonb().notNull(),
	position: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.dashboardId],
			foreignColumns: [dashboards.id],
			name: "widgets_dashboard_id_dashboards_id_fk"
		}).onDelete("cascade"),
]);

export const pagePermissions = pgTable("page_permissions", {
	id: serial().notNull(),
	pageName: text("page_name").notNull(),
	pageUrl: text("page_url").notNull(),
	displayName: text("display_name").notNull(),
	description: text(),
	category: text().default('main').notNull(),
	icon: text(),
	adminAccess: boolean("admin_access").default(true).notNull(),
	managerAccess: boolean("manager_access").default(false).notNull(),
	engineerAccess: boolean("engineer_access").default(false).notNull(),
	userAccess: boolean("user_access").default(false).notNull(),
	requiresSpecialPermission: boolean("requires_special_permission").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_page_permissions_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_page_permissions_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_page_permissions_url").using("btree", table.pageUrl.asc().nullsLast().op("text_ops")),
]);

export const clientTeamAssignments = pgTable("client_team_assignments", {
	id: serial().primaryKey().notNull(),
	clientId: integer("client_id").notNull(),
	userId: integer("user_id").notNull(),
	role: text().notNull(),
	assignedDate: timestamp("assigned_date", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_team_assignments_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "client_team_assignments_user_id_users_id_fk"
		}),
]);

export const financialTransactions = pgTable("financial_transactions", {
	id: serial().primaryKey().notNull(),
	type: text().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	description: text().notNull(),
	status: text().default('pending').notNull(),
	clientId: integer("client_id"),
	contractId: integer("contract_id"),
	serviceScopeId: integer("service_scope_id"),
	licensePoolId: integer("license_pool_id"),
	hardwareAssetId: integer("hardware_asset_id"),
	transactionDate: timestamp("transaction_date", { mode: 'string' }).notNull(),
	category: text(),
	reference: text(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "financial_transactions_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.contractId],
			foreignColumns: [contracts.id],
			name: "financial_transactions_contract_id_contracts_id_fk"
		}),
	foreignKey({
			columns: [table.serviceScopeId],
			foreignColumns: [serviceScopes.id],
			name: "financial_transactions_service_scope_id_service_scopes_id_fk"
		}),
	foreignKey({
			columns: [table.licensePoolId],
			foreignColumns: [licensePools.id],
			name: "financial_transactions_license_pool_id_license_pools_id_fk"
		}),
	foreignKey({
			columns: [table.hardwareAssetId],
			foreignColumns: [hardwareAssets.id],
			name: "financial_transactions_hardware_asset_id_hardware_assets_id_fk"
		}),
]);

export const integratedData = pgTable("integrated_data", {
	id: serial().primaryKey().notNull(),
	dataSourceId: integer("data_source_id").notNull(),
	rawData: jsonb("raw_data").notNull(),
	mappedData: jsonb("mapped_data").notNull(),
	syncedAt: timestamp("synced_at", { mode: 'string' }).defaultNow().notNull(),
	recordIdentifier: text("record_identifier"),
}, (table) => [
	foreignKey({
			columns: [table.dataSourceId],
			foreignColumns: [dataSources.id],
			name: "integrated_data_data_source_id_data_sources_id_fk"
		}),
]);
