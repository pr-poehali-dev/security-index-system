# 🎯 План рефакторинга: Единая иерархия данных

## 📐 Бизнес-логика (как должно быть)

```
🏢 СУПЕРАДМИН
├── создает Tenant (основные организации)
├── создает Training Centers (учебные центры)
└── создает External Organizations (подрядчики на уровне системы)

👤 АДМИН ТЕНАНТА
├── создает Organizations (структура внутри тенанта)
│   ├── холдинги
│   ├── юр.лица
│   └── филиалы/подразделения
└── управляет подрядчиками тенанта (OrganizationContractor)

👥 ПОЛЬЗОВАТЕЛИ ТЕНАНТА
├── создают Facilities (объекты ОПО/ГТС)
│   └── привязаны к Organization внутри Tenant
├── создают Components (компоненты объектов)
└── создают планы обслуживания
```

## 🗂️ Текущее состояние (проблемы)

### ❌ Проблема 1: Объекты (Facilities) дублируются в 3 местах

```
facilitiesStore.ts (глобальный)
├── facilities: Facility[]
└── components: FacilityComponent[]

catalogStore.ts (глобальный)
├── organizations: CatalogOrganization[]
├── objects: IndustrialObject[]  ⚠️ ДУБЛИРОВАНИЕ!
└── documents: ObjectDocument[]

useFacilityCatalogStore.ts (локальный модуль)
├── facilities: Facility[]  ⚠️ ДУБЛИРОВАНИЕ!
├── components: Component[]  ⚠️ ДУБЛИРОВАНИЕ!
├── gtsSystems: GtsSystem[]  ⚠️ ДУБЛИРОВАНИЕ!
└── contractors: Contractor[]  ⚠️ ДУБЛИРОВАНИЕ!
```

### ❌ Проблема 2: Организации раздроблены

```
settingsStore.ts
└── organizations: Organization[]  ← Основные организации тенанта

catalogStore.ts
└── organizations: CatalogOrganization[]  ⚠️ ДУБЛИРОВАНИЕ с деревом!
```

### ❌ Проблема 3: Подрядчики в 2 местах

```
settingsStore.ts
└── contractors: OrganizationContractor[]  ← Подрядчики тенанта

useFacilityCatalogStore.ts
└── contractors: Contractor[]  ⚠️ ДУБЛИРОВАНИЕ!
```

## ✅ Целевая архитектура

### 1️⃣ settingsStore.ts (Настройки тенанта)

**Ответственность:** Структура организаций внутри тенанта

```typescript
interface SettingsState {
  // ✅ ОРГАНИЗАЦИИ ТЕНАНТА (иерархия)
  organizations: Organization[];
  departments: Department[];
  
  // ✅ ПЕРСОНАЛ
  people: Person[];
  personnel: Personnel[];
  positions: Position[];
  
  // ✅ ПОДРЯДЧИКИ ТЕНАНТА
  contractors: OrganizationContractor[];
  contractorFacilityAccesses: ContractorFacilityAccess[];
  
  // ✅ ВНЕШНИЕ ОРГАНИЗАЦИИ (учебные центры, РТН)
  externalOrganizations: ExternalOrganization[];
  
  // ✅ ПРОИЗВОДСТВЕННЫЕ ПЛОЩАДКИ
  productionSites: ProductionSite[];
  
  // Методы с фильтрацией по tenantId
  getOrganizationsByTenant(tenantId: string): Organization[];
  getContractorsByTenant(tenantId: string): OrganizationContractor[];
}
```

### 2️⃣ facilitiesStore.ts (Объекты ОПО/ГТС)

**Ответственность:** Объекты опасности и их компоненты

```typescript
interface FacilitiesState {
  // ✅ ОБЪЕКТЫ (ОПО, ГТС)
  facilities: Facility[];
  
  // ✅ КОМПОНЕНТЫ (ТУ, ЗС)
  components: FacilityComponent[];
  
  // ✅ СПРАВОЧНИКИ
  territorialAuthorities: TerritorialAuthority[];
  
  // Методы с фильтрацией по tenantId и organizationId
  getFacilitiesByTenant(tenantId: string): Facility[];
  getFacilitiesByOrganization(organizationId: string): Facility[];
  getComponentsByFacility(facilityId: string): FacilityComponent[];
}
```

