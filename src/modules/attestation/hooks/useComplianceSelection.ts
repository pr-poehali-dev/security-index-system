import { useState, useMemo } from 'react';
import { getCategoryForArea } from '@/stores/mockData/certificationAreas';

interface ComplianceData {
  personnelId: string;
  personnelName: string;
  position: string;
  department: string;
  missingCertifications: string[];
}

export function useComplianceSelection(filteredData: ComplianceData[]) {
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<Set<string>>(new Set());

  const handleSelectPersonnel = (personnelId: string, checked: boolean) => {
    const newSelected = new Set(selectedPersonnelIds);
    if (checked) {
      newSelected.add(personnelId);
    } else {
      newSelected.delete(personnelId);
    }
    setSelectedPersonnelIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPersonnelIds(new Set(filteredData.map(item => item.personnelId)));
    } else {
      setSelectedPersonnelIds(new Set());
    }
  };

  const clearSelection = () => {
    setSelectedPersonnelIds(new Set());
  };

  const selectedEmployees = useMemo(() => {
    return filteredData
      .filter(item => selectedPersonnelIds.has(item.personnelId))
      .map(item => ({
        id: item.personnelId,
        name: item.personnelName,
        position: item.position,
        department: item.department,
        organization: '—',
        certifications: item.missingCertifications.map(area => ({
          id: `missing-${area}`,
          category: getCategoryForArea(area),
          area: area,
          issueDate: '',
          expiryDate: new Date(Date.now() - 86400000).toISOString(),
          protocolNumber: '',
          protocolDate: '',
          verified: false,
          verifiedDate: undefined,
          status: 'expired' as const,
          daysLeft: -1
        }))
      }));
  }, [filteredData, selectedPersonnelIds]);

  return {
    selectedPersonnelIds,
    handleSelectPersonnel,
    handleSelectAll,
    clearSelection,
    selectedEmployees
  };
}
