import { useMemo } from 'react';
import { getPersonnelFullInfo, getCertificationStatus } from '@/lib/utils/personnelUtils';
import type { Personnel, Person, Position, Department, Competency, Certification } from '@/types';

interface ComplianceData {
  personnelId: string;
  personnelName: string;
  position: string;
  department: string;
  requiredCertifications: string[];
  actualCertifications: string[];
  expiringCertifications: string[];
  missingCertifications: string[];
  compliancePercent: number;
}

interface UseComplianceCalculationsProps {
  personnel: Personnel[];
  people: Person[];
  positions: Position[];
  departments: Department[];
  competencies: Competency[];
  certifications: Certification[];
}

export function useComplianceCalculations({
  personnel,
  people,
  positions,
  departments,
  competencies,
  certifications
}: UseComplianceCalculationsProps) {
  const complianceData = useMemo((): ComplianceData[] => {
    if (!Array.isArray(personnel) || personnel.length === 0) {
      return [];
    }

    if (!Array.isArray(people)) return [];
    if (!Array.isArray(positions)) return [];
    if (!Array.isArray(departments)) return [];
    if (!Array.isArray(competencies)) return [];
    if (!Array.isArray(certifications)) return [];

    return personnel.map(p => {
      const info = getPersonnelFullInfo(p, people, positions);
      const dept = departments.find(d => d.id === p.departmentId);
      
      const competency = competencies.find(c => c.positionId === p.positionId);
      const requiredAreas = competency?.requiredAreas?.flatMap(ra => ra.areas) || [];
      
      const personnelCerts = certifications.filter(c => c.personnelId === p.id);
      
      const validCerts = personnelCerts.filter(c => {
        const { status } = getCertificationStatus(c.expiryDate);
        return status === 'valid' || status === 'expiring_soon';
      });
      
      const actualAreas = validCerts.map(c => c.area);
      
      const expiringAreas = personnelCerts
        .filter(c => {
          const { status } = getCertificationStatus(c.expiryDate);
          return status === 'expiring_soon';
        })
        .map(c => c.area);
      
      const missingAreas = requiredAreas.filter(ra => !actualAreas.includes(ra));
      
      const validRequiredAreas = requiredAreas.filter(ra => 
        actualAreas.includes(ra) && !expiringAreas.includes(ra)
      );
      
      const compliancePercent = requiredAreas.length > 0 
        ? Math.round((validRequiredAreas.length / requiredAreas.length) * 100)
        : 0;

      return {
        personnelId: p.id,
        personnelName: info.fullName,
        position: info.position,
        department: dept?.name || '—',
        requiredCertifications: requiredAreas,
        actualCertifications: actualAreas,
        expiringCertifications: expiringAreas,
        missingCertifications: missingAreas,
        compliancePercent
      };
    });
  }, [personnel, people, positions, departments, competencies, certifications]);

  const stats = useMemo(() => ({
    totalEmployees: complianceData.length,
    fullCompliance: complianceData.filter(d => d.compliancePercent === 100).length,
    partialCompliance: complianceData.filter(d => d.compliancePercent > 0 && d.compliancePercent < 100).length,
    nonCompliant: complianceData.filter(d => d.compliancePercent === 0).length,
    avgCompliance: complianceData.length > 0 
      ? Math.round(complianceData.reduce((acc, d) => acc + d.compliancePercent, 0) / complianceData.length)
      : 0
  }), [complianceData]);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(complianceData.map(d => d.department))).filter(d => d !== '—');
  }, [complianceData]);

  return { complianceData, stats, uniqueDepartments };
}