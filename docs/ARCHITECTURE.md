# 🏗️ Архитектура системы "Индекс Безопасности"

> Технический обзор: стек, структура проекта, принципы разработки

---

## 📋 Содержание

1. [Технологический стек](#технологический-стек)
2. [Структура проекта](#структура-проекта)
3. [Архитектурные принципы](#архитектурные-принципы)
4. [State Management](#state-management)
5. [Роутинг](#роутинг)
6. [UI компоненты](#ui-компоненты)
7. [Backend функции](#backend-функции)
8. [Конфигурация](#конфигурация)

---

## 🛠️ Технологический стек

### Frontend

| Категория | Технология | Версия | Назначение |
|-----------|------------|--------|------------|
| **Фреймворк** | React | 18.3.1 | UI библиотека |
| **Язык** | TypeScript | 5.5.3 | Статическая типизация |
| **Сборщик** | Vite (Rolldown) | 7.1.13 | Быстрая сборка |
| **Маршрутизация** | React Router DOM | 6.26.2 | Клиентский роутинг |
| **State Management** | Zustand | 5.0.8 | Глобальное состояние |
| **Формы** | React Hook Form | 7.53.0 | Управление формами |
| **Валидация** | Zod | 3.23.8 | Схемы валидации |
| **UI библиотека** | Radix UI + shadcn/ui | Latest | Компоненты |
| **Стилизация** | Tailwind CSS | 3.4.11 | Utility-first CSS |
| **Иконки** | Lucide React | 0.462.0 | SVG иконки |
| **Графики** | Recharts | 3.2.1 | Диаграммы |
| **Дата** | date-fns | 4.1.0 | Работа с датами |
| **Уведомления** | Sonner | 1.5.0 | Toast уведомления |
| **Тема** | next-themes | 0.3.0 | Dark mode |
| **Запросы** | TanStack Query | 5.56.2 | Кеширование |
| **Экспорт** | jsPDF, XLSX | 3.0.3, 0.18.5 | PDF и Excel |
| **Виртуализация** | react-window | 1.8.10 | Длинные списки |

### Backend

| Технология | Назначение |
|------------|------------|
| **Node.js** | Runtime для TypeScript функций |
| **Python 3.x** | Функции напоминаний (send-reminders) |
| **PostgreSQL** | Реляционная база данных |
| **Flyway** | Миграции БД |

### Инструменты разработки

| Инструмент | Назначение |
|------------|------------|
| **npm** | Управление зависимостями |
| **ESLint** | Линтинг кода (TypeScript ESLint 8.44.1) |
| **PostCSS** | Обработка CSS |
| **Autoprefixer** | Вендорные префиксы CSS |
| **SWC** | Быстрый компилятор React |

---

## 📂 Структура проекта

```
security-index-system/
├── src/                          # Исходный код
│   ├── components/               # Общие компоненты
│   │   ├── app/                 # AppProviders, AppRoutes, ProtectedRoute
│   │   ├── common/              # Переиспользуемые компоненты
│   │   ├── dashboard/           # NotificationsWidget, ReportPeriodSelector
│   │   ├── layout/              # Sidebar, PageHeader
│   │   ├── shared/              # Общие бизнес-компоненты
│   │   ├── ui/                  # 68 shadcn/ui компонентов
│   │   └── widgets/             # DeadlineCalendar
│   │
│   ├── modules/                 # 17 функциональных модулей
│   │   ├── attestation/         # Аттестация персонала
│   │   ├── audit/               # Аудит ПБ
│   │   ├── auth/                # Авторизация
│   │   ├── budget/              # Бюджетирование
│   │   ├── catalog/             # Каталог объектов и подрядчиков
│   │   ├── checklists/          # Чек-листы
│   │   ├── common/              # NotFoundPage
│   │   ├── dashboard/           # Главная панель
│   │   ├── examination/         # Техническое диагностирование
│   │   ├── incidents/           # Инциденты
│   │   ├── knowledge-base/      # База знаний
│   │   ├── maintenance/         # Обслуживание
│   │   ├── notifications/       # Уведомления
│   │   ├── settings/            # Настройки
│   │   ├── tasks/               # Задачи
│   │   ├── tenants/             # Тенанты
│   │   └── training-center/     # Учебный центр
│   │
│   ├── stores/                  # 23 Zustand stores
│   │   ├── authStore.ts
│   │   ├── catalogStore.ts
│   │   ├── incidentsStore.ts
│   │   ├── taskStore.ts
│   │   ├── uiStore.ts          # Тема, sidebar
│   │   └── ...                  # Остальные 18 stores
│   │
│   ├── config/                  # Конфигурация
│   │   └── routes.tsx          # Lazy loading страниц
│   │
│   ├── constants/               # Константы приложения
│   ├── hooks/                   # Кастомные хуки
│   │   └── useThemeInitialization.ts
│   ├── lib/                     # Утилиты и константы
│   ├── types/                   # TypeScript типы
│   ├── utils/                   # Вспомогательные функции
│   │
│   ├── App.tsx                  # Главный компонент
│   ├── main.tsx                 # Точка входа
│   └── index.css                # Глобальные стили
│
├── db_migrations/               # Миграции PostgreSQL
│   ├── V0001__create_system_users_tables.sql
│   └── V0002__create_contractors_tables.sql
│
├── backend/                     # Backend функции
│   └── send-reminders/         # Python функция напоминаний
│
├── docs/                        # Документация
│   ├── README.md               # Главная документация
│   ├── MODULES.md              # Описание модулей
│   ├── ARCHITECTURE.md         # Этот файл
│   ├── DATABASE.md             # Схема БД
│   ├── USER_GUIDE.md           # Руководство пользователя
│   ├── DATABASE_SCHEMA.sql     # Полная схема БД
│   ├── ENTITIES.md             # Справочник сущностей
│   ├── ENTITY_RELATIONSHIPS.md # ER-диаграмма
│   ├── SAMPLE_DATA.sql         # Тестовые данные
│   ├── USEFUL_QUERIES.sql      # Полезные запросы
│   ├── DEPLOYMENT_GUIDE.md     # Развертывание
│   └── EMAIL_SETUP.md          # Настройка почты
│
├── public/                      # Статические файлы
├── node_modules/                # Зависимости
│
├── package.json                 # Конфигурация npm
├── tsconfig.json                # Конфигурация TypeScript
├── vite.config.ts               # Конфигурация Vite
├── tailwind.config.ts           # Конфигурация Tailwind
├── eslint.config.js             # Конфигурация ESLint
├── postcss.config.cjs           # Конфигурация PostCSS
└── index.html                   # HTML шаблон
```

---

## 🎯 Архитектурные принципы

### 1. Модульная архитектура

**Принцип:** Каждый функциональный модуль изолирован в своей папке.

```
src/modules/catalog/
├── components/          # UI компоненты модуля
├── pages/              # Страницы модуля
├── types/              # TypeScript типы
└── utils/              # Утилиты модуля
```

**Преимущества:**
- Легко найти код, относящийся к модулю
- Минимальная связность между модулями
- Удобно масштабировать команду (разные модули - разные разработчики)

---

### 2. Разделение ответственности (Separation of Concerns)

**Слои:**
1. **Components** - UI представление (только отображение)
2. **Stores** - бизнес-логика и состояние (Zustand)
3. **Types** - контракты данных (TypeScript интерфейсы)
4. **Utils** - вспомогательные функции (чистые функции)

**Правило:** Компонент не должен содержать бизнес-логику. Вся логика - в stores.

---

### 3. Lazy Loading

**Принцип:** Все страницы загружаются динамически для оптимизации производительности.

```typescript
// src/config/routes.tsx
const DashboardPage = lazy(() => import('@/modules/dashboard/pages/DashboardPage'));
const CatalogPage = lazy(() => import('@/modules/catalog/pages/CatalogPage'));
// ...остальные страницы
```

**Преимущества:**
- Быстрая начальная загрузка
- Меньше JavaScript в bundle
- Пользователь загружает только то, что использует

---

### 4. Переиспользование компонентов

**Уровни переиспользования:**
1. **UI компоненты** (`src/components/ui/`) - shadcn/ui базовые компоненты
2. **Общие компоненты** (`src/components/common/`) - переиспользуемые в модулях
3. **Модульные компоненты** (`src/modules/{модуль}/components/`) - специфичные

---

### 5. TypeScript Strict Mode

**Принцип:** Строгая типизация для предотвращения ошибок.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

### 6. Мультитенантность

**Принцип:** Изоляция данных между организациями (тенантами).

- Каждая организация = отдельный тенант
- Данные изолированы на уровне БД (Row-Level Security)
- Пользователь видит только данные своего тенанта
- SuperAdmin управляет всеми тенантами

---

## 🗂️ State Management (Zustand)

### Почему Zustand?

- ✅ Легковесный (< 1 KB)
- ✅ Простой API без boilerplate
- ✅ TypeScript поддержка из коробки
- ✅ Не требует Provider обертки
- ✅ DevTools для отладки

### Структура Store

```typescript
// Пример: src/stores/taskStore.ts
import { create } from 'zustand';

interface Task {
  id: string;
  title: string;
  status: 'new' | 'in_progress' | 'completed';
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  }))
}));
```

### 23 Stores в проекте

| Store | Назначение |
|-------|------------|
| `authStore` | Аутентификация и текущий пользователь |
| `uiStore` | Состояние UI (тема, sidebar, модальные окна) |
| `catalogStore` | Объекты каталога и организации |
| `taskStore` | Управление задачами |
| `incidentsStore` | Инциденты |
| `budgetStore` | Бюджетирование |
| `maintenanceStore` | Техническое обслуживание |
| `checklistsStore` | Чек-листы и аудиты |
| `examinationStore` | Экспертиза |
| `notificationsStore` | Уведомления |
| `tenantStore` | Управление тенантами |
| `settingsStore` | Настройки организации |
| `usersStore` | Управление пользователями |
| `organizationsStore` | Организации |
| `knowledgeBaseStore` | База знаний |
| `trainingCenterStore` | Учебный центр |
| `certificationStore` | Сертификаты |
| `ordersStore` | Заявки |
| `attestationNotificationsStore` | Уведомления об аттестациях |
| `attestationOrdersStore` | Заявки на аттестацию |
| `trainingsAttestationStore` | Связь обучения и аттестации |
| `documentsStore` | Документы |
| `interOrgDocumentsStore` | Межорганизационные документы |
| `referencesStore` | Справочники |
| `templatesStore` | Шаблоны |

---

## 🛣️ Роутинг (React Router 6)

### Структура маршрутов

```typescript
// src/config/routes.tsx
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TENANTS: '/tenants',
  SETTINGS: '/settings',
  CATALOG: '/catalog',
  TASKS: '/tasks',
  INCIDENTS: '/incidents',
  MAINTENANCE: '/maintenance',
  BUDGET: '/budget',
  ATTESTATION: '/attestation',
  CHECKLISTS: '/checklists',
  EXAMINATION: '/examination',
  TRAINING_CENTER: '/training-center',
  KNOWLEDGE_BASE: '/knowledge-base',
  AUDIT: '/audit',
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_CREATE: '/notifications/create',
  NOTIFICATIONS_HISTORY: '/notifications/history'
};
```

### Защищенные маршруты

```typescript
// src/components/app/ProtectedRoute.tsx
<ProtectedRoute allowedRoles={['TenantAdmin', 'Auditor']}>
  <CatalogPage />
</ProtectedRoute>
```

### Lazy Loading

Все страницы загружаются через `React.lazy()`:

```typescript
const DashboardPage = lazy(() => import('@/modules/dashboard/pages/DashboardPage'));
```

Fallback при загрузке:

```typescript
<Suspense fallback={<PageLoader />}>
  <AppRoutes />
</Suspense>
```

---

## 🎨 UI компоненты (shadcn/ui)

### Что такое shadcn/ui?

- **НЕ библиотека компонентов** (не npm пакет)
- **Коллекция копируемых компонентов** на базе Radix UI
- Компоненты копируются в проект и полностью кастомизируются
- Стилизация через Tailwind CSS

### 68 компонентов в проекте

**Расположение:** `src/components/ui/`

**Основные компоненты:**
- `button` - кнопки
- `input` - поля ввода
- `select` - выпадающие списки
- `dialog` - модальные окна
- `table` - таблицы
- `card` - карточки
- `form` - формы с валидацией
- `toast` - уведомления
- `dropdown-menu` - меню
- `tabs` - вкладки
- `calendar` - календарь
- `chart` - графики (Recharts)
- `sidebar` - боковое меню
- `icon` - обертка для Lucide иконок

**И еще 54 компонента!**

### Кастомизация

Все компоненты можно редактировать:

```typescript
// src/components/ui/button.tsx
export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md bg-primary text-primary-foreground",
        className
      )}
      {...props}
    />
  );
}
```

---

## ⚙️ Backend функции

### Структура

```
backend/
└── send-reminders/           # Python функция
    ├── main.py              # Обработчик
    ├── requirements.txt     # Зависимости Python
    └── README.md            # Документация
```

### send-reminders (Python)

**Назначение:** Отправка напоминаний о событиях (просроченные задачи, истекающие аттестации).

**Технологии:**
- Python 3.x
- PostgreSQL (подключение к БД)
- SMTP для отправки писем

**Триггер:** Cron (запуск по расписанию)

---

## 🔧 Конфигурация

### Vite (vite.config.ts)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // Алиас для импортов
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
```

### TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tailwind (tailwind.config.ts)

```typescript
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CSS переменные для темизации
      }
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography')
  ]
}
```

### ESLint (eslint.config.js)

```javascript
export default tseslint.config({
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn'
  }
});
```

---

## 🚀 Скрипты

```json
{
  "scripts": {
    "dev": "vite",                    // Разработка (localhost:5173)
    "build": "vite build",            // Production сборка
    "build:dev": "vite build --mode development",
    "lint": "eslint .",               // Проверка кода
    "preview": "vite preview"         // Превью сборки
  }
}
```

---

## 📊 Производительность

### Оптимизации

1. **Lazy loading** - динамическая загрузка страниц
2. **SWC компилятор** - быстрее Babel в 20 раз
3. **react-window** - виртуализация длинных списков
4. **TanStack Query** - кеширование запросов
5. **Мемоизация** - `React.memo()` для компонентов
6. **Code splitting** - автоматическое разделение bundle

### Размер bundle (после сборки)

- **Начальная загрузка:** ~200 KB (gzip)
- **Каждая страница:** ~50-100 KB (lazy loading)
- **Общий размер:** ~2 MB (все модули)

---

## 🔐 Безопасность

### Принципы

1. **Аутентификация:** JWT токены
2. **Авторизация:** Проверка ролей на каждом маршруте
3. **Изоляция данных:** RLS в PostgreSQL
4. **XSS защита:** React автоматически экранирует данные
5. **CSRF защита:** Токены в формах
6. **HTTPS только:** В production

---

## 🌐 Мультиязычность

**Текущий статус:** Система на русском языке.

**Возможность добавления:** i18next (не реализовано).

---

## 🎨 Темизация

**Поддержка:** Dark mode через `next-themes`.

**Реализация:**
- CSS переменные в `src/index.css`
- Переключатель темы в UI
- Сохранение выбора в `localStorage`

**Темы:**
- Light (светлая)
- Dark (темная)
- System (по системе)

---

## 📈 Мониторинг и аналитика

**Текущий статус:** Не реализовано.

**Возможности:**
- Google Analytics
- Sentry для ошибок
- LogRocket для сессий

---

**Версия:** 1.0  
**Дата:** 2025-10-16
