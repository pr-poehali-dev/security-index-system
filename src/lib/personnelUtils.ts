import type { Person, Position, Personnel } from '@/types';

export function getFullName(person: Person | undefined): string {
  if (!person) return '—';
  return `${person.lastName} ${person.firstName} ${person.middleName || ''}`.trim();
}

export function getShortName(person: Person | undefined): string {
  if (!person) return '—';
  const firstInitial = person.firstName.charAt(0).toUpperCase();
  const middleInitial = person.middleName ? person.middleName.charAt(0).toUpperCase() : '';
  return `${person.lastName} ${firstInitial}.${middleInitial ? ` ${middleInitial}.` : ''}`.trim();
}

export function getPositionName(position: Position | undefined): string {
  if (!position) return '—';
  return position.name;
}

export function getPersonnelFullInfo(
  personnel: Personnel | undefined,
  people: Person[],
  positions: Position[]
): { fullName: string; position: string; person?: Person; positionObj?: Position } {
  if (!personnel) {
    return { fullName: '—', position: '—' };
  }

  const person = people.find((p) => p.id === personnel.personId);
  const position = positions.find((p) => p.id === personnel.positionId);

  return {
    fullName: getFullName(person),
    position: getPositionName(position),
    person,
    positionObj: position
  };
}

export function getCertificationStatus(expiryDate: string): {
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
} {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: 'valid' | 'expiring_soon' | 'expired';
  if (daysLeft < 0) {
    status = 'expired';
  } else if (daysLeft <= 90) {
    status = 'expiring_soon';
  } else {
    status = 'valid';
  }

  return { status, daysLeft };
}
