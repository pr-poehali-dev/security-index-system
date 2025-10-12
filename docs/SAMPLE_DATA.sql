-- ========================================
-- ТЕСТОВЫЕ ДАННЫЕ ДЛЯ БАЗЫ ДАННЫХ
-- Система управления промышленной безопасностью
-- ========================================

-- Очистка данных (если нужно перезалить)
TRUNCATE TABLE notification CASCADE;
TRUNCATE TABLE inter_org_document CASCADE;
TRUNCATE TABLE document_version CASCADE;
TRUNCATE TABLE knowledge_document CASCADE;
TRUNCATE TABLE organization_training_request CASCADE;
TRUNCATE TABLE training_schedule_entry CASCADE;
TRUNCATE TABLE training_enrollment CASCADE;
TRUNCATE TABLE training_group CASCADE;
TRUNCATE TABLE training_instructor CASCADE;
TRUNCATE TABLE training_location CASCADE;
TRUNCATE TABLE training_program CASCADE;
TRUNCATE TABLE organization_contractor CASCADE;
TRUNCATE TABLE external_organization CASCADE;
TRUNCATE TABLE maintenance_record CASCADE;
TRUNCATE TABLE defect CASCADE;
TRUNCATE TABLE examination CASCADE;
TRUNCATE TABLE equipment CASCADE;
TRUNCATE TABLE object_document CASCADE;
TRUNCATE TABLE location CASCADE;
TRUNCATE TABLE industrial_object CASCADE;
TRUNCATE TABLE budget_expense CASCADE;
TRUNCATE TABLE organization_budget_category CASCADE;
TRUNCATE TABLE organization_budget_plan CASCADE;
TRUNCATE TABLE budget_category CASCADE;
TRUNCATE TABLE task CASCADE;
TRUNCATE TABLE audit_finding CASCADE;
TRUNCATE TABLE audit CASCADE;
TRUNCATE TABLE checklist_item CASCADE;
TRUNCATE TABLE checklist CASCADE;
TRUNCATE TABLE incident CASCADE;
TRUNCATE TABLE incident_subcategory CASCADE;
TRUNCATE TABLE incident_category CASCADE;
TRUNCATE TABLE incident_funding_type CASCADE;
TRUNCATE TABLE incident_direction CASCADE;
TRUNCATE TABLE incident_source CASCADE;
TRUNCATE TABLE gap_analysis CASCADE;
TRUNCATE TABLE competency_area_requirement CASCADE;
TRUNCATE TABLE competency_matrix CASCADE;
TRUNCATE TABLE certification CASCADE;
TRUNCATE TABLE certification_area CASCADE;
TRUNCATE TABLE competency CASCADE;
TRUNCATE TABLE personnel CASCADE;
TRUNCATE TABLE position CASCADE;
TRUNCATE TABLE person CASCADE;
TRUNCATE TABLE department CASCADE;
TRUNCATE TABLE production_site CASCADE;
TRUNCATE TABLE organization CASCADE;
TRUNCATE TABLE system_user CASCADE;
TRUNCATE TABLE user_account CASCADE;
TRUNCATE TABLE tenant CASCADE;

-- ========================================
-- 1. ТЕНАНТЫ
-- ========================================

INSERT INTO tenant (id, name, inn, admin_email, admin_name, status, modules, created_at, expires_at) VALUES
('tenant-001', 'ПАО "Промышленная компания"', '7701234567', 'admin@promcomp.ru', 'Иванов Иван Иванович', 'active', 
 ARRAY['attestation', 'incidents', 'audits', 'budget', 'catalog', 'training'], NOW(), NOW() + INTERVAL '1 year'),
('tenant-002', 'ООО "Учебный центр Безопасность"', '7702345678', 'admin@safety-center.ru', 'Петров Петр Петрович', 'active',
 ARRAY['training_center'], NOW(), NOW() + INTERVAL '1 year'),
('tenant-003', 'АО "Энергетическая компания"', '7703456789', 'admin@energo.ru', 'Сидорова Анна Сергеевна', 'active',
 ARRAY['attestation', 'incidents', 'catalog'], NOW(), NOW() + INTERVAL '1 year');

-- ========================================
-- 2. ОРГАНИЗАЦИИ
-- ========================================

-- Холдинг
INSERT INTO organization (id, tenant_id, name, inn, type, parent_id, level, status, created_at) VALUES
('org-001', 'tenant-001', 'ПАО "Промышленная компания" (холдинг)', '7701234567', 'holding', NULL, 0, 'active', NOW());

