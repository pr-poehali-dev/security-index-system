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
    availableModules: ['tenants', 'attestation', 'catalog', 'incidents', 'checklists', 'tasks', 'examination', 'maintenance', 'budget']
  },
  {
    id: '2',
    email: 'admin@company.ru',
    name: 'Администратор Тенанта',
    role: 'TenantAdmin',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'catalog', 'incidents', 'checklists', 'tasks', 'examination', 'maintenance', 'budget']
  },
  {
    id: '3',
    email: 'auditor@company.ru',
    name: 'Аудитор',
    role: 'Auditor',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'catalog', 'incidents', 'checklists', 'examination']
  },
  {
    id: '4',
    email: 'manager@company.ru',
    name: 'Менеджер',
    role: 'Manager',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'catalog', 'tasks', 'maintenance']
  },
  {
    id: '5',
    email: 'director@company.ru',
    name: 'Директор',
    role: 'Director',
    tenantId: 'tenant-1',
    availableModules: ['attestation', 'incidents', 'budget']
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
