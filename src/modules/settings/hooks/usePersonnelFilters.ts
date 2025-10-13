import { useMemo } from 'react';
import type { Personnel } from '@/types';

interface PersonnelWithInfo extends Personnel {
  fullName: string;
  positionName: string;
  email?: string;
  phone?: string;
}

interface UsePersonnelFiltersProps {
  personnel: PersonnelWithInfo[];
  searchTerm: string;
  filterOrg: string;
  filterStatus: string;
  filterType: string;
}

export function usePersonnelFilters({
  personnel,
  searchTerm,
  filterOrg,
  filterStatus,
  filterType
}: UsePersonnelFiltersProps) {
  return useMemo(() => {
    return personnel.filter((person) => {
      const matchesSearch = 
        person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.phone?.includes(searchTerm);

      const matchesOrg = filterOrg === 'all' || person.organizationId === filterOrg;
      const matchesStatus = filterStatus === 'all' || person.status === filterStatus;
      const matchesType = filterType === 'all' || person.personnelType === filterType;

      return matchesSearch && matchesOrg && matchesStatus && matchesType;
    });
  }, [personnel, searchTerm, filterOrg, filterStatus, filterType]);
}
