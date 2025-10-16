// src/stores/checklistsStore.ts
// Описание: Zustand store для управления чек-листами и аудитами
import { create } from 'zustand';
import type { Checklist, Audit } from '@/types';

interface ChecklistsState {
  checklists: Checklist[];
  audits: Audit[];
  selectedChecklist: Checklist | null;
  selectedAudit: Audit | null;
  error: string | null;
  addChecklist: (checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChecklist: (id: string, updates: Partial<Checklist>) => void;
  deleteChecklist: (id: string) => void;
  selectChecklist: (checklist: Checklist | null) => void;
  scheduleAudit: (audit: Omit<Audit, 'id' | 'findings'>) => void;
  startAudit: (id: string) => void;
  completeAudit: (id: string) => void;
  updateAuditFindings: (auditId: string, findings: Audit['findings']) => void;
  selectAudit: (audit: Audit | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const MOCK_CHECKLISTS: Checklist[] = [
  {
    id: '1',
    tenantId: 'tenant-1',
    name: 'Проверка пожарной безопасности',
    category: 'fire_safety',
    items: [
      {
        id: 'item-1',
        question: 'Все ли огнетушители на месте и исправны?',
        requiresComment: false,
        criticalItem: true
      },
      {
        id: 'item-2',
        question: 'Свободны ли эвакуационные пути?',
        requiresComment: false,
        criticalItem: true
      },
      {
        id: 'item-3',
        question: 'Работает ли пожарная сигнализация?',
        requiresComment: true,
        criticalItem: true
      },
      {
        id: 'item-4',
        question: 'Есть ли актуальные планы эвакуации?',
        requiresComment: false,
        criticalItem: false
      }
    ],
    createdAt: '2024-01-15T10:00:00',
    updatedAt: '2024-01-15T10:00:00'
  },
  {
    id: '2',
    tenantId: 'tenant-1',
    name: 'Проверка состояния оборудования',
    category: 'equipment',
    items: [
      {
        id: 'item-5',
        question: 'Имеются ли видимые повреждения оборудования?',
        requiresComment: true,
        criticalItem: true
      },
      {
        id: 'item-6',
        question: 'Проведено ли плановое ТО в срок?',
        requiresComment: true,
        criticalItem: false
      },
      {
        id: 'item-7',
        question: 'Все ли защитные устройства функционируют?',
        requiresComment: false,
        criticalItem: true
      }
    ],
    createdAt: '2024-02-01T10:00:00',
    updatedAt: '2024-02-01T10:00:00'
  },
  {
    id: '3',
    tenantId: 'tenant-1',
    name: 'Проверка средств индивидуальной защиты',
    category: 'ppe',
    items: [
      {
        id: 'item-8',
        question: 'Все ли работники обеспечены СИЗ?',
        requiresComment: true,
        criticalItem: true
      },
      {
        id: 'item-9',
        question: 'СИЗ в исправном состоянии?',
        requiresComment: true,
        criticalItem: true
      },
      {
        id: 'item-10',
        question: 'Работники используют СИЗ правильно?',
        requiresComment: false,
        criticalItem: false
      }
    ],
    createdAt: '2024-03-10T10:00:00',
    updatedAt: '2024-03-10T10:00:00'
  }
];

const MOCK_AUDITS: Audit[] = [
  {
    id: 'audit-1',
    tenantId: 'tenant-1',
    checklistId: '1',
    organizationId: 'org-1',
    auditorId: 'user-3',
    scheduledDate: '2024-10-15',
    status: 'scheduled',
    findings: []
  },
  {
    id: 'audit-2',
    tenantId: 'tenant-1',
    checklistId: '2',
    organizationId: 'org-1',
    auditorId: 'user-3',
    scheduledDate: '2024-10-08',
    status: 'in_progress',
    findings: [
      {
        id: 'finding-1',
        itemId: 'item-5',
        result: 'pass',
        comment: 'Оборудование в хорошем состоянии'
      }
    ]
  },
  {
    id: 'audit-3',
    tenantId: 'tenant-1',
    checklistId: '1',
    organizationId: 'org-1',
    auditorId: 'user-3',
    scheduledDate: '2024-09-20',
    completedDate: '2024-09-20',
    status: 'completed',
    findings: [
      {
        id: 'finding-2',
        itemId: 'item-1',
        result: 'fail',
        comment: 'Не хватает 2 огнетушителей в цехе №3'
      },
      {
        id: 'finding-3',
        itemId: 'item-2',
        result: 'pass'
      },
      {
        id: 'finding-4',
        itemId: 'item-3',
        result: 'pass',
        comment: 'Проверена работа системы, все датчики функционируют'
      }
    ]
  }
];

export const useChecklistsStore = create<ChecklistsState>((set) => ({
  checklists: MOCK_CHECKLISTS,
  audits: MOCK_AUDITS,
  selectedChecklist: null,
  selectedAudit: null,

  addChecklist: (checklistData) => set((state) => ({
    checklists: [
      ...state.checklists,
      {
        ...checklistData,
        id: `checklist-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  })),

  updateChecklist: (id, updates) => set((state) => ({
    checklists: state.checklists.map((checklist) =>
      checklist.id === id
        ? { ...checklist, ...updates, updatedAt: new Date().toISOString() }
        : checklist
    )
  })),

  deleteChecklist: (id) => set((state) => ({
    checklists: state.checklists.filter((checklist) => checklist.id !== id)
  })),

  selectChecklist: (checklist) => set({ selectedChecklist: checklist }),

  scheduleAudit: (auditData) => set((state) => ({
    audits: [
      ...state.audits,
      {
        ...auditData,
        id: `audit-${Date.now()}`,
        findings: []
      }
    ]
  })),

  startAudit: (id) => set((state) => ({
    audits: state.audits.map((audit) =>
      audit.id === id ? { ...audit, status: 'in_progress' } : audit
    )
  })),

  completeAudit: (id) => set((state) => ({
    audits: state.audits.map((audit) =>
      audit.id === id
        ? {
            ...audit,
            status: 'completed',
            completedDate: new Date().toISOString().split('T')[0]
          }
        : audit
    )
  })),

  updateAuditFindings: (auditId, findings) => set((state) => ({
    audits: state.audits.map((audit) =>
      audit.id === auditId ? { ...audit, findings } : audit
    )
  })),

  selectAudit: (audit) => set({ selectedAudit: audit }),
  
  error: null,
  
  setError: (error) => {
    set({ error });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));