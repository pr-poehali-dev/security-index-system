export function formatDate(date: string | Date, locale: string = 'ru'): string {
  return new Date(date).toLocaleDateString(locale);
}

export function formatDateTime(date: string | Date, locale: string = 'ru'): string {
  return new Date(date).toLocaleString(locale);
}

export function getDaysDifference(date1: string | Date, date2: string | Date = new Date()): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

export function isDateExpired(date: string | Date): boolean {
  return new Date(date) < new Date();
}

export function isDateExpiringSoon(date: string | Date, daysThreshold: number = 30): boolean {
  const days = getDaysDifference(date);
  return days > 0 && days <= daysThreshold;
}

export function addDays(date: string | Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getISODate(date?: Date): string {
  return (date || new Date()).toISOString().split('T')[0];
}
