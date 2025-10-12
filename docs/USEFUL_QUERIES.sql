-- ========================================
-- ПОЛЕЗНЫЕ SQL-ЗАПРОСЫ
-- Система управления промышленной безопасностью
-- ========================================

-- ========================================
-- 1. АНАЛИТИКА ПО ПЕРСОНАЛУ И КОМПЕТЕНЦИЯМ
-- ========================================

-- 1.1. Список сотрудников с истекающими сертификатами (в ближайшие 90 дней)
SELECT 
    p.last_name || ' ' || p.first_name || ' ' || COALESCE(p.middle_name, '') as full_name,
    pos.name as position,
    o.name as organization,
    c.name as competency,
    cert.expiry_date,
    cert.expiry_date - CURRENT_DATE as days_until_expiry,
    cert.status
FROM certification cert
JOIN person p ON cert.person_id = p.id
JOIN personnel pers ON cert.employee_id = pers.id
JOIN position pos ON pers.position_id = pos.id
JOIN organization o ON pers.organization_id = o.id
JOIN competency c ON cert.competency_id = c.id
WHERE cert.tenant_id = 'tenant-001'
  AND cert.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
  AND cert.status IN ('valid', 'expiring')
ORDER BY cert.expiry_date;

-- 1.2. Статистика по сертификатам по статусам
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM certification
WHERE tenant_id = 'tenant-001'
GROUP BY status
ORDER BY count DESC;

-- 1.3. Сотрудники без необходимых компетенций (Gap Analysis)
SELECT 
    p.last_name || ' ' || p.first_name as full_name,
    pos.name as position,
    o.name as organization,
    cm.required_areas,
    COUNT(cert.id) as certificates_count
FROM personnel pers
JOIN person p ON pers.person_id = p.id
JOIN position pos ON pers.position_id = pos.id
JOIN organization o ON pers.organization_id = o.id
LEFT JOIN competency_matrix cm ON cm.position_id = pos.id AND cm.organization_id = o.id
LEFT JOIN certification cert ON cert.employee_id = pers.id AND cert.status = 'valid'
WHERE pers.tenant_id = 'tenant-001'
  AND pers.status = 'active'
GROUP BY p.id, pos.id, o.id, cm.id, p.last_name, p.first_name, pos.name, o.name, cm.required_areas
HAVING cm.required_areas IS NOT NULL;

-- ========================================
-- 2. АНАЛИТИКА ПО ИНЦИДЕНТАМ
-- ========================================

-- 2.1. Активные инциденты по организациям
SELECT 
    o.name as organization,
    COUNT(*) as total_incidents,
    SUM(CASE WHEN i.status = 'overdue' THEN 1 ELSE 0 END) as overdue,
    SUM(CASE WHEN i.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN i.status = 'created' THEN 1 ELSE 0 END) as created,
    ROUND(AVG(CASE WHEN i.completed_date IS NOT NULL 
        THEN EXTRACT(DAY FROM (i.completed_date - i.report_date)) 
        ELSE NULL END), 1) as avg_completion_days
FROM incident i
JOIN organization o ON i.organization_id = o.id
WHERE i.tenant_id = 'tenant-001'
  AND i.status NOT IN ('completed', 'completed_late')
GROUP BY o.id, o.name
ORDER BY total_incidents DESC;

-- 2.2. Инциденты по категориям и направлениям
SELECT 
    dir.name as direction,
    cat.name as category,
    COUNT(*) as count,
    SUM(CASE WHEN i.status IN ('overdue') THEN 1 ELSE 0 END) as overdue_count
FROM incident i
JOIN incident_direction dir ON i.direction_id = dir.id
JOIN incident_category cat ON i.category_id = cat.id
WHERE i.tenant_id = 'tenant-001'
GROUP BY dir.id, cat.id, dir.name, cat.name
ORDER BY count DESC;

