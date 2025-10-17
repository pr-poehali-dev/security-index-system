# Модуль "Каталог объектов ОПО"

Модуль для управления опасными производственными объектами, оборудованием, подрядчиками и планирования работ.

## Архитектура

```
facility-catalog/
├── data/
│   └── mockData.ts                 # Статичные моковые данные для инициализации
├── store/
│   └── useFacilityCatalogStore.ts  # Локальный store модуля (специфичные данные)
├── components/                     # React компоненты
└── pages/                          # Страницы модуля
```

## Разделение ответственности stores

### Глобальные stores (из `/stores`)
- **facilitiesStore** - управление объектами ОПО, ГТС, компонентами (используется в OpoTab, GtsTab, ComponentsTab)
- **settingsStore** - управление организациями, подрядчиками (используется в ContractorsTab)
- **authStore** - аутентификация, текущий пользователь, мультитенантность

### Локальный store модуля (`useFacilityCatalogStore`)
- **Технические диагностики** - планирование ТД (TechnicalDiagnosticsTab)
- **Экспертизы ЭПБ** - планирование экспертиз промышленной безопасности (IndustrialSafetyExpertiseTab)
- **Характеристики ОПО** - параметры объектов (OpoCharacteristicsTab)
- **Аналитика** - агрегированные данные для отчетов (ReportsTab)

**Почему такое разделение?**
- Глобальные stores используются во всём приложении (мультитенантность, общие сущности)
- Локальный store содержит специфичные для модуля данные планирования и аналитики
- Избегаем дублирования логики и конфликтов данных
- Моковые данные в локальном store независимы от глобальных

## Принципы работы с данными

### 1. Моковые данные (`data/mockData.ts`)
- Статичные данные для инициализации локального store
- Только для чтения
- Используются как начальное состояние
- В будущем заменятся на данные из API

### 2. Локальный Store (`store/useFacilityCatalogStore.ts`)
- Управление специфичными для модуля данными
- CRUD операции для планирования и аналитики
- Вспомогательные методы (фильтрация, поиск, агрегация)
- Не пересекается с глобальными stores

### 3. Компоненты
- Используют глобальные stores для общих данных (объекты, подрядчики)
- Используют локальный store для специфичных данных (планирование, аналитика)
- НЕ содержат локальных копий данных (кроме UI состояния)

## Использование Stores

### Пример 1: Использование только локального store

```typescript
import { useFacilityCatalogStore } from '../store/useFacilityCatalogStore';

function TechnicalDiagnosticsTab() {
  // Читаем данные из локального store
  const diagnostics = useFacilityCatalogStore((state) => state.technicalDiagnostics);
  const addDiagnostic = useFacilityCatalogStore((state) => state.addTechnicalDiagnostic);
  
  // Используем методы
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
  // Читаем данные из глобальных stores
  const user = useAuthStore((state) => state.user);
  const { getFacilitiesByTenant } = useFacilitiesStore();
  const facilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
  
  return <div>...</div>;
}
```

### Пример 3: Комбинирование обоих stores

```typescript
import { useFacilityCatalogStore } from '../store/useFacilityCatalogStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useAuthStore } from '@/stores/authStore';

function ReportsTab() {
  // Глобальные данные (мультитенант)
  const user = useAuthStore((state) => state.user);
  const { getFacilitiesByTenant } = useFacilitiesStore();
  const globalFacilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
  
  // Локальные данные модуля (планирование)
  const diagnostics = useFacilityCatalogStore((state) => state.technicalDiagnostics);
  const expertises = useFacilityCatalogStore((state) => state.industrialSafetyExpertises);
  
  // Агрегированная аналитика
  const analytics = {
    totalFacilities: globalFacilities.length,
    upcomingInspections: [...diagnostics, ...expertises].filter(
      item => item.status === 'planned'
    ).length,
  };
  
  return <div>...</div>;
}
```

## Сущности

### Facilities (Объекты ОПО)
- Котельные, газопроводы, резервуары, компрессорные
- Регистрационные данные, адреса, характеристики

### Components (Компоненты оборудования)
- Привязаны к объектам через `facilityId`
- Котлы, насосы, трубопроводы, резервуары

### GTS Systems (Системы газоснабжения)
- Магистральные, распределительные газопроводы

### Contractors (Подрядчики)
- Организации, выполняющие работы
- Аккредитации, контакты, статистика

### Technical Diagnostics (Технические диагностики)
- План-график диагностик оборудования
- Статусы: planned, in-progress, completed, overdue

### Industrial Safety Expertises (ЭПБ)
- План-график экспертиз промышленной безопасности
- Привязаны к объектам ОПО

### OPO Characteristics (Характеристики ОПО)
- Технические параметры объектов
- Группируются по категориям

## Миграция на реальное API

Когда появится бэкенд, достаточно обновить только store:

1. Заменить начальное состояние на `[]`
2. Добавить асинхронные actions с fetch/axios
3. Добавить loading/error состояния
4. Компоненты останутся без изменений!

```typescript
// Пример будущей миграции
export const useFacilityCatalogStore = create<FacilityCatalogStore>((set, get) => ({
  facilities: [], // Вместо mockFacilities
  isLoading: false,
  error: null,
  
  fetchFacilities: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/facilities');
      const data = await response.json();
      set({ facilities: data, isLoading: false });
    } catch (error) {
      set({ error, isLoading: false });
    }
  },
  
  // ...остальные методы
}));
```

## Преимущества архитектуры

✅ Централизованное управление состоянием
✅ Легкая замена моков на API
✅ Переиспользование данных между компонентами
✅ Простое тестирование
✅ TypeScript типизация всех данных
✅ Чистый код в компонентах