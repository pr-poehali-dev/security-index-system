import { useMemo } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';
import type { Personnel } from '@/types';

export function usePersonnelData(tenantId: string) {
  const allPersonnel = useSettingsStore((state) => state.personnel);
  const people = useSettingsStore((state) => state.people);
  const positions = useSettingsStore((state) => state.positions);
  
  const tenantPersonnel = useMemo(() => 
    allPersonnel.filter(p => p.tenantId === tenantId)
  , [allPersonnel, tenantId]);

  const personnelWithInfo = useMemo(() => {
    return tenantPersonnel.map(personnel => {
      const info = getPersonnelFullInfo(personnel, people, positions);
      const person = people.find(p => p.id === personnel.personId);
      return {
        ...personnel,
        fullName: info.fullName,
        positionName: info.position,
        email: person?.email,
        phone: person?.phone
      };
    });
  }, [tenantPersonnel, people, positions]);

  return { personnelWithInfo, totalCount: tenantPersonnel.length };
}