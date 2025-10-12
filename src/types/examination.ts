// src/types/examination.ts
export type ExaminationType = 'technical_diagnostics' | 'safety_expertise' | 'testing';
export type ExaminationStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue';
export type ExaminationResult = 'compliant' | 'non_compliant' | 'conditional';

export interface TechnicalExamination {
  id: string;
  tenantId: string;
  objectId: string;
  objectName: string;
  type: ExaminationType;
  scheduledDate: string;
  completedDate?: string;
  nextExaminationDate?: string;
  status: ExaminationStatus;
  result?: ExaminationResult;
  executorOrganization: string;
  executorContact?: string;
  cost?: number;
  reportUrl?: string;
  certificateNumber?: string;
  findings?: string;
  recommendations?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExaminationOrganization {
  id: string;
  name: string;
  inn: string;
  accreditationNumber: string;
  accreditationExpiry: string;
  contactPerson: string;
  email: string;
  phone: string;
  specializations: ExaminationType[];
  isActive: boolean;
}

export interface ExaminationReport {
  id: string;
  examinationId: string;
  reportNumber: string;
  reportDate: string;
  fileUrl: string;
  summary: string;
  defectsFound: Defect[];
}

export interface Defect {
  id: string;
  reportId: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  location?: string;
  recommendation: string;
  deadline?: string;
}

export interface ExaminationStats {
  totalExaminations: number;
  completed: number;
  scheduled: number;
  overdue: number;
  avgCost: number;
  complianceRate: number;
}