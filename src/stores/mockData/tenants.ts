import type { Tenant, ModuleType } from '@/types';

export interface TenantCredentials {
  tenantId: string;
  email: string;
  password: string;
  createdAt: string;
}

export const mockTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'ООО "ЭнергоПром"',
    inn: '7707123456',
    adminEmail: 'admin@company.ru',
    adminName: 'Иванов Иван Иванович',
    status: 'active',
    modules: ['attestation', 'catalog', 'incidents', 'checklists', 'tasks', 'examination', 'maintenance', 'budget', 'knowledge-base'] as ModuleType[],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tenant-2',
    name: 'ПАО "Энергосеть"',
    inn: '7707654321',
    adminEmail: 'director@energoset.ru',
    adminName: 'Петров Петр Петрович',
    status: 'active',
    modules: ['attestation', 'catalog', 'examination', 'maintenance', 'knowledge-base'] as ModuleType[],
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tenant-3',
    name: 'УЦ Профессионал',
    inn: '7707555444',
    adminEmail: 'director@ucprofessional.ru',
    adminName: 'Соколов Андрей Владимирович',
    status: 'active',
    modules: ['training-center', 'catalog', 'knowledge-base'] as ModuleType[],
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tenant-4',
    name: 'УЦ Эксперт',
    inn: '7707666777',
    adminEmail: 'admin@ucexpert.ru',
    adminName: 'Кузнецова Ольга Петровна',
    status: 'active',
    modules: ['training-center', 'catalog'] as ModuleType[],
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 565 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockTenantCredentials: TenantCredentials[] = [
  {
    tenantId: 'tenant-1',
    email: 'admin@company.ru',
    password: 'Demo2024Pass',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    tenantId: 'tenant-2',
    email: 'director@energoset.ru',
    password: 'Energy2024Key',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    tenantId: 'tenant-3',
    email: 'director@ucprofessional.ru',
    password: 'UCPro2024Key',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    tenantId: 'tenant-4',
    email: 'admin@ucexpert.ru',
    password: 'Expert2024Secure',
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
  }
];
