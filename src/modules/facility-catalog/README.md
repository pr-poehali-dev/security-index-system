# Модуль "Каталог объектов ОПО"

Модуль для управления опасными производственными объектами, оборудованием, подрядчиками и планирования работ.

## 🏗️ Архитектура

```
facility-catalog/
├── data/
│   └── mockData.ts                 # Моковые данные ТОЛЬКО для планирования (ТД, ЭПБ, характеристики)
├── store/
│   └── useFacilityCatalogStore.ts  # Локальный store ТОЛЬКО для планирования
├── components/                     # React компоненты
└── pages/                          # Страницы модуля
```

## 📊 Разделение ответственности stores

### ✅ Глобальные stores (единые точки входа)

| Store | Данные | Кто создает | Компоненты |
|-------|--------|-------------|------------|
| `facilitiesStore` | Объекты ОПО, ГТС, компоненты | 👥 Пользователи тенанта | OpoTab, GtsTab, ComponentsTab, ReportsTab |
| `settingsStore` | Организации, подрядчики | 👤 Админ тенанта | ContractorsTab, ReportsTab |
| `authStore` | Текущий пользователь, tenantId | Система | Все компоненты |

### ✅ Локальный store модуля (специфичные данные)

| Store | Данные | Кто создает | Компоненты |
|-------|--------|-------------|------------|
| `useFacilityCatalogStore` | Планирование: ТД, ЭПБ, характеристики | 👥 Пользователи тенанта | TechnicalDiagnosticsTab, IndustrialSafetyExpertiseTab, OpoCharacteristicsTab, ReportsTab |

## 🔄 Потоки данных

### ✅ Правильная иерархия

```
🏢 СУПЕРАДМИН создает:
├── Tenants (компании-клиенты)
└── Training Centers (учебные центры)

👤 АДМИН ТЕНАНТА создает:
├── Organizations (структура внутри тенанта: холдинги, юр.лица, филиалы)
└── Contractors (подрядчики тенанта)

👥 ПОЛЬЗОВАТЕЛИ ТЕНАНТА создают:
├── Facilities (объекты ОПО/ГТС внутри организаций)
├── Components (компоненты объектов)
└── Планы обслуживания (ТД, ЭПБ)
```

### ✅ Получение данных в компонентах

```typescript
// 1. Получить текущего пользователя и tenantId
const user = useAuthStore(state => state.user);
const tenantId = user?.tenantId;

// 2. Получить объекты тенанта (из глобального store)
const { getFacilitiesByTenant } = useFacilitiesStore();
const facilities = tenantId ? getFacilitiesByTenant(tenantId) : [];

// 3. Получить подрядчиков тенанта (из глобального store)
const { getContractorsByTenant } = useSettingsStore();
const contractors = tenantId ? getContractorsByTenant(tenantId) : [];

// 4. Получить планирование (из локального store модуля)
const { technicalDiagnostics } = useFacilityCatalogStore();
```

## 📝 Правила разработки

### ✅ Делай так:
- **Объекты ОПО/ГТС** → ВСЕГДА из `facilitiesStore.getFacilitiesByTenant()`
- **Подрядчики** → ВСЕГДА из `settingsStore.getContractorsByTenant()`
- **Организации** → ВСЕГДА из `settingsStore.getOrganizationsByTenant()`
- **Планирование ТД/ЭПБ** → ТОЛЬКО из `useFacilityCatalogStore`
- **TenantId** → ВСЕГДА из `useAuthStore().user.tenantId`
- Моковые данные храни ТОЛЬКО для планирования в `data/mockData.ts`

### ❌ Не делай так:
- ❌ НЕ дублируй объекты ОПО в локальном store (используй `facilitiesStore`)
- ❌ НЕ храни подрядчиков локально (используй `settingsStore`)
- ❌ НЕ создавай копии данных из глобальных stores
- ❌ НЕ забывай фильтровать по `tenantId` при получении данных
- ❌ НЕ импортируй удаленные mockFacilities, mockContractors

## 🎯 Использование Stores

### Пример 1: Использование только локального store

