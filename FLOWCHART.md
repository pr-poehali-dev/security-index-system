# Блок-схемы процессов системы

## Оглавление
1. [Процесс создания и согласования приказа](#процесс-создания-и-согласования-приказа)
2. [Процесс отправки заявки в учебный центр](#процесс-отправки-заявки-в-учебный-центр)
3. [Процесс обработки заявки учебным центром](#процесс-обработки-заявки-учебным-центром)
4. [Процесс проведения обучения](#процесс-проведения-обучения)
5. [Процесс передачи сертификатов](#процесс-передачи-сертификатов)
6. [Процесс добавления контрагента с валидацией](#процесс-добавления-контрагента-с-валидацией)
7. [Общая схема взаимодействия модулей](#общая-схема-взаимодействия-модулей)

---

## Процесс создания и согласования приказа

```mermaid
flowchart TD
    Start([Начало: HRManager]) --> CreateOrder[Создать приказ]
    CreateOrder --> FillData[Заполнить данные приказа]
    FillData --> SelectType[Выбрать тип обучения]
    SelectType --> OrderCreated{Приказ создан?}
    
    OrderCreated -->|Да| StatusDraft[Статус: Черновик]
    OrderCreated -->|Нет| Error1[Показать ошибку]
    Error1 --> FillData
    
    StatusDraft --> AddEmployees[Добавить сотрудников]
    AddEmployees --> HasEmployees{Есть сотрудники?}
    
    HasEmployees -->|Нет| AddEmployees
    HasEmployees -->|Да| ReviewOrder[SafetyEngineer проверяет приказ]
    
    ReviewOrder --> ApproveDecision{Согласовать?}
    
    ApproveDecision -->|Да| ApproveOrder[Согласовать приказ]
    ApproveDecision -->|Нет| EditOrder[Вернуть на доработку]
    EditOrder --> AddEmployees
    
    ApproveOrder --> StatusApproved[Статус: Согласован]
    StatusApproved --> End([Конец: Приказ готов к отправке])
```

---

## Процесс отправки заявки в учебный центр

```mermaid
flowchart TD
    Start([Начало: Приказ согласован]) --> ClickButton[Нажать "Учебный центр"]
    ClickButton --> OpenDialog[Открыть диалог выбора УЦ]
    
    OpenDialog --> HasContractors{Есть контрагенты?}
    
    HasContractors -->|Нет| ShowError[Ошибка: Нет УЦ в контрагентах]
    ShowError --> GoToSettings[Перейти в Настройки]
    GoToSettings --> AddContractor[Добавить контрагента]
    AddContractor --> OpenDialog
    
    HasContractors -->|Да| SelectTC[Выбрать учебный центр]
    SelectTC --> SelectType[Выбрать тип заявки]
    
    SelectType --> TypeDecision{Тип заявки?}
    
    TypeDecision -->|Полное обучение| FullTraining[requestType: full_training]
    TypeDecision -->|Только СДО| SDOAccess[requestType: sdo_access_only]
    
    FullTraining --> CheckTenantId{У контрагента есть tenantId?}
    SDOAccess --> CheckTenantId
    
    CheckTenantId -->|Да| AutoSend[Автоматическая передача в trainingCenterStore]
    CheckTenantId -->|Нет| ManualSend[Ручная передача через внешние каналы]
    
    AutoSend --> CreateRequest[Создать заявку в УЦ]
    CreateRequest --> LinkToOrder[Связать заявку с приказом]
    LinkToOrder --> UpdateOrderStatus[order.trainingCenterRequestId = requestId]
    
    ManualSend --> CreateRequestManual[Создать запись о заявке]
    CreateRequestManual --> NotifyManual[Уведомить пользователя]
    
    UpdateOrderStatus --> End([Конец: Заявка отправлена])
    NotifyManual --> End
```

---

## Процесс обработки заявки учебным центром

```mermaid
flowchart TD
    Start([Начало: Заявка получена]) --> ViewRequest[TrainingCenterManager открывает заявку]
    ViewRequest --> ReviewDetails[Просмотр деталей заявки]
    
    ReviewDetails --> CheckType{Тип заявки?}
    
    CheckType -->|full_training| FullProcess[Полное обучение]
    CheckType -->|sdo_access_only| SDOProcess[Только СДО доступ]
    
    FullProcess --> ReviewDecision{Решение?}
    SDOProcess --> ReviewDecision
    
    ReviewDecision -->|Одобрить| ApproveRequest[Одобрить заявку]
    ReviewDecision -->|Отклонить| RejectRequest[Отклонить заявку]
    
    RejectRequest --> EnterReason[Указать причину отклонения]
    EnterReason --> SaveRejection[Сохранить в reviewNotes]
    SaveRejection --> StatusRejected[Статус: Отклонена]
    StatusRejected --> NotifyProduction1[Уведомить производство]
    NotifyProduction1 --> EndRejected([Конец: Заявка отклонена])
    
    ApproveRequest --> StatusApproved[Статус: Одобрена]
    StatusApproved --> TypeCheck{Тип заявки?}
    
    TypeCheck -->|full_training| StartTraining[Начать процесс обучения]
    TypeCheck -->|sdo_access_only| GenerateAccess[Сгенерировать доступы к СДО]
    
    StartTraining --> ProcessTraining([См. процесс обучения])
    
    GenerateAccess --> SendCredentials[Отправить логины/пароли]
    SendCredentials --> CompleteSDO[Завершить заявку]
    CompleteSDO --> NotifyProduction2[Уведомить производство]
    NotifyProduction2 --> EndSDO([Конец: Доступы предоставлены])
```

---

## Процесс проведения обучения

```mermaid
flowchart TD
    Start([Начало: Заявка одобрена]) --> CreateGroup[Создать группу обучения]
    CreateGroup --> FillGroupData[Заполнить данные группы]
    FillGroupData --> StatusNabor[Статус группы: Набор]
    
    StatusNabor --> AddStudents[Добавить обучаемых]
    AddStudents --> SourceDecision{Источник?}
    
    SourceDecision -->|Из заявки| ImportFromRequest[Импортировать из заявки]
    SourceDecision -->|Вручную| AddManual[Добавить вручную]
    SourceDecision -->|Из базы| SelectFromDB[Выбрать из существующих]
    
    ImportFromRequest --> StudentsAdded[Обучаемые добавлены]
    AddManual --> StudentsAdded
    SelectFromDB --> StudentsAdded
    
    StudentsAdded --> CheckCount{Минимум 1 обучаемый?}
    
    CheckCount -->|Нет| AddStudents
    CheckCount -->|Да| StartTraining[Начать обучение]
    
    StartTraining --> StatusTraining[Статус группы: Обучение]
    StatusTraining --> ConductClasses[Проведение занятий]
    
    ConductClasses --> TrainingDone{Обучение завершено?}
    
    TrainingDone -->|Нет| ConductClasses
    TrainingDone -->|Да| CompleteTraining[Завершить обучение]
    
    CompleteTraining --> StatusCompleted[Статус группы: Завершена]
    StatusCompleted --> End([Конец: Готово к выпуску сертификатов])
```

---

## Процесс передачи сертификатов

```mermaid
flowchart TD
    Start([Начало: Группа завершена]) --> IssueCert[Выпустить сертификат]
    IssueCert --> FillCertData[Заполнить данные сертификата]
    
    FillCertData --> SelectStudent[Выбрать обучаемого]
    SelectStudent --> EnterNumber[Указать номер сертификата]
    EnterNumber --> EnterDates[Указать даты выдачи и истечения]
    EnterDates --> AttachFiles[Прикрепить файлы]
    
    AttachFiles --> HasFiles{Файлы прикреплены?}
    
    HasFiles -->|Нет| AttachFiles
    HasFiles -->|Да| CreateCert[Создать сертификат]
    
    CreateCert --> StatusIssued[Статус: Выдан]
    StatusIssued --> CheckRequest{Есть связь с заявкой?}
    
    CheckRequest -->|Нет| ManualDelivery[Ручная передача]
    CheckRequest -->|Да| CheckTenantId{contractorTenantId указан?}
    
    CheckTenantId -->|Нет| ManualDelivery
    CheckTenantId -->|Да| AutoSync[Автоматическая синхронизация]
    
    AutoSync --> TransferCert[Передать сертификат]
    TransferCert --> StatusDelivered[Статус в УЦ: Доставлен]
    
    StatusDelivered --> CreateInAttestation[Создать сертификат в модуле Аттестации]
    CreateInAttestation --> TransferFiles[Передать файлы]
    TransferFiles --> LinkToEmployee[Связать с сотрудником]
    LinkToEmployee --> StatusSynced[Статус в Аттестации: Синхронизирован]
    
    StatusSynced --> NotifyProduction[Уведомить производство]
    NotifyProduction --> End([Конец: Сертификат передан])
    
    ManualDelivery --> NotifyManual[Уведомление о ручной передаче]
    NotifyManual --> EndManual([Конец: Требуется ручная передача])
```

---

## Процесс добавления контрагента с валидацией

```mermaid
flowchart TD
    Start([Начало: TenantAdmin]) --> ClickAdd[Нажать "Добавить контрагента"]
    ClickAdd --> OpenDialog[Открыть диалог]
    
    OpenDialog --> SelectType[Выбрать тип контрагента]
    SelectType --> TypeDecision{Тип?}
    
    TypeDecision -->|Учебный центр| TC[type: training_center]
    TypeDecision -->|Подрядчик| Contractor[type: contractor]
    TypeDecision -->|Поставщик| Supplier[type: supplier]
    
    TC --> EnterTenantId[Ввести ID организации в системе]
    Contractor --> FillManual[Заполнить вручную]
    Supplier --> FillManual
    
    EnterTenantId --> HasTenantId{ID указан?}
    
    HasTenantId -->|Нет| FillManual
    HasTenantId -->|Да| StartValidation[Запустить валидацию]
    
    StartValidation --> ShowLoader[Показать индикатор загрузки]
    ShowLoader --> CheckOwnId{ID = свой tenantId?}
    
    CheckOwnId -->|Да| ErrorOwn[Ошибка: Нельзя указать свою организацию]
    CheckOwnId -->|Нет| CheckExists{Организация существует?}
    
    CheckExists -->|Нет| ErrorNotFound[Ошибка: Организация не найдена]
    CheckExists -->|Да| CheckModule{Для УЦ: есть модуль training-center?}
    
    CheckModule -->|Нет| ErrorNoModule[Ошибка: Не является учебным центром]
    CheckModule -->|Да| ValidationSuccess[Валидация успешна]
    
    ValidationSuccess --> ShowSuccess[Показать зеленую галочку]
    ShowSuccess --> AutoFill[Автозаполнить название и ИНН]
    AutoFill --> FillManual
    
    ErrorOwn --> ShowError1[Показать красный крестик]
    ErrorNotFound --> ShowError1
    ErrorNoModule --> ShowError1
    ShowError1 --> EnterTenantId
    
    FillManual --> FillServices[Выбрать услуги]
    FillServices --> FillContract[Данные договора]
    FillContract --> FillContacts[Контактная информация]
    FillContacts --> ClickSave[Нажать "Добавить"]
    
    ClickSave --> ValidateForm{Форма валидна?}
    
    ValidateForm -->|Нет| ShowFormError[Показать ошибки]
    ShowFormError --> FillManual
    
    ValidateForm -->|Да| CheckTenantIdError{Есть ошибка валидации tenantId?}
    
    CheckTenantIdError -->|Да| BlockSave[Заблокировать сохранение]
    BlockSave --> ShowToast[Toast: Исправьте ошибки]
    ShowToast --> EnterTenantId
    
    CheckTenantIdError -->|Нет| SaveContractor[Сохранить контрагента]
    SaveContractor --> AddToList[Добавить в список]
    AddToList --> ShowBadge{contractorTenantId указан?}
    
    ShowBadge -->|Да| DisplayWithBadge[Показать badge "В системе"]
    ShowBadge -->|Нет| DisplayNormal[Показать без badge]
    
    DisplayWithBadge --> End([Конец: Контрагент добавлен])
    DisplayNormal --> End
```

---

## Общая схема взаимодействия модулей

```mermaid
flowchart TB
    subgraph Production["🏭 Производственная организация"]
        Settings[⚙️ Настройки]
        Attestation[📋 Аттестация]
        
        Settings --> Contractors[Контрагенты]
        Attestation --> Employees[Сотрудники]
        Attestation --> Orders[Приказы]
        Attestation --> Certificates1[Сертификаты]
    end
    
    subgraph TrainingCenter["🎓 Учебный центр"]
        TCModule[📚 Модуль УЦ]
        
        TCModule --> Requests[Заявки]
        TCModule --> Groups[Группы]
        TCModule --> Certificates2[Сертификаты УЦ]
    end
    
    subgraph Integration["🔄 Интеграция через contractorTenantId"]
        AutoTransfer[Автоматическая передача данных]
    end
    
    Contractors -->|1. Добавить УЦ с tenantId| AutoTransfer
    Orders -->|2. Отправить заявку| AutoTransfer
    AutoTransfer -->|3. Создать заявку| Requests
    
    Requests -->|4. Обработать заявку| Groups
    Groups -->|5. Провести обучение| Certificates2
    Certificates2 -->|6. Синхронизировать| AutoTransfer
    AutoTransfer -->|7. Создать сертификаты| Certificates1
    
    style Production fill:#e3f2fd
    style TrainingCenter fill:#f3e5f5
    style Integration fill:#fff3e0
```

---

## Схема статусов приказа

```mermaid
stateDiagram-v2
    [*] --> Черновик: Создан
    
    Черновик --> Черновик: Редактирование
    Черновик --> Согласован: Согласовать (SafetyEngineer)
    Черновик --> Отменен: Отменить (TenantAdmin)
    
    Согласован --> Согласован: Отправка в УЦ
    Согласован --> Отменен: Отменить (TenantAdmin)
    
    Отменен --> [*]
    
    note right of Черновик
        Можно редактировать
        Можно добавлять/удалять сотрудников
    end note
    
    note right of Согласован
        Нельзя редактировать
        Можно отправлять в УЦ
        Связан с заявкой через trainingCenterRequestId
    end note
```

---

## Схема статусов заявки (УЦ)

```mermaid
stateDiagram-v2
    [*] --> Новая: Получена от производства
    
    Новая --> На_рассмотрении: Начать обработку
    На_рассмотрении --> Одобрена: Одобрить
    На_рассмотрении --> Отклонена: Отклонить (с причиной)
    
    Одобрена --> Одобрена: Обучение в процессе
    Одобрена --> Завершена: Завершить и отправить документы
    
    Отклонена --> [*]
    Завершена --> [*]
    
    note right of Новая
        Только что создана
        Ожидает рассмотрения
    end note
    
    note right of Одобрена
        Можно создавать группы
        Проводить обучение
        Выпускать сертификаты
    end note
    
    note right of Завершена
        Сертификаты переданы
        Заявка закрыта
        Производство уведомлено
    end note
```

---

## Схема статусов группы обучения

```mermaid
stateDiagram-v2
    [*] --> Набор: Создана
    
    Набор --> Набор: Добавление обучаемых
    Набор --> Обучение: Начать обучение
    Набор --> Отменена: Отменить группу
    
    Обучение --> Обучение: Проведение занятий
    Обучение --> Завершена: Завершить обучение
    Обучение --> Отменена: Отменить группу
    
    Завершена --> [*]
    Отменена --> [*]
    
    note right of Набор
        Формирование группы
        Можно добавлять/удалять обучаемых
    end note
    
    note right of Обучение
        Обучение в процессе
        Нельзя менять состав
    end note
    
    note right of Завершена
        Обучение завершено
        Можно выпускать сертификаты
    end note
```

---

## Схема жизненного цикла сертификата

```mermaid
stateDiagram-v2
    [*] --> Выдан: Выпущен УЦ
    
    Выдан --> Доставлен: Передан в организацию
    Доставлен --> Синхронизирован: Получен производством
    
    Синхронизирован --> Синхронизирован: Актуален
    Синхронизирован --> Истекает: < 30 дней до истечения
    Истекает --> Истек: Срок истек
    
    Истек --> [*]
    
    note right of Выдан
        Статус в модуле УЦ
        Файлы прикреплены
    end note
    
    note right of Доставлен
        Статус в модуле УЦ
        Передан в производство
    end note
    
    note right of Синхронизирован
        Статус в модуле Аттестации
        Сертификат получен и активен
    end note
    
    note right of Истекает
        Статус в модуле Аттестации
        Требуется переобучение
        Уведомление отправлено
    end note
```

---

## Схема принятия решения при отправке заявки

```mermaid
flowchart TD
    Start{Отправить в УЦ?} --> CheckContractor{Выбран контрагент?}
    
    CheckContractor -->|Нет| Error1[Ошибка: Выберите УЦ]
    CheckContractor -->|Да| CheckTenantId{У контрагента есть contractorTenantId?}
    
    CheckTenantId -->|Нет| ManualMode[Режим: Ручная интеграция]
    CheckTenantId -->|Да| AutoMode[Режим: Автоматическая интеграция]
    
    ManualMode --> CreateLocalRequest[Создать локальную запись заявки]
    CreateLocalRequest --> NotifyUser1[Уведомить: Свяжитесь с УЦ вручную]
    NotifyUser1 --> End1([Требуется ручная передача данных])
    
    AutoMode --> ValidateTenant{tenantId валидный?}
    
    ValidateTenant -->|Нет| Error2[Ошибка: Некорректный ID организации]
    ValidateTenant -->|Да| CheckModules{У УЦ есть модуль training-center?}
    
    CheckModules -->|Нет| Error3[Ошибка: Организация не является УЦ]
    CheckModules -->|Да| CreateRequest[Создать заявку в trainingCenterStore УЦ]
    
    CreateRequest --> TransferData[Передать данные:]
    TransferData --> Data1[- fromTenantId]
    Data1 --> Data2[- Список сотрудников]
    Data2 --> Data3[- Программа обучения]
    Data3 --> Data4[- Тип заявки]
    Data4 --> Data5[- orderId для связи]
    
    Data5 --> LinkOrder[Связать приказ с заявкой]
    LinkOrder --> NotifyTC[Уведомить УЦ о новой заявке]
    NotifyTC --> End2([Заявка успешно отправлена])
    
    style ManualMode fill:#ffe0b2
    style AutoMode fill:#c8e6c9
```

---

## Схема валидации ID организации

```mermaid
flowchart TD
    Start[Ввод contractorTenantId] --> Trim[Убрать пробелы]
    Trim --> IsEmpty{Пустое значение?}
    
    IsEmpty -->|Да| ClearState[Очистить состояние валидации]
    ClearState --> EndEmpty([Валидация не требуется])
    
    IsEmpty -->|Нет| ShowLoader[Показать индикатор загрузки]
    ShowLoader --> CheckSelf{tenantId == currentUser.tenantId?}
    
    CheckSelf -->|Да| SetError1[Ошибка: Нельзя указать свою организацию]
    SetError1 --> ShowRed1[Красная рамка + крестик]
    ShowRed1 --> EndError1([Валидация не прошла])
    
    CheckSelf -->|Нет| FetchTenant[Запрос информации об организации]
    FetchTenant --> Wait[Ожидание 500ms]
    Wait --> TenantExists{Организация найдена?}
    
    TenantExists -->|Нет| SetError2[Ошибка: Организация не найдена]
    SetError2 --> ShowRed2[Красная рамка + крестик]
    ShowRed2 --> EndError2([Валидация не прошла])
    
    TenantExists -->|Да| CheckType{Тип = training_center?}
    
    CheckType -->|Нет| Skip[Пропустить проверку модуля]
    CheckType -->|Да| CheckModule{Есть модуль training-center?}
    
    CheckModule -->|Нет| SetError3[Ошибка: Не является учебным центром]
    SetError3 --> ShowRed3[Красная рамка + крестик]
    ShowRed3 --> EndError3([Валидация не прошла])
    
    CheckModule -->|Да| SetSuccess[Валидация успешна]
    Skip --> SetSuccess
    
    SetSuccess --> ShowGreen[Зеленая рамка + галочка]
    ShowGreen --> AutoFill[Автозаполнить название и ИНН]
    AutoFill --> DisplayInfo[Показать: "Найдена организация: [Название]"]
    DisplayInfo --> EndSuccess([Валидация пройдена])
    
    style SetSuccess fill:#c8e6c9
    style SetError1 fill:#ffcdd2
    style SetError2 fill:#ffcdd2
    style SetError3 fill:#ffcdd2
```

---

## Диаграмма процесса мониторинга истечения сертификатов

```mermaid
flowchart TD
    Start([Автоматическая проверка ежедневно]) --> GetAllCerts[Получить все сертификаты]
    GetAllCerts --> CheckEach[Проверить каждый сертификат]
    
    CheckEach --> CalcDays[Вычислить дни до истечения]
    CalcDays --> Decision{Дней до истечения?}
    
    Decision -->|> 30| MarkActive[Статус: Синхронизирован]
    Decision -->|<= 30 и > 0| MarkExpiring[Статус: Истекает]
    Decision -->|<= 0| MarkExpired[Статус: Истек]
    
    MarkActive --> NextCert{Есть еще сертификаты?}
    
    MarkExpiring --> SendNotification1[Отправить уведомление]
    SendNotification1 --> NotifyText1[За 30 дней: Сертификат истекает]
    NotifyText1 --> NextCert
    
    MarkExpired --> SendNotification2[Отправить уведомление]
    SendNotification2 --> NotifyText2[Сертификат истек]
    NotifyText2 --> NextCert
    
    NextCert -->|Да| CheckEach
    NextCert -->|Нет| FilterExpiring[Фильтр "Истекает" в UI]
    
    FilterExpiring --> ShowBadge[Показать badge с предупреждением]
    ShowBadge --> EnableAction[Доступна кнопка "Создать приказ на переобучение"]
    EnableAction --> End([Конец: Мониторинг завершен])
    
    style MarkExpiring fill:#fff9c4
    style MarkExpired fill:#ffcdd2
```

---

## Схема прав доступа

```mermaid
flowchart TD
    User{Роль пользователя?}
    
    User -->|TenantAdmin| AdminRights[Полный доступ]
    User -->|HRManager| HRRights[Ограниченный доступ]
    User -->|SafetyEngineer| SafetyRights[Ограниченный доступ]
    User -->|TrainingCenterManager| TCRights[Только модуль УЦ]
    
    AdminRights --> Modules1[Все модули своей организации]
    Modules1 --> Actions1[Все действия]
    Actions1 --> Special1[+ Удаление сотрудников]
    Special1 --> Special2[+ Отмена приказов]
    Special2 --> Special3[+ Управление пользователями]
    Special3 --> Special4[+ Управление контрагентами]
    Special4 --> Special5[+ Управление справочниками]
    
    HRRights --> Modules2[Модуль Аттестация]
    Modules2 --> Actions2[Сотрудники: CRUD кроме удаления]
    Actions2 --> Actions3[Приказы: Создание, редактирование]
    Actions3 --> Actions4[Отправка в УЦ]
    Actions4 --> Actions5[Просмотр сертификатов]
    Actions5 --> Denied1[❌ Согласование приказов]
    Denied1 --> Denied2[❌ Отмена приказов]
    Denied2 --> Denied3[❌ Настройки]
    
    SafetyRights --> Modules3[Модуль Аттестация]
    Modules3 --> Actions6[Сотрудники: CRUD кроме удаления]
    Actions6 --> Actions7[Приказы: Все действия]
    Actions7 --> Actions8[Согласование приказов]
    Actions8 --> Actions9[Просмотр сертификатов]
    Actions9 --> Denied4[❌ Удаление сотрудников]
    Denied4 --> Denied5[❌ Отмена приказов]
    Denied5 --> Denied6[❌ Настройки]
    
    TCRights --> Modules4[Модуль Учебный центр]
    Modules4 --> Actions10[Заявки: Все действия]
    Actions10 --> Actions11[Группы: CRUD]
    Actions11 --> Actions12[Сертификаты: Выпуск и передача]
    Actions12 --> Denied7[❌ Модуль Аттестация]
    Denied7 --> Denied8[❌ Настройки производства]
    
    style AdminRights fill:#c8e6c9
    style HRRights fill:#fff9c4
    style SafetyRights fill:#fff9c4
    style TCRights fill:#e1bee7
```

---

## Легенда символов

- 🏭 Производственная организация
- 🎓 Учебный центр
- ⚙️ Настройки
- 📋 Аттестация
- 📚 Модуль Учебный центр
- 🔄 Автоматическая интеграция
- ✅ Действие разрешено
- ❌ Действие запрещено
- ⏳ Процесс в ожидании
- 📝 Документ создан
- 📤 Отправка данных
- 📥 Получение данных
