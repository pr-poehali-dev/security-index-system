import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MaintenanceWork {
  id: string;
  tenantId: string;
  objectId: string;
  objectName: string;
  type: 'ТО' | 'Ремонт' | 'Замена';
  title: string;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  executor: string;
  executorContact?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceState {
  works: MaintenanceWork[];
  
  addWork: (work: Omit<MaintenanceWork, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWork: (id: string, updates: Partial<MaintenanceWork>) => void;
  deleteWork: (id: string) => void;
  getWorksByStatus: (status: MaintenanceWork['status']) => MaintenanceWork[];
  getWorksByType: (type: MaintenanceWork['type']) => MaintenanceWork[];
  getWorksByObject: (objectId: string) => MaintenanceWork[];
  getStatistics: () => {
    planned: number;
    inProgress: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
}

export const useMaintenanceStore = create<MaintenanceState>()(persist((set, get) => ({
  works: [],
  
  addWork: (work) => {
    const newWork: MaintenanceWork = {
      ...work,
      id: `work-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ works: [...state.works, newWork] }));
  },
  
  updateWork: (id, updates) => {
    set((state) => ({
      works: state.works.map((work) =>
        work.id === id ? { ...work, ...updates, updatedAt: new Date().toISOString() } : work
      )
    }));
  },
  
  deleteWork: (id) => {
    set((state) => ({ works: state.works.filter((work) => work.id !== id) }));
  },
  
  getWorksByStatus: (status) => {
    return get().works.filter((work) => work.status === status);
  },
  
  getWorksByType: (type) => {
    return get().works.filter((work) => work.type === type);
  },
  
  getWorksByObject: (objectId) => {
    return get().works.filter((work) => work.objectId === objectId);
  },
  
  getStatistics: () => {
    const works = get().works;
    const planned = works.filter((w) => w.status === 'planned').length;
    const inProgress = works.filter((w) => w.status === 'in_progress').length;
    const completed = works.filter((w) => w.status === 'completed').length;
    const overdue = works.filter((w) => w.status === 'overdue').length;
    const total = works.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      planned,
      inProgress,
      completed,
      overdue,
      completionRate
    };
  }
  
}), { name: 'maintenance-storage-v1' }));
