// src/stores/mockData/organizations.ts
import type { SettingsOrganization, Department } from '@/types';

export const mockOrganizations: SettingsOrganization[] = [
  {
    id: 'org-1',
    tenantId: 'tenant-1',
    name: 'ООО "Энергопром"',
    inn: '7701234567',
    kpp: '770101001',
    address: 'г. Москва, ул. Промышленная, д. 1',
    status: 'active',
    createdAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'org-2',
    tenantId: 'tenant-1',
    name: 'АО "ЭнергоТранс"',
    inn: '7702345678',
    kpp: '770201001',
    address: 'г. Москва, пр-т Энергетиков, д. 25',
    status: 'active',
    createdAt: new Date(Date.now() - 700 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'org-3',
    tenantId: 'tenant-1',
    name: 'ЗАО "ЭнергоСтрой"',
    inn: '7703456789',
    kpp: '770301001',
    address: 'г. Москва, ул. Строительная, д. 15',
    status: 'active',
    createdAt: new Date(Date.now() - 650 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'org-tc-1',
    tenantId: 'tenant-3',
    name: 'УЦ Профессионал',
    inn: '7707555444',
    kpp: '770701001',
    address: 'г. Москва, ул. Учебная, д. 10',
    status: 'active',
    createdAt: new Date(Date.now() - 1095 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'org-tc-2',
    tenantId: 'tenant-4',
    name: 'УЦ Эксперт',
    inn: '7707666777',
    kpp: '770702001',
    address: 'г. Санкт-Петербург, пр-т Обучения, д. 25',
    status: 'active',
    createdAt: new Date(Date.now() - 800 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    name: 'Отдел охраны труда',
    code: 'OT',
    head: 'Петрова А.С.',
    status: 'active',
    createdAt: new Date(Date.now() - 700 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dept-2',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    name: 'Производственный отдел',
    code: 'PROD',
    head: 'Сидоров К.П.',
    status: 'active',
    createdAt: new Date(Date.now() - 680 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dept-3',
    tenantId: 'tenant-1',
    organizationId: 'org-2',
    name: 'Технический отдел',
    code: 'TECH',
    head: 'Иванов И.И.',
    status: 'active',
    createdAt: new Date(Date.now() - 650 * 24 * 60 * 60 * 1000).toISOString()
  }
];