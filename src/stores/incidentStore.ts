import { create } from 'zustand';
import type { Incident, IncidentType } from '@/types/incidents';

interface IncidentState {
  incidents: Incident[];
  incidentTypes: IncidentType[];
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  getIncidentsByObject: (objectId: string) => Incident[];
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
    { id: 'type-3', code: 'VIOLATION', name: 'Нарушение', category: 'violation', requiresInvestigation: false }
  ],
  
  addIncident: (incident) => {
    const id = `inc-${Date.now()}`;
    const newIncident: Incident = {
      ...incident,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: []
    };
    set((state) => ({ incidents: [...state.incidents, newIncident] }));
    return id;
  },
  
  updateIncident: (id, updates) => {
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id ? { ...inc, ...updates, updatedAt: new Date().toISOString() } : inc
      )
    }));
  },
  
  getIncidentsByObject: (objectId) => {
    return get().incidents.filter((inc) => inc.objectId === objectId);
  }
}));