// src/stores/interOrgDocumentsStore.ts
// Описание: Zustand store для управления межтенантными документами
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InterOrgDocument, InterOrgDocumentType, InterOrgDocumentStatus } from '@/types';

interface InterOrgDocumentsState {
  documents: InterOrgDocument[];
  
  addDocument: (doc: Omit<InterOrgDocument, 'id' | 'sentAt'>) => InterOrgDocument;
  updateDocument: (id: string, updates: Partial<InterOrgDocument>) => void;
  deleteDocument: (id: string) => void;
  getDocumentsByTenant: (tenantId: string, direction: 'sent' | 'received') => InterOrgDocument[];
  getDocumentsByType: (type: InterOrgDocumentType) => InterOrgDocument[];
  getDocumentsByStatus: (status: InterOrgDocumentStatus) => InterOrgDocument[];
}

export const useInterOrgDocumentsStore = create<InterOrgDocumentsState>()(persist((set, get) => ({
  documents: [
    {
      id: 'doc-training-completion-1',
      fromTenantId: 'external-org-1',
      fromTenantName: 'УЦ Профессионал',
      toTenantId: 'tenant-1',
      toTenantName: 'ООО "ЭнергоПром"',
      documentType: 'training_completion',
      sourceId: 'group-001',
      title: 'Завершение обучения группы Б.1.1 - Октябрь 2024',
      description: 'Завершена подготовка 3 сотрудников по программе промышленной безопасности Б.1.1',
      status: 'processed',
      data: {
        groupId: 'group-001',
        programCode: 'B.1.1',
        programName: 'Промышленная безопасность Б.1.1',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        certificates: [
          {
            personnelId: 'personnel-3',
            certificateId: 'issued-4',
            certificateNumber: 'УД-2024-12345',
            fileUrl: '/files/certificates/cert-b11-12345.pdf'
          },
          {
            personnelId: 'personnel-5',
            certificateId: 'issued-5',
            certificateNumber: 'УД-2024-12346',
            fileUrl: '/files/certificates/cert-b11-12346.pdf'
          },
          {
            personnelId: 'personnel-7',
            certificateId: 'issued-6',
            certificateNumber: 'УД-2024-12347',
            fileUrl: '/files/certificates/cert-b11-12347.pdf'
          }
        ]
      },
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      processedBy: 'system-auto-sync'
    },
    {
      id: 'doc-training-completion-2',
      fromTenantId: 'external-org-1',
      fromTenantName: 'УЦ Профессионал',
      toTenantId: 'tenant-1',
      toTenantName: 'ООО "ЭнергоПром"',
      documentType: 'training_completion',
      sourceId: 'group-002',
      title: 'Завершение обучения группы ОТ - Октябрь 2024',
      description: 'Завершена подготовка 2 сотрудников по программе охраны труда для руководителей',
      status: 'processed',
      data: {
        groupId: 'group-002',
        programCode: 'OT-RS',
        programName: 'Охрана труда для руководителей и специалистов',
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        certificates: [
          {
            personnelId: 'personnel-4',
            certificateId: 'issued-7',
            certificateNumber: 'ОТ-2024-45678',
            fileUrl: '/files/certificates/cert-ot-45678.pdf'
          },
          {
            personnelId: 'personnel-6',
            certificateId: 'issued-8',
            certificateNumber: 'ОТ-2024-45679',
            fileUrl: '/files/certificates/cert-ot-45679.pdf'
          }
        ]
      },
      sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      receivedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      processedBy: 'system-auto-sync'
    },
    {
      id: 'doc-training-request-1',
      fromTenantId: 'tenant-1',
      fromTenantName: 'ООО "ЭнергоПром"',
      toTenantId: 'external-org-1',
      toTenantName: 'УЦ Профессионал',
      documentType: 'training_request',
      sourceId: 'req-training-1',
      title: 'Заявка на обучение по программе Б.1.1',
      description: 'Направление 3 сотрудников на обучение по промышленной безопасности',
      status: 'completed',
      data: {
        requestId: 'req-training-1',
        programCode: 'B.1.1',
        studentsCount: 3,
        desiredStartDate: '2024-09-15'
      },
      sentAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      receivedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      processedBy: 'training-center-manager'
    }
  ],
  
  addDocument: (doc) => {
    const newDoc: InterOrgDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      sentAt: new Date().toISOString()
    };
    
    set((state) => ({
      documents: [...state.documents, newDoc]
    }));
    
    return newDoc;
  },
  
  updateDocument: (id, updates) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      )
    }));
  },
  
  deleteDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id)
    }));
  },
  
  getDocumentsByTenant: (tenantId, direction) => {
    return get().documents.filter((doc) =>
      direction === 'sent' 
        ? doc.fromTenantId === tenantId 
        : doc.toTenantId === tenantId
    );
  },
  
  getDocumentsByType: (type) => {
    return get().documents.filter((doc) => doc.documentType === type);
  },
  
  getDocumentsByStatus: (status) => {
    return get().documents.filter((doc) => doc.status === status);
  }
}), { name: 'inter-org-documents-storage' }));
