import { create } from 'zustand';
import type { Equipment, Examination, MaintenanceRecord } from '@/types';

interface EquipmentState {
  equipment: Equipment[];
  examinations: Examination[];
  maintenanceRecords: MaintenanceRecord[];
  selectedEquipment: Equipment | null;
  error: string | null;
  filters: {
    status: Equipment['status'] | 'all';
    type: string | 'all';
    organizationId: string | 'all';
  };
  setFilters: (filters: Partial<EquipmentState['filters']>) => void;
  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  selectEquipment: (equipment: Equipment | null) => void;
  addExamination: (examination: Omit<Examination, 'id' | 'defects'>) => void;
  completeExamination: (id: string, result: Examination['result'], defects: Examination['defects']) => void;
  addMaintenance: (maintenance: Omit<MaintenanceRecord, 'id'>) => void;
  completeMaintenance: (id: string, nextMaintenanceDate?: string) => void;
  getEquipmentExaminations: (equipmentId: string) => Examination[];
  getEquipmentMaintenance: (equipmentId: string) => MaintenanceRecord[];
  getUpcomingMaintenance: () => MaintenanceRecord[];
  getEquipmentNeedingMaintenance: () => Equipment[];
  setError: (error: string | null) => void;
  clearError: () => void;
}

const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    name: 'Компрессор К-301',
    type: 'Компрессорное оборудование',
    manufacturer: 'Atlas Copco',
    serialNumber: 'AC-2024-1234',
    commissionDate: '2020-03-15',
    status: 'operational',
    nextMaintenanceDate: '2024-11-01',
    nextExaminationDate: '2025-03-15'
  },
  {
    id: 'eq-2',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    name: 'Насос центробежный Н-12',
    type: 'Насосное оборудование',
    manufacturer: 'Grundfos',
    serialNumber: 'GR-2019-5678',
    commissionDate: '2019-06-20',
    status: 'operational',
    nextMaintenanceDate: '2024-10-15',
    nextExaminationDate: '2024-12-20'
  },
  {
    id: 'eq-3',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    name: 'Котел паровой КП-500',
    type: 'Котельное оборудование',
    manufacturer: 'Bosch',
    serialNumber: 'BS-2018-9999',
    commissionDate: '2018-11-10',
    status: 'maintenance',
    nextMaintenanceDate: '2024-10-08',
    nextExaminationDate: '2024-11-10'
  },
  {
    id: 'eq-4',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    name: 'Кран мостовой КМ-10',
    type: 'Подъемное оборудование',
    manufacturer: 'Demag',
    serialNumber: 'DM-2021-4321',
    commissionDate: '2021-09-05',
    status: 'operational',
    nextMaintenanceDate: '2024-12-01',
    nextExaminationDate: '2024-10-20'
  }
];

const MOCK_EXAMINATIONS: Examination[] = [
  {
    id: 'exam-1',
    tenantId: 'tenant-1',
    equipmentId: 'eq-1',
    type: 'periodic',
    scheduledDate: '2024-10-10',
    status: 'scheduled',
    result: 'passed',
    defects: [],
    protocolNumber: 'EXAM-2024-001'
  },
  {
    id: 'exam-2',
    tenantId: 'tenant-1',
    equipmentId: 'eq-2',
    type: 'periodic',
    scheduledDate: '2024-09-15',
    completedDate: '2024-09-15',
    performedBy: 'Сидоров С.С.',
    result: 'conditional',
    defects: [
      {
        id: 'def-1',
        description: 'Износ подшипников, рекомендуется замена в течение месяца',
        severity: 'major',
        status: 'open'
      }
    ],
    protocolNumber: 'EXAM-2024-002'
  }
];

const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'maint-1',
    tenantId: 'tenant-1',
    equipmentId: 'eq-2',
    type: 'preventive',
    scheduledDate: '2024-10-15',
    workDescription: 'Замена масла, проверка уплотнений',
    cost: 5000
  },
  {
    id: 'maint-2',
    tenantId: 'tenant-1',
    equipmentId: 'eq-1',
    type: 'preventive',
    scheduledDate: '2024-09-01',
    completedDate: '2024-09-01',
    performedBy: 'Козлов А.В.',
    workDescription: 'Замена воздушных фильтров',
    partsUsed: 'Фильтры Atlas Copco 2901-0567-00 x2',
    cost: 8500,
    nextMaintenanceDate: '2024-12-01'
  },
  {
    id: 'maint-3',
    tenantId: 'tenant-1',
    equipmentId: 'eq-3',
    type: 'corrective',
    scheduledDate: '2024-10-08',
    workDescription: 'Ремонт системы автоматики после инцидента',
    cost: 25000
  }
];

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipment: MOCK_EQUIPMENT,
  examinations: MOCK_EXAMINATIONS,
  maintenanceRecords: MOCK_MAINTENANCE,
  selectedEquipment: null,
  filters: {
    status: 'all',
    type: 'all',
    organizationId: 'all'
  },

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  addEquipment: (equipmentData) => set((state) => ({
    equipment: [
      ...state.equipment,
      {
        ...equipmentData,
        id: `eq-${Date.now()}`
      }
    ]
  })),

  updateEquipment: (id, updates) => set((state) => ({
    equipment: state.equipment.map((eq) =>
      eq.id === id ? { ...eq, ...updates } : eq
    )
  })),

  deleteEquipment: (id) => set((state) => ({
    equipment: state.equipment.filter((eq) => eq.id !== id)
  })),

  selectEquipment: (equipment) => set({ selectedEquipment: equipment }),

  addExamination: (examinationData) => set((state) => ({
    examinations: [
      ...state.examinations,
      {
        ...examinationData,
        id: `exam-${Date.now()}`,
        defects: []
      }
    ]
  })),

  completeExamination: (id, result, defects) => set((state) => ({
    examinations: state.examinations.map((exam) =>
      exam.id === id
        ? {
            ...exam,
            completedDate: new Date().toISOString().split('T')[0],
            result,
            defects
          }
        : exam
    )
  })),

  addMaintenance: (maintenanceData) => set((state) => ({
    maintenanceRecords: [
      ...state.maintenanceRecords,
      {
        ...maintenanceData,
        id: `maint-${Date.now()}`
      }
    ]
  })),

  completeMaintenance: (id, nextMaintenanceDate) => set((state) => ({
    maintenanceRecords: state.maintenanceRecords.map((maint) =>
      maint.id === id
        ? {
            ...maint,
            completedDate: new Date().toISOString().split('T')[0],
            nextMaintenanceDate
          }
        : maint
    )
  })),

  getEquipmentExaminations: (equipmentId) => {
    return get().examinations.filter((exam) => exam.equipmentId === equipmentId);
  },

  getEquipmentMaintenance: (equipmentId) => {
    return get().maintenanceRecords.filter((maint) => maint.equipmentId === equipmentId);
  },

  getUpcomingMaintenance: () => {
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);

    return get().maintenanceRecords.filter((maint) => {
      if (maint.completedDate) return false;
      const scheduledDate = new Date(maint.scheduledDate);
      return scheduledDate >= now && scheduledDate <= thirtyDaysLater;
    });
  },

  getEquipmentNeedingMaintenance: () => {
    const now = new Date();
    return get().equipment.filter((eq) => {
      if (!eq.nextMaintenanceDate) return false;
      const maintenanceDate = new Date(eq.nextMaintenanceDate);
      return maintenanceDate <= now;
    });
  },
  
  error: null,
  
  setError: (error) => {
    set({ error });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));