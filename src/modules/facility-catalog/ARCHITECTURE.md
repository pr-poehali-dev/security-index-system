# Архитектура модуля Каталог объектов

## 🎯 Быстрая навигация

### Где какие данные хранятся?

| Данные | Store | Компоненты |
|--------|-------|------------|
| ОПО объекты | `facilitiesStore` (глобальный) | OpoTab, GtsTab |
| Компоненты оборудования | `facilitiesStore` (глобальный) | ComponentsTab |
| Подрядчики | `settingsStore` (глобальный) | ContractorsTab |
| Технические диагностики | `useFacilityCatalogStore` (локальный) | TechnicalDiagnosticsTab |
| Экспертизы ЭПБ | `useFacilityCatalogStore` (локальный) | IndustrialSafetyExpertiseTab |
| Характеристики ОПО | `useFacilityCatalogStore` (локальный) | OpoCharacteristicsTab |
| Аналитика | `useFacilityCatalogStore` (локальный) | ReportsTab |

## 🏗️ Структура файлов

```
facility-catalog/
│
├── 📁 data/
│   └── mockData.ts                    # Моковые данные для локального store
│
├── 📁 store/
│   └── useFacilityCatalogStore.ts     # Локальный store (планирование, аналитика)
│
├── 📁 components/
│   ├── OpoTab.tsx                     # Использует facilitiesStore
│   ├── GtsTab.tsx                     # Использует facilitiesStore
│   ├── ComponentsTab.tsx              # Использует facilitiesStore
│   ├── ContractorsTab.tsx             # Использует settingsStore
│   ├── TechnicalDiagnosticsTab.tsx    # Использует useFacilityCatalogStore
│   ├── IndustrialSafetyExpertiseTab.tsx # Использует useFacilityCatalogStore
│   ├── OpoCharacteristicsTab.tsx      # Использует useFacilityCatalogStore
│   └── tabs/
│       └── ReportsTab.tsx             # Использует оба типа stores
│
└── 📁 pages/
    └── FacilityCatalogPage.tsx        # Главная страница модуля
```

## 🔄 Потоки данных

### Глобальные данные (мультитенант)
```
User (tenantId) 
  → facilitiesStore/settingsStore 
  → OpoTab/GtsTab/ComponentsTab/ContractorsTab
```

### Локальные данные модуля
```
mockData.ts 
  → useFacilityCatalogStore 
  → TechnicalDiagnosticsTab/IndustrialSafetyExpertiseTab/ReportsTab
```

### Комбинированная аналитика
```
facilitiesStore (глобальные объекты)
     +
useFacilityCatalogStore (локальное планирование)
     ↓
ReportsTab (агрегированная аналитика)
```

## 📝 Правила разработки

### ✅ Делай так:
- Используй глобальные stores для данных, которые нужны всему приложению
- Используй локальный store для данных, специфичных только для этого модуля
- В ReportsTab комбинируй данные из обоих источников для аналитики
- Моковые данные храни в `data/mockData.ts`

### ❌ Не делай так:
- Не дублируй объекты ОПО в локальном store (они уже в facilitiesStore)
- Не храни данные подрядчиков локально (они в settingsStore)
- Не создавай локальные копии данных в компонентах
- Не смешивай логику глобальных и локальных stores

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

## 🎓 Примеры кода

Смотри подробные примеры в [README.md](./README.md)
