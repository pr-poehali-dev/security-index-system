// src/stores/certificationStore.ts
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
      id: 'cert-2',
      personnelId: 'personnel-1',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'Б.3 Эксплуатация объектов электроэнергетики',
      issueDate: '2021-09-15',
      expiryDate: '2026-09-14',
      protocolNumber: 'ПБ-456/2021',
      protocolDate: '2021-09-15',
      verified: false,
      createdAt: new Date(Date.now() - 1200 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1200 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-3',
      personnelId: 'personnel-1',
      tenantId: 'tenant-1',
      category: 'energy_safety',
      area: 'Электропотребители промышленные 5 группа до и выше 1000В',
      issueDate: '2025-02-17',
      expiryDate: '2026-02-17',
      protocolNumber: 'ЭБ-789/2025',
      protocolDate: '2025-02-17',
      verified: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-4',
      personnelId: 'personnel-2',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'А.1 Основы промышленной безопасности',
      issueDate: '2020-03-10',
      expiryDate: '2024-03-10',
      protocolNumber: 'ПБ-234/2020',
      protocolDate: '2020-03-10',
      verified: true,
      verifiedDate: '2020-03-15',
      createdAt: new Date(Date.now() - 1800 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1800 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-5',
      personnelId: 'personnel-2',
      tenantId: 'tenant-1',
      category: 'energy_safety',
      area: 'V группа до 1000В',
      issueDate: '2024-06-15',
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verified: false,
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-6',
      personnelId: 'personnel-3',
      tenantId: 'tenant-1',
      category: 'energy_safety',
      area: 'III группа до 1000В',
      issueDate: '2023-05-20',
      expiryDate: '2025-11-20',
      verified: false,
      createdAt: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString()
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