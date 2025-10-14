import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const descriptions: Record<string, string> = {
  // UI компоненты
  'src/components/ui/button.tsx': 'UI компонент кнопки: различные варианты стилей и размеров',
  'src/components/ui/input.tsx': 'UI компонент поля ввода: текстовые инпуты с валидацией',
  'src/components/ui/card.tsx': 'UI компонент карточки: контейнер для группировки контента',
  'src/components/ui/dialog.tsx': 'UI компонент диалога: модальные окна',
  'src/components/ui/select.tsx': 'UI компонент выбора: выпадающие списки',
  'src/components/ui/table.tsx': 'UI компонент таблицы: отображение данных в табличном виде',
  'src/components/ui/tabs.tsx': 'UI компонент вкладок: переключение между разделами',
  'src/components/ui/icon.tsx': 'Обёртка для иконок Lucide: ленивая загрузка с fallback',
  'src/components/ui/badge.tsx': 'UI компонент бейджа: метки и статусы',
  'src/components/ui/checkbox.tsx': 'UI компонент чекбокса: флажки выбора',
  'src/components/ui/dropdown-menu.tsx': 'UI компонент выпадающего меню: контекстные меню',
  'src/components/ui/label.tsx': 'UI компонент метки: подписи для форм',
  'src/components/ui/switch.tsx': 'UI компонент переключателя: вкл/выкл',
  'src/components/ui/textarea.tsx': 'UI компонент текстовой области: многострочный ввод',
  'src/components/ui/tooltip.tsx': 'UI компонент подсказки: всплывающие подсказки',
  'src/components/ui/alert.tsx': 'UI компонент уведомления: информационные сообщения',
  'src/components/ui/avatar.tsx': 'UI компонент аватара: изображения профилей',
  'src/components/ui/calendar.tsx': 'UI компонент календаря: выбор дат',
  'src/components/ui/command.tsx': 'UI компонент командной панели: поиск команд',
  'src/components/ui/popover.tsx': 'UI компонент поповера: всплывающие панели',
  'src/components/ui/radio-group.tsx': 'UI компонент радио-группы: выбор одного варианта',
  'src/components/ui/scroll-area.tsx': 'UI компонент области прокрутки: кастомный скролл',
  'src/components/ui/separator.tsx': 'UI компонент разделителя: горизонтальные линии',
  'src/components/ui/skeleton.tsx': 'UI компонент скелетона: индикаторы загрузки',
  'src/components/ui/slider.tsx': 'UI компонент слайдера: ползунки',
  'src/components/ui/sonner.tsx': 'UI компонент toast-уведомлений Sonner',
  'src/components/ui/toaster.tsx': 'UI компонент toast-уведомлений',
  'src/components/ui/toast.tsx': 'UI компонент всплывающего уведомления',
  'src/components/ui/use-toast.ts': 'Hook для управления toast-уведомлениями',
  'src/components/ui/progress.tsx': 'UI компонент прогресс-бара',
  'src/components/ui/sheet.tsx': 'UI компонент боковой панели',
  'src/components/ui/accordion.tsx': 'UI компонент аккордеона: раскрывающиеся секции',

  // Компоненты аттестации
  'src/modules/attestation/components/orders/OrdersTab.tsx': 'Вкладка приказов: переключение между табличным и карточным видом',
  'src/modules/attestation/components/orders/OrdersTableView.tsx': 'Табличное представление приказов: сортировка и фильтрация',
  'src/modules/attestation/components/orders/OrdersCardView.tsx': 'Карточное представление приказов: визуальное отображение',
  
  // Библиотеки
  'src/lib/utils/personnelUtils.ts': 'Утилиты для работы с данными персонала: форматирование ФИО и должностей',
  'src/lib/competencyAnalysis.ts': 'Анализ компетенций: расчёт метрик и статистики',
  'src/lib/passwordUtils.ts': 'Утилиты для работы с паролями: валидация и хеширование',
  'src/lib/excelLazy.ts': 'Ленивая загрузка библиотеки Excel для экспорта данных',
  'src/lib/constants.ts': 'Константы приложения: статусы, роли, типы данных',
  'src/lib/exportUtils.ts': 'Утилиты экспорта: формирование файлов Excel',
  
  // Типы
  'src/types/budget.ts': 'Типы данных для модуля бюджета',
  'src/types/catalog.ts': 'Типы данных для модуля каталога организаций',
  'src/types/tasks.ts': 'Типы данных для модуля задач',
  'src/types/examination.ts': 'Типы данных для модуля аттестационных экзаменов',
  'src/types/checklists.ts': 'Типы данных для модуля чек-листов',
  'src/types/attestation.ts': 'Типы данных для модуля аттестации',
  'src/types/maintenance.ts': 'Типы данных для модуля обслуживания',
  
  // Stores
  'src/stores/ordersStore.ts': 'Zustand store для управления приказами',
  'src/stores/checklistsStore.ts': 'Zustand store для управления чек-листами',
  'src/stores/maintenanceStore.ts': 'Zustand store для управления обслуживанием оборудования',
  'src/stores/tenantStore.ts': 'Zustand store для управления тенантами (арендаторами)',
  'src/stores/settingsStore.ts': 'Zustand store для управления настройками приложения',
  'src/stores/catalogStore.ts': 'Zustand store для управления каталогом организаций',
  'src/stores/uiStore.ts': 'Zustand store для управления состоянием UI',
  'src/stores/incidentsStore.ts': 'Zustand store для управления инцидентами',
  'src/stores/templatesStore.ts': 'Zustand store для управления шаблонами документов',
  'src/stores/trainingCenterStore.ts': 'Zustand store для управления учебным центром',
  'src/stores/attestationNotificationsStore.ts': 'Zustand store для управления автоматическими уведомлениями об истечении сроков аттестации',
  'src/stores/trainingsAttestationStore.ts': 'Zustand store для управления обучением аттестации',
  'src/stores/budgetStore.ts': 'Zustand store для управления бюджетом',
  'src/stores/knowledgeBaseStore.ts': 'Zustand store для управления базой знаний',
  'src/stores/organizationsStore.ts': 'Zustand store для управления организациями',
  'src/stores/examinationStore.ts': 'Zustand store для управления экзаменами',
  'src/stores/certificationStore.ts': 'Zustand store для управления сертификацией',
  'src/stores/taskStore.ts': 'Zustand store для управления задачами',
  'src/stores/notificationsStore.ts': 'Zustand store для управления системой уведомлений',
  
  // Mock данные
  'src/stores/mockData/systemUsers.ts': 'Моковые данные: системные пользователи',
  'src/stores/mockData/organizations.ts': 'Моковые данные: внутренние организации',
  'src/stores/mockData/externalOrganizations.ts': 'Моковые данные: внешние организации',
  'src/stores/mockData/productionSites.ts': 'Моковые данные: производственные площадки',
  'src/stores/mockData/certificationAreas.ts': 'Моковые данные: области сертификации',
  'src/stores/mockData/index.ts': 'Экспорт всех моковых данных',
  'src/stores/mockData/competencyMatrix.ts': 'Моковые данные: матрица компетенций',
  'src/stores/mockData/personnel.ts': 'Моковые данные: персонал',
  'src/stores/mockData/competencies.ts': 'Моковые данные: компетенции',
  
  // Страницы модулей
  'src/modules/training-center/pages/TrainingCenterPage.tsx': 'Страница учебного центра: программы, расписание, заявки и отчеты',
  
  // Компоненты учебного центра
  'src/modules/training-center/components/tabs/ProgramsTab.tsx': 'Вкладка программ обучения: список курсов и модулей',
  'src/modules/training-center/components/tabs/ReportsTab.tsx': 'Вкладка отчётов: статистика и аналитика по обучению',
  'src/modules/training-center/components/tabs/ScheduleTab.tsx': 'Вкладка расписания: календарь занятий',
  'src/modules/training-center/components/tabs/RequestsTab.tsx': 'Вкладка заявок: управление запросами на обучение',
  
  // Утилиты
  'src/utils/export.ts': 'Утилиты экспорта данных в различные форматы',
  'src/utils/reportGenerator.ts': 'Генератор отчётов: формирование документов',
};

function addDescription(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Проверяем есть ли уже путь
    if (!lines[0].startsWith('// src/')) {
      return false;
    }
    
    // Проверяем есть ли уже описание
    if (lines[1]?.startsWith('// Описание:') || lines[1]?.startsWith('//')) {
      return false;
    }
    
    // Получаем описание
    const relativePath = filePath.replace(/\\/g, '/');
    const description = descriptions[relativePath];
    
    if (!description) {
      console.log(`No description for: ${relativePath}`);
      return false;
    }
    
    // Вставляем описание после пути
    lines.splice(1, 0, `// Описание: ${description}`);
    
    writeFileSync(filePath, lines.join('\n'), 'utf-8');
    console.log(`✓ Added description to: ${relativePath}`);
    return true;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error);
    return false;
  }
}

function processDirectory(dir: string) {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist') {
        processDirectory(fullPath);
      }
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      addDescription(fullPath);
    }
  }
}

// Запускаем обработку
processDirectory('src');