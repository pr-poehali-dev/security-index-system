export type HazardClass = '1' | '2' | '3' | '4';

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
  status: 'active' | 'inactive' | 'decommissioned';
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
