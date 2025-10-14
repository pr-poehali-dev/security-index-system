export enum DocumentStatus {
  DRAFT = 'draft',
  PREPARED = 'prepared',
  APPROVED = 'approved',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export const statusLabels: Record<DocumentStatus, string> = {
  [DocumentStatus.DRAFT]: 'Черновик',
  [DocumentStatus.PREPARED]: 'Подготовлен',
  [DocumentStatus.APPROVED]: 'Согласован',
  [DocumentStatus.ACTIVE]: 'Активен',
  [DocumentStatus.COMPLETED]: 'Выполнен',
  [DocumentStatus.CANCELLED]: 'Отменён'
};

export const statusColors: Record<DocumentStatus, string> = {
  [DocumentStatus.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  [DocumentStatus.PREPARED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [DocumentStatus.APPROVED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [DocumentStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [DocumentStatus.COMPLETED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  [DocumentStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export const statusTransitions: Record<DocumentStatus, DocumentStatus[]> = {
  [DocumentStatus.DRAFT]: [DocumentStatus.PREPARED, DocumentStatus.CANCELLED],
  [DocumentStatus.PREPARED]: [DocumentStatus.APPROVED, DocumentStatus.DRAFT, DocumentStatus.CANCELLED],
  [DocumentStatus.APPROVED]: [DocumentStatus.ACTIVE, DocumentStatus.PREPARED, DocumentStatus.CANCELLED],
  [DocumentStatus.ACTIVE]: [DocumentStatus.COMPLETED, DocumentStatus.CANCELLED],
  [DocumentStatus.COMPLETED]: [],
  [DocumentStatus.CANCELLED]: [DocumentStatus.DRAFT]
};

export function canTransitionTo(from: DocumentStatus, to: DocumentStatus): boolean {
  return statusTransitions[from]?.includes(to) ?? false;
}

export function getNextStatuses(current: DocumentStatus): DocumentStatus[] {
  return statusTransitions[current] ?? [];
}

export function mapLegacyStatus(legacyStatus: string): DocumentStatus {
  const mapping: Record<string, DocumentStatus> = {
    'draft': DocumentStatus.DRAFT,
    'prepared': DocumentStatus.PREPARED,
    'approved': DocumentStatus.APPROVED,
    'active': DocumentStatus.ACTIVE,
    'completed': DocumentStatus.COMPLETED,
    'cancelled': DocumentStatus.CANCELLED,
    'planned': DocumentStatus.APPROVED,
    'ongoing': DocumentStatus.ACTIVE,
    'in_progress': DocumentStatus.ACTIVE,
    'pending': DocumentStatus.PREPARED
  };
  
  return mapping[legacyStatus] || DocumentStatus.DRAFT;
}
