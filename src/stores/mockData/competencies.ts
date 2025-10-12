// src/stores/mockData/competencies.ts
import type { Competency, Certification } from '@/types';

export const mockCompetencies: Competency[] = [
  {
    id: 'comp-1',
    tenantId: 'tenant-1',
    code: 'А.1',
    name: 'Эксплуатация опасных производственных объектов горнорудной промышленности',
    category: 'industrial_safety',
    validityMonths: 36,
    requiresRostechnadzor: true,
    description: 'Аттестация в области промышленной безопасности для работников ОПО',
    status: 'active',
    createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comp-2',
    tenantId: 'tenant-1',
    code: 'Б.7',
    name: 'Эксплуатация электроустановок потребителей',
    category: 'energy_safety',
    validityMonths: 60,
    requiresRostechnadzor: true,
    description: 'Аттестация по электробезопасности',
    status: 'active',
    createdAt: new Date(Date.now() - 450 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comp-3',
    tenantId: 'tenant-1',
    code: 'ОТ-101',
    name: 'Охрана труда в организации',
    category: 'labor_safety',
    validityMonths: 36,
    requiresRostechnadzor: false,
    description: 'Обучение по охране труда для руководителей и специалистов',
    status: 'active',
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comp-4',
    tenantId: 'tenant-1',
    code: 'ЭК-50',
    name: 'Экологическая безопасность',
    category: 'ecology',
    validityMonths: 60,
    requiresRostechnadzor: false,
    description: 'Обучение по экологической безопасности и обращению с отходами',
    status: 'active',
    createdAt: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockCertifications: Certification[] = [
  {
    id: 'cert-1',
    tenantId: 'tenant-1',
    personId: 'person-1',
    competencyId: 'comp-1',
    issueDate: '2023-01-15',
    expiryDate: '2026-01-15',
    protocolNumber: '№ 123/2023',
    issuedBy: 'Ростехнадзор',
    status: 'valid',
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'cert-2',
    tenantId: 'tenant-1',
    personId: 'person-1',
    competencyId: 'comp-3',
    issueDate: '2024-03-10',
    expiryDate: '2027-03-10',
    protocolNumber: '№ 456/2024',
    issuedBy: 'УЦ "Профессионал"',
    status: 'valid',
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'cert-3',
    tenantId: 'tenant-1',
    personId: 'person-2',
    competencyId: 'comp-3',
    issueDate: '2023-05-20',
    expiryDate: '2026-05-20',
    protocolNumber: '№ 789/2023',
    issuedBy: 'Центр охраны труда',
    status: 'valid',
    createdAt: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'cert-4',
    tenantId: 'tenant-1',
    personId: 'person-3',
    competencyId: 'comp-1',
    issueDate: '2022-08-15',
    expiryDate: '2025-08-15',
    protocolNumber: '№ 234/2022',
    issuedBy: 'Ростехнадзор',
    status: 'expiring',
    createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'cert-5',
    tenantId: 'tenant-1',
    personId: 'person-3',
    competencyId: 'comp-2',
    issueDate: '2021-10-01',
    expiryDate: '2026-10-01',
    protocolNumber: '№ 567/2021',
    issuedBy: 'Ростехнадзор',
    status: 'valid',
    createdAt: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString()
  }
];