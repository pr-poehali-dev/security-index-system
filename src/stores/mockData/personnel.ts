import type { Person, Position, Personnel } from '@/types';

export const mockPeople: Person[] = [
  {
    id: 'person-1',
    tenantId: 'tenant-1',
    lastName: 'Иванов',
    firstName: 'Иван',
    middleName: 'Иванович',
    birthDate: '1985-03-15',
    snils: '123-456-789 00',
    inn: '770112345678',
    email: 'ivanov@energoprom.ru',
    phone: '+7 (999) 123-45-67',
    address: 'г. Москва, ул. Ленина, д. 10, кв. 5',
    educationLevel: 'higher',
    status: 'active',
    createdAt: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'person-2',
    tenantId: 'tenant-1',
    lastName: 'Петрова',
    firstName: 'Анна',
    middleName: 'Сергеевна',
    birthDate: '1990-07-22',
    snils: '234-567-890 11',
    inn: '770223456789',
    email: 'petrova@energoprom.ru',
    phone: '+7 (999) 234-56-78',
    educationLevel: 'higher',
    status: 'active',
    createdAt: new Date(Date.now() - 580 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'person-3',
    tenantId: 'tenant-1',
    lastName: 'Сидоров',
    firstName: 'Константин',
    middleName: 'Петрович',
    birthDate: '1978-11-30',
    snils: '345-678-901 22',
    email: 'sidorov@energoprom.ru',
    phone: '+7 (999) 345-67-89',
    educationLevel: 'secondary',
    status: 'active',
    createdAt: new Date(Date.now() - 560 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockPositions: Position[] = [
  {
    id: 'pos-1',
    tenantId: 'tenant-1',
    name: 'Инженер по охране труда',
    code: 'OT-ENG',
    category: 'specialist',
    description: 'Специалист по охране труда и промышленной безопасности',
    status: 'active',
    createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pos-2',
    tenantId: 'tenant-1',
    name: 'Мастер участка',
    code: 'MASTER',
    category: 'management',
    description: 'Руководитель производственного участка',
    status: 'active',
    createdAt: new Date(Date.now() - 480 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pos-3',
    tenantId: 'tenant-1',
    name: 'Электромонтер',
    code: 'ELECTR',
    category: 'worker',
    description: 'Электромонтер по обслуживанию электрооборудования',
    status: 'active',
    createdAt: new Date(Date.now() - 460 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pos-4',
    tenantId: 'tenant-1',
    name: 'Начальник отдела',
    code: 'HEAD',
    category: 'management',
    description: 'Руководитель структурного подразделения',
    status: 'active',
    createdAt: new Date(Date.now() - 440 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockPersonnel: Personnel[] = [
  {
    id: 'personnel-1',
    tenantId: 'tenant-1',
    personId: 'person-1',
    positionId: 'pos-1',
    organizationId: 'org-1',
    departmentId: 'dept-1',
    role: 'Manager',
    requiredCompetencies: ['comp-1', 'comp-3'],
    status: 'active',
    hireDate: '2020-01-15',
    createdAt: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'personnel-2',
    tenantId: 'tenant-1',
    personId: 'person-2',
    positionId: 'pos-4',
    organizationId: 'org-1',
    departmentId: 'dept-1',
    role: 'Director',
    requiredCompetencies: ['comp-3'],
    status: 'active',
    hireDate: '2019-03-01',
    createdAt: new Date(Date.now() - 580 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'personnel-3',
    tenantId: 'tenant-1',
    personId: 'person-3',
    positionId: 'pos-2',
    organizationId: 'org-1',
    departmentId: 'dept-2',
    role: 'Manager',
    requiredCompetencies: ['comp-1', 'comp-2'],
    status: 'active',
    hireDate: '2018-05-20',
    createdAt: new Date(Date.now() - 560 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];
