// src/stores/settingsStore.ts
// Описание: Zustand store для управления настройками системы
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization, Department, Personnel, CompetencyMatrix, ProductionSite, SystemUser, ExternalOrganization, Person, Position, Certification, Competency, OrganizationContractor, InterOrgDocument, ContractorFacilityAccess } from '@/types';
import {
  mockOrganizations,
  mockDepartments,
  mockPeople,
  mockPositions,
  mockPersonnel,
  mockCompetencies,
  mockCertifications,
  mockProductionSites,
  mockExternalOrganizations,
  mockSystemUsers,
  mockCompetencyMatrix,
  mockContractors,
  certificationCategories,
  industrialSafetyAreas,
  energySafetyAreas,
  electricalSafetyAreas,
  heightWorkAreas,
  getAreasForCategory
} from './mockData';

interface SettingsState {
  organizations: Organization[];
  departments: Department[];
  people: Person[];
  positions: Position[];
  personnel: Personnel[];
  competencies: CompetencyMatrix[];
  competenciesDirectory: Competency[];
  certifications: Certification[];
  productionSites: ProductionSite[];
  systemUsers: SystemUser[];
  externalOrganizations: ExternalOrganization[];
  certificationAreas: {
    categories: readonly string[];
    industrialSafety: readonly string[];
    energySafety: readonly string[];
    electricalSafety: readonly string[];
    heightWork: readonly string[];
    getAreasForCategory: (category: string) => readonly string[];
  };
  
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt'>) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  getOrganizationsByTenant: (tenantId: string) => Organization[];
  getDepartmentsByTenant: (tenantId: string) => Department[];
  getDepartmentsByOrganization: (orgId: string) => Department[];
  getProductionSitesByOrganization: (orgId: string) => ProductionSite[];
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  
  addPerson: (person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  importPeople: (people: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  
  addPosition: (position: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  deletePosition: (id: string) => void;
  importPositions: (positions: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  
  addPersonnel: (person: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePersonnel: (id: string, updates: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;
  
  addCompetency: (competency: Omit<CompetencyMatrix, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompetency: (id: string, updates: Partial<CompetencyMatrix>) => void;
  deleteCompetency: (id: string) => void;
  
  importOrganizations: (orgs: Omit<Organization, 'id' | 'createdAt'>[]) => void;
  importDepartments: (depts: Omit<Department, 'id' | 'createdAt'>[]) => void;
  importPersonnel: (people: Omit<Personnel, 'id' | 'createdAt'>[]) => void;
  importCompetencies: (comps: Omit<CompetencyMatrix, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  
  addProductionSite: (site: Omit<ProductionSite, 'id' | 'createdAt'>) => void;
  updateProductionSite: (id: string, updates: Partial<ProductionSite>) => void;
  deleteProductionSite: (id: string) => void;
  importProductionSites: (sites: Omit<ProductionSite, 'id' | 'createdAt'>[]) => void;
  
  addSystemUser: (user: Omit<SystemUser, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSystemUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteSystemUser: (id: string) => void;
  
  addExternalOrganization: (org: Omit<ExternalOrganization, 'id' | 'createdAt'>) => void;
  updateExternalOrganization: (id: string, updates: Partial<ExternalOrganization>) => void;
  deleteExternalOrganization: (id: string) => void;
  importExternalOrganizations: (orgs: Omit<ExternalOrganization, 'id' | 'createdAt'>[]) => void;

  addCompetencyDir: (competency: Omit<Competency, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompetencyDir: (id: string, updates: Partial<Competency>) => void;
  deleteCompetencyDir: (id: string) => void;
  importCompetenciesDir: (comps: Omit<Competency, 'id' | 'createdAt' | 'updatedAt'>[]) => void;

  addCertification: (cert: Omit<Certification, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;

  contractors: OrganizationContractor[];
  getContractorsByTenant: (tenantId: string) => OrganizationContractor[];
  addContractor: (contractor: Omit<OrganizationContractor, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContractor: (id: string, updates: Partial<OrganizationContractor>) => void;
  deleteContractor: (id: string) => void;

  interOrgDocuments: InterOrgDocument[];
  addInterOrgDocument: (doc: Omit<InterOrgDocument, 'id' | 'sentAt'>) => void;
  updateInterOrgDocument: (id: string, updates: Partial<InterOrgDocument>) => void;
  deleteInterOrgDocument: (id: string) => void;

  contractorFacilityAccesses: ContractorFacilityAccess[];
  getContractorFacilityAccessByTenant: (tenantId: string) => ContractorFacilityAccess[];
  getContractorFacilityAccessByContractor: (contractorId: string) => ContractorFacilityAccess[];
  getContractorFacilityAccessByFacility: (facilityId: string) => ContractorFacilityAccess[];
  addContractorFacilityAccess: (access: Omit<ContractorFacilityAccess, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContractorFacilityAccess: (id: string, updates: Partial<ContractorFacilityAccess>) => void;
  deleteContractorFacilityAccess: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(persist((set, get) => ({
  organizations: mockOrganizations,

  departments: mockDepartments,

  people: mockPeople,

  positions: mockPositions,

  personnel: mockPersonnel,

  certificationAreas: {
    categories: certificationCategories,
    industrialSafety: industrialSafetyAreas,
    energySafety: energySafetyAreas,
    electricalSafety: electricalSafetyAreas,
    heightWork: heightWorkAreas,
    getAreasForCategory
  },

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

  getOrganizationsByTenant: (tenantId) => {
    return get().organizations.filter((org) => org.tenantId === tenantId);
  },

  getDepartmentsByTenant: (tenantId) => {
    const orgIds = get().organizations
      .filter(org => org.tenantId === tenantId)
      .map(org => org.id);
    return get().departments.filter(dept => orgIds.includes(dept.organizationId));
  },

  getDepartmentsByOrganization: (orgId) => {
    return get().departments.filter(dept => dept.organizationId === orgId);
  },

  getProductionSitesByOrganization: (orgId) => {
    return get().productionSites.filter(site => site.organizationId === orgId);
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

  addPerson: (person) => {
    const newPerson: Person = {
      ...person,
      id: `person-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ people: [...state.people, newPerson] }));
  },

  updatePerson: (id, updates) => {
    set((state) => ({
      people: state.people.map((person) =>
        person.id === id ? { ...person, ...updates, updatedAt: new Date().toISOString() } : person
      )
    }));
  },

  deletePerson: (id) => {
    set((state) => ({
      people: state.people.filter((person) => person.id !== id),
      personnel: state.personnel.filter((p) => p.personId !== id)
    }));
  },



  importPeople: (people) => {
    const newPeople = people.map((person, index) => ({
      ...person,
      id: `person-import-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    set((state) => ({ people: [...state.people, ...newPeople] }));
  },

  addPosition: (position) => {
    const newPosition: Position = {
      ...position,
      id: `pos-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ positions: [...state.positions, newPosition] }));
  },

  updatePosition: (id, updates) => {
    set((state) => ({
      positions: state.positions.map((position) =>
        position.id === id ? { ...position, ...updates, updatedAt: new Date().toISOString() } : position
      )
    }));
  },

  deletePosition: (id) => {
    set((state) => ({
      positions: state.positions.filter((position) => position.id !== id),
      personnel: state.personnel.filter((p) => p.positionId !== id)
    }));
  },



  importPositions: (positions) => {
    const newPositions = positions.map((position, index) => ({
      ...position,
      id: `pos-import-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    set((state) => ({ positions: [...state.positions, ...newPositions] }));
  },

  addPersonnel: (person) => {
    const newPerson: Personnel = {
      ...person,
      id: `personnel-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ personnel: [...state.personnel, newPerson] }));
  },

  updatePersonnel: (id, updates) => {
    set((state) => ({
      personnel: state.personnel.map((person) =>
        person.id === id ? { ...person, ...updates, updatedAt: new Date().toISOString() } : person
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



  competencies: mockCompetencyMatrix,

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



  productionSites: mockProductionSites,

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

  systemUsers: mockSystemUsers,

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



  externalOrganizations: mockExternalOrganizations,

  addExternalOrganization: (org) => {
    const newOrg: ExternalOrganization = {
      ...org,
      id: `ext-org-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ externalOrganizations: [...state.externalOrganizations, newOrg] }));
  },

  updateExternalOrganization: (id, updates) => {
    set((state) => ({
      externalOrganizations: state.externalOrganizations.map((org) =>
        org.id === id ? { ...org, ...updates } : org
      )
    }));
  },

  deleteExternalOrganization: (id) => {
    set((state) => ({
      externalOrganizations: state.externalOrganizations.filter((org) => org.id !== id)
    }));
  },



  importExternalOrganizations: (orgs) => {
    const newOrgs = orgs.map((org, index) => ({
      ...org,
      id: `ext-org-import-${Date.now()}-${index}`,
      createdAt: new Date().toISOString()
    }));
    set((state) => ({
      externalOrganizations: [...state.externalOrganizations, ...newOrgs]
    }));
  },

  competenciesDirectory: mockCompetencies,

  certifications: mockCertifications,

  addCompetencyDir: (competency) => {
    const newComp: Competency = {
      ...competency,
      id: `comp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ competenciesDirectory: [...state.competenciesDirectory, newComp] }));
  },

  updateCompetencyDir: (id, updates) => {
    set((state) => ({
      competenciesDirectory: state.competenciesDirectory.map((comp) =>
        comp.id === id ? { ...comp, ...updates, updatedAt: new Date().toISOString() } : comp
      )
    }));
  },

  deleteCompetencyDir: (id) => {
    set((state) => ({
      competenciesDirectory: state.competenciesDirectory.filter((comp) => comp.id !== id)
    }));
  },



  importCompetenciesDir: (comps) => {
    const newComps = comps.map((comp, index) => ({
      ...comp,
      id: `comp-import-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    set((state) => ({ competenciesDirectory: [...state.competenciesDirectory, ...newComps] }));
  },

  addCertification: (cert) => {
    const expiryDate = new Date(cert.expiryDate);
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: 'valid' | 'expiring' | 'expired';
    if (daysLeft < 0) {
      status = 'expired';
    } else if (daysLeft <= 30) {
      status = 'expiring';
    } else {
      status = 'valid';
    }

    const newCert: Certification = {
      ...cert,
      id: `cert-${Date.now()}`,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ certifications: [...state.certifications, newCert] }));
  },

  updateCertification: (id, updates) => {
    set((state) => ({
      certifications: state.certifications.map((cert) => {
        if (cert.id !== id) return cert;
        
        const updatedCert = { ...cert, ...updates };
        
        if (updates.expiryDate) {
          const expiryDate = new Date(updates.expiryDate);
          const today = new Date();
          const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysLeft < 0) {
            updatedCert.status = 'expired';
          } else if (daysLeft <= 30) {
            updatedCert.status = 'expiring';
          } else {
            updatedCert.status = 'valid';
          }
        }
        
        return { ...updatedCert, updatedAt: new Date().toISOString() };
      })
    }));
  },

  deleteCertification: (id) => {
    set((state) => ({
      certifications: state.certifications.filter((cert) => cert.id !== id)
    }));
  },



  contractors: mockContractors,

  getContractorsByTenant: (tenantId) => {
    return get().contractors.filter((c) => c.tenantId === tenantId);
  },

  addContractor: (contractor) => {
    const newContractor: OrganizationContractor = {
      ...contractor,
      id: `contractor-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ contractors: [...state.contractors, newContractor] }));
  },

  updateContractor: (id, updates) => {
    set((state) => ({
      contractors: state.contractors.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    }));
  },

  deleteContractor: (id) => {
    set((state) => ({
      contractors: state.contractors.filter((c) => c.id !== id)
    }));
  },



  interOrgDocuments: [],

  addInterOrgDocument: (doc) => {
    const newDoc: InterOrgDocument = {
      ...doc,
      id: `inter-doc-${Date.now()}`,
      sentAt: new Date().toISOString()
    };
    set((state) => ({ interOrgDocuments: [...state.interOrgDocuments, newDoc] }));
  },

  updateInterOrgDocument: (id, updates) => {
    set((state) => ({
      interOrgDocuments: state.interOrgDocuments.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      )
    }));
  },

  deleteInterOrgDocument: (id) => {
    set((state) => ({
      interOrgDocuments: state.interOrgDocuments.filter((doc) => doc.id !== id)
    }));
  },

  contractorFacilityAccesses: [],

  getContractorFacilityAccessByTenant: (tenantId) => {
    return get().contractorFacilityAccesses.filter((a) => a.tenantId === tenantId);
  },

  getContractorFacilityAccessByContractor: (contractorId) => {
    return get().contractorFacilityAccesses.filter((a) => a.contractorId === contractorId);
  },

  getContractorFacilityAccessByFacility: (facilityId) => {
    return get().contractorFacilityAccesses.filter((a) => a.facilityId === facilityId);
  },

  addContractorFacilityAccess: (access) => {
    const newAccess: ContractorFacilityAccess = {
      ...access,
      id: `access-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ contractorFacilityAccesses: [...state.contractorFacilityAccesses, newAccess] }));
  },

  updateContractorFacilityAccess: (id, updates) => {
    set((state) => ({
      contractorFacilityAccesses: state.contractorFacilityAccesses.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      )
    }));
  },

  deleteContractorFacilityAccess: (id) => {
    set((state) => ({
      contractorFacilityAccesses: state.contractorFacilityAccesses.filter((a) => a.id !== id)
    }));
  },

}), { name: 'settings-storage-v3' }));