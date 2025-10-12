# Справочник сущностей проекта

Документ содержит описание всех сущностей (типов данных), используемых в системе.

---

## 1. ПОЛЬЗОВАТЕЛИ И АУТЕНТИФИКАЦИЯ

### 1.1. User (Пользователь системы)
**Описание:** Базовая сущность пользователя для аутентификации и авторизации

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `email` (string) - Email адрес
- `name` (string) - Имя пользователя
- `role` (UserRole) - Роль: SuperAdmin | TenantAdmin | Auditor | Manager | Director | TrainingCenterManager
- `tenantId` (string?) - ID тенанта
- `availableModules` (ModuleType[]) - Доступные модули

### 1.2. SystemUser (Системный пользователь)
**Описание:** Расширенная информация о пользователе с учётными данными

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `personnelId` (string?) - Связь с персоналом
- `email` (string) - Email
- `login` (string) - Логин
- `passwordHash` (string) - Хеш пароля
- `role` (UserRole) - Роль пользователя
- `status` ('active' | 'inactive') - Статус аккаунта
- `lastLogin` (string?) - Дата последнего входа
- `organizationAccess` (string[]) - Список организаций с доступом
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

---

## 2. МУЛЬТИТЕНАНТНОСТЬ

### 2.1. Tenant (Тенант/Арендатор)
**Описание:** Организация-арендатор системы с собственными данными и модулями

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `name` (string) - Название организации
- `inn` (string) - ИНН
- `adminEmail` (string) - Email администратора
- `adminName` (string) - Имя администратора
- `status` ('active' | 'inactive') - Статус
- `modules` (ModuleType[]) - Подключённые модули
- `createdAt` (string) - Дата создания
- `expiresAt` (string) - Дата истечения подписки

---

## 3. ОРГАНИЗАЦИОННАЯ СТРУКТУРА

### 3.1. Organization (Организация)
**Описание:** Внутренняя организация тенанта (холдинг, юр.лицо, филиал)

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `name` (string) - Название
- `inn` (string) - ИНН
- `kpp` (string?) - КПП
- `address` (string?) - Адрес
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания

**Для модуля Catalog:**
- `type` ('holding' | 'legal_entity' | 'branch') - Тип организации
- `parentId` (string?) - ID родительской организации
- `children` (Organization[]?) - Дочерние организации
- `level` (number) - Уровень вложенности
- `contactPerson` (string?) - Контактное лицо
- `phone` (string?) - Телефон
- `email` (string?) - Email

### 3.2. ProductionSite (Производственная площадка)
**Описание:** Территориально обособленное подразделение организации

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `organizationId` (string) - ID организации
- `name` (string) - Название
- `address` (string) - Адрес
- `code` (string?) - Код площадки
- `head` (string?) - Руководитель
- `phone` (string?) - Телефон
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания

### 3.3. Department (Подразделение)
**Описание:** Структурное подразделение организации (отдел, цех)

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `organizationId` (string) - ID организации
- `parentId` (string?) - ID родительского подразделения
- `name` (string) - Название
- `code` (string?) - Код подразделения
- `head` (string?) - Руководитель
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания

---

## 4. ПЕРСОНАЛ

### 4.1. Person (Физическое лицо)
**Описание:** Базовая информация о физическом лице

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `lastName` (string) - Фамилия
- `firstName` (string) - Имя
- `middleName` (string?) - Отчество
- `birthDate` (string?) - Дата рождения
- `passportSeries` (string?) - Серия паспорта
- `passportNumber` (string?) - Номер паспорта
- `snils` (string?) - СНИЛС
- `inn` (string?) - ИНН
- `email` (string?) - Email
- `phone` (string?) - Телефон
- `address` (string?) - Адрес
- `educationLevel` ('higher' | 'secondary' | 'no_data'?) - Уровень образования
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 4.2. Position (Должность)
**Описание:** Справочник должностей

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `name` (string) - Название должности
- `code` (string?) - Код должности
- `category` ('management' | 'specialist' | 'worker' | 'other'?) - Категория
- `description` (string?) - Описание
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 4.3. Personnel (Сотрудник)
**Описание:** Связь физического лица с должностью и организацией

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `personId` (string) - ID физического лица
- `positionId` (string) - ID должности
- `organizationId` (string?) - ID организации
- `departmentId` (string?) - ID подразделения
- `personnelType` ('employee' | 'contractor') - Тип: штатный или подрядчик
- `role` ('Auditor' | 'Manager' | 'Director' | 'Contractor') - Роль
- `requiredCompetencies` (string[]?) - Необходимые компетенции
- `status` ('active' | 'dismissed') - Статус
- `hireDate` (string?) - Дата приёма
- `dismissalDate` (string?) - Дата увольнения
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

