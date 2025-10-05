import { create } from 'zustand';
import type { Organization, Department, Personnel } from '@/types';

interface SettingsState {
  organizations: Organization[];
  departments: Department[];
  personnel: Personnel[];
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt'>) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  addPersonnel: (person: Omit<Personnel, 'id' | 'createdAt'>) => void;
  updatePersonnel: (id: string, updates: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;
  importOrganizations: (orgs: Omit<Organization, 'id' | 'createdAt'>[]) => void;
  importDepartments: (depts: Omit<Department, 'id' | 'createdAt'>[]) => void;
  importPersonnel: (people: Omit<Personnel, 'id' | 'createdAt'>[]) => void;
  getOrganizationsByTenant: (tenantId: string) => Organization[];
  getDepartmentsByTenant: (tenantId: string) => Department[];
  getDepartmentsByOrganization: (organizationId: string) => Department[];
  getPersonnelByTenant: (tenantId: string) => Personnel[];
  getPersonnelByOrganization: (organizationId: string) => Personnel[];
  getPersonnelByDepartment: (departmentId: string) => Personnel[];
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

  departments: [
    {
      id: 'dept-1-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      name: 'Отдел охраны труда',
      code: 'ООТ',
      head: 'Иванов И.И.',
      status: 'active',
      createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'dept-1-2',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      name: 'Производственный отдел',
      code: 'ПО',
      status: 'active',
      createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'dept-1-2-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      parentId: 'dept-1-2',
      name: 'Участок №1',
      code: 'ПО-1',
      status: 'active',
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'dept-2-1',
      tenantId: 'tenant-1',
      organizationId: 'org-2',
      name: 'Технический отдел',
      code: 'ТО',
      head: 'Сидоров С.С.',
      status: 'active',
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  personnel: [
    {
      id: '3',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      departmentId: 'dept-1-1',
      fullName: 'Иванов Иван Иванович',
      position: 'Главный инженер по безопасности',
      email: 'auditor@company.ru',
      phone: '+7 (999) 123-45-67',
      role: 'Auditor',
      status: 'active',
      hireDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      departmentId: 'dept-1-1',
      fullName: 'Петров Петр Петрович',
      position: 'Менеджер по охране труда',
      email: 'manager@company.ru',
      phone: '+7 (999) 234-56-78',
      role: 'Manager',
      status: 'active',
      hireDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      tenantId: 'tenant-1',
      organizationId: 'org-2',
      departmentId: 'dept-2-1',
      fullName: 'Сидоров Сидор Сидорович',
      position: 'Технический директор',
      email: 'director@company.ru',
      phone: '+7 (999) 345-67-89',
      role: 'Director',
      status: 'active',
      hireDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'person-6',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      departmentId: 'dept-1-2',
      fullName: 'Соколова Анна Петровна',
      position: 'Инженер-механик',
      email: 'sokolova@company.ru',
      phone: '+7 (999) 456-78-90',
      role: 'Manager',
      status: 'dismissed',
      hireDate: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
      dismissalDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString()
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
      departments: state.departments.filter((dept) => dept.organizationId !== id),
      personnel: state.personnel.filter((p) => p.organizationId !== id)
    }));
  },

  addDepartment: (dept) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ departments: [...state.departments, newDept] }));
  },

  updateDepartment: (id, updates) => {
    set((state) => ({
      departments: state.departments.map((dept) =>
        dept.id === id ? { ...dept, ...updates } : dept
      )
    }));
  },

  deleteDepartment: (id) => {
    const getChildDepts = (deptId: string): string[] => {
      const children = get().departments.filter(d => d.parentId === deptId);
      const childIds = children.map(c => c.id);
      const nestedIds = childIds.flatMap(cid => getChildDepts(cid));
      return [deptId, ...childIds, ...nestedIds];
    };

    const allToDelete = getChildDepts(id);

    set((state) => ({
      departments: state.departments.filter((dept) => !allToDelete.includes(dept.id)),
      personnel: state.personnel.filter((p) => !allToDelete.includes(p.departmentId || ''))
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

  importOrganizations: (orgs) => {
    const newOrgs = orgs.map((org, index) => ({
      ...org,
      id: `org-import-${Date.now()}-${index}`,
      createdAt: new Date().toISOString()
    }));
    set((state) => ({
      organizations: [...state.organizations, ...newOrgs]
    }));
  },

  importDepartments: (depts) => {
    const newDepts = depts.map((dept, index) => ({
      ...dept,
      id: `dept-import-${Date.now()}-${index}`,
      createdAt: new Date().toISOString()
    }));
    set((state) => ({
      departments: [...state.departments, ...newDepts]
    }));
  },

  importPersonnel: (people) => {
    const newPeople = people.map((person, index) => ({
      ...person,
      id: `person-import-${Date.now()}-${index}`,
      createdAt: new Date().toISOString()
    }));
    set((state) => ({
      personnel: [...state.personnel, ...newPeople]
    }));
  },

  getOrganizationsByTenant: (tenantId) => {
    return get().organizations.filter((org) => org.tenantId === tenantId);
  },

  getDepartmentsByTenant: (tenantId) => {
    return get().departments.filter((dept) => dept.tenantId === tenantId);
  },

  getDepartmentsByOrganization: (organizationId) => {
    return get().departments.filter((dept) => dept.organizationId === organizationId);
  },

  getPersonnelByTenant: (tenantId) => {
    return get().personnel.filter((person) => person.tenantId === tenantId);
  },

  getPersonnelByOrganization: (organizationId) => {
    return get().personnel.filter((person) => person.organizationId === organizationId);
  },

  getPersonnelByDepartment: (departmentId) => {
    return get().personnel.filter((person) => person.departmentId === departmentId);
  }
}));
