// src/stores/tenantStore.ts
// Описание: Zustand store для управления тенантами и модулями
import { create } from 'zustand';
import type { Tenant } from '@/types';
import { mockTenants, mockTenantCredentials, type TenantCredentials } from './mockData';

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
  credentials: mockTenantCredentials,
  tenants: mockTenants,
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