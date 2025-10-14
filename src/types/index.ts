// src/types/index.ts
// Описание: Основные типы данных приложения - пользователи, тенанты, организации и персонал
export type UserRole = 'SuperAdmin' | 'TenantAdmin' | 'Auditor' | 'Manager' | 'Director' | 'TrainingCenterManager';

export type ModuleType = 
  | 'tenants'
  | 'attestation'
  | 'catalog'
  | 'incidents'
  | 'checklists'
  | 'tasks'
  | 'examination'
  | 'maintenance'
  | 'budget'
  | 'training-center'
  | 'knowledge-base'
  | 'audit'
  | 'settings';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
  availableModules: ModuleType[];
}

export interface SystemUser {
  id: string;
  tenantId: string;
  personnelId?: string;
  email: string;
  login: string;
  passwordHash: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastLogin?: string;
  organizationAccess: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  inn: string;
  adminEmail: string;
  adminName: string;
  status: 'active' | 'inactive';
  modules: ModuleType[];
  createdAt: string;
  expiresAt: string;
}

export interface CertificationArea {
  id: string;
  code: string;
  name: string;
  category: 'industrial_safety' | 'labor_safety' | 'energy_safety' | 'ecology';
  validityMonths: number;
  requiresRostechnadzor: boolean;
}

