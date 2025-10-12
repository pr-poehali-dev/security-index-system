-- Миграция: Создание таблиц для управления подрядчиками
-- Версия: V0002
-- Описание: Реестр подрядных организаций, их персонала и контроль доступа к объектам

-- Таблица подрядных организаций
CREATE TABLE IF NOT EXISTS contractors (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    inn VARCHAR(12) NOT NULL,
    kpp VARCHAR(9),
    legal_address TEXT,
    actual_address TEXT,
    director_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    contract_number VARCHAR(100),
    contract_date DATE,
    contract_expiry DATE,
    contract_amount DECIMAL(15, 2),
    allowed_work_types TEXT[], -- Массив видов работ
    sro_number VARCHAR(100), -- Номер допуска СРО
    sro_expiry DATE, -- Срок действия допуска СРО
    insurance_number VARCHAR(100), -- Номер страховки
    insurance_expiry DATE, -- Срок действия страховки
    rating DECIMAL(3, 2) DEFAULT 0.00, -- Рейтинг от 0.00 до 5.00
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, blocked, archived
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX idx_contractors_tenant ON contractors(tenant_id);
CREATE INDEX idx_contractors_inn ON contractors(inn);
CREATE INDEX idx_contractors_status ON contractors(status);
CREATE INDEX idx_contractors_contract_expiry ON contractors(contract_expiry);

COMMENT ON TABLE contractors IS 'Реестр подрядных организаций';
COMMENT ON COLUMN contractors.allowed_work_types IS 'Виды работ: монтаж, ремонт, диагностика, экспертиза';
COMMENT ON COLUMN contractors.rating IS 'Рейтинг подрядчика от 0 до 5';

-- Таблица сотрудников подрядчиков
CREATE TABLE IF NOT EXISTS contractor_employees (
    id VARCHAR(36) PRIMARY KEY,
    contractor_id VARCHAR(36) NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    tenant_id VARCHAR(36) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    passport_series VARCHAR(10),
    passport_number VARCHAR(20),
    snils VARCHAR(14),
    medical_checkup_date DATE, -- Дата медосмотра
    medical_checkup_expiry DATE, -- Срок действия медосмотра
    fire_safety_training_date DATE, -- Дата обучения ПБ
    fire_safety_training_expiry DATE, -- Срок действия обучения ПБ
    labor_safety_training_date DATE, -- Дата обучения ОТ
    labor_safety_training_expiry DATE, -- Срок действия обучения ОТ
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, blocked, dismissed
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36)
);

CREATE INDEX idx_contractor_employees_contractor ON contractor_employees(contractor_id);
CREATE INDEX idx_contractor_employees_tenant ON contractor_employees(tenant_id);
CREATE INDEX idx_contractor_employees_status ON contractor_employees(status);
CREATE INDEX idx_contractor_employees_full_name ON contractor_employees(full_name);

COMMENT ON TABLE contractor_employees IS 'Персонал подрядных организаций';

-- Таблица аттестаций сотрудников подрядчиков
CREATE TABLE IF NOT EXISTS contractor_employee_attestations (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL REFERENCES contractor_employees(id) ON DELETE CASCADE,
    attestation_area VARCHAR(100) NOT NULL, -- Область аттестации (Б.7.1, ПБ-1, ОТ-2 и т.д.)
    certificate_number VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    issuing_authority VARCHAR(255), -- Орган, выдавший аттестацию
    document_file_url TEXT, -- Ссылка на скан документа
    status VARCHAR(50) NOT NULL DEFAULT 'valid', -- valid, expiring, expired
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contractor_attestations_employee ON contractor_employee_attestations(employee_id);
CREATE INDEX idx_contractor_attestations_area ON contractor_employee_attestations(attestation_area);
CREATE INDEX idx_contractor_attestations_expiry ON contractor_employee_attestations(expiry_date);
CREATE INDEX idx_contractor_attestations_status ON contractor_employee_attestations(status);

COMMENT ON TABLE contractor_employee_attestations IS 'Аттестации и допуски сотрудников подрядчиков';

-- Таблица доступа сотрудников подрядчиков к объектам
CREATE TABLE IF NOT EXISTS contractor_employee_objects (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL REFERENCES contractor_employees(id) ON DELETE CASCADE,
    object_id VARCHAR(36) NOT NULL, -- Ссылка на industrial_objects (пока без FK)
    access_start DATE NOT NULL,
    access_end DATE,
    work_type VARCHAR(100), -- Вид выполняемых работ
    access_status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, revoked, expired
    revoke_reason TEXT, -- Причина отзыва доступа
    approved_by VARCHAR(36), -- Кто одобрил доступ
    approved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, object_id)
);

