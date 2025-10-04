import { create } from 'zustand';
import type { Organization, HazardousObject } from '@/types/catalog';

interface CatalogState {
  organizations: Organization[];
  objects: HazardousObject[];
  selectedOrganization: string | null;
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt'>) => string;
  addObject: (obj: Omit<HazardousObject, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateObject: (id: string, updates: Partial<HazardousObject>) => void;
  getObjectsByOrganization: (organizationId: string) => HazardousObject[];
  setSelectedOrganization: (id: string | null) => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  organizations: [
    {
      id: 'org-1',
      tenantId: 'tenant-1',
      name: 'ООО "Промышленная безопасность"',
      inn: '7707123456',
      type: 'holding',
      level: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 'org-2',
      tenantId: 'tenant-1',
      name: 'Филиал Северный',
      inn: '7707123456',
      type: 'branch',
      parentId: 'org-1',
      level: 1,
      createdAt: new Date().toISOString()
    }
  ],
  objects: [
    {
      id: 'obj-1',
      tenantId: 'tenant-1',
      code: 'OPO-001',
      name: 'Котельная №1',
      type: 'industrial',
      hazardClass: '2',
      location: {
        address: 'г. Москва, ул. Промышленная, 15',
        coordinates: { lat: 55.751244, lng: 37.618423 }
      },
      responsiblePerson: 'Иванов И.И.',
      registrationNumber: 'A-77-123456',
      registrationDate: '2020-01-15',
      status: 'active',
      organizationId: 'org-2',
      organizationName: 'Филиал Северный',
      commissioningDate: '2020-02-01',
      nextExaminationDate: '2026-02-01',
      equipment: [],
      documentation: [],
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  selectedOrganization: null,
  
  addOrganization: (org) => {
    const id = `org-${Date.now()}`;
    const newOrg: Organization = {
      ...org,
      id,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ organizations: [...state.organizations, newOrg] }));
    return id;
  },
  
  addObject: (obj) => {
    const id = `obj-${Date.now()}`;
    const newObj: HazardousObject = {
      ...obj,
      id,
      equipment: obj.equipment || [],
      documentation: obj.documentation || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ objects: [...state.objects, newObj] }));
    return id;
  },
  
  updateObject: (id, updates) => {
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates, updatedAt: new Date().toISOString() } : obj
      )
    }));
  },
  
  getObjectsByOrganization: (organizationId) => {
    return get().objects.filter((obj) => obj.organizationId === organizationId);
  },
  
  setSelectedOrganization: (id) => {
    set({ selectedOrganization: id });
  }
}));
