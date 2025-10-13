// src/stores/certificationStore.ts
// Описание: Zustand store для управления сертификатами аттестации
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CertificationDocument {
  id: string;
  certificationId: string;
  type: 'certificate' | 'protocol' | 'scan' | 'other';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByRole: 'training_center' | 'employee' | 'admin';
  uploadedAt: string;
  description?: string;
}

export interface Certification {
  id: string;
  personnelId: string;
  tenantId: string;
  category: 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology';
  area: string;
  issueDate: string;
  expiryDate: string;
  protocolNumber?: string;
  protocolDate?: string;
  certificateNumber?: string;
  verified: boolean;
  verifiedDate?: string;
  verifiedBy?: string;
  trainingOrganizationId?: string;
  trainingId?: string;
  documentUrl?: string;
  documents?: CertificationDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificationType {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  validityPeriod: number;
  category: 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology' | 'other';
  requiresRenewal: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CertificationState {
  certifications: Certification[];
  certificationTypes: CertificationType[];
  
  addCertification: (cert: Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;
  getCertificationsByPersonnel: (personnelId: string) => Certification[];
  getCertificationsByTenant: (tenantId: string) => Certification[];
  getCertificationsByTrainingCenter: (trainingOrgId: string) => Certification[];
  importCertifications: (certs: Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  
  addDocument: (certificationId: string, doc: Omit<CertificationDocument, 'id' | 'uploadedAt'>) => void;
  deleteDocument: (certificationId: string, documentId: string) => void;
  getDocumentsByCertification: (certificationId: string) => CertificationDocument[];
  
  addCertificationType: (type: Omit<CertificationType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCertificationType: (id: string, updates: Partial<CertificationType>) => void;
  deleteCertificationType: (id: string) => void;
  getCertificationTypesByTenant: (tenantId: string) => CertificationType[];
}

export const useCertificationStore = create<CertificationState>()(persist((set, get) => ({
  certifications: [
    {
      id: 'cert-1',
      personnelId: 'personnel-1',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'А.1 Основы промышленной безопасности',
      issueDate: '2023-01-01',
      expiryDate: '2028-01-01',
      certificateNumber: 'УД-2023-001234',
      protocolNumber: 'ПБ-123/2023',
      protocolDate: '2023-01-01',
      verified: true,
      verifiedDate: '2024-03-15',
      trainingOrganizationId: 'external-org-1',
      trainingId: 'training-1',
      documents: [
        {
          id: 'doc-1',
          certificationId: 'cert-1',
          type: 'certificate',
          fileName: 'Удостоверение_ПБ_А1_2023.pdf',
          fileUrl: '/files/certificates/cert-1-certificate.pdf',
          fileSize: 245678,
          uploadedBy: 'АНО ДПО "Учебный центр"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Удостоверение о проверке знаний'
        },
        {
          id: 'doc-2',
          certificationId: 'cert-1',
          type: 'protocol',
          fileName: 'Протокол_ПБ-123-2023.pdf',
          fileUrl: '/files/protocols/cert-1-protocol.pdf',
          fileSize: 189023,
          uploadedBy: 'АНО ДПО "Учебный центр"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Протокол заседания комиссии'
        }
      ],
      createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-1-2',
      personnelId: 'personnel-1',
      tenantId: 'tenant-1',
      category: 'labor_safety',
      area: 'Охрана труда для руководителей и специалистов',
      issueDate: '2023-06-10',
      expiryDate: '2026-06-10',
      certificateNumber: 'ОТ-2023-00567',
      protocolNumber: 'ОТ-234/2023',
      protocolDate: '2023-06-10',
      verified: true,
      verifiedDate: '2023-06-15',
      createdAt: new Date(Date.now() - 450 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-2',
      personnelId: 'personnel-2',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'А.1 Основы промышленной безопасности',
      issueDate: '2020-03-10',
      expiryDate: '2025-03-10',
      protocolNumber: 'ПБ-234/2020',
      protocolDate: '2020-03-10',
      verified: true,
      verifiedDate: '2020-03-15',
      createdAt: new Date(Date.now() - 1800 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1800 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-3',
      personnelId: 'personnel-3',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'А.1 Основы промышленной безопасности',
      issueDate: '2022-05-20',
      expiryDate: '2027-05-20',
      verified: true,
      createdAt: new Date(Date.now() - 900 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 900 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-3-2',
      personnelId: 'personnel-3',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'Б.3 Эксплуатация объектов электроэнергетики',
      issueDate: '2023-08-15',
      expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verified: true,
      createdAt: new Date(Date.now() - 420 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 420 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-7',
      personnelId: 'personnel-6',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'Б.1.1. Эксплуатация сетей газораспределения',
      issueDate: '2020-05-15',
      expiryDate: '2025-05-15',
      certificateNumber: 'РТН-2020-12345',
      protocolNumber: 'ПБ-789/2020',
      protocolDate: '2020-05-15',
      verified: true,
      verifiedDate: '2020-05-20',
      trainingOrganizationId: 'training-center-1',
      documents: [],
      createdAt: new Date(Date.now() - 1700 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1700 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-8',
      personnelId: 'personnel-7',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'Б.1.4. Ремонт газового оборудования',
      issueDate: '2021-08-10',
      expiryDate: '2026-08-10',
      certificateNumber: 'РТН-2021-23456',
      protocolNumber: 'ПБ-890/2021',
      protocolDate: '2021-08-10',
      verified: true,
      verifiedDate: '2021-08-15',
      trainingOrganizationId: 'training-center-1',
      documents: [],
      createdAt: new Date(Date.now() - 1300 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1300 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-9',
      personnelId: 'personnel-8',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'Б.1.1. Эксплуатация сетей газораспределения',
      issueDate: '2022-03-20',
      expiryDate: '2027-03-20',
      certificateNumber: 'РТН-2022-34567',
      protocolNumber: 'ПБ-901/2022',
      protocolDate: '2022-03-20',
      verified: true,
      verifiedDate: '2022-03-25',
      trainingOrganizationId: 'training-center-1',
      documents: [],
      createdAt: new Date(Date.now() - 1100 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1100 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-10',
      personnelId: 'personnel-9',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'Б.1.4. Ремонт газового оборудования',
      issueDate: '2022-06-15',
      expiryDate: '2027-06-15',
      certificateNumber: 'РТН-2022-45678',
      protocolNumber: 'ПБ-912/2022',
      protocolDate: '2022-06-15',
      verified: true,
      verifiedDate: '2022-06-20',
      trainingOrganizationId: 'training-center-1',
      documents: [],
      createdAt: new Date(Date.now() - 1000 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-11',
      personnelId: 'personnel-10',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'Б.1.3. Диагностика газового оборудования',
      issueDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 1765 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      certificateNumber: 'РТН-2024-00345',
      protocolNumber: 'ПБ-1023/2024',
      protocolDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verified: true,
      verifiedDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trainingOrganizationId: 'training-center-1',
      trainingId: 'training-8',
      documents: [
        {
          id: 'doc-3',
          certificationId: 'cert-11',
          type: 'certificate',
          fileName: 'Удостоверение_Б1.3_Павлов_2024.pdf',
          fileUrl: '/files/certificates/cert-11-certificate.pdf',
          fileSize: 298456,
          uploadedBy: 'УЦ ГазПромАттестация',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Удостоверение о проверке знаний'
        }
      ],
      createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-synced-b11-1',
      personnelId: 'personnel-3',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'Б.1.1 Эксплуатация опасных производственных объектов',
      issueDate: '2024-10-01',
      expiryDate: '2029-10-01',
      certificateNumber: 'УД-2024-12345',
      protocolNumber: 'ПБ-456/2024',
      protocolDate: '2024-10-01',
      verified: false,
      trainingOrganizationId: 'external-org-1',
      documents: [
        {
          id: 'doc-b11-1-cert',
          certificationId: 'cert-synced-b11-1',
          type: 'certificate',
          fileName: 'Удостоверение_УД-2024-12345.pdf',
          fileUrl: '/files/certificates/cert-b11-12345.pdf',
          fileSize: 245000,
          uploadedBy: 'АНО ДПО "УЦ Профессионал"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Удостоверение о проверке знаний (синхронизировано из УЦ)'
        },
        {
          id: 'doc-b11-1-protocol',
          certificationId: 'cert-synced-b11-1',
          type: 'protocol',
          fileName: 'Протокол_ПБ-456-2024.pdf',
          fileUrl: '/files/protocols/protocol-b11-456.pdf',
          fileSize: 189000,
          uploadedBy: 'АНО ДПО "УЦ Профессионал"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Протокол заседания комиссии (синхронизировано из УЦ)'
        }
      ],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-synced-b11-2',
      personnelId: 'personnel-5',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'Б.1.1 Эксплуатация опасных производственных объектов',
      issueDate: '2024-10-01',
      expiryDate: '2029-10-01',
      certificateNumber: 'УД-2024-12346',
      protocolNumber: 'ПБ-456/2024',
      protocolDate: '2024-10-01',
      verified: false,
      trainingOrganizationId: 'external-org-1',
      documents: [
        {
          id: 'doc-b11-2-cert',
          certificationId: 'cert-synced-b11-2',
          type: 'certificate',
          fileName: 'Удостоверение_УД-2024-12346.pdf',
          fileUrl: '/files/certificates/cert-b11-12346.pdf',
          fileSize: 245000,
          uploadedBy: 'АНО ДПО "УЦ Профессионал"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Удостоверение о проверке знаний (синхронизировано из УЦ)'
        },
        {
          id: 'doc-b11-2-protocol',
          certificationId: 'cert-synced-b11-2',
          type: 'protocol',
          fileName: 'Протокол_ПБ-456-2024.pdf',
          fileUrl: '/files/protocols/protocol-b11-456.pdf',
          fileSize: 189000,
          uploadedBy: 'АНО ДПО "УЦ Профессионал"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Протокол заседания комиссии (синхронизировано из УЦ)'
        }
      ],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-synced-b11-3',
      personnelId: 'personnel-7',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'Б.1.1 Эксплуатация опасных производственных объектов',
      issueDate: '2024-10-01',
      expiryDate: '2029-10-01',
      certificateNumber: 'УД-2024-12347',
      protocolNumber: 'ПБ-456/2024',
      protocolDate: '2024-10-01',
      verified: false,
      trainingOrganizationId: 'external-org-1',
      documents: [
        {
          id: 'doc-b11-3-cert',
          certificationId: 'cert-synced-b11-3',
          type: 'certificate',
          fileName: 'Удостоверение_УД-2024-12347.pdf',
          fileUrl: '/files/certificates/cert-b11-12347.pdf',
          fileSize: 245000,
          uploadedBy: 'АНО ДПО "УЦ Профессионал"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Удостоверение о проверке знаний (синхронизировано из УЦ)'
        },
        {
          id: 'doc-b11-3-protocol',
          certificationId: 'cert-synced-b11-3',
          type: 'protocol',
          fileName: 'Протокол_ПБ-456-2024.pdf',
          fileUrl: '/files/protocols/protocol-b11-456.pdf',
          fileSize: 189000,
          uploadedBy: 'АНО ДПО "УЦ Профессионал"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Протокол заседания комиссии (синхронизировано из УЦ)'
        }
      ],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-synced-ot-1',
      personnelId: 'personnel-4',
      tenantId: 'tenant-1',
      category: 'labor_safety',
      area: 'Охрана труда для руководителей и специалистов',
      issueDate: '2024-10-05',
      expiryDate: '2027-10-05',
      certificateNumber: 'ОТ-2024-45678',
      protocolNumber: 'ОТ-789/2024',
      protocolDate: '2024-10-05',
      verified: false,
      trainingOrganizationId: 'external-org-1',
      documents: [
        {
          id: 'doc-ot-1-cert',
          certificationId: 'cert-synced-ot-1',
          type: 'certificate',
          fileName: 'Удостоверение_ОТ-2024-45678.pdf',
          fileUrl: '/files/certificates/cert-ot-45678.pdf',
          fileSize: 230000,
          uploadedBy: 'АНО ДПО "УЦ Профессионал"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Удостоверение о проверке знаний (синхронизировано из УЦ)'
        },
        {
          id: 'doc-ot-1-protocol',
          certificationId: 'cert-synced-ot-1',
          type: 'protocol',
          fileName: 'Протокол_ОТ-789-2024.pdf',
          fileUrl: '/files/protocols/protocol-ot-789.pdf',
          fileSize: 175000,
          uploadedBy: 'АНО ДПО "УЦ Профессионал"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Протокол заседания комиссии (синхронизировано из УЦ)'
        }
      ],
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-synced-ot-2',
      personnelId: 'personnel-6',
      tenantId: 'tenant-1',
      category: 'labor_safety',
      area: 'Охрана труда для руководителей и специалистов',
      issueDate: '2024-10-05',
      expiryDate: '2027-10-05',
      certificateNumber: 'ОТ-2024-45679',
      protocolNumber: 'ОТ-789/2024',
      protocolDate: '2024-10-05',
      verified: false,
      trainingOrganizationId: 'external-org-1',
      documents: [
        {
          id: 'doc-ot-2-cert',
          certificationId: 'cert-synced-ot-2',
          type: 'certificate',
          fileName: 'Удостоверение_ОТ-2024-45679.pdf',
          fileUrl: '/files/certificates/cert-ot-45679.pdf',
          fileSize: 230000,
          uploadedBy: 'АНО ДПО "УЦ Профессионал"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Удостоверение о проверке знаний (синхронизировано из УЦ)'
        },
        {
          id: 'doc-ot-2-protocol',
          certificationId: 'cert-synced-ot-2',
          type: 'protocol',
          fileName: 'Протокол_ОТ-789-2024.pdf',
          fileUrl: '/files/protocols/protocol-ot-789.pdf',
          fileSize: 175000,
          uploadedBy: 'АНО ДПО "УЦ Профессионал"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Протокол заседания комиссии (синхронизировано из УЦ)'
        }
      ],
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ],

  addCertification: (cert) => {
    const newCert: Certification = {
      ...cert,
      id: `cert-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ certifications: [...state.certifications, newCert] }));
  },

  updateCertification: (id, updates) => {
    set((state) => ({
      certifications: state.certifications.map((cert) =>
        cert.id === id ? { ...cert, ...updates, updatedAt: new Date().toISOString() } : cert
      )
    }));
  },

  deleteCertification: (id) => {
    set((state) => ({
      certifications: state.certifications.filter((cert) => cert.id !== id)
    }));
  },

  getCertificationsByPersonnel: (personnelId) => {
    return get().certifications.filter((cert) => cert.personnelId === personnelId);
  },

  getCertificationsByTenant: (tenantId) => {
    return get().certifications.filter((cert) => cert.tenantId === tenantId);
  },

  getCertificationsByTrainingCenter: (trainingOrgId) => {
    return get().certifications.filter((cert) => cert.trainingOrganizationId === trainingOrgId);
  },

  importCertifications: (certs) => {
    const newCerts = certs.map((cert, index) => ({
      ...cert,
      id: `cert-import-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    set((state) => ({ certifications: [...state.certifications, ...newCerts] }));
  },

  addDocument: (certificationId, doc) => {
    const newDoc: CertificationDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    set((state) => ({
      certifications: state.certifications.map((cert) =>
        cert.id === certificationId
          ? { ...cert, documents: [...(cert.documents || []), newDoc], updatedAt: new Date().toISOString() }
          : cert
      )
    }));
  },

  deleteDocument: (certificationId, documentId) => {
    set((state) => ({
      certifications: state.certifications.map((cert) =>
        cert.id === certificationId
          ? { ...cert, documents: (cert.documents || []).filter((d) => d.id !== documentId), updatedAt: new Date().toISOString() }
          : cert
      )
    }));
  },

  getDocumentsByCertification: (certificationId) => {
    const cert = get().certifications.find((c) => c.id === certificationId);
    return cert?.documents || [];
  },

  certificationTypes: [
    {
      id: 'certtype-1',
      tenantId: 'tenant-1',
      name: 'Электробезопасность (группа III)',
      description: 'Допуск к работе с электроустановками до 1000В',
      validityPeriod: 12,
      category: 'energy_safety',
      requiresRenewal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'certtype-2',
      tenantId: 'tenant-1',
      name: 'Работы на высоте (группа 2)',
      description: 'Допуск к работам на высоте с использованием систем безопасности',
      validityPeriod: 36,
      category: 'labor_safety',
      requiresRenewal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'certtype-3',
      tenantId: 'tenant-1',
      name: 'Промышленная безопасность А.1',
      description: 'Основы промышленной безопасности',
      validityPeriod: 60,
      category: 'industrial_safety',
      requiresRenewal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'certtype-4',
      tenantId: 'tenant-1',
      name: 'Промышленная безопасность Б.3',
      description: 'Эксплуатация объектов электроэнергетики',
      validityPeriod: 60,
      category: 'industrial_safety',
      requiresRenewal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  addCertificationType: (type) => {
    const newType: CertificationType = {
      ...type,
      id: `certtype-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ certificationTypes: [...state.certificationTypes, newType] }));
  },

  updateCertificationType: (id, updates) => {
    set((state) => ({
      certificationTypes: state.certificationTypes.map((type) =>
        type.id === id ? { ...type, ...updates, updatedAt: new Date().toISOString() } : type
      )
    }));
  },

  deleteCertificationType: (id) => {
    set((state) => ({
      certificationTypes: state.certificationTypes.filter((type) => type.id !== id)
    }));
  },

  getCertificationTypesByTenant: (tenantId) => {
    return get().certificationTypes.filter((type) => type.tenantId === tenantId);
  }
}), {
  name: 'certification-storage'
}));