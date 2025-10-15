# 💾 База данных системы "Индекс Безопасности"

> Схема БД, миграции, таблицы и запросы

---

## 📋 Содержание

1. [Обзор](#обзор)
2. [Миграции](#миграции)
3. [Схема БД](#схема-бд)
4. [Таблицы](#таблицы)
5. [Связи между таблицами](#связи-между-таблицами)
6. [Полезные запросы](#полезные-запросы)

---

## 📖 Обзор

### Технология
- **СУБД:** PostgreSQL 14+
- **Миграции:** Flyway
- **Расположение миграций:** `db_migrations/`

### Принципы
- **Нумерация миграций:** V0001, V0002, V0003, ...
- **Именование:** `V{номер}__{описание}.sql`
- **Forward-only:** Миграции только вперед, без rollback
- **Атомарность:** Каждая миграция выполняется транзакцией

### Количество миграций
**Текущих:** 2 миграции  
**Таблиц:** 8 (6 основных + 2 служебные)

---

## 🔄 Миграции

### V0001: Система пользователей

**Файл:** `db_migrations/V0001__create_system_users_tables.sql`  
**Дата:** Первоначальная миграция  
**Назначение:** Создание таблиц для аутентификации и мультитенантности

#### Таблицы (2):

##### 1. `system_users`
**Назначение:** Пользователи системы с логинами и паролями

```sql
CREATE TABLE system_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,  -- SuperAdmin, TenantAdmin, Auditor, Manager, Director, TrainingCenterManager
  tenant_id UUID,              -- Ссылка на организацию (NULL для SuperAdmin)
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

**Индексы:**
- `email` (UNIQUE)
- `tenant_id`
- `role`

##### 2. `user_organization_access`
**Назначение:** Доступ пользователей к организациям (для мультитенантности)

```sql
CREATE TABLE user_organization_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES system_users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL,  -- Роль пользователя в этой организации
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID REFERENCES system_users(id)
);
```

**Индексы:**
- `user_id`
- `organization_id`

---

### V0002: Подрядчики

**Файл:** `db_migrations/V0002__create_contractors_tables.sql`  
**Дата:** Вторая миграция  
**Назначение:** Модуль управления подрядными организациями и персоналом

#### Таблицы (6):

##### 1. `contractors`
**Назначение:** Реестр подрядных организаций

```sql
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,                   -- Изоляция по тенантам
  name VARCHAR(255) NOT NULL,                -- Название организации
  inn VARCHAR(12) NOT NULL,                  -- ИНН
  kpp VARCHAR(9),                            -- КПП
  ogrn VARCHAR(15),                          -- ОГРН
  legal_address TEXT,                        -- Юридический адрес
  actual_address TEXT,                       -- Фактический адрес
  
  -- Контакты
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Договорная информация
  contract_number VARCHAR(100),
  contract_date DATE,
  contract_expiry DATE,
  
  -- Лицензии и допуски
  sro_name VARCHAR(255),                     -- СРО (саморегулируемая организация)
  sro_number VARCHAR(100),
  sro_expiry DATE,
  insurance_policy VARCHAR(100),             -- Страховой полис
  insurance_expiry DATE,
  
  -- Рейтинг и статистика
  rating DECIMAL(3,2) DEFAULT 0.00,          -- Рейтинг 0.00-5.00
  total_works_count INTEGER DEFAULT 0,       -- Количество выполненных работ
  violations_count INTEGER DEFAULT 0,        -- Количество нарушений
  
  -- Метаданные
  status VARCHAR(50) DEFAULT 'active',       -- active, suspended, terminated
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES system_users(id)
);
```

**Индексы:**
- `tenant_id` (для изоляции данных)
- `inn` (для быстрого поиска)
- `status`

##### 2. `contractor_employees`
**Назначение:** Персонал подрядчиков

```sql
CREATE TABLE contractor_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  
  -- Персональные данные
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  birth_date DATE,
  
  -- Документы
  passport_series VARCHAR(10),
  passport_number VARCHAR(20),
  passport_issued_by TEXT,
  passport_issued_date DATE,
  snils VARCHAR(14),                         -- СНИЛС
  
  -- Контакты
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Должность
  position VARCHAR(255),
  hire_date DATE,
  
  -- Медицинские данные
  medical_examination_date DATE,             -- Дата медосмотра
  medical_examination_expiry DATE,           -- Срок действия медосмотра
  
  -- Обучения
  safety_training_date DATE,                 -- Дата обучения по ПБ
  safety_training_expiry DATE,
  
  -- Фото
  photo_url TEXT,                            -- Ссылка на фотографию
  
  -- Метаданные
  status VARCHAR(50) DEFAULT 'active',       -- active, suspended, dismissed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Индексы:**
- `contractor_id`
- `status`
- `medical_examination_expiry` (для напоминаний)
- `safety_training_expiry` (для напоминаний)

##### 3. `contractor_employee_attestations`
**Назначение:** Аттестации сотрудников подрядчиков

```sql
CREATE TABLE contractor_employee_attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES contractor_employees(id) ON DELETE CASCADE,
  
  -- Тип аттестации
  attestation_type VARCHAR(50) NOT NULL,     -- ПБ, ЭБ, ОТ, ЭК
  attestation_area VARCHAR(100) NOT NULL,    -- Область аттестации (Б.7.1, ПБ-1, и т.д.)
  
  -- Документ
  certificate_number VARCHAR(100),
  certificate_date DATE,
  certificate_expiry DATE,
  issued_by VARCHAR(255),                    -- Кем выдан (организация)
  
  -- Статус
  status VARCHAR(50) DEFAULT 'valid',        -- valid, expired, revoked
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Индексы:**
- `employee_id`
- `certificate_expiry` (для напоминаний)
- `status`

**Поддерживаемые области аттестации (32):**
- Б.7.1 - Б.7.32 (промышленная безопасность)
- ПБ-1 - ПБ-10 (пожарная безопасность)
- ОТ-1 - ОТ-12 (охрана труда)

##### 4. `contractor_employee_objects`
**Назначение:** Доступ сотрудников к объектам

```sql
CREATE TABLE contractor_employee_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES contractor_employees(id) ON DELETE CASCADE,
  object_id UUID NOT NULL,                   -- Ссылка на industrial_objects
  
  -- Права доступа
  access_granted BOOLEAN DEFAULT false,      -- Автоматическая проверка допусков
  granted_date DATE,
  expiry_date DATE,
  
  -- Компетенции
  required_competencies TEXT[],              -- Массив требуемых компетенций
  actual_competencies TEXT[],                -- Массив фактических компетенций
  
  -- Ограничения
  restricted_areas TEXT[],                   -- Зоны с ограниченным доступом
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Индексы:**
- `employee_id`
- `object_id`
- `expiry_date`

##### 5. `contractor_access_log`
**Назначение:** Журнал посещений объектов

```sql
CREATE TABLE contractor_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES contractor_employees(id),
  object_id UUID NOT NULL,
  
  -- Время посещения
  entry_time TIMESTAMP NOT NULL,
  exit_time TIMESTAMP,
  duration_minutes INTEGER,                  -- Длительность (автоматически)
  
  -- Цель визита
  purpose VARCHAR(255),                      -- Цель посещения
  accompanied_by UUID REFERENCES system_users(id),  -- Сопровождающий
  
  -- Безопасность
  safety_briefing_conducted BOOLEAN DEFAULT false,  -- Инструктаж проведен
  ppe_issued TEXT[],                        -- Выданные СИЗ (средства защиты)
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Индексы:**
- `employee_id`
- `object_id`
- `entry_time`

##### 6. `contractor_work_history`
**Назначение:** История работ для рейтингов

```sql
CREATE TABLE contractor_work_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  object_id UUID NOT NULL,
  
  -- Работа
  work_type VARCHAR(100),                    -- Тип работы
  description TEXT,
  start_date DATE,
  end_date DATE,
  
  -- Оценка
  quality_rating DECIMAL(3,2),               -- Оценка качества 0.00-5.00
  safety_rating DECIMAL(3,2),                -- Оценка безопасности 0.00-5.00
  timeliness_rating DECIMAL(3,2),            -- Оценка своевременности 0.00-5.00
  
  -- Нарушения
  violations_count INTEGER DEFAULT 0,
  violations_description TEXT,
  
  -- Стоимость
  cost DECIMAL(15,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES system_users(id)
);
```

**Индексы:**
- `contractor_id`
- `object_id`
- `end_date`

---

## 🗂️ Схема БД

### Диаграмма связей (ER-диаграмма)

```
system_users
  ├─ 1:N → user_organization_access
  ├─ 1:N → contractors (created_by)
  ├─ 1:N → contractor_access_log (accompanied_by)
  └─ 1:N → contractor_work_history (created_by)

contractors
  ├─ 1:N → contractor_employees
  └─ 1:N → contractor_work_history

contractor_employees
  ├─ 1:N → contractor_employee_attestations
  ├─ 1:N → contractor_employee_objects
  └─ 1:N → contractor_access_log

industrial_objects (внешняя таблица)
  ├─ 1:N → contractor_employee_objects
  ├─ 1:N → contractor_access_log
  └─ 1:N → contractor_work_history
```

---

## 🔗 Связи между таблицами

### Типы связей

1. **One-to-Many (1:N)**
   - Один подрядчик → много сотрудников
   - Один сотрудник → много аттестаций
   - Один объект → много посещений

2. **Many-to-Many (N:M)**
   - Сотрудники ↔ Объекты (через `contractor_employee_objects`)

3. **Cascade Delete**
   - При удалении подрядчика удаляются все его сотрудники
   - При удалении сотрудника удаляются все его аттестации

---

## 🔍 Полезные запросы

### 1. Список подрядчиков с количеством сотрудников

```sql
SELECT 
  c.id,
  c.name,
  c.inn,
  c.rating,
  COUNT(ce.id) as employees_count,
  c.status
FROM contractors c
LEFT JOIN contractor_employees ce ON c.id = ce.contractor_id
WHERE c.tenant_id = 'YOUR_TENANT_ID'
GROUP BY c.id
ORDER BY c.rating DESC;
```

### 2. Истекающие аттестации (следующие 30 дней)

```sql
SELECT 
  ce.first_name,
  ce.last_name,
  c.name as contractor_name,
  cea.attestation_type,
  cea.attestation_area,
  cea.certificate_expiry,
  (cea.certificate_expiry - CURRENT_DATE) as days_remaining
FROM contractor_employee_attestations cea
JOIN contractor_employees ce ON cea.employee_id = ce.id
JOIN contractors c ON ce.contractor_id = c.id
WHERE cea.certificate_expiry BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND cea.status = 'valid'
  AND c.tenant_id = 'YOUR_TENANT_ID'
ORDER BY cea.certificate_expiry ASC;
```

### 3. Топ-5 подрядчиков по рейтингу

```sql
SELECT 
  name,
  rating,
  total_works_count,
  violations_count,
  (violations_count::float / NULLIF(total_works_count, 0) * 100) as violation_percentage
FROM contractors
WHERE tenant_id = 'YOUR_TENANT_ID'
  AND status = 'active'
ORDER BY rating DESC
LIMIT 5;
```

### 4. Сотрудники с просроченными медосмотрами

```sql
SELECT 
  ce.first_name,
  ce.last_name,
  c.name as contractor_name,
  ce.medical_examination_expiry,
  (CURRENT_DATE - ce.medical_examination_expiry) as days_overdue
FROM contractor_employees ce
JOIN contractors c ON ce.contractor_id = c.id
WHERE ce.medical_examination_expiry < CURRENT_DATE
  AND ce.status = 'active'
  AND c.tenant_id = 'YOUR_TENANT_ID'
ORDER BY ce.medical_examination_expiry ASC;
```

### 5. Статистика посещений объекта за месяц

```sql
SELECT 
  DATE(cal.entry_time) as visit_date,
  COUNT(*) as visits_count,
  SUM(cal.duration_minutes) as total_minutes,
  COUNT(DISTINCT cal.employee_id) as unique_employees
FROM contractor_access_log cal
WHERE cal.object_id = 'YOUR_OBJECT_ID'
  AND cal.entry_time >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE(cal.entry_time)
ORDER BY visit_date DESC;
```

### 6. Автоматический расчет рейтинга подрядчика

```sql
UPDATE contractors c
SET rating = (
  SELECT AVG((cwh.quality_rating + cwh.safety_rating + cwh.timeliness_rating) / 3)
  FROM contractor_work_history cwh
  WHERE cwh.contractor_id = c.id
)
WHERE c.id = 'CONTRACTOR_ID';
```

---

## 🔐 Безопасность данных

### Row-Level Security (RLS)

**Принцип:** Пользователь видит только данные своего тенанта.

```sql
-- Включить RLS для таблицы
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;

-- Политика: пользователь видит только своих подрядчиков
CREATE POLICY tenant_isolation ON contractors
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## 📊 Индексы для производительности

### Критичные индексы

```sql
-- Быстрый поиск по ИНН
CREATE INDEX idx_contractors_inn ON contractors(inn);

-- Фильтрация по статусу
CREATE INDEX idx_contractors_status ON contractors(status);

-- Изоляция по тенантам
CREATE INDEX idx_contractors_tenant ON contractors(tenant_id);

-- Поиск истекающих аттестаций
CREATE INDEX idx_attestations_expiry ON contractor_employee_attestations(certificate_expiry);

-- Журнал посещений
CREATE INDEX idx_access_log_entry ON contractor_access_log(entry_time);
```

---

## 🧪 Тестовые данные

**Файл:** `docs/SAMPLE_DATA.sql`

Содержит готовые данные для разработки:
- 3 подрядчика
- 10 сотрудников
- 15 аттестаций
- 5 объектов
- 20 записей в журнале посещений

---

## 📈 Статистика БД

- **Таблиц:** 8
- **Индексов:** ~20
- **Связей (FK):** 12
- **Триггеров:** 0 (пока не используются)
- **Представлений (Views):** 0 (пока не используются)

---

## 🔄 Планируемые миграции

### V0003: Модуль Задачи (планируется)
- `tasks` - задачи
- `task_assignments` - назначения
- `task_comments` - комментарии

### V0004: Модуль Инциденты (планируется)
- `incidents` - инциденты
- `incident_investigations` - расследования
- `incident_documents` - документы

---

**Версия:** 1.0  
**Дата:** 2025-10-16
