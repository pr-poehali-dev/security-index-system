// src/stores/mockData/competencyMatrix.ts
import type { CompetencyMatrix } from '@/types';

export const mockCompetencyMatrix: CompetencyMatrix[] = [
  {
    id: 'matrix-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    positionId: 'pos-1',
    requiredAreas: [
      {
        category: 'industrial_safety',
        areas: ['А.1 Основы промышленной безопасности']
      },
      {
        category: 'labor_safety',
        areas: ['Охрана труда для руководителей и специалистов']
      }
    ],
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'matrix-2',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    positionId: 'pos-2',
    requiredAreas: [
      {
        category: 'industrial_safety',
        areas: ['А.1 Основы промышленной безопасности', 'Б.3 Эксплуатация объектов электроэнергетики']
      },
      {
        category: 'labor_safety',
        areas: ['Охрана труда для руководителей и специалистов']
      }
    ],
    createdAt: new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'matrix-3',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    positionId: 'pos-3',
    requiredAreas: [
      {
        category: 'energy_safety',
        areas: ['III группа до 1000В', 'V группа до 1000В']
      },
      {
        category: 'industrial_safety',
        areas: ['Б.3 Эксплуатация объектов электроэнергетики']
      }
    ],
    createdAt: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'matrix-4',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    positionId: 'pos-4',
    requiredAreas: [
      {
        category: 'industrial_safety',
        areas: ['А.1 Основы промышленной безопасности']
      },
      {
        category: 'labor_safety',
        areas: ['Охрана труда для руководителей и специалистов']
      }
    ],
    createdAt: new Date(Date.now() - 340 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'matrix-7',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    positionId: 'pos-7',
    requiredAreas: [
      {
        category: 'industrial_safety',
        areas: ['Б.1.1. Эксплуатация сетей газораспределения', 'А.1 Основы промышленной безопасности']
      }
    ],
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'matrix-8',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    positionId: 'pos-8',
    requiredAreas: [
      {
        category: 'industrial_safety',
        areas: ['Б.1.4. Ремонт газового оборудования', 'Б.1.1. Эксплуатация сетей газораспределения']
      }
    ],
    createdAt: new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'matrix-9',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    positionId: 'pos-9',
    requiredAreas: [
      {
        category: 'industrial_safety',
        areas: ['Б.1.1. Эксплуатация сетей газораспределения']
      }
    ],
    createdAt: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'matrix-10',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    positionId: 'pos-10',
    requiredAreas: [
      {
        category: 'industrial_safety',
        areas: ['Б.1.3. Диагностика газового оборудования', 'Б.1.1. Эксплуатация сетей газораспределения']
      }
    ],
    createdAt: new Date(Date.now() - 340 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];