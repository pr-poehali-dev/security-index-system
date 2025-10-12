-- ========================================
-- ПОЛНАЯ СХЕМА БАЗЫ ДАННЫХ
-- Система управления промышленной безопасностью
-- PostgreSQL 14+
-- ========================================

-- Удаление существующих таблиц (для пересоздания)
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS inter_org_document CASCADE;
DROP TABLE IF EXISTS document_version CASCADE;
DROP TABLE IF EXISTS knowledge_document CASCADE;
DROP TABLE IF EXISTS organization_training_request CASCADE;
DROP TABLE IF EXISTS training_schedule_entry CASCADE;
DROP TABLE IF EXISTS training_enrollment CASCADE;
DROP TABLE IF EXISTS training_group CASCADE;
DROP TABLE IF EXISTS training_instructor CASCADE;
DROP TABLE IF EXISTS training_location CASCADE;
DROP TABLE IF EXISTS training_program CASCADE;
DROP TABLE IF EXISTS organization_contractor CASCADE;
DROP TABLE IF EXISTS external_organization CASCADE;
DROP TABLE IF EXISTS maintenance_record CASCADE;
DROP TABLE IF EXISTS defect CASCADE;
DROP TABLE IF EXISTS examination CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS object_document CASCADE;
DROP TABLE IF EXISTS location CASCADE;
DROP TABLE IF EXISTS industrial_object CASCADE;
DROP TABLE IF EXISTS budget_expense CASCADE;
DROP TABLE IF EXISTS organization_budget_category CASCADE;
DROP TABLE IF EXISTS organization_budget_plan CASCADE;
DROP TABLE IF EXISTS budget_category CASCADE;
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS audit_finding CASCADE;
DROP TABLE IF EXISTS audit CASCADE;
DROP TABLE IF EXISTS checklist_item CASCADE;
DROP TABLE IF EXISTS checklist CASCADE;
DROP TABLE IF EXISTS incident CASCADE;
DROP TABLE IF EXISTS incident_subcategory CASCADE;
DROP TABLE IF EXISTS incident_category CASCADE;
DROP TABLE IF EXISTS incident_funding_type CASCADE;
DROP TABLE IF EXISTS incident_direction CASCADE;
DROP TABLE IF EXISTS incident_source CASCADE;
DROP TABLE IF EXISTS gap_analysis CASCADE;
DROP TABLE IF EXISTS competency_area_requirement CASCADE;
DROP TABLE IF EXISTS competency_matrix CASCADE;
DROP TABLE IF EXISTS certification CASCADE;
DROP TABLE IF EXISTS certification_area CASCADE;
DROP TABLE IF EXISTS competency CASCADE;
DROP TABLE IF EXISTS personnel CASCADE;
DROP TABLE IF EXISTS position CASCADE;
DROP TABLE IF EXISTS person CASCADE;
DROP TABLE IF EXISTS department CASCADE;
DROP TABLE IF EXISTS production_site CASCADE;
DROP TABLE IF EXISTS organization CASCADE;
DROP TABLE IF EXISTS system_user CASCADE;
DROP TABLE IF EXISTS user_account CASCADE;
DROP TABLE IF EXISTS tenant CASCADE;

-- ========================================
-- 1. ЯДРО: МУЛЬТИТЕНАНТНОСТЬ
-- ========================================

CREATE TABLE tenant (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    inn VARCHAR(12) NOT NULL UNIQUE,
    admin_email VARCHAR(255) NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    modules TEXT[], -- массив доступных модулей
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    
    CONSTRAINT tenant_inn_format CHECK (inn ~ '^\d{10,12}$')
);

CREATE INDEX idx_tenant_status ON tenant(status);
CREATE INDEX idx_tenant_inn ON tenant(inn);

COMMENT ON TABLE tenant IS 'Организация-арендатор системы';

-- ========================================
-- 2. ПОЛЬЗОВАТЕЛИ И АУТЕНТИФИКАЦИЯ
-- ========================================

CREATE TABLE user_account (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SuperAdmin', 'TenantAdmin', 'Auditor', 'Manager', 'Director', 'TrainingCenterManager')),
    available_modules TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT user_email_tenant_unique UNIQUE (email, tenant_id)
);

CREATE INDEX idx_user_tenant ON user_account(tenant_id);
CREATE INDEX idx_user_email ON user_account(email);
CREATE INDEX idx_user_role ON user_account(role);

COMMENT ON TABLE user_account IS 'Базовая сущность пользователя';

CREATE TABLE system_user (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    personnel_id VARCHAR(36),
    email VARCHAR(255) NOT NULL,
    login VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SuperAdmin', 'TenantAdmin', 'Auditor', 'Manager', 'Director', 'TrainingCenterManager')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_login TIMESTAMP,
    organization_access TEXT[], -- массив ID организаций
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT system_user_email_unique UNIQUE (email),
    CONSTRAINT system_user_login_tenant_unique UNIQUE (login, tenant_id)
);

