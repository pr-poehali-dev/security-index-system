/**
 * Централизованные helper-функции для работы со статусами
 */

// Статусы приказов
export type OrderStatus = 'draft' | 'prepared' | 'approved' | 'active' | 'completed' | 'cancelled' | 'planned' | 'in_progress';

// Статусы задач
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// Статусы сертификатов/сотрудников
export type CertificationStatus = 'valid' | 'expiring_soon' | 'expired';

// Статусы обучений
export type TrainingStatus = 'planned' | 'ongoing' | 'in_progress' | 'completed' | 'cancelled';

// Статусы уведомлений
export type NotificationStatus = 'sent' | 'failed' | 'pending';

/**
 * Получить метку статуса приказа на русском
 */
export const getOrderStatusLabel = (status: string): string => {
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

/**
 * Получить цветовые классы для статуса приказа
 */
export const getOrderStatusColor = (status: string): string => {
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

/**
 * Получить метку статуса задачи на русском
 */
export const getTaskStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending': return 'Ожидает';
    case 'in_progress': return 'В работе';
    case 'completed': return 'Выполнено';
    default: return status;
  }
};

/**
 * Получить вариант Badge для статуса задачи
 */
export const getTaskStatusColor = (status: string): 'secondary' | 'default' | 'outline' => {
  switch (status) {
    case 'pending': return 'secondary';
    case 'in_progress': return 'default';
    case 'completed': return 'outline';
    default: return 'secondary';
  }
};

/**
 * Получить метку статуса сертификата на русском
 */
export const getCertificationStatusLabel = (status: string): string => {
  switch (status) {
    case 'valid': return 'Действующие';
    case 'expiring_soon': return 'Истекают';
    case 'expired': return 'Просрочены';
    default: return status;
  }
};

/**
 * Получить цветовые классы для статуса сертификата
 */
export const getCertificationStatusColor = (status: string): string => {
  switch (status) {
    case 'valid': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
    case 'expiring_soon': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
    case 'expired': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  }
};

/**
 * Получить иконку для статуса сертификата
 */
export const getCertificationStatusIcon = (status: string): string => {
  switch (status) {
    case 'valid': return 'CheckCircle2';
    case 'expiring_soon': return 'AlertTriangle';
    case 'expired': return 'XCircle';
    default: return 'Circle';
  }
};

/**
 * Получить метку приоритета на русском
 */
export const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case 'critical': return 'Критический';
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return priority;
  }
};

/**
 * Получить цветовые классы для приоритета
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300';
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300';
    case 'low': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

/**
 * Получить метку статуса обучения на русском
 */
export const getTrainingStatusLabel = (status: string): string => {
  switch (status) {
    case 'planned': return 'Запланировано';
    case 'ongoing': return 'Идет';
    case 'in_progress': return 'В процессе';
    case 'completed': return 'Завершено';
    case 'cancelled': return 'Отменено';
    default: return status;
  }
};

/**
 * Получить цветовые классы для статуса обучения
 */
export const getTrainingStatusColor = (status: string): string => {
  switch (status) {
    case 'planned': return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';
    case 'ongoing': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
    case 'in_progress': return 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400';
    case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';
  }
};

/**
 * Получить метку статуса уведомления на русском
 */
export const getNotificationStatusLabel = (status: string): string => {
  switch (status) {
    case 'sent': return 'Отправлено';
    case 'failed': return 'Ошибка';
    case 'pending': return 'В очереди';
    default: return status;
  }
};

/**
 * Получить цветовые классы для статуса уведомления
 */
export const getNotificationStatusColor = (status: string): string => {
  switch (status) {
    case 'sent': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
    case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    case 'pending': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  }
};