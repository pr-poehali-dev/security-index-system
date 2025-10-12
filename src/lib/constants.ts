import type { ModuleType, UserRole } from '@/types';

export const MODULES: Record<ModuleType, { name: string; description: string; icon: string }> = {
  tenants: {
    name: 'Управление тенантами',
    description: 'Создание и управление организациями',
    icon: 'Building2'
  },
  attestation: {
    name: 'Аттестация персонала',
    description: 'Управление аттестациями и сертификатами',
    icon: 'GraduationCap'
  },
  catalog: {
    name: 'Каталог объектов',
    description: 'Учет опасных производственных объектов',
    icon: 'Building'
  },
  incidents: {
    name: 'Учет инцидентов',
    description: 'Регистрация и расследование инцидентов',
    icon: 'AlertTriangle'
  },
  checklists: {
    name: 'Чек-листы и аудит',
    description: 'Проведение проверок и аудитов',
    icon: 'ClipboardCheck'
  },
  tasks: {
    name: 'Управление задачами',
    description: 'Контроль выполнения задач',
    icon: 'ListTodo'
  },
  examination: {
    name: 'Техническое диагностирование',
    description: 'Учет результатов диагностики',
    icon: 'Microscope'
  },
  maintenance: {
    name: 'Ремонты и обслуживание',
    description: 'Планирование и учет работ',
    icon: 'Wrench'
  },
  budget: {
    name: 'Планирование бюджета',
    description: 'Бюджетирование затрат',
    icon: 'Wallet'
  },
  'training-center': {
    name: 'Учебный центр',
    description: 'Управление учебными программами и обучением',
    icon: 'BookOpen'
  },
  settings: {
    name: 'Настройки',
    description: 'Управление организациями, персоналом и компетенциями',
    icon: 'Settings'
  }
};

export const ROLE_PERMISSIONS: Record<UserRole, ModuleType[]> = {
  SuperAdmin: [
    'tenants',
    'attestation',
    'catalog',
    'incidents',
    'checklists',
    'tasks',
    'examination',
    'maintenance',
    'budget',
    'training-center',
    'settings'
  ],
  TenantAdmin: [
    'attestation',
    'catalog',
    'incidents',
    'checklists',
    'tasks',
    'examination',
    'maintenance',
    'budget',
    'training-center',
    'settings'
  ],
  Auditor: ['attestation', 'catalog', 'incidents', 'checklists', 'examination'],
  Manager: ['attestation', 'catalog', 'tasks', 'maintenance'],
  Director: ['attestation', 'incidents', 'budget'],
  TrainingCenterManager: ['training-center']
};

export const CERTIFICATION_CATEGORIES = [
  { value: 'industrial_safety', label: 'Промышленная безопасность', code: 'ПБ' },
  { value: 'energy_safety', label: 'Энергобезопасность', code: 'ЭБ' },
  { value: 'labor_safety', label: 'Охрана труда', code: 'ОТ' },
  { value: 'ecology', label: 'Экология', code: 'ЭК' }
];

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TENANTS: '/tenants',
  SETTINGS: '/settings',
  SETTINGS_ORGANIZATIONS: '/settings/organizations',
  SETTINGS_PERSONNEL: '/settings/personnel',
  SETTINGS_COMPETENCIES: '/settings/competencies',
  ATTESTATION: '/attestation',
  CATALOG: '/catalog',
  INCIDENTS: '/incidents',
  CHECKLISTS: '/checklists',
  TASKS: '/tasks',
  EXAMINATION: '/examination',
  MAINTENANCE: '/maintenance',
  BUDGET: '/budget',
  TRAINING_CENTER: '/training-center',
  NOTIFICATIONS: '/notifications',
  CREATE_NOTIFICATION: '/notifications/create'
};

export const INDUSTRIAL_SAFETY_AREAS = [
  { code: 'А.1', name: 'Подъемные сооружения' },
  { code: 'Б.1', name: 'Котлонадзор' },
  { code: 'Б.2', name: 'Сосуды, работающие под давлением' },
  { code: 'Б.3', name: 'Трубопроводы пара и горячей воды' },
  { code: 'Б.4', name: 'Газовое хозяйство' },
  { code: 'Б.7', name: 'Холодильные установки' },
  { code: 'Г.1', name: 'Нефтегазодобывающие производства' },
  { code: 'Г.2', name: 'Нефтегазоперерабатывающие производства' },
  { code: 'Г.3', name: 'Нефтепродуктообеспечение' },
  { code: 'Д.1', name: 'Металлургическое производство' },
  { code: 'Д.6', name: 'Литейное производство' },
  { code: 'Д.7', name: 'Механическая обработка металлов' },
  { code: 'Е.1', name: 'Химически опасные производственные объекты' },
  { code: 'М.1', name: 'Тепловые электростанции' },
  { code: 'М.2', name: 'Гидроэлектростанции' }
];

export const ENERGY_SAFETY_AREAS = [
  { code: 'ЭБ.1', name: 'Электроэнергетика' },
  { code: 'ЭБ.2', name: 'Теплоэнергетика' },
  { code: 'ЭБ.3', name: 'Гидроэнергетика' },
  { code: 'ЭБ.4', name: 'Газоснабжение' },
  { code: 'ЭБ.5', name: 'Теплоснабжение' },
  { code: 'ЭБ.6', name: 'Электросети и подстанции' }
];

export const LABOR_SAFETY_AREAS = [
  { code: 'ОТ.1', name: 'Работы на высоте' },
  { code: 'ОТ.2', name: 'Работы в ограниченных пространствах' },
  { code: 'ОТ.3', name: 'Электробезопасность' },
  { code: 'ОТ.4', name: 'Пожарная безопасность' },
  { code: 'ОТ.5', name: 'Охрана труда при работе на высоте' },
  { code: 'ОТ.6', name: 'Охрана труда при эксплуатации электроустановок' }
];

export const ECOLOGY_AREAS = [
  { code: 'ЭК.1', name: 'Обращение с отходами I-IV класса' },
  { code: 'ЭК.2', name: 'Охрана атмосферного воздуха' },
  { code: 'ЭК.3', name: 'Охрана водных объектов' },
  { code: 'ЭК.4', name: 'Экологический контроль' },
  { code: 'ЭК.5', name: 'Производственный экологический контроль' }
];

export const CERTIFICATION_AREAS_BY_CATEGORY = {
  industrial_safety: INDUSTRIAL_SAFETY_AREAS,
  energy_safety: ENERGY_SAFETY_AREAS,
  labor_safety: LABOR_SAFETY_AREAS,
  ecology: ECOLOGY_AREAS
};