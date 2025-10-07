import type { CompetencyMatrix } from '@/types';

export const mockCompetencyMatrix: CompetencyMatrix[] = [
  {
    id: 'matrix-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    position: 'Инженер по охране труда',
    requiredAreas: [
      {
        category: 'labor_safety',
        areas: ['ОТ-101', 'ОТ-102']
      },
      {
        category: 'industrial_safety',
        areas: ['А.1']
      }
    ],
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'matrix-2',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    position: 'Электромонтер',
    requiredAreas: [
      {
        category: 'energy_safety',
        areas: ['Б.7', 'Б.8']
      },
      {
        category: 'labor_safety',
        areas: ['ОТ-101']
      }
    ],
    createdAt: new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'matrix-3',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    position: 'Мастер участка',
    requiredAreas: [
      {
        category: 'industrial_safety',
        areas: ['А.1']
      },
      {
        category: 'labor_safety',
        areas: ['ОТ-101']
      }
    ],
    createdAt: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString()
  }
];
