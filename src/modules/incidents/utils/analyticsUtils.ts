import type { IncidentStatus } from '@/types';

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  created: '#94a3b8',
  in_progress: '#3b82f6',
  awaiting: '#f59e0b',
  overdue: '#ef4444',
  completed: '#10b981',
  completed_late: '#6366f1',
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  created: 'Создано',
  in_progress: 'В работе',
  awaiting: 'Ожидает',
  overdue: 'Просрочено',
  completed: 'Исполнено',
  completed_late: 'С опозданием',
};
