// src/lib/competencyAnalysis.ts
import type { 
  Personnel, 
  CompetencyMatrix, 
  Organization, 
  GapAnalysis, 
  CompetencyGapReport,
  CompetencyAreaRequirement,
  Person,
  Position
} from '@/types';
import { getPersonnelFullInfo } from './utils/personnelUtils';

export function analyzePersonnelCompetencies(
  personnel: Personnel[],
  competencies: CompetencyMatrix[],
  organizations: Organization[],
  people: Person[],
  positions: Position[]
): CompetencyGapReport {
  const gaps: GapAnalysis[] = [];

  personnel.forEach((person) => {
    if (person.status !== 'active' || !person.organizationId) return;

    const org = organizations.find((o) => o.id === person.organizationId);
    if (!org) return;

    const info = getPersonnelFullInfo(person, people, positions);
    const competency = competencies.find(
      (c) => c.organizationId === person.organizationId && c.position === info.position
    );

    if (!competency) {
      gaps.push({
        employeeId: person.id,
        fullName: info.fullName,
        position: info.position,
        organizationId: person.organizationId,
        organizationName: org.name,
        requiredAreas: [],
        missingAreas: [],
        hasAllRequired: false,
        completionRate: 0,
        riskLevel: 'low',
        lastChecked: new Date().toISOString()
      });
      return;
    }

    const missingAreas: CompetencyAreaRequirement[] = competency.requiredAreas.map((req) => ({
      category: req.category,
      areas: req.areas
    }));

    const totalRequired = competency.requiredAreas.reduce((sum, req) => sum + req.areas.length, 0);
    const totalMissing = missingAreas.reduce((sum, miss) => sum + miss.areas.length, 0);
    const completionRate = totalRequired > 0 ? ((totalRequired - totalMissing) / totalRequired) * 100 : 0;

    let riskLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
    if (totalMissing > 0) {
      if (completionRate < 50) riskLevel = 'critical';
      else if (completionRate < 75) riskLevel = 'high';
      else if (completionRate < 100) riskLevel = 'medium';
    }

    gaps.push({
      employeeId: person.id,
      fullName: info.fullName,
      position: info.position,
      organizationId: person.organizationId,
      organizationName: org.name,
      requiredAreas: competency.requiredAreas,
      missingAreas: missingAreas,
      hasAllRequired: totalMissing === 0,
      completionRate: Math.round(completionRate),
      riskLevel,
      lastChecked: new Date().toISOString()
    });
  });

  const totalPersonnel = gaps.length;
  const compliantPersonnel = gaps.filter((g) => g.hasAllRequired).length;
  const nonCompliantPersonnel = totalPersonnel - compliantPersonnel;
  const criticalGaps = gaps.filter((g) => g.riskLevel === 'critical').length;
  const highRiskGaps = gaps.filter((g) => g.riskLevel === 'high').length;
  const complianceRate = totalPersonnel > 0 ? (compliantPersonnel / totalPersonnel) * 100 : 0;

  const byOrganization = organizations.map((org) => {
    const orgGaps = gaps.filter((g) => g.organizationId === org.id);
    const orgCompliant = orgGaps.filter((g) => g.hasAllRequired).length;
    return {
      organizationId: org.id,
      organizationName: org.name,
      totalPersonnel: orgGaps.length,
      compliant: orgCompliant,
      complianceRate: orgGaps.length > 0 ? (orgCompliant / orgGaps.length) * 100 : 0
    };
  }).filter((item) => item.totalPersonnel > 0);

  const categoryStats: Record<string, { totalRequired: number; missingAreas: Record<string, number> }> = {};

  gaps.forEach((gap) => {
    gap.missingAreas.forEach((miss) => {
      if (!categoryStats[miss.category]) {
        categoryStats[miss.category] = { totalRequired: 0, missingAreas: {} };
      }
      categoryStats[miss.category].totalRequired += miss.areas.length;
      
      miss.areas.forEach((area) => {
        categoryStats[miss.category].missingAreas[area] = 
          (categoryStats[miss.category].missingAreas[area] || 0) + 1;
      });
    });
  });

  const byCategory = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    totalRequired: stats.totalRequired,
    totalMissing: Object.values(stats.missingAreas).reduce((sum, count) => sum + count, 0),
    mostMissingAreas: Object.entries(stats.missingAreas)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }));

  return {
    totalPersonnel,
    compliantPersonnel,
    nonCompliantPersonnel,
    criticalGaps,
    highRiskGaps,
    complianceRate: Math.round(complianceRate),
    gaps,
    byOrganization,
    byCategory
  };
}

export function getRiskLevelColor(riskLevel: 'critical' | 'high' | 'medium' | 'low'): string {
  switch (riskLevel) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
  }
}

export function getRiskLevelLabel(riskLevel: 'critical' | 'high' | 'medium' | 'low'): string {
  switch (riskLevel) {
    case 'critical':
      return 'Критический';
    case 'high':
      return 'Высокий';
    case 'medium':
      return 'Средний';
    case 'low':
      return 'Низкий';
  }
}