export interface Organization {
  id: string;
  tenantId: string;
  name: string;
  inn: string;
  kpp?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ProductionSite {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  address: string;
  code?: string;
  head?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Department {
  id: string;
  tenantId: string;
  organizationId: string;
  parentId?: string;
  name: string;
  code?: string;
  head?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type EducationLevel = 'higher' | 'secondary' | 'no_data';

export interface Person {
  id: string;
  tenantId: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate?: string;
  passportSeries?: string;
  passportNumber?: string;
  snils?: string;
  inn?: string;
  email?: string;
  phone?: string;
  address?: string;
  educationLevel?: EducationLevel;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  category?: 'management' | 'specialist' | 'worker' | 'other';
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type PersonnelType = 'employee' | 'contractor';

export interface Personnel {
  id: string;
  tenantId: string;
  personId: string;
  positionId: string;
  organizationId?: string;
  departmentId?: string;
  personnelType: PersonnelType;
  role: 'Auditor' | 'Manager' | 'Director' | 'Contractor';
  requiredCompetencies?: string[];
  status: 'active' | 'dismissed';
  hireDate?: string;
  dismissalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  position: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  certifications: EmployeeCertification[];
}

export interface EmployeeCertification {
  id: string;
  employeeId: string;
  areaId: string;
  certifiedAt: string;
  expiresAt: string;
  protocolNumber?: string;
  verificationStatus?: 'pending' | 'verified' | 'failed';
}

export interface CompetencyMatrix {
  id: string;
  tenantId: string;
  organizationId: string;
  positionId: string;
  requiredAreas: CompetencyAreaRequirement[];
  createdAt: string;
  updatedAt: string;
}

export interface CompetencyAreaRequirement {
  category: 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology';
  areas: string[];
}

export type ExternalOrganizationType = 
  | 'training_center' 
  | 'contractor' 
  | 'supplier' 
  | 'regulatory_body'
  | 'certification_body'
  | 'other';

export interface ExternalOrganization {
  id: string;
  tenantId: string;
  type: ExternalOrganizationType;
  name: string;
  inn?: string;
  kpp?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  accreditations?: string[];
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface TrainingOrganization extends ExternalOrganization {
  type: 'training_center';
}

export type CertificationStatus = 'valid' | 'expiring' | 'expired';

export interface Certification {
  id: string;
  tenantId: string;
  personId: string;
  competencyId: string;
  issueDate: string;
  expiryDate: string;
  protocolNumber: string;
  issuedBy?: string;
  status: CertificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Competency {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  category: 'industrial_safety' | 'labor_safety' | 'energy_safety' | 'ecology' | 'other';
  validityMonths: number;
  requiresRostechnadzor?: boolean;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface GapAnalysis {
  employeeId: string;
  fullName: string;
  position: string;
  organizationId: string;
  organizationName: string;
  requiredAreas: CompetencyAreaRequirement[];
  missingAreas: CompetencyAreaRequirement[];
  hasAllRequired: boolean;
  completionRate: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  lastChecked: string;
}

export interface CompetencyGapReport {
  totalPersonnel: number;
  compliantPersonnel: number;
  nonCompliantPersonnel: number;
  criticalGaps: number;
  highRiskGaps: number;
  complianceRate: number;
  gaps: GapAnalysis[];
  byOrganization: {
    organizationId: string;
    organizationName: string;
    totalPersonnel: number;
    compliant: number;
    complianceRate: number;
  }[];
  byCategory: {
    category: string;
    totalRequired: number;
    totalMissing: number;
    mostMissingAreas: { code: string; count: number }[];
  }[];
}

export interface IncidentSource {
  id: string;
  tenantId: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface IncidentDirection {
  id: string;
  tenantId: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface IncidentFundingType {
  id: string;
  tenantId: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface IncidentCategory {
  id: string;
  tenantId: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface IncidentSubcategory {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type IncidentStatus = 
  | 'created' 
  | 'in_progress' 
  | 'awaiting' 
  | 'overdue' 
  | 'completed' 
  | 'completed_late';

export interface Incident {
  id: string;
  tenantId: string;
  organizationId: string;
  productionSiteId: string;
  reportDate: string;
  sourceId: string;
  directionId: string;
  description: string;
  correctiveAction: string;
  fundingTypeId: string;
  categoryId: string;
  subcategoryId: string;
  responsiblePersonnelId: string;
  plannedDate: string;
  completedDate?: string;
  daysLeft: number;
  status: IncidentStatus;
  notes?: string;
  comments?: string;
  sourceType?: 'audit' | 'manual';
  sourceAuditId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Checklist {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  question: string;
  requiresComment: boolean;
  criticalItem: boolean;
}

export interface Audit {
  id: string;
  tenantId: string;
  checklistId: string;
  organizationId: string;
  auditorId: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  findings: AuditFinding[];
  auditorSignature?: string;
}

export interface AuditFinding {
  id: string;
  itemId: string;
  result: 'pass' | 'fail' | 'n/a';
  comment?: string;
  photo?: string;
}

export interface Task {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  type: 'corrective_action' | 'maintenance' | 'audit' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  completedAt?: string;
  sourceType?: 'incident' | 'audit' | 'checklist';
  sourceId?: string;
  incidentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  plannedAmount: number;
  year: number;
  color?: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface BudgetExpense {
  id: string;
  tenantId: string;
  categoryId: string;
  amount: number;
  description: string;
  expenseDate: string;
  documentNumber?: string;
  sourceType?: 'manual' | 'incident';
  sourceId?: string;
  createdBy: string;
  organizationId?: string;
  productionSiteId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  categoryId: string;
  categoryName: string;
  plannedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationRate: number;
  expensesCount: number;
}

export interface OrganizationBudgetPlan {
  id: string;
  tenantId: string;
  organizationId: string;
  year: number;
  totalPlannedAmount: number;
  status: 'draft' | 'approved' | 'archived';
  approvedBy?: string;
  approvedAt?: string;
  categories: OrganizationBudgetCategory[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationBudgetCategory {
  categoryId: string;
  plannedAmount: number;
  description?: string;
}

export interface Equipment {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  type: string;
  manufacturer?: string;
  serialNumber?: string;
  commissionDate?: string;
  status: 'operational' | 'maintenance' | 'repair' | 'decommissioned';
  nextMaintenanceDate?: string;
  nextExaminationDate?: string;
}

export interface Examination {
  id: string;
  tenantId: string;
  equipmentId: string;
  type: 'periodic' | 'extraordinary' | 'commissioning';
  scheduledDate: string;
  completedDate?: string;
  performedBy?: string;
  result: 'passed' | 'failed' | 'conditional';
  defects: Defect[];
  protocolNumber?: string;
}

export interface Defect {
  id: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'open' | 'fixed' | 'deferred';
}

export interface MaintenanceRecord {
  id: string;
  tenantId: string;
  equipmentId: string;
  type: 'preventive' | 'corrective' | 'emergency';
  scheduledDate: string;
  completedDate?: string;
  performedBy?: string;
  workDescription: string;
  partsUsed?: string;
  cost?: number;
  nextMaintenanceDate?: string;
}



export interface DashboardStats {
  totalEmployees: number;
  activeCertifications: number;
  expiringCertifications: number;
  overdueIncidents: number;
  upcomingTasks: number;
  budgetUtilization: number;
}

export type TrainingProgramStatus = 'active' | 'inactive' | 'archived';

export interface TrainingProgram {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  category: 'industrial_safety' | 'labor_safety' | 'energy_safety' | 'ecology' | 'professional' | 'other';
  durationHours: number;
  validityMonths: number;
  description?: string;
  competencyIds: string[];
  minStudents: number;
  maxStudents: number;
  cost: number;
  requiresExam: boolean;
  status: TrainingProgramStatus;
  createdAt: string;
  updatedAt: string;
}

export type TrainingGroupStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface TrainingGroup {
  id: string;
  tenantId: string;
  programId: string;
  name: string;
  startDate: string;
  endDate: string;
  schedule: string;
  instructorId?: string;
  locationId?: string;
  maxStudents: number;
  enrolledCount: number;
  status: TrainingGroupStatus;
  notes?: string;
  externalEnrollments?: ExternalEnrollment[];
  createdAt: string;
  updatedAt: string;
}

export interface ExternalEnrollment {
  tenantId: string;
  tenantName: string;
  personnelId: string;
  fullName: string;
  position: string;
  department?: string;
  requestId?: string;
}

export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface TrainingEnrollment {
  id: string;
  tenantId: string;
  groupId: string;
  studentId: string;
  enrolledDate: string;
  status: EnrollmentStatus;
  attendanceRate?: number;
  examScore?: number;
  certificateNumber?: string;
  certificateIssueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingLocation {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  capacity: number;
  equipment?: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface TrainingInstructor {
  id: string;
  tenantId: string;
  personnelId: string;
  specializations: string[];
  certifications: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface TrainingScheduleEntry {
  id: string;
  tenantId: string;
  groupId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  instructorId?: string;
  locationId?: string;
  type: 'lecture' | 'practice' | 'exam';
  completed: boolean;
}

export type OrganizationRequestStatus = 'new' | 'in_review' | 'approved' | 'rejected' | 'completed';

export interface OrganizationTrainingRequest {
  id: string;
  tenantId: string;
  fromTenantId?: string;
  fromTenantName?: string;
  organizationId: string;
  organizationName: string;
  programId: string;
  programName: string;
  requestDate: string;
  requestType: 'full_training' | 'sdo_access_only';
  studentsCount: number;
  students: {
    personnelId: string;
    fullName: string;
    position: string;
    department?: string;
  }[];
  contactPerson: string;
  contactPhone?: string;
  contactEmail?: string;
  preferredStartDate?: string;
  status: OrganizationRequestStatus;
  notes?: string;
  reviewNotes?: string;
  orderId?: string;
  responseDocuments?: string[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'critical' | 'warning' | 'info' | 'success';
export type NotificationSource = 'incident' | 'certification' | 'task' | 'audit' | 'system' | 'platform_news' | 'attestation' | 'catalog' | 'training_center';

export interface Notification {
  id: string;
  tenantId: string;
  userId?: string;
  type: NotificationType;
  source: NotificationSource;
  sourceId?: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export type DocumentCategory = 'user_guide' | 'regulatory' | 'organization';
export type DocumentStatus = 'draft' | 'published' | 'archived';

export type RegulatoryDocumentType = 
  | 'federal_law'
  | 'government_decree'
  | 'rostekhnadzor_order'
  | 'minenergo_order'
  | 'mchs_order'
  | 'minprirody_order'
  | 'minstroy_order'
  | 'mintrans_order'
  | 'mintrud_order';

export type FederalAuthority = 
  | 'rostekhnadzor'
  | 'minenergo'
  | 'mchs'
  | 'minprirody'
  | 'minstroy'
  | 'mintrans'
  | 'mintrud';

export const REGULATORY_DOCUMENT_TYPES: Record<RegulatoryDocumentType, string> = {
  federal_law: 'Федеральный закон',
  government_decree: 'Постановление Правительства РФ',
  rostekhnadzor_order: 'Приказ Ростехнадзора',
  minenergo_order: 'Приказ Минэнерго России',
  mchs_order: 'Приказ МЧС России',
  minprirody_order: 'Приказ Минприроды России',
  minstroy_order: 'Приказ Минстрой России',
  mintrans_order: 'Приказ Минтранс России',
  mintrud_order: 'Приказ Минтруд России',
};

export const FEDERAL_AUTHORITIES: Record<FederalAuthority, string> = {
  rostekhnadzor: 'Ростехнадзор',
  minenergo: 'Минэнерго России',
  mchs: 'МЧС России',
  minprirody: 'Минприроды России',
  minstroy: 'Минстрой России',
  mintrans: 'Минтранс России',
  mintrud: 'Минтруд России',
};

export interface DocumentVersion {
  versionNumber: string;
  createdAt: string;
  createdBy: string;
  changeDescription?: string;
  content?: string;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
}

export interface KnowledgeDocument {
  id: string;
  tenantId: string;
  category: DocumentCategory;
  title: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  tags?: string[];
  version?: string;
  author: string;
  status: DocumentStatus;
  viewsCount: number;
  downloadsCount: number;
  versions?: DocumentVersion[];
  regulatoryType?: RegulatoryDocumentType;
  documentNumber?: string;
  adoptionDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  regulatoryStatus?: 'active' | 'inactive';
  authority?: FederalAuthority;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type ContractorServiceType = 'full_training' | 'sdo_access_only' | 'certification' | 'consulting';

export interface OrganizationContractor {
  id: string;
  tenantId: string;
  contractorTenantId: string;
  contractorName: string;
  contractorInn?: string;
  type: 'training_center' | 'contractor' | 'supplier';
  services: ContractorServiceType[];
  contractNumber?: string;
  contractDate?: string;
  contractExpiryDate?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: 'active' | 'suspended' | 'terminated';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InterOrgDocumentType = 'training_request' | 'training_completion' | 'certificate' | 'sdo_access' | 'invoice' | 'contract' | 'report';
export type InterOrgDocumentStatus = 'draft' | 'sent' | 'received' | 'processed' | 'completed' | 'rejected';

export interface InterOrgDocument {
  id: string;
  fromTenantId: string;
  fromTenantName: string;
  toTenantId: string;
  toTenantName: string;
  documentType: InterOrgDocumentType;
  sourceId?: string;
  title: string;
  description?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  status: InterOrgDocumentStatus;
  metadata?: Record<string, any>;
  data?: any;
  sentAt: string;
  receivedAt?: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export interface TrainingCertificate {
  id: string;
  tenantId: string;
  externalPersonnelTenantId?: string;
  externalPersonnelId?: string;
  personnelId?: string;
  fullName: string;
  position?: string;
  certificateNumber: string;
  programId: string;
  programCode: string;
  programName: string;
  groupId?: string;
  issueDate: string;
  expiryDate: string;
  documentFile?: string;
  documentUrl?: string;
  status: 'active' | 'expired' | 'revoked';
  syncedToOrganization: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AttestationOrderType = 'rostekhnadzor' | 'internal_commission';
export type AttestationOrderStatus = 'draft' | 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface AttestationOrder {
  id: string;
  tenantId: string;
  organizationId: string;
  orderNumber: string;
  orderDate: string;
  attestationType: AttestationOrderType;
  certificationAreaCode: string;
  certificationAreaName: string;
  personnel: AttestationOrderPersonnel[];
  scheduledDate?: string;
  commissionMembers?: string[];
  location?: string;
  status: AttestationOrderStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttestationOrderPersonnel {
  personnelId: string;
  fullName: string;
  position: string;
  requiredDocuments: AttestationRequiredDocument[];
}

export interface AttestationRequiredDocument {
  documentType: 'training_certificate' | 'medical_certificate' | 'diploma' | 'work_experience' | 'other';
  documentName: string;
  certificateId?: string;
  fileId?: string;
  fileUrl?: string;
  status: 'missing' | 'attached' | 'verified';
}