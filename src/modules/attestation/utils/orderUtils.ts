export const getOrderTypeLabel = (type: string) => {
  switch (type) {
    case 'attestation': return 'Аттестация';
    case 'training': return 'Обучение';
    case 'suspension': return 'Отстранение';
    case 'sdo': return 'СДО';
    case 'training_center': return 'Учебный центр';
    case 'internal_attestation': return 'ЕПТ организации';
    case 'rostechnadzor': return 'Ростехнадзор';
    default: return type;
  }
};

export const getOrderTypeIcon = (type: string) => {
  switch (type) {
    case 'attestation': return 'Award';
    case 'training': return 'GraduationCap';
    case 'suspension': return 'Ban';
    case 'sdo': return 'Monitor';
    case 'training_center': return 'Building2';
    case 'internal_attestation': return 'ClipboardCheck';
    case 'rostechnadzor': return 'Shield';
    default: return 'FileText';
  }
};

export const getOrderTypeColor = (type: string) => {
  switch (type) {
    case 'attestation': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    case 'training': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
    case 'suspension': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    case 'sdo': return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30';
    case 'training_center': return 'text-violet-600 bg-violet-100 dark:bg-violet-900/30';
    case 'internal_attestation': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30';
    case 'rostechnadzor': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft': return 'Черновик';
    case 'prepared': return 'Подготовлен';
    case 'approved': return 'Согласован';
    case 'active': return 'Активен';
    case 'completed': return 'Исполнен';
    case 'cancelled': return 'Отменен';
    case 'planned': return 'Запланировано';
    case 'in_progress': return 'В процессе';
    default: return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    case 'prepared': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    case 'approved': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
    case 'active': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    case 'completed': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
    case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    case 'planned': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    case 'in_progress': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  }
};