-- 2.3. Топ ответственных по количеству инцидентов
SELECT 
    p.last_name || ' ' || p.first_name as responsible_person,
    pos.name as position,
    COUNT(*) as total_incidents,
    SUM(CASE WHEN i.status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN i.status = 'overdue' THEN 1 ELSE 0 END) as overdue,
    ROUND(100.0 * SUM(CASE WHEN i.status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate
FROM incident i
JOIN personnel pers ON i.responsible_personnel_id = pers.id
JOIN person p ON pers.person_id = p.id
JOIN position pos ON pers.position_id = pos.id
WHERE i.tenant_id = 'tenant-001'
GROUP BY p.id, pos.id, p.last_name, p.first_name, pos.name
ORDER BY total_incidents DESC
LIMIT 10;

-- ========================================
-- 3. АНАЛИТИКА ПО БЮДЖЕТУ
-- ========================================

-- 3.1. Исполнение бюджета по категориям
SELECT 
    bc.name as category,
    bc.planned_amount,
    COALESCE(SUM(be.amount), 0) as spent_amount,
    bc.planned_amount - COALESCE(SUM(be.amount), 0) as remaining,
    ROUND(100.0 * COALESCE(SUM(be.amount), 0) / NULLIF(bc.planned_amount, 0), 2) as utilization_rate
FROM budget_category bc
LEFT JOIN budget_expense be ON bc.id = be.category_id
WHERE bc.tenant_id = 'tenant-001'
  AND bc.year = EXTRACT(YEAR FROM CURRENT_DATE)
  AND bc.status = 'active'
GROUP BY bc.id, bc.name, bc.planned_amount
ORDER BY utilization_rate DESC;

-- 3.2. Расходы по месяцам
SELECT 
    TO_CHAR(be.expense_date, 'YYYY-MM') as month,
    bc.name as category,
    SUM(be.amount) as total_amount,
    COUNT(*) as expenses_count
FROM budget_expense be
JOIN budget_category bc ON be.category_id = bc.id
WHERE be.tenant_id = 'tenant-001'
  AND be.expense_date >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY TO_CHAR(be.expense_date, 'YYYY-MM'), bc.id, bc.name
ORDER BY month DESC, total_amount DESC;

-- 3.3. Топ-10 самых дорогих расходов
SELECT 
    be.expense_date,
    be.description,
    bc.name as category,
    o.name as organization,
    be.amount,
    be.document_number
FROM budget_expense be
JOIN budget_category bc ON be.category_id = bc.id
LEFT JOIN organization o ON be.organization_id = o.id
WHERE be.tenant_id = 'tenant-001'
ORDER BY be.amount DESC
LIMIT 10;

-- ========================================
-- 4. АНАЛИТИКА ПО АУДИТАМ
-- ========================================

-- 4.1. Результаты аудитов по организациям
SELECT 
    o.name as organization,
    cl.name as checklist,
    a.scheduled_date,
    a.completed_date,
    a.status,
    COUNT(af.id) as total_items,
    SUM(CASE WHEN af.result = 'pass' THEN 1 ELSE 0 END) as passed,
    SUM(CASE WHEN af.result = 'fail' THEN 1 ELSE 0 END) as failed,
    ROUND(100.0 * SUM(CASE WHEN af.result = 'pass' THEN 1 ELSE 0 END) / NULLIF(COUNT(af.id), 0), 2) as pass_rate
FROM audit a
JOIN organization o ON a.organization_id = o.id
JOIN checklist cl ON a.checklist_id = cl.id
LEFT JOIN audit_finding af ON a.id = af.audit_id
WHERE a.tenant_id = 'tenant-001'
GROUP BY o.id, cl.id, a.id, o.name, cl.name, a.scheduled_date, a.completed_date, a.status
ORDER BY a.scheduled_date DESC;

-- 4.2. Критические несоответствия по аудитам
SELECT 
    o.name as organization,
    a.completed_date,
    cli.question,
    af.result,
    af.comment
FROM audit a
JOIN organization o ON a.organization_id = o.id
JOIN audit_finding af ON a.id = af.audit_id
JOIN checklist_item cli ON af.item_id = cli.id
WHERE a.tenant_id = 'tenant-001'
  AND af.result = 'fail'
  AND cli.critical_item = true
ORDER BY a.completed_date DESC;

-- ========================================
-- 5. АНАЛИТИКА ПО ПРОМЫШЛЕННЫМ ОБЪЕКТАМ
-- ========================================

-- 5.1. Объекты с приближающимися датами экспертиз
SELECT 
    io.registration_number,
    io.name,
    io.type,
    io.hazard_class,
    o.name as organization,
    io.next_expertise_date,
    io.next_expertise_date - CURRENT_DATE as days_until_expertise,
    io.responsible_person
FROM industrial_object io
JOIN organization o ON io.organization_id = o.id
WHERE io.tenant_id = 'tenant-001'
  AND io.status = 'active'
  AND io.next_expertise_date IS NOT NULL
  AND io.next_expertise_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '180 days'
ORDER BY io.next_expertise_date;

-- 5.2. Статистика по типам промышленных объектов
SELECT 
    type,
    hazard_class,
    COUNT(*) as count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
    COUNT(CASE WHEN next_expertise_date < CURRENT_DATE + INTERVAL '90 days' THEN 1 END) as expertise_soon
FROM industrial_object
WHERE tenant_id = 'tenant-001'
GROUP BY type, hazard_class
ORDER BY type, hazard_class;

-- 5.3. Документы объектов с истекающими сроками
SELECT 
    io.registration_number,
    io.name as object_name,
    od.title as document_title,
    od.type as document_type,
    od.expiry_date,
    od.expiry_date - CURRENT_DATE as days_until_expiry,
    od.status
FROM object_document od
JOIN industrial_object io ON od.object_id = io.id
WHERE io.tenant_id = 'tenant-001'
  AND od.expiry_date IS NOT NULL
  AND od.status IN ('valid', 'expiring_soon')
  AND od.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '180 days'
ORDER BY od.expiry_date;

-- ========================================
-- 6. АНАЛИТИКА ПО ОБОРУДОВАНИЮ И ТО
-- ========================================

-- 6.1. График технического обслуживания
SELECT 
    e.name as equipment,
    e.type,
    o.name as organization,
    e.next_maintenance_date,
    e.next_examination_date,
    e.status,
    LEAST(
        COALESCE(e.next_maintenance_date - CURRENT_DATE, 999),
        COALESCE(e.next_examination_date - CURRENT_DATE, 999)
    ) as days_until_next_event
FROM equipment e
JOIN organization o ON e.organization_id = o.id
WHERE e.tenant_id = 'tenant-001'
  AND e.status IN ('operational', 'maintenance')
  AND (e.next_maintenance_date IS NOT NULL OR e.next_examination_date IS NOT NULL)
ORDER BY days_until_next_event;

-- 6.2. Статистика по дефектам оборудования
SELECT 
    e.name as equipment,
    ex.completed_date,
    ex.result,
    d.severity,
    d.status as defect_status,
    d.description
FROM examination ex
JOIN equipment e ON ex.equipment_id = e.id
JOIN defect d ON ex.id = d.examination_id
WHERE ex.tenant_id = 'tenant-001'
  AND d.status = 'open'
ORDER BY 
    CASE d.severity 
        WHEN 'critical' THEN 1
        WHEN 'major' THEN 2
        WHEN 'minor' THEN 3
    END,
    ex.completed_date DESC;

-- 6.3. Стоимость обслуживания по оборудованию
SELECT 
    e.name as equipment,
    e.type,
    COUNT(mr.id) as maintenance_count,
    SUM(mr.cost) as total_cost,
    AVG(mr.cost) as avg_cost,
    MAX(mr.completed_date) as last_maintenance
FROM equipment e
LEFT JOIN maintenance_record mr ON e.id = mr.equipment_id
WHERE e.tenant_id = 'tenant-001'
GROUP BY e.id, e.name, e.type
HAVING SUM(mr.cost) IS NOT NULL
ORDER BY total_cost DESC;

-- ========================================
-- 7. АНАЛИТИКА ПО ОБУЧЕНИЮ
-- ========================================

-- 7.1. Статистика по программам обучения
SELECT 
    tp.name as program,
    tp.category,
    tp.duration_hours,
    COUNT(DISTINCT tg.id) as groups_count,
    COUNT(te.id) as students_enrolled,
    SUM(CASE WHEN te.status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN te.status = 'failed' THEN 1 ELSE 0 END) as failed,
    ROUND(100.0 * SUM(CASE WHEN te.status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(te.id), 0), 2) as completion_rate
FROM training_program tp
LEFT JOIN training_group tg ON tp.id = tg.program_id
LEFT JOIN training_enrollment te ON tg.id = te.group_id
WHERE tp.tenant_id = 'tenant-002'
  AND tp.status = 'active'
GROUP BY tp.id, tp.name, tp.category, tp.duration_hours
ORDER BY students_enrolled DESC;

-- 7.2. Текущие учебные группы
SELECT 
    tg.name as group_name,
    tp.name as program,
    tg.start_date,
    tg.end_date,
    tg.enrolled_count,
    tg.max_students,
    tg.status,
    CONCAT(p.last_name, ' ', p.first_name) as instructor
FROM training_group tg
JOIN training_program tp ON tg.program_id = tp.id
LEFT JOIN training_instructor ti ON tg.instructor_id = ti.id
LEFT JOIN personnel pers ON ti.personnel_id = pers.id
LEFT JOIN person p ON pers.person_id = p.id
WHERE tg.tenant_id = 'tenant-002'
  AND tg.status IN ('planned', 'in_progress')
ORDER BY tg.start_date;

-- 7.3. Заявки на обучение от организаций
SELECT 
    otr.request_date,
    otr.from_tenant_name,
    otr.organization_name,
    otr.program_name,
    otr.students_count,
    otr.request_type,
    otr.status,
    otr.contact_person
FROM organization_training_request otr
WHERE otr.tenant_id = 'tenant-002'
ORDER BY otr.request_date DESC;

-- ========================================
-- 8. АНАЛИТИКА ПО ЗАДАЧАМ
-- ========================================

-- 8.1. Статистика по задачам по исполнителям
SELECT 
    CONCAT(p.last_name, ' ', p.first_name) as assigned_to,
    pos.name as position,
    COUNT(*) as total_tasks,
    SUM(CASE WHEN t.status = 'open' THEN 1 ELSE 0 END) as open,
    SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN 1 ELSE 0 END) as overdue,
    ROUND(100.0 * SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate
FROM task t
JOIN personnel pers ON t.assigned_to = pers.id
JOIN person p ON pers.person_id = p.id
JOIN position pos ON pers.position_id = pos.id
WHERE t.tenant_id = 'tenant-001'
GROUP BY p.id, pos.id, p.last_name, p.first_name, pos.name
ORDER BY total_tasks DESC;

-- 8.2. Просроченные задачи
SELECT 
    t.title,
    t.type,
    t.priority,
    t.due_date,
    CURRENT_DATE - t.due_date as days_overdue,
    CONCAT(p.last_name, ' ', p.first_name) as assigned_to,
    o.name as organization
FROM task t
JOIN personnel pers ON t.assigned_to = pers.id
JOIN person p ON pers.person_id = p.id
LEFT JOIN organization o ON pers.organization_id = o.id
WHERE t.tenant_id = 'tenant-001'
  AND t.status NOT IN ('completed', 'cancelled')
  AND t.due_date < CURRENT_DATE
ORDER BY t.priority, days_overdue DESC;

-- ========================================
-- 9. ДАШБОРД - ОСНОВНЫЕ МЕТРИКИ
-- ========================================

-- 9.1. Общая статистика тенанта
WITH stats AS (
    SELECT 
        'Сотрудников' as metric,
        COUNT(*) as value,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active
    FROM personnel
    WHERE tenant_id = 'tenant-001'
    
    UNION ALL
    
    SELECT 
        'Сертификатов',
        COUNT(*),
        COUNT(CASE WHEN status = 'valid' THEN 1 END)
    FROM certification
    WHERE tenant_id = 'tenant-001'
    
    UNION ALL
    
    SELECT 
        'Инцидентов',
        COUNT(*),
        COUNT(CASE WHEN status NOT IN ('completed', 'completed_late') THEN 1 END)
    FROM incident
    WHERE tenant_id = 'tenant-001'
    
    UNION ALL
    
    SELECT 
        'Задач',
        COUNT(*),
        COUNT(CASE WHEN status NOT IN ('completed', 'cancelled') THEN 1 END)
    FROM task
    WHERE tenant_id = 'tenant-001'
    
    UNION ALL
    
    SELECT 
        'Промышленных объектов',
        COUNT(*),
        COUNT(CASE WHEN status = 'active' THEN 1 END)
    FROM industrial_object
    WHERE tenant_id = 'tenant-001'
)
SELECT * FROM stats;

-- 9.2. Критические показатели
SELECT 
    'Истекающих сертификатов (30 дней)' as indicator,
    COUNT(*) as count,
    'warning' as level
FROM certification
WHERE tenant_id = 'tenant-001'
  AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND status IN ('valid', 'expiring')

UNION ALL

SELECT 
    'Просроченных инцидентов',
    COUNT(*),
    'critical'
FROM incident
WHERE tenant_id = 'tenant-001'
  AND status = 'overdue'

UNION ALL

SELECT 
    'Просроченных задач',
    COUNT(*),
    'critical'
FROM task
WHERE tenant_id = 'tenant-001'
  AND status NOT IN ('completed', 'cancelled')
  AND due_date < CURRENT_DATE

UNION ALL

SELECT 
    'Превышение бюджета',
    COUNT(*),
    'warning'
FROM (
    SELECT 
        bc.id,
        bc.planned_amount,
        COALESCE(SUM(be.amount), 0) as spent
    FROM budget_category bc
    LEFT JOIN budget_expense be ON bc.id = be.category_id
    WHERE bc.tenant_id = 'tenant-001'
      AND bc.year = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY bc.id, bc.planned_amount
    HAVING COALESCE(SUM(be.amount), 0) > bc.planned_amount
) overspent;

-- ========================================
-- 10. СЛУЖЕБНЫЕ ЗАПРОСЫ
-- ========================================

-- 10.1. Проверка целостности данных - сироты в personnel
SELECT 
    'Сотрудники без физического лица' as issue,
    COUNT(*) as count
FROM personnel pers
LEFT JOIN person p ON pers.person_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Сотрудники без должности',
    COUNT(*)
FROM personnel pers
LEFT JOIN position pos ON pers.position_id = pos.id
WHERE pos.id IS NULL;

-- 10.2. Статистика по размеру таблиц
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- 10.3. Активность пользователей
SELECT 
    su.login,
    su.email,
    su.role,
    su.last_login,
    NOW() - su.last_login as inactive_period,
    su.status
FROM system_user su
WHERE su.tenant_id = 'tenant-001'
ORDER BY su.last_login DESC NULLS LAST;

-- ========================================
-- КОНЕЦ ФАЙЛА
-- ========================================
