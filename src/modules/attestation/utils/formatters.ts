/**
 * Централизованные функции форматирования данных
 */

/**
 * Форматировать дату в русском формате
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Форматировать дату с временем
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Форматировать дату для отображения месяца
 */
export const formatMonthYear = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Форматировать количество дней
 */
export const formatDaysLeft = (days: number): string => {
  if (days < 0) return 'Просрочено';
  if (days === 0) return 'Сегодня';
  if (days === 1) return '1 день';
  if (days <= 4) return `${days} дня`;
  if (days <= 20) return `${days} дней`;
  
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return `${days} дней`;
  if (lastDigit === 1) return `${days} день`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${days} дня`;
  
  return `${days} дней`;
};

/**
 * Форматировать количество человек
 */
export const formatPersonCount = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return `${count} человек`;
  if (lastDigit === 1) return `${count} человек`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${count} человека`;
  
  return `${count} человек`;
};

/**
 * Форматировать номер приказа
 */
export const formatOrderNumber = (number: string | number): string => {
  return `№${number}`;
};

/**
 * Форматировать валюту (рубли)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};