-- Юр. лица холдинга
INSERT INTO organization (id, tenant_id, name, inn, kpp, type, parent_id, level, address, status, created_at) VALUES
('org-002', 'tenant-001', 'ООО "ПромКомп-Производство"', '7704567890', '770401001', 'legal_entity', 'org-001', 1, 
 'г. Москва, ул. Промышленная, д. 10', 'active', NOW()),
('org-003', 'tenant-001', 'ООО "ПромКомп-Логистика"', '7705678901', '770501001', 'legal_entity', 'org-001', 1,
 'г. Москва, ул. Складская, д. 5', 'active', NOW());

-- Филиалы
INSERT INTO organization (id, tenant_id, name, inn, kpp, type, parent_id, level, address, status, created_at) VALUES
('org-004', 'tenant-001', 'Филиал в г. Санкт-Петербург', '7704567890', '780601001', 'branch', 'org-002', 2,
 'г. Санкт-Петербург, пр. Невский, д. 100', 'active', NOW()),
('org-005', 'tenant-001', 'Филиал в г. Екатеринбург', '7704567890', '660701001', 'branch', 'org-002', 2,
 'г. Екатеринбург, ул. Ленина, д. 50', 'active', NOW());

-- Организация тенанта-2
INSERT INTO organization (id, tenant_id, name, inn, type, parent_id, level, status, created_at) VALUES
('org-101', 'tenant-002', 'ООО "Учебный центр Безопасность"', '7702345678', 'legal_entity', NULL, 0, 'active', NOW());

-- ========================================
-- 3. ПРОИЗВОДСТВЕННЫЕ ПЛОЩАДКИ
-- ========================================

INSERT INTO production_site (id, tenant_id, organization_id, name, address, code, head, status, created_at) VALUES
('site-001', 'tenant-001', 'org-002', 'Завод №1', 'г. Москва, ул. Промышленная, д. 10', 'Z01', 'Кузнецов А.В.', 'active', NOW()),
('site-002', 'tenant-001', 'org-002', 'Склад ГСМ', 'г. Москва, ул. Промышленная, д. 12', 'S01', 'Смирнов В.И.', 'active', NOW()),
('site-003', 'tenant-001', 'org-004', 'Производственная площадка СПб', 'г. Санкт-Петербург, пр. Невский, д. 100', 'Z02', 'Васильев П.П.', 'active', NOW());

-- ========================================
-- 4. ПОДРАЗДЕЛЕНИЯ
-- ========================================

INSERT INTO department (id, tenant_id, organization_id, parent_id, name, code, head, status, created_at) VALUES
('dept-001', 'tenant-001', 'org-002', NULL, 'Производственный отдел', 'PROD', 'Морозов И.И.', 'active', NOW()),
('dept-002', 'tenant-001', 'org-002', 'dept-001', 'Цех №1', 'PROD-01', 'Новиков А.А.', 'active', NOW()),
('dept-003', 'tenant-001', 'org-002', 'dept-001', 'Цех №2', 'PROD-02', 'Соколов В.В.', 'active', NOW()),
('dept-004', 'tenant-001', 'org-002', NULL, 'Отдел промышленной безопасности', 'OPB', 'Лебедев С.С.', 'active', NOW()),
('dept-005', 'tenant-001', 'org-003', NULL, 'Отдел логистики', 'LOG', 'Козлов Д.Д.', 'active', NOW());

-- ========================================
-- 5. ФИЗИЧЕСКИЕ ЛИЦА
-- ========================================

