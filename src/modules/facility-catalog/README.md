# Модуль "Каталог объектов ОПО"

Модуль для управления опасными производственными объектами, оборудованием, подрядчиками и планирования работ.

## Архитектура

```
facility-catalog/
├── data/
│   └── mockData.ts              # Статичные моковые данные для инициализации
├── store/
│   └── useFacilityCatalogStore.ts  # Zustand store - централизованное управление состоянием
├── components/                   # React компоненты
└── pages/                        # Страницы модуля
```

## Принципы работы с данными

### 1. Моковые данные (`data/mockData.ts`)
- Статичные данные для инициализации store
- Только для чтения
- Используются как начальное состояние
- В будущем заменятся на данные из API

### 2. Store (`store/useFacilityCatalogStore.ts`)
- Единственный источник правды (Single Source of Truth)
- Управление состоянием всего модуля
- CRUD операции для всех сущностей
- Вспомогательные методы (фильтрация, поиск)

### 3. Компоненты
- Читают данные из store через хуки
- Вызывают методы store для изменения данных
- НЕ содержат локальных копий данных (кроме UI состояния)

## Использование Store

```typescript
import { useFacilityCatalogStore } from '../store/useFacilityCatalogStore';

function MyComponent() {
  // Читаем данные
  const facilities = useFacilityCatalogStore((state) => state.facilities);
  const addFacility = useFacilityCatalogStore((state) => state.addFacility);
  
  // Используем методы
  const handleAdd = () => {
    addFacility({ id: '5', name: 'Новый объект', ... });
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
