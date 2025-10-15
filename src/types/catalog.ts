// src/types/catalog.ts
// Описание: Типы данных для каталога - организации, промышленные объекты и документы
export type HazardClass = 'I' | 'II' | 'III' | 'IV';
export type ObjectType = 'opo' | 'gts' | 'building';
export type ObjectStatus = 'active' | 'conservation' | 'liquidated';
export type ObjectDocumentStatus = 'valid' | 'expiring_soon' | 'expired';
export type ObjectDocumentType = 
  | 'commissioning' 
  | 'safety_declaration' 
  | 'expertise' 
  | 'diagnostic_report' 
  | 'passport' 
  | 'manual' 
  | 'instructions'
  | 'certificate'
  | 'other';
export type OrganizationType = 'legal_entity' | 'individual_entrepreneur' | 'individual';

export interface CatalogOrganization {
  id: string;
  tenantId: string;
  name: string;
  fullName?: string;
  inn?: string;
  type: 'holding' | 'legal_entity' | 'branch';
  legalType?: OrganizationType;
  parentId?: string;
  children?: CatalogOrganization[];
  level: number;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetailedAddress {
  postalCode?: string;
  region: string;
  city?: string;
  street?: string;
  building?: string;
  oktmo?: string;
  fullAddress: string;
}

export interface IndustrialObject {
  id: string;
  tenantId: string;
  organizationId: string;
  registrationNumber: string;
  name: string;
  type: ObjectType;
  category?: string;
  hazardClass?: HazardClass;
  commissioningDate: string;
  status: ObjectStatus;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  responsiblePerson: string;
  responsiblePersonId?: string;
  nextExpertiseDate?: string;
  nextDiagnosticDate?: string;
  nextTestDate?: string;
  description?: string;
  
  typicalNameId?: string;
  industryCode?: string;
  detailedAddress?: DetailedAddress;
  ownerId?: string;
  dangerSigns?: string[];
  classifications?: string[];
  hazardClassJustification?: string;
  licensedActivities?: string[];
  registrationDate?: string;
  lastChangeDate?: string;
  rtnDepartmentId?: string;
  
  documents?: ObjectDocument[];
  
  createdAt: string;
  updatedAt: string;
}

export interface ObjectDocument {
  id: string;
  objectId: string;
  title: string;
  type: ObjectDocumentType;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  status?: ObjectDocumentStatus;
  createdAt: string;
  uploadedBy?: string;
  
  rtnRegistrationNumber?: string;
  operationExtendedUntil?: string;
}

export interface Location {
  id: string;
  objectId: string;
  address: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  district?: string;
  settlement?: string;
}

export type Organization = CatalogOrganization;