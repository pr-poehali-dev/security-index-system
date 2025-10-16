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

// Re-export from centralized helpers
export { 
  getCertificationStatusColor as getStatusColor,
  getCertificationStatusLabel as getStatusLabel,
  getCertificationStatusIcon as getStatusIcon
} from './statusHelpers';