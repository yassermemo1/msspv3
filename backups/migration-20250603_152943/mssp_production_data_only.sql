--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 16.8 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.users (id, username, password, email, first_name, last_name, role, auth_provider, ldap_id, is_active, two_factor_secret, two_factor_backup_codes, created_at) FROM stdin;
1	admin	7edfb738c32f9135a947f95a57363c7e5de0035258c42f74c396c1ebe165c87a740d06c8bf255b6d761bdfa4ed401facd132491c34f8872c054c030f3747f07e.75797e09b5ff2722f845df296a369811	admin@mssp.local	System	Administrator	admin	local	\N	t	\N	\N	2025-06-03 15:23:34.864118
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.audit_logs (id, user_id, session_id, action, entity_type, entity_id, entity_name, description, ip_address, user_agent, severity, category, metadata, "timestamp") FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.clients (id, name, short_name, domain, industry, company_size, status, source, address, website, notes, deleted_at, created_at, updated_at) FROM stdin;
1	Customer Apps	Customer Apps	C003	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C003	\N	2025-06-03 15:27:28.700032	2025-06-03 15:27:28.700032
2	Saudi Information Technology Company	SITE	C004	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C004	\N	2025-06-03 15:27:28.702217	2025-06-03 15:27:28.702217
3	The Red Sea Development Company	Red Sea	C005	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C005	\N	2025-06-03 15:27:28.703255	2025-06-03 15:27:28.703255
4	Shared Services	SITE	C006	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C006	\N	2025-06-03 15:27:28.704033	2025-06-03 15:27:28.704033
5	Human Resources Development Fund	HRDF	C010	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C010	\N	2025-06-03 15:27:28.705194	2025-06-03 15:27:28.705194
6	Sehati	Sehati	C011	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C011	\N	2025-06-03 15:27:28.705903	2025-06-03 15:27:28.705903
7	Royal Court	RC	C012	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C012	\N	2025-06-03 15:27:28.706604	2025-06-03 15:27:28.706604
8	The Saudi Company for Visa and Travel Solutions	SVTS (Tashir)	C016	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C016	\N	2025-06-03 15:27:28.707367	2025-06-03 15:27:28.707367
9	Saudi Civil Aviation Company	SAVC	C017	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C017	\N	2025-06-03 15:27:28.708138	2025-06-03 15:27:28.708138
10	Ministry of Interior	MOI	C018	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C018	\N	2025-06-03 15:27:28.708791	2025-06-03 15:27:28.708791
11	Public Investment Fund	PIF	C019	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C019	\N	2025-06-03 15:27:28.70944	2025-06-03 15:27:28.70944
12	Hevolution Foundation	Hevolution Foundation	C020	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C020	\N	2025-06-03 15:27:28.710068	2025-06-03 15:27:28.710068
13	Dammam Airports Company	DACO	C021	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C021	\N	2025-06-03 15:27:28.710724	2025-06-03 15:27:28.710724
14	Neom	NEOM	C022	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C022	\N	2025-06-03 15:27:28.711342	2025-06-03 15:27:28.711342
15	Saudi Air Navigation Services	SANS	C024	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C024	\N	2025-06-03 15:27:28.711696	2025-06-03 15:27:28.711696
16	General Authority for Statistics	GASTAT	C025	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C025	\N	2025-06-03 15:27:28.71219	2025-06-03 15:27:28.71219
17	Altanfeethi	Altanfeethi	C026	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C026	\N	2025-06-03 15:27:28.712734	2025-06-03 15:27:28.712734
18	Saudi Post	SPL	C027	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C027	\N	2025-06-03 15:27:28.713245	2025-06-03 15:27:28.713245
19	Dragos	Dragos	C028	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C028	\N	2025-06-03 15:27:28.713813	2025-06-03 15:27:28.713813
20	Saudi Energy Efficiency Center	SEEC	C030	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C030	\N	2025-06-03 15:27:28.714306	2025-06-03 15:27:28.714306
21	National Real Estate Registration Services Company	NRERSC	C032	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C032	\N	2025-06-03 15:27:28.714804	2025-06-03 15:27:28.714804
22	Oil Sustainability Program	OSP	C033	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C033	\N	2025-06-03 15:27:28.715507	2025-06-03 15:27:28.715507
23	National Center for Privatization	NCP	C034	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C034	\N	2025-06-03 15:27:28.716044	2025-06-03 15:27:28.716044
24	Economic Cities and Special Zones Authority	ECZA	C035	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C035	\N	2025-06-03 15:27:28.71657	2025-06-03 15:27:28.71657
25	General Commission for Audiovisual Media	GCAM	C036	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C036	\N	2025-06-03 15:27:28.717062	2025-06-03 15:27:28.717062
26	Infinity METRAS	Infinity METRAS	C037	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C037	\N	2025-06-03 15:27:28.71745	2025-06-03 15:27:28.71745
27	EsayDmarc	EsayDmarc	C038	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C038	\N	2025-06-03 15:27:28.71792	2025-06-03 15:27:28.71792
28	Tahakom	Tahakom	C039	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C039	\N	2025-06-03 15:27:28.718432	2025-06-03 15:27:28.718432
29	Saudi Amining Services Company	SMSC	C040	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C040	\N	2025-06-03 15:27:28.718864	2025-06-03 15:27:28.718864
30	Saudi Water Authority	SWCC	C052	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C052	\N	2025-06-03 15:27:28.719184	2025-06-03 15:27:28.719184
31	Hasanah	Hasanah	C054	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C054	\N	2025-06-03 15:27:28.719591	2025-06-03 15:27:28.719591
32	Mahd Academy	Mahd Academy	C055	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C055	\N	2025-06-03 15:27:28.720082	2025-06-03 15:27:28.720082
33	Saudi Red Sea Authority	SRSA	C057	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C057	\N	2025-06-03 15:27:28.720578	2025-06-03 15:27:28.720578
34	General Authority for Foreign Trade	GAFT	C059	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C059	\N	2025-06-03 15:27:28.721074	2025-06-03 15:27:28.721074
35	New Murabba	NMDC	C060	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C060	\N	2025-06-03 15:27:28.721564	2025-06-03 15:27:28.721564
36	National Security Center	NSC	C109	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C109	\N	2025-06-03 15:27:28.722065	2025-06-03 15:27:28.722065
37	Decision Support Center	DSC	C118	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C118	\N	2025-06-03 15:27:28.722516	2025-06-03 15:27:28.722516
38	Saudi Ministry of Foreign Affairs	MOFA	C120	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: C120	\N	2025-06-03 15:27:28.722992	2025-06-03 15:27:28.722992
39	Digital Government Authority	DGA	S001	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: S001	\N	2025-06-03 15:27:28.723449	2025-06-03 15:27:28.723449
40	Zakat, Tax and Customs Authority	ZATCA	T138	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T138	\N	2025-06-03 15:27:28.724312	2025-06-03 15:27:28.724312
41	Awqaf	Awqaf	T139	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T139	\N	2025-06-03 15:27:28.724779	2025-06-03 15:27:28.724779
42	Saline Water Conversion Corporation	SWCC	T146	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T146	\N	2025-06-03 15:27:28.72526	2025-06-03 15:27:28.72526
43	Ministry Of Health	MOH	T152	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T152	\N	2025-06-03 15:27:28.725719	2025-06-03 15:27:28.725719
44	General Authority of Civil Aviation	GACA	T161	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T161	\N	2025-06-03 15:27:28.726174	2025-06-03 15:27:28.726174
45	General Entertainment Authority	GEA	T162	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T162	\N	2025-06-03 15:27:28.726613	2025-06-03 15:27:28.726613
46	Saudi Royal Aviation	SRA	T165	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T165	\N	2025-06-03 15:27:28.727075	2025-06-03 15:27:28.727075
47	Royal Commission for Makkah city and Holy Sites	RCMC	T166	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T166	\N	2025-06-03 15:27:28.727482	2025-06-03 15:27:28.727482
48	King Abdullah Financial district	KAFD	T168	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T168	\N	2025-06-03 15:27:28.72787	2025-06-03 15:27:28.72787
49	Saudi Aramco Rowan Offshore Drilling Company	ARO	T174	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T174	\N	2025-06-03 15:27:28.728374	2025-06-03 15:27:28.728374
50	Royal commission for Riyadh City	RCRC	T176	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T176	\N	2025-06-03 15:27:28.729119	2025-06-03 15:27:28.729119
51	Saudi Electricity Regularity Authority	SERA	T177	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T177	\N	2025-06-03 15:27:28.729582	2025-06-03 15:27:28.729582
52	MOZN	Mozn	T179	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T179	\N	2025-06-03 15:27:28.730044	2025-06-03 15:27:28.730044
53	Nuclear and Radiological Regulatory Commission	NRRC	T181	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T181	\N	2025-06-03 15:27:28.730669	2025-06-03 15:27:28.730669
54	National Risk Unit	NRU	T183	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T183	\N	2025-06-03 15:27:28.731328	2025-06-03 15:27:28.731328
55	Capital Market Authority (CMA)	CMA	T184	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T184	\N	2025-06-03 15:27:28.731826	2025-06-03 15:27:28.731826
56	Saudi Arabian National Guard	SANGTELS	T185	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T185	\N	2025-06-03 15:27:28.732315	2025-06-03 15:27:28.732315
57	Najm	NAJM	T186	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T186	\N	2025-06-03 15:27:28.732733	2025-06-03 15:27:28.732733
58	Public Health Authority	PHA	T188	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T188	\N	2025-06-03 15:27:28.733166	2025-06-03 15:27:28.733166
59	ROSHN	ROSHN	T190	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T190	\N	2025-06-03 15:27:28.733703	2025-06-03 15:27:28.733703
60	National Center Privatization	NCP	T192	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T192	\N	2025-06-03 15:27:28.734309	2025-06-03 15:27:28.734309
61	National Housing Company	NHC	T201	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T201	\N	2025-06-03 15:27:28.734967	2025-06-03 15:27:28.734967
62	Diriyah Gate	DGDA	T204	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T204	\N	2025-06-03 15:27:28.735445	2025-06-03 15:27:28.735445
63	Finance Committee at Royal Court	FC	T210	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T210	\N	2025-06-03 15:27:28.73586	2025-06-03 15:27:28.73586
64	King Abdullah City for Atomic and Renewable Energy	KACARE	T211	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T211	\N	2025-06-03 15:27:28.736246	2025-06-03 15:27:28.736246
65	National Company of Telecom & Information Security	NTIS	T213	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T213	\N	2025-06-03 15:27:28.736614	2025-06-03 15:27:28.736614
66	OIL PARK DEVLOPMENT COMPANY	The Rig	T214	Government	\N	active	\N	\N	\N	Imported via bulk insert - Domain: T214	\N	2025-06-03 15:27:28.736973	2025-06-03 15:27:28.736973
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.contracts (id, client_id, name, start_date, end_date, auto_renewal, renewal_terms, total_value, status, document_url, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.services (id, name, category, description, delivery_model, base_price, pricing_unit, scope_definition_template, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: service_scopes; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.service_scopes (id, contract_id, service_id, scope_definition, saf_document_url, saf_start_date, saf_end_date, saf_status, start_date, end_date, status, monthly_value, notes, created_at) FROM stdin;
\.


--
-- Data for Name: service_authorization_forms; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.service_authorization_forms (id, client_id, contract_id, service_scope_id, saf_number, description, status, requested_date, approved_date, expiry_date, approved_by, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: certificates_of_compliance; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.certificates_of_compliance (id, client_id, contract_id, service_scope_id, saf_id, coc_number, title, description, compliance_type, issue_date, expiry_date, status, document_url, issued_by, audit_date, next_audit_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: change_history; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.change_history (id, entity_type, entity_id, entity_name, user_id, action, field_name, old_value, new_value, change_reason, automatic_change, batch_id, rollback_data, ip_address, user_agent, "timestamp") FROM stdin;
\.


--
-- Data for Name: client_contacts; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.client_contacts (id, client_id, name, email, phone, title, is_primary, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: client_external_mappings; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.client_external_mappings (id, client_id, system_name, external_identifier, metadata, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: client_feedback; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.client_feedback (id, client_id, contract_id, service_scope_id, feedback_date, feedback_type, category, priority, title, description, contact_method, satisfaction_rating, status, assigned_to, resolved_by, resolved_at, resolution_notes, follow_up_required, follow_up_date, internal_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: hardware_assets; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.hardware_assets (id, name, category, manufacturer, model, serial_number, purchase_date, purchase_cost, warranty_expiry, status, location, purchase_request_number, purchase_order_number, notes, created_at) FROM stdin;
\.


--
-- Data for Name: client_hardware_assignments; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.client_hardware_assignments (id, client_id, hardware_asset_id, service_scope_id, assigned_date, returned_date, installation_location, status, notes) FROM stdin;
\.


--
-- Data for Name: license_pools; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.license_pools (id, name, vendor, product_name, license_type, total_licenses, available_licenses, ordered_licenses, cost_per_license, renewal_date, purchase_request_number, purchase_order_number, notes, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: client_licenses; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.client_licenses (id, client_id, license_pool_id, service_scope_id, assigned_licenses, assigned_date, notes) FROM stdin;
\.


--
-- Data for Name: client_satisfaction_surveys; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.client_satisfaction_surveys (id, client_id, contract_id, service_scope_id, survey_date, survey_type, overall_satisfaction, service_quality, response_time, communication, technical_expertise, value_for_money, likelihood_to_recommend, feedback, improvements, compliments, concerns, status, conducted_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: client_team_assignments; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.client_team_assignments (id, client_id, user_id, role, assigned_date, is_active, notes) FROM stdin;
\.


--
-- Data for Name: company_settings; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.company_settings (id, company_name, currency, timezone, fiscal_year_start, date_format, time_format, logo_url, primary_color, secondary_color, address, phone, email, website, tax_id, registration_number, email_notifications_enabled, sms_notifications_enabled, session_timeout_minutes, password_expiry_days, max_login_attempts, audit_log_retention_days, backup_retention_days, api_rate_limit, webhook_retry_attempts, advanced_search_enabled, audit_logging_enabled, two_factor_required, data_export_enabled, ldap_enabled, ldap_url, ldap_bind_dn, ldap_bind_password, ldap_search_base, ldap_search_filter, ldap_username_attribute, ldap_email_attribute, ldap_first_name_attribute, ldap_last_name_attribute, ldap_default_role, ldap_group_search_base, ldap_group_search_filter, ldap_admin_group, ldap_manager_group, ldap_engineer_group, ldap_connection_timeout, ldap_search_timeout, ldap_certificate_verification, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: custom_fields; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.custom_fields (id, entity_type, field_name, field_type, field_options, is_required, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: custom_field_values; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.custom_field_values (id, custom_field_id, entity_id, value, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: data_sources; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.data_sources (id, name, description, type, api_endpoint, auth_type, auth_config, connection_string, config, sync_frequency, status, is_active, last_connected, last_sync_at, default_page_size, max_page_size, supports_pagination, pagination_type, pagination_config, created_at, updated_at, created_by) FROM stdin;
\.


--
-- Data for Name: dashboard_widgets; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.dashboard_widgets (id, name, widget_type, config, data_source_id, refresh_interval, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_dashboards; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.user_dashboards (id, user_id, name, description, layout, is_default, is_public, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dashboard_widget_assignments; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.dashboard_widget_assignments (id, dashboard_id, widget_id, "position", created_at) FROM stdin;
\.


--
-- Data for Name: dashboards; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.dashboards (id, name, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: data_access_logs; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.data_access_logs (id, user_id, entity_type, entity_id, entity_name, access_type, access_method, data_scope, filters, result_count, sensitive_data, purpose, ip_address, user_agent, session_duration, "timestamp") FROM stdin;
\.


--
-- Data for Name: data_source_mappings; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.data_source_mappings (id, data_source_id, source_field, target_field, field_type, is_required, default_value, transformation, created_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.documents (id, name, description, document_type, file_name, file_path, file_size, mime_type, version, is_active, client_id, contract_id, tags, expiration_date, compliance_type, uploaded_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_access; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.document_access (id, document_id, user_id, access_type, granted_by, granted_at, expires_at) FROM stdin;
\.


--
-- Data for Name: document_versions; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.document_versions (id, document_id, version, file_name, file_path, file_size, change_notes, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: external_systems; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.external_systems (id, system_name, display_name, base_url, auth_type, auth_config, api_endpoints, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: financial_transactions; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.financial_transactions (id, type, amount, description, status, client_id, contract_id, service_scope_id, license_pool_id, hardware_asset_id, transaction_date, category, reference, notes, created_at) FROM stdin;
\.


--
-- Data for Name: global_search_index; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.global_search_index (id, entity_type, entity_id, search_content, keywords, last_indexed) FROM stdin;
\.


--
-- Data for Name: individual_licenses; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.individual_licenses (id, client_id, service_scope_id, name, vendor, product_name, license_key, license_type, quantity, cost_per_license, purchase_date, expiry_date, renewal_date, purchase_request_number, purchase_order_number, document_url, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: integrated_data; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.integrated_data (id, data_source_id, raw_data, mapped_data, synced_at, record_identifier) FROM stdin;
\.


--
-- Data for Name: page_permissions; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.page_permissions (id, page_name, page_url, display_name, description, category, icon, admin_access, manager_access, engineer_access, user_access, requires_special_permission, is_active, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: proposals; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.proposals (id, contract_id, type, version, status, document_url, proposed_value, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: saved_searches; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.saved_searches (id, user_id, name, description, search_config, entity_types, is_public, is_quick_filter, use_count, last_used, tags, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_versions; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.schema_versions (id, script_version, app_version, schema_version, version, applied_at, created_at, environment, notes, migration_file, description) FROM stdin;
1	1.6.0	1.6.0	1.6.0	1.6.0	2025-06-03 15:28:08.723761	2025-06-03 15:28:08.723761	production	Initial schema version created by comprehensive sync	\N	Database initialized with version 1.6.0
\.


--
-- Data for Name: search_history; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.search_history (id, user_id, search_query, search_config, entity_types, results_count, execution_time, created_at) FROM stdin;
\.


--
-- Data for Name: security_events; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.security_events (id, user_id, event_type, source, ip_address, user_agent, location, device_fingerprint, success, failure_reason, risk_score, blocked, metadata, "timestamp") FROM stdin;
\.


--
-- Data for Name: service_scope_fields; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.service_scope_fields (id, service_id, name, label, field_type, is_required, display_order, placeholder_text, help_text, default_value, select_options, validation_rules, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_events; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.system_events (id, event_type, source, severity, category, description, details, affected_entities, resolution, resolved_at, "timestamp") FROM stdin;
\.


--
-- Data for Name: user_dashboard_settings; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.user_dashboard_settings (id, user_id, card_id, title, type, category, data_source, size, visible, "position", config, is_built_in, is_removable, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.user_settings (id, user_id, email_notifications, push_notifications, contract_reminders, financial_alerts, two_factor_auth, session_timeout, dark_mode, timezone, language, currency, auto_save_forms, data_export, api_access, data_retention_period, updated_at) FROM stdin;
\.


--
-- Data for Name: widgets; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.widgets (id, dashboard_id, title, widget_type, data_source, config, "position", created_at, updated_at) FROM stdin;
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: certificates_of_compliance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.certificates_of_compliance_id_seq', 1, false);


--
-- Name: change_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.change_history_id_seq', 1, false);


--
-- Name: client_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.client_contacts_id_seq', 1, false);


--
-- Name: client_external_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.client_external_mappings_id_seq', 1, false);


--
-- Name: client_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.client_feedback_id_seq', 1, false);


--
-- Name: client_hardware_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.client_hardware_assignments_id_seq', 1, false);


--
-- Name: client_licenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.client_licenses_id_seq', 1, false);


--
-- Name: client_satisfaction_surveys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.client_satisfaction_surveys_id_seq', 1, false);


--
-- Name: client_team_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.client_team_assignments_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.clients_id_seq', 66, true);


--
-- Name: company_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.company_settings_id_seq', 1, false);


--
-- Name: contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.contracts_id_seq', 1, false);


--
-- Name: custom_field_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.custom_field_values_id_seq', 1, false);


--
-- Name: custom_fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.custom_fields_id_seq', 1, false);


--
-- Name: dashboard_widget_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.dashboard_widget_assignments_id_seq', 1, false);


--
-- Name: dashboard_widgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.dashboard_widgets_id_seq', 1, false);


--
-- Name: dashboards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.dashboards_id_seq', 1, false);


--
-- Name: data_access_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.data_access_logs_id_seq', 1, false);


--
-- Name: data_source_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.data_source_mappings_id_seq', 1, false);


--
-- Name: data_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.data_sources_id_seq', 1, false);


--
-- Name: document_access_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.document_access_id_seq', 1, false);


--
-- Name: document_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.document_versions_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: external_systems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.external_systems_id_seq', 1, false);


--
-- Name: financial_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.financial_transactions_id_seq', 1, false);


--
-- Name: global_search_index_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.global_search_index_id_seq', 1, false);


--
-- Name: hardware_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.hardware_assets_id_seq', 1, false);


--
-- Name: individual_licenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.individual_licenses_id_seq', 1, false);


--
-- Name: integrated_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.integrated_data_id_seq', 1, false);


--
-- Name: license_pools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.license_pools_id_seq', 1, false);


--
-- Name: page_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.page_permissions_id_seq', 1, false);


--
-- Name: proposals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.proposals_id_seq', 1, false);


--
-- Name: saved_searches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.saved_searches_id_seq', 1, false);


--
-- Name: schema_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.schema_versions_id_seq', 1, true);


--
-- Name: search_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.search_history_id_seq', 1, false);


--
-- Name: security_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.security_events_id_seq', 1, false);


--
-- Name: service_authorization_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.service_authorization_forms_id_seq', 1, false);


--
-- Name: service_scope_fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.service_scope_fields_id_seq', 1, false);


--
-- Name: service_scopes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.service_scopes_id_seq', 1, false);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.services_id_seq', 1, false);


--
-- Name: system_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.system_events_id_seq', 1, false);


--
-- Name: user_dashboard_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.user_dashboard_settings_id_seq', 1, false);


--
-- Name: user_dashboards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.user_dashboards_id_seq', 1, false);


--
-- Name: user_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.user_settings_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: widgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mssp_user
--

SELECT pg_catalog.setval('public.widgets_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

