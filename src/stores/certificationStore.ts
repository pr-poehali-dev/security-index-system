// src/stores/certificationStore.ts
// Описание: Zustand store для управления протоколами аттестации (проверка знаний в Ростехнадзоре/комиссии)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AttestationDocument {
  id: string;
  attestationId: string;
  type: 'protocol' | 'scan' | 'other';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByRole: 'rostechnadzor' | 'company_commission' | 'employee' | 'admin';
  uploadedAt: string;
  description?: string;
}

export interface Attestation {
  id: string;
  personnelId: string;
  tenantId: string;
  category: 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology';
  area: string;
  protocolNumber: string;
  protocolDate: string;
  expiryDate: string;
  attestationType: 'rostechnadzor' | 'company_commission';
  commissionId?: string;
  dpoQualificationId?: string;
  result: 'passed' | 'failed';
  documents?: AttestationDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttestationArea {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string;
  validityPeriod: number;
  category: 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology' | 'other';
  requiresDpo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AttestationState {
  attestations: Attestation[];
  attestationAreas: AttestationArea[];
  
  addAttestation: (att: Omit<Attestation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAttestation: (id: string, updates: Partial<Attestation>) => void;
  deleteAttestation: (id: string) => void;
  getAttestationsByPersonnel: (personnelId: string) => Attestation[];
  getAttestationsByTenant: (tenantId: string) => Attestation[];
  importAttestations: (atts: Omit<Attestation, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  
  addDocument: (attestationId: string, doc: Omit<AttestationDocument, 'id' | 'uploadedAt'>) => void;
  deleteDocument: (attestationId: string, documentId: string) => void;
  getDocumentsByAttestation: (attestationId: string) => AttestationDocument[];
  
  addAttestationArea: (area: Omit<AttestationArea, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAttestationArea: (id: string, updates: Partial<AttestationArea>) => void;
  deleteAttestationArea: (id: string) => void;
  getAttestationAreasByTenant: (tenantId: string) => AttestationArea[];
}

export const useAttestationStore = create<AttestationState>()(persist((set, get) => ({
  attestations: [
    {
      id: 'att-1',
      personnelId: 'personnel-1',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'А.1 Основы промышленной безопасности',
      protocolNumber: 'ПБ-123/2023',
      protocolDate: '2023-01-20',
      expiryDate: '2028-01-20',
      attestationType: 'rostechnadzor',
      dpoQualificationId: 'dpo-1',
      result: 'passed',
      documents: [
        {
          id: 'att-doc-1',
          attestationId: 'att-1',
          type: 'protocol',
          fileName: 'Протокол_РТН_ПБ-123-2023.pdf',
          fileUrl: '/files/attestation/att-1-protocol.pdf',
          fileSize: 189023,
          uploadedBy: 'Ростехнадзор',
          uploadedByRole: 'rostechnadzor',
          uploadedAt: new Date(Date.now() - 495 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Протокол аттестации Ростехнадзора'
        }
      ],
      createdAt: new Date(Date.now() - 495 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'att-2',
      personnelId: 'personnel-2',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'А.1 Основы промышленной безопасности',
      protocolNumber: 'ПБ-234/2020',
      protocolDate: '2020-03-10',
      expiryDate: '2025-03-10',
      attestationType: 'company_commission',
      commissionId: 'comm-1',
      dpoQualificationId: 'dpo-2',
      result: 'passed',
      createdAt: new Date(Date.now() - 1800 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1800 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'att-3',
      personnelId: 'personnel-3',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'А.1 Основы промышленной безопасности',
      protocolNumber: 'КО-567/2022',
      protocolDate: '2022-05-20',
      expiryDate: '2027-05-20',
      attestationType: 'company_commission',
      commissionId: 'comm-1',
      result: 'passed',
      createdAt: new Date(Date.now() - 900 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 900 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  attestationAreas: [
    {
      id: 'area-1',
      tenantId: 'tenant-1',
      code: 'А.1',
      name: 'Основы промышленной безопасности',
      description: 'Требования промышленной безопасности в химической, нефтехимической и нефтеперерабатывающей промышленности',
      validityPeriod: 60,
      category: 'industrial_safety',
      requiresDpo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'area-2',
      tenantId: 'tenant-1',
      code: 'Б.1.1',
      name: 'Эксплуатация сетей газораспределения',
      description: 'Эксплуатация сетей газораспределения и газопотребления',
      validityPeriod: 60,
      category: 'industrial_safety',
      requiresDpo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'area-3',
      tenantId: 'tenant-1',
      code: 'Б.3',
      name: 'Эксплуатация объектов электроэнергетики',
      description: 'Эксплуатация электрических сетей и подстанций',
      validityPeriod: 60,
      category: 'energy_safety',
      requiresDpo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  addAttestation: (att) => {
    const newAtt: Attestation = {
      ...att,
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ attestations: [...state.attestations, newAtt] }));
  },
  
  updateAttestation: (id, updates) => {
    set((state) => ({
      attestations: state.attestations.map((att) =>
        att.id === id ? { ...att, ...updates, updatedAt: new Date().toISOString() } : att
      )
    }));
  },
  
  deleteAttestation: (id) => {
    set((state) => ({
      attestations: state.attestations.filter((att) => att.id !== id)
    }));
  },
  
  getAttestationsByPersonnel: (personnelId) => {
    return get().attestations.filter((att) => att.personnelId === personnelId);
  },
  
  getAttestationsByTenant: (tenantId) => {
    return get().attestations.filter((att) => att.tenantId === tenantId);
  },
  
  importAttestations: (atts) => {
    const newAtts = atts.map((att) => ({
      ...att,
      id: `att-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    set((state) => ({ attestations: [...state.attestations, ...newAtts] }));
  },
  
  addDocument: (attestationId, doc) => {
    const newDoc: AttestationDocument = {
      ...doc,
      id: `att-doc-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    
    set((state) => ({
      attestations: state.attestations.map((att) =>
        att.id === attestationId
          ? { ...att, documents: [...(att.documents || []), newDoc], updatedAt: new Date().toISOString() }
          : att
      )
    }));
  },
  
  deleteDocument: (attestationId, documentId) => {
    set((state) => ({
      attestations: state.attestations.map((att) =>
        att.id === attestationId
          ? { ...att, documents: att.documents?.filter(d => d.id !== documentId), updatedAt: new Date().toISOString() }
          : att
      )
    }));
  },
  
  getDocumentsByAttestation: (attestationId) => {
    const att = get().attestations.find((a) => a.id === attestationId);
    return att?.documents || [];
  },
  
  addAttestationArea: (area) => {
    const newArea: AttestationArea = {
      ...area,
      id: `area-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ attestationAreas: [...state.attestationAreas, newArea] }));
  },
  
  updateAttestationArea: (id, updates) => {
    set((state) => ({
      attestationAreas: state.attestationAreas.map((area) =>
        area.id === id ? { ...area, ...updates, updatedAt: new Date().toISOString() } : area
      )
    }));
  },
  
  deleteAttestationArea: (id) => {
    set((state) => ({
      attestationAreas: state.attestationAreas.filter((area) => area.id !== id)
    }));
  },
  
  getAttestationAreasByTenant: (tenantId) => {
    return get().attestationAreas.filter((area) => area.tenantId === tenantId);
  }
}), {
  name: 'attestation-storage'
}));
