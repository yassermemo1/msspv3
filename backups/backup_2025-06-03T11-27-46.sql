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
-- Name: public; Type: SCHEMA; Schema: -; Owner: yasseralmohammed
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO yasseralmohammed;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    session_id text,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id integer,
    entity_name text,
    description text NOT NULL,
    ip_address text,
    user_agent text,
    severity text DEFAULT 'info'::text NOT NULL,
    category text NOT NULL,
    metadata jsonb,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO mssp_user;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO mssp_user;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: certificates_of_compliance; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.certificates_of_compliance (
    id integer NOT NULL,
    client_id integer NOT NULL,
    contract_id integer,
    service_scope_id integer,
    saf_id integer,
    coc_number text NOT NULL,
    title text NOT NULL,
    description text,
    compliance_type text NOT NULL,
    issue_date timestamp without time zone NOT NULL,
    expiry_date timestamp without time zone,
    status text DEFAULT 'active'::text,
    document_url text,
    issued_by integer,
    audit_date timestamp without time zone,
    next_audit_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.certificates_of_compliance OWNER TO mssp_user;

--
-- Name: certificates_of_compliance_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.certificates_of_compliance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certificates_of_compliance_id_seq OWNER TO mssp_user;

--
-- Name: certificates_of_compliance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.certificates_of_compliance_id_seq OWNED BY public.certificates_of_compliance.id;


--
-- Name: change_history; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.change_history (
    id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    entity_name text,
    user_id integer NOT NULL,
    action text NOT NULL,
    field_name text,
    old_value text,
    new_value text,
    change_reason text,
    automatic_change boolean DEFAULT false NOT NULL,
    batch_id text,
    rollback_data jsonb,
    ip_address text,
    user_agent text,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.change_history OWNER TO mssp_user;

--
-- Name: change_history_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.change_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.change_history_id_seq OWNER TO mssp_user;

--
-- Name: change_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.change_history_id_seq OWNED BY public.change_history.id;


--
-- Name: client_contacts; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.client_contacts (
    id integer NOT NULL,
    client_id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    title text,
    is_primary boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.client_contacts OWNER TO mssp_user;

--
-- Name: client_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.client_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_contacts_id_seq OWNER TO mssp_user;

--
-- Name: client_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.client_contacts_id_seq OWNED BY public.client_contacts.id;


--
-- Name: client_external_mappings; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.client_external_mappings (
    id integer NOT NULL,
    client_id integer NOT NULL,
    system_name text NOT NULL,
    external_identifier text NOT NULL,
    metadata jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.client_external_mappings OWNER TO mssp_user;

--
-- Name: client_external_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.client_external_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_external_mappings_id_seq OWNER TO mssp_user;

--
-- Name: client_external_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.client_external_mappings_id_seq OWNED BY public.client_external_mappings.id;


--
-- Name: client_feedback; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.client_feedback (
    id integer NOT NULL,
    client_id integer NOT NULL,
    contract_id integer,
    service_scope_id integer,
    feedback_date timestamp without time zone DEFAULT now(),
    feedback_type text NOT NULL,
    category text,
    priority text DEFAULT 'medium'::text,
    title text NOT NULL,
    description text NOT NULL,
    contact_method text,
    satisfaction_rating integer,
    status text DEFAULT 'open'::text,
    assigned_to integer,
    resolved_by integer,
    resolved_at timestamp without time zone,
    resolution_notes text,
    follow_up_required boolean DEFAULT false,
    follow_up_date timestamp without time zone,
    internal_notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.client_feedback OWNER TO mssp_user;

--
-- Name: client_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.client_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_feedback_id_seq OWNER TO mssp_user;

--
-- Name: client_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.client_feedback_id_seq OWNED BY public.client_feedback.id;


--
-- Name: client_hardware_assignments; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.client_hardware_assignments (
    id integer NOT NULL,
    client_id integer NOT NULL,
    hardware_asset_id integer NOT NULL,
    service_scope_id integer,
    assigned_date timestamp without time zone DEFAULT now() NOT NULL,
    returned_date timestamp without time zone,
    installation_location text,
    status text DEFAULT 'active'::text NOT NULL,
    notes text
);


ALTER TABLE public.client_hardware_assignments OWNER TO mssp_user;

--
-- Name: client_hardware_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.client_hardware_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_hardware_assignments_id_seq OWNER TO mssp_user;

--
-- Name: client_hardware_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.client_hardware_assignments_id_seq OWNED BY public.client_hardware_assignments.id;


--
-- Name: client_licenses; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.client_licenses (
    id integer NOT NULL,
    client_id integer NOT NULL,
    license_pool_id integer NOT NULL,
    service_scope_id integer,
    assigned_licenses integer NOT NULL,
    assigned_date timestamp without time zone DEFAULT now() NOT NULL,
    notes text
);


ALTER TABLE public.client_licenses OWNER TO mssp_user;

--
-- Name: client_licenses_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.client_licenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_licenses_id_seq OWNER TO mssp_user;

--
-- Name: client_licenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.client_licenses_id_seq OWNED BY public.client_licenses.id;


--
-- Name: client_satisfaction_surveys; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.client_satisfaction_surveys (
    id integer NOT NULL,
    client_id integer NOT NULL,
    contract_id integer,
    service_scope_id integer,
    survey_date timestamp without time zone NOT NULL,
    survey_type text NOT NULL,
    overall_satisfaction integer NOT NULL,
    service_quality integer,
    response_time integer,
    communication integer,
    technical_expertise integer,
    value_for_money integer,
    likelihood_to_recommend integer,
    feedback text,
    improvements text,
    compliments text,
    concerns text,
    status text DEFAULT 'completed'::text,
    conducted_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.client_satisfaction_surveys OWNER TO mssp_user;

--
-- Name: client_satisfaction_surveys_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.client_satisfaction_surveys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_satisfaction_surveys_id_seq OWNER TO mssp_user;

--
-- Name: client_satisfaction_surveys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.client_satisfaction_surveys_id_seq OWNED BY public.client_satisfaction_surveys.id;


--
-- Name: client_team_assignments; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.client_team_assignments (
    id integer NOT NULL,
    client_id integer NOT NULL,
    user_id integer NOT NULL,
    role text NOT NULL,
    assigned_date timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    notes text
);


ALTER TABLE public.client_team_assignments OWNER TO mssp_user;

--
-- Name: client_team_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.client_team_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_team_assignments_id_seq OWNER TO mssp_user;

--
-- Name: client_team_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.client_team_assignments_id_seq OWNED BY public.client_team_assignments.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    name text NOT NULL,
    short_name text,
    domain text,
    industry text,
    company_size text,
    status text DEFAULT 'prospect'::text NOT NULL,
    source text,
    address text,
    website text,
    notes text,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT clients_status_check CHECK ((status = ANY (ARRAY['prospect'::text, 'active'::text, 'inactive'::text, 'suspended'::text, 'archived'::text])))
);


ALTER TABLE public.clients OWNER TO mssp_user;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO mssp_user;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.company_settings (
    id integer NOT NULL,
    company_name text DEFAULT 'MSSP Client Manager'::text NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    timezone text DEFAULT 'America/New_York'::text NOT NULL,
    fiscal_year_start text DEFAULT '01-01'::text NOT NULL,
    date_format text DEFAULT 'MM/DD/YYYY'::text NOT NULL,
    time_format text DEFAULT '12h'::text NOT NULL,
    logo_url text,
    primary_color text DEFAULT '#3b82f6'::text NOT NULL,
    secondary_color text DEFAULT '#64748b'::text NOT NULL,
    address text,
    phone text,
    email text,
    website text,
    tax_id text,
    registration_number text,
    email_notifications_enabled boolean DEFAULT true NOT NULL,
    sms_notifications_enabled boolean DEFAULT false NOT NULL,
    session_timeout_minutes integer DEFAULT 480 NOT NULL,
    password_expiry_days integer DEFAULT 90 NOT NULL,
    max_login_attempts integer DEFAULT 5 NOT NULL,
    audit_log_retention_days integer DEFAULT 2555 NOT NULL,
    backup_retention_days integer DEFAULT 365 NOT NULL,
    api_rate_limit integer DEFAULT 1000 NOT NULL,
    webhook_retry_attempts integer DEFAULT 3 NOT NULL,
    advanced_search_enabled boolean DEFAULT true NOT NULL,
    audit_logging_enabled boolean DEFAULT true NOT NULL,
    two_factor_required boolean DEFAULT false NOT NULL,
    data_export_enabled boolean DEFAULT true NOT NULL,
    ldap_enabled boolean DEFAULT false NOT NULL,
    ldap_url text,
    ldap_bind_dn text,
    ldap_bind_password text,
    ldap_search_base text,
    ldap_search_filter text DEFAULT '(uid={{username}})'::text,
    ldap_username_attribute text DEFAULT 'uid'::text,
    ldap_email_attribute text DEFAULT 'mail'::text,
    ldap_first_name_attribute text DEFAULT 'givenName'::text,
    ldap_last_name_attribute text DEFAULT 'sn'::text,
    ldap_default_role text DEFAULT 'user'::text,
    ldap_group_search_base text,
    ldap_group_search_filter text,
    ldap_admin_group text,
    ldap_manager_group text,
    ldap_engineer_group text,
    ldap_connection_timeout integer DEFAULT 5000,
    ldap_search_timeout integer DEFAULT 10000,
    ldap_certificate_verification boolean DEFAULT true NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer
);


ALTER TABLE public.company_settings OWNER TO mssp_user;

--
-- Name: company_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.company_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_settings_id_seq OWNER TO mssp_user;

--
-- Name: company_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.company_settings_id_seq OWNED BY public.company_settings.id;


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.contracts (
    id integer NOT NULL,
    client_id integer NOT NULL,
    name text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    auto_renewal boolean DEFAULT false NOT NULL,
    renewal_terms text,
    total_value numeric(12,2),
    status text DEFAULT 'draft'::text NOT NULL,
    document_url text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contracts OWNER TO mssp_user;

--
-- Name: contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.contracts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contracts_id_seq OWNER TO mssp_user;

--
-- Name: contracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.contracts_id_seq OWNED BY public.contracts.id;


--
-- Name: custom_field_values; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.custom_field_values (
    id integer NOT NULL,
    custom_field_id integer NOT NULL,
    entity_id integer NOT NULL,
    value text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_field_values OWNER TO mssp_user;

--
-- Name: custom_field_values_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.custom_field_values_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_field_values_id_seq OWNER TO mssp_user;

--
-- Name: custom_field_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.custom_field_values_id_seq OWNED BY public.custom_field_values.id;


--
-- Name: custom_fields; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.custom_fields (
    id integer NOT NULL,
    entity_type text NOT NULL,
    field_name text NOT NULL,
    field_type text NOT NULL,
    field_options jsonb,
    is_required boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_fields OWNER TO mssp_user;

--
-- Name: custom_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.custom_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_fields_id_seq OWNER TO mssp_user;

--
-- Name: custom_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.custom_fields_id_seq OWNED BY public.custom_fields.id;


--
-- Name: dashboard_widget_assignments; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.dashboard_widget_assignments (
    id integer NOT NULL,
    dashboard_id integer NOT NULL,
    widget_id integer NOT NULL,
    "position" jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dashboard_widget_assignments OWNER TO mssp_user;

--
-- Name: dashboard_widget_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.dashboard_widget_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dashboard_widget_assignments_id_seq OWNER TO mssp_user;

--
-- Name: dashboard_widget_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.dashboard_widget_assignments_id_seq OWNED BY public.dashboard_widget_assignments.id;


--
-- Name: dashboard_widgets; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.dashboard_widgets (
    id integer NOT NULL,
    name text NOT NULL,
    widget_type text NOT NULL,
    config jsonb NOT NULL,
    data_source_id integer,
    refresh_interval integer,
    is_active boolean DEFAULT true NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dashboard_widgets OWNER TO mssp_user;

--
-- Name: dashboard_widgets_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.dashboard_widgets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dashboard_widgets_id_seq OWNER TO mssp_user;

--
-- Name: dashboard_widgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.dashboard_widgets_id_seq OWNED BY public.dashboard_widgets.id;


--
-- Name: dashboards; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.dashboards (
    id integer NOT NULL,
    name text NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dashboards OWNER TO mssp_user;

--
-- Name: dashboards_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.dashboards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dashboards_id_seq OWNER TO mssp_user;

--
-- Name: dashboards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.dashboards_id_seq OWNED BY public.dashboards.id;


--
-- Name: data_access_logs; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.data_access_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id integer,
    entity_name text,
    access_type text NOT NULL,
    access_method text NOT NULL,
    data_scope text,
    filters jsonb,
    result_count integer,
    sensitive_data boolean DEFAULT false NOT NULL,
    purpose text,
    ip_address text,
    user_agent text,
    session_duration integer,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.data_access_logs OWNER TO mssp_user;

--
-- Name: data_access_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.data_access_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.data_access_logs_id_seq OWNER TO mssp_user;

--
-- Name: data_access_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.data_access_logs_id_seq OWNED BY public.data_access_logs.id;


--
-- Name: data_source_mappings; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.data_source_mappings (
    id integer NOT NULL,
    data_source_id integer NOT NULL,
    source_field text NOT NULL,
    target_field text NOT NULL,
    field_type text NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    default_value text,
    transformation text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.data_source_mappings OWNER TO mssp_user;

--
-- Name: data_source_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.data_source_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.data_source_mappings_id_seq OWNER TO mssp_user;

--
-- Name: data_source_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.data_source_mappings_id_seq OWNED BY public.data_source_mappings.id;


--
-- Name: data_sources; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.data_sources (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    api_endpoint text,
    auth_type text,
    auth_config jsonb,
    connection_string text,
    config jsonb,
    sync_frequency text DEFAULT 'manual'::text,
    status text DEFAULT 'active'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_connected timestamp without time zone,
    last_sync_at timestamp without time zone,
    default_page_size integer DEFAULT 100,
    max_page_size integer DEFAULT 1000,
    supports_pagination boolean DEFAULT true,
    pagination_type text DEFAULT 'offset'::text,
    pagination_config jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL
);


ALTER TABLE public.data_sources OWNER TO mssp_user;

--
-- Name: data_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.data_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.data_sources_id_seq OWNER TO mssp_user;

--
-- Name: data_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.data_sources_id_seq OWNED BY public.data_sources.id;


--
-- Name: document_access; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.document_access (
    id integer NOT NULL,
    document_id integer NOT NULL,
    user_id integer NOT NULL,
    access_type text NOT NULL,
    granted_by integer NOT NULL,
    granted_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone
);


ALTER TABLE public.document_access OWNER TO mssp_user;

--
-- Name: document_access_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.document_access_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_access_id_seq OWNER TO mssp_user;

--
-- Name: document_access_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.document_access_id_seq OWNED BY public.document_access.id;


--
-- Name: document_versions; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.document_versions (
    id integer NOT NULL,
    document_id integer NOT NULL,
    version integer NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer NOT NULL,
    change_notes text,
    uploaded_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document_versions OWNER TO mssp_user;

--
-- Name: document_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.document_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_versions_id_seq OWNER TO mssp_user;

--
-- Name: document_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.document_versions_id_seq OWNED BY public.document_versions.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    document_type text NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer NOT NULL,
    mime_type text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    client_id integer,
    contract_id integer,
    tags text[],
    expiration_date timestamp without time zone,
    compliance_type text,
    uploaded_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documents OWNER TO mssp_user;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_id_seq OWNER TO mssp_user;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: external_systems; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.external_systems (
    id integer NOT NULL,
    system_name text NOT NULL,
    display_name text NOT NULL,
    base_url text NOT NULL,
    auth_type text NOT NULL,
    auth_config jsonb,
    api_endpoints jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.external_systems OWNER TO mssp_user;

--
-- Name: external_systems_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.external_systems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_systems_id_seq OWNER TO mssp_user;

--
-- Name: external_systems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.external_systems_id_seq OWNED BY public.external_systems.id;


--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.financial_transactions (
    id integer NOT NULL,
    type text NOT NULL,
    amount numeric(12,2) NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    client_id integer,
    contract_id integer,
    service_scope_id integer,
    license_pool_id integer,
    hardware_asset_id integer,
    transaction_date timestamp without time zone NOT NULL,
    category text,
    reference text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.financial_transactions OWNER TO mssp_user;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.financial_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financial_transactions_id_seq OWNER TO mssp_user;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.financial_transactions_id_seq OWNED BY public.financial_transactions.id;


--
-- Name: global_search_index; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.global_search_index (
    id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    search_content text NOT NULL,
    keywords text[],
    last_indexed timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.global_search_index OWNER TO mssp_user;

--
-- Name: global_search_index_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.global_search_index_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.global_search_index_id_seq OWNER TO mssp_user;

--
-- Name: global_search_index_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.global_search_index_id_seq OWNED BY public.global_search_index.id;


--
-- Name: hardware_assets; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.hardware_assets (
    id integer NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    manufacturer text,
    model text,
    serial_number text,
    purchase_date timestamp without time zone,
    purchase_cost numeric(10,2),
    warranty_expiry timestamp without time zone,
    status text DEFAULT 'available'::text NOT NULL,
    location text,
    purchase_request_number text,
    purchase_order_number text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.hardware_assets OWNER TO mssp_user;

--
-- Name: hardware_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.hardware_assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hardware_assets_id_seq OWNER TO mssp_user;

--
-- Name: hardware_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.hardware_assets_id_seq OWNED BY public.hardware_assets.id;


--
-- Name: individual_licenses; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.individual_licenses (
    id integer NOT NULL,
    client_id integer NOT NULL,
    service_scope_id integer,
    name text NOT NULL,
    vendor text NOT NULL,
    product_name text NOT NULL,
    license_key text,
    license_type text,
    quantity integer DEFAULT 1 NOT NULL,
    cost_per_license numeric(8,2),
    purchase_date timestamp without time zone,
    expiry_date timestamp without time zone,
    renewal_date timestamp without time zone,
    purchase_request_number text,
    purchase_order_number text,
    document_url text,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.individual_licenses OWNER TO mssp_user;

--
-- Name: individual_licenses_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.individual_licenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.individual_licenses_id_seq OWNER TO mssp_user;

--
-- Name: individual_licenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.individual_licenses_id_seq OWNED BY public.individual_licenses.id;


--
-- Name: integrated_data; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.integrated_data (
    id integer NOT NULL,
    data_source_id integer NOT NULL,
    raw_data jsonb NOT NULL,
    mapped_data jsonb NOT NULL,
    synced_at timestamp without time zone DEFAULT now() NOT NULL,
    record_identifier text
);


ALTER TABLE public.integrated_data OWNER TO mssp_user;

--
-- Name: integrated_data_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.integrated_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.integrated_data_id_seq OWNER TO mssp_user;

--
-- Name: integrated_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.integrated_data_id_seq OWNED BY public.integrated_data.id;


--
-- Name: license_pools; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.license_pools (
    id integer NOT NULL,
    name text NOT NULL,
    vendor text NOT NULL,
    product_name text NOT NULL,
    license_type text,
    total_licenses integer NOT NULL,
    available_licenses integer NOT NULL,
    ordered_licenses integer DEFAULT 0 NOT NULL,
    cost_per_license numeric(8,2),
    renewal_date timestamp without time zone,
    purchase_request_number text,
    purchase_order_number text,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.license_pools OWNER TO mssp_user;

--
-- Name: license_pools_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.license_pools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.license_pools_id_seq OWNER TO mssp_user;

--
-- Name: license_pools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.license_pools_id_seq OWNED BY public.license_pools.id;


--
-- Name: page_permissions; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.page_permissions (
    id integer NOT NULL,
    page_name text NOT NULL,
    page_url text NOT NULL,
    display_name text NOT NULL,
    description text,
    category text DEFAULT 'main'::text NOT NULL,
    icon text,
    admin_access boolean DEFAULT true NOT NULL,
    manager_access boolean DEFAULT false NOT NULL,
    engineer_access boolean DEFAULT false NOT NULL,
    user_access boolean DEFAULT false NOT NULL,
    requires_special_permission boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.page_permissions OWNER TO mssp_user;

--
-- Name: page_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.page_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.page_permissions_id_seq OWNER TO mssp_user;

--
-- Name: page_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.page_permissions_id_seq OWNED BY public.page_permissions.id;


--
-- Name: proposals; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.proposals (
    id integer NOT NULL,
    contract_id integer NOT NULL,
    type text NOT NULL,
    version text DEFAULT '1.0'::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    document_url text,
    proposed_value numeric(12,2),
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.proposals OWNER TO mssp_user;

--
-- Name: proposals_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.proposals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proposals_id_seq OWNER TO mssp_user;

--
-- Name: proposals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.proposals_id_seq OWNED BY public.proposals.id;


--
-- Name: saved_searches; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.saved_searches (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    description text,
    search_config text NOT NULL,
    entity_types text[] NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    is_quick_filter boolean DEFAULT false NOT NULL,
    use_count integer DEFAULT 0 NOT NULL,
    last_used timestamp without time zone,
    tags text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.saved_searches OWNER TO mssp_user;

--
-- Name: saved_searches_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.saved_searches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_searches_id_seq OWNER TO mssp_user;

--
-- Name: saved_searches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.saved_searches_id_seq OWNED BY public.saved_searches.id;


--
-- Name: schema_versions; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.schema_versions (
    id integer NOT NULL,
    script_version character varying(20),
    app_version character varying(20),
    schema_version character varying(20) NOT NULL,
    version character varying(20),
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    environment character varying(20) DEFAULT 'production'::character varying,
    notes text,
    migration_file character varying(255),
    description text
);


ALTER TABLE public.schema_versions OWNER TO mssp_user;

--
-- Name: schema_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.schema_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schema_versions_id_seq OWNER TO mssp_user;

--
-- Name: schema_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.schema_versions_id_seq OWNED BY public.schema_versions.id;


--
-- Name: search_history; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.search_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    search_query text NOT NULL,
    search_config text,
    entity_types text[] NOT NULL,
    results_count integer DEFAULT 0 NOT NULL,
    execution_time integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.search_history OWNER TO mssp_user;

--
-- Name: search_history_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.search_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.search_history_id_seq OWNER TO mssp_user;

--
-- Name: search_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.search_history_id_seq OWNED BY public.search_history.id;


--
-- Name: security_events; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.security_events (
    id integer NOT NULL,
    user_id integer,
    event_type text NOT NULL,
    source text NOT NULL,
    ip_address text NOT NULL,
    user_agent text,
    location text,
    device_fingerprint text,
    success boolean NOT NULL,
    failure_reason text,
    risk_score integer,
    blocked boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.security_events OWNER TO mssp_user;

--
-- Name: security_events_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.security_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.security_events_id_seq OWNER TO mssp_user;

--
-- Name: security_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.security_events_id_seq OWNED BY public.security_events.id;


--
-- Name: service_authorization_forms; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.service_authorization_forms (
    id integer NOT NULL,
    client_id integer NOT NULL,
    contract_id integer NOT NULL,
    service_scope_id integer,
    saf_number text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text,
    requested_date timestamp without time zone NOT NULL,
    approved_date timestamp without time zone,
    expiry_date timestamp without time zone,
    approved_by integer,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_authorization_forms OWNER TO mssp_user;

--
-- Name: service_authorization_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.service_authorization_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_authorization_forms_id_seq OWNER TO mssp_user;

--
-- Name: service_authorization_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.service_authorization_forms_id_seq OWNED BY public.service_authorization_forms.id;


--
-- Name: service_scope_fields; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.service_scope_fields (
    id integer NOT NULL,
    service_id integer NOT NULL,
    name text NOT NULL,
    label text NOT NULL,
    field_type text NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    placeholder_text text,
    help_text text,
    default_value text,
    select_options jsonb,
    validation_rules jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_scope_fields OWNER TO mssp_user;

--
-- Name: service_scope_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.service_scope_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_scope_fields_id_seq OWNER TO mssp_user;

--
-- Name: service_scope_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.service_scope_fields_id_seq OWNED BY public.service_scope_fields.id;


--
-- Name: service_scopes; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.service_scopes (
    id integer NOT NULL,
    contract_id integer NOT NULL,
    service_id integer NOT NULL,
    scope_definition jsonb,
    saf_document_url text,
    saf_start_date timestamp without time zone,
    saf_end_date timestamp without time zone,
    saf_status text DEFAULT 'pending'::text,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    status text DEFAULT 'active'::text,
    monthly_value numeric(10,2),
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_scopes OWNER TO mssp_user;

--
-- Name: service_scopes_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.service_scopes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_scopes_id_seq OWNER TO mssp_user;

--
-- Name: service_scopes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.service_scopes_id_seq OWNED BY public.service_scopes.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    description text,
    delivery_model text NOT NULL,
    base_price numeric(10,2),
    pricing_unit text,
    scope_definition_template jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.services OWNER TO mssp_user;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO mssp_user;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: system_events; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.system_events (
    id integer NOT NULL,
    event_type text NOT NULL,
    source text NOT NULL,
    severity text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    details jsonb,
    affected_entities jsonb,
    resolution text,
    resolved_at timestamp without time zone,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_events OWNER TO mssp_user;

--
-- Name: system_events_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.system_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_events_id_seq OWNER TO mssp_user;

--
-- Name: system_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.system_events_id_seq OWNED BY public.system_events.id;


--
-- Name: user_dashboard_settings; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.user_dashboard_settings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    card_id text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    category text DEFAULT 'dashboard'::text NOT NULL,
    data_source text NOT NULL,
    size text DEFAULT 'small'::text NOT NULL,
    visible boolean DEFAULT true NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_built_in boolean DEFAULT false NOT NULL,
    is_removable boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_dashboard_settings OWNER TO mssp_user;

--
-- Name: user_dashboard_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.user_dashboard_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_dashboard_settings_id_seq OWNER TO mssp_user;

--
-- Name: user_dashboard_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.user_dashboard_settings_id_seq OWNED BY public.user_dashboard_settings.id;


--
-- Name: user_dashboards; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.user_dashboards (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    description text,
    layout jsonb NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_dashboards OWNER TO mssp_user;

--
-- Name: user_dashboards_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.user_dashboards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_dashboards_id_seq OWNER TO mssp_user;

--
-- Name: user_dashboards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.user_dashboards_id_seq OWNED BY public.user_dashboards.id;


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.user_settings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    email_notifications boolean DEFAULT true NOT NULL,
    push_notifications boolean DEFAULT false NOT NULL,
    contract_reminders boolean DEFAULT true NOT NULL,
    financial_alerts boolean DEFAULT true NOT NULL,
    two_factor_auth boolean DEFAULT false NOT NULL,
    session_timeout boolean DEFAULT true NOT NULL,
    dark_mode boolean DEFAULT false NOT NULL,
    timezone text DEFAULT 'America/New_York'::text NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    auto_save_forms boolean DEFAULT true NOT NULL,
    data_export boolean DEFAULT true NOT NULL,
    api_access boolean DEFAULT false NOT NULL,
    data_retention_period text DEFAULT '5years'::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_settings OWNER TO mssp_user;

--
-- Name: user_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.user_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_settings_id_seq OWNER TO mssp_user;

--
-- Name: user_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.user_settings_id_seq OWNED BY public.user_settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    auth_provider text DEFAULT 'local'::text NOT NULL,
    ldap_id text,
    is_active boolean DEFAULT true NOT NULL,
    two_factor_secret text,
    two_factor_backup_codes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO mssp_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO mssp_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: widgets; Type: TABLE; Schema: public; Owner: mssp_user
--

CREATE TABLE public.widgets (
    id integer NOT NULL,
    dashboard_id integer NOT NULL,
    title text NOT NULL,
    widget_type text NOT NULL,
    data_source text NOT NULL,
    config jsonb NOT NULL,
    "position" jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.widgets OWNER TO mssp_user;

--
-- Name: widgets_id_seq; Type: SEQUENCE; Schema: public; Owner: mssp_user
--

CREATE SEQUENCE public.widgets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.widgets_id_seq OWNER TO mssp_user;

--
-- Name: widgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mssp_user
--

ALTER SEQUENCE public.widgets_id_seq OWNED BY public.widgets.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: certificates_of_compliance id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.certificates_of_compliance ALTER COLUMN id SET DEFAULT nextval('public.certificates_of_compliance_id_seq'::regclass);


--
-- Name: change_history id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.change_history ALTER COLUMN id SET DEFAULT nextval('public.change_history_id_seq'::regclass);


--
-- Name: client_contacts id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_contacts ALTER COLUMN id SET DEFAULT nextval('public.client_contacts_id_seq'::regclass);


--
-- Name: client_external_mappings id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_external_mappings ALTER COLUMN id SET DEFAULT nextval('public.client_external_mappings_id_seq'::regclass);


--
-- Name: client_feedback id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_feedback ALTER COLUMN id SET DEFAULT nextval('public.client_feedback_id_seq'::regclass);


--
-- Name: client_hardware_assignments id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_hardware_assignments ALTER COLUMN id SET DEFAULT nextval('public.client_hardware_assignments_id_seq'::regclass);


--
-- Name: client_licenses id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_licenses ALTER COLUMN id SET DEFAULT nextval('public.client_licenses_id_seq'::regclass);


--
-- Name: client_satisfaction_surveys id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_satisfaction_surveys ALTER COLUMN id SET DEFAULT nextval('public.client_satisfaction_surveys_id_seq'::regclass);


--
-- Name: client_team_assignments id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_team_assignments ALTER COLUMN id SET DEFAULT nextval('public.client_team_assignments_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: company_settings id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.company_settings ALTER COLUMN id SET DEFAULT nextval('public.company_settings_id_seq'::regclass);


--
-- Name: contracts id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.contracts ALTER COLUMN id SET DEFAULT nextval('public.contracts_id_seq'::regclass);


--
-- Name: custom_field_values id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.custom_field_values ALTER COLUMN id SET DEFAULT nextval('public.custom_field_values_id_seq'::regclass);


--
-- Name: custom_fields id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.custom_fields ALTER COLUMN id SET DEFAULT nextval('public.custom_fields_id_seq'::regclass);


--
-- Name: dashboard_widget_assignments id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.dashboard_widget_assignments ALTER COLUMN id SET DEFAULT nextval('public.dashboard_widget_assignments_id_seq'::regclass);


--
-- Name: dashboard_widgets id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.dashboard_widgets ALTER COLUMN id SET DEFAULT nextval('public.dashboard_widgets_id_seq'::regclass);


--
-- Name: dashboards id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.dashboards ALTER COLUMN id SET DEFAULT nextval('public.dashboards_id_seq'::regclass);


--
-- Name: data_access_logs id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.data_access_logs ALTER COLUMN id SET DEFAULT nextval('public.data_access_logs_id_seq'::regclass);


--
-- Name: data_source_mappings id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.data_source_mappings ALTER COLUMN id SET DEFAULT nextval('public.data_source_mappings_id_seq'::regclass);


--
-- Name: data_sources id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.data_sources ALTER COLUMN id SET DEFAULT nextval('public.data_sources_id_seq'::regclass);


--
-- Name: document_access id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.document_access ALTER COLUMN id SET DEFAULT nextval('public.document_access_id_seq'::regclass);


--
-- Name: document_versions id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.document_versions ALTER COLUMN id SET DEFAULT nextval('public.document_versions_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: external_systems id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.external_systems ALTER COLUMN id SET DEFAULT nextval('public.external_systems_id_seq'::regclass);


--
-- Name: financial_transactions id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.financial_transactions ALTER COLUMN id SET DEFAULT nextval('public.financial_transactions_id_seq'::regclass);


--
-- Name: global_search_index id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.global_search_index ALTER COLUMN id SET DEFAULT nextval('public.global_search_index_id_seq'::regclass);


--
-- Name: hardware_assets id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.hardware_assets ALTER COLUMN id SET DEFAULT nextval('public.hardware_assets_id_seq'::regclass);


--
-- Name: individual_licenses id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.individual_licenses ALTER COLUMN id SET DEFAULT nextval('public.individual_licenses_id_seq'::regclass);


--
-- Name: integrated_data id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.integrated_data ALTER COLUMN id SET DEFAULT nextval('public.integrated_data_id_seq'::regclass);


--
-- Name: license_pools id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.license_pools ALTER COLUMN id SET DEFAULT nextval('public.license_pools_id_seq'::regclass);


--
-- Name: page_permissions id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.page_permissions ALTER COLUMN id SET DEFAULT nextval('public.page_permissions_id_seq'::regclass);


--
-- Name: proposals id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.proposals ALTER COLUMN id SET DEFAULT nextval('public.proposals_id_seq'::regclass);


--
-- Name: saved_searches id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.saved_searches ALTER COLUMN id SET DEFAULT nextval('public.saved_searches_id_seq'::regclass);


--
-- Name: schema_versions id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.schema_versions ALTER COLUMN id SET DEFAULT nextval('public.schema_versions_id_seq'::regclass);


--
-- Name: search_history id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.search_history ALTER COLUMN id SET DEFAULT nextval('public.search_history_id_seq'::regclass);


--
-- Name: security_events id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.security_events ALTER COLUMN id SET DEFAULT nextval('public.security_events_id_seq'::regclass);


--
-- Name: service_authorization_forms id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_authorization_forms ALTER COLUMN id SET DEFAULT nextval('public.service_authorization_forms_id_seq'::regclass);


--
-- Name: service_scope_fields id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_scope_fields ALTER COLUMN id SET DEFAULT nextval('public.service_scope_fields_id_seq'::regclass);


--
-- Name: service_scopes id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_scopes ALTER COLUMN id SET DEFAULT nextval('public.service_scopes_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: system_events id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.system_events ALTER COLUMN id SET DEFAULT nextval('public.system_events_id_seq'::regclass);


--
-- Name: user_dashboard_settings id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.user_dashboard_settings ALTER COLUMN id SET DEFAULT nextval('public.user_dashboard_settings_id_seq'::regclass);


--
-- Name: user_dashboards id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.user_dashboards ALTER COLUMN id SET DEFAULT nextval('public.user_dashboards_id_seq'::regclass);


--
-- Name: user_settings id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.user_settings ALTER COLUMN id SET DEFAULT nextval('public.user_settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: widgets id; Type: DEFAULT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.widgets ALTER COLUMN id SET DEFAULT nextval('public.widgets_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.audit_logs (id, user_id, session_id, action, entity_type, entity_id, entity_name, description, ip_address, user_agent, severity, category, metadata, "timestamp") FROM stdin;
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
-- Data for Name: client_hardware_assignments; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.client_hardware_assignments (id, client_id, hardware_asset_id, service_scope_id, assigned_date, returned_date, installation_location, status, notes) FROM stdin;
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
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.clients (id, name, short_name, domain, industry, company_size, status, source, address, website, notes, deleted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: company_settings; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.company_settings (id, company_name, currency, timezone, fiscal_year_start, date_format, time_format, logo_url, primary_color, secondary_color, address, phone, email, website, tax_id, registration_number, email_notifications_enabled, sms_notifications_enabled, session_timeout_minutes, password_expiry_days, max_login_attempts, audit_log_retention_days, backup_retention_days, api_rate_limit, webhook_retry_attempts, advanced_search_enabled, audit_logging_enabled, two_factor_required, data_export_enabled, ldap_enabled, ldap_url, ldap_bind_dn, ldap_bind_password, ldap_search_base, ldap_search_filter, ldap_username_attribute, ldap_email_attribute, ldap_first_name_attribute, ldap_last_name_attribute, ldap_default_role, ldap_group_search_base, ldap_group_search_filter, ldap_admin_group, ldap_manager_group, ldap_engineer_group, ldap_connection_timeout, ldap_search_timeout, ldap_certificate_verification, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.contracts (id, client_id, name, start_date, end_date, auto_renewal, renewal_terms, total_value, status, document_url, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_field_values; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.custom_field_values (id, custom_field_id, entity_id, value, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_fields; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.custom_fields (id, entity_type, field_name, field_type, field_options, is_required, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: dashboard_widget_assignments; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.dashboard_widget_assignments (id, dashboard_id, widget_id, "position", created_at) FROM stdin;
\.


--
-- Data for Name: dashboard_widgets; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.dashboard_widgets (id, name, widget_type, config, data_source_id, refresh_interval, is_active, created_by, created_at, updated_at) FROM stdin;
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
-- Data for Name: data_sources; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.data_sources (id, name, description, type, api_endpoint, auth_type, auth_config, connection_string, config, sync_frequency, status, is_active, last_connected, last_sync_at, default_page_size, max_page_size, supports_pagination, pagination_type, pagination_config, created_at, updated_at, created_by) FROM stdin;
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
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.documents (id, name, description, document_type, file_name, file_path, file_size, mime_type, version, is_active, client_id, contract_id, tags, expiration_date, compliance_type, uploaded_by, created_at, updated_at) FROM stdin;
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
-- Data for Name: hardware_assets; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.hardware_assets (id, name, category, manufacturer, model, serial_number, purchase_date, purchase_cost, warranty_expiry, status, location, purchase_request_number, purchase_order_number, notes, created_at) FROM stdin;
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
-- Data for Name: license_pools; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.license_pools (id, name, vendor, product_name, license_type, total_licenses, available_licenses, ordered_licenses, cost_per_license, renewal_date, purchase_request_number, purchase_order_number, notes, is_active, created_at) FROM stdin;
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
1	1.6.0	1.6.0	1.6.0	1.6.0	2025-06-03 14:13:46.051462	2025-06-03 14:13:46.051462	production	Initial schema version created by setup script	\N	Database initialized with version 1.6.0
2	1.6.0	1.6.0	1.6.0	1.6.0	2025-06-03 14:14:01.032205	2025-06-03 14:14:01.032205	production	Production sync deployment - Tue Jun  3 14:14:01 +03 2025	\N	Auto-sync production deployment from sync-production.sh
3	auto-sync	1.6.0	1.6.0	\N	2025-06-03 14:15:52.208389	2025-06-03 14:15:52.208389	development	Auto-sync schema update completed	\N	\N
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
-- Data for Name: service_authorization_forms; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.service_authorization_forms (id, client_id, contract_id, service_scope_id, saf_number, description, status, requested_date, approved_date, expiry_date, approved_by, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_scope_fields; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.service_scope_fields (id, service_id, name, label, field_type, is_required, display_order, placeholder_text, help_text, default_value, select_options, validation_rules, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_scopes; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.service_scopes (id, contract_id, service_id, scope_definition, saf_document_url, saf_start_date, saf_end_date, saf_status, start_date, end_date, status, monthly_value, notes, created_at) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.services (id, name, category, description, delivery_model, base_price, pricing_unit, scope_definition_template, is_active, created_at) FROM stdin;
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
-- Data for Name: user_dashboards; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.user_dashboards (id, user_id, name, description, layout, is_default, is_public, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.user_settings (id, user_id, email_notifications, push_notifications, contract_reminders, financial_alerts, two_factor_auth, session_timeout, dark_mode, timezone, language, currency, auto_save_forms, data_export, api_access, data_retention_period, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mssp_user
--

COPY public.users (id, username, password, email, first_name, last_name, role, auth_provider, ldap_id, is_active, two_factor_secret, two_factor_backup_codes, created_at) FROM stdin;
1	admin	13039af52fe33563aa8f021a5ee987ebd74fba314781cc2728d9b917e427549000095df4892f4807a6a0ecd5fa07f4b8815e14c9d2a96c319aba32c8559be79a.50b88b71cb1ac88a4dccc362902c429c	admin@mssp.local	System	Administrator	admin	local	\N	t	\N	\N	2025-06-03 13:23:58.614544
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

SELECT pg_catalog.setval('public.clients_id_seq', 1, false);


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

SELECT pg_catalog.setval('public.schema_versions_id_seq', 3, true);


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
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: certificates_of_compliance certificates_of_compliance_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.certificates_of_compliance
    ADD CONSTRAINT certificates_of_compliance_pkey PRIMARY KEY (id);


--
-- Name: change_history change_history_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.change_history
    ADD CONSTRAINT change_history_pkey PRIMARY KEY (id);


--
-- Name: client_contacts client_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_contacts
    ADD CONSTRAINT client_contacts_pkey PRIMARY KEY (id);


--
-- Name: client_external_mappings client_external_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_external_mappings
    ADD CONSTRAINT client_external_mappings_pkey PRIMARY KEY (id);


--
-- Name: client_feedback client_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_feedback
    ADD CONSTRAINT client_feedback_pkey PRIMARY KEY (id);


--
-- Name: client_hardware_assignments client_hardware_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_hardware_assignments
    ADD CONSTRAINT client_hardware_assignments_pkey PRIMARY KEY (id);


--
-- Name: client_licenses client_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_licenses
    ADD CONSTRAINT client_licenses_pkey PRIMARY KEY (id);


--
-- Name: client_satisfaction_surveys client_satisfaction_surveys_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_satisfaction_surveys
    ADD CONSTRAINT client_satisfaction_surveys_pkey PRIMARY KEY (id);


--
-- Name: client_team_assignments client_team_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_team_assignments
    ADD CONSTRAINT client_team_assignments_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: custom_field_values custom_field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT custom_field_values_pkey PRIMARY KEY (id);


--
-- Name: custom_fields custom_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.custom_fields
    ADD CONSTRAINT custom_fields_pkey PRIMARY KEY (id);


--
-- Name: dashboard_widget_assignments dashboard_widget_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.dashboard_widget_assignments
    ADD CONSTRAINT dashboard_widget_assignments_pkey PRIMARY KEY (id);


--
-- Name: dashboard_widgets dashboard_widgets_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.dashboard_widgets
    ADD CONSTRAINT dashboard_widgets_pkey PRIMARY KEY (id);


--
-- Name: dashboards dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT dashboards_pkey PRIMARY KEY (id);


--
-- Name: data_access_logs data_access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.data_access_logs
    ADD CONSTRAINT data_access_logs_pkey PRIMARY KEY (id);


--
-- Name: data_source_mappings data_source_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.data_source_mappings
    ADD CONSTRAINT data_source_mappings_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (id);


--
-- Name: document_access document_access_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.document_access
    ADD CONSTRAINT document_access_pkey PRIMARY KEY (id);


--
-- Name: document_versions document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: external_systems external_systems_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.external_systems
    ADD CONSTRAINT external_systems_pkey PRIMARY KEY (id);


--
-- Name: external_systems external_systems_system_name_unique; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.external_systems
    ADD CONSTRAINT external_systems_system_name_unique UNIQUE (system_name);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_pkey PRIMARY KEY (id);


--
-- Name: global_search_index global_search_index_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.global_search_index
    ADD CONSTRAINT global_search_index_pkey PRIMARY KEY (id);


--
-- Name: hardware_assets hardware_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.hardware_assets
    ADD CONSTRAINT hardware_assets_pkey PRIMARY KEY (id);


--
-- Name: hardware_assets hardware_assets_serial_number_unique; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.hardware_assets
    ADD CONSTRAINT hardware_assets_serial_number_unique UNIQUE (serial_number);


--
-- Name: individual_licenses individual_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.individual_licenses
    ADD CONSTRAINT individual_licenses_pkey PRIMARY KEY (id);


--
-- Name: integrated_data integrated_data_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.integrated_data
    ADD CONSTRAINT integrated_data_pkey PRIMARY KEY (id);


--
-- Name: license_pools license_pools_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.license_pools
    ADD CONSTRAINT license_pools_pkey PRIMARY KEY (id);


--
-- Name: page_permissions page_permissions_page_name_unique; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.page_permissions
    ADD CONSTRAINT page_permissions_page_name_unique UNIQUE (page_name);


--
-- Name: page_permissions page_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.page_permissions
    ADD CONSTRAINT page_permissions_pkey PRIMARY KEY (id);


--
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: saved_searches saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.saved_searches
    ADD CONSTRAINT saved_searches_pkey PRIMARY KEY (id);


--
-- Name: schema_versions schema_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.schema_versions
    ADD CONSTRAINT schema_versions_pkey PRIMARY KEY (id);


--
-- Name: search_history search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_pkey PRIMARY KEY (id);


--
-- Name: security_events security_events_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.security_events
    ADD CONSTRAINT security_events_pkey PRIMARY KEY (id);


--
-- Name: service_authorization_forms service_authorization_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_authorization_forms
    ADD CONSTRAINT service_authorization_forms_pkey PRIMARY KEY (id);


--
-- Name: service_scope_fields service_scope_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_scope_fields
    ADD CONSTRAINT service_scope_fields_pkey PRIMARY KEY (id);


--
-- Name: service_scopes service_scopes_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_scopes
    ADD CONSTRAINT service_scopes_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: system_events system_events_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.system_events
    ADD CONSTRAINT system_events_pkey PRIMARY KEY (id);


--
-- Name: user_dashboard_settings user_dashboard_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_pkey PRIMARY KEY (id);


--
-- Name: user_dashboard_settings user_dashboard_settings_user_id_card_id_unique; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_user_id_card_id_unique UNIQUE (user_id, card_id);


--
-- Name: user_dashboards user_dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.user_dashboards
    ADD CONSTRAINT user_dashboards_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_ldap_id_unique; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_ldap_id_unique UNIQUE (ldap_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: widgets widgets_pkey; Type: CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.widgets
    ADD CONSTRAINT widgets_pkey PRIMARY KEY (id);


--
-- Name: idx_clients_active; Type: INDEX; Schema: public; Owner: mssp_user
--

CREATE INDEX idx_clients_active ON public.clients USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_clients_deleted_at; Type: INDEX; Schema: public; Owner: mssp_user
--

CREATE INDEX idx_clients_deleted_at ON public.clients USING btree (deleted_at);


--
-- Name: audit_logs audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: certificates_of_compliance certificates_of_compliance_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.certificates_of_compliance
    ADD CONSTRAINT certificates_of_compliance_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: certificates_of_compliance certificates_of_compliance_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.certificates_of_compliance
    ADD CONSTRAINT certificates_of_compliance_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: certificates_of_compliance certificates_of_compliance_issued_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.certificates_of_compliance
    ADD CONSTRAINT certificates_of_compliance_issued_by_users_id_fk FOREIGN KEY (issued_by) REFERENCES public.users(id);


--
-- Name: certificates_of_compliance certificates_of_compliance_saf_id_service_authorization_forms_i; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.certificates_of_compliance
    ADD CONSTRAINT certificates_of_compliance_saf_id_service_authorization_forms_i FOREIGN KEY (saf_id) REFERENCES public.service_authorization_forms(id);


--
-- Name: certificates_of_compliance certificates_of_compliance_service_scope_id_service_scopes_id_f; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.certificates_of_compliance
    ADD CONSTRAINT certificates_of_compliance_service_scope_id_service_scopes_id_f FOREIGN KEY (service_scope_id) REFERENCES public.service_scopes(id);


--
-- Name: change_history change_history_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.change_history
    ADD CONSTRAINT change_history_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: client_contacts client_contacts_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_contacts
    ADD CONSTRAINT client_contacts_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: client_external_mappings client_external_mappings_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_external_mappings
    ADD CONSTRAINT client_external_mappings_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_feedback client_feedback_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_feedback
    ADD CONSTRAINT client_feedback_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: client_feedback client_feedback_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_feedback
    ADD CONSTRAINT client_feedback_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: client_feedback client_feedback_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_feedback
    ADD CONSTRAINT client_feedback_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: client_feedback client_feedback_resolved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_feedback
    ADD CONSTRAINT client_feedback_resolved_by_users_id_fk FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: client_feedback client_feedback_service_scope_id_service_scopes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_feedback
    ADD CONSTRAINT client_feedback_service_scope_id_service_scopes_id_fk FOREIGN KEY (service_scope_id) REFERENCES public.service_scopes(id);


--
-- Name: client_hardware_assignments client_hardware_assignments_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_hardware_assignments
    ADD CONSTRAINT client_hardware_assignments_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: client_hardware_assignments client_hardware_assignments_hardware_asset_id_hardware_assets_i; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_hardware_assignments
    ADD CONSTRAINT client_hardware_assignments_hardware_asset_id_hardware_assets_i FOREIGN KEY (hardware_asset_id) REFERENCES public.hardware_assets(id);


--
-- Name: client_hardware_assignments client_hardware_assignments_service_scope_id_service_scopes_id_; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_hardware_assignments
    ADD CONSTRAINT client_hardware_assignments_service_scope_id_service_scopes_id_ FOREIGN KEY (service_scope_id) REFERENCES public.service_scopes(id);


--
-- Name: client_licenses client_licenses_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_licenses
    ADD CONSTRAINT client_licenses_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: client_licenses client_licenses_license_pool_id_license_pools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_licenses
    ADD CONSTRAINT client_licenses_license_pool_id_license_pools_id_fk FOREIGN KEY (license_pool_id) REFERENCES public.license_pools(id);


--
-- Name: client_licenses client_licenses_service_scope_id_service_scopes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_licenses
    ADD CONSTRAINT client_licenses_service_scope_id_service_scopes_id_fk FOREIGN KEY (service_scope_id) REFERENCES public.service_scopes(id);


--
-- Name: client_satisfaction_surveys client_satisfaction_surveys_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_satisfaction_surveys
    ADD CONSTRAINT client_satisfaction_surveys_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: client_satisfaction_surveys client_satisfaction_surveys_conducted_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_satisfaction_surveys
    ADD CONSTRAINT client_satisfaction_surveys_conducted_by_users_id_fk FOREIGN KEY (conducted_by) REFERENCES public.users(id);


--
-- Name: client_satisfaction_surveys client_satisfaction_surveys_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_satisfaction_surveys
    ADD CONSTRAINT client_satisfaction_surveys_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: client_satisfaction_surveys client_satisfaction_surveys_service_scope_id_service_scopes_id_; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_satisfaction_surveys
    ADD CONSTRAINT client_satisfaction_surveys_service_scope_id_service_scopes_id_ FOREIGN KEY (service_scope_id) REFERENCES public.service_scopes(id);


--
-- Name: client_team_assignments client_team_assignments_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_team_assignments
    ADD CONSTRAINT client_team_assignments_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: client_team_assignments client_team_assignments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.client_team_assignments
    ADD CONSTRAINT client_team_assignments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: company_settings company_settings_updated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_updated_by_users_id_fk FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: contracts contracts_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: custom_field_values custom_field_values_custom_field_id_custom_fields_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.custom_field_values
    ADD CONSTRAINT custom_field_values_custom_field_id_custom_fields_id_fk FOREIGN KEY (custom_field_id) REFERENCES public.custom_fields(id);


--
-- Name: dashboard_widget_assignments dashboard_widget_assignments_dashboard_id_user_dashboards_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.dashboard_widget_assignments
    ADD CONSTRAINT dashboard_widget_assignments_dashboard_id_user_dashboards_id_fk FOREIGN KEY (dashboard_id) REFERENCES public.user_dashboards(id);


--
-- Name: dashboard_widget_assignments dashboard_widget_assignments_widget_id_dashboard_widgets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.dashboard_widget_assignments
    ADD CONSTRAINT dashboard_widget_assignments_widget_id_dashboard_widgets_id_fk FOREIGN KEY (widget_id) REFERENCES public.dashboard_widgets(id);


--
-- Name: dashboard_widgets dashboard_widgets_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.dashboard_widgets
    ADD CONSTRAINT dashboard_widgets_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: dashboard_widgets dashboard_widgets_data_source_id_data_sources_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.dashboard_widgets
    ADD CONSTRAINT dashboard_widgets_data_source_id_data_sources_id_fk FOREIGN KEY (data_source_id) REFERENCES public.data_sources(id);


--
-- Name: dashboards dashboards_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT dashboards_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: data_access_logs data_access_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.data_access_logs
    ADD CONSTRAINT data_access_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: data_source_mappings data_source_mappings_data_source_id_data_sources_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.data_source_mappings
    ADD CONSTRAINT data_source_mappings_data_source_id_data_sources_id_fk FOREIGN KEY (data_source_id) REFERENCES public.data_sources(id);


--
-- Name: data_sources data_sources_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.data_sources
    ADD CONSTRAINT data_sources_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: document_access document_access_document_id_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.document_access
    ADD CONSTRAINT document_access_document_id_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_access document_access_granted_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.document_access
    ADD CONSTRAINT document_access_granted_by_users_id_fk FOREIGN KEY (granted_by) REFERENCES public.users(id);


--
-- Name: document_access document_access_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.document_access
    ADD CONSTRAINT document_access_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: document_versions document_versions_document_id_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_document_id_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_versions document_versions_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: documents documents_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: documents documents_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: documents documents_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: external_systems external_systems_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.external_systems
    ADD CONSTRAINT external_systems_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: financial_transactions financial_transactions_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: financial_transactions financial_transactions_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: financial_transactions financial_transactions_hardware_asset_id_hardware_assets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_hardware_asset_id_hardware_assets_id_fk FOREIGN KEY (hardware_asset_id) REFERENCES public.hardware_assets(id);


--
-- Name: financial_transactions financial_transactions_license_pool_id_license_pools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_license_pool_id_license_pools_id_fk FOREIGN KEY (license_pool_id) REFERENCES public.license_pools(id);


--
-- Name: financial_transactions financial_transactions_service_scope_id_service_scopes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_service_scope_id_service_scopes_id_fk FOREIGN KEY (service_scope_id) REFERENCES public.service_scopes(id);


--
-- Name: individual_licenses individual_licenses_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.individual_licenses
    ADD CONSTRAINT individual_licenses_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: individual_licenses individual_licenses_service_scope_id_service_scopes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.individual_licenses
    ADD CONSTRAINT individual_licenses_service_scope_id_service_scopes_id_fk FOREIGN KEY (service_scope_id) REFERENCES public.service_scopes(id);


--
-- Name: integrated_data integrated_data_data_source_id_data_sources_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.integrated_data
    ADD CONSTRAINT integrated_data_data_source_id_data_sources_id_fk FOREIGN KEY (data_source_id) REFERENCES public.data_sources(id);


--
-- Name: proposals proposals_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: saved_searches saved_searches_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.saved_searches
    ADD CONSTRAINT saved_searches_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: search_history search_history_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: security_events security_events_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.security_events
    ADD CONSTRAINT security_events_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: service_authorization_forms service_authorization_forms_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_authorization_forms
    ADD CONSTRAINT service_authorization_forms_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: service_authorization_forms service_authorization_forms_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_authorization_forms
    ADD CONSTRAINT service_authorization_forms_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: service_authorization_forms service_authorization_forms_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_authorization_forms
    ADD CONSTRAINT service_authorization_forms_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: service_authorization_forms service_authorization_forms_service_scope_id_service_scopes_id_; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_authorization_forms
    ADD CONSTRAINT service_authorization_forms_service_scope_id_service_scopes_id_ FOREIGN KEY (service_scope_id) REFERENCES public.service_scopes(id);


--
-- Name: service_scope_fields service_scope_fields_service_id_services_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_scope_fields
    ADD CONSTRAINT service_scope_fields_service_id_services_id_fk FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: service_scopes service_scopes_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_scopes
    ADD CONSTRAINT service_scopes_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: service_scopes service_scopes_service_id_services_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.service_scopes
    ADD CONSTRAINT service_scopes_service_id_services_id_fk FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: user_dashboard_settings user_dashboard_settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_dashboards user_dashboards_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.user_dashboards
    ADD CONSTRAINT user_dashboards_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_settings user_settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: widgets widgets_dashboard_id_dashboards_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: mssp_user
--

ALTER TABLE ONLY public.widgets
    ADD CONSTRAINT widgets_dashboard_id_dashboards_id_fk FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: yasseralmohammed
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

