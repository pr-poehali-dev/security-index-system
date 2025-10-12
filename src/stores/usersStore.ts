// src/stores/usersStore.ts
import { create } from 'zustand';
import type { SystemUser } from '@/types';
import { mockSystemUsers } from './mockData';

interface UsersState {
  users: SystemUser[];
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, data: Partial<SystemUser>) => void;
  deleteUser: (id: string) => void;
  getUsersByRole: (role: string) => SystemUser[];
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: mockSystemUsers,

  addUser: (user) =>
    set((state) => ({
      users: [
        ...state.users,
        {
          ...user,
          id: `sys-user-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateUser: (id, data) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id
          ? { ...user, ...data, updatedAt: new Date().toISOString() }
          : user
      ),
    })),

  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    })),

  getUsersByRole: (role) => {
    return get().users.filter((user) => user.role === role);
  },
}));