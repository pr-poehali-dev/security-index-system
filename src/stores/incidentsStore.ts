import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Incident, 
  IncidentSource, 
  IncidentDirection, 
  IncidentFundingType,
  IncidentCategory,
  IncidentSubcategory,
  IncidentStatus
} from '@/types';

const mockSources: IncidentSource[] = [
  { id: 'src-1', tenantId: 'tenant-1', name: 'Внутренняя проверка', status: 'active', createdAt: '2024-01-01' },
  { id: 'src-2', tenantId: 'tenant-1', name: 'Внешняя проверка', status: 'active', createdAt: '2024-01-01' },
  { id: 'src-3', tenantId: 'tenant-1', name: 'Сообщение работника', status: 'active', createdAt: '2024-01-01' },
];

const mockDirections: IncidentDirection[] = [
  { id: 'dir-1', tenantId: 'tenant-1', name: 'Промышленная безопасность', status: 'active', createdAt: '2024-01-01' },
  { id: 'dir-2', tenantId: 'tenant-1', name: 'Энергобезопасность', status: 'active', createdAt: '2024-01-01' },
  { id: 'dir-3', tenantId: 'tenant-1', name: 'Охрана труда', status: 'active', createdAt: '2024-01-01' },
  { id: 'dir-4', tenantId: 'tenant-1', name: 'Эксплуатация оборудования', status: 'active', createdAt: '2024-01-01' },
  { id: 'dir-5', tenantId: 'tenant-1', name: 'Эксплуатация зданий и сооружений', status: 'active', createdAt: '2024-01-01' },
];

const mockFundingTypes: IncidentFundingType[] = [
  { id: 'fund-1', tenantId: 'tenant-1', name: 'CAPEX', status: 'active', createdAt: '2024-01-01' },
  { id: 'fund-2', tenantId: 'tenant-1', name: 'OPEX', status: 'active', createdAt: '2024-01-01' },
  { id: 'fund-3', tenantId: 'tenant-1', name: 'Силами площадки', status: 'active', createdAt: '2024-01-01' },
];

const mockCategories: IncidentCategory[] = [
  { id: 'cat-1', tenantId: 'tenant-1', name: 'Категория 1', status: 'active', createdAt: '2024-01-01' },
  { id: 'cat-2', tenantId: 'tenant-1', name: 'Категория 2', status: 'active', createdAt: '2024-01-01' },
  { id: 'cat-3', tenantId: 'tenant-1', name: 'Категория 3', status: 'active', createdAt: '2024-01-01' },
];

const mockSubcategories: IncidentSubcategory[] = [
  { id: 'sub-1-1', tenantId: 'tenant-1', categoryId: 'cat-1', name: 'Подкатегория 1.1', status: 'active', createdAt: '2024-01-01' },
  { id: 'sub-1-2', tenantId: 'tenant-1', categoryId: 'cat-1', name: 'Подкатегория 1.2', status: 'active', createdAt: '2024-01-01' },
  { id: 'sub-1-3', tenantId: 'tenant-1', categoryId: 'cat-1', name: 'Подкатегория 1.3', status: 'active', createdAt: '2024-01-01' },
  { id: 'sub-2-1', tenantId: 'tenant-1', categoryId: 'cat-2', name: 'Подкатегория 2.1', status: 'active', createdAt: '2024-01-01' },
  { id: 'sub-2-2', tenantId: 'tenant-1', categoryId: 'cat-2', name: 'Подкатегория 2.2', status: 'active', createdAt: '2024-01-01' },
  { id: 'sub-3-1', tenantId: 'tenant-1', categoryId: 'cat-3', name: 'Подкатегория 3.1', status: 'active', createdAt: '2024-01-01' },
  { id: 'sub-3-2', tenantId: 'tenant-1', categoryId: 'cat-3', name: 'Подкатегория 3.2', status: 'active', createdAt: '2024-01-01' },
];

