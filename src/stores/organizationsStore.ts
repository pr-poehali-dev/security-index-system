// src/stores/organizationsStore.ts
// Описание: Zustand store для управления организациями и подразделениями
import { create } from 'zustand';
import type { Organization, Department } from '@/types';
import { mockOrganizations, mockDepartments } from './mockData';

interface OrganizationsState {
  organizations: Organization[];
  departments: Department[];
  addOrganization: (organization: Omit<Organization, 'id' | 'createdAt'>) => void;
  updateOrganization: (id: string, data: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  addDepartment: (department: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
}

export const useOrganizationsStore = create<OrganizationsState>((set) => ({
  organizations: mockOrganizations,
  departments: mockDepartments,

  addOrganization: (organization) =>
    set((state) => ({
      organizations: [
        ...state.organizations,
        {
          ...organization,
          id: `org-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateOrganization: (id, data) =>
    set((state) => ({
      organizations: state.organizations.map((org) =>
        org.id === id ? { ...org, ...data } : org
      ),
    })),

  deleteOrganization: (id) =>
    set((state) => ({
      organizations: state.organizations.filter((org) => org.id !== id),
    })),

  addDepartment: (department) =>
    set((state) => ({
      departments: [
        ...state.departments,
        {
          ...department,
          id: `dept-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateDepartment: (id, data) =>
    set((state) => ({
      departments: state.departments.map((dept) =>
        dept.id === id ? { ...dept, ...data } : dept
      ),
    })),

  deleteDepartment: (id) =>
    set((state) => ({
      departments: state.departments.filter((dept) => dept.id !== id),
    })),
}));