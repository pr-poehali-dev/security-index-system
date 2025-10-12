// src/stores/catalogStore.ts
// Описание: Zustand store для управления каталогом организаций и объектов
import { create } from 'zustand';
import type { Organization, IndustrialObject, ObjectDocument } from '@/types/catalog';

interface CatalogState {
  organizations: Organization[];
  objects: IndustrialObject[];
  documents: ObjectDocument[];
  selectedOrganization: string | null;
  expandedNodes: string[];
  error: string | null;
  
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  
  addObject: (obj: Omit<IndustrialObject, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateObject: (id: string, updates: Partial<IndustrialObject>) => void;
  deleteObject: (id: string) => void;
  
  addDocument: (doc: Omit<ObjectDocument, 'id' | 'createdAt'>) => string;
  updateDocument: (id: string, updates: Partial<ObjectDocument>) => void;
  deleteDocument: (id: string) => void;
  getDocumentsByObject: (objectId: string) => ObjectDocument[];
  
  getObjectsByOrganization: (organizationId: string) => IndustrialObject[];
  getOrganizationTree: () => Organization[];
  
  setSelectedOrganization: (id: string | null) => void;
  toggleExpandNode: (id: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const buildTree = (organizations: Organization[]): Organization[] => {
  const orgMap = new Map<string, Organization>();
  const rootOrgs: Organization[] = [];

  organizations.forEach(org => {
    orgMap.set(org.id, { ...org, children: [] });
  });

  organizations.forEach(org => {
    const node = orgMap.get(org.id);
    if (!node) return;
    if (org.parentId) {
      const parent = orgMap.get(org.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      }
    } else {
      rootOrgs.push(node);
    }
  });

  return rootOrgs;
};

export const useCatalogStore = create<CatalogState>((set, get) => ({
  organizations: [
    {
      id: 'org-1',
      tenantId: 'tenant-1',
      name: 'ПАО "Энергопром"',
      inn: '7707123456',
      type: 'holding',
      level: 0,
      contactPerson: 'Петров П.П.',
      phone: '+7 (495) 123-45-67',
      email: 'info@energoprom.ru',
      address: 'г. Москва, ул. Промышленная, 1',
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z'
    },
    {
      id: 'org-2',
      tenantId: 'tenant-1',
      name: 'ООО "Энергопром-Север"',
      inn: '7707234567',
      type: 'legal_entity',
      parentId: 'org-1',
      level: 1,
      contactPerson: 'Сидоров С.С.',
      phone: '+7 (812) 234-56-78',
      email: 'sever@energoprom.ru',
      address: 'г. Санкт-Петербург, пр. Энергетиков, 15',
      createdAt: '2020-02-01T00:00:00Z',
      updatedAt: '2020-02-01T00:00:00Z'
    },
    {
      id: 'org-3',
      tenantId: 'tenant-1',
      name: 'Филиал "Северная ТЭЦ"',
      inn: '7707234567',
      type: 'branch',
      parentId: 'org-2',
      level: 2,
      contactPerson: 'Иванов И.И.',
      phone: '+7 (812) 345-67-89',
      email: 'tec@energoprom.ru',
      address: 'г. Санкт-Петербург, ул. Тепловая, 5',
      createdAt: '2020-03-01T00:00:00Z',
      updatedAt: '2020-03-01T00:00:00Z'
    }
  ],
  
  objects: [
    {
      id: 'obj-1',
      tenantId: 'tenant-1',
      organizationId: 'org-3',
      registrationNumber: 'A-78-001234',
      name: 'Котельная №1',
      type: 'opo',
      category: 'Получение, использование, переработка, хранение горючих веществ',
      hazardClass: 'II',
      commissioningDate: '2015-06-15',
      status: 'active',
      location: {
        address: 'г. Санкт-Петербург, ул. Тепловая, 5, корп. 1',
        coordinates: { lat: 59.9342802, lng: 30.3350986 }
      },
      responsiblePerson: 'Кузнецов А.В.',
      nextExpertiseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextDiagnosticDate: '2025-12-15',
      description: 'Котельная производительностью 50 Гкал/ч',
      createdAt: '2020-03-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 'obj-2',
      tenantId: 'tenant-1',
      organizationId: 'org-3',
      registrationNumber: 'A-78-001235',
      name: 'ГТС-01 Водозабор',
      type: 'gts',
      category: 'Гидротехнические сооружения',
      hazardClass: 'III',
      commissioningDate: '2010-08-20',
      status: 'active',
      location: {
        address: 'г. Санкт-Петербург, Приморский район, участок 12',
        coordinates: { lat: 60.0074123, lng: 30.2962334 }
      },
      responsiblePerson: 'Смирнов В.Г.',
      nextExpertiseDate: '2024-08-20',
      nextTestDate: '2025-05-01',
      description: 'Водозаборное сооружение, класс III',
      createdAt: '2020-04-10T00:00:00Z',
      updatedAt: '2024-02-20T00:00:00Z'
    },
    {
      id: 'obj-3',
      tenantId: 'tenant-1',
      organizationId: 'org-3',
      registrationNumber: 'ZS-78-5678',
      name: 'Административное здание',
      type: 'building',
      commissioningDate: '2012-05-10',
      status: 'active',
      location: {
        address: 'г. Санкт-Петербург, ул. Тепловая, 5',
        coordinates: { lat: 59.9340000, lng: 30.3348000 }
      },
      responsiblePerson: 'Петрова М.И.',
      description: '3-этажное административное здание',
      createdAt: '2020-05-01T00:00:00Z',
      updatedAt: '2023-11-10T00:00:00Z'
    }
  ],
  
  documents: [
    {
      id: 'doc-1',
      objectId: 'obj-1',
      title: 'Паспорт котельной №1',
      type: 'passport',
      documentNumber: 'ПСП-001-2015',
      issueDate: '2015-06-15',
      fileUrl: '/docs/passport-kotelnaya-1.pdf',
      fileName: 'passport-kotelnaya-1.pdf',
      fileSize: 2456789,
      status: 'valid',
      createdAt: '2020-03-15T00:00:00Z',
      uploadedBy: 'Иванов И.И.'
    },
    {
      id: 'doc-2',
      objectId: 'obj-1',
      title: 'Заключение экспертизы промышленной безопасности',
      type: 'certificate',
      documentNumber: 'ЭПБ-2024-0145',
      issueDate: '2024-01-15',
      expiryDate: '2026-06-15',
      fileUrl: '/docs/epb-kotelnaya-1.pdf',
      fileName: 'epb-kotelnaya-1.pdf',
      fileSize: 1234567,
      status: 'valid',
      createdAt: '2024-01-15T00:00:00Z',
      uploadedBy: 'Кузнецов А.В.'
    }
  ],
  
  selectedOrganization: null,
  expandedNodes: ['org-1', 'org-2'],
  error: null,
  
  addOrganization: (org) => {
    try {
      const id = `org-${Date.now()}`;
      const newOrg: Organization = {
        ...org,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      set((state) => ({ organizations: [...state.organizations, newOrg], error: null }));
      return id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при добавлении организации';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  updateOrganization: (id, updates) => {
    try {
      set((state) => ({
        organizations: state.organizations.map((org) =>
          org.id === id ? { ...org, ...updates, updatedAt: new Date().toISOString() } : org
        ),
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при обновлении организации';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  deleteOrganization: (id) => {
    try {
      set((state) => ({
        organizations: state.organizations.filter((org) => org.id !== id),
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при удалении организации';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  addObject: (obj) => {
    try {
      const id = `obj-${Date.now()}`;
      const newObj: IndustrialObject = {
        ...obj,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      set((state) => ({ objects: [...state.objects, newObj], error: null }));
      return id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при добавлении объекта';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  updateObject: (id, updates) => {
    try {
      set((state) => ({
        objects: state.objects.map((obj) =>
          obj.id === id ? { ...obj, ...updates, updatedAt: new Date().toISOString() } : obj
        ),
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при обновлении объекта';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  deleteObject: (id) => {
    try {
      set((state) => ({
        objects: state.objects.filter((obj) => obj.id !== id),
        documents: state.documents.filter((doc) => doc.objectId !== id),
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при удалении объекта';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  addDocument: (doc) => {
    try {
      const id = `doc-${Date.now()}`;
      const now = new Date();
      let status: ObjectDocument['status'] = 'valid';
      
      if (doc.expiryDate) {
        const expiryDate = new Date(doc.expiryDate);
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          status = 'expired';
        } else if (daysUntilExpiry <= 30) {
          status = 'expiring_soon';
        }
      }
      
      const newDoc: ObjectDocument = {
        ...doc,
        id,
        status,
        createdAt: now.toISOString()
      };
      set((state) => ({ documents: [...state.documents, newDoc], error: null }));
      return id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при добавлении документа';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  updateDocument: (id, updates) => {
    try {
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, ...updates } : doc
        ),
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при обновлении документа';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  deleteDocument: (id) => {
    try {
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при удалении документа';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  getDocumentsByObject: (objectId) => {
    return get().documents.filter((doc) => doc.objectId === objectId);
  },
  
  getObjectsByOrganization: (organizationId) => {
    return get().objects.filter((obj) => obj.organizationId === organizationId);
  },
  
  getOrganizationTree: () => {
    return buildTree(get().organizations);
  },
  
  setSelectedOrganization: (id) => {
    set({ selectedOrganization: id });
  },
  
  toggleExpandNode: (id) => {
    set((state) => ({
      expandedNodes: state.expandedNodes.includes(id)
        ? state.expandedNodes.filter((nodeId) => nodeId !== id)
        : [...state.expandedNodes, id]
    }));
  },
  
  setError: (error) => {
    set({ error });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));