const mockIncidents: Incident[] = [
  {
    id: 'inc-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    productionSiteId: 'site-1',
    reportDate: '2025-01-15',
    sourceId: 'src-1',
    directionId: 'dir-1',
    description: 'Обнаружено нарушение требований промышленной безопасности при эксплуатации сосудов под давлением',
    correctiveAction: 'Провести внеочередную проверку технического состояния оборудования, организовать обучение персонала',
    fundingTypeId: 'fund-2',
    categoryId: 'cat-1',
    subcategoryId: 'sub-1-1',
    responsiblePersonnelId: 'pers-1',
    plannedDate: '2025-02-15',
    completedDate: undefined,
    daysLeft: 6,
    status: 'in_progress',
    notes: '',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15'
  },
  {
    id: 'inc-2',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    productionSiteId: 'site-1',
    reportDate: '2025-01-10',
    sourceId: 'src-3',
    directionId: 'dir-3',
    description: 'Работник сообщил о неисправности средств индивидуальной защиты',
    correctiveAction: 'Заменить СИЗ, провести проверку всех СИЗ на участке',
    fundingTypeId: 'fund-3',
    categoryId: 'cat-2',
    subcategoryId: 'sub-2-1',
    responsiblePersonnelId: 'pers-2',
    plannedDate: '2025-01-20',
    completedDate: '2025-01-18',
    daysLeft: 0,
    status: 'completed',
    notes: 'Выполнено досрочно',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-18'
  }
];

interface IncidentsState {
  incidents: Incident[];
  sources: IncidentSource[];
  directions: IncidentDirection[];
  fundingTypes: IncidentFundingType[];
  categories: IncidentCategory[];
  subcategories: IncidentSubcategory[];

  addIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'daysLeft'>) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  getIncidentsByTenant: (tenantId: string) => Incident[];
  
  addSource: (source: Omit<IncidentSource, 'id' | 'createdAt'>) => void;
  updateSource: (id: string, updates: Partial<IncidentSource>) => void;
  deleteSource: (id: string) => void;
  getSourcesByTenant: (tenantId: string) => IncidentSource[];

  addDirection: (direction: Omit<IncidentDirection, 'id' | 'createdAt'>) => void;
  updateDirection: (id: string, updates: Partial<IncidentDirection>) => void;
  deleteDirection: (id: string) => void;
  getDirectionsByTenant: (tenantId: string) => IncidentDirection[];

  addFundingType: (fundingType: Omit<IncidentFundingType, 'id' | 'createdAt'>) => void;
  updateFundingType: (id: string, updates: Partial<IncidentFundingType>) => void;
  deleteFundingType: (id: string) => void;
  getFundingTypesByTenant: (tenantId: string) => IncidentFundingType[];

  addCategory: (category: Omit<IncidentCategory, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<IncidentCategory>) => void;
  deleteCategory: (id: string) => void;
  getCategoriesByTenant: (tenantId: string) => IncidentCategory[];

  addSubcategory: (subcategory: Omit<IncidentSubcategory, 'id' | 'createdAt'>) => void;
  updateSubcategory: (id: string, updates: Partial<IncidentSubcategory>) => void;
  deleteSubcategory: (id: string) => void;
  getSubcategoriesByTenant: (tenantId: string) => IncidentSubcategory[];
  getSubcategoriesByCategory: (categoryId: string) => IncidentSubcategory[];

  calculateStatus: (plannedDate: string, completedDate?: string) => IncidentStatus;
  calculateDaysLeft: (plannedDate: string, completedDate?: string) => number;
}

