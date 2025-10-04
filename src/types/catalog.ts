export type HazardClass = '1' | '2' | '3' | '4';
export type ObjectType = 'industrial' | 'energy' | 'mining' | 'chemical' | 'gas' | 'building' | 'other';
export type ObjectStatus = 'active' | 'inactive' | 'under_construction' | 'decommissioned';

export interface Organization {
  id: string;
  tenantId: string;
  name: string;
  inn: string;
  type: 'holding' | 'legal_entity' | 'branch';
  parentId?: string;
  children?: Organization[];
  level: number;
  createdAt: string;
}

export interface HazardousObject {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: 'industrial' | 'energy' | 'mining' | 'chemical' | 'gas' | 'other';
  hazardClass: HazardClass;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  responsiblePerson: string;
  responsiblePersonId?: string;
  registrationNumber: string;
  registrationDate: string;
  status: ObjectStatus;
  organizationId: string;
  organizationName?: string;
  commissioningDate?: string;
  nextExaminationDate?: string;
  equipment: Equipment[];
  documentation: Documentation[];
  inspectionSchedule?: InspectionSchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  objectId: string;
  name: string;
  type: string;
  serialNumber: string;
  manufacturer: string;
  commissioningDate: string;
  nextInspectionDate?: string;
  status: 'operational' | 'maintenance' | 'faulty' | 'decommissioned';
  specifications?: Record<string, string>;
}

export interface Documentation {
  id: string;
  objectId: string;
  title: string;
  type: 'certificate' | 'permit' | 'instruction' | 'protocol' | 'other';
  documentNumber: string;
  issueDate: string;
  expiryDate?: string;
  fileUrl?: string;
  status: 'valid' | 'expired' | 'pending_renewal';
}

export interface InspectionSchedule {
  id: string;
  objectId: string;
  inspectionType: 'routine' | 'extraordinary' | 'regulatory';
  scheduledDate: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  responsiblePerson: string;
  status: 'scheduled' | 'completed' | 'overdue';
  lastInspectionDate?: string;
}