---

## 5. КОМПЕТЕНЦИИ И СЕРТИФИКАЦИЯ

### 5.1. Competency (Компетенция)
**Описание:** Область компетенции требующая подтверждения

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `code` (string) - Код компетенции
- `name` (string) - Название
- `category` ('industrial_safety' | 'labor_safety' | 'energy_safety' | 'ecology' | 'other') - Категория
- `validityMonths` (number) - Срок действия в месяцах
- `requiresRostechnadzor` (boolean?) - Требуется регистрация в Ростехнадзоре
- `description` (string?) - Описание
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 5.2. CertificationArea (Область аттестации)
**Описание:** Область аттестации по промышленной безопасности

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `code` (string) - Код области (А, Б, В и т.д.)
- `name` (string) - Название области
- `category` ('industrial_safety' | 'labor_safety' | 'energy_safety' | 'ecology') - Категория
- `validityMonths` (number) - Срок действия в месяцах
- `requiresRostechnadzor` (boolean) - Требуется Ростехнадзор

### 5.3. Certification (Сертификат)
**Описание:** Подтверждение компетенции сотрудника

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `personId` (string) - ID физического лица
- `competencyId` (string) - ID компетенции
- `issueDate` (string) - Дата выдачи
- `expiryDate` (string) - Дата истечения
- `protocolNumber` (string) - Номер протокола
- `issuedBy` (string?) - Кем выдан
- `status` ('valid' | 'expiring' | 'expired') - Статус
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

**Для модуля аттестации:**
- `employeeId` (string) - ID сотрудника
- `type` ('initial' | 'periodic' | 'extraordinary') - Тип аттестации
- `category` (string) - Категория
- `nextCertificationDate` (string?) - Дата следующей аттестации
- `result` ('passed' | 'failed' | 'pending') - Результат
- `certificateNumber` (string?) - Номер удостоверения
- `documentUrl` (string?) - Ссылка на документ
- `notes` (string?) - Примечания

### 5.4. CompetencyMatrix (Матрица компетенций)
**Описание:** Требуемые компетенции для должности в организации

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `organizationId` (string) - ID организации
- `positionId` (string) - ID должности
- `requiredAreas` (CompetencyAreaRequirement[]) - Требуемые области
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 5.5. CompetencyAreaRequirement (Требование по категории)
**Описание:** Список областей по категории безопасности

**Атрибуты:**
- `category` ('industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology') - Категория
- `areas` (string[]) - Массив ID областей компетенций

### 5.6. GapAnalysis (Анализ несоответствий)
**Описание:** Результат анализа компетенций сотрудника

**Атрибуты:**
- `employeeId` (string) - ID сотрудника
- `fullName` (string) - ФИО
- `position` (string) - Должность
- `organizationId` (string) - ID организации
- `organizationName` (string) - Название организации
- `requiredAreas` (CompetencyAreaRequirement[]) - Требуемые области
- `missingAreas` (CompetencyAreaRequirement[]) - Отсутствующие области
- `hasAllRequired` (boolean) - Все компетенции есть
- `completionRate` (number) - Процент соответствия
- `riskLevel` ('critical' | 'high' | 'medium' | 'low') - Уровень риска
- `lastChecked` (string) - Дата проверки

### 5.7. CompetencyGapReport (Отчёт по несоответствиям)
**Описание:** Сводный отчёт по компетенциям организации

**Атрибуты:**
- `totalPersonnel` (number) - Всего сотрудников
- `compliantPersonnel` (number) - Соответствуют требованиям
- `nonCompliantPersonnel` (number) - Не соответствуют
- `criticalGaps` (number) - Критичные несоответствия
- `highRiskGaps` (number) - Высокий риск
- `complianceRate` (number) - Процент соответствия
- `gaps` (GapAnalysis[]) - Детали по сотрудникам
- `byOrganization` - Статистика по организациям
- `byCategory` - Статистика по категориям