INSERT INTO person (id, tenant_id, last_name, first_name, middle_name, birth_date, snils, inn, phone, email, education_level, status, created_at) VALUES
('person-001', 'tenant-001', 'Морозов', 'Иван', 'Иванович', '1975-05-15', '123-456-789 01', '770112345601', '+7-916-123-45-01', 'morozov@promcomp.ru', 'higher', 'active', NOW()),
('person-002', 'tenant-001', 'Новиков', 'Алексей', 'Алексеевич', '1980-08-20', '123-456-789 02', '770112345602', '+7-916-123-45-02', 'novikov@promcomp.ru', 'higher', 'active', NOW()),
('person-003', 'tenant-001', 'Соколов', 'Владимир', 'Владимирович', '1982-11-10', '123-456-789 03', '770112345603', '+7-916-123-45-03', 'sokolov@promcomp.ru', 'secondary', 'active', NOW()),
('person-004', 'tenant-001', 'Лебедев', 'Сергей', 'Сергеевич', '1978-03-25', '123-456-789 04', '770112345604', '+7-916-123-45-04', 'lebedev@promcomp.ru', 'higher', 'active', NOW()),
('person-005', 'tenant-001', 'Козлов', 'Дмитрий', 'Дмитриевич', '1985-07-12', '123-456-789 05', '770112345605', '+7-916-123-45-05', 'kozlov@promcomp.ru', 'higher', 'active', NOW()),
('person-006', 'tenant-001', 'Волков', 'Николай', 'Петрович', '1990-01-18', '123-456-789 06', '770112345606', '+7-916-123-45-06', 'volkov@promcomp.ru', 'secondary', 'active', NOW()),
('person-007', 'tenant-001', 'Зайцев', 'Михаил', 'Андреевич', '1988-09-05', '123-456-789 07', '770112345607', '+7-916-123-45-07', 'zaitsev@promcomp.ru', 'higher', 'active', NOW());

-- ========================================
-- 6. ДОЛЖНОСТИ
-- ========================================

INSERT INTO position (id, tenant_id, name, code, category, status, created_at) VALUES
('pos-001', 'tenant-001', 'Начальник производственного отдела', 'NPO', 'management', 'active', NOW()),
('pos-002', 'tenant-001', 'Начальник цеха', 'NCH', 'management', 'active', NOW()),
('pos-003', 'tenant-001', 'Инженер по промышленной безопасности', 'IPB', 'specialist', 'active', NOW()),
('pos-004', 'tenant-001', 'Главный энергетик', 'GE', 'management', 'active', NOW()),
('pos-005', 'tenant-001', 'Оператор технологической установки', 'OTU', 'worker', 'active', NOW()),
('pos-006', 'tenant-001', 'Слесарь-ремонтник', 'SLR', 'worker', 'active', NOW());

-- ========================================
-- 7. ПЕРСОНАЛ
-- ========================================

INSERT INTO personnel (id, tenant_id, person_id, position_id, organization_id, department_id, personnel_type, role, status, hire_date, created_at) VALUES
('pers-001', 'tenant-001', 'person-001', 'pos-001', 'org-002', 'dept-001', 'employee', 'Manager', 'active', '2020-01-15', NOW()),
('pers-002', 'tenant-001', 'person-002', 'pos-002', 'org-002', 'dept-002', 'employee', 'Manager', 'active', '2020-03-20', NOW()),
('pers-003', 'tenant-001', 'person-003', 'pos-002', 'org-002', 'dept-003', 'employee', 'Manager', 'active', '2020-05-10', NOW()),
('pers-004', 'tenant-001', 'person-004', 'pos-003', 'org-002', 'dept-004', 'employee', 'Auditor', 'active', '2019-11-01', NOW()),
('pers-005', 'tenant-001', 'person-005', 'pos-004', 'org-003', 'dept-005', 'employee', 'Director', 'active', '2021-02-15', NOW()),
('pers-006', 'tenant-001', 'person-006', 'pos-005', 'org-002', 'dept-002', 'employee', NULL, 'active', '2021-06-01', NOW()),
('pers-007', 'tenant-001', 'person-007', 'pos-006', 'org-002', 'dept-003', 'employee', NULL, 'active', '2022-01-10', NOW());

-- ========================================
-- 8. СИСТЕМНЫЕ ПОЛЬЗОВАТЕЛИ
-- ========================================

INSERT INTO system_user (id, tenant_id, personnel_id, email, login, password_hash, role, status, organization_access, created_at) VALUES
('user-001', 'tenant-001', NULL, 'admin@promcomp.ru', 'admin', '$2a$10$dummy.hash.for.testing.only', 'TenantAdmin', 'active', 
 ARRAY['org-001', 'org-002', 'org-003', 'org-004', 'org-005'], NOW()),
('user-002', 'tenant-001', 'pers-004', 'lebedev@promcomp.ru', 'lebedev', '$2a$10$dummy.hash.for.testing.only', 'Auditor', 'active',
 ARRAY['org-002'], NOW()),
('user-003', 'tenant-001', 'pers-001', 'morozov@promcomp.ru', 'morozov', '$2a$10$dummy.hash.for.testing.only', 'Manager', 'active',
 ARRAY['org-002'], NOW());

