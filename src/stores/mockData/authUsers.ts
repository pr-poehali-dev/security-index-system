import type { User } from '@/types';

export const mockAuthUsers: User[] = [
  {
    id: 'user-1',
    email: 'superadmin@system.ru',
    name: 'Суперадминистратор',
    role: 'SuperAdmin',
    availableModules: ['tenants']
  },
  {
    id: 'user-2',
    email: 'admin@company.ru',
    name: 'Администратор Тенанта',
    role: 'TenantAdmin',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'catalog', 'facility-catalog', 'contractors', 'incidents', 'checklists', 'tasks', 'examination', 'maintenance', 'budget', 'training-center', 'knowledge-base', 'audit', 'settings']
  },
  {
    id: 'user-3',
    email: 'auditor@company.ru',
    name: 'Аудитор',
    role: 'Auditor',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'catalog', 'facility-catalog', 'contractors', 'incidents', 'checklists', 'examination', 'audit', 'knowledge-base']
  },
  {
    id: 'user-4',
    email: 'manager@company.ru',
    name: 'Менеджер',
    role: 'Manager',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'catalog', 'facility-catalog', 'tasks', 'maintenance', 'knowledge-base']
  },
  {
    id: 'user-5',
    email: 'director@company.ru',
    name: 'Директор',
    role: 'Director',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'incidents', 'budget', 'knowledge-base']
  },
  {
    id: 'user-6',
    email: 'training@company.ru',
    name: 'Менеджер Учебного Центра',
    role: 'TrainingCenterManager',
    tenantId: 'tenant-1',
    availableModules: ['training-center', 'knowledge-base']
  }
];
