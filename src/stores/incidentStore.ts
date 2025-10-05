import { create } from 'zustand';
import type { Incident, IncidentType } from '@/types/incidents';

interface IncidentState {
  incidents: Incident[];
  incidentTypes: IncidentType[];
  selectedIncident: Incident | null;
  error: string | null;
  
  // Actions
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  selectIncident: (incident: Incident | null) => void;
  getIncidentsByObject: (objectId: string) => Incident[];
  getIncidentsByStatus: (status: Incident['status']) => Incident[];
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: [
    {
      id: 'inc-1',
      tenantId: 'tenant-1',
      title: 'Утечка теплоносителя на котле №2',
      description: 'Обнаружена утечка теплоносителя в районе фланцевого соединения',
      typeId: 'type-1',
      priority: 'high',
      status: 'in_progress',
      source: 'manual',
      objectId: 'obj-1',
      assignedTo: '2',
      assignedToName: 'Петров П.П.',
      createdBy: '3',
      createdByName: 'Аудитор',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  incidentTypes: [
    { id: 'type-1', code: 'LEAK', name: 'Утечка', category: 'leak', requiresInvestigation: true },
    { id: 'type-2', code: 'FIRE', name: 'Пожар', category: 'fire', requiresInvestigation: true },
    { id: 'type-3', code: 'VIOLATION', name: 'Нарушение', category: 'violation', requiresInvestigation: false },
    { id: 'type-4', code: 'ACCIDENT', name: 'Несчастный случай', category: 'accident', requiresInvestigation: true },
    { id: 'type-5', code: 'EQUIPMENT', name: 'Поломка оборудования', category: 'equipment_failure', requiresInvestigation: false }
  ],
  
  selectedIncident: null,
  error: null,
  
  addIncident: (incident) => {
    try {
      const id = `inc-${Date.now()}`;
      const newIncident: Incident = {
        ...incident,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        attachments: []
      };
      set((state) => ({ 
        incidents: [...state.incidents, newIncident],
        error: null
      }));
      return id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при создании инцидента';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  updateIncident: (id, updates) => {
    try {
      set((state) => ({
        incidents: state.incidents.map((inc) =>
          inc.id === id ? { ...inc, ...updates, updatedAt: new Date().toISOString() } : inc
        ),
        selectedIncident: state.selectedIncident?.id === id 
          ? { ...state.selectedIncident, ...updates, updatedAt: new Date().toISOString() }
          : state.selectedIncident,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при обновлении инцидента';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  deleteIncident: (id) => {
    try {
      set((state) => ({
        incidents: state.incidents.filter((inc) => inc.id !== id),
        selectedIncident: state.selectedIncident?.id === id ? null : state.selectedIncident,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при удалении инцидента';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  selectIncident: (incident) => {
    set({ selectedIncident: incident, error: null });
  },
  
  getIncidentsByObject: (objectId) => {
    return get().incidents.filter((inc) => inc.objectId === objectId);
  },
  
  getIncidentsByStatus: (status) => {
    return get().incidents.filter((inc) => inc.status === status);
  },
  
  setError: (error) => {
    set({ error });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
