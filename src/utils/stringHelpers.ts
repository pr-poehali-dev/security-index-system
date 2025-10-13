export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
}

export function pluralize(count: number, singular: string, plural: string, genitivePlural?: string): string {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return genitivePlural || plural;
  }

  if (lastDigit === 1) {
    return singular;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return plural;
  }

  return genitivePlural || plural;
}

export function searchInString(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}
