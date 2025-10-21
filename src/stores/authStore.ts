// src/stores/authStore.ts
// Описание: Zustand store для управления аутентификацией и пользователями
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { mockAuthUsers } from './mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

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
        
        const user = mockAuthUsers.find(u => u.email === email);
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