-- ========================================
-- 9. КОМПЕТЕНЦИИ
-- ========================================

INSERT INTO competency (id, tenant_id, code, name, category, validity_months, requires_rostechnadzor, status, created_at) VALUES
('comp-001', 'tenant-001', 'A1', 'Общие требования промышленной безопасности', 'industrial_safety', 60, true, 'active', NOW()),
('comp-002', 'tenant-001', 'A2', 'Требования промышленной безопасности в нефтяной промышленности', 'industrial_safety', 60, true, 'active', NOW()),
('comp-003', 'tenant-001', 'B1', 'Требования энергетической безопасности', 'energy_safety', 36, true, 'active', NOW()),
('comp-004', 'tenant-001', 'C1', 'Требования охраны труда', 'labor_safety', 36, false, 'active', NOW()),
('comp-005', 'tenant-001', 'D1', 'Экологическая безопасность', 'ecology', 36, false, 'active', NOW());

-- ========================================
-- 10. ОБЛАСТИ АТТЕСТАЦИИ
-- ========================================

INSERT INTO certification_area (id, code, name, category, validity_months, requires_rostechnadzor) VALUES
('area-001', 'А.1', 'Общие требования промышленной безопасности', 'industrial_safety', 60, true),
('area-002', 'А.2', 'Требования промышленной безопасности в нефтяной промышленности', 'industrial_safety', 60, true),
('area-003', 'Б.1', 'Требования энергетической безопасности', 'energy_safety', 36, true),
('area-004', 'Г.1', 'Требования безопасности гидротехнических сооружений', 'industrial_safety', 60, true);

-- ========================================
-- 11. СЕРТИФИКАТЫ
-- ========================================

INSERT INTO certification (id, tenant_id, person_id, employee_id, competency_id, type, category, issue_date, expiry_date, protocol_number, certificate_number, status, created_at) VALUES
('cert-001', 'tenant-001', 'person-001', 'pers-001', 'comp-001', 'periodic', 'А.1', '2023-01-15', '2028-01-15', 'П-001-2023', 'У-123456', 'valid', NOW()),
('cert-002', 'tenant-001', 'person-002', 'pers-002', 'comp-001', 'periodic', 'А.1', '2023-03-20', '2028-03-20', 'П-002-2023', 'У-123457', 'valid', NOW()),
('cert-003', 'tenant-001', 'person-004', 'pers-004', 'comp-001', 'periodic', 'А.1', '2022-11-01', '2027-11-01', 'П-003-2022', 'У-123458', 'valid', NOW()),
('cert-004', 'tenant-001', 'person-004', 'pers-004', 'comp-003', 'periodic', 'Б.1', '2023-06-15', '2026-06-15', 'П-004-2023', 'У-123459', 'expiring', NOW()),
('cert-005', 'tenant-001', 'person-006', 'pers-006', 'comp-002', 'initial', 'А.2', '2024-01-10', '2029-01-10', 'П-005-2024', 'У-123460', 'valid', NOW());

-- ========================================
-- 12. МАТРИЦА КОМПЕТЕНЦИЙ
-- ========================================

INSERT INTO competency_matrix (id, tenant_id, organization_id, position_id, required_areas, created_at) VALUES
('matrix-001', 'tenant-001', 'org-002', 'pos-001', 
 '[{"category": "industrial_safety", "areas": ["area-001"]}, {"category": "labor_safety", "areas": ["area-004"]}]'::jsonb, NOW()),
('matrix-002', 'tenant-001', 'org-002', 'pos-003',
 '[{"category": "industrial_safety", "areas": ["area-001", "area-002"]}, {"category": "energy_safety", "areas": ["area-003"]}]'::jsonb, NOW());

-- ========================================
-- 13. СПРАВОЧНИКИ ДЛЯ ИНЦИДЕНТОВ
-- ========================================

INSERT INTO incident_source (id, tenant_id, name, status, created_at) VALUES
('src-001', 'tenant-001', 'Аудит безопасности', 'active', NOW()),
('src-002', 'tenant-001', 'Производственный контроль', 'active', NOW()),
('src-003', 'tenant-001', 'Ростехнадзор', 'active', NOW()),
('src-004', 'tenant-001', 'Самопроверка', 'active', NOW());