CREATE INDEX idx_contractor_emp_objects_employee ON contractor_employee_objects(employee_id);
CREATE INDEX idx_contractor_emp_objects_object ON contractor_employee_objects(object_id);
CREATE INDEX idx_contractor_emp_objects_status ON contractor_employee_objects(access_status);
CREATE INDEX idx_contractor_emp_objects_dates ON contractor_employee_objects(access_start, access_end);

COMMENT ON TABLE contractor_employee_objects IS 'Доступ сотрудников подрядчиков к промышленным объектам';

-- Таблица журнала посещений объектов (опционально, для будущего расширения)
CREATE TABLE IF NOT EXISTS contractor_access_log (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL REFERENCES contractor_employees(id) ON DELETE CASCADE,
    object_id VARCHAR(36) NOT NULL,
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP,
    entry_method VARCHAR(50), -- manual, qr_code, card, biometric
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contractor_access_log_employee ON contractor_access_log(employee_id);
CREATE INDEX idx_contractor_access_log_object ON contractor_access_log(object_id);
CREATE INDEX idx_contractor_access_log_entry ON contractor_access_log(entry_time);

COMMENT ON TABLE contractor_access_log IS 'Журнал посещений объектов сотрудниками подрядчиков';

-- Таблица истории работы подрядчиков (для рейтингов и оценок)
CREATE TABLE IF NOT EXISTS contractor_work_history (
    id VARCHAR(36) PRIMARY KEY,
    contractor_id VARCHAR(36) NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    object_id VARCHAR(36),
    work_type VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    contract_amount DECIMAL(15, 2),
    actual_amount DECIMAL(15, 2),
    quality_rating DECIMAL(3, 2), -- Оценка качества работ от 0.00 до 5.00
    deadline_compliance BOOLEAN, -- Соблюдение сроков
    safety_incidents INT DEFAULT 0, -- Количество инцидентов по безопасности
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36)
);

CREATE INDEX idx_contractor_work_history_contractor ON contractor_work_history(contractor_id);
CREATE INDEX idx_contractor_work_history_object ON contractor_work_history(object_id);
CREATE INDEX idx_contractor_work_history_dates ON contractor_work_history(start_date, end_date);

COMMENT ON TABLE contractor_work_history IS 'История выполненных работ подрядчиками для оценки рейтинга';

-- Добавляем поле required_competencies в таблицу объектов (если она уже существует)
-- Если таблицы industrial_objects еще нет, этот блок можно выполнить позже
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'industrial_objects') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'industrial_objects' 
                      AND column_name = 'required_competencies') THEN
            ALTER TABLE industrial_objects ADD COLUMN required_competencies TEXT[];
            COMMENT ON COLUMN industrial_objects.required_competencies IS 'Требуемые аттестации для работы на объекте (Б.7.1, ПБ-1, ОТ-2)';
        END IF;
    END IF;
END $$;

-- Триггеры для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_employees_updated_at BEFORE UPDATE ON contractor_employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_attestations_updated_at BEFORE UPDATE ON contractor_employee_attestations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_emp_objects_updated_at BEFORE UPDATE ON contractor_employee_objects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
