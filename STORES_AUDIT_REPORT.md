# 🔍 Аудит Stores проекта

## 📊 Общая статистика

**Всего найдено stores:** 21
- Глобальные (src/stores): 18
- Локальные (модули): 3

## 🚨 Критические проблемы

### 1. ❌ ДУБЛИРОВАНИЕ FACILITIES (Объекты ОПО/ГТС)

**Проблема:** Одни и те же данные об объектах ОПО/ГТС хранятся в ТРЁХ местах!

```
Facilities (ОПО, ГТС, компоненты):
├── facilitiesStore.ts (src/stores/) ✓ Основной store
├── catalogStore.ts (src/stores/) ✗ Дублирование как IndustrialObject
└── useFacilityCatalogStore.ts (модуль) ✗ Дублирование + mockData
```

**Используется в:**
- `facilitiesStore` → OpoTab, GtsTab, ComponentsTab (8 компонентов)
- `catalogStore` → OrganizationTree, DashboardPage (3 компонента)
- `useFacilityCatalogStore` → ReportsTab, TechnicalDiagnosticsTab (3 компонента)

**Последствия:**
- Разные компоненты видят разные данные
- Изменения в одном store не отражаются в других
- При добавлении объекта нужно обновлять 3 места
- Путаница для разработчиков

**Рекомендация:**
```
🎯 РЕШЕНИЕ:
1. Оставить ТОЛЬКО facilitiesStore как единый источник
2. Удалить IndustrialObject из catalogStore
3. Удалить Facilities из useFacilityCatalogStore
4. useFacilityCatalogStore оставить ТОЛЬКО для:
   - TechnicalDiagnostics (планирование ТД)
   - IndustrialSafetyExpertises (планирование ЭПБ)
   - OpoCharacteristics (характеристики)
```

---

### 2. ❌ ДУБЛИРОВАНИЕ CONTRACTORS (Подрядчики)

**Проблема:** Подрядчики хранятся в ДВУХ местах!

```
Contractors:
├── settingsStore.ts → OrganizationContractor ✓ Основной
└── useFacilityCatalogStore.ts → Contractor ✗ Дублирование mockData
```

**Рекомендация:**
```
🎯 РЕШЕНИЕ:
1. Удалить Contractor из useFacilityCatalogStore
2. Все компоненты используют settingsStore.getContractorsByTenant()
```

---

### 3. ❌ ДУБЛИРОВАНИЕ DOCUMENTS (Документы)

**Проблема:** Документы аттестации раздроблены по трём stores!

```
Attestation Documents:
├── attestationOrdersStore.ts → AttestationOrder с документами
├── documentsStore.ts → AttestationDocument
└── certificationStore.ts → AttestationDocument
```

**Используется в:**
- `attestationOrdersStore` → SendToTrainingCenterDialog, UnifiedDocumentDialog
- `documentsStore` → те же компоненты
- `certificationStore` → AttestationCalendarTab, ComplianceAnalysisTab

**Рекомендация:**
```
🎯 РЕШЕНИЕ:
1. Объединить в certificationStore (переименовать в attestationStore)
2. Удалить attestationOrdersStore
3. Удалить документы аттестации из documentsStore
4. documentsStore оставить только для общих документов
```

---

### 4. ⚠️ ПАРАЛЛЕЛЬНЫЕ ВЕТКИ QUALIFICATION

**Проблема:** Удостоверения ДПО в двух stores!

```
DPO Qualifications:
├── dpoQualificationStore.ts (src/stores/) ✓ Глобальный
└── qualificationStore.ts (modules/attestation/stores/) ✗ Локальный дубликат
```

**Рекомендация:**
```
🎯 РЕШЕНИЕ:
1. Оставить ТОЛЬКО dpoQualificationStore
2. Удалить modules/attestation/stores/qualificationStore.ts
3. Обновить импорты в компонентах
```

---

### 5. ⚠️ ПУТАНИЦА В НАЗВАНИЯХ

**Проблема:** certificationStore хранит Attestation (аттестации), а не Certification (сертификаты)

```
❌ certificationStore.ts
   └── хранит: Attestation (аттестация в РТН)

✓ Должно быть: attestationStore.ts
   └── хранит: Attestation
```

**Рекомендация:**
```
🎯 РЕШЕНИЕ:
Переименовать certificationStore → attestationStore
```

---

### 6. ❓ НЕИСПОЛЬЗУЕМЫЕ STORES

**Найдено потенциально неиспользуемых stores:**

