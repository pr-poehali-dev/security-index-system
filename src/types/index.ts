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
  | 'budget';

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

export interface Personnel {
  id: string;
  tenantId: string;
  organizationId?: string;
  fullName: string;
  position: string;
  email?: string;
  phone?: string;
  role: 'Auditor' | 'Manager' | 'Director';
  status: 'active' | 'inactive';
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

export interface DashboardStats {
  totalEmployees: number;
  activeCertifications: number;
  expiringCertifications: number;
  overdueIncidents: number;
  upcomingTasks: number;
  budgetUtilization: number;
}