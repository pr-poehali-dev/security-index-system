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
  examinations: [],
  
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
