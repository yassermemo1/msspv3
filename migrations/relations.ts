import { relations } from "drizzle-orm/relations";
import { clients, clientSatisfactionSurveys, contracts, serviceScopes, users, documents, userSettings, clientContacts, proposals, certificatesOfCompliance, serviceAuthorizationForms, dataSources, dashboardWidgets, dashboards, externalSystems, clientExternalMappings, userDashboards, dataSourceMappings, auditLogs, changeHistory, securityEvents, dataAccessLogs, individualLicenses, companySettings, searchHistory, clientLicenses, licensePools, clientFeedback, savedSearches, clientHardwareAssignments, hardwareAssets, services, dashboardWidgetAssignments, customFields, customFieldValues, documentVersions, documentAccess, widgets, clientTeamAssignments, financialTransactions, integratedData } from "./schema";

export const clientSatisfactionSurveysRelations = relations(clientSatisfactionSurveys, ({one}) => ({
	client: one(clients, {
		fields: [clientSatisfactionSurveys.clientId],
		references: [clients.id]
	}),
	contract: one(contracts, {
		fields: [clientSatisfactionSurveys.contractId],
		references: [contracts.id]
	}),
	serviceScope: one(serviceScopes, {
		fields: [clientSatisfactionSurveys.serviceScopeId],
		references: [serviceScopes.id]
	}),
	user: one(users, {
		fields: [clientSatisfactionSurveys.conductedBy],
		references: [users.id]
	}),
}));

export const clientsRelations = relations(clients, ({many}) => ({
	clientSatisfactionSurveys: many(clientSatisfactionSurveys),
	documents: many(documents),
	clientContacts: many(clientContacts),
	certificatesOfCompliances: many(certificatesOfCompliance),
	clientExternalMappings: many(clientExternalMappings),
	individualLicenses: many(individualLicenses),
	contracts: many(contracts),
	clientLicenses: many(clientLicenses),
	clientFeedbacks: many(clientFeedback),
	clientHardwareAssignments: many(clientHardwareAssignments),
	serviceAuthorizationForms: many(serviceAuthorizationForms),
	clientTeamAssignments: many(clientTeamAssignments),
	financialTransactions: many(financialTransactions),
}));

export const contractsRelations = relations(contracts, ({one, many}) => ({
	clientSatisfactionSurveys: many(clientSatisfactionSurveys),
	documents: many(documents),
	proposals: many(proposals),
	certificatesOfCompliances: many(certificatesOfCompliance),
	client: one(clients, {
		fields: [contracts.clientId],
		references: [clients.id]
	}),
	clientFeedbacks: many(clientFeedback),
	serviceScopes: many(serviceScopes),
	serviceAuthorizationForms: many(serviceAuthorizationForms),
	financialTransactions: many(financialTransactions),
}));

export const serviceScopesRelations = relations(serviceScopes, ({one, many}) => ({
	clientSatisfactionSurveys: many(clientSatisfactionSurveys),
	certificatesOfCompliances: many(certificatesOfCompliance),
	individualLicenses: many(individualLicenses),
	clientLicenses: many(clientLicenses),
	clientFeedbacks: many(clientFeedback),
	clientHardwareAssignments: many(clientHardwareAssignments),
	contract: one(contracts, {
		fields: [serviceScopes.contractId],
		references: [contracts.id]
	}),
	service: one(services, {
		fields: [serviceScopes.serviceId],
		references: [services.id]
	}),
	serviceAuthorizationForms: many(serviceAuthorizationForms),
	financialTransactions: many(financialTransactions),
}));

