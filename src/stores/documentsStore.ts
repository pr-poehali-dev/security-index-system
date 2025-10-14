import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DocumentStatus } from '@/types/documentStatus';

export interface BaseDocument {
  id: string;
  tenantId: string;
  number: string;
  date: string;
  title: string;
  status: DocumentStatus;
  employeeIds: string[];
  createdBy: string;
  description?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCertification {
  personnelId: string;
  certificationId: string;
  category: string;
  area: string;
}

export interface OrderDocument extends BaseDocument {
  type: 'order';
  orderType: 'attestation' | 'training' | 'suspension' | 'lms' | 'internal';
  certifications?: OrderCertification[];
  sentToTrainingCenter?: boolean;
  trainingCenterRequestId?: string;
}

export interface AttestationOrderPersonnel {
  personnelId: string;
  fullName: string;
  position: string;
  requiredDocuments: Array<{
    documentType: string;
    documentName: string;
    certificateId?: string;
    fileId?: string;
    fileUrl?: string;
    status: string;
  }>;
}

export interface AttestationDocument extends BaseDocument {
  type: 'attestation';
  organizationId: string;
  attestationType: 'rostekhnadzor' | 'internal_commission';
  certificationAreaCode: string;
  certificationAreaName: string;
  personnel: AttestationOrderPersonnel[];
}

export interface TrainingParticipant {
  employeeId: string;
  status: 'in_progress' | 'completed' | 'failed';
  progress?: number;
  testScore?: number;
  testMaxScore?: number;
  completedAt?: string;
}

export interface TrainingDocument extends BaseDocument {
  type: 'training';
  trainingType: 'initial' | 'periodic' | 'extraordinary';
  startDate: string;
  endDate: string;
  organizationId: string;
  cost: number;
  program?: string;
  certificateNumber?: string;
  certificateIssueDate?: string;
  sdoProgress?: number;
  sdoCompletedLessons?: number;
  sdoTotalLessons?: number;
  participants?: TrainingParticipant[];
}

export type Document = OrderDocument | AttestationDocument | TrainingDocument;

interface DocumentsState {
  documents: Document[];
  
  addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  
  updateDocumentStatus: (id: string, status: DocumentStatus) => void;
}

function generateId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set, get) => ({
      documents: [],
      
      addDocument: (documentData) => {
        const now = new Date().toISOString();
        const newDocument = {
          ...documentData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        } as Document;
        
        set((state) => ({
          documents: [...state.documents, newDocument],
        }));
        
        return newDocument;
      },
      
      updateDocument: (id, updates) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
              : doc
          ),
        }));
      },
      
      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        }));
      },
      
      updateDocumentStatus: (id, status) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? { ...doc, status, updatedAt: new Date().toISOString() }
              : doc
          ),
        }));
      },
    }),
    {
      name: 'documents-storage',
    }
  )
);