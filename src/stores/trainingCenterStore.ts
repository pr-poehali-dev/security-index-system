// src/stores/trainingCenterStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TrainingProgram,
  TrainingGroup,
  TrainingEnrollment,
  TrainingLocation,
  TrainingInstructor,
  TrainingScheduleEntry,
  OrganizationTrainingRequest,
} from '@/types';
import type { Certification, CertificationDocument } from './attestationStore';

export interface IssuedCertificate {
  id: string;
  trainingCenterId: string;
  clientTenantId: string;
  personnelId: string;
  personnelName: string;
  organizationId?: string;
  organizationName?: string;
  organizationInn?: string;
  groupId?: string;
  programId: string;
  programName: string;
  certificateNumber: string;
  protocolNumber: string;
  protocolDate: string;
  issueDate: string;
  expiryDate: string;
  category: 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology';
  area: string;
  certificateFileUrl?: string;
  protocolFileUrl?: string;
  status: 'issued' | 'delivered' | 'synced';
  issuedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface TrainingCenterState {
  programs: TrainingProgram[];
  groups: TrainingGroup[];
  enrollments: TrainingEnrollment[];
  locations: TrainingLocation[];
  instructors: TrainingInstructor[];
  scheduleEntries: TrainingScheduleEntry[];
  requests: OrganizationTrainingRequest[];
  issuedCertificates: IssuedCertificate[];
  
  addProgram: (program: TrainingProgram) => void;
  updateProgram: (id: string, updates: Partial<TrainingProgram>) => void;
  deleteProgram: (id: string) => void;
  getProgramsByTenant: (tenantId: string) => TrainingProgram[];
  
  addGroup: (group: TrainingGroup) => void;
  updateGroup: (id: string, updates: Partial<TrainingGroup>) => void;
  deleteGroup: (id: string) => void;
  getGroupsByTenant: (tenantId: string) => TrainingGroup[];
  
  addEnrollment: (enrollment: TrainingEnrollment) => void;
  updateEnrollment: (id: string, updates: Partial<TrainingEnrollment>) => void;
  deleteEnrollment: (id: string) => void;
  getEnrollmentsByGroup: (groupId: string) => TrainingEnrollment[];
  
  addLocation: (location: TrainingLocation) => void;
  updateLocation: (id: string, updates: Partial<TrainingLocation>) => void;
  deleteLocation: (id: string) => void;
  getLocationsByTenant: (tenantId: string) => TrainingLocation[];
  
  addInstructor: (instructor: TrainingInstructor) => void;
  updateInstructor: (id: string, updates: Partial<TrainingInstructor>) => void;
  deleteInstructor: (id: string) => void;
  getInstructorsByTenant: (tenantId: string) => TrainingInstructor[];
  
  addScheduleEntry: (entry: TrainingScheduleEntry) => void;
  updateScheduleEntry: (id: string, updates: Partial<TrainingScheduleEntry>) => void;
  deleteScheduleEntry: (id: string) => void;
  getScheduleByGroup: (groupId: string) => TrainingScheduleEntry[];
  
  addRequest: (request: OrganizationTrainingRequest) => void;
  updateRequest: (id: string, updates: Partial<OrganizationTrainingRequest>) => void;
  deleteRequest: (id: string) => void;
  getRequestsByTenant: (tenantId: string) => OrganizationTrainingRequest[];
  approveRequest: (requestId: string, groupId?: string) => void;
  rejectRequest: (requestId: string, reason: string) => void;
  completeRequest: (requestId: string) => void;
  
  addIssuedCertificate: (cert: Omit<IssuedCertificate, 'id' | 'createdAt' | 'updatedAt'>) => IssuedCertificate;
  updateIssuedCertificate: (id: string, updates: Partial<IssuedCertificate>) => void;
  deleteIssuedCertificate: (id: string) => void;
  getIssuedCertificatesByTrainingCenter: (trainingCenterId: string) => IssuedCertificate[];
  getIssuedCertificatesByClient: (clientTenantId: string) => IssuedCertificate[];
  syncCertificateToAttestation: (certificateId: string) => Certification | null;
}

export const useTrainingCenterStore = create<TrainingCenterState>()(persist((set, get) => ({
  programs: [],
  groups: [],
  enrollments: [],
  locations: [],
  instructors: [],
  scheduleEntries: [],
  requests: [],
  issuedCertificates: [
    {
      id: 'issued-1',
      trainingCenterId: 'external-org-1',
      clientTenantId: 'tenant-1',
      personnelId: 'personnel-1',
      personnelName: 'Иванов Иван Иванович',
      organizationId: 'org-1',
      organizationName: 'ООО "Промышленность"',
      organizationInn: '7701234567',
      programId: 'program-1',
      programName: 'Промышленная безопасность А.1',
      certificateNumber: 'УД-2023-001234',
      protocolNumber: 'ПБ-123/2023',
      protocolDate: '2023-01-01',
      issueDate: '2023-01-01',
      expiryDate: '2028-01-01',
      category: 'industrial_safety',
      area: 'А.1 Основы промышленной безопасности',
      certificateFileUrl: '/files/certificates/cert-1-certificate.pdf',
      protocolFileUrl: '/files/protocols/cert-1-protocol.pdf',
      status: 'synced',
      issuedBy: 'Комиссия АНО ДПО "Учебный центр"',
      createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'issued-2',
      trainingCenterId: 'external-org-1',
      clientTenantId: 'tenant-1',
      personnelId: 'personnel-2',
      personnelName: 'Петров Петр Петрович',
      organizationId: 'org-2',
      organizationName: 'АО "Технострой"',
      organizationInn: '7705987654',
      programId: 'program-2',
      programName: 'Электробезопасность IV группа',
      certificateNumber: 'ЭБ-2024-09234',
      protocolNumber: 'ЭБ-234/2024',
      protocolDate: '2024-08-25',
      issueDate: '2024-08-25',
      expiryDate: '2027-08-25',
      category: 'energy_safety',
      area: 'IV группа до 1000В',
      certificateFileUrl: '/files/certificates/cert-eb-09234.pdf',
      protocolFileUrl: '/files/protocols/protocol-eb-234.pdf',
      status: 'issued',
      issuedBy: 'Комиссия АНО ДПО "Учебный центр"',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'issued-3',
      trainingCenterId: 'external-org-1',
      clientTenantId: 'tenant-1',
      personnelId: 'personnel-3',
      personnelName: 'Сидоров Сидор Сидорович',
      organizationId: 'org-1',
      organizationName: 'ООО "Промышленность"',
      organizationInn: '7701234567',
      programId: 'program-3',
      programName: 'Работы на высоте (группа 2)',
      certificateNumber: 'УПК-2024-15487',
      protocolNumber: 'ОТ-487/2024',
      protocolDate: '2024-09-10',
      issueDate: '2024-09-10',
      expiryDate: '2027-09-10',
      category: 'labor_safety',
      area: 'Работы на высоте группа 2',
      certificateFileUrl: '/files/certificates/cert-upk-15487.pdf',
      protocolFileUrl: '/files/protocols/protocol-ot-487.pdf',
      status: 'delivered',
      issuedBy: 'Комиссия АНО ДПО "Учебный центр"',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  addProgram: (program) => set((state) => ({
    programs: [...state.programs, program],
  })),

  updateProgram: (id, updates) => set((state) => ({
    programs: state.programs.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ),
  })),

  deleteProgram: (id) => set((state) => ({
    programs: state.programs.filter((p) => p.id !== id),
  })),

  getProgramsByTenant: (tenantId) => {
    return get().programs.filter((p) => p.tenantId === tenantId);
  },

  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group],
  })),

  updateGroup: (id, updates) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    ),
  })),

  deleteGroup: (id) => set((state) => ({
    groups: state.groups.filter((g) => g.id !== id),
  })),

  getGroupsByTenant: (tenantId) => {
    return get().groups.filter((g) => g.tenantId === tenantId);
  },

  addEnrollment: (enrollment) => set((state) => {
    const group = state.groups.find(g => g.id === enrollment.groupId);
    if (group) {
      const updatedGroups = state.groups.map(g =>
        g.id === enrollment.groupId
          ? { ...g, enrolledCount: g.enrolledCount + 1 }
          : g
      );
      return {
        enrollments: [...state.enrollments, enrollment],
        groups: updatedGroups,
      };
    }
    return { enrollments: [...state.enrollments, enrollment] };
  }),

  updateEnrollment: (id, updates) => set((state) => ({
    enrollments: state.enrollments.map((e) =>
      e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
    ),
  })),

  deleteEnrollment: (id) => set((state) => {
    const enrollment = state.enrollments.find(e => e.id === id);
    if (enrollment) {
      const updatedGroups = state.groups.map(g =>
        g.id === enrollment.groupId
          ? { ...g, enrolledCount: Math.max(0, g.enrolledCount - 1) }
          : g
      );
      return {
        enrollments: state.enrollments.filter((e) => e.id !== id),
        groups: updatedGroups,
      };
    }
    return { enrollments: state.enrollments.filter((e) => e.id !== id) };
  }),

  getEnrollmentsByGroup: (groupId) => {
    return get().enrollments.filter((e) => e.groupId === groupId);
  },

  addLocation: (location) => set((state) => ({
    locations: [...state.locations, location],
  })),

  updateLocation: (id, updates) => set((state) => ({
    locations: state.locations.map((l) =>
      l.id === id ? { ...l, ...updates } : l
    ),
  })),

  deleteLocation: (id) => set((state) => ({
    locations: state.locations.filter((l) => l.id !== id),
  })),

  getLocationsByTenant: (tenantId) => {
    return get().locations.filter((l) => l.tenantId === tenantId);
  },

  addInstructor: (instructor) => set((state) => ({
    instructors: [...state.instructors, instructor],
  })),

  updateInstructor: (id, updates) => set((state) => ({
    instructors: state.instructors.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    ),
  })),

  deleteInstructor: (id) => set((state) => ({
    instructors: state.instructors.filter((i) => i.id !== id),
  })),

  getInstructorsByTenant: (tenantId) => {
    return get().instructors.filter((i) => i.tenantId === tenantId);
  },

  addScheduleEntry: (entry) => set((state) => ({
    scheduleEntries: [...state.scheduleEntries, entry],
  })),

  updateScheduleEntry: (id, updates) => set((state) => ({
    scheduleEntries: state.scheduleEntries.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    ),
  })),

  deleteScheduleEntry: (id) => set((state) => ({
    scheduleEntries: state.scheduleEntries.filter((e) => e.id !== id),
  })),

  getScheduleByGroup: (groupId) => {
    return get().scheduleEntries.filter((e) => e.groupId === groupId);
  },

  addRequest: (request) => set((state) => ({
    requests: [...state.requests, request],
  })),

  updateRequest: (id, updates) => set((state) => ({
    requests: state.requests.map((r) =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    ),
  })),

  deleteRequest: (id) => set((state) => ({
    requests: state.requests.filter((r) => r.id !== id),
  })),

  getRequestsByTenant: (tenantId) => {
    return get().requests.filter((r) => r.tenantId === tenantId);
  },

  approveRequest: (requestId: string, groupId?: string) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'approved' as const, updatedAt: new Date().toISOString() } : r
      )
    }));
  },

  rejectRequest: (requestId: string, reason: string) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' as const, reviewNotes: reason, updatedAt: new Date().toISOString() } : r
      )
    }));
  },

  completeRequest: (requestId: string) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'completed' as const, updatedAt: new Date().toISOString() } : r
      )
    }));
  },

  addIssuedCertificate: (cert) => {
    const newCert: IssuedCertificate = {
      ...cert,
      id: `issued-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ issuedCertificates: [...state.issuedCertificates, newCert] }));
    return newCert;
  },

  updateIssuedCertificate: (id, updates) => set((state) => ({
    issuedCertificates: state.issuedCertificates.map((cert) =>
      cert.id === id ? { ...cert, ...updates, updatedAt: new Date().toISOString() } : cert
    )
  })),

  deleteIssuedCertificate: (id) => set((state) => ({
    issuedCertificates: state.issuedCertificates.filter((cert) => cert.id !== id)
  })),

  getIssuedCertificatesByTrainingCenter: (trainingCenterId) => {
    return get().issuedCertificates.filter((cert) => cert.trainingCenterId === trainingCenterId);
  },

  getIssuedCertificatesByClient: (clientTenantId) => {
    return get().issuedCertificates.filter((cert) => cert.clientTenantId === clientTenantId);
  },

  syncCertificateToAttestation: (certificateId) => {
    const issuedCert = get().issuedCertificates.find((c) => c.id === certificateId);
    if (!issuedCert) return null;

    const attestationCert: Certification = {
      id: `cert-synced-${Date.now()}`,
      personnelId: issuedCert.personnelId,
      tenantId: issuedCert.clientTenantId,
      category: issuedCert.category,
      area: issuedCert.area,
      issueDate: issuedCert.issueDate,
      expiryDate: issuedCert.expiryDate,
      certificateNumber: issuedCert.certificateNumber,
      protocolNumber: issuedCert.protocolNumber,
      protocolDate: issuedCert.protocolDate,
      verified: false,
      trainingOrganizationId: issuedCert.trainingCenterId,
      documents: [
        issuedCert.certificateFileUrl ? {
          id: `doc-${Date.now()}-1`,
          certificationId: `cert-synced-${Date.now()}`,
          type: 'certificate' as const,
          fileName: `Удостоверение_${issuedCert.certificateNumber}.pdf`,
          fileUrl: issuedCert.certificateFileUrl,
          fileSize: 0,
          uploadedBy: issuedCert.issuedBy,
          uploadedByRole: 'training_center' as const,
          uploadedAt: issuedCert.createdAt
        } : undefined,
        issuedCert.protocolFileUrl ? {
          id: `doc-${Date.now()}-2`,
          certificationId: `cert-synced-${Date.now()}`,
          type: 'protocol' as const,
          fileName: `Протокол_${issuedCert.protocolNumber}.pdf`,
          fileUrl: issuedCert.protocolFileUrl,
          fileSize: 0,
          uploadedBy: issuedCert.issuedBy,
          uploadedByRole: 'training_center' as const,
          uploadedAt: issuedCert.createdAt
        } : undefined
      ].filter(Boolean) as CertificationDocument[],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    get().updateIssuedCertificate(certificateId, { status: 'synced' });

    return attestationCert;
  }
}), { name: 'training-center-storage-v1' }));