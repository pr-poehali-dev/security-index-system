// src/types/attestation.ts
// Описание: Типы данных для модуля аттестации - сотрудники, сертификаты, приказы и обучение
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
  linkedTrainingId?: string;
  autoRenewed?: boolean;
  previousCertificationId?: string;
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
  certificateNumber?: string;
  validityPeriod?: number;
  autoRenewQualification?: boolean;
  qualificationRenewed?: boolean;
  renewalDate?: string;
}

export interface TrainingRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  position: string;
  organizationName: string;
  programId?: string;
  programName: string;
  reason: 'expiring_qualification' | 'new_position' | 'mandatory' | 'personal_development';
  priority: 'high' | 'medium' | 'low';
  expiryDate?: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
  autoCreated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttestationStats {
  totalEmployees: number;
  validCertifications: number;
  expiringSoon: number;
  expired: number;
  upcomingCertifications: number;
}

export interface TrainingCenterConnection {
  id: string;
  tenantId: string;
  trainingCenterTenantId: string;
  trainingCenterName: string;
  specializations: string[];
  isActive: boolean;
  autoSendRequests: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingCenterRequest {
  id: string;
  tenantId: string;
  trainingCenterTenantId: string;
  trainingCenterName: string;
  trainingRequestId: string;
  employeeId: string;
  employeeName: string;
  position: string;
  organizationName: string;
  programName: string;
  sendDate: string;
  status: 'sent' | 'received' | 'in_training' | 'completed' | 'rejected';
  responseDate?: string;
  responseMessage?: string;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  cost?: number;
  confirmationNumber?: string;
  certificateIssued?: boolean;
  certificateNumber?: string;
  certificateIssueDate?: string;
  certificateExpiryDate?: string;
  certificateValidityYears?: number;
  createdAt: string;
  updatedAt: string;
}