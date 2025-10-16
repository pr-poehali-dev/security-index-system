// src/stores/qualificationRenewalStore.ts
// Описание: Zustand store для автоматического продления удостоверений ПК
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QualificationRenewal {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  trainingId: string;
  trainingProgramName: string;
  oldCertificationId?: string;
  newCertificationId?: string;
  oldExpiryDate?: string;
  newIssueDate: string;
  newExpiryDate: string;
  newCertificateNumber: string;
  validityPeriod: number;
  status: 'pending' | 'completed' | 'failed';
  autoCreated: boolean;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

interface QualificationRenewalState {
  renewals: QualificationRenewal[];
  
  addRenewal: (renewal: Omit<QualificationRenewal, 'id' | 'createdAt'>) => void;
  updateRenewal: (id: string, updates: Partial<QualificationRenewal>) => void;
  getRenewalsByTenant: (tenantId: string) => QualificationRenewal[];
  getRenewalsByEmployee: (employeeId: string) => QualificationRenewal[];
  getPendingRenewals: (tenantId: string) => QualificationRenewal[];
  autoCreateRenewal: (
    tenantId: string,
    employeeId: string,
    employeeName: string,
    trainingId: string,
    trainingProgramName: string,
    validityPeriod: number,
    oldCertificationId?: string,
    oldExpiryDate?: string
  ) => string;
}

export const useQualificationRenewalStore = create<QualificationRenewalState>()(persist((set, get) => ({
  renewals: [
    {
      id: 'renewal-1',
      tenantId: 'tenant-1',
      employeeId: 'personnel-2',
      employeeName: 'Петров Иван Сергеевич',
      trainingId: 'training-1',
      trainingProgramName: 'Повышение квалификации энергетиков',
      oldCertificationId: 'cert-old-1',
      oldExpiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      newIssueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      newExpiryDate: new Date(Date.now() + (5 * 365 + 21) * 24 * 60 * 60 * 1000).toISOString(),
      newCertificateNumber: 'ПК-2025-0147',
      validityPeriod: 5,
      status: 'pending',
      autoCreated: true,
      notes: 'Автоматическое продление после завершения обучения. Новое удостоверение будет выдано после окончания курса.',
      createdAt: new Date().toISOString()
    }
  ],
  
  addRenewal: (renewal) => {
    const newRenewal: QualificationRenewal = {
      ...renewal,
      id: `renewal-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ renewals: [...state.renewals, newRenewal] }));
  },
  
  updateRenewal: (id, updates) => {
    set((state) => ({
      renewals: state.renewals.map((renewal) =>
        renewal.id === id ? { ...renewal, ...updates } : renewal
      )
    }));
  },
  
  getRenewalsByTenant: (tenantId) => {
    return get().renewals.filter((renewal) => renewal.tenantId === tenantId);
  },
  
  getRenewalsByEmployee: (employeeId) => {
    return get().renewals.filter((renewal) => renewal.employeeId === employeeId);
  },
  
  getPendingRenewals: (tenantId) => {
    return get().renewals.filter((renewal) => 
      renewal.tenantId === tenantId && renewal.status === 'pending'
    );
  },
  
  autoCreateRenewal: (
    tenantId,
    employeeId,
    employeeName,
    trainingId,
    trainingProgramName,
    validityPeriod,
    oldCertificationId,
    oldExpiryDate
  ) => {
    const existingRenewal = get().renewals.find(
      (r) => r.trainingId === trainingId && r.status === 'pending'
    );
    
    if (existingRenewal) {
      return existingRenewal.id;
    }
    
    const newIssueDate = new Date();
    newIssueDate.setDate(newIssueDate.getDate() + 21);
    
    const newExpiryDate = new Date(newIssueDate);
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + validityPeriod);
    
    const certificateNumber = `ПК-${newIssueDate.getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    
    const newRenewal: QualificationRenewal = {
      id: `renewal-${Date.now()}`,
      tenantId,
      employeeId,
      employeeName,
      trainingId,
      trainingProgramName,
      oldCertificationId,
      oldExpiryDate,
      newIssueDate: newIssueDate.toISOString(),
      newExpiryDate: newExpiryDate.toISOString(),
      newCertificateNumber: certificateNumber,
      validityPeriod,
      status: 'pending',
      autoCreated: true,
      notes: 'Автоматическое продление после завершения обучения',
      createdAt: new Date().toISOString()
    };
    
    set((state) => ({ renewals: [...state.renewals, newRenewal] }));
    return newRenewal.id;
  }
}), {
  name: 'qualification-renewal-storage'
}));
