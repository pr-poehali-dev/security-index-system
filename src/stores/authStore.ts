// src/stores/authStore.ts
// Описание: Zustand store для управления аутентификацией и пользователями
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'superadmin@system.ru',
    name: 'Суперадминистратор',
    role: 'SuperAdmin',
    availableModules: ['tenants']
  },
  {
    id: '2',
    email: 'admin@company.ru',
    name: 'Администратор Тенанта',
    role: 'TenantAdmin',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'catalog', 'facility-catalog', 'contractors', 'incidents', 'checklists', 'tasks', 'examination', 'maintenance', 'budget', 'training-center', 'knowledge-base', 'audit', 'settings']
  },
  {
    id: '3',
    email: 'auditor@company.ru',
    name: 'Аудитор',
    role: 'Auditor',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'catalog', 'facility-catalog', 'contractors', 'incidents', 'checklists', 'examination', 'audit', 'knowledge-base']
  },
  {
    id: '4',
    email: 'manager@company.ru',
    name: 'Менеджер',
    role: 'Manager',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'catalog', 'facility-catalog', 'tasks', 'maintenance', 'knowledge-base']
  },
  {
    id: '5',
    email: 'director@company.ru',
    name: 'Директор',
    role: 'Director',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'incidents', 'budget', 'knowledge-base']
  },
  {
    id: '6',
    email: 'training@company.ru',
    name: 'Менеджер Учебного Центра',
    role: 'TrainingCenterManager',
    tenantId: 'tenant-1',
    availableModules: ['training-center', 'knowledge-base']
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (password !== 'password123') {
          return false;
        }
        
        const user = MOCK_USERS.find(u => u.email === email);
        if (!user) {
          return false;
        }
        
        set({ user, isAuthenticated: true });
        return true;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);