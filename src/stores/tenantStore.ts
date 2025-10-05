import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tenant, ModuleType } from '@/types';

interface TenantCredentials {
  tenantId: string;
  email: string;
  password: string;
  createdAt: string;
}

interface TenantState {
  tenants: Tenant[];
  credentials: TenantCredentials[];
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>) => string;
  updateTenant: (id: string, tenant: Partial<Tenant>) => void;
  getTenant: (id: string) => Tenant | undefined;
  saveCredentials: (tenantId: string, email: string, password: string) => void;
  getCredentials: (tenantId: string) => TenantCredentials | undefined;
  resetPassword: (tenantId: string) => string;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  credentials: [
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
    }
  ],
  tenants: [
    {
      id: 'tenant-1',
      name: 'ООО "Промышленная безопасность"',
      inn: '7707123456',
      adminEmail: 'admin@company.ru',
      adminName: 'Иванов Иван Иванович',
      status: 'active',
      modules: ['attestation', 'catalog', 'incidents', 'checklists', 'tasks', 'examination', 'maintenance', 'budget'] as ModuleType[],
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
      modules: ['attestation', 'catalog', 'examination', 'maintenance'] as ModuleType[],
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  addTenant: (tenant) => {
    const id = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      ...tenant,
      id,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ tenants: [...state.tenants, newTenant] }));
    return id;
  },
  updateTenant: (id, updates) => {
    set((state) => ({
      tenants: state.tenants.map((t) => (t.id === id ? { ...t, ...updates } : t))
    }));
  },
  getTenant: (id) => {
    return get().tenants.find((t) => t.id === id);
  },
  saveCredentials: (tenantId, email, password) => {
    set((state) => ({
      credentials: [
        ...state.credentials,
        {
          tenantId,
          email,
          password,
          createdAt: new Date().toISOString()
        }
      ]
    }));
  },
  getCredentials: (tenantId) => {
    return get().credentials.find((c) => c.tenantId === tenantId);
  },
  resetPassword: (tenantId) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const newPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    
    set((state) => ({
      credentials: state.credentials.map((c) =>
        c.tenantId === tenantId
          ? { ...c, password: newPassword, createdAt: new Date().toISOString() }
          : c
      )
    }));
    
    return newPassword;
  }
}));