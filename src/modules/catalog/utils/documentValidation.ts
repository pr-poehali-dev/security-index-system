export function isDocumentExpired(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

export function isDocumentExpiringSoon(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  const daysUntilExpiry = Math.floor(
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
}

export function getDocumentExpiryDays(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  return Math.floor(
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}
