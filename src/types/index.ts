export type UserRole = 'SuperAdmin' | 'TenantAdmin' | 'Auditor' | 'Manager' | 'Director';

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
  | 'settings';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
  availableModules: ModuleType[];
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

export interface Personnel {
  id: string;
  tenantId: string;
  organizationId?: string;
  departmentId?: string;
  fullName: string;
  position: string;
  email?: string;
  phone?: string;
  role: 'Auditor' | 'Manager' | 'Director';
  status: 'active' | 'dismissed';
  hireDate?: string;
  dismissalDate?: string;
  createdAt: string;
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
  position: string;
  requiredAreas: CompetencyAreaRequirement[];
  createdAt: string;
  updatedAt: string;
}

export interface CompetencyAreaRequirement {
  category: 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology';
  areas: string[];
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

export interface Incident {
  id: string;
  tenantId: string;
  organizationId: string;
  title: string;
  description: string;
  type: 'accident' | 'near_miss' | 'violation' | 'equipment_failure';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  assignedTo?: string;
  occurredAt: string;
  reportedAt: string;
  resolvedAt?: string;
  rootCause?: string;
  correctiveActions?: string;
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

export interface Budget {
  id: string;
  tenantId: string;
  year: number;
  category: 'attestation' | 'maintenance' | 'equipment' | 'training' | 'other';
  planned: number;
  actual: number;
  quarter: 1 | 2 | 3 | 4;
}

export interface DashboardStats {
  totalEmployees: number;
  activeCertifications: number;
  expiringCertifications: number;
  overdueIncidents: number;
  upcomingTasks: number;
  budgetUtilization: number;
}