export type CertificationStatus = 'valid' | 'expiring_soon' | 'expired' | 'pending';
export type CertificationType = 'initial' | 'periodic' | 'extraordinary';
export type CertificationResult = 'passed' | 'failed' | 'pending';

export interface Employee {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  position: string;
  positionId?: string;
  organizationId: string;
  organizationName: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  certifications: Certification[];
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  employeeId: string;
  type: CertificationType;
  category: string;
  issueDate: string;
  expiryDate: string;
  nextCertificationDate?: string;
  status: CertificationStatus;
  result: CertificationResult;
  certificateNumber?: string;
  documentUrl?: string;
  issuedBy?: string;
  notes?: string;
}

export interface TrainingProgram {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  category: string;
  duration: number;
  validityPeriod: number;
  isActive: boolean;
}

export interface Training {
  id: string;
  employeeId: string;
  programId: string;
  programName: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  result?: 'passed' | 'failed';
  certificateUrl?: string;
}

export interface AttestationStats {
  totalEmployees: number;
  validCertifications: number;
  expiringSoon: number;
  expired: number;
  upcomingCertifications: number;
}
