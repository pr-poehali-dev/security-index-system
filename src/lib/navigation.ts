import type { User } from '@/types';
import { ROUTES } from './constants';

export function getFirstAvailableRoute(user: User | null): string {
  if (!user) return ROUTES.LOGIN;
  
  if (user.role === 'SuperAdmin') return ROUTES.TENANTS;
  
  const moduleRouteMap: Record<string, string> = {
    attestation: ROUTES.ATTESTATION,
    catalog: ROUTES.CATALOG,
    incidents: ROUTES.INCIDENTS,
    checklists: ROUTES.CHECKLISTS,
    tasks: ROUTES.TASKS,
    examination: ROUTES.EXAMINATION,
    maintenance: ROUTES.MAINTENANCE,
    budget: ROUTES.BUDGET
  };
  
  for (const module of user.availableModules) {
    const route = moduleRouteMap[module];
    if (route) return route;
  }
  
  return ROUTES.DASHBOARD;
}

export function hasAccess(user: User | null, module: string): boolean {
  if (!user) return false;
  if (user.role === 'SuperAdmin') return true;
  return user.availableModules.includes(module as any);
}
