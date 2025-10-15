export type BaseEntityStatus = 'active' | 'suspended' | 'archived';
export type CatalogContractorStatus = BaseEntityStatus | 'blocked';
export type EmployeeStatus = BaseEntityStatus | 'blocked' | 'dismissed';
export type AccessStatus = 'active' | 'suspended' | 'revoked' | 'expired';
export type AttestationStatus = 'valid' | 'expiring' | 'expired';
export type CatalogContractorType = 'contractor' | 'training_center';

export interface CatalogContractor {
  id: string;
  tenantId: string;
  name: string;
  type: CatalogContractorType;
  inn: string;
  kpp?: string;
  legalAddress?: string;
  actualAddress?: string;
  directorName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contractNumber?: string;
  contractDate?: string;
  contractExpiry?: string;
  contractAmount?: number;
  allowedWorkTypes?: string[];
  sroNumber?: string;
  sroExpiry?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  rating: number;
  status: CatalogContractorStatus;
  notes?: string;
  accreditations?: string[];
  website?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ContractorEmployee {
  id: string;
  contractorId: string;
  tenantId: string;
  fullName: string;
  position?: string;
  phone?: string;
  email?: string;
  passportSeries?: string;
  passportNumber?: string;
  snils?: string;
  medicalCheckupDate?: string;
  medicalCheckupExpiry?: string;
  fireSafetyTrainingDate?: string;
  fireSafetyTrainingExpiry?: string;
  laborSafetyTrainingDate?: string;
  laborSafetyTrainingExpiry?: string;
  status: EmployeeStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  // Populated fields
  contractor?: CatalogContractor;
  attestations?: ContractorEmployeeAttestation[];
  objectAccess?: ContractorEmployeeObject[];
}

export interface ContractorEmployeeAttestation {
  id: string;
  employeeId: string;
  attestationArea: string;
  certificateNumber?: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority?: string;
  documentFileUrl?: string;
  status: AttestationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContractorEmployeeObject {
  id: string;
  employeeId: string;
  objectId: string;
  accessStart: string;
  accessEnd?: string;
  workType?: string;
  accessStatus: AccessStatus;
  revokeReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  employee?: ContractorEmployee;
  object?: import('@/types/catalog').IndustrialObject;
}

export interface ContractorAccessLog {
  id: string;
  employeeId: string;
  objectId: string;
  entryTime: string;
  exitTime?: string;
  entryMethod?: 'manual' | 'qr_code' | 'card' | 'biometric';
  notes?: string;
  createdAt: string;
}

export interface ContractorWorkHistory {
  id: string;
  contractorId: string;
  objectId?: string;
  workType?: string;
  startDate: string;
  endDate?: string;
  contractAmount?: number;
  actualAmount?: number;
  qualityRating?: number;
  deadlineCompliance?: boolean;
  safetyIncidents: number;
  comments?: string;
  createdAt: string;
  createdBy?: string;
}

export interface ContractorComplianceCheck {
  employeeId: string;
  objectId: string;
  compliant: boolean;
  missingCompetencies: string[];
  expiringAttestations: {
    area: string;
    expiryDate: string;
    daysUntilExpiry: number;
  }[];
  expiredAttestations: string[];
  missingDocuments: {
    type: 'medical' | 'fire_safety' | 'labor_safety';
    name: string;
    expiryDate?: string;
  }[];
}

export interface ObjectPersonnel {
  objectId: string;
  requiredCompetencies: string[];
  employees: (ContractorEmployee & {
    complianceCheck: ContractorComplianceCheck;
  })[];
  summary: {
    total: number;
    compliant: number;
    nonCompliant: number;
    expiringSoon: number;
  };
}

export type ContractorFormData = Omit<CatalogContractor, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'rating' | 'tenantId'>;

export type EmployeeFormData = Omit<ContractorEmployee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'tenantId' | 'contractor' | 'attestations' | 'objectAccess'>;

export type AttestationFormData = Omit<ContractorEmployeeAttestation, 'id' | 'createdAt' | 'updatedAt' | 'status'>;

export type ObjectAccessFormData = Omit<ContractorEmployeeObject, 'id' | 'createdAt' | 'updatedAt' | 'employee' | 'object'>;

export type Contractor = CatalogContractor;
export type ContractorStatus = CatalogContractorStatus;
export type ContractorType = CatalogContractorType;