---

## 6. ОБУЧЕНИЕ

### 6.1. TrainingProgram (Программа обучения)
**Описание:** Учебная программа с параметрами

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `name` (string) - Название
- `code` (string) - Код программы
- `category` ('industrial_safety' | 'labor_safety' | 'energy_safety' | 'ecology' | 'professional' | 'other') - Категория
- `durationHours` (number) - Длительность в часах
- `validityMonths` (number) - Срок действия в месяцах
- `description` (string?) - Описание
- `competencyIds` (string[]) - Связанные компетенции
- `minStudents` (number) - Минимум студентов
- `maxStudents` (number) - Максимум студентов
- `cost` (number) - Стоимость
- `requiresExam` (boolean) - Требуется экзамен
- `status` ('active' | 'inactive' | 'archived') - Статус
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 6.2. TrainingGroup (Учебная группа)
**Описание:** Группа обучающихся по программе

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `programId` (string) - ID программы
- `name` (string) - Название группы
- `startDate` (string) - Дата начала
- `endDate` (string) - Дата окончания
- `schedule` (string) - Расписание
- `instructorId` (string?) - ID преподавателя
- `locationId` (string?) - ID места проведения
- `maxStudents` (number) - Максимум студентов
- `enrolledCount` (number) - Зачислено студентов
- `status` ('planned' | 'in_progress' | 'completed' | 'cancelled') - Статус
- `notes` (string?) - Примечания
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 6.3. TrainingEnrollment (Зачисление на обучение)
**Описание:** Связь студента с учебной группой

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `groupId` (string) - ID группы
- `studentId` (string) - ID студента
- `enrolledDate` (string) - Дата зачисления
- `status` ('enrolled' | 'in_progress' | 'completed' | 'failed' | 'cancelled') - Статус
- `attendanceRate` (number?) - Процент посещаемости
- `examScore` (number?) - Балл экзамена
- `certificateNumber` (string?) - Номер удостоверения
- `certificateIssueDate` (string?) - Дата выдачи удостоверения
- `notes` (string?) - Примечания
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 6.4. TrainingLocation (Место проведения)
**Описание:** Помещение для обучения

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `name` (string) - Название
- `address` (string) - Адрес
- `capacity` (number) - Вместимость
- `equipment` (string[]?) - Оборудование
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания

### 6.5. TrainingInstructor (Преподаватель)
**Описание:** Преподаватель учебного центра

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `personnelId` (string) - ID сотрудника
- `specializations` (string[]) - Специализации
- `certifications` (string[]) - Сертификаты
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания

### 6.6. TrainingScheduleEntry (Занятие)
**Описание:** Запись расписания группы

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `groupId` (string) - ID группы
- `date` (string) - Дата
- `startTime` (string) - Время начала
- `endTime` (string) - Время окончания
- `topic` (string) - Тема занятия
- `instructorId` (string?) - ID преподавателя
- `locationId` (string?) - ID места проведения
- `type` ('lecture' | 'practice' | 'exam') - Тип занятия
- `completed` (boolean) - Проведено

### 6.7. OrganizationTrainingRequest (Заявка на обучение)
**Описание:** Заявка от организации на обучение сотрудников

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта учебного центра
- `fromTenantId` (string?) - ID тенанта заявителя
- `fromTenantName` (string?) - Название организации заявителя
- `organizationId` (string) - ID организации
- `organizationName` (string) - Название организации
- `programId` (string) - ID программы
- `programName` (string) - Название программы
- `requestDate` (string) - Дата заявки
- `requestType` ('full_training' | 'sdo_access_only') - Тип заявки
- `studentsCount` (number) - Количество обучающихся
- `students` - Список студентов с ФИО, должностями
- `contactPerson` (string) - Контактное лицо
- `contactPhone` (string?) - Телефон
- `contactEmail` (string?) - Email
- `preferredStartDate` (string?) - Желаемая дата начала
- `status` ('new' | 'in_review' | 'approved' | 'rejected' | 'completed') - Статус
- `notes` (string?) - Примечания
- `reviewNotes` (string?) - Комментарии рассмотрения
- `orderId` (string?) - ID приказа
- `responseDocuments` (string[]?) - Документы ответа
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

---

## 7. ИНЦИДЕНТЫ И КОРРЕКТИРУЮЩИЕ ДЕЙСТВИЯ