INSERT INTO incident_direction (id, tenant_id, name, status, created_at) VALUES
('dir-001', 'tenant-001', 'Промышленная безопасность', 'active', NOW()),
('dir-002', 'tenant-001', 'Охрана труда', 'active', NOW()),
('dir-003', 'tenant-001', 'Энергетическая безопасность', 'active', NOW()),
('dir-004', 'tenant-001', 'Экология', 'active', NOW());

INSERT INTO incident_funding_type (id, tenant_id, name, status, created_at) VALUES
('fund-001', 'tenant-001', 'OPEX', 'active', NOW()),
('fund-002', 'tenant-001', 'CAPEX', 'active', NOW()),
('fund-003', 'tenant-001', 'Резервный фонд', 'active', NOW());

INSERT INTO incident_category (id, tenant_id, name, status, created_at) VALUES
('cat-001', 'tenant-001', 'Нарушения безопасности', 'active', NOW()),
('cat-002', 'tenant-001', 'Неисправности оборудования', 'active', NOW()),
('cat-003', 'tenant-001', 'Документация', 'active', NOW());

INSERT INTO incident_subcategory (id, tenant_id, category_id, name, status, created_at) VALUES
('subcat-001', 'tenant-001', 'cat-001', 'Нарушение инструкций', 'active', NOW()),
('subcat-002', 'tenant-001', 'cat-001', 'Отсутствие СИЗ', 'active', NOW()),
('subcat-003', 'tenant-001', 'cat-002', 'Износ оборудования', 'active', NOW()),
('subcat-004', 'tenant-001', 'cat-003', 'Отсутствие документации', 'active', NOW());

-- ========================================
-- 14. ИНЦИДЕНТЫ
-- ========================================

INSERT INTO incident (id, tenant_id, organization_id, production_site_id, report_date, source_id, direction_id, 
                     description, corrective_action, funding_type_id, category_id, subcategory_id, 
                     responsible_personnel_id, planned_date, status, days_left, created_at) VALUES
('inc-001', 'tenant-001', 'org-002', 'site-001', '2024-10-01', 'src-001', 'dir-001',
 'Обнаружено отсутствие паспорта на сосуд под давлением №5', 
 'Провести экспертизу промышленной безопасности, получить паспорт',
 'fund-001', 'cat-003', 'subcat-004', 'pers-004', '2024-11-15', 'in_progress', 33, NOW()),
('inc-002', 'tenant-001', 'org-002', 'site-001', '2024-10-05', 'src-002', 'dir-002',
 'Работник без средств индивидуальной защиты в цехе №1',
 'Выдать СИЗ, провести внеплановый инструктаж',
 'fund-001', 'cat-001', 'subcat-002', 'pers-002', '2024-10-20', 'completed', 0, NOW()),
('inc-003', 'tenant-001', 'org-002', 'site-002', '2024-10-10', 'src-004', 'dir-003',
 'Требуется замена трансформатора в РП-10',
 'Заменить трансформатор, провести испытания',
 'fund-002', 'cat-002', 'subcat-003', 'pers-005', '2024-12-01', 'created', 50, NOW());

-- ========================================
-- 15. ЧЕК-ЛИСТЫ
-- ========================================

INSERT INTO checklist (id, tenant_id, name, category, created_at) VALUES
('check-001', 'tenant-001', 'Проверка промышленной безопасности ОПО', 'Промышленная безопасность', NOW()),
('check-002', 'tenant-001', 'Проверка охраны труда на производстве', 'Охрана труда', NOW());

INSERT INTO checklist_item (id, checklist_id, question, requires_comment, critical_item, display_order) VALUES
('item-001', 'check-001', 'Наличие паспортов на ОПО', true, true, 1),
('item-002', 'check-001', 'Наличие актов технического освидетельствования', true, true, 2),
('item-003', 'check-001', 'Проведение производственного контроля', false, false, 3),
('item-004', 'check-002', 'Наличие СИЗ у работников', true, true, 1),
('item-005', 'check-002', 'Проведение инструктажей по охране труда', true, false, 2);

-- ========================================
-- 16. АУДИТЫ
-- ========================================

INSERT INTO audit (id, tenant_id, checklist_id, organization_id, auditor_id, scheduled_date, completed_date, status, created_at) VALUES
('audit-001', 'tenant-001', 'check-001', 'org-002', 'pers-004', '2024-10-01', '2024-10-01', 'completed', NOW()),
('audit-002', 'tenant-001', 'check-002', 'org-002', 'pers-004', '2024-10-15', NULL, 'scheduled', NOW());