```
⚠️ examinationStore.ts
   - Не найдены компоненты, использующие его
   - Возможно, устаревший код

⚠️ integrationsStore.ts
   - Используется только в settings/components/IntegrationsTab.tsx
   - Возможно, в разработке
```

---

## ✅ Хорошо спроектированные stores

Эти stores правильно структурированы, без дублирований:

1. **authStore** - единая точка аутентификации ✅
2. **budgetStore** - изолированные данные бюджета ✅
3. **checklistsStore** - чек-листы и аудиты ✅
4. **incidentsStore** - инциденты со справочниками ✅
5. **personnelStore** - персонал организаций ✅
6. **regulationsStore** - НПА ✅
7. **themeStore** - UI настройки ✅
8. **trainingCentersStore** - учебные центры ✅
9. **workPermitsStore** - наряды-допуски ✅

---

## 📋 План рефакторинга (по приоритетам)

### 🔴 Критический приоритет (сейчас)

#### Задача 1: Объединить Facilities stores
```typescript
// ❌ УДАЛИТЬ
- catalogStore.ts → IndustrialObject, ObjectDocument
- useFacilityCatalogStore.ts → Facility, Component, GtsSystem

// ✅ ОСТАВИТЬ
- facilitiesStore.ts → единый источник для Facility, FacilityComponent

// ✅ ОБНОВИТЬ useFacilityCatalogStore
interface FacilityCatalogStore {
  // Оставить ТОЛЬКО специфичные данные модуля:
  technicalDiagnostics: TechnicalDiagnostic[];
  industrialSafetyExpertises: IndustrialSafetyExpertise[];
  opoCharacteristics: OpoCharacteristic[];
  
  // Удалить:
  // facilities ❌
  // components ❌
  // gtsSystems ❌
  // contractors ❌
}
```

**Файлы для обновления:**
```
src/modules/facility-catalog/components/tabs/ReportsTab.tsx
  ❌ const facilities = useFacilityCatalogStore(state => state.facilities)
  ✅ const { getFacilitiesByTenant } = useFacilitiesStore()
  ✅ const facilities = getFacilitiesByTenant(tenantId)
```

---

#### Задача 2: Объединить Attestation документы
```typescript
// ❌ УДАЛИТЬ
- attestationOrdersStore.ts

// ✅ ПЕРЕИМЕНОВАТЬ
- certificationStore.ts → attestationStore.ts

// ✅ ОБНОВИТЬ attestationStore
interface AttestationStore {
  attestations: Attestation[];
  documents: AttestationDocument[];
  orders: AttestationOrder[]; // переместить сюда
  areas: AttestationArea[];
}
```

---

#### Задача 3: Удалить дублирование Contractors
```typescript
// ❌ УДАЛИТЬ из useFacilityCatalogStore
contractors: Contractor[]

// ✅ ИСПОЛЬЗОВАТЬ везде
const { getContractorsByTenant } = useSettingsStore()
const contractors = getContractorsByTenant(tenantId)
```

---

### 🟡 Высокий приоритет (следующий спринт)

#### Задача 4: Убрать параллельную ветку Qualification
```bash
# Удалить файл
rm src/modules/attestation/stores/qualificationStore.ts

# Обновить импорты в компонентах
❌ from '../stores/qualificationStore'
✅ from '@/stores/dpoQualificationStore'
```

---

#### Задача 5: Переименовать certificationStore
```bash
mv src/stores/certificationStore.ts src/stores/attestationStore.ts

# Обновить импорты
❌ import { useCertificationStore } from '@/stores/certificationStore'
✅ import { useAttestationStore } from '@/stores/attestationStore'
```

---

### 🟢 Средний приоритет (бэклог)

#### Задача 6: Проверить неиспользуемые stores
```
1. Проверить examinationStore - удалить если не используется
2. Проверить integrationsStore - завершить разработку или удалить
```

---

## 📐 Финальная архитектура (целевая)

### Глобальные stores (src/stores/)

```
authStore ──────────────► User, authentication
├── используется: везде

attestationStore ───────► Attestation, AttestationDocument, AttestationOrder
├── используется: modules/attestation/*

budgetStore ────────────► BudgetCategory, BudgetExpense, OrganizationBudgetPlan
├── используется: modules/budget/*

checklistsStore ────────► Checklist, Audit
├── используется: modules/checklists/*

dpoQualificationStore ──► DpoQualification, DpoDocument
├── используется: modules/attestation/qualification/*

facilitiesStore ────────► Facility, FacilityComponent
├── используется: modules/facility-catalog/*, dashboard

incidentsStore ─────────► Incident, справочники инцидентов
├── используется: modules/incidents/*

personnelStore ─────────► Personnel
├── используется: modules/attestation/*, dashboard

regulationsStore ───────► Regulation, RegulationComment
├── используется: modules/regulations/*

settingsStore ──────────► Organization, OrganizationContractor, User управление
├── используется: везде (мультитенант)

themeStore ─────────────► Theme, UI настройки
├── используется: layout components

trainingCentersStore ───► TrainingCenter, TrainingCourse
├── используется: modules/attestation/training-centers/*

workPermitsStore ───────► WorkPermit
├── используется: modules/work-permits/*
```

