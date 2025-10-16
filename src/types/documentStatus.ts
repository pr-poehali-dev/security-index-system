export enum ChecklistDocumentStatus {
  DRAFT = 'draft',
  PREPARED = 'prepared',
  APPROVED = 'approved',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export type DocumentStatus = ChecklistDocumentStatus;

export const statusLabels: Record<ChecklistDocumentStatus, string> = {
  [ChecklistDocumentStatus.DRAFT]: 'Черновик',
  [ChecklistDocumentStatus.PREPARED]: 'Подготовлен',
  [ChecklistDocumentStatus.APPROVED]: 'Согласован',
  [ChecklistDocumentStatus.ACTIVE]: 'Активен',
  [ChecklistDocumentStatus.COMPLETED]: 'Выполнен',
  [ChecklistDocumentStatus.CANCELLED]: 'Отменён'
};

export const statusColors: Record<ChecklistDocumentStatus, string> = {
  [ChecklistDocumentStatus.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  [ChecklistDocumentStatus.PREPARED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [ChecklistDocumentStatus.APPROVED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [ChecklistDocumentStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [ChecklistDocumentStatus.COMPLETED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  [ChecklistDocumentStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export const statusTransitions: Record<ChecklistDocumentStatus, ChecklistDocumentStatus[]> = {
  [ChecklistDocumentStatus.DRAFT]: [ChecklistDocumentStatus.PREPARED, ChecklistDocumentStatus.CANCELLED],
  [ChecklistDocumentStatus.PREPARED]: [ChecklistDocumentStatus.APPROVED, ChecklistDocumentStatus.DRAFT, ChecklistDocumentStatus.CANCELLED],
  [ChecklistDocumentStatus.APPROVED]: [ChecklistDocumentStatus.ACTIVE, ChecklistDocumentStatus.PREPARED, ChecklistDocumentStatus.CANCELLED],
  [ChecklistDocumentStatus.ACTIVE]: [ChecklistDocumentStatus.COMPLETED, ChecklistDocumentStatus.CANCELLED],
  [ChecklistDocumentStatus.COMPLETED]: [],
  [ChecklistDocumentStatus.CANCELLED]: [ChecklistDocumentStatus.DRAFT]
};

export function canTransitionTo(from: ChecklistDocumentStatus, to: ChecklistDocumentStatus): boolean {
  return statusTransitions[from]?.includes(to) ?? false;
}

export function getNextStatuses(current: ChecklistDocumentStatus): ChecklistDocumentStatus[] {
  return statusTransitions[current] ?? [];
}

export function mapLegacyStatus(legacyStatus: string): ChecklistDocumentStatus {
  const mapping: Record<string, ChecklistDocumentStatus> = {
    'draft': ChecklistDocumentStatus.DRAFT,
    'prepared': ChecklistDocumentStatus.PREPARED,
    'approved': ChecklistDocumentStatus.APPROVED,
    'active': ChecklistDocumentStatus.ACTIVE,
    'completed': ChecklistDocumentStatus.COMPLETED,
    'cancelled': ChecklistDocumentStatus.CANCELLED,
    'planned': ChecklistDocumentStatus.APPROVED,
    'ongoing': ChecklistDocumentStatus.ACTIVE,
    'in_progress': ChecklistDocumentStatus.ACTIVE,
    'pending': ChecklistDocumentStatus.PREPARED
  };
  
  return mapping[legacyStatus] || ChecklistDocumentStatus.DRAFT;
}