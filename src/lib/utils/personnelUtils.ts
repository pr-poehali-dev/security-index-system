// src/lib/utils/personnelUtils.ts
import type { Personnel, Person, Position } from '@/types';

export interface PersonnelFullInfo {
  fullName: string;
  position: string;
  personId: string;
  positionId: string;
  person?: Person;
  positionObj?: Position;
}

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
): PersonnelFullInfo {
  if (!personnel) {
    return { 
      fullName: '—', 
      position: '—',
      personId: '',
      positionId: ''
    };
  }

  const person = people.find(p => p.id === personnel.personId);
  const position = positions.find(p => p.id === personnel.positionId);

  return {
    fullName: getFullName(person),
    position: getPositionName(position),
    personId: personnel.personId,
    positionId: personnel.positionId,
    person,
    positionObj: position
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