INSERT INTO audit_finding (id, audit_id, item_id, result, comment) VALUES
('find-001', 'audit-001', 'item-001', 'fail', 'Отсутствует паспорт на сосуд под давлением №5'),
('find-002', 'audit-001', 'item-002', 'pass', NULL),
('find-003', 'audit-001', 'item-003', 'pass', NULL);

-- ========================================
-- 17. ЗАДАЧИ
-- ========================================

INSERT INTO task (id, tenant_id, title, description, type, priority, status, assigned_to, created_by, due_date, 
                 source_type, source_id, incident_id, created_at) VALUES
('task-001', 'tenant-001', 'Оформить паспорт на сосуд №5', 
 'Провести экспертизу промышленной безопасности и получить паспорт', 
 'corrective_action', 'high', 'in_progress', 'pers-004', 'user-002', '2024-11-15', 
 'incident', 'inc-001', 'inc-001', NOW()),
('task-002', 'tenant-001', 'Провести внеплановый инструктаж',
 'Провести внеплановый инструктаж по охране труда для работников цеха №1',
 'corrective_action', 'critical', 'completed', 'pers-002', 'user-002', '2024-10-10',
 'incident', 'inc-002', 'inc-002', NOW());

-- ========================================
-- 18. БЮДЖЕТ
-- ========================================

INSERT INTO budget_category (id, tenant_id, name, description, planned_amount, year, color, status, created_at) VALUES
('budget-001', 'tenant-001', 'Промышленная безопасность', 'Расходы на ПБ', 5000000.00, 2024, '#FF6B6B', 'active', NOW()),
('budget-002', 'tenant-001', 'Охрана труда', 'Расходы на ОТ', 3000000.00, 2024, '#4ECDC4', 'active', NOW()),
('budget-003', 'tenant-001', 'Обучение персонала', 'Обучение и аттестация', 2000000.00, 2024, '#45B7D1', 'active', NOW()),
('budget-004', 'tenant-001', 'Техническое обслуживание', 'ТО оборудования', 4000000.00, 2024, '#FFA07A', 'active', NOW());

INSERT INTO budget_expense (id, tenant_id, category_id, amount, description, expense_date, document_number, 
                           source_type, created_by, organization_id, created_at) VALUES
('expense-001', 'tenant-001', 'budget-001', 150000.00, 'Экспертиза промышленной безопасности сосуда №5', 
 '2024-10-15', 'СФ-001234', 'incident', 'user-001', 'org-002', NOW()),
('expense-002', 'tenant-001', 'budget-003', 85000.00, 'Обучение Волкова Н.П. по программе А.2',
 '2024-09-20', 'СФ-001235', 'manual', 'user-001', 'org-002', NOW()),
('expense-003', 'tenant-001', 'budget-002', 45000.00, 'Закупка СИЗ для цеха №1',
 '2024-10-05', 'СФ-001236', 'manual', 'user-001', 'org-002', NOW());

-- ========================================
-- 19. ПРОМЫШЛЕННЫЕ ОБЪЕКТЫ
-- ========================================

INSERT INTO industrial_object (id, tenant_id, organization_id, registration_number, name, type, category, hazard_class,
                               commissioning_date, status, location_address, responsible_person, responsible_person_id,
                               next_expertise_date, created_at) VALUES
('obj-001', 'tenant-001', 'org-002', 'А47-00123-ОПО', 'Технологическая установка №1', 'opo', 'ОПО I класса опасности', 'I',
 '2015-06-01', 'active', 'г. Москва, ул. Промышленная, д. 10, корп. 1', 'Морозов И.И.', 'pers-001', '2025-06-01', NOW()),
('obj-002', 'tenant-001', 'org-002', 'А47-00124-ОПО', 'Резервуарный парк ГСМ', 'opo', 'ОПО II класса опасности', 'II',
 '2018-03-15', 'active', 'г. Москва, ул. Промышленная, д. 12', 'Морозов И.И.', 'pers-001', '2026-03-15', NOW()),
('obj-003', 'tenant-001', 'org-002', 'ГТС-00045', 'Трубопровод технической воды', 'gts', NULL, NULL,
 '2010-09-20', 'active', 'г. Москва, ул. Промышленная, территория завода', 'Козлов Д.Д.', 'pers-005', '2025-09-20', NOW());

