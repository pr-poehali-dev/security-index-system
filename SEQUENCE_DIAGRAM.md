# Диаграммы последовательности взаимодействий

## Оглавление
1. [Полный цикл обучения с автоматической интеграцией](#полный-цикл-обучения-с-автоматической-интеграцией)
2. [Создание и согласование приказа](#создание-и-согласование-приказа)
3. [Добавление контрагента с валидацией ID](#добавление-контрагента-с-валидацией-id)
4. [Отправка заявки в учебный центр](#отправка-заявки-в-учебный-центр)
5. [Обработка заявки учебным центром](#обработка-заявки-учебным-центром)
6. [Проведение обучения и выпуск сертификатов](#проведение-обучения-и-выпуск-сертификатов)
7. [Синхронизация сертификатов между организациями](#синхронизация-сертификатов-между-организациями)
8. [Мониторинг истечения сертификатов](#мониторинг-истечения-сертификатов)
9. [Процесс предоставления доступа к СДО](#процесс-предоставления-доступа-к-сдо)
10. [Взаимодействие пользователей с разными ролями](#взаимодействие-пользователей-с-разными-ролями)

---

## Полный цикл обучения с автоматической интеграцией

```mermaid
sequenceDiagram
    participant HRM as HRManager (Производство)
    participant SE as SafetyEngineer (Производство)
    participant AS as attestationStore
    participant SS as settingsStore
    participant OS as ordersStore
    participant TCS as trainingCenterStore
    participant TCM as TrainingCenterManager (УЦ)

    Note over HRM,TCM: Этап 1: Подготовка и отправка заявки
    
    HRM->>AS: createEmployee(employeeData)
    AS-->>HRM: Employee created
    
    HRM->>OS: createOrder(orderData)
    OS-->>HRM: Order created (status: draft)
    
    HRM->>OS: addEmployeesToOrder(orderId, employeeIds)
    OS-->>HRM: Employees added
    
    SE->>OS: approveOrder(orderId)
    OS-->>SE: Order approved (status: approved)
    
    HRM->>SS: getContractorsByTenant(tenantId)
    SS-->>HRM: List of contractors
    
    HRM->>OS: sendOrderToTrainingCenter(orderId, contractorId, 'full_training')
    OS->>SS: getContractor(contractorId)
    SS-->>OS: Contractor data (with contractorTenantId)
    
    alt Автоматическая интеграция
        OS->>TCS: createRequest(requestData)
        Note over TCS: Request created in TC's store<br/>fromTenantId = production tenantId
        TCS-->>OS: Request created
        OS->>OS: Update order.trainingCenterRequestId
        OS-->>HRM: Request sent successfully
    else Ручная интеграция
        OS-->>HRM: Manual integration required
    end
    
    Note over HRM,TCM: Этап 2: Обработка заявки учебным центром
    
    TCM->>TCS: getRequestsByTenant(tcTenantId)
    TCS-->>TCM: List of requests (including new one)
    
    TCM->>TCS: approveRequest(requestId, groupId?)
    TCS->>TCS: Update status to 'approved'
    TCS-->>TCM: Request approved
    
    Note over HRM,TCM: Этап 3: Проведение обучения
    
    TCM->>TCS: createGroup(groupData)
    TCS-->>TCM: Group created (status: набор)
    
    TCM->>TCS: addStudentsToGroup(groupId, students)
    TCS-->>TCM: Students added
    
    TCM->>TCS: startTraining(groupId)
    TCS->>TCS: Update status to 'обучение'
    TCS-->>TCM: Training started
    
    Note over TCM: Проведение занятий...
    
    TCM->>TCS: completeTraining(groupId)
    TCS->>TCS: Update status to 'завершена'
    TCS-->>TCM: Training completed
    
    Note over HRM,TCM: Этап 4: Выпуск и передача сертификатов
    
    TCM->>TCS: issueCertificate(certificateData)
    TCS-->>TCM: Certificate issued (status: issued)
    
    TCM->>TCS: completeRequest(requestId)
    TCS->>TCS: syncCertificateToAttestation(requestId)
    
    loop Для каждого обучаемого
        TCS->>AS: createCertificate(fromTenantId, employeeId, certData)
        AS->>AS: Create certificate (status: synced)
        AS->>AS: Store files (удостоверение, протокол)
        AS-->>TCS: Certificate synced
    end
    
    TCS->>TCS: Update request status to 'completed'
    TCS-->>TCM: Request completed
    
    Note over HRM,TCM: Этап 5: Получение результатов
    
    HRM->>AS: getCertificatesByTenant(tenantId)
    AS-->>HRM: List of certificates (including new ones)
    
    HRM->>HRM: Download certificate files
    
    Note over HRM,TCM: Процесс завершен успешно
```

---

## Создание и согласование приказа

```mermaid
sequenceDiagram
    participant HRM as HRManager
    participant UI as UI (OrdersTab)
    participant OS as ordersStore
    participant AS as attestationStore
    participant SE as SafetyEngineer

    HRM->>UI: Click "Новый приказ"
    UI->>UI: Open CreateOrderDialog
    
    HRM->>UI: Fill order data
    Note over HRM,UI: - Тип обучения<br/>- Номер приказа<br/>- Дата приказа<br/>- Предпочтительная дата начала
    
    HRM->>UI: Click "Создать приказ"
    UI->>OS: createOrder(orderData)
    
    OS->>OS: Generate orderId
    OS->>OS: Set status = 'draft'
    OS->>OS: Set tenantId = user.tenantId
    OS-->>UI: Order created
    
    UI-->>HRM: Show success toast
    UI->>UI: Close dialog
    UI->>UI: Display order in table
    
    Note over HRM: Добавление сотрудников
    
    HRM->>UI: Open order details
    UI->>UI: Show AddEmployeesDialog
    
    HRM->>AS: Get employees by tenant
    AS-->>UI: List of employees
    
    HRM->>UI: Select employees (checkboxes)
    HRM->>UI: Click "Добавить выбранных"
    
    UI->>OS: addEmployeesToOrder(orderId, employeeIds)
    OS->>OS: Add employees to order.employees[]
    OS-->>UI: Employees added
    
    UI-->>HRM: Show success toast
    UI->>UI: Update order display
    
    Note over SE: Согласование приказа
    
    SE->>UI: Open order details
    UI->>UI: Show "Согласовать приказ" button
    Note over UI: Доступно только для SafetyEngineer<br/>и только если status = 'draft'
    
    SE->>UI: Click "Согласовать приказ"
    UI->>UI: Show confirmation dialog
    
    SE->>UI: Confirm
    UI->>OS: approveOrder(orderId)
    
    OS->>OS: Update status = 'approved'
    OS->>OS: Set approvedAt = Date.now()
    OS-->>UI: Order approved
    
    UI-->>SE: Show success toast
    UI->>UI: Update order status badge
    UI->>UI: Show "Учебный центр" button
    
    Note over SE: Приказ готов к отправке в УЦ
```

---

## Добавление контрагента с валидацией ID

```mermaid
sequenceDiagram
    participant TA as TenantAdmin
    participant UI as ContractorDialog
    participant SS as settingsStore
    participant API as Mock Tenants API
    participant Toast as Toast Notification

    TA->>UI: Click "Добавить контрагента"
    UI->>UI: Open dialog
    
    TA->>UI: Select type = "training_center"
    
    TA->>UI: Enter contractorTenantId
    Note over TA,UI: Например: "tenant-training-center-001"
    
    UI->>UI: useEffect triggered
    UI->>UI: Set isValidatingTenant = true
    UI->>UI: Show loading spinner
    
    UI->>UI: Check if tenantId == user.tenantId
    
    alt ID совпадает со своим
        UI->>UI: setTenantValidationError("Нельзя указать свою организацию")
        UI->>UI: Show red border + cross icon
        UI-->>TA: Validation failed
    else ID другой организации
        UI->>API: fetchTenant(tenantId)
        Note over API: Имитация API запроса<br/>Ожидание 500ms
        
        alt Организация не найдена
            API-->>UI: null
            UI->>UI: setTenantValidationError("Организация не найдена")
            UI->>UI: Show red border + cross icon
            UI-->>TA: Validation failed
        else Организация найдена
            API-->>UI: Tenant data
            
            alt Для training_center: нет модуля
                UI->>UI: setTenantValidationError("Не является УЦ")
                UI->>UI: Show red border + cross icon
                UI-->>TA: Validation failed
            else Валидация успешна
                UI->>UI: setValidatedTenantInfo(tenant)
                UI->>UI: Show green border + check icon
                UI->>UI: setValue('contractorName', tenant.name)
                UI->>UI: setValue('contractorInn', tenant.inn)
                UI-->>TA: Display: "Найдена: [Название] (ИНН: [ИНН])"
            end
        end
    end
    
    UI->>UI: Set isValidatingTenant = false
    UI->>UI: Hide loading spinner
    
    Note over TA: Заполнение остальных полей
    
    TA->>UI: Fill services (checkboxes)
    TA->>UI: Fill contract data
    TA->>UI: Fill contact info
    
    TA->>UI: Click "Добавить"
    UI->>UI: Validate form
    
    alt Есть ошибка валидации tenantId
        UI->>Toast: Show error toast
        Toast-->>TA: "Исправьте ошибки валидации ID"
    else Форма валидна
        UI->>SS: addContractor(contractorData)
        
        SS->>SS: Generate contractorId
        SS->>SS: Store contractor with contractorTenantId
        SS-->>UI: Contractor added
        
        UI->>Toast: Show success toast
        Toast-->>TA: "Контрагент добавлен"
        
        UI->>UI: Close dialog
        UI->>UI: Display in table with badge "В системе"
    end
```

---

## Отправка заявки в учебный центр

```mermaid
sequenceDiagram
    participant HRM as HRManager
    participant UI as SendToTCDialog
    participant OS as ordersStore
    participant SS as settingsStore
    participant TCS as trainingCenterStore (УЦ)
    participant Toast as Toast Notification

    HRM->>UI: Click "Учебный центр" on approved order
    UI->>UI: Open dialog
    
    UI->>SS: getContractorsByTenant(tenantId)
    SS-->>UI: List of contractors
    
    UI->>UI: Filter type = 'training_center', status = 'active'
    UI-->>HRM: Display available training centers
    
    HRM->>UI: Select training center
    UI->>UI: Display contractor info
    
    alt contractorTenantId указан
        UI->>UI: Show badge "В системе"
        UI->>UI: Show info: "Заявка будет передана автоматически"
    else contractorTenantId отсутствует
        UI->>UI: Show warning: "Потребуется ручная передача данных"
    end
    
    HRM->>UI: Select requestType
    Note over HRM,UI: "full_training" или "sdo_access_only"
    
    HRM->>UI: Click "Отправить заявку"
    
    UI->>OS: sendOrderToTrainingCenter(orderId, contractorId, requestType)
    
    OS->>SS: getContractor(contractorId)
    SS-->>OS: Contractor data
    
    alt Автоматическая интеграция (contractorTenantId exists)
        OS->>TCS: Создать заявку в store УЦ
        Note over OS,TCS: Данные заявки:<br/>- fromTenantId<br/>- trainingProgramId<br/>- employeesCount<br/>- requestType<br/>- preferredStartDate<br/>- orderId
        
        TCS->>TCS: Generate requestId
        TCS->>TCS: Set status = 'new'
        TCS->>TCS: Set toTenantId = УЦ tenantId
        TCS-->>OS: Request created
        
        OS->>OS: Update order.trainingCenterRequestId
        OS-->>UI: Success
        
        UI->>Toast: "Заявка отправлена в [Название УЦ]"
        Toast-->>HRM: Success notification
        
    else Ручная интеграция
        OS->>OS: Create local request record
        OS-->>UI: Manual integration required
        
        UI->>Toast: "Свяжитесь с УЦ для передачи данных"
        Toast-->>HRM: Warning notification
    end
    
    UI->>UI: Close dialog
    UI->>UI: Update order display (show linked requestId)
```

---

## Обработка заявки учебным центром

```mermaid
sequenceDiagram
    participant TCM as TrainingCenterManager
    participant UI as RequestsTab
    participant TCS as trainingCenterStore
    participant Toast as Toast Notification
    participant Prod as Production attestationStore

    Note over TCM: Просмотр входящих заявок
    
    TCM->>UI: Open "Учебный центр" module
    TCM->>UI: Navigate to "Заявки" tab
    
    UI->>TCS: getRequestsByTenant(tcTenantId)
    TCS-->>UI: List of requests
    
    UI->>UI: Display requests in table
    Note over UI: Статус: Новая (badge)
    
    TCM->>UI: Click "Eye" icon to view details
    UI->>UI: Open request details dialog
    
    UI-->>TCM: Display:
    Note over TCM,UI: - Организация-отправитель<br/>- Программа обучения<br/>- Количество обучаемых<br/>- Тип заявки<br/>- Предпочтительная дата<br/>- Примечания
    
    alt Одобрение заявки
        TCM->>UI: Click "Одобрить заявку"
        UI->>UI: Show confirmation
        
        TCM->>UI: Confirm
        UI->>TCS: approveRequest(requestId, groupId?)
        
        TCS->>TCS: Update status = 'approved'
        TCS->>TCS: Set reviewedAt = Date.now()
        TCS-->>UI: Request approved
        
        UI->>Toast: "Заявка одобрена"
        Toast-->>TCM: Success
        
        UI->>UI: Update status badge to "Одобрена"
        UI->>UI: Show action buttons for training process
        
    else Отклонение заявки
        TCM->>UI: Click "Отклонить"
        UI->>UI: Show reject dialog with textarea
        
        TCM->>UI: Enter rejection reason
        Note over TCM: Обязательное поле
        
        TCM->>UI: Click "Отклонить"
        
        alt Причина не указана
            UI->>Toast: "Укажите причину отклонения"
            Toast-->>TCM: Error (red)
        else Причина указана
            UI->>TCS: rejectRequest(requestId, reason)
            
            TCS->>TCS: Update status = 'rejected'
            TCS->>TCS: Set reviewNotes = reason
            TCS->>TCS: Set reviewedAt = Date.now()
            TCS-->>UI: Request rejected
            
            UI->>Toast: "Заявка отклонена"
            Toast-->>TCM: Success
            
            UI->>UI: Update status badge to "Отклонена"
            UI->>UI: Close dialog
        end
    end
    
    Note over TCM: Если заявка одобрена - переход к обучению
```

---

## Проведение обучения и выпуск сертификатов

```mermaid
sequenceDiagram
    participant TCM as TrainingCenterManager
    participant UI as GroupsTab
    participant TCS as trainingCenterStore
    participant Toast as Toast Notification

    Note over TCM: Создание группы обучения
    
    TCM->>UI: Navigate to "Группы" tab
    TCM->>UI: Click "Новая группа"
    
    UI->>UI: Open CreateGroupDialog
    
    TCM->>UI: Fill group data
    Note over TCM,UI: - Название группы<br/>- Программа обучения<br/>- Даты начала и окончания<br/>- Преподаватель
    
    TCM->>UI: Click "Создать"
    UI->>TCS: createGroup(groupData)
    
    TCS->>TCS: Generate groupId
    TCS->>TCS: Set status = 'набор'
    TCS-->>UI: Group created
    
    UI->>Toast: "Группа создана"
    Toast-->>TCM: Success
    
    Note over TCM: Добавление обучаемых
    
    TCM->>UI: Click "Добавить обучаемых"
    UI->>UI: Show student selection
    
    alt Импорт из заявки
        TCM->>UI: Select "Импортировать из заявки"
        UI->>TCS: getRequestEmployees(requestId)
        TCS-->>UI: List of employees from request
        UI->>TCS: addStudentsToGroup(groupId, students)
    else Добавить вручную
        TCM->>UI: Select "Добавить вручную"
        TCM->>UI: Fill student data manually
        UI->>TCS: addStudentsToGroup(groupId, students)
    end
    
    TCS->>TCS: Add students to group.students[]
    TCS-->>UI: Students added
    
    UI->>Toast: "Обучаемые добавлены"
    Toast-->>TCM: Success
    
    Note over TCM: Начало обучения
    
    TCM->>UI: Click "Начать обучение"
    UI->>UI: Show confirmation
    
    TCM->>UI: Confirm
    UI->>TCS: startTraining(groupId)
    
    TCS->>TCS: Update status = 'обучение'
    TCS->>TCS: Set startedAt = Date.now()
    TCS-->>UI: Training started
    
    UI->>Toast: "Обучение начато"
    Toast-->>TCM: Success
    
    UI->>UI: Disable editing students
    
    Note over TCM: Проведение занятий...
    
    Note over TCM: Завершение обучения
    
    TCM->>UI: Click "Завершить обучение"
    UI->>UI: Show confirmation
    
    TCM->>UI: Confirm
    UI->>TCS: completeTraining(groupId)
    
    TCS->>TCS: Update status = 'завершена'
    TCS->>TCS: Set completedAt = Date.now()
    TCS-->>UI: Training completed
    
    UI->>Toast: "Обучение завершено"
    Toast-->>TCM: Success
    
    Note over TCM: Выпуск сертификатов
    
    TCM->>UI: Navigate to "Сертификаты" tab
    TCM->>UI: Click "Выпустить сертификат"
    
    UI->>UI: Open IssueCertificateDialog
    
    TCM->>UI: Select student from completed group
    TCM->>UI: Select training program
    TCM->>UI: Enter certificate number
    TCM->>UI: Set issue date
    TCM->>UI: Set expiry date
    TCM->>UI: Attach files (удостоверение, протокол)
    
    TCM->>UI: Click "Выпустить"
    UI->>TCS: issueCertificate(certificateData)
    
    TCS->>TCS: Generate certificateId
    TCS->>TCS: Set status = 'issued'
    TCS->>TCS: Store files in certificate.files[]
    TCS-->>UI: Certificate issued
    
    UI->>Toast: "Сертификат выпущен"
    Toast-->>TCM: Success
    
    UI->>UI: Display certificate in table
```

---

## Синхронизация сертификатов между организациями

```mermaid
sequenceDiagram
    participant TCM as TrainingCenterManager
    participant UI as RequestsTab (УЦ)
    participant TCS as trainingCenterStore
    participant AS as attestationStore (Производство)
    participant Toast as Toast Notification
    participant HRM as HRManager (Производство)

    Note over TCM: Завершение заявки и передача документов
    
    TCM->>UI: Open approved request
    UI->>UI: Show "Завершить и отправить документы" button
    
    TCM->>UI: Click "Завершить и отправить документы"
    UI->>UI: Show confirmation dialog
    
    TCM->>UI: Confirm
    UI->>TCS: completeRequest(requestId)
    
    TCS->>TCS: Get request data (fromTenantId, orderId)
    TCS->>TCS: Get certificates for this request
    
    loop Для каждого сертификата
        TCS->>TCS: syncCertificateToAttestation(certificate)
        
        TCS->>TCS: Prepare certificate data
        Note over TCS: - employeeId<br/>- certificateNumber<br/>- issueDate<br/>- expiryDate<br/>- trainingProgramId<br/>- files[]
        
        TCS->>AS: createCertificate(fromTenantId, certificateData)
        
        AS->>AS: Generate certificateId in production store
        AS->>AS: Set status = 'synced'
        AS->>AS: Set syncedFrom = УЦ tenantId
        AS->>AS: Copy files (удостоверение, протокол)
        AS->>AS: Link to employee
        AS->>AS: Link to order (via orderId)
        AS-->>TCS: Certificate created
        
        TCS->>TCS: Update certificate status = 'delivered'
        TCS->>TCS: Set deliveredAt = Date.now()
    end
    
    TCS->>TCS: Update request status = 'completed'
    TCS->>TCS: Set completedAt = Date.now()
    TCS-->>UI: Request completed
    
    UI->>Toast: "Заявка завершена, документы отправлены"
    Toast-->>TCM: Success
    
    UI->>UI: Update request status badge to "Завершена"
    UI->>UI: Disable action buttons
    
    Note over HRM: Получение сертификатов на стороне производства
    
    HRM->>AS: Navigate to "Сертификаты" tab
    AS->>AS: getCertificatesByTenant(tenantId)
    AS-->>HRM: List of certificates (including new ones)
    
    HRM->>HRM: View new certificates with status "Синхронизирован"
    Note over HRM: Отображается:<br/>- ФИО сотрудника<br/>- Номер сертификата<br/>- Дата выдачи<br/>- Срок действия<br/>- Программа обучения<br/>- Файлы для скачивания
    
    HRM->>AS: Download certificate files
    AS-->>HRM: Files downloaded (удостоверение, протокол)
    
    Note over TCM,HRM: Синхронизация завершена успешно
```

---

## Мониторинг истечения сертификатов

```mermaid
sequenceDiagram
    participant System as System (Daily Cron)
    participant AS as attestationStore
    participant Notif as Notification Service
    participant SE as SafetyEngineer
    participant UI as CertificatesTab

    Note over System: Ежедневная проверка в 00:00
    
    System->>AS: Run certificate expiration check
    AS->>AS: Get all certificates by tenant
    
    loop Для каждого сертификата
        AS->>AS: Calculate days until expiry
        Note over AS: daysUntilExpiry = expiryDate - today
        
        alt daysUntilExpiry > 30
            AS->>AS: Keep status = 'synced'
        else daysUntilExpiry <= 30 AND > 0
            AS->>AS: Update status = 'expiring'
            AS->>Notif: Schedule notification
            Notif->>Notif: Create notification
            Note over Notif: "Внимание! Сертификат сотрудника<br/>[ФИО] истекает [дата]"
        else daysUntilExpiry <= 0
            AS->>AS: Update status = 'expired'
            AS->>Notif: Schedule notification
            Notif->>Notif: Create notification
            Note over Notif: "Сертификат сотрудника<br/>[ФИО] истек"
        end
    end
    
    AS-->>System: Check completed
    
    Note over SE: SafetyEngineer открывает систему
    
    SE->>UI: Navigate to "Сертификаты" tab
    UI->>AS: getCertificatesByTenant(tenantId)
    AS-->>UI: List of certificates
    
    UI->>UI: Apply filter "Истекает"
    UI->>UI: Display certificates with status = 'expiring'
    Note over UI: Badge: желтый "Истекает"<br/>Показывает дату истечения
    
    SE->>Notif: Check notifications
    Notif-->>SE: Display unread notifications
    Note over SE: "У вас 5 сертификатов, требующих обновления"
    
    SE->>UI: Select certificates requiring renewal
    
    SE->>UI: Click "Создать приказ на переобучение"
    Note over UI: Может быть кнопка быстрого действия
    
    UI->>UI: Pre-fill order with selected employees
    UI-->>SE: Open CreateOrderDialog with employees
    
    SE->>UI: Complete order creation
    Note over SE,UI: Запускается стандартный процесс<br/>создания приказа и отправки в УЦ
    
    Note over System,SE: Цикл обучения повторяется
```

---

## Процесс предоставления доступа к СДО

```mermaid
sequenceDiagram
    participant HRM as HRManager (Производство)
    participant OS as ordersStore
    participant TCS as trainingCenterStore
    participant TCM as TrainingCenterManager (УЦ)
    participant SDO as СДО система УЦ
    participant AS as attestationStore

    Note over HRM: Отправка заявки с типом "Только СДО"
    
    HRM->>OS: sendOrderToTrainingCenter(orderId, contractorId, 'sdo_access_only')
    OS->>TCS: Create request with requestType = 'sdo_access_only'
    TCS-->>OS: Request created
    
    Note over TCM: Обработка заявки на СДО доступ
    
    TCM->>TCS: getRequestsByTenant(tcTenantId)
    TCS-->>TCM: List of requests
    
    TCM->>TCM: View request details
    Note over TCM: Видит тип: "Только СДО доступ"<br/>Понимает, что не нужно проводить очное обучение
    
    TCM->>TCS: approveRequest(requestId)
    TCS->>TCS: Update status = 'approved'
    TCS-->>TCM: Request approved
    
    Note over TCM: Генерация доступов к СДО
    
    TCM->>SDO: Create user accounts for employees
    
    loop Для каждого сотрудника
        SDO->>SDO: Generate login and password
        SDO->>SDO: Assign training program
        SDO-->>TCM: Account created
    end
    
    TCM->>TCM: Prepare access credentials document
    Note over TCM: Документ с логинами/паролями<br/>или инструкцией по доступу
    
    TCM->>TCS: addResponseDocuments(requestId, documents)
    TCS->>TCS: Store documents in request.responseDocuments[]
    TCS-->>TCM: Documents added
    
    TCM->>TCS: completeRequest(requestId)
    TCS->>TCS: Update status = 'completed'
    TCS-->>TCM: Request completed
    
    Note over HRM: Получение доступов
    
    HRM->>OS: View order details
    OS->>TCS: Get linked request
    TCS-->>OS: Request with responseDocuments
    OS-->>HRM: Display documents
    
    HRM->>HRM: Download access credentials
    HRM->>HRM: Distribute to employees
    
    Note over HRM: Сотрудники обучаются в СДО
    
    Note over TCM: После завершения обучения в СДО
    
    TCM->>TCS: Issue certificates for completed students
    Note over TCM: Стандартный процесс выпуска сертификатов
    
    TCM->>TCS: Sync certificates to production
    TCS->>AS: Create certificates
    AS-->>HRM: Certificates available
    
    Note over HRM,TCM: Процесс завершен
```

---

## Взаимодействие пользователей с разными ролями

```mermaid
sequenceDiagram
    participant TA as TenantAdmin
    participant HRM as HRManager
    participant SE as SafetyEnginger
    participant UI as UI System
    participant Stores as All Stores

    Note over TA,Stores: Сценарий: Подготовка к обучению
    
    TA->>UI: Login
    UI->>UI: Check role = TenantAdmin
    UI-->>TA: Full access granted
    
    TA->>Stores: Navigate to Settings → Users
    TA->>Stores: createUser(HRManager role)
    Stores-->>TA: User created
    
    TA->>Stores: Navigate to Settings → Contractors
    TA->>Stores: addContractor(training center)
    Stores-->>TA: Contractor added
    
    TA->>Stores: Navigate to Settings → Справочники
    TA->>Stores: Add training programs
    Stores-->>TA: Programs added
    
    Note over HRM: HRManager начинает работу
    
    HRM->>UI: Login
    UI->>UI: Check role = HRManager
    UI-->>HRM: Limited access granted
    Note over UI: Доступен только модуль Аттестация<br/>Нет доступа к Настройкам
    
    HRM->>Stores: Navigate to Сотрудники
    HRM->>Stores: createEmployee(employeeData)
    Stores-->>HRM: Employee created
    
    HRM->>Stores: Navigate to Приказы
    HRM->>Stores: createOrder(orderData)
    Stores-->>HRM: Order created (status: draft)
    
    HRM->>Stores: addEmployeesToOrder(orderId, employeeIds)
    Stores-->>HRM: Employees added
    
    HRM->>UI: Try to click "Согласовать приказ"
    UI-->>HRM: Button disabled
    Note over HRM,UI: Ошибка: Нет прав.<br/>Только SafetyEngineer может согласовывать
    
    Note over SE: SafetyEngineer проверяет приказ
    
    SE->>UI: Login
    UI->>UI: Check role = SafetyEngineer
    UI-->>SE: Limited access granted
    
    SE->>Stores: Navigate to Приказы
    SE->>Stores: View order details
    Stores-->>SE: Order data
    
    SE->>UI: Click "Согласовать приказ"
    UI->>UI: Check permissions
    Note over UI: SafetyEngineer: ✅ Allowed
    
    SE->>Stores: approveOrder(orderId)
    Stores->>Stores: Update status = 'approved'
    Stores-->>SE: Order approved
    
    Note over HRM: HRManager отправляет в УЦ
    
    HRM->>UI: Refresh page
    HRM->>Stores: View updated order
    Stores-->>HRM: Order (status: approved)
    
    HRM->>UI: Click "Учебный центр"
    UI-->>HRM: Button enabled (has permission)
    
    HRM->>Stores: sendOrderToTrainingCenter(...)
    Stores-->>HRM: Request sent
    
    Note over SE: Мониторинг сертификатов
    
    SE->>Stores: Navigate to Сертификаты
    SE->>Stores: Filter by status = 'expiring'
    Stores-->>SE: List of expiring certificates
    
    SE->>SE: Plan renewal training
    
    Note over TA: Управление пользователями
    
    TA->>Stores: Navigate to Settings → Users
    TA->>Stores: View all users
    Stores-->>TA: List of users
    
    TA->>Stores: Update user role (HRM → SafetyEngineer)
    Stores-->>TA: Role updated
    
    Note over HRM: HRManager обновляет сессию
    
    HRM->>UI: Refresh or re-login
    UI->>Stores: Get updated user data
    Stores-->>UI: User with new role = SafetyEngineer
    UI-->>HRM: New permissions applied
    
    HRM->>UI: Try to access "Согласовать приказ"
    UI-->>HRM: Button now enabled
    Note over HRM,UI: Права обновлены успешно
```

---

## Процесс обработки ошибок при интеграции

```mermaid
sequenceDiagram
    participant HRM as HRManager
    participant UI as UI
    participant OS as ordersStore
    participant SS as settingsStore
    participant TCS as trainingCenterStore (УЦ)
    participant Toast as Toast Notification

    Note over HRM: Попытка отправить заявку
    
    HRM->>UI: Click "Учебный центр"
    UI->>SS: getContractorsByTenant(tenantId)
    SS-->>UI: List of contractors
    
    alt Нет контрагентов
        UI->>Toast: "Ошибка: Нет добавленных учебных центров"
        Toast-->>HRM: Error notification
        UI->>UI: Show button "Перейти в Настройки"
        
        HRM->>UI: Click "Перейти в Настройки"
        UI-->>HRM: Redirect to Settings → Contractors
        
    else Есть контрагенты
        UI-->>HRM: Show contractor selection
        
        HRM->>UI: Select contractor
        HRM->>UI: Select request type
        HRM->>UI: Click "Отправить заявку"
        
        UI->>OS: sendOrderToTrainingCenter(orderId, contractorId, requestType)
        
        OS->>SS: getContractor(contractorId)
        SS-->>OS: Contractor data
        
        alt contractorTenantId пуст
            OS->>Toast: "Предупреждение: Требуется ручная передача данных"
            Toast-->>HRM: Warning notification
            OS->>OS: Create local request record
            OS-->>UI: Manual integration mode
            
        else contractorTenantId указан, но невалидный
            OS->>OS: Validate tenantId
            
            alt Организация не найдена
                OS->>Toast: "Ошибка: Организация с ID [tenantId] не найдена"
                Toast-->>HRM: Error notification
                OS-->>UI: Request failed
                
            else Организация не является УЦ
                OS->>Toast: "Ошибка: Организация не является учебным центром"
                Toast-->>HRM: Error notification
                OS-->>UI: Request failed
            end
            
        else contractorTenantId валидный
            OS->>TCS: Create request in TC store
            
            alt Ошибка создания заявки
                TCS-->>OS: Error
                OS->>Toast: "Ошибка при создании заявки в УЦ"
                Toast-->>HRM: Error notification
                OS-->>UI: Request failed
                
            else Заявка создана успешно
                TCS-->>OS: Request created (requestId)
                OS->>OS: Update order.trainingCenterRequestId
                OS-->>UI: Request sent successfully
                
                UI->>Toast: "Заявка успешно отправлена в [TC Name]"
                Toast-->>HRM: Success notification
            end
        end
    end
```

---

## Взаимодействие через межорганизационные документы

```mermaid
sequenceDiagram
    participant Prod as Production Organization
    participant SS as settingsStore
    participant TCS as trainingCenterStore
    participant TC as Training Center
    participant Docs as InterOrgDocuments

    Note over Prod,TC: Создание истории взаимодействия
    
    Prod->>SS: sendOrderToTrainingCenter(...)
    SS->>Docs: Create document (type: training_request)
    
    Docs->>Docs: Generate documentId
    Docs->>Docs: Set fromTenantId = Production
    Docs->>Docs: Set toTenantId = Training Center
    Docs->>Docs: Set type = 'training_request'
    Docs->>Docs: Set status = 'sent'
    Docs->>Docs: Store metadata (orderId, requestType, etc.)
    Docs-->>SS: Document created
    
    SS->>TCS: Create request
    TCS-->>SS: Request created
    
    Docs->>Docs: Update status = 'delivered'
    Docs->>Docs: Set deliveredAt = Date.now()
    
    Note over TC: Обработка заявки
    
    TC->>TCS: approveRequest(requestId)
    TCS->>Docs: Create document (type: training_request)
    
    Docs->>Docs: Set fromTenantId = Training Center
    Docs->>Docs: Set toTenantId = Production
    Docs->>Docs: Set relatedDocumentId = original request
    Docs->>Docs: Set metadata (status: approved)
    Docs-->>TCS: Document created
    
    Note over TC: Завершение обучения и выпуск сертификатов
    
    TC->>TCS: completeRequest(requestId)
    TCS->>Docs: Create documents (type: certificate)
    
    loop Для каждого сертификата
        Docs->>Docs: Create certificate document
        Docs->>Docs: Set fromTenantId = Training Center
        Docs->>Docs: Set toTenantId = Production
        Docs->>Docs: Attach files (удостоверение, протокол)
        Docs->>Docs: Set metadata (certificateNumber, employeeId)
        Docs-->>TCS: Certificate document created
    end
    
    TCS->>Prod: Sync certificates
    Prod->>Docs: Update status = 'received'
    
    Note over Prod: Просмотр истории взаимодействия
    
    Prod->>SS: getInterOrgDocumentsByTenant(tenantId, 'all')
    SS->>Docs: Query documents
    Docs-->>SS: List of documents
    
    SS-->>Prod: Display history:
    Note over Prod: - Отправленные заявки<br/>- Полученные ответы<br/>- Полученные сертификаты<br/>- Все с датами и статусами
    
    Note over Prod,TC: Полная прозрачность документооборота
```

---

## Легенда

### Участники (Actors):
- **HRManager** - Менеджер по персоналу (производственная организация)
- **SafetyEngineer** - Инженер по охране труда (производственная организация)
- **TenantAdmin** - Администратор организации
- **TrainingCenterManager** - Менеджер учебного центра

### Хранилища (Stores):
- **attestationStore** - Хранилище данных модуля Аттестация
- **ordersStore** - Хранилище приказов
- **settingsStore** - Хранилище настроек и контрагентов
- **trainingCenterStore** - Хранилище учебного центра

### Системные компоненты:
- **UI** - Пользовательский интерфейс
- **Toast** - Уведомления для пользователя
- **API** - Внешние API (mock в примерах)
- **System** - Системные процессы (cron jobs)

### Типы сообщений:
- **→** Синхронный запрос
- **--→** Ответ/возврат данных
- **Note** - Комментарий или описание процесса

### Ключевые процессы:
1. **Автоматическая интеграция** - через contractorTenantId
2. **Ручная интеграция** - без contractorTenantId
3. **Синхронизация** - передача данных между тенантами
4. **Валидация** - проверка данных перед созданием
5. **Мониторинг** - автоматическое отслеживание статусов
