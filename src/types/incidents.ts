export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'new' | 'in_progress' | 'under_review' | 'closed';
export type IncidentSource = 'manual' | 'checklist' | 'automated';

export interface IncidentType {
  id: string;
  code: string;
  name: string;
  category: 'accident' | 'leak' | 'fire' | 'violation' | 'equipment_failure' | 'other';
  requiresInvestigation: boolean;
}

export interface Incident {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  typeId: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  source: IncidentSource;
  objectId?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  closedAt?: string;
  resolution?: string;
  checklistInspectionId?: string;
  attachments?: IncidentAttachment[];
  comments?: IncidentComment[];
}

export interface IncidentAttachment {
  id: string;
  incidentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface IncidentStats {
  total: number;
  byStatus: Record<IncidentStatus, number>;
  byPriority: Record<IncidentPriority, number>;
  overdue: number;
  avgResolutionTime: number;
}
