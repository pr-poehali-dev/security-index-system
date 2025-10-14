import { FilterConfig } from '@/components/shared/DocumentFilters';
import { statusLabels } from '@/types/documentStatus';

export const documentsFilterConfig = (
  onExportExcel: () => void,
  sortBy: string,
  sortOrder: string,
  onSortByChange: (value: string) => void,
  onSortOrderToggle: () => void
): FilterConfig => ({
  search: {
    enabled: true,
    placeholder: 'Поиск по названию, номеру...',
  },
  filters: [
    {
      id: 'type',
      label: 'Тип документа',
      width: 'w-[200px]',
      options: [
        { value: 'all', label: 'Все типы' },
        { value: 'order', label: 'Приказы' },
        { value: 'attestation', label: 'Приказы на аттестацию' },
        { value: 'training', label: 'Обучения' },
      ],
    },
    {
      id: 'status',
      label: 'Статус',
      width: 'w-[180px]',
      options: [
        { value: 'all', label: 'Все статусы' },
        { value: 'draft', label: statusLabels.draft },
        { value: 'prepared', label: statusLabels.prepared },
        { value: 'approved', label: statusLabels.approved },
        { value: 'active', label: statusLabels.active },
        { value: 'completed', label: statusLabels.completed },
        { value: 'cancelled', label: statusLabels.cancelled },
      ],
    },
    {
      id: 'sortBy',
      label: 'Сортировка',
      width: 'w-[180px]',
      options: [
        { value: 'date', label: 'По дате' },
        { value: 'status', label: 'По статусу' },
        { value: 'type', label: 'По типу' },
      ],
    },
  ],
  actions: [
    {
      id: 'sort-order',
      label: sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию',
      icon: sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown',
      variant: 'outline',
      onClick: onSortOrderToggle,
    },
    {
      id: 'export',
      label: 'Excel',
      icon: 'Download',
      variant: 'outline',
      onClick: onExportExcel,
    },
  ],
});

export const ordersFilterConfig: FilterConfig = {
  search: {
    enabled: true,
    placeholder: 'Поиск по номеру, названию или сотрудникам...',
  },
  filters: [
    {
      id: 'type',
      label: 'Тип приказа',
      width: 'w-[200px]',
      options: [
        { value: 'all', label: 'Все типы' },
        { value: 'attestation', label: 'Аттестация' },
        { value: 'training', label: 'Обучение' },
        { value: 'suspension', label: 'Отстранение' },
        { value: 'sdo', label: 'СДО' },
        { value: 'training_center', label: 'Учебный центр' },
        { value: 'internal_attestation', label: 'ЕПТ организации' },
        { value: 'rostechnadzor', label: 'Ростехнадзор' },
      ],
    },
    {
      id: 'status',
      label: 'Статус',
      width: 'w-[180px]',
      options: [
        { value: 'all', label: 'Все статусы' },
        { value: 'draft', label: statusLabels.draft },
        { value: 'prepared', label: statusLabels.prepared },
        { value: 'approved', label: statusLabels.approved },
        { value: 'active', label: statusLabels.active },
        { value: 'completed', label: statusLabels.completed },
        { value: 'cancelled', label: statusLabels.cancelled },
      ],
    },
  ],
};

export const trainingsFilterConfig: FilterConfig = {
  search: {
    enabled: true,
    placeholder: 'Поиск по названию обучения...',
  },
  filters: [
    {
      id: 'status',
      label: 'Статус',
      width: 'w-[180px]',
      options: [
        { value: 'all', label: 'Все статусы' },
        { value: 'draft', label: statusLabels.draft },
        { value: 'approved', label: statusLabels.approved },
        { value: 'active', label: statusLabels.active },
        { value: 'completed', label: statusLabels.completed },
        { value: 'cancelled', label: statusLabels.cancelled },
      ],
    },
  ],
};

export const tasksFilterConfig = (
  departments: string[],
  selectedCount: number,
  onBulkCompleted: () => void,
  onBulkGenerateOrder?: (orderType: string) => void
): FilterConfig => ({
  search: {
    enabled: false,
  },
  filters: [
    {
      id: 'status',
      label: 'Статус',
      width: 'w-[200px]',
      options: [
        { value: 'all', label: 'Все статусы' },
        { value: 'pending', label: 'Ожидает' },
        { value: 'in_progress', label: 'В работе' },
        { value: 'completed', label: 'Выполнено' },
      ],
    },
    {
      id: 'priority',
      label: 'Приоритет',
      width: 'w-[200px]',
      options: [
        { value: 'all', label: 'Все приоритеты' },
        { value: 'critical', label: 'Критический' },
        { value: 'high', label: 'Высокий' },
        { value: 'medium', label: 'Средний' },
        { value: 'low', label: 'Низкий' },
      ],
    },
    {
      id: 'department',
      label: 'Подразделение',
      width: 'w-[200px]',
      options: [
        { value: 'all', label: 'Все подразделения' },
        ...departments.map((dep) => ({ value: dep, label: dep })),
      ],
    },
    {
      id: 'orderStatus',
      label: 'Наличие приказа',
      width: 'w-[200px]',
      options: [
        { value: 'all', label: 'Все задачи' },
        { value: 'with_order', label: 'С приказом' },
        { value: 'without_order', label: 'Без приказа' },
      ],
    },
  ],
  actions:
    selectedCount > 0
      ? [
          {
            id: 'bulk-complete',
            label: 'Завершить выбранные',
            icon: 'CheckCircle2',
            variant: 'outline',
            onClick: onBulkCompleted,
          },
        ]
      : [],
});

export const calendarFilterConfig: FilterConfig = {
  search: {
    enabled: false,
  },
  filters: [
    {
      id: 'type',
      label: 'Тип события',
      width: 'w-[200px]',
      options: [
        { value: 'all', label: 'Все типы' },
        { value: 'certification', label: 'Аттестация' },
        { value: 'training', label: 'Обучение' },
        { value: 'medical', label: 'Медосмотр' },
      ],
    },
    {
      id: 'status',
      label: 'Статус',
      width: 'w-[180px]',
      options: [
        { value: 'all', label: 'Все статусы' },
        { value: 'valid', label: 'Действует' },
        { value: 'expiring', label: 'Истекает' },
        { value: 'expired', label: 'Истекло' },
      ],
    },
  ],
};