export const usersRelations = relations(users, ({many}) => ({
	clientSatisfactionSurveys: many(clientSatisfactionSurveys),
	documents: many(documents),
	userSettings: many(userSettings),
	certificatesOfCompliances: many(certificatesOfCompliance),
	dashboardWidgets: many(dashboardWidgets),
	dashboards: many(dashboards),
	dataSources: many(dataSources),
	externalSystems: many(externalSystems),
	userDashboards: many(userDashboards),
	auditLogs: many(auditLogs),
	changeHistories: many(changeHistory),
	securityEvents: many(securityEvents),
	dataAccessLogs: many(dataAccessLogs),
	companySettings: many(companySettings),
	searchHistories: many(searchHistory),
	clientFeedbacks_assignedTo: many(clientFeedback, {
		relationName: "clientFeedback_assignedTo_users_id"
	}),
	clientFeedbacks_resolvedBy: many(clientFeedback, {
		relationName: "clientFeedback_resolvedBy_users_id"
	}),
	savedSearches: many(savedSearches),
	documentVersions: many(documentVersions),
	documentAccesses_userId: many(documentAccess, {
		relationName: "documentAccess_userId_users_id"
	}),
	documentAccesses_grantedBy: many(documentAccess, {
		relationName: "documentAccess_grantedBy_users_id"
	}),
	serviceAuthorizationForms: many(serviceAuthorizationForms),
	clientTeamAssignments: many(clientTeamAssignments),
}));

export const documentsRelations = relations(documents, ({one, many}) => ({
	client: one(clients, {
		fields: [documents.clientId],
		references: [clients.id]
	}),
	contract: one(contracts, {
		fields: [documents.contractId],
		references: [contracts.id]
	}),
	user: one(users, {
		fields: [documents.uploadedBy],
		references: [users.id]
	}),
	documentVersions: many(documentVersions),
	documentAccesses: many(documentAccess),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	}),
}));

export const clientContactsRelations = relations(clientContacts, ({one}) => ({
	client: one(clients, {
		fields: [clientContacts.clientId],
		references: [clients.id]
	}),
}));

export const proposalsRelations = relations(proposals, ({one}) => ({
	contract: one(contracts, {
		fields: [proposals.contractId],
		references: [contracts.id]
	}),
}));

export const certificatesOfComplianceRelations = relations(certificatesOfCompliance, ({one}) => ({
	client: one(clients, {
		fields: [certificatesOfCompliance.clientId],
		references: [clients.id]
	}),
	contract: one(contracts, {
		fields: [certificatesOfCompliance.contractId],
		references: [contracts.id]
	}),
	user: one(users, {
		fields: [certificatesOfCompliance.issuedBy],
		references: [users.id]
	}),
	serviceScope: one(serviceScopes, {
		fields: [certificatesOfCompliance.serviceScopeId],
		references: [serviceScopes.id]
	}),
	serviceAuthorizationForm: one(serviceAuthorizationForms, {
		fields: [certificatesOfCompliance.safId],
		references: [serviceAuthorizationForms.id]
	}),
}));

export const serviceAuthorizationFormsRelations = relations(serviceAuthorizationForms, ({one, many}) => ({
	certificatesOfCompliances: many(certificatesOfCompliance),
	client: one(clients, {
		fields: [serviceAuthorizationForms.clientId],
		references: [clients.id]
	}),
	contract: one(contracts, {
		fields: [serviceAuthorizationForms.contractId],
		references: [contracts.id]
	}),
	user: one(users, {
		fields: [serviceAuthorizationForms.approvedBy],
		references: [users.id]
	}),
	serviceScope: one(serviceScopes, {
		fields: [serviceAuthorizationForms.serviceScopeId],
		references: [serviceScopes.id]
	}),
}));

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({one, many}) => ({
	dataSource: one(dataSources, {
		fields: [dashboardWidgets.dataSourceId],
		references: [dataSources.id]
	}),
	user: one(users, {
		fields: [dashboardWidgets.createdBy],
		references: [users.id]
	}),
	dashboardWidgetAssignments: many(dashboardWidgetAssignments),
}));

export const dataSourcesRelations = relations(dataSources, ({one, many}) => ({
	dashboardWidgets: many(dashboardWidgets),
	user: one(users, {
		fields: [dataSources.createdBy],
		references: [users.id]
	}),
	dataSourceMappings: many(dataSourceMappings),
	integratedData: many(integratedData),
}));