### 7.1. Incident (Инцидент)
**Описание:** Несоответствие или происшествие требующее исправления

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `organizationId` (string) - ID организации
- `productionSiteId` (string) - ID производственной площадки
- `reportDate` (string) - Дата регистрации
- `sourceId` (string) - ID источника (справочник)
- `directionId` (string) - ID направления (справочник)
- `description` (string) - Описание
- `correctiveAction` (string) - Корректирующие действия
- `fundingTypeId` (string) - ID типа финансирования
- `categoryId` (string) - ID категории
- `subcategoryId` (string) - ID подкатегории
- `responsiblePersonnelId` (string) - ID ответственного
- `plannedDate` (string) - Плановая дата устранения
- `completedDate` (string?) - Фактическая дата устранения
- `daysLeft` (number) - Дней до срока
- `status` ('created' | 'in_progress' | 'awaiting' | 'overdue' | 'completed' | 'completed_late') - Статус
- `notes` (string?) - Примечания
- `comments` (string?) - Комментарии
- `sourceType` ('audit' | 'manual'?) - Тип источника
- `sourceAuditId` (string?) - ID аудита источника
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 7.2. IncidentSource (Источник выявления)
**Описание:** Справочник источников выявления инцидентов

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `name` (string) - Название источника
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания

### 7.3. IncidentDirection (Направление)
**Описание:** Справочник направлений деятельности

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `name` (string) - Название направления
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания

### 7.4. IncidentFundingType (Тип финансирования)
**Описание:** Справочник типов финансирования устранения

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `name` (string) - Название типа
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания

### 7.5. IncidentCategory (Категория инцидента)
**Описание:** Справочник категорий инцидентов

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `name` (string) - Название категории
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания

### 7.6. IncidentSubcategory (Подкатегория инцидента)
**Описание:** Справочник подкатегорий инцидентов

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `categoryId` (string) - ID категории
- `name` (string) - Название подкатегории
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания

---

## 8. ЧЕК-ЛИСТЫ И АУДИТЫ

### 8.1. Checklist (Чек-лист)
**Описание:** Шаблон проверочного листа

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `name` (string) - Название
- `category` (string) - Категория
- `items` (ChecklistItem[]) - Пункты проверки
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 8.2. ChecklistItem (Пункт чек-листа)
**Описание:** Вопрос/пункт для проверки

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `question` (string) - Текст вопроса
- `requiresComment` (boolean) - Требуется комментарий
- `criticalItem` (boolean) - Критический пункт

### 8.3. Audit (Аудит)
**Описание:** Проведённая проверка по чек-листу

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `checklistId` (string) - ID чек-листа
- `organizationId` (string) - ID организации
- `auditorId` (string) - ID аудитора
- `scheduledDate` (string) - Плановая дата
- `completedDate` (string?) - Дата завершения
- `status` ('scheduled' | 'in_progress' | 'completed') - Статус
- `findings` (AuditFinding[]) - Результаты проверки
- `auditorSignature` (string?) - Подпись аудитора

### 8.4. AuditFinding (Результат проверки пункта)
**Описание:** Ответ на пункт чек-листа

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `itemId` (string) - ID пункта чек-листа
- `result` ('pass' | 'fail' | 'n/a') - Результат: Пройдено | Не пройдено | Н/П
- `comment` (string?) - Комментарий
- `photo` (string?) - Фото

---

## 9. ЗАДАЧИ

### 9.1. Task (Задача)
**Описание:** Задача или поручение

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `title` (string) - Заголовок
- `description` (string?) - Описание
- `type` ('corrective_action' | 'maintenance' | 'audit' | 'other') - Тип задачи
- `priority` ('critical' | 'high' | 'medium' | 'low') - Приоритет
- `status` ('open' | 'in_progress' | 'completed' | 'cancelled') - Статус
- `assignedTo` (string) - ID назначенного
- `createdBy` (string) - ID создателя
- `dueDate` (string) - Срок выполнения
- `completedAt` (string?) - Дата завершения
- `sourceType` ('incident' | 'audit' | 'checklist'?) - Тип источника
- `sourceId` (string?) - ID источника
- `incidentId` (string?) - ID инцидента
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

---

## 10. БЮДЖЕТ