### 3️⃣ useFacilityCatalogStore.ts (ТОЛЬКО локальные данные модуля)

**Ответственность:** Планирование обслуживания объектов

```typescript
interface FacilityCatalogStore {
  // ✅ ПЛАНИРОВАНИЕ ТД
  technicalDiagnostics: TechnicalDiagnostic[];
  
  // ✅ ПЛАНИРОВАНИЕ ЭПБ
  industrialSafetyExpertises: IndustrialSafetyExpertise[];
  
  // ✅ ХАРАКТЕРИСТИКИ ОПО
  opoCharacteristics: OpoCharacteristic[];
  
  // ❌ УДАЛИТЬ:
  // facilities ❌
  // components ❌
  // gtsSystems ❌
  // contractors ❌
}
```

### 4️⃣ ❌ УДАЛИТЬ catalogStore.ts

**Причина:** Полностью дублирует данные из settingsStore и facilitiesStore

```typescript
// ❌ УДАЛИТЬ ВЕСЬ ФАЙЛ
// organizations → settingsStore.organizations
// objects → facilitiesStore.facilities
// documents → facilitiesStore (или отдельный documentsStore)
```

## 🔧 План выполнения (пошагово)

### Шаг 1: Очистить useFacilityCatalogStore (20 мин)

```typescript
// src/modules/facility-catalog/store/useFacilityCatalogStore.ts

interface FacilityCatalogStore {
  // ❌ УДАЛИТЬ
  // facilities: Facility[];
  // components: Component[];
  // gtsSystems: GtsSystem[];
  // contractors: Contractor[];
  
  // ✅ ОСТАВИТЬ только планирование
  technicalDiagnostics: TechnicalDiagnostic[];
  industrialSafetyExpertises: IndustrialSafetyExpertise[];
  opoCharacteristics: OpoCharacteristic[];
}
```

**Файлы для обновления:**
- `src/modules/facility-catalog/store/useFacilityCatalogStore.ts`
- `src/modules/facility-catalog/data/mockData.ts` (удалить mockFacilities, mockComponents, mockContractors)

### Шаг 2: Обновить компоненты facility-catalog (30 мин)

```typescript
// ReportsTab.tsx
❌ const facilities = useFacilityCatalogStore(state => state.facilities);
❌ const contractors = useFacilityCatalogStore(state => state.contractors);

✅ const user = useAuthStore(state => state.user);
✅ const { getFacilitiesByTenant } = useFacilitiesStore();
✅ const { getContractorsByTenant } = useSettingsStore();
✅ const facilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
✅ const contractors = user?.tenantId ? getContractorsByTenant(user.tenantId) : [];
```

**Компоненты для обновления:**
- `src/modules/facility-catalog/components/tabs/ReportsTab.tsx`
- `src/modules/facility-catalog/components/OpoTab.tsx` (уже использует facilitiesStore ✅)
- `src/modules/facility-catalog/components/GtsTab.tsx` (уже использует facilitiesStore ✅)
- `src/modules/facility-catalog/components/ComponentsTab.tsx` (уже использует facilitiesStore ✅)
- `src/modules/facility-catalog/components/ContractorsTab.tsx` (уже использует settingsStore ✅)

### Шаг 3: Удалить catalogStore (10 мин)

```bash
# Найти все использования catalogStore
grep -r "useCatalogStore" src/

# Заменить на:
# - organizations → settingsStore.getOrganizationsByTenant()
# - objects → facilitiesStore.getFacilitiesByTenant()

# Удалить файл
rm src/stores/catalogStore.ts
```

**Компоненты для обновления:**
- `src/components/shared/OrganizationTree.tsx`
- `src/hooks/useCatalogNotifications.ts`
- `src/modules/dashboard/pages/DashboardPage.tsx`

### Шаг 4: Обновить типы (опционально, 15 мин)

Объединить дублирующиеся типы:

