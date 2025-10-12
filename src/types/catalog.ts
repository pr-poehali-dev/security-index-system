// src/types/catalog.ts
export type HazardClass = 'I' | 'II' | 'III' | 'IV';
export type ObjectType = 'opo' | 'gts' | 'building';
export type ObjectStatus = 'active' | 'conservation' | 'liquidated';
export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired';
export type DocumentType = 'passport' | 'scheme' | 'permit' | 'protocol' | 'certificate' | 'other';

export interface Organization {
  id: string;
  tenantId: string;
  name: string;
  inn?: string;
  type: 'holding' | 'legal_entity' | 'branch';
  parentId?: string;
  children?: Organization[];
  level: number;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ObjectDocument {
  id: string;
  objectId: string;
  title: string;
  type: DocumentType;
  documentNumber?: string;
  issueDate: string;
  expiryDate?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  status: DocumentStatus;
  createdAt: string;
  uploadedBy?: string;
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