export interface Task {
  id: string;
  type: 'reminder_90' | 'reminder_60' | 'reminder_30' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  employeeName: string;
  employeeId: string;
  employeePosition: string;
  department: string;
  category: string;
  area: string;
  expiryDate: string;
  daysLeft: number;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  completedAt?: string;
}
