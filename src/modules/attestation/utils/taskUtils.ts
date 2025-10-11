export const getTaskTypeLabel = (type: string) => {
  switch (type) {
    case 'reminder_90': return 'Напоминание (90 дн.)';
    case 'reminder_60': return 'Напоминание (60 дн.)';
    case 'reminder_30': return 'Напоминание (30 дн.)';
    case 'expired': return 'Просрочено';
    default: return type;
  }
};

export const getTaskTypeIcon = (type: string) => {
  switch (type) {
    case 'reminder_90': return 'Bell';
    case 'reminder_60': return 'AlertCircle';
    case 'reminder_30': return 'AlertTriangle';
    case 'expired': return 'XCircle';
    default: return 'Circle';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300';
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300';
    case 'low': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

export const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'critical': return 'Критический';
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return priority;
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Ожидает';
    case 'in_progress': return 'В работе';
    case 'completed': return 'Выполнено';
    default: return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'secondary';
    case 'in_progress': return 'default';
    case 'completed': return 'outline';
    default: return 'secondary';
  }
};
