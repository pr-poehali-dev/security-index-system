export interface QualificationCertificate {
  id: string;
  employeeId: string;
  certificationTypeId: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  trainingCenterId: string;
  scanUrl?: string;
  status: 'active' | 'expired' | 'expiring_soon';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualificationCertificateFormData {
  employeeId: string;
  certificationTypeId: string;
  number: string;
  issueDate: string;
  trainingCenterId: string;
  scanFile?: File;
  notes?: string;
}
