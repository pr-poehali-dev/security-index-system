// src/stores/dpoQualificationStore.ts
// Описание: Zustand store для управления удостоверениями ДПО (повышение квалификации)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DpoDocument {
  id: string;
  qualificationId: string;
  type: 'certificate' | 'scan' | 'other';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByRole: 'training_center' | 'employee' | 'admin';
  uploadedAt: string;
  description?: string;
}

export interface DpoQualification {
  id: string;
  personnelId: string;
  tenantId: string;
  category: 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology';
  programName: string;
  trainingOrganizationId: string;
  trainingOrganizationName: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  duration: number;
  documents?: DpoDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DpoQualificationState {
  qualifications: DpoQualification[];
  
  addQualification: (qual: Omit<DpoQualification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQualification: (id: string, updates: Partial<DpoQualification>) => void;
  deleteQualification: (id: string) => void;
  getQualificationsByPersonnel: (personnelId: string) => DpoQualification[];
  getQualificationsByTenant: (tenantId: string) => DpoQualification[];
  getQualificationsByTrainingCenter: (trainingOrgId: string) => DpoQualification[];
  importQualifications: (quals: Omit<DpoQualification, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  
  addDocument: (qualificationId: string, doc: Omit<DpoDocument, 'id' | 'uploadedAt'>) => void;
  deleteDocument: (qualificationId: string, documentId: string) => void;
  getDocumentsByQualification: (qualificationId: string) => DpoDocument[];
}

export const useDpoQualificationStore = create<DpoQualificationState>()(persist((set, get) => ({
  qualifications: [
    {
      id: 'dpo-1',
      personnelId: 'personnel-1',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      programName: 'Промышленная безопасность опасных производственных объектов. Область А.1',
      trainingOrganizationId: 'training-center-1',
      trainingOrganizationName: 'АНО ДПО "Учебный центр"',
      certificateNumber: 'ДПО-2023-001234',
      issueDate: '2023-01-15',
      expiryDate: '2028-01-15',
      duration: 72,
      documents: [
        {
          id: 'dpo-doc-1',
          qualificationId: 'dpo-1',
          type: 'certificate',
          fileName: 'Удостоверение_ДПО_А1_2023.pdf',
          fileUrl: '/files/dpo/dpo-1-certificate.pdf',
          fileSize: 245678,
          uploadedBy: 'АНО ДПО "Учебный центр"',
          uploadedByRole: 'training_center',
          uploadedAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Удостоверение о повышении квалификации'
        }
      ],
      createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'dpo-2',
      personnelId: 'personnel-2',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      programName: 'Промышленная безопасность опасных производственных объектов. Область А.1',
      trainingOrganizationId: 'training-center-1',
      trainingOrganizationName: 'АНО ДПО "Учебный центр"',
      certificateNumber: 'ДПО-2020-005678',
      issueDate: '2020-03-01',
      expiryDate: '2025-03-01',
      duration: 72,
      createdAt: new Date(Date.now() - 1800 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1800 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'dpo-3',
      personnelId: 'personnel-1',
      tenantId: 'tenant-1',
      category: 'labor_safety',
      programName: 'Охрана труда для руководителей и специалистов организаций',
      trainingOrganizationId: 'training-center-2',
      trainingOrganizationName: 'Центр ДПО "Безопасность"',
      certificateNumber: 'ОТ-2023-00567',
      issueDate: '2023-06-10',
      expiryDate: '2026-06-10',
      duration: 40,
      createdAt: new Date(Date.now() - 450 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  addQualification: (qual) => {
    const newQual: DpoQualification = {
      ...qual,
      id: `dpo-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ qualifications: [...state.qualifications, newQual] }));
  },
  
  updateQualification: (id, updates) => {
    set((state) => ({
      qualifications: state.qualifications.map((qual) =>
        qual.id === id ? { ...qual, ...updates, updatedAt: new Date().toISOString() } : qual
      )
    }));
  },
  
  deleteQualification: (id) => {
    set((state) => ({
      qualifications: state.qualifications.filter((qual) => qual.id !== id)
    }));
  },
  
  getQualificationsByPersonnel: (personnelId) => {
    return get().qualifications.filter((qual) => qual.personnelId === personnelId);
  },
  
  getQualificationsByTenant: (tenantId) => {
    return get().qualifications.filter((qual) => qual.tenantId === tenantId);
  },
  
  getQualificationsByTrainingCenter: (trainingOrgId) => {
    return get().qualifications.filter((qual) => qual.trainingOrganizationId === trainingOrgId);
  },
  
  importQualifications: (quals) => {
    const newQuals = quals.map((qual) => ({
      ...qual,
      id: `dpo-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    set((state) => ({ qualifications: [...state.qualifications, ...newQuals] }));
  },
  
  addDocument: (qualificationId, doc) => {
    const newDoc: DpoDocument = {
      ...doc,
      id: `dpo-doc-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    
    set((state) => ({
      qualifications: state.qualifications.map((qual) =>
        qual.id === qualificationId
          ? { ...qual, documents: [...(qual.documents || []), newDoc], updatedAt: new Date().toISOString() }
          : qual
      )
    }));
  },
  
  deleteDocument: (qualificationId, documentId) => {
    set((state) => ({
      qualifications: state.qualifications.map((qual) =>
        qual.id === qualificationId
          ? { ...qual, documents: qual.documents?.filter(d => d.id !== documentId), updatedAt: new Date().toISOString() }
          : qual
      )
    }));
  },
  
  getDocumentsByQualification: (qualificationId) => {
    const qual = get().qualifications.find((q) => q.id === qualificationId);
    return qual?.documents || [];
  }
}), {
  name: 'dpo-qualification-storage'
}));