```typescript
// src/types/facilities.ts

// ✅ Единый тип объекта
export interface Facility {
  id: string;
  tenantId: string;
  organizationId: string;
  organizationName: string;
  type: 'opo' | 'gts';
  fullName: string;
  registrationNumber: string;
  // ...
}

// ❌ УДАЛИТЬ IndustrialObject из types/catalog.ts
```

## 📊 Финальная иерархия stores

```
authStore
├── User
└── tenantId (используется для фильтрации везде)

settingsStore (структура тенанта)
├── organizations: Organization[]
│   └── метод: getOrganizationsByTenant(tenantId)
├── contractors: OrganizationContractor[]
│   └── метод: getContractorsByTenant(tenantId)
├── personnel: Personnel[]
└── departments: Department[]

facilitiesStore (объекты и компоненты)
├── facilities: Facility[]
│   ├── метод: getFacilitiesByTenant(tenantId)
│   └── метод: getFacilitiesByOrganization(organizationId)
└── components: FacilityComponent[]
    └── метод: getComponentsByFacility(facilityId)

useFacilityCatalogStore (локальный модуль)
├── technicalDiagnostics: TechnicalDiagnostic[]
├── industrialSafetyExpertises: IndustrialSafetyExpertise[]
└── opoCharacteristics: OpoCharacteristic[]
```

## 🎯 Правила использования

### ✅ КАК ПРАВИЛЬНО

```typescript
// 1. Получить текущего пользователя
const user = useAuthStore(state => state.user);
const tenantId = user?.tenantId;

// 2. Получить организации тенанта
const { getOrganizationsByTenant } = useSettingsStore();
const organizations = tenantId ? getOrganizationsByTenant(tenantId) : [];

// 3. Получить объекты тенанта
const { getFacilitiesByTenant } = useFacilitiesStore();
const facilities = tenantId ? getFacilitiesByTenant(tenantId) : [];

// 4. Получить подрядчиков тенанта
const { getContractorsByTenant } = useSettingsStore();
const contractors = tenantId ? getContractorsByTenant(tenantId) : [];

// 5. Получить планирование обслуживания (локальный store модуля)
const { technicalDiagnostics } = useFacilityCatalogStore();
```

### ❌ КАК НЕПРАВИЛЬНО

```typescript
// ❌ НЕ использовать catalogStore (будет удален)
const { organizations, objects } = useCatalogStore();

// ❌ НЕ дублировать данные в локальных stores
const { facilities } = useFacilityCatalogStore(); // данные уже в facilitiesStore!

// ❌ НЕ хранить подрядчиков локально
const { contractors } = useFacilityCatalogStore(); // данные уже в settingsStore!
```

## 🚀 Приоритеты выполнения

### 🔴 КРИТИЧНО (сегодня)
1. ✅ Очистить useFacilityCatalogStore от дублирований
2. ✅ Обновить ReportsTab на использование глобальных stores
3. ✅ Удалить mockFacilities, mockContractors из mockData

### 🟡 ВАЖНО (завтра)
4. Заменить catalogStore → settingsStore + facilitiesStore
5. Удалить catalogStore.ts
6. Проверить все компоненты на корректность

### 🟢 ЖЕЛАТЕЛЬНО (на неделе)
7. Объединить дублирующиеся типы (Facility vs IndustrialObject)
8. Обновить документацию
9. Добавить unit-тесты для stores

## 📝 Итоги

### До рефакторинга:
- 3 store с Facilities (facilitiesStore, catalogStore, useFacilityCatalogStore)
- 2 store с Organizations (settingsStore, catalogStore)
- 2 store с Contractors (settingsStore, useFacilityCatalogStore)
- Путаница в компонентах - откуда брать данные?

### После рефакторинга:
- ✅ 1 источник для Facilities (facilitiesStore)
- ✅ 1 источник для Organizations (settingsStore)
- ✅ 1 источник для Contractors (settingsStore)
- ✅ Локальный store только для специфичных данных модуля
- ✅ Четкая иерархия: Tenant → Organization → Facility → Component
- ✅ Понятно где создавать и искать данные

**Экономия:** -7 файлов, -3000 строк кода, +100% понятности! 🎉
