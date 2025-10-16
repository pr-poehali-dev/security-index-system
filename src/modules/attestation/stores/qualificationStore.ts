import { create } from 'zustand';
import { QualificationCertificate, QualificationCertificateFormData } from '../types/qualification';

interface QualificationStore {
  certificates: QualificationCertificate[];
  addCertificate: (data: QualificationCertificateFormData) => Promise<void>;
  updateCertificate: (id: string, data: Partial<QualificationCertificateFormData>) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;
  getCertificatesByEmployee: (employeeId: string) => QualificationCertificate[];
  getActiveCertificates: (employeeId: string) => QualificationCertificate[];
  getExpiringCertificates: (days: number) => QualificationCertificate[];
}

const calculateExpiryDate = (issueDate: string): string => {
  const date = new Date(issueDate);
  date.setFullYear(date.getFullYear() + 5);
  return date.toISOString().split('T')[0];
};

const calculateStatus = (expiryDate: string): 'active' | 'expired' | 'expiring_soon' => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 90) return 'expiring_soon';
  return 'active';
};

const mockCertificates: QualificationCertificate[] = [
  {
    id: '1',
    employeeId: '1',
    certificationTypeId: '1',
    number: 'ПК-2023-001234',
    issueDate: '2023-03-15',
    expiryDate: '2028-03-15',
    trainingCenterId: '1',
    scanUrl: 'https://example.com/scans/cert1.pdf',
    status: 'active',
    notes: 'Повышение квалификации по промышленной безопасности',
    createdAt: '2023-03-15T10:00:00Z',
    updatedAt: '2023-03-15T10:00:00Z'
  },
  {
    id: '2',
    employeeId: '1',
    certificationTypeId: '2',
    number: 'ПК-2022-005678',
    issueDate: '2022-06-20',
    expiryDate: '2027-06-20',
    trainingCenterId: '2',
    scanUrl: 'https://example.com/scans/cert2.pdf',
    status: 'active',
    notes: 'Аттестация по электробезопасности',
    createdAt: '2022-06-20T10:00:00Z',
    updatedAt: '2022-06-20T10:00:00Z'
  },
  {
    id: '3',
    employeeId: '2',
    certificationTypeId: '3',
    number: 'ПК-2020-009876',
    issueDate: '2020-01-10',
    expiryDate: '2025-01-10',
    trainingCenterId: '1',
    status: 'expiring_soon',
    notes: 'Истекает в ближайшее время',
    createdAt: '2020-01-10T10:00:00Z',
    updatedAt: '2020-01-10T10:00:00Z'
  }
];

export const useQualificationStore = create<QualificationStore>((set, get) => ({
  certificates: mockCertificates,

  addCertificate: async (data: QualificationCertificateFormData) => {
    const expiryDate = calculateExpiryDate(data.issueDate);
    const status = calculateStatus(expiryDate);
    
    const newCertificate: QualificationCertificate = {
      id: Date.now().toString(),
      ...data,
      expiryDate,
      status,
      scanUrl: data.scanFile ? URL.createObjectURL(data.scanFile) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    set((state) => ({
      certificates: [...state.certificates, newCertificate]
    }));
  },

  updateCertificate: async (id: string, data: Partial<QualificationCertificateFormData>) => {
    set((state) => ({
      certificates: state.certificates.map((cert) => {
        if (cert.id !== id) return cert;
        
        const issueDate = data.issueDate || cert.issueDate;
        const expiryDate = calculateExpiryDate(issueDate);
        const status = calculateStatus(expiryDate);
        
        return {
          ...cert,
          ...data,
          expiryDate,
          status,
          scanUrl: data.scanFile ? URL.createObjectURL(data.scanFile) : cert.scanUrl,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  },

  deleteCertificate: async (id: string) => {
    set((state) => ({
      certificates: state.certificates.filter((cert) => cert.id !== id)
    }));
  },

  getCertificatesByEmployee: (employeeId: string) => {
    return get().certificates.filter((cert) => cert.employeeId === employeeId);
  },

  getActiveCertificates: (employeeId: string) => {
    return get().certificates.filter(
      (cert) => cert.employeeId === employeeId && cert.status === 'active'
    );
  },

  getExpiringCertificates: (days: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    return get().certificates.filter((cert) => {
      const expiryDate = new Date(cert.expiryDate);
      return expiryDate <= targetDate && cert.status !== 'expired';
    });
  }
}));
