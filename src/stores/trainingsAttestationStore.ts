// src/stores/trainingsAttestationStore.ts
// Описание: Zustand store для управления обучением для аттестации
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TrainingParticipant {
  employeeId: string;
  status: 'in_progress' | 'completed' | 'failed';
  progress?: number;
  testScore?: number;
  testMaxScore?: number;
  completedAt?: string;
}

export interface Training {
  id: string;
  tenantId: string;
  title: string;
  type: 'initial' | 'periodic' | 'extraordinary';
  startDate: string;
  endDate: string;
  employeeIds: string[];
  organizationId: string;
  cost: number;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled' | 'in_progress';
  program?: string;
  documentUrl?: string;
  certificateNumber?: string;
  certificateIssueDate?: string;
  sdoProgress?: number;
  sdoCompletedLessons?: number;
  sdoTotalLessons?: number;
  participants?: TrainingParticipant[];
  createdAt: string;
  updatedAt: string;
}

interface TrainingsAttestationState {
  trainings: Training[];
  
  addTraining: (training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTraining: (id: string, updates: Partial<Training>) => void;
  deleteTraining: (id: string) => void;
}

export const useTrainingsAttestationStore = create<TrainingsAttestationState>()(persist((set, get) => ({
  trainings: [
    {
      id: 'training-1',
      tenantId: 'tenant-1',
      title: 'Промышленная безопасность А.1',
      type: 'periodic',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-1', 'personnel-2'],
      organizationId: 'external-org-1',
      cost: 15000,
      status: 'planned',
      program: 'Программа обучения по промышленной безопасности (72 часа)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'training-2',
      tenantId: 'tenant-1',
      title: 'Электробезопасность III группа',
      type: 'initial',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-3'],
      organizationId: 'external-org-1',
      cost: 8000,
      status: 'planned',
      program: 'Программа подготовки электротехнического персонала',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'training-3',
      tenantId: 'tenant-1',
      title: 'Работы на высоте (группа 2)',
      type: 'periodic',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-1'],
      organizationId: 'external-org-2',
      cost: 12000,
      status: 'completed',
      certificateNumber: 'УПК-2024-15487',
      certificateIssueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'training-4',
      tenantId: 'tenant-1',
      title: 'Промышленная безопасность А.1 (СДО)',
      type: 'periodic',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-2', 'personnel-3'],
      organizationId: 'external-org-1',
      cost: 8000,
      status: 'in_progress',
      sdoProgress: 65,
      sdoCompletedLessons: 13,
      sdoTotalLessons: 20,
      participants: [
        {
          employeeId: 'personnel-2',
          status: 'in_progress',
          progress: 75,
          testScore: undefined,
          testMaxScore: 20
        },
        {
          employeeId: 'personnel-3',
          status: 'in_progress',
          progress: 55,
          testScore: undefined,
          testMaxScore: 20
        }
      ],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'training-5',
      tenantId: 'tenant-1',
      title: 'Электробезопасность 4 группа до 1000В',
      type: 'initial',
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-1', 'personnel-2'],
      organizationId: 'external-org-1',
      cost: 24000,
      status: 'completed',
      certificateNumber: 'ЭБ-2024-09234',
      certificateIssueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      participants: [
        {
          employeeId: 'personnel-1',
          status: 'completed',
          progress: 100,
          testScore: 18,
          testMaxScore: 20,
          completedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          employeeId: 'personnel-2',
          status: 'completed',
          progress: 100,
          testScore: 17,
          testMaxScore: 20,
          completedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'training-6',
      tenantId: 'tenant-1',
      title: 'Аттестация Б.1.1 - Эксплуатация сетей газораспределения',
      type: 'periodic',
      startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-6', 'personnel-8'],
      organizationId: 'training-center-1',
      cost: 45000,
      status: 'planned',
      program: 'Подготовка и аттестация в области промышленной безопасности - Б.1.1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'training-7',
      tenantId: 'tenant-1',
      title: 'Аттестация Б.1.4 - Ремонт газового оборудования',
      type: 'periodic',
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-7', 'personnel-9'],
      organizationId: 'training-center-1',
      cost: 40000,
      status: 'planned',
      program: 'Подготовка и аттестация в области промышленной безопасности - Б.1.4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'training-8',
      tenantId: 'tenant-1',
      title: 'Аттестация Б.1.3 - Диагностика газового оборудования',
      type: 'initial',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-10'],
      organizationId: 'training-center-1',
      cost: 25000,
      status: 'completed',
      certificateNumber: 'РТН-2024-00345',
      certificateIssueDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      participants: [
        {
          employeeId: 'personnel-10',
          status: 'completed',
          progress: 100,
          testScore: 19,
          testMaxScore: 20,
          completedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'training-9',
      tenantId: 'tenant-1',
      title: 'Охрана труда и промышленная безопасность',
      type: 'periodic',
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-6', 'personnel-7', 'personnel-8', 'personnel-9'],
      organizationId: 'external-org-2',
      cost: 48000,
      status: 'completed',
      certificateNumber: 'ОТ-2024-12345',
      certificateIssueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      participants: [
        {
          employeeId: 'personnel-6',
          status: 'completed',
          progress: 100,
          testScore: 18,
          testMaxScore: 20,
          completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          employeeId: 'personnel-7',
          status: 'completed',
          progress: 100,
          testScore: 16,
          testMaxScore: 20,
          completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          employeeId: 'personnel-8',
          status: 'completed',
          progress: 100,
          testScore: 17,
          testMaxScore: 20,
          completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          employeeId: 'personnel-9',
          status: 'completed',
          progress: 100,
          testScore: 15,
          testMaxScore: 20,
          completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  addTraining: (training) => {
    const newTraining: Training = {
      ...training,
      id: `training-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ trainings: [...state.trainings, newTraining] }));
  },

  updateTraining: (id, updates) => {
    set((state) => ({
      trainings: state.trainings.map((training) =>
        training.id === id ? { ...training, ...updates, updatedAt: new Date().toISOString() } : training
      )
    }));
  },

  deleteTraining: (id) => {
    set((state) => ({
      trainings: state.trainings.filter((training) => training.id !== id)
    }));
  }
}), {
  name: 'trainings-attestation-storage'
}));