export const useIncidentsStore = create<IncidentsState>()(persist((set, get) => ({
  incidents: mockIncidents,
  sources: mockSources,
  directions: mockDirections,
  fundingTypes: mockFundingTypes,
  categories: mockCategories,
  subcategories: mockSubcategories,

  addIncident: (incident) => {
    const newIncident: Incident = {
      ...incident,
      id: `inc-${Date.now()}`,
      daysLeft: get().calculateDaysLeft(incident.plannedDate, incident.completedDate),
      status: get().calculateStatus(incident.plannedDate, incident.completedDate),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ incidents: [...state.incidents, newIncident] }));
  },

  updateIncident: (id, updates) => {
    set((state) => ({
      incidents: state.incidents.map((inc) => {
        if (inc.id !== id) return inc;
        const updated = { ...inc, ...updates, updatedAt: new Date().toISOString() };
        updated.daysLeft = get().calculateDaysLeft(updated.plannedDate, updated.completedDate);
        updated.status = get().calculateStatus(updated.plannedDate, updated.completedDate);
        return updated;
      })
    }));
  },

  deleteIncident: (id) => {
    set((state) => ({ incidents: state.incidents.filter((inc) => inc.id !== id) }));
  },

  getIncidentsByTenant: (tenantId) => {
    return get().incidents.filter((inc) => inc.tenantId === tenantId);
  },

  addSource: (source) => {
    const newSource: IncidentSource = {
      ...source,
      id: `src-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ sources: [...state.sources, newSource] }));
  },

  updateSource: (id, updates) => {
    set((state) => ({
      sources: state.sources.map((s) => s.id === id ? { ...s, ...updates } : s)
    }));
  },

  deleteSource: (id) => {
    set((state) => ({ sources: state.sources.filter((s) => s.id !== id) }));
  },

  getSourcesByTenant: (tenantId) => {
    return get().sources.filter((s) => s.tenantId === tenantId);
  },

  addDirection: (direction) => {
    const newDirection: IncidentDirection = {
      ...direction,
      id: `dir-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ directions: [...state.directions, newDirection] }));
  },

  updateDirection: (id, updates) => {
    set((state) => ({
      directions: state.directions.map((d) => d.id === id ? { ...d, ...updates } : d)
    }));
  },

  deleteDirection: (id) => {
    set((state) => ({ directions: state.directions.filter((d) => d.id !== id) }));
  },

  getDirectionsByTenant: (tenantId) => {
    return get().directions.filter((d) => d.tenantId === tenantId);
  },

  addFundingType: (fundingType) => {
    const newFundingType: IncidentFundingType = {
      ...fundingType,
      id: `fund-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ fundingTypes: [...state.fundingTypes, newFundingType] }));
  },

  updateFundingType: (id, updates) => {
    set((state) => ({
      fundingTypes: state.fundingTypes.map((f) => f.id === id ? { ...f, ...updates } : f)
    }));
  },

  deleteFundingType: (id) => {
    set((state) => ({ fundingTypes: state.fundingTypes.filter((f) => f.id !== id) }));
  },

  getFundingTypesByTenant: (tenantId) => {
    return get().fundingTypes.filter((f) => f.tenantId === tenantId);
  },

  addCategory: (category) => {
    const newCategory: IncidentCategory = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ categories: [...state.categories, newCategory] }));
  },

  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((c) => c.id === id ? { ...c, ...updates } : c)
    }));
  },

  deleteCategory: (id) => {
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
  },

  getCategoriesByTenant: (tenantId) => {
    return get().categories.filter((c) => c.tenantId === tenantId);
  },

  addSubcategory: (subcategory) => {
    const newSubcategory: IncidentSubcategory = {
      ...subcategory,
      id: `sub-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ subcategories: [...state.subcategories, newSubcategory] }));
  },

  updateSubcategory: (id, updates) => {
    set((state) => ({
      subcategories: state.subcategories.map((s) => s.id === id ? { ...s, ...updates } : s)
    }));
  },

  deleteSubcategory: (id) => {
    set((state) => ({ subcategories: state.subcategories.filter((s) => s.id !== id) }));
  },

  getSubcategoriesByTenant: (tenantId) => {
    return get().subcategories.filter((s) => s.tenantId === tenantId);
  },

  getSubcategoriesByCategory: (categoryId) => {
    return get().subcategories.filter((s) => s.categoryId === categoryId);
  },

  calculateDaysLeft: (plannedDate: string, completedDate?: string) => {
    if (completedDate) return 0;
    const planned = new Date(plannedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((planned.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  },

  calculateStatus: (plannedDate: string, completedDate?: string): IncidentStatus => {
    if (!completedDate) {
      const daysLeft = get().calculateDaysLeft(plannedDate);
      if (daysLeft < 0) return 'overdue';
      if (daysLeft <= 3) return 'awaiting';
      return 'in_progress';
    }

    const planned = new Date(plannedDate);
    const completed = new Date(completedDate);
    
    if (completed <= planned) return 'completed';
    return 'completed_late';
  }

}), { name: 'incidents-storage-v1' }));