INSERT INTO object_document (id, object_id, title, type, document_number, issue_date, expiry_date, status, created_at) VALUES
('doc-001', 'obj-001', 'Паспорт технологической установки №1', 'passport', 'ПСП-001-2015', '2015-06-01', NULL, 'valid', NOW()),
('doc-002', 'obj-001', 'Заключение экспертизы промышленной безопасности', 'certificate', 'ЗЭ-12345', '2020-05-15', '2025-05-15', 'expiring_soon', NOW()),
('doc-003', 'obj-002', 'Паспорт резервуарного парка', 'passport', 'ПСП-002-2018', '2018-03-15', NULL, 'valid', NOW());

-- ========================================
-- 20. ОБОРУДОВАНИЕ
-- ========================================

INSERT INTO equipment (id, tenant_id, organization_id, name, type, manufacturer, serial_number, commission_date, 
                      status, next_maintenance_date, next_examination_date, created_at) VALUES
('equip-001', 'tenant-001', 'org-002', 'Сосуд под давлением №5', 'Сосуд', 'ООО "ПромМаш"', 'СПД-5-2015-123', '2015-06-01',
 'operational', '2024-12-01', '2025-06-01', NOW()),
('equip-002', 'tenant-001', 'org-002', 'Компрессор воздушный КВ-100', 'Компрессор', 'ЗАО "КомпТех"', 'КВ-100-2018-456', '2018-08-15',
 'operational', '2024-11-15', '2025-08-15', NOW()),
('equip-003', 'tenant-001', 'org-003', 'Трансформатор ТМ-1000', 'Трансформатор', 'АО "Электро"', 'ТМ-1000-2020-789', '2020-05-20',
 'operational', '2024-10-25', '2025-05-20', NOW());

-- ========================================
-- 21. ПРОГРАММЫ ОБУЧЕНИЯ
-- ========================================

INSERT INTO training_program (id, tenant_id, name, code, category, duration_hours, validity_months, 
                              min_students, max_students, cost, status, created_at) VALUES
('prog-001', 'tenant-002', 'Промышленная безопасность А.1', 'A1-PB', 'industrial_safety', 40, 60, 5, 25, 25000.00, 'active', NOW()),
('prog-002', 'tenant-002', 'Промышленная безопасность А.2', 'A2-PB', 'industrial_safety', 40, 60, 5, 25, 27000.00, 'active', NOW()),
('prog-003', 'tenant-002', 'Энергетическая безопасность Б.1', 'B1-EB', 'energy_safety', 32, 36, 5, 20, 22000.00, 'active', NOW()),
('prog-004', 'tenant-002', 'Охрана труда', 'OT-01', 'labor_safety', 40, 36, 10, 30, 18000.00, 'active', NOW());

INSERT INTO training_location (id, tenant_id, name, address, capacity, status, created_at) VALUES
('loc-001', 'tenant-002', 'Учебный класс №1', 'г. Москва, ул. Учебная, д. 5, ауд. 101', 25, 'active', NOW()),
('loc-002', 'tenant-002', 'Учебный класс №2', 'г. Москва, ул. Учебная, д. 5, ауд. 102', 20, 'active', NOW()),
('loc-003', 'tenant-002', 'Компьютерный класс', 'г. Москва, ул. Учебная, д. 5, ауд. 201', 15, 'active', NOW());

-- ========================================
-- 22. УВЕДОМЛЕНИЯ
-- ========================================

INSERT INTO notification (id, tenant_id, user_id, type, source, source_id, title, message, is_read, created_at) VALUES
('notif-001', 'tenant-001', 'user-002', 'warning', 'certification', 'cert-004', 
 'Истекает срок действия удостоверения',
 'У сотрудника Лебедев С.С. истекает срок действия удостоверения по области Б.1 (15.06.2026)', false, NOW()),
('notif-002', 'tenant-001', 'user-003', 'critical', 'incident', 'inc-001',
 'Новый инцидент требует внимания',
 'Зарегистрирован инцидент: Отсутствие паспорта на сосуд под давлением №5', true, NOW()),
('notif-003', 'tenant-001', 'user-002', 'success', 'task', 'task-002',
 'Задача выполнена',
 'Задача "Провести внеплановый инструктаж" выполнена', true, NOW());

-- ========================================
-- 23. ВНЕШНИЕ ОРГАНИЗАЦИИ
-- ========================================