### 10.1. BudgetCategory (Категория бюджета)
**Описание:** Статья расходов

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `name` (string) - Название статьи
- `description` (string?) - Описание
- `plannedAmount` (number) - Плановая сумма
- `year` (number) - Год
- `color` (string?) - Цвет для графиков
- `status` ('active' | 'archived') - Статус
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 10.2. BudgetExpense (Расход)
**Описание:** Фактический расход

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `categoryId` (string) - ID категории
- `amount` (number) - Сумма
- `description` (string) - Описание
- `expenseDate` (string) - Дата расхода
- `documentNumber` (string?) - Номер документа
- `sourceType` ('manual' | 'incident'?) - Тип источника
- `sourceId` (string?) - ID источника
- `createdBy` (string) - ID создателя
- `organizationId` (string?) - ID организации
- `productionSiteId` (string?) - ID площадки
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 10.3. BudgetSummary (Сводка по бюджету)
**Описание:** Аналитика по статье расходов

**Атрибуты:**
- `categoryId` (string) - ID категории
- `categoryName` (string) - Название категории
- `plannedAmount` (number) - План
- `spentAmount` (number) - Факт
- `remainingAmount` (number) - Остаток
- `utilizationRate` (number) - Процент использования
- `expensesCount` (number) - Количество расходов

### 10.4. OrganizationBudgetPlan (Бюджет организации)
**Описание:** Бюджетный план организации на год

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `organizationId` (string) - ID организации
- `year` (number) - Год
- `totalPlannedAmount` (number) - Общая плановая сумма
- `status` ('draft' | 'approved' | 'archived') - Статус
- `approvedBy` (string?) - Кем утверждён
- `approvedAt` (string?) - Дата утверждения
- `categories` (OrganizationBudgetCategory[]) - Категории с суммами
- `createdBy` (string) - ID создателя
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 10.5. OrganizationBudgetCategory (Категория в плане)
**Описание:** Статья в бюджете организации

**Атрибуты:**
- `categoryId` (string) - ID категории
- `plannedAmount` (number) - Плановая сумма
- `description` (string?) - Описание

---

## 11. КАТАЛОГ ПРОМЫШЛЕННЫХ ОБЪЕКТОВ

### 11.1. IndustrialObject (Промышленный объект)
**Описание:** Опасный производственный объект, ГТС или здание

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `organizationId` (string) - ID организации
- `registrationNumber` (string) - Регистрационный номер
- `name` (string) - Название объекта
- `type` ('opo' | 'gts' | 'building') - Тип: ОПО | ГТС | Здание
- `category` (string?) - Категория объекта
- `hazardClass` ('I' | 'II' | 'III' | 'IV'?) - Класс опасности
- `commissioningDate` (string) - Дата ввода в эксплуатацию
- `status` ('active' | 'conservation' | 'liquidated') - Статус
- `location` - Объект с адресом и координатами
- `responsiblePerson` (string) - ФИО ответственного
- `responsiblePersonId` (string?) - ID ответственного
- `nextExpertiseDate` (string?) - Дата следующей экспертизы
- `nextDiagnosticDate` (string?) - Дата диагностики
- `nextTestDate` (string?) - Дата испытаний
- `description` (string?) - Описание
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

### 11.2. ObjectDocument (Документ объекта)
**Описание:** Документ промышленного объекта

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `objectId` (string) - ID объекта
- `title` (string) - Название документа
- `type` ('passport' | 'scheme' | 'permit' | 'protocol' | 'certificate' | 'other') - Тип
- `documentNumber` (string?) - Номер документа
- `issueDate` (string) - Дата выдачи
- `expiryDate` (string?) - Дата истечения
- `fileUrl` (string?) - Ссылка на файл
- `fileName` (string?) - Имя файла
- `fileSize` (number?) - Размер файла
- `status` ('valid' | 'expiring_soon' | 'expired') - Статус
- `createdAt` (string) - Дата создания
- `uploadedBy` (string?) - Кем загружен

---

## 12. ТЕХНИЧЕСКОЕ ОБСЛУЖИВАНИЕ

