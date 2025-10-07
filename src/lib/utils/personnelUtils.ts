import type { Personnel, Person, Position } from '@/types';

export interface PersonnelFullInfo {
  fullName: string;
  position: string;
  personId: string;
  positionId: string;
}

export function getPersonnelFullInfo(
  personnel: Personnel,
  people: Person[],
  positions: Position[]
): PersonnelFullInfo {
  const person = people.find(p => p.id === personnel.personId);
  const position = positions.find(p => p.id === personnel.positionId);

  return {
    fullName: person ? `${person.lastName} ${person.firstName} ${person.middleName || ''}`.trim() : '—',
    position: position?.name || '—',
    personId: personnel.personId,
    positionId: personnel.positionId
  };
}

export function getCertificationStatus(expiryDate: string): {
  status: 'valid' | 'expiring' | 'expired';
  daysLeft: number;
} {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let status: 'valid' | 'expiring' | 'expired';
  
  if (daysLeft < 0) {
    status = 'expired';
  } else if (daysLeft <= 30) {
    status = 'expiring';
  } else {
    status = 'valid';
  }

  return { status, daysLeft };
}