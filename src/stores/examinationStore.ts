// src/stores/examinationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Examination {
  id: string;
  tenantId: string;
  objectId: string;
  objectName: string;
  type: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  executor: string;
  executorContact?: string;
  conclusionFileUrl?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ExaminationState {
  examinations: Examination[];
  
  addExamination: (examination: Omit<Examination, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExamination: (id: string, updates: Partial<Examination>) => void;
  deleteExamination: (id: string) => void;
  getExaminationsByStatus: (status: Examination['status']) => Examination[];
  getExaminationsByType: (type: string) => Examination[];
  getExaminationsByObject: (objectId: string) => Examination[];
  getStatistics: () => {
    scheduled: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

export const useExaminationStore = create<ExaminationState>()(persist((set, get) => ({
  examinations: [
    {
      id: 'exam-1',
      tenantId: 'tenant-1',
      objectId: 'eq-1',
      objectName: 'Компрессор К-301',
      type: 'Техническая диагностика',
      scheduledDate: '2025-11-15',
      status: 'scheduled',
      executor: 'ООО "Экспертиза Промбезопасность"',
      executorContact: '+7 495 123-45-67',
      notes: 'Периодическая диагностика согласно графику',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'exam-2',
      tenantId: 'tenant-1',
      objectId: 'eq-3',
      objectName: 'Котел паровой КП-500',
      type: 'Экспертиза промышленной безопасности',
      scheduledDate: '2025-10-20',
      completedDate: '2025-10-18',
      status: 'completed',
      executor: 'АНО "Центр экспертиз"',
      executorContact: '+7 495 987-65-43',
      conclusionFileUrl: '/files/conclusion-kp500.pdf',
      notes: 'Выявлены замечания, требуется устранение в течение 30 дней',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'exam-3',
      tenantId: 'tenant-1',
      objectId: 'eq-2',
      objectName: 'Насос центробежный Н-12',
      type: 'Неразрушающий контроль',
      scheduledDate: '2025-10-05',
      status: 'overdue',
      executor: 'ООО "ПромКонтроль"',
      executorContact: '+7 495 555-12-34',
      notes: 'Просрочено! Требуется немедленное проведение',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'exam-4',
      tenantId: 'tenant-1',
      objectId: 'eq-4',
      objectName: 'Кран мостовой КМ-10',
      type: 'Техническое освидетельствование',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'in_progress',
      executor: 'Ростехнадзор',
      executorContact: '+7 495 777-88-99',
      notes: 'В процессе проведения',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  addExamination: (examination) => {
    const newExamination: Examination = {
      ...examination,
      id: `exam-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ examinations: [...state.examinations, newExamination] }));
  },
  
  updateExamination: (id, updates) => {
    set((state) => ({
      examinations: state.examinations.map((exam) =>
        exam.id === id ? { ...exam, ...updates, updatedAt: new Date().toISOString() } : exam
      )
    }));
  },
  
  deleteExamination: (id) => {
    set((state) => ({ examinations: state.examinations.filter((exam) => exam.id !== id) }));
  },
  
  getExaminationsByStatus: (status) => {
    return get().examinations.filter((exam) => exam.status === status);
  },
  
  getExaminationsByType: (type) => {
    return get().examinations.filter((exam) => exam.type === type);
  },
  
  getExaminationsByObject: (objectId) => {
    return get().examinations.filter((exam) => exam.objectId === objectId);
  },
  
  getStatistics: () => {
    const examinations = get().examinations;
    return {
      scheduled: examinations.filter((e) => e.status === 'scheduled').length,
      inProgress: examinations.filter((e) => e.status === 'in_progress').length,
      completed: examinations.filter((e) => e.status === 'completed').length,
      overdue: examinations.filter((e) => e.status === 'overdue').length
    };
  }
  
}), { name: 'examination-storage-v1' }));