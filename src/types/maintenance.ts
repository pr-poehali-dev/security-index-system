// src/types/maintenance.ts
export type MaintenanceType = 'scheduled_maintenance' | 'repair' | 'replacement' | 'emergency';
export type MaintenanceStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'critical' | 'high' | 'normal' | 'low';

export interface MaintenanceWork {
  id: string;
  tenantId: string;
  objectId: string;
  objectName: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  title: string;
  description: string;
  scheduledStartDate: string;
  scheduledEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  executorType: 'internal' | 'external';
  executorName: string;
  executorContact?: string;
  estimatedCost?: number;
  actualCost?: number;
  downtime?: number;
  materials?: Material[];
  laborHours?: number;
  acceptanceCertificate?: AcceptanceCertificate;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  maintenanceId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface AcceptanceCertificate {
  id: string;
  maintenanceId: string;
  certificateNumber: string;
  signedDate: string;
  signedBy: string;
  signedByName: string;
  fileUrl?: string;
  qualityRating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface MaintenanceSchedule {
  id: string;
  objectId: string;
  objectName: string;
  maintenanceType: MaintenanceType;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastMaintenanceDate?: string;
  nextMaintenanceDate: string;
  estimatedDuration: number;
  isActive: boolean;
}

export interface MaintenanceStats {
  totalWorks: number;
  completed: number;
  inProgress: number;
  planned: number;
  totalCost: number;
  avgDowntime: number;
  onTimeCompletionRate: number;
}