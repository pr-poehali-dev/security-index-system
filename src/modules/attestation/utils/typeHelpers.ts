/**
 * Централизованные helper-функции для работы с типами документов
 */

// Типы приказов
export type OrderType = 
  | 'attestation' 
  | 'training' 
  | 'suspension' 
  | 'sdo' 
  | 'training_center' 
  | 'internal_attestation' 
  | 'rostechnadzor'
  | 'lms'
  | 'internal';

// Типы задач
export type TaskType = 'reminder_90' | 'reminder_60' | 'reminder_30' | 'expired';

// Типы обучений
export type TrainingType = 'initial' | 'periodic' | 'extraordinary';

/**
 * Получить метку типа приказа на русском
 */
export const getOrderTypeLabel = (type: string): string => {
  switch (type) {
    case 'attestation': return 'Аттестация';
    case 'training': return 'Обучение';
    case 'suspension': return 'Отстранение';
    case 'sdo': return 'СДО';
    case 'lms': return 'СДО';
    case 'training_center': return 'Учебный центр';
    case 'internal_attestation': return 'ЕПТ организации';
    case 'internal': return 'Внутренний';
    case 'rostechnadzor': return 'Ростехнадзор';
    default: return type;
  }
};

/**
 * Получить иконку для типа приказа
 */
export const getOrderTypeIcon = (type: string): string => {
  switch (type) {
    case 'attestation': return 'Award';
    case 'training': return 'GraduationCap';
    case 'suspension': return 'Ban';
    case 'sdo': return 'Monitor';
    case 'lms': return 'Monitor';
    case 'training_center': return 'Building2';
    case 'internal_attestation': return 'ClipboardCheck';
    case 'internal': return 'FileText';
    case 'rostechnadzor': return 'Shield';
    default: return 'FileText';
  }
};

/**
 * Получить цветовые классы для типа приказа
 */
export const getOrderTypeColor = (type: string): string => {
  switch (type) {
    case 'attestation': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    case 'training': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
    case 'suspension': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    case 'sdo': return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30';
    case 'lms': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
    case 'training_center': return 'text-violet-600 bg-violet-100 dark:bg-violet-900/30';
    case 'internal_attestation': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30';
    case 'internal': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    case 'rostechnadzor': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  }
};

/**
 * Получить метку типа задачи на русском
 */
export const getTaskTypeLabel = (type: string): string => {
  switch (type) {
    case 'reminder_90': return 'Напоминание (90 дн.)';
    case 'reminder_60': return 'Напоминание (60 дн.)';
    case 'reminder_30': return 'Напоминание (30 дн.)';
    case 'expired': return 'Просрочено';
    default: return type;
  }
};

/**
 * Получить иконку для типа задачи
 */
export const getTaskTypeIcon = (type: string): string => {
  switch (type) {
    case 'reminder_90': return 'Bell';
    case 'reminder_60': return 'AlertCircle';
    case 'reminder_30': return 'AlertTriangle';
    case 'expired': return 'XCircle';
    default: return 'Circle';
  }
};

/**
 * Получить метку типа обучения на русском
 */
export const getTrainingTypeLabel = (type: string): string => {
  switch (type) {
    case 'initial': return 'Первичное';
    case 'periodic': return 'Периодическое';
    case 'extraordinary': return 'Внеочередное';
    default: return type;
  }
};

/**
 * Получить цветовые классы для типа обучения
 */
export const getTrainingTypeColor = (type: string): string => {
  switch (type) {
    case 'initial': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
    case 'periodic': return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
    case 'extraordinary': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';
  }
};