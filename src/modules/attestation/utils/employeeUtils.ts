export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  organization: string;
  certifications: Array<{
    id: string;
    category: string;
    area: string;
    issueDate: string;
    expiryDate: string;
    protocolNumber?: string;
    protocolDate?: string;
    verified?: boolean;
    verifiedDate?: string;
    status: 'valid' | 'expiring_soon' | 'expired';
    daysLeft: number;
  }>;
}

export const getEmployeeStatus = (employee: Employee): 'valid' | 'expiring_soon' | 'expired' => {
  const hasExpired = employee.certifications.some(c => c.status === 'expired');
  if (hasExpired) return 'expired';
  
  const hasExpiring = employee.certifications.some(c => c.status === 'expiring_soon');
  if (hasExpiring) return 'expiring_soon';
  
  return 'valid';
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'valid': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
    case 'expiring_soon': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
    case 'expired': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'valid': return 'Действующие';
    case 'expiring_soon': return 'Истекают';
    case 'expired': return 'Просрочены';
    default: return status;
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'valid': return 'CheckCircle2';
    case 'expiring_soon': return 'AlertTriangle';
    case 'expired': return 'XCircle';
    default: return 'Circle';
  }
};