CREATE INDEX idx_system_user_tenant ON system_user(tenant_id);
CREATE INDEX idx_system_user_personnel ON system_user(personnel_id);
CREATE INDEX idx_system_user_email ON system_user(email);
CREATE INDEX idx_system_user_status ON system_user(status);

COMMENT ON TABLE system_user IS 'Расширенная информация о пользователе';

-- ========================================
-- 3. ОРГАНИЗАЦИОННАЯ СТРУКТУРА
-- ========================================

CREATE TABLE organization (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    inn VARCHAR(12),
    kpp VARCHAR(9),
    type VARCHAR(50) CHECK (type IN ('holding', 'legal_entity', 'branch')),
    parent_id VARCHAR(36) REFERENCES organization(id) ON DELETE CASCADE,
    level INT NOT NULL DEFAULT 0,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organization_tenant ON organization(tenant_id);
CREATE INDEX idx_organization_parent ON organization(parent_id);
CREATE INDEX idx_organization_type ON organization(type);
CREATE INDEX idx_organization_status ON organization(status);
CREATE INDEX idx_organization_inn ON organization(inn);

COMMENT ON TABLE organization IS 'Организация (холдинг, юр.лицо, филиал)';

CREATE TABLE production_site (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    organization_id VARCHAR(36) NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    code VARCHAR(50),
    head VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_production_site_tenant ON production_site(tenant_id);
CREATE INDEX idx_production_site_organization ON production_site(organization_id);
CREATE INDEX idx_production_site_status ON production_site(status);

COMMENT ON TABLE production_site IS 'Производственная площадка';

CREATE TABLE department (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    organization_id VARCHAR(36) NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    parent_id VARCHAR(36) REFERENCES department(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    head VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_department_tenant ON department(tenant_id);
CREATE INDEX idx_department_organization ON department(organization_id);
CREATE INDEX idx_department_parent ON department(parent_id);
CREATE INDEX idx_department_status ON department(status);

COMMENT ON TABLE department IS 'Структурное подразделение';

-- ========================================
-- 4. ПЕРСОНАЛ
-- ========================================

CREATE TABLE person (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    birth_date DATE,
    passport_series VARCHAR(10),
    passport_number VARCHAR(20),
    snils VARCHAR(14),
    inn VARCHAR(12),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    education_level VARCHAR(50) CHECK (education_level IN ('higher', 'secondary', 'no_data')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_person_tenant ON person(tenant_id);
CREATE INDEX idx_person_status ON person(status);
CREATE INDEX idx_person_full_name ON person(last_name, first_name, middle_name);
CREATE INDEX idx_person_snils ON person(snils);
CREATE INDEX idx_person_inn ON person(inn);

COMMENT ON TABLE person IS 'Физическое лицо';

CREATE TABLE position (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    category VARCHAR(50) CHECK (category IN ('management', 'specialist', 'worker', 'other')),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_position_tenant ON position(tenant_id);
CREATE INDEX idx_position_status ON position(status);
CREATE INDEX idx_position_category ON position(category);

COMMENT ON TABLE position IS 'Должность';

CREATE TABLE personnel (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    person_id VARCHAR(36) NOT NULL REFERENCES person(id) ON DELETE RESTRICT,
    position_id VARCHAR(36) NOT NULL REFERENCES position(id) ON DELETE RESTRICT,
    organization_id VARCHAR(36) REFERENCES organization(id) ON DELETE SET NULL,
    department_id VARCHAR(36) REFERENCES department(id) ON DELETE SET NULL,
    personnel_type VARCHAR(50) NOT NULL CHECK (personnel_type IN ('employee', 'contractor')),
    role VARCHAR(50) CHECK (role IN ('Auditor', 'Manager', 'Director', 'Contractor')),
    required_competencies TEXT[],
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed')),
    hire_date DATE,
    dismissal_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_personnel_tenant ON personnel(tenant_id);
CREATE INDEX idx_personnel_person ON personnel(person_id);
CREATE INDEX idx_personnel_position ON personnel(position_id);
CREATE INDEX idx_personnel_organization ON personnel(organization_id);
CREATE INDEX idx_personnel_department ON personnel(department_id);
CREATE INDEX idx_personnel_status ON personnel(status);
CREATE INDEX idx_personnel_type ON personnel(personnel_type);

COMMENT ON TABLE personnel IS 'Сотрудник (связь лица с должностью)';

-- Добавляем FK от system_user к personnel
ALTER TABLE system_user 
ADD CONSTRAINT fk_system_user_personnel 
FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE SET NULL;

-- ========================================
-- 5. КОМПЕТЕНЦИИ И СЕРТИФИКАЦИЯ
-- ========================================

CREATE TABLE competency (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('industrial_safety', 'labor_safety', 'energy_safety', 'ecology', 'other')),
    validity_months INT NOT NULL,
    requires_rostechnadzor BOOLEAN DEFAULT false,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT competency_code_tenant_unique UNIQUE (code, tenant_id)
);

CREATE INDEX idx_competency_tenant ON competency(tenant_id);
CREATE INDEX idx_competency_category ON competency(category);
CREATE INDEX idx_competency_status ON competency(status);

COMMENT ON TABLE competency IS 'Компетенция';

CREATE TABLE certification_area (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('industrial_safety', 'labor_safety', 'energy_safety', 'ecology')),
    validity_months INT NOT NULL,
    requires_rostechnadzor BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_certification_area_category ON certification_area(category);

COMMENT ON TABLE certification_area IS 'Область аттестации (А, Б, В и т.д.)';

CREATE TABLE certification (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    person_id VARCHAR(36) NOT NULL REFERENCES person(id) ON DELETE CASCADE,
    competency_id VARCHAR(36) REFERENCES competency(id) ON DELETE SET NULL,
    employee_id VARCHAR(36) REFERENCES personnel(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('initial', 'periodic', 'extraordinary')),
    category VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    next_certification_date DATE,
    protocol_number VARCHAR(100) NOT NULL,
    certificate_number VARCHAR(100),
    issued_by VARCHAR(255),
    result VARCHAR(50) CHECK (result IN ('passed', 'failed', 'pending')),
    status VARCHAR(20) NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expiring', 'expired')),
    document_url TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certification_tenant ON certification(tenant_id);
CREATE INDEX idx_certification_person ON certification(person_id);
CREATE INDEX idx_certification_employee ON certification(employee_id);
CREATE INDEX idx_certification_competency ON certification(competency_id);
CREATE INDEX idx_certification_status ON certification(status);
CREATE INDEX idx_certification_expiry ON certification(expiry_date);
CREATE INDEX idx_certification_person_competency ON certification(person_id, competency_id, expiry_date);

COMMENT ON TABLE certification IS 'Сертификат компетенции';

CREATE TABLE competency_matrix (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    organization_id VARCHAR(36) NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    position_id VARCHAR(36) NOT NULL REFERENCES position(id) ON DELETE CASCADE,
    required_areas JSONB NOT NULL, -- массив CompetencyAreaRequirement
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT competency_matrix_unique UNIQUE (organization_id, position_id)
);

CREATE INDEX idx_competency_matrix_tenant ON competency_matrix(tenant_id);
CREATE INDEX idx_competency_matrix_organization ON competency_matrix(organization_id);
CREATE INDEX idx_competency_matrix_position ON competency_matrix(position_id);

COMMENT ON TABLE competency_matrix IS 'Матрица требуемых компетенций для должности';

CREATE TABLE competency_area_requirement (
    id VARCHAR(36) PRIMARY KEY,
    matrix_id VARCHAR(36) NOT NULL REFERENCES competency_matrix(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('industrial_safety', 'energy_safety', 'labor_safety', 'ecology')),
    areas TEXT[] NOT NULL -- массив ID областей компетенций
);

CREATE INDEX idx_car_matrix ON competency_area_requirement(matrix_id);
CREATE INDEX idx_car_category ON competency_area_requirement(category);

COMMENT ON TABLE competency_area_requirement IS 'Требование по категории безопасности';

CREATE TABLE gap_analysis (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    employee_id VARCHAR(36) NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    organization_id VARCHAR(36) NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    required_areas JSONB NOT NULL,
    missing_areas JSONB NOT NULL,
    has_all_required BOOLEAN NOT NULL,
    completion_rate NUMERIC(5, 2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
    last_checked TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gap_analysis_tenant ON gap_analysis(tenant_id);
CREATE INDEX idx_gap_analysis_employee ON gap_analysis(employee_id);
CREATE INDEX idx_gap_analysis_organization ON gap_analysis(organization_id);
CREATE INDEX idx_gap_analysis_risk ON gap_analysis(risk_level);

COMMENT ON TABLE gap_analysis IS 'Анализ несоответствий компетенций';

-- ========================================
-- 6. ИНЦИДЕНТЫ И КОРРЕКТИРУЮЩИЕ ДЕЙСТВИЯ
-- ========================================

CREATE TABLE incident_source (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_source_tenant ON incident_source(tenant_id);

COMMENT ON TABLE incident_source IS 'Источник выявления инцидента';

CREATE TABLE incident_direction (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_direction_tenant ON incident_direction(tenant_id);

COMMENT ON TABLE incident_direction IS 'Направление деятельности';

CREATE TABLE incident_funding_type (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_funding_type_tenant ON incident_funding_type(tenant_id);

COMMENT ON TABLE incident_funding_type IS 'Тип финансирования устранения';

CREATE TABLE incident_category (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_category_tenant ON incident_category(tenant_id);

COMMENT ON TABLE incident_category IS 'Категория инцидента';

CREATE TABLE incident_subcategory (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    category_id VARCHAR(36) NOT NULL REFERENCES incident_category(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_subcategory_tenant ON incident_subcategory(tenant_id);
CREATE INDEX idx_incident_subcategory_category ON incident_subcategory(category_id);

COMMENT ON TABLE incident_subcategory IS 'Подкатегория инцидента';

CREATE TABLE incident (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    organization_id VARCHAR(36) NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    production_site_id VARCHAR(36) NOT NULL REFERENCES production_site(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    source_id VARCHAR(36) NOT NULL REFERENCES incident_source(id) ON DELETE RESTRICT,
    direction_id VARCHAR(36) NOT NULL REFERENCES incident_direction(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    corrective_action TEXT NOT NULL,
    funding_type_id VARCHAR(36) NOT NULL REFERENCES incident_funding_type(id) ON DELETE RESTRICT,
    category_id VARCHAR(36) NOT NULL REFERENCES incident_category(id) ON DELETE RESTRICT,
    subcategory_id VARCHAR(36) NOT NULL REFERENCES incident_subcategory(id) ON DELETE RESTRICT,
    responsible_personnel_id VARCHAR(36) NOT NULL REFERENCES personnel(id) ON DELETE RESTRICT,
    planned_date DATE NOT NULL,
    completed_date DATE,
    days_left INT,
    status VARCHAR(20) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'in_progress', 'awaiting', 'overdue', 'completed', 'completed_late')),
    notes TEXT,
    comments TEXT,
    source_type VARCHAR(20) CHECK (source_type IN ('audit', 'manual')),
    source_audit_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_tenant ON incident(tenant_id);
CREATE INDEX idx_incident_organization ON incident(organization_id);
CREATE INDEX idx_incident_site ON incident(production_site_id);
CREATE INDEX idx_incident_responsible ON incident(responsible_personnel_id);
CREATE INDEX idx_incident_status ON incident(status);
CREATE INDEX idx_incident_planned_date ON incident(planned_date);
CREATE INDEX idx_incident_source_type ON incident(source_type, source_audit_id);

COMMENT ON TABLE incident IS 'Инцидент/несоответствие';

-- ========================================
-- 7. ЧЕК-ЛИСТЫ И АУДИТЫ
-- ========================================

CREATE TABLE checklist (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checklist_tenant ON checklist(tenant_id);
CREATE INDEX idx_checklist_category ON checklist(category);

COMMENT ON TABLE checklist IS 'Шаблон проверочного листа';

CREATE TABLE checklist_item (
    id VARCHAR(36) PRIMARY KEY,
    checklist_id VARCHAR(36) NOT NULL REFERENCES checklist(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    requires_comment BOOLEAN NOT NULL DEFAULT false,
    critical_item BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_checklist_item_checklist ON checklist_item(checklist_id);
CREATE INDEX idx_checklist_item_order ON checklist_item(checklist_id, display_order);

COMMENT ON TABLE checklist_item IS 'Пункт чек-листа';

CREATE TABLE audit (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    checklist_id VARCHAR(36) NOT NULL REFERENCES checklist(id) ON DELETE RESTRICT,
    organization_id VARCHAR(36) NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    auditor_id VARCHAR(36) NOT NULL REFERENCES personnel(id) ON DELETE RESTRICT,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
    auditor_signature TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON audit(tenant_id);
CREATE INDEX idx_audit_checklist ON audit(checklist_id);
CREATE INDEX idx_audit_organization ON audit(organization_id);
CREATE INDEX idx_audit_auditor ON audit(auditor_id);
CREATE INDEX idx_audit_status ON audit(status);
CREATE INDEX idx_audit_scheduled_date ON audit(scheduled_date);

COMMENT ON TABLE audit IS 'Проведённая проверка';

CREATE TABLE audit_finding (
    id VARCHAR(36) PRIMARY KEY,
    audit_id VARCHAR(36) NOT NULL REFERENCES audit(id) ON DELETE CASCADE,
    item_id VARCHAR(36) NOT NULL REFERENCES checklist_item(id) ON DELETE RESTRICT,
    result VARCHAR(10) NOT NULL CHECK (result IN ('pass', 'fail', 'n/a')),
    comment TEXT,
    photo TEXT
);

CREATE INDEX idx_audit_finding_audit ON audit_finding(audit_id);
CREATE INDEX idx_audit_finding_item ON audit_finding(item_id);
CREATE INDEX idx_audit_finding_result ON audit_finding(result);

COMMENT ON TABLE audit_finding IS 'Результат проверки пункта';

-- ========================================
-- 8. ЗАДАЧИ
-- ========================================

CREATE TABLE task (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('corrective_action', 'maintenance', 'audit', 'other')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    assigned_to VARCHAR(36) NOT NULL REFERENCES personnel(id) ON DELETE RESTRICT,
    created_by VARCHAR(36) NOT NULL REFERENCES system_user(id) ON DELETE RESTRICT,
    due_date DATE NOT NULL,
    completed_at TIMESTAMP,
    source_type VARCHAR(20) CHECK (source_type IN ('incident', 'audit', 'checklist', 'examination', 'defect')),
    source_id VARCHAR(36),
    incident_id VARCHAR(36) REFERENCES incident(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_tenant ON task(tenant_id);
CREATE INDEX idx_task_assigned ON task(assigned_to);
CREATE INDEX idx_task_created_by ON task(created_by);
CREATE INDEX idx_task_status ON task(status);
CREATE INDEX idx_task_priority ON task(priority);
CREATE INDEX idx_task_due_date ON task(due_date);
CREATE INDEX idx_task_source ON task(source_type, source_id);

COMMENT ON TABLE task IS 'Задача или поручение';

-- ========================================
-- 9. БЮДЖЕТ
-- ========================================

CREATE TABLE budget_category (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    planned_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    year INT NOT NULL,
    color VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_budget_category_tenant ON budget_category(tenant_id);
CREATE INDEX idx_budget_category_year ON budget_category(year);
CREATE INDEX idx_budget_category_status ON budget_category(status);

COMMENT ON TABLE budget_category IS 'Категория бюджета (статья расходов)';

CREATE TABLE organization_budget_plan (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    organization_id VARCHAR(36) NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    year INT NOT NULL,
    total_planned_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'archived')),
    approved_by VARCHAR(36) REFERENCES system_user(id),
    approved_at TIMESTAMP,
    created_by VARCHAR(36) NOT NULL REFERENCES system_user(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT org_budget_plan_unique UNIQUE (organization_id, year)
);

CREATE INDEX idx_org_budget_plan_tenant ON organization_budget_plan(tenant_id);
CREATE INDEX idx_org_budget_plan_organization ON organization_budget_plan(organization_id);
CREATE INDEX idx_org_budget_plan_year ON organization_budget_plan(year);

COMMENT ON TABLE organization_budget_plan IS 'Бюджетный план организации';

CREATE TABLE organization_budget_category (
    id VARCHAR(36) PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL REFERENCES organization_budget_plan(id) ON DELETE CASCADE,
    category_id VARCHAR(36) NOT NULL REFERENCES budget_category(id) ON DELETE RESTRICT,
    planned_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    description TEXT
);

CREATE INDEX idx_org_budget_category_plan ON organization_budget_category(plan_id);
CREATE INDEX idx_org_budget_category_category ON organization_budget_category(category_id);

COMMENT ON TABLE organization_budget_category IS 'Категория в бюджетном плане организации';

CREATE TABLE budget_expense (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    category_id VARCHAR(36) NOT NULL REFERENCES budget_category(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    document_number VARCHAR(100),
    source_type VARCHAR(20) CHECK (source_type IN ('manual', 'incident')),
    source_id VARCHAR(36),
    created_by VARCHAR(36) NOT NULL REFERENCES system_user(id),
    organization_id VARCHAR(36) REFERENCES organization(id) ON DELETE SET NULL,
    production_site_id VARCHAR(36) REFERENCES production_site(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_budget_expense_tenant ON budget_expense(tenant_id);
CREATE INDEX idx_budget_expense_category ON budget_expense(category_id);
CREATE INDEX idx_budget_expense_date ON budget_expense(expense_date);
CREATE INDEX idx_budget_expense_organization ON budget_expense(organization_id);
CREATE INDEX idx_budget_expense_site ON budget_expense(production_site_id);
CREATE INDEX idx_budget_expense_source ON budget_expense(source_type, source_id);

COMMENT ON TABLE budget_expense IS 'Фактический расход';

-- ========================================
-- 10. КАТАЛОГ ПРОМЫШЛЕННЫХ ОБЪЕКТОВ
-- ========================================

CREATE TABLE industrial_object (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    organization_id VARCHAR(36) NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    registration_number VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('opo', 'gts', 'building')),
    category VARCHAR(100),
    hazard_class VARCHAR(10) CHECK (hazard_class IN ('I', 'II', 'III', 'IV')),
    commissioning_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'conservation', 'liquidated')),
    location_address TEXT NOT NULL,
    location_lat NUMERIC(10, 7),
    location_lng NUMERIC(10, 7),
    responsible_person VARCHAR(255) NOT NULL,
    responsible_person_id VARCHAR(36) REFERENCES personnel(id),
    next_expertise_date DATE,
    next_diagnostic_date DATE,
    next_test_date DATE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_industrial_object_tenant ON industrial_object(tenant_id);
CREATE INDEX idx_industrial_object_organization ON industrial_object(organization_id);
CREATE INDEX idx_industrial_object_type ON industrial_object(type);
CREATE INDEX idx_industrial_object_status ON industrial_object(status);
CREATE INDEX idx_industrial_object_reg_number ON industrial_object(registration_number);

COMMENT ON TABLE industrial_object IS 'Промышленный объект (ОПО, ГТС, здание)';

CREATE TABLE location (
    id VARCHAR(36) PRIMARY KEY,
    object_id VARCHAR(36) NOT NULL REFERENCES industrial_object(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    region VARCHAR(255),
    district VARCHAR(255),
    settlement VARCHAR(255)
);

CREATE INDEX idx_location_object ON location(object_id);

COMMENT ON TABLE location IS 'Местоположение промышленного объекта';

CREATE TABLE object_document (
    id VARCHAR(36) PRIMARY KEY,
    object_id VARCHAR(36) NOT NULL REFERENCES industrial_object(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('passport', 'scheme', 'permit', 'protocol', 'certificate', 'other')),
    document_number VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expiring_soon', 'expired')),
    uploaded_by VARCHAR(36) REFERENCES system_user(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_object_document_object ON object_document(object_id);
CREATE INDEX idx_object_document_type ON object_document(type);
CREATE INDEX idx_object_document_status ON object_document(status);
CREATE INDEX idx_object_document_expiry ON object_document(expiry_date);

COMMENT ON TABLE object_document IS 'Документ промышленного объекта';

-- ========================================
-- 11. ТЕХНИЧЕСКОЕ ОБСЛУЖИВАНИЕ
-- ========================================

CREATE TABLE equipment (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    organization_id VARCHAR(36) NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(255),
    serial_number VARCHAR(100),
    commission_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'repair', 'decommissioned')),
    next_maintenance_date DATE,
    next_examination_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_equipment_tenant ON equipment(tenant_id);
CREATE INDEX idx_equipment_organization ON equipment(organization_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_next_maintenance ON equipment(next_maintenance_date);
CREATE INDEX idx_equipment_next_examination ON equipment(next_examination_date);

COMMENT ON TABLE equipment IS 'Оборудование';

CREATE TABLE examination (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    equipment_id VARCHAR(36) NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('periodic', 'extraordinary', 'commissioning')),
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    performed_by VARCHAR(255),
    performed_by_personnel_id VARCHAR(36) REFERENCES personnel(id),
    result VARCHAR(20) CHECK (result IN ('passed', 'failed', 'conditional')),
    protocol_number VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_examination_tenant ON examination(tenant_id);
CREATE INDEX idx_examination_equipment ON examination(equipment_id);
CREATE INDEX idx_examination_scheduled ON examination(scheduled_date);
CREATE INDEX idx_examination_result ON examination(result);

COMMENT ON TABLE examination IS 'Освидетельствование оборудования';

CREATE TABLE defect (
    id VARCHAR(36) PRIMARY KEY,
    examination_id VARCHAR(36) NOT NULL REFERENCES examination(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'major', 'minor')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fixed', 'deferred'))
);

CREATE INDEX idx_defect_examination ON defect(examination_id);
CREATE INDEX idx_defect_severity ON defect(severity);
CREATE INDEX idx_defect_status ON defect(status);

COMMENT ON TABLE defect IS 'Дефект оборудования';

CREATE TABLE maintenance_record (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    equipment_id VARCHAR(36) NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('preventive', 'corrective', 'emergency')),
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    performed_by VARCHAR(255),
    performed_by_personnel_id VARCHAR(36) REFERENCES personnel(id),
    work_description TEXT NOT NULL,
    parts_used TEXT,
    cost NUMERIC(15, 2),
    next_maintenance_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_record_tenant ON maintenance_record(tenant_id);
CREATE INDEX idx_maintenance_record_equipment ON maintenance_record(equipment_id);
CREATE INDEX idx_maintenance_record_scheduled ON maintenance_record(scheduled_date);
CREATE INDEX idx_maintenance_record_type ON maintenance_record(type);

COMMENT ON TABLE maintenance_record IS 'Запись технического обслуживания';

-- ========================================
-- 12. ОБУЧЕНИЕ
-- ========================================

CREATE TABLE training_program (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('industrial_safety', 'labor_safety', 'energy_safety', 'ecology', 'professional', 'other')),
    duration_hours INT NOT NULL,
    validity_months INT NOT NULL,
    description TEXT,
    competency_ids TEXT[],
    min_students INT NOT NULL DEFAULT 1,
    max_students INT NOT NULL DEFAULT 30,
    cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
    requires_exam BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT training_program_code_tenant_unique UNIQUE (code, tenant_id)
);

CREATE INDEX idx_training_program_tenant ON training_program(tenant_id);
CREATE INDEX idx_training_program_category ON training_program(category);
CREATE INDEX idx_training_program_status ON training_program(status);

COMMENT ON TABLE training_program IS 'Программа обучения';

CREATE TABLE training_location (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    capacity INT NOT NULL,
    equipment TEXT[],
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_location_tenant ON training_location(tenant_id);
CREATE INDEX idx_training_location_status ON training_location(status);

COMMENT ON TABLE training_location IS 'Место проведения обучения';

CREATE TABLE training_instructor (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    personnel_id VARCHAR(36) NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    specializations TEXT[],
    certifications TEXT[],
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_instructor_tenant ON training_instructor(tenant_id);
CREATE INDEX idx_training_instructor_personnel ON training_instructor(personnel_id);
CREATE INDEX idx_training_instructor_status ON training_instructor(status);

COMMENT ON TABLE training_instructor IS 'Преподаватель';

CREATE TABLE training_group (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    program_id VARCHAR(36) NOT NULL REFERENCES training_program(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    schedule TEXT,
    instructor_id VARCHAR(36) REFERENCES training_instructor(id) ON DELETE SET NULL,
    location_id VARCHAR(36) REFERENCES training_location(id) ON DELETE SET NULL,
    max_students INT NOT NULL DEFAULT 30,
    enrolled_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_group_tenant ON training_group(tenant_id);
CREATE INDEX idx_training_group_program ON training_group(program_id);
CREATE INDEX idx_training_group_instructor ON training_group(instructor_id);
CREATE INDEX idx_training_group_location ON training_group(location_id);
CREATE INDEX idx_training_group_status ON training_group(status);
CREATE INDEX idx_training_group_start_date ON training_group(start_date);

COMMENT ON TABLE training_group IS 'Учебная группа';

CREATE TABLE training_enrollment (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    group_id VARCHAR(36) NOT NULL REFERENCES training_group(id) ON DELETE CASCADE,
    student_id VARCHAR(36) NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    enrolled_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'failed', 'cancelled')),
    attendance_rate NUMERIC(5, 2),
    exam_score NUMERIC(5, 2),
    certificate_number VARCHAR(100),
    certificate_issue_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT training_enrollment_unique UNIQUE (group_id, student_id)
);

CREATE INDEX idx_training_enrollment_tenant ON training_enrollment(tenant_id);
CREATE INDEX idx_training_enrollment_group ON training_enrollment(group_id);
CREATE INDEX idx_training_enrollment_student ON training_enrollment(student_id);
CREATE INDEX idx_training_enrollment_status ON training_enrollment(status);

COMMENT ON TABLE training_enrollment IS 'Зачисление на обучение';

CREATE TABLE training_schedule_entry (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    group_id VARCHAR(36) NOT NULL REFERENCES training_group(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    topic VARCHAR(255) NOT NULL,
    instructor_id VARCHAR(36) REFERENCES training_instructor(id) ON DELETE SET NULL,
    location_id VARCHAR(36) REFERENCES training_location(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('lecture', 'practice', 'exam')),
    completed BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_training_schedule_tenant ON training_schedule_entry(tenant_id);
CREATE INDEX idx_training_schedule_group ON training_schedule_entry(group_id);
CREATE INDEX idx_training_schedule_date ON training_schedule_entry(date);
CREATE INDEX idx_training_schedule_instructor ON training_schedule_entry(instructor_id);

COMMENT ON TABLE training_schedule_entry IS 'Занятие в расписании';

CREATE TABLE organization_training_request (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    from_tenant_id VARCHAR(36) REFERENCES tenant(id),
    from_tenant_name VARCHAR(255),
    organization_id VARCHAR(36) NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    program_id VARCHAR(36) NOT NULL REFERENCES training_program(id) ON DELETE RESTRICT,
    program_name VARCHAR(255) NOT NULL,
    request_date DATE NOT NULL,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('full_training', 'sdo_access_only')),
    students_count INT NOT NULL,
    students JSONB NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    preferred_start_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'approved', 'rejected', 'completed')),
    notes TEXT,
    review_notes TEXT,
    order_id VARCHAR(36),
    response_documents TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_training_request_tenant ON organization_training_request(tenant_id);
CREATE INDEX idx_org_training_request_from_tenant ON organization_training_request(from_tenant_id);
CREATE INDEX idx_org_training_request_organization ON organization_training_request(organization_id);
CREATE INDEX idx_org_training_request_program ON organization_training_request(program_id);
CREATE INDEX idx_org_training_request_status ON organization_training_request(status);

COMMENT ON TABLE organization_training_request IS 'Заявка на обучение от организации';

-- ========================================
-- 13. ВНЕШНИЕ ОРГАНИЗАЦИИ И ПОДРЯДЧИКИ
-- ========================================

CREATE TABLE external_organization (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('training_center', 'contractor', 'supplier', 'regulatory_body', 'certification_body', 'other')),
    name VARCHAR(255) NOT NULL,
    inn VARCHAR(12),
    kpp VARCHAR(9),
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    website VARCHAR(255),
    accreditations TEXT[],
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_external_organization_tenant ON external_organization(tenant_id);
CREATE INDEX idx_external_organization_type ON external_organization(type);
CREATE INDEX idx_external_organization_status ON external_organization(status);

COMMENT ON TABLE external_organization IS 'Внешняя организация (контрагент)';

CREATE TABLE organization_contractor (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    organization_id VARCHAR(36) NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    contractor_tenant_id VARCHAR(36) REFERENCES tenant(id),
    contractor_external_org_id VARCHAR(36) REFERENCES external_organization(id),
    contractor_name VARCHAR(255) NOT NULL,
    contractor_inn VARCHAR(12),
    type VARCHAR(50) NOT NULL CHECK (type IN ('training_center', 'contractor', 'supplier')),
    services TEXT[] NOT NULL,
    contract_number VARCHAR(100),
    contract_date DATE,
    contract_expiry_date DATE,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated')),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_contractor_tenant ON organization_contractor(tenant_id);
CREATE INDEX idx_org_contractor_organization ON organization_contractor(organization_id);
CREATE INDEX idx_org_contractor_tenant_contractor ON organization_contractor(contractor_tenant_id);
CREATE INDEX idx_org_contractor_external ON organization_contractor(contractor_external_org_id);
CREATE INDEX idx_org_contractor_status ON organization_contractor(status);

COMMENT ON TABLE organization_contractor IS 'Подрядчик организации';

-- ========================================
-- 14. МЕЖОРГАНИЗАЦИОННЫЙ ОБМЕН
-- ========================================

CREATE TABLE inter_org_document (
    id VARCHAR(36) PRIMARY KEY,
    from_tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    from_tenant_name VARCHAR(255) NOT NULL,
    to_tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    to_tenant_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('training_request', 'certificate', 'sdo_access', 'invoice', 'contract', 'report')),
    source_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_url TEXT,
    file_size BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'processed', 'rejected')),
    metadata JSONB,
    sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
    received_at TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by VARCHAR(36) REFERENCES system_user(id),
    notes TEXT
);

CREATE INDEX idx_inter_org_doc_from_tenant ON inter_org_document(from_tenant_id);
CREATE INDEX idx_inter_org_doc_to_tenant ON inter_org_document(to_tenant_id);
CREATE INDEX idx_inter_org_doc_type ON inter_org_document(document_type);
CREATE INDEX idx_inter_org_doc_status ON inter_org_document(status);
CREATE INDEX idx_inter_org_doc_source ON inter_org_document(source_id);

COMMENT ON TABLE inter_org_document IS 'Документ межорганизационного обмена';

-- ========================================
-- 15. БАЗА ЗНАНИЙ
-- ========================================

CREATE TABLE knowledge_document (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('user_guide', 'regulatory', 'organization')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    tags TEXT[],
    version VARCHAR(20),
    author VARCHAR(36) NOT NULL REFERENCES system_user(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    views_count INT NOT NULL DEFAULT 0,
    downloads_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    published_at TIMESTAMP
);

CREATE INDEX idx_knowledge_doc_tenant ON knowledge_document(tenant_id);
CREATE INDEX idx_knowledge_doc_category ON knowledge_document(category);
CREATE INDEX idx_knowledge_doc_status ON knowledge_document(status);
CREATE INDEX idx_knowledge_doc_author ON knowledge_document(author);

COMMENT ON TABLE knowledge_document IS 'Документ базы знаний';

CREATE TABLE document_version (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL REFERENCES knowledge_document(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(36) NOT NULL REFERENCES system_user(id),
    change_description TEXT,
    content TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    file_url TEXT
);

CREATE INDEX idx_document_version_document ON document_version(document_id);
CREATE INDEX idx_document_version_created_by ON document_version(created_by);

COMMENT ON TABLE document_version IS 'Версия документа базы знаний';

-- ========================================
-- 16. УВЕДОМЛЕНИЯ
-- ========================================

CREATE TABLE notification (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES system_user(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('critical', 'warning', 'info', 'success')),
    source VARCHAR(50) NOT NULL CHECK (source IN ('incident', 'certification', 'task', 'audit', 'system', 'platform_news', 'attestation', 'catalog')),
    source_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_tenant ON notification(tenant_id);
CREATE INDEX idx_notification_user ON notification(user_id);
CREATE INDEX idx_notification_source ON notification(source, source_id);
CREATE INDEX idx_notification_is_read ON notification(is_read);
CREATE INDEX idx_notification_created_at ON notification(created_at);

COMMENT ON TABLE notification IS 'Системное уведомление';

-- ========================================
-- ТРИГГЕРЫ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем триггер ко всем таблицам с updated_at
CREATE TRIGGER update_tenant_updated_at BEFORE UPDATE ON tenant 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_user_updated_at BEFORE UPDATE ON system_user 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_updated_at BEFORE UPDATE ON organization 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_person_updated_at BEFORE UPDATE ON person 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_position_updated_at BEFORE UPDATE ON position 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competency_updated_at BEFORE UPDATE ON competency 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certification_updated_at BEFORE UPDATE ON certification 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competency_matrix_updated_at BEFORE UPDATE ON competency_matrix 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_updated_at BEFORE UPDATE ON incident 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_updated_at BEFORE UPDATE ON checklist 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_updated_at BEFORE UPDATE ON audit 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_updated_at BEFORE UPDATE ON task 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_category_updated_at BEFORE UPDATE ON budget_category 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_expense_updated_at BEFORE UPDATE ON budget_expense 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_industrial_object_updated_at BEFORE UPDATE ON industrial_object 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_examination_updated_at BEFORE UPDATE ON examination 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_record_updated_at BEFORE UPDATE ON maintenance_record 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_program_updated_at BEFORE UPDATE ON training_program 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_group_updated_at BEFORE UPDATE ON training_group 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_enrollment_updated_at BEFORE UPDATE ON training_enrollment 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_training_request_updated_at BEFORE UPDATE ON organization_training_request 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_contractor_updated_at BEFORE UPDATE ON organization_contractor 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_document_updated_at BEFORE UPDATE ON knowledge_document 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_budget_plan_updated_at BEFORE UPDATE ON organization_budget_plan 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- КОММЕНТАРИИ К СХЕМЕ
-- ========================================

COMMENT ON DATABASE postgres IS 'Система управления промышленной безопасностью';

-- ========================================
-- ЗАВЕРШЕНИЕ
-- ========================================

-- Вывод статистики
SELECT 
    'Схема успешно создана!' as message,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