```typescript
import { useFacilityCatalogStore } from '../store/useFacilityCatalogStore';

function TechnicalDiagnosticsTab() {
  const diagnostics = useFacilityCatalogStore((state) => state.technicalDiagnostics);
  const addDiagnostic = useFacilityCatalogStore((state) => state.addTechnicalDiagnostic);
  
  const handleAdd = () => {
    addDiagnostic({ id: '6', equipmentName: 'Котел №2', ... });
  };
  
  return <div>...</div>;
}
```

### Пример 2: Использование глобального store

```typescript
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useAuthStore } from '@/stores/authStore';

function OpoTab() {
  const user = useAuthStore((state) => state.user);
  const { getFacilitiesByTenant } = useFacilitiesStore();
  const facilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
  
  return <div>...</div>;
}
```

### Пример 3: Комбинирование обоих stores (ReportsTab)

```typescript
import { useFacilityCatalogStore } from '../store/useFacilityCatalogStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';

function ReportsTab() {
  // 1. Получить текущий tenantId
  const user = useAuthStore((state) => state.user);
  const tenantId = user?.tenantId;
  
  // 2. Получить глобальные данные (мультитенант)
  const { getFacilitiesByTenant } = useFacilitiesStore();
  const { getContractorsByTenant } = useSettingsStore();
  const facilities = tenantId ? getFacilitiesByTenant(tenantId) : [];
  const contractors = tenantId ? getContractorsByTenant(tenantId) : [];
  
  // 3. Получить локальные данные модуля (планирование)
  const diagnostics = useFacilityCatalogStore((state) => state.technicalDiagnostics);
  const expertises = useFacilityCatalogStore((state) => state.industrialSafetyExpertises);
  
  // 4. Агрегированная аналитика
  const analytics = {
    totalFacilities: facilities.length,
    totalContractors: contractors.length,
    upcomingInspections: [...diagnostics, ...expertises].filter(
      item => item.status === 'planned'
    ).length,
  };
  
  return <div>...</div>;
}
```

## 📦 Сущности

### Technical Diagnostics (Технические диагностики)
- План-график диагностик оборудования
- Статусы: planned, in-progress, completed, overdue
- **Store:** `useFacilityCatalogStore`

### Industrial Safety Expertises (ЭПБ)
- План-график экспертиз промышленной безопасности
- Привязаны к объектам ОПО
- **Store:** `useFacilityCatalogStore`

### OPO Characteristics (Характеристики ОПО)
- Технические параметры объектов
- Группируются по категориям
- **Store:** `useFacilityCatalogStore`

### Facilities (Объекты ОПО)
- Котельные, газопроводы, резервуары, компрессорные
- **Store:** `facilitiesStore` (глобальный)

### Components (Компоненты оборудования)
- Котлы, насосы, трубопроводы
- **Store:** `facilitiesStore` (глобальный)

### Contractors (Подрядчики)
- Организации, выполняющие работы
- **Store:** `settingsStore` (глобальный)

## 🔄 Миграция на реальное API

Когда появится бэкенд, достаточно обновить только store:

1. Заменить начальное состояние на `[]`
2. Добавить асинхронные actions с fetch/axios
3. Добавить loading/error состояния
4. Компоненты останутся без изменений!

```typescript
export const useFacilityCatalogStore = create<FacilityCatalogStore>((set, get) => ({
  technicalDiagnostics: [], // Вместо mockTechnicalDiagnostics
  isLoading: false,
  error: null,
  
  fetchTechnicalDiagnostics: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/technical-diagnostics');
      const data = await response.json();
      set({ technicalDiagnostics: data, isLoading: false });
    } catch (error) {
      set({ error, isLoading: false });
    }
  },
}));
```

## ✅ Преимущества архитектуры

✅ Нет дублирования данных между stores  
✅ Единые точки входа для каждой сущности  
✅ Четкая иерархия: Tenant → Organization → Facility → Component  
✅ Легкая замена моков на API  
✅ Переиспользование данных между компонентами  
✅ Простое тестирование  
✅ TypeScript типизация всех данных  
✅ Чистый код в компонентах