### 12.1. Equipment (Оборудование)
**Описание:** Единица оборудования требующая обслуживания

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `organizationId` (string) - ID организации
- `name` (string) - Название оборудования
- `type` (string) - Тип оборудования
- `manufacturer` (string?) - Производитель
- `serialNumber` (string?) - Серийный номер
- `commissionDate` (string?) - Дата ввода в эксплуатацию
- `status` ('operational' | 'maintenance' | 'repair' | 'decommissioned') - Статус
- `nextMaintenanceDate` (string?) - Дата следующего ТО
- `nextExaminationDate` (string?) - Дата следующего освидетельствования

### 12.2. Examination (Освидетельствование)
**Описание:** Техническое освидетельствование оборудования

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `equipmentId` (string) - ID оборудования
- `type` ('periodic' | 'extraordinary' | 'commissioning') - Тип
- `scheduledDate` (string) - Плановая дата
- `completedDate` (string?) - Дата проведения
- `performedBy` (string?) - Кем проведено
- `result` ('passed' | 'failed' | 'conditional') - Результат
- `defects` (Defect[]) - Выявленные дефекты
- `protocolNumber` (string?) - Номер протокола

### 12.3. Defect (Дефект)
**Описание:** Выявленный дефект оборудования

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `description` (string) - Описание дефекта
- `severity` ('critical' | 'major' | 'minor') - Серьёзность
- `status` ('open' | 'fixed' | 'deferred') - Статус

### 12.4. MaintenanceRecord (Запись ТО)
**Описание:** Запись о проведённом техническом обслуживании

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `equipmentId` (string) - ID оборудования
- `type` ('preventive' | 'corrective' | 'emergency') - Тип ТО
- `scheduledDate` (string) - Плановая дата
- `completedDate` (string?) - Дата выполнения
- `performedBy` (string?) - Кем выполнено
- `workDescription` (string) - Описание работ
- `partsUsed` (string?) - Использованные запчасти
- `cost` (number?) - Стоимость
- `nextMaintenanceDate` (string?) - Дата следующего ТО

---

## 13. ВНЕШНИЕ ОРГАНИЗАЦИИ

### 13.1. ExternalOrganization (Внешняя организация)
**Описание:** Контрагент или партнёр

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `type` ('training_center' | 'contractor' | 'supplier' | 'regulatory_body' | 'certification_body' | 'other') - Тип
- `name` (string) - Название
- `inn` (string?) - ИНН
- `kpp` (string?) - КПП
- `contactPerson` (string?) - Контактное лицо
- `phone` (string?) - Телефон
- `email` (string?) - Email
- `address` (string?) - Адрес
- `website` (string?) - Веб-сайт
- `accreditations` (string[]?) - Аккредитации
- `description` (string?) - Описание
- `status` ('active' | 'inactive') - Статус
- `createdAt` (string) - Дата создания

### 13.2. OrganizationContractor (Подрядчик организации)
**Описание:** Связь организации с подрядчиком

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `contractorTenantId` (string?) - ID тенанта подрядчика
- `contractorExternalOrgId` (string?) - ID внешней организации
- `contractorName` (string) - Название подрядчика
- `contractorInn` (string?) - ИНН подрядчика
- `type` ('training_center' | 'contractor' | 'supplier') - Тип подрядчика
- `services` ('full_training' | 'sdo_access_only' | 'certification' | 'consulting'[]) - Услуги
- `contractNumber` (string?) - Номер договора
- `contractDate` (string?) - Дата договора
- `contractExpiryDate` (string?) - Дата окончания договора
- `contactPerson` (string?) - Контактное лицо
- `contactPhone` (string?) - Телефон
- `contactEmail` (string?) - Email
- `status` ('active' | 'suspended' | 'terminated') - Статус
- `notes` (string?) - Примечания
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления

---

## 14. МЕЖОРГАНИЗАЦИОННЫЙ ОБМЕН

### 14.1. InterOrgDocument (Межорганизационный документ)
**Описание:** Документ для обмена между тенантами

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `fromTenantId` (string) - ID тенанта отправителя
- `fromTenantName` (string) - Название отправителя
- `toTenantId` (string) - ID тенанта получателя
- `toTenantName` (string) - Название получателя
- `documentType` ('training_request' | 'certificate' | 'sdo_access' | 'invoice' | 'contract' | 'report') - Тип документа
- `sourceId` (string?) - ID источника (заявка, сертификат и т.д.)
- `title` (string) - Заголовок
- `description` (string?) - Описание
- `fileName` (string?) - Имя файла
- `fileUrl` (string?) - Ссылка на файл
- `fileSize` (number?) - Размер файла
- `status` ('sent' | 'received' | 'processed' | 'rejected') - Статус
- `metadata` (Record<string, any>?) - Дополнительные данные
- `sentAt` (string) - Дата отправки
- `receivedAt` (string?) - Дата получения
- `processedAt` (string?) - Дата обработки
- `processedBy` (string?) - Кем обработан
- `notes` (string?) - Примечания