export const dashboardsRelations = relations(dashboards, ({one, many}) => ({
	user: one(users, {
		fields: [dashboards.userId],
		references: [users.id]
	}),
	widgets: many(widgets),
}));

export const externalSystemsRelations = relations(externalSystems, ({one}) => ({
	user: one(users, {
		fields: [externalSystems.createdBy],
		references: [users.id]
	}),
}));

export const clientExternalMappingsRelations = relations(clientExternalMappings, ({one}) => ({
	client: one(clients, {
		fields: [clientExternalMappings.clientId],
		references: [clients.id]
	}),
}));

export const userDashboardsRelations = relations(userDashboards, ({one, many}) => ({
	user: one(users, {
		fields: [userDashboards.userId],
		references: [users.id]
	}),
	dashboardWidgetAssignments: many(dashboardWidgetAssignments),
}));

export const dataSourceMappingsRelations = relations(dataSourceMappings, ({one}) => ({
	dataSource: one(dataSources, {
		fields: [dataSourceMappings.dataSourceId],
		references: [dataSources.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const changeHistoryRelations = relations(changeHistory, ({one}) => ({
	user: one(users, {
		fields: [changeHistory.userId],
		references: [users.id]
	}),
}));

export const securityEventsRelations = relations(securityEvents, ({one}) => ({
	user: one(users, {
		fields: [securityEvents.userId],
		references: [users.id]
	}),
}));

export const dataAccessLogsRelations = relations(dataAccessLogs, ({one}) => ({
	user: one(users, {
		fields: [dataAccessLogs.userId],
		references: [users.id]
	}),
}));

export const individualLicensesRelations = relations(individualLicenses, ({one}) => ({
	client: one(clients, {
		fields: [individualLicenses.clientId],
		references: [clients.id]
	}),
	serviceScope: one(serviceScopes, {
		fields: [individualLicenses.serviceScopeId],
		references: [serviceScopes.id]
	}),
}));

export const companySettingsRelations = relations(companySettings, ({one}) => ({
	user: one(users, {
		fields: [companySettings.updatedBy],
		references: [users.id]
	}),
}));

export const searchHistoryRelations = relations(searchHistory, ({one}) => ({
	user: one(users, {
		fields: [searchHistory.userId],
		references: [users.id]
	}),
}));

export const clientLicensesRelations = relations(clientLicenses, ({one}) => ({
	client: one(clients, {
		fields: [clientLicenses.clientId],
		references: [clients.id]
	}),
	licensePool: one(licensePools, {
		fields: [clientLicenses.licensePoolId],
		references: [licensePools.id]
	}),
	serviceScope: one(serviceScopes, {
		fields: [clientLicenses.serviceScopeId],
		references: [serviceScopes.id]
	}),
}));

export const licensePoolsRelations = relations(licensePools, ({many}) => ({
	clientLicenses: many(clientLicenses),
	financialTransactions: many(financialTransactions),
}));

export const clientFeedbackRelations = relations(clientFeedback, ({one}) => ({
	client: one(clients, {
		fields: [clientFeedback.clientId],
		references: [clients.id]
	}),
	contract: one(contracts, {
		fields: [clientFeedback.contractId],
		references: [contracts.id]
	}),
	serviceScope: one(serviceScopes, {
		fields: [clientFeedback.serviceScopeId],
		references: [serviceScopes.id]
	}),
	user_assignedTo: one(users, {
		fields: [clientFeedback.assignedTo],
		references: [users.id],
		relationName: "clientFeedback_assignedTo_users_id"
	}),
	user_resolvedBy: one(users, {
		fields: [clientFeedback.resolvedBy],
		references: [users.id],
		relationName: "clientFeedback_resolvedBy_users_id"
	}),
}));

export const savedSearchesRelations = relations(savedSearches, ({one}) => ({
	user: one(users, {
		fields: [savedSearches.userId],
		references: [users.id]
	}),
}));

export const clientHardwareAssignmentsRelations = relations(clientHardwareAssignments, ({one}) => ({
	client: one(clients, {
		fields: [clientHardwareAssignments.clientId],
		references: [clients.id]
	}),
	hardwareAsset: one(hardwareAssets, {
		fields: [clientHardwareAssignments.hardwareAssetId],
		references: [hardwareAssets.id]
	}),
	serviceScope: one(serviceScopes, {
		fields: [clientHardwareAssignments.serviceScopeId],
		references: [serviceScopes.id]
	}),
}));

export const hardwareAssetsRelations = relations(hardwareAssets, ({many}) => ({
	clientHardwareAssignments: many(clientHardwareAssignments),
	financialTransactions: many(financialTransactions),
}));

export const servicesRelations = relations(services, ({many}) => ({
	serviceScopes: many(serviceScopes),
}));

export const dashboardWidgetAssignmentsRelations = relations(dashboardWidgetAssignments, ({one}) => ({
	userDashboard: one(userDashboards, {
		fields: [dashboardWidgetAssignments.dashboardId],
		references: [userDashboards.id]
	}),
	dashboardWidget: one(dashboardWidgets, {
		fields: [dashboardWidgetAssignments.widgetId],
		references: [dashboardWidgets.id]
	}),
}));

export const customFieldValuesRelations = relations(customFieldValues, ({one}) => ({
	customField: one(customFields, {
		fields: [customFieldValues.customFieldId],
		references: [customFields.id]
	}),
}));

export const customFieldsRelations = relations(customFields, ({many}) => ({
	customFieldValues: many(customFieldValues),
}));

export const documentVersionsRelations = relations(documentVersions, ({one}) => ({
	document: one(documents, {
		fields: [documentVersions.documentId],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [documentVersions.uploadedBy],
		references: [users.id]
	}),
}));

export const documentAccessRelations = relations(documentAccess, ({one}) => ({
	document: one(documents, {
		fields: [documentAccess.documentId],
		references: [documents.id]
	}),
	user_userId: one(users, {
		fields: [documentAccess.userId],
		references: [users.id],
		relationName: "documentAccess_userId_users_id"
	}),
	user_grantedBy: one(users, {
		fields: [documentAccess.grantedBy],
		references: [users.id],
		relationName: "documentAccess_grantedBy_users_id"
	}),
}));

export const widgetsRelations = relations(widgets, ({one}) => ({
	dashboard: one(dashboards, {
		fields: [widgets.dashboardId],
		references: [dashboards.id]
	}),
}));

export const clientTeamAssignmentsRelations = relations(clientTeamAssignments, ({one}) => ({
	client: one(clients, {
		fields: [clientTeamAssignments.clientId],
		references: [clients.id]
	}),
	user: one(users, {
		fields: [clientTeamAssignments.userId],
		references: [users.id]
	}),
}));

export const financialTransactionsRelations = relations(financialTransactions, ({one}) => ({
	client: one(clients, {
		fields: [financialTransactions.clientId],
		references: [clients.id]
	}),
	contract: one(contracts, {
		fields: [financialTransactions.contractId],
		references: [contracts.id]
	}),
	serviceScope: one(serviceScopes, {
		fields: [financialTransactions.serviceScopeId],
		references: [serviceScopes.id]
	}),
	licensePool: one(licensePools, {
		fields: [financialTransactions.licensePoolId],
		references: [licensePools.id]
	}),
	hardwareAsset: one(hardwareAssets, {
		fields: [financialTransactions.hardwareAssetId],
		references: [hardwareAssets.id]
	}),
}));

export const integratedDataRelations = relations(integratedData, ({one}) => ({
	dataSource: one(dataSources, {
		fields: [integratedData.dataSourceId],
		references: [dataSources.id]
	}),
}));