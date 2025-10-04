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
    'budget'
  ],
  TenantAdmin: [
    'attestation',
    'catalog',
    'incidents',
    'checklists',
    'tasks',
    'examination',
    'maintenance',
    'budget'
  ],
  Auditor: ['attestation', 'catalog', 'incidents', 'checklists', 'examination'],
  Manager: ['attestation', 'catalog', 'tasks', 'maintenance'],
  Director: ['attestation', 'incidents', 'budget']
};

export const CERTIFICATION_CATEGORIES = [
  { value: 'industrial_safety', label: 'Промышленная безопасность', code: 'ПБ' },
  { value: 'labor_safety', label: 'Охрана труда', code: 'ОТ' },
  { value: 'energy_safety', label: 'Энергобезопасность', code: 'ЭБ' },
  { value: 'ecology', label: 'Экология', code: 'ЭК' }
];

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TENANTS: '/tenants',
  ATTESTATION: '/attestation',
  CATALOG: '/catalog',
  INCIDENTS: '/incidents',
  CHECKLISTS: '/checklists',
  TASKS: '/tasks',
  EXAMINATION: '/examination',
  MAINTENANCE: '/maintenance',
  BUDGET: '/budget'
};