---

## 15. УВЕДОМЛЕНИЯ

### 15.1. Notification (Уведомление)
**Описание:** Системное уведомление пользователя

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `userId` (string?) - ID пользователя (если персональное)
- `type` ('critical' | 'warning' | 'info' | 'success') - Тип
- `source` ('incident' | 'certification' | 'task' | 'audit' | 'system' | 'platform_news' | 'attestation' | 'catalog') - Источник
- `sourceId` (string?) - ID источника
- `title` (string) - Заголовок
- `message` (string) - Текст сообщения
- `link` (string?) - Ссылка для перехода
- `isRead` (boolean) - Прочитано
- `createdAt` (string) - Дата создания

---

## 16. БАЗА ЗНАНИЙ

### 16.1. KnowledgeDocument (Документ базы знаний)
**Описание:** Документ или инструкция в базе знаний

**Атрибуты:**
- `id` (string) - Уникальный идентификатор
- `tenantId` (string) - ID тенанта
- `category` ('user_guide' | 'regulatory' | 'organization') - Категория
- `title` (string) - Заголовок
- `description` (string?) - Описание
- `content` (string?) - Текстовое содержимое
- `fileUrl` (string?) - Ссылка на файл
- `fileName` (string?) - Имя файла
- `fileSize` (number?) - Размер файла
- `tags` (string[]?) - Теги
- `version` (string?) - Версия документа
- `author` (string) - Автор
- `status` ('draft' | 'published' | 'archived') - Статус
- `viewsCount` (number) - Количество просмотров
- `downloadsCount` (number) - Количество скачиваний
- `versions` (DocumentVersion[]?) - История версий
- `createdAt` (string) - Дата создания
- `updatedAt` (string) - Дата обновления
- `publishedAt` (string?) - Дата публикации

### 16.2. DocumentVersion (Версия документа)
**Описание:** Версия документа с историей изменений

**Атрибуты:**
- `versionNumber` (string) - Номер версии
- `createdAt` (string) - Дата создания версии
- `createdBy` (string) - Кем создана
- `changeDescription` (string?) - Описание изменений
- `content` (string?) - Содержимое
- `fileName` (string?) - Имя файла
- `fileSize` (number?) - Размер файла
- `fileUrl` (string?) - Ссылка на файл

---

## 17. ДАШБОРД И СТАТИСТИКА

### 17.1. DashboardStats (Статистика дашборда)
**Описание:** Основные метрики для главной страницы

**Атрибуты:**
- `totalEmployees` (number) - Всего сотрудников
- `activeCertifications` (number) - Действующих сертификатов
- `expiringCertifications` (number) - Истекающих сертификатов
- `overdueIncidents` (number) - Просроченных инцидентов
- `upcomingTasks` (number) - Предстоящих задач
- `budgetUtilization` (number) - Использование бюджета (%)

### 17.2. AttestationStats (Статистика аттестации)
**Описание:** Метрики модуля аттестации

**Атрибуты:**
- `totalEmployees` (number) - Всего сотрудников
- `validCertifications` (number) - Действующих сертификатов
- `expiringSoon` (number) - Истекают скоро
- `expired` (number) - Истекших
- `upcomingCertifications` (number) - Предстоящих аттестаций

---

## ИТОГО: 69 основных сущностей

Система построена на принципах:
- **Мультитенантность** - изоляция данных между организациями
- **Иерархия организаций** - холдинги, юр.лица, филиалы, подразделения
- **Компетентностный подход** - матрицы компетенций и gap-анализ
- **Полный жизненный цикл** - от планирования до отчётности
- **Интеграция модулей** - данные связаны между модулями
- **Аудит и контроль** - история изменений и статусы

Все сущности содержат:
- Уникальные идентификаторы (id)
- Привязку к тенанту (tenantId)
- Временные метки (createdAt, updatedAt)
- Статусы для управления жизненным циклом
