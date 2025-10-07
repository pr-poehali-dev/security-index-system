import type { SystemUser } from '@/types';

export const mockSystemUsers: SystemUser[] = [
  {
    id: 'sys-user-1',
    tenantId: 'tenant-1',
    personnelId: 'personnel-1',
    email: 'ivanov@energoprom.ru',
    login: 'ivanov',
    passwordHash: 'hashed_password_1',
    role: 'Manager',
    status: 'active',
    organizationAccess: ['org-1'],
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sys-user-2',
    tenantId: 'tenant-1',
    personnelId: 'personnel-2',
    email: 'petrova@energoprom.ru',
    login: 'petrova',
    passwordHash: 'hashed_password_2',
    role: 'Director',
    status: 'active',
    organizationAccess: ['org-1', 'org-2'],
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sys-user-3',
    tenantId: 'tenant-1',
    personnelId: 'personnel-3',
    email: 'sidorov@energoprom.ru',
    login: 'sidorov',
    passwordHash: 'hashed_password_3',
    role: 'Manager',
    status: 'active',
    organizationAccess: ['org-1'],
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];