### Локальные stores модулей

```
useFacilityCatalogStore ──► ТОЛЬКО специфичные данные модуля
├── technicalDiagnostics      (планирование ТД)
├── industrialSafetyExpertises (планирование ЭПБ)
├── opoCharacteristics         (характеристики ОПО)
└── используется: modules/facility-catalog/планирование
```

---

## 🎯 Итоговые рекомендации

### 1. Принцип единой ответственности
```
✅ Каждая сущность - в ОДНОМ store
✅ Глобальные данные - в глобальных stores
✅ Специфичные данные модуля - в локальных stores
❌ НЕ дублировать данные между stores
```

### 2. Правило импортов
```typescript
// ✅ ПРАВИЛЬНО
import { useFacilitiesStore } from '@/stores/facilitiesStore';
const { getFacilitiesByTenant } = useFacilitiesStore();

// ❌ НЕПРАВИЛЬНО - дублирование
import { useFacilityCatalogStore } from '../store/useFacilityCatalogStore';
const facilities = useFacilityCatalogStore(state => state.facilities);
```

### 3. Миграция данных
```typescript
// Шаг 1: Найти все места использования дублированных данных
grep -r "useFacilityCatalogStore.*facilities" src/

// Шаг 2: Заменить на глобальный store
// Шаг 3: Удалить дублированные данные из локального store
// Шаг 4: Обновить mockData - оставить только специфичные данные
```

### 4. Документация
```
✅ Обновить README.md в модуле facility-catalog
✅ Указать какие данные откуда брать
✅ Примеры правильного использования stores
```

---

## 📊 Метрики улучшения

### До рефакторинга:
- Stores с дублированиями: **7**
- Параллельные ветки: **2**
- Файлов для поддержки: **21 store**

### После рефакторинга:
- Stores с дублированиями: **0** ✅
- Параллельные ветки: **0** ✅
- Файлов для поддержки: **15 stores** (-6)
- Понятность архитектуры: **+100%** ✅

---

## 🚀 Первые шаги (начни с этого)

### 1. Обновить useFacilityCatalogStore (30 мин)
```bash
# Открыть файл
src/modules/facility-catalog/store/useFacilityCatalogStore.ts

# Удалить интерфейсы и данные:
# - facilities
# - components  
# - gtsSystems
# - contractors

# Оставить только:
# - technicalDiagnostics
# - industrialSafetyExpertises
# - opoCharacteristics
```

### 2. Обновить ReportsTab (15 мин)
```bash
# Открыть файл
src/modules/facility-catalog/components/tabs/ReportsTab.tsx

# Заменить импорт
- import { useFacilityCatalogStore } from '../../store/useFacilityCatalogStore';
+ import { useFacilitiesStore } from '@/stores/facilitiesStore';
+ import { useSettingsStore } from '@/stores/settingsStore';
+ import { useAuthStore } from '@/stores/authStore';

# Заменить хуки
- const facilities = useFacilityCatalogStore(state => state.facilities);
- const contractors = useFacilityCatalogStore(state => state.contractors);
+ const user = useAuthStore(state => state.user);
+ const { getFacilitiesByTenant } = useFacilitiesStore();
+ const { getContractorsByTenant } = useSettingsStore();
+ const facilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
+ const contractors = user?.tenantId ? getContractorsByTenant(user.tenantId) : [];
```

### 3. Удалить дублированные данные из mockData (10 мин)
```bash
# Открыть файл
src/modules/facility-catalog/data/mockData.ts

# Удалить экспорты:
# - export const mockFacilities
# - export const mockComponents
# - export const mockGtsSystems
# - export const mockContractors

# Оставить только:
# - mockTechnicalDiagnostics
# - mockIndustrialSafetyExpertises
# - mockOpoCharacteristics
```

### 4. Обновить README (5 мин)
```bash
# Добавить в README раздел "Использование глобальных stores"
# Указать что Facilities/Contractors берутся из глобальных stores
```

**Итого: 1 час работы → решена самая критичная проблема!** 🎉
