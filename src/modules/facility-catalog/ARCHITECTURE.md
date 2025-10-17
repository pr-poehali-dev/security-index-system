# 🏗️ Архитектура модуля Каталог объектов

## 🎯 Быстрая навигация

### Где какие данные хранятся?

| Данные | Store | Уровень доступа | Компоненты |
|--------|-------|----------------|------------|
| ОПО объекты | `facilitiesStore` | 👥 Пользователи тенанта | OpoTab, GtsTab |
| Компоненты оборудования | `facilitiesStore` | 👥 Пользователи тенанта | ComponentsTab |
| Организации | `settingsStore` | 👤 Админ тенанта | - |
| Подрядчики | `settingsStore` | 👤 Админ тенанта | ContractorsTab |
| Технические диагностики | `useFacilityCatalogStore` | 👥 Пользователи тенанта | TechnicalDiagnosticsTab |
| Экспертизы ЭПБ | `useFacilityCatalogStore` | 👥 Пользователи тенанта | IndustrialSafetyExpertiseTab |
| Характеристики ОПО | `useFacilityCatalogStore` | 👥 Пользователи тенанта | OpoCharacteristicsTab |
| Аналитика | `useFacilityCatalogStore` + глобальные | 👥 Пользователи тенанта | ReportsTab |

## 🏗️ Структура файлов

```
facility-catalog/
│
├── 📁 data/
│   └── mockData.ts                    # ТОЛЬКО планирование (ТД, ЭПБ, характеристики)
│
├── 📁 store/
│   └── useFacilityCatalogStore.ts     # Локальный store (ТОЛЬКО планирование)
│
├── 📁 components/
│   ├── OpoTab.tsx                     # ✅ Использует facilitiesStore
│   ├── GtsTab.tsx                     # ✅ Использует facilitiesStore
│   ├── ComponentsTab.tsx              # ✅ Использует facilitiesStore
│   ├── ContractorsTab.tsx             # ✅ Использует settingsStore
│   ├── TechnicalDiagnosticsTab.tsx    # ✅ Использует useFacilityCatalogStore
│   ├── IndustrialSafetyExpertiseTab.tsx # ✅ Использует useFacilityCatalogStore
│   ├── OpoCharacteristicsTab.tsx      # ✅ Использует useFacilityCatalogStore
│   └── tabs/
│       └── ReportsTab.tsx             # ✅ Комбинирует оба типа stores
│
└── 📁 pages/
    └── FacilityCatalogPage.tsx        # Главная страница модуля
```

## 🔄 Потоки данных

### Иерархия создания данных

```
🏢 СУПЕРАДМИН
├── создает Tenant (основные организации)
├── создает Training Centers (учебные центры)
└── создает External Organizations (подрядчики системы)

👤 АДМИН ТЕНАНТА
├── создает Organizations (структура внутри тенанта)
│   ├── холдинги
│   ├── юр.лица
│   └── филиалы/подразделения
└── управляет подрядчиками (OrganizationContractor)

👥 ПОЛЬЗОВАТЕЛИ ТЕНАНТА
├── создают Facilities (объекты ОПО/ГТС)
│   └── привязаны к Organization внутри Tenant
├── создают Components (компоненты объектов)
└── создают планы обслуживания (ТД, ЭПБ)
```

### Глобальные данные (мультитенант)

```
User (tenantId) 
  → facilitiesStore.getFacilitiesByTenant(tenantId)
  → OpoTab/GtsTab/ComponentsTab

User (tenantId)
  → settingsStore.getContractorsByTenant(tenantId)
  → ContractorsTab

User (tenantId)
  → settingsStore.getOrganizationsByTenant(tenantId)
  → Структура организаций
```

### Локальные данные модуля

```
mockData.ts 
  → useFacilityCatalogStore 
  → TechnicalDiagnosticsTab/IndustrialSafetyExpertiseTab/OpoCharacteristicsTab
```

### Комбинированная аналитика

```
facilitiesStore (глобальные объекты)
     +
settingsStore (подрядчики)
     +
useFacilityCatalogStore (локальное планирование)
     ↓
ReportsTab (агрегированная аналитика)
```

## 📝 Правила разработки

### ✅ Делай так:
- Используй `facilitiesStore` для объектов ОПО/ГТС/компонентов
- Используй `settingsStore` для организаций и подрядчиков
- Используй `useFacilityCatalogStore` ТОЛЬКО для планирования (ТД, ЭПБ, характеристики)
- Всегда фильтруй по `tenantId` из `authStore.user.tenantId`
- В ReportsTab комбинируй данные из глобальных и локального stores

### ❌ Не делай так:
- ❌ Не дублируй объекты ОПО в локальном store (они уже в facilitiesStore)
- ❌ Не храни данные подрядчиков локально (они в settingsStore)
- ❌ Не создавай локальные копии данных в компонентах
- ❌ Не смешивай логику глобальных и локальных stores
- ❌ Не импортируй удаленные mockFacilities, mockContractors

## 🚀 Быстрый старт

### Добавить новую сущность в локальный store

1. Добавь интерфейс в `data/mockData.ts`:
```typescript
export interface NewEntity {
  id: string;
  name: string;
  // ...
}

export const mockNewEntities: NewEntity[] = [...];
```

2. Добавь в store (`store/useFacilityCatalogStore.ts`):
```typescript
interface FacilityCatalogStore {
  newEntities: NewEntity[];
  addNewEntity: (entity: NewEntity) => void;
  // ...
}

export const useFacilityCatalogStore = create<FacilityCatalogStore>((set) => ({
  newEntities: mockNewEntities,
  addNewEntity: (entity) =>
    set((state) => ({ newEntities: [...state.newEntities, entity] })),
  // ...
}));
```

3. Используй в компоненте:
```typescript
const newEntities = useFacilityCatalogStore((state) => state.newEntities);
const addNewEntity = useFacilityCatalogStore((state) => state.addNewEntity);
```

### Получить данные из глобальных stores

```typescript
import { useAuthStore } from '@/stores/authStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useSettingsStore } from '@/stores/settingsStore';

function MyComponent() {
  // 1. Получить tenantId
  const user = useAuthStore((state) => state.user);
  const tenantId = user?.tenantId;
  
  // 2. Получить объекты тенанта
  const { getFacilitiesByTenant } = useFacilitiesStore();
  const facilities = tenantId ? getFacilitiesByTenant(tenantId) : [];
  
  // 3. Получить подрядчиков тенанта
  const { getContractorsByTenant } = useSettingsStore();
  const contractors = tenantId ? getContractorsByTenant(tenantId) : [];
  
  return <div>...</div>;
}
```

## 🎓 Примеры кода

Смотри подробные примеры в [README.md](./README.md)
