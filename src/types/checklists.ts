// src/types/checklists.ts
// Описание: Типы данных для чек-листов и аудитов - шаблоны, проверки и отчеты
export type QuestionType = 'yes_no' | 'number' | 'text' | 'select';
export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface ChecklistTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  category: string;
  sections: ChecklistSection[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ChecklistSection {
  id: string;
  templateId: string;
  name: string;
  order: number;
  questions: ChecklistQuestion[];
}

export interface ChecklistQuestion {
  id: string;
  sectionId: string;
  text: string;
  type: QuestionType;
  order: number;
  required: boolean;
  isCritical: boolean;
  options?: string[];
  helpText?: string;
}

export interface Inspection {
  id: string;
  tenantId: string;
  templateId: string;
  templateName: string;
  objectId: string;
  objectName: string;
  assignedTo: string;
  assignedToName: string;
  scheduledDate: string;
  completedDate?: string;
  status: InspectionStatus;
  results?: InspectionResult[];
  compliancePercentage?: number;
  createdIncidents?: string[];
  createdBy: string;
  createdAt: string;
}

export interface InspectionResult {
  id: string;
  inspectionId: string;
  questionId: string;
  questionText: string;
  answer: string | number | boolean;
  isCompliant: boolean;
  comment?: string;
  attachments?: string[];
  incidentCreated?: boolean;
  incidentId?: string;
}

export interface ChecklistStats {
  totalInspections: number;
  completedInspections: number;
  avgComplianceRate: number;
  criticalViolations: number;
  incidentsCreated: number;
}