INSERT INTO external_organization (id, tenant_id, type, name, inn, contact_person, phone, email, status, created_at) VALUES
('ext-001', 'tenant-001', 'training_center', 'ООО "УЦ Техносфера"', '7706123456', 'Семенов А.А.', '+7-495-111-22-33', 'info@technosfera.ru', 'active', NOW()),
('ext-002', 'tenant-001', 'contractor', 'ООО "СтройРемонт"', '7707234567', 'Григорьев В.В.', '+7-495-222-33-44', 'info@stroyremont.ru', 'active', NOW()),
('ext-003', 'tenant-001', 'certification_body', 'АО "ПромЭксперт"', '7708345678', 'Федоров С.И.', '+7-495-333-44-55', 'info@promexpert.ru', 'active', NOW());

INSERT INTO organization_contractor (id, tenant_id, organization_id, contractor_tenant_id, contractor_name, type, 
                                    services, contract_number, contract_date, status, created_at) VALUES
('contr-001', 'tenant-001', 'org-002', 'tenant-002', 'ООО "Учебный центр Безопасность"', 'training_center',
 ARRAY['full_training', 'sdo_access_only'], 'Д-001-2024', '2024-01-15', 'active', NOW());

-- ========================================
-- 24. ЗАЯВКИ НА ОБУЧЕНИЕ
-- ========================================

INSERT INTO organization_training_request (id, tenant_id, from_tenant_id, from_tenant_name, organization_id, organization_name,
                                          program_id, program_name, request_date, request_type, students_count, students,
                                          contact_person, contact_phone, contact_email, status, created_at) VALUES
('req-001', 'tenant-002', 'tenant-001', 'ПАО "Промышленная компания"', 'org-002', 'ООО "ПромКомп-Производство"',
 'prog-002', 'Промышленная безопасность А.2', '2024-10-01', 'full_training', 1,
 '[{"fullName": "Волков Николай Петрович", "position": "Оператор технологической установки"}]'::jsonb,
 'Морозов И.И.', '+7-916-123-45-01', 'morozov@promcomp.ru', 'approved', NOW());

-- ========================================
-- 25. БАЗА ЗНАНИЙ
-- ========================================

INSERT INTO knowledge_document (id, tenant_id, category, title, description, content, author, status, published_at, created_at) VALUES
('kb-001', 'tenant-001', 'user_guide', 'Руководство пользователя модуля Аттестация',
 'Инструкция по работе с модулем аттестации персонала',
 'Подробное описание функций модуля...', 'user-001', 'published', NOW(), NOW()),
('kb-002', 'tenant-001', 'regulatory', 'ФНП ОРПД (Общие правила)',
 'Федеральные нормы и правила в области промышленной безопасности',
 'Текст нормативного документа...', 'user-001', 'published', NOW(), NOW()),
('kb-003', 'tenant-001', 'organization', 'Положение о производственном контроле',
 'Внутренний документ организации',
 'Положение о производственном контроле ООО "ПромКомп-Производство"...', 'user-001', 'published', NOW(), NOW());

-- ========================================
-- ВЫВОД СТАТИСТИКИ
-- ========================================

SELECT 'Тестовые данные успешно загружены!' as message;

SELECT 'Тенантов:' as entity, COUNT(*) as count FROM tenant
UNION ALL SELECT 'Организаций:', COUNT(*) FROM organization
UNION ALL SELECT 'Пользователей:', COUNT(*) FROM system_user
UNION ALL SELECT 'Персонала:', COUNT(*) FROM personnel
UNION ALL SELECT 'Компетенций:', COUNT(*) FROM competency
UNION ALL SELECT 'Сертификатов:', COUNT(*) FROM certification
UNION ALL SELECT 'Инцидентов:', COUNT(*) FROM incident
UNION ALL SELECT 'Задач:', COUNT(*) FROM task
UNION ALL SELECT 'Аудитов:', COUNT(*) FROM audit
UNION ALL SELECT 'Промышленных объектов:', COUNT(*) FROM industrial_object
UNION ALL SELECT 'Единиц оборудования:', COUNT(*) FROM equipment
UNION ALL SELECT 'Программ обучения:', COUNT(*) FROM training_program
UNION ALL SELECT 'Расходов:', COUNT(*) FROM budget_expense
UNION ALL SELECT 'Уведомлений:', COUNT(*) FROM notification;
