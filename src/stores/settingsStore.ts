import { create } from 'zustand';
import type { Organization, Personnel } from '@/types';

interface SettingsState {
  organizations: Organization[];
  personnel: Personnel[];
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt'>) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  addPersonnel: (person: Omit<Personnel, 'id' | 'createdAt'>) => void;
  updatePersonnel: (id: string, updates: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;
  getOrganizationsByTenant: (tenantId: string) => Organization[];
  getPersonnelByTenant: (tenantId: string) => Personnel[];
  getPersonnelByOrganization: (organizationId: string) => Personnel[];
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  organizations: [
    {
      id: 'org-1',
      tenantId: 'tenant-1',
      name: 'ООО "Энергопром"',
      inn: '7701234567',
      kpp: '770101001',
      address: 'г. Москва, ул. Промышленная, д. 1',
      status: 'active',
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'org-2',
      tenantId: 'tenant-1',
      name: 'АО "ТехСервис"',
      inn: '7702345678',
      kpp: '770201001',
      address: 'г. Москва, пр. Индустриальный, д. 15',
      status: 'active',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  personnel: [
    {
      id: '3',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      fullName: 'Иванов Иван Иванович',
      position: 'Главный инженер по безопасности',
      email: 'auditor@company.ru',
      phone: '+7 (999) 123-45-67',
      role: 'Auditor',
      status: 'active',
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      fullName: 'Петров Петр Петрович',
      position: 'Менеджер по охране труда',
      email: 'manager@company.ru',
      phone: '+7 (999) 234-56-78',
      role: 'Manager',
      status: 'active',
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      tenantId: 'tenant-1',
      organizationId: 'org-2',
      fullName: 'Сидоров Сидор Сидорович',
      position: 'Технический директор',
      email: 'director@company.ru',
      phone: '+7 (999) 345-67-89',
      role: 'Director',
      status: 'active',
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  addOrganization: (org) => {
    const newOrg: Organization = {
      ...org,
      id: `org-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ organizations: [...state.organizations, newOrg] }));
  },

  updateOrganization: (id, updates) => {
    set((state) => ({
      organizations: state.organizations.map((org) =>
        org.id === id ? { ...org, ...updates } : org
      )
    }));
  },

  deleteOrganization: (id) => {
    set((state) => ({
      organizations: state.organizations.filter((org) => org.id !== id),
      personnel: state.personnel.filter((p) => p.organizationId !== id)
    }));
  },

  addPersonnel: (person) => {
    const newPerson: Personnel = {
      ...person,
      id: `person-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ personnel: [...state.personnel, newPerson] }));
  },

  updatePersonnel: (id, updates) => {
    set((state) => ({
      personnel: state.personnel.map((person) =>
        person.id === id ? { ...person, ...updates } : person
      )
    }));
  },

  deletePersonnel: (id) => {
    set((state) => ({
      personnel: state.personnel.filter((person) => person.id !== id)
    }));
  },

  getOrganizationsByTenant: (tenantId) => {
    return get().organizations.filter((org) => org.tenantId === tenantId);
  },

  getPersonnelByTenant: (tenantId) => {
    return get().personnel.filter((person) => person.tenantId === tenantId);
  },

  getPersonnelByOrganization: (organizationId) => {
    return get().personnel.filter((person) => person.organizationId === organizationId);
  }
}));
