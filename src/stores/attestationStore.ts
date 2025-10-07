import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  verified: boolean;
  verifiedDate?: string;
  verifiedBy?: string;
  trainingOrganizationId?: string;
  documentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AttestationState {
  certifications: Certification[];
  
  addCertification: (cert: Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;
  getCertificationsByPersonnel: (personnelId: string) => Certification[];
  getCertificationsByTenant: (tenantId: string) => Certification[];
  importCertifications: (certs: Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

export const useAttestationStore = create<AttestationState>()(persist((set, get) => ({
  certifications: [
    {
      id: 'cert-1',
      personnelId: 'personnel-1',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'А.1 Основы промышленной безопасности',
      issueDate: '2023-01-01',
      expiryDate: '2028-01-01',
      protocolNumber: 'ПБ-123/2023',
      protocolDate: '2023-01-01',
      verified: true,
      verifiedDate: '2024-03-15',
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
      expiryDate: '2025-03-10',
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
      expiryDate: '2025-06-15',
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

  importCertifications: (certs) => {
    const newCerts = certs.map((cert, index) => ({
      ...cert,
      id: `cert-import-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    set((state) => ({ certifications: [...state.certifications, ...newCerts] }));
  }
}), {
  name: 'attestation-storage'
}));
