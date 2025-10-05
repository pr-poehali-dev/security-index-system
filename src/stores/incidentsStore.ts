import { create } from 'zustand';
import type { Incident } from '@/types';

interface IncidentsState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  filters: {
    status: Incident['status'] | 'all';
    severity: Incident['severity'] | 'all';
    type: Incident['type'] | 'all';
    organizationId: string | 'all';
  };
  setFilters: (filters: Partial<IncidentsState['filters']>) => void;
  addIncident: (incident: Omit<Incident, 'id' | 'reportedAt'>) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  selectIncident: (incident: Incident | null) => void;
  startInvestigation: (id: string, assignedTo: string) => void;
  resolveIncident: (id: string, rootCause: string, correctiveActions: string) => void;
  closeIncident: (id: string) => void;
  getFilteredIncidents: () => Incident[];
  getIncidentStats: () => {
    total: number;
    reported: number;
    investigating: number;
    resolved: number;
    critical: number;
    thisMonth: number;
  };
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    title: 'Утечка масла из компрессора К-301',
    description: 'Обнаружена утечка гидравлического масла в количестве около 2 литров',
    type: 'equipment_failure',
    severity: 'high',
    status: 'investigating',
    reportedBy: 'Сидоров С.С.',
    assignedTo: 'Иванов И.И.',
    occurredAt: '2024-10-05T10:30:00',
    reportedAt: '2024-10-05T10:45:00'
  },
  {
    id: '2',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    title: 'Работник без средств индивидуальной защиты',
    description: 'Работник Петров обнаружен в цехе без защитных очков',
    type: 'violation',
    severity: 'medium',
    status: 'resolved',
    reportedBy: 'Козлов А.В.',
    assignedTo: 'Кадровая служба',
    occurredAt: '2024-10-03T14:20:00',
    reportedAt: '2024-10-03T14:25:00',
    resolvedAt: '2024-10-04T09:00:00',
    rootCause: 'Работник не был проинформирован об обязательности использования СИЗ в данной зоне',
    correctiveActions: 'Проведен внеплановый инструктаж. Обновлены информационные таблички.'
  },
  {
    id: '3',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    title: 'Чуть не произошло падение груза',
    description: 'При погрузке ослабло крепление стропов, груз качнулся',
    type: 'near_miss',
    severity: 'critical',
    status: 'reported',
    reportedBy: 'Смирнова А.П.',
    occurredAt: '2024-10-06T11:15:00',
    reportedAt: '2024-10-06T11:20:00'
  },
  {
    id: '4',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    title: 'Травма руки при обслуживании станка',
    description: 'Работник получил порез правой руки при замене режущего инструмента',
    type: 'accident',
    severity: 'critical',
    status: 'investigating',
    reportedBy: 'Медпункт',
    assignedTo: 'Комиссия по расследованию',
    occurredAt: '2024-10-01T16:40:00',
    reportedAt: '2024-10-01T16:50:00'
  }
];

export const useIncidentsStore = create<IncidentsState>((set, get) => ({
  incidents: MOCK_INCIDENTS,
  selectedIncident: null,
  filters: {
    status: 'all',
    severity: 'all',
    type: 'all',
    organizationId: 'all'
  },

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  addIncident: (incidentData) => set((state) => ({
    incidents: [
      {
        ...incidentData,
        id: `incident-${Date.now()}`,
        reportedAt: new Date().toISOString()
      },
      ...state.incidents
    ]
  })),

  updateIncident: (id, updates) => set((state) => ({
    incidents: state.incidents.map((incident) =>
      incident.id === id ? { ...incident, ...updates } : incident
    ),
    selectedIncident: state.selectedIncident?.id === id 
      ? { ...state.selectedIncident, ...updates } 
      : state.selectedIncident
  })),

  deleteIncident: (id) => set((state) => ({
    incidents: state.incidents.filter((incident) => incident.id !== id),
    selectedIncident: state.selectedIncident?.id === id ? null : state.selectedIncident
  })),

  selectIncident: (incident) => set({ selectedIncident: incident }),

  startInvestigation: (id, assignedTo) => set((state) => ({
    incidents: state.incidents.map((incident) =>
      incident.id === id
        ? { ...incident, status: 'investigating', assignedTo }
        : incident
    )
  })),

  resolveIncident: (id, rootCause, correctiveActions) => set((state) => ({
    incidents: state.incidents.map((incident) =>
      incident.id === id
        ? {
            ...incident,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            rootCause,
            correctiveActions
          }
        : incident
    )
  })),

  closeIncident: (id) => set((state) => ({
    incidents: state.incidents.map((incident) =>
      incident.id === id ? { ...incident, status: 'closed' } : incident
    )
  })),

  getFilteredIncidents: () => {
    const { incidents, filters } = get();
    return incidents.filter((incident) => {
      if (filters.status !== 'all' && incident.status !== filters.status) return false;
      if (filters.severity !== 'all' && incident.severity !== filters.severity) return false;
      if (filters.type !== 'all' && incident.type !== filters.type) return false;
      if (filters.organizationId !== 'all' && incident.organizationId !== filters.organizationId) return false;
      return true;
    });
  },

  getIncidentStats: () => {
    const { incidents } = get();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: incidents.length,
      reported: incidents.filter((i) => i.status === 'reported').length,
      investigating: incidents.filter((i) => i.status === 'investigating').length,
      resolved: incidents.filter((i) => i.status === 'resolved').length,
      critical: incidents.filter((i) => i.severity === 'critical' && i.status !== 'closed').length,
      thisMonth: incidents.filter((i) => new Date(i.reportedAt) >= firstDayOfMonth).length
    };
  }
}));
