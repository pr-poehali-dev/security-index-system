import type { Organization, Department, ExternalOrganization } from '@/types';

export function getOrganizationName(
  orgId: string,
  organizations: Organization[],
  externalOrganizations: ExternalOrganization[]
) {
  const org = organizations.find(o => o.id === orgId);
  if (org) return org.name;
  const extOrg = externalOrganizations.find(o => o.id === orgId);
  return extOrg?.name || '—';
}

export function getDepartmentName(deptId: string, departments: Department[]) {
  return departments.find(d => d.id === deptId)?.name || '—';
}
