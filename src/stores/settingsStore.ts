import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization, Department, Personnel, CompetencyMatrix, ProductionSite, SystemUser } from '@/types';

interface SettingsState {
  organizations: Organization[];
  departments: Department[];
  personnel: Personnel[];
  competencies: CompetencyMatrix[];
  productionSites: ProductionSite[];
  systemUsers: SystemUser[];
  
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt'>) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  addPersonnel: (person: Omit<Personnel, 'id' | 'createdAt'>) => void;
  updatePersonnel: (id: string, updates: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;
  
  addCompetency: (competency: Omit<CompetencyMatrix, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompetency: (id: string, updates: Partial<CompetencyMatrix>) => void;
  deleteCompetency: (id: string) => void;
  
  importOrganizations: (orgs: Omit<Organization, 'id' | 'createdAt'>[]) => void;
  importDepartments: (depts: Omit<Department, 'id' | 'createdAt'>[]) => void;
  importPersonnel: (people: Omit<Personnel, 'id' | 'createdAt'>[]) => void;
  importCompetencies: (comps: Omit<CompetencyMatrix, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  
  getOrganizationsByTenant: (tenantId: string) => Organization[];
  getDepartmentsByTenant: (tenantId: string) => Department[];
  getDepartmentsByOrganization: (organizationId: string) => Department[];
  getPersonnelByTenant: (tenantId: string) => Personnel[];
  getPersonnelByOrganization: (organizationId: string) => Personnel[];
  getPersonnelByDepartment: (departmentId: string) => Personnel[];
  getCompetenciesByTenant: (tenantId: string) => CompetencyMatrix[];
  getCompetenciesByOrganization: (organizationId: string) => CompetencyMatrix[];
  
  addProductionSite: (site: Omit<ProductionSite, 'id' | 'createdAt'>) => void;
  updateProductionSite: (id: string, updates: Partial<ProductionSite>) => void;
  deleteProductionSite: (id: string) => void;
  getProductionSitesByOrganization: (organizationId: string) => ProductionSite[];
  importProductionSites: (sites: Omit<ProductionSite, 'id' | 'createdAt'>[]) => void;
  
  addSystemUser: (user: Omit<SystemUser, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSystemUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteSystemUser: (id: string) => void;
  getSystemUsersByTenant: (tenantId: string) => SystemUser[];
}

export const useSettingsStore = create<SettingsState>()(persist((set, get) => ({
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
      personnel: state.personnel.filter((p) => p.organizationId !== id),
      productionSites: state.productionSites.filter((site) => site.organizationId !== id)
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
  },

  competencies: [
    {
      id: 'comp-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      position: 'Главный инженер по безопасности',
      requiredAreas: [
        {
          category: 'industrial_safety',
          areas: ['Б.1', 'Б.2', 'М.1']
        },
        {
          category: 'energy_safety',
          areas: ['ЭБ.1', 'ЭБ.6']
        },
        {
          category: 'labor_safety',
          areas: ['ОТ.3', 'ОТ.4']
        }
      ],
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'comp-2',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      position: 'Менеджер по охране труда',
      requiredAreas: [
        {
          category: 'labor_safety',
          areas: ['ОТ.1', 'ОТ.2', 'ОТ.3', 'ОТ.4', 'ОТ.5', 'ОТ.6']
        },
        {
          category: 'industrial_safety',
          areas: ['Б.1', 'Б.2']
        }
      ],
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  addCompetency: (competency) => {
    const now = new Date().toISOString();
    const newComp: CompetencyMatrix = {
      ...competency,
      id: `comp-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    set((state) => ({ competencies: [...state.competencies, newComp] }));
  },

  updateCompetency: (id, updates) => {
    set((state) => ({
      competencies: state.competencies.map((comp) =>
        comp.id === id ? { ...comp, ...updates, updatedAt: new Date().toISOString() } : comp
      )
    }));
  },

  deleteCompetency: (id) => {
    set((state) => ({
      competencies: state.competencies.filter((comp) => comp.id !== id)
    }));
  },

  importCompetencies: (comps) => {
    const now = new Date().toISOString();
    const newComps = comps.map((comp, index) => ({
      ...comp,
      id: `comp-import-${Date.now()}-${index}`,
      createdAt: now,
      updatedAt: now
    }));
    set((state) => ({
      competencies: [...state.competencies, ...newComps]
    }));
  },

  getCompetenciesByTenant: (tenantId) => {
    return get().competencies.filter((comp) => comp.tenantId === tenantId);
  },

  getCompetenciesByOrganization: (organizationId) => {
    return get().competencies.filter((comp) => comp.organizationId === organizationId);
  },

  productionSites: [
    {
      id: 'site-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      name: 'Производственная площадка №1',
      address: 'г. Москва, ул. Заводская, д. 10',
      code: 'ПП-1',
      head: 'Кузнецов А.В.',
      phone: '+7 (999) 111-22-33',
      status: 'active',
      createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'site-2',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      name: 'Производственная площадка №2',
      address: 'Московская обл., г. Подольск, ул. Промышленная, д. 5',
      code: 'ПП-2',
      head: 'Морозов В.И.',
      phone: '+7 (999) 222-33-44',
      status: 'active',
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'site-3',
      tenantId: 'tenant-1',
      organizationId: 'org-2',
      name: 'Сервисный центр',
      address: 'г. Москва, пр. Индустриальный, д. 20',
      code: 'СЦ-1',
      status: 'active',
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  addProductionSite: (site) => {
    const newSite: ProductionSite = {
      ...site,
      id: `site-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ productionSites: [...state.productionSites, newSite] }));
  },

  updateProductionSite: (id, updates) => {
    set((state) => ({
      productionSites: state.productionSites.map((site) =>
        site.id === id ? { ...site, ...updates } : site
      )
    }));
  },

  deleteProductionSite: (id) => {
    set((state) => ({
      productionSites: state.productionSites.filter((site) => site.id !== id)
    }));
  },

  getProductionSitesByOrganization: (organizationId) => {
    return get().productionSites.filter((site) => site.organizationId === organizationId);
  },

  importProductionSites: (sites) => {
    const newSites = sites.map((site, index) => ({
      ...site,
      id: `site-import-${Date.now()}-${index}`,
      createdAt: new Date().toISOString()
    }));
    set((state) => ({
      productionSites: [...state.productionSites, ...newSites]
    }));
  },

  systemUsers: [],

  addSystemUser: (user) => {
    const newUser: SystemUser = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ systemUsers: [...state.systemUsers, newUser] }));
  },

  updateSystemUser: (id, updates) => {
    set((state) => ({
      systemUsers: state.systemUsers.map((user) =>
        user.id === id ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
      )
    }));
  },

  deleteSystemUser: (id) => {
    set((state) => ({
      systemUsers: state.systemUsers.filter((user) => user.id !== id)
    }));
  },

  getSystemUsersByTenant: (tenantId) => {
    return get().systemUsers.filter((user) => user.tenantId === tenantId);
  }
}), { name: 'settings-storage' }));