import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useAuthStore } from '@/stores/authStore';
import { useExpiryNotifications } from './useExpiryNotifications';
import { differenceInDays, parseISO } from 'date-fns';
import type { CatalogObject } from '@/types';

export function useCatalogNotifications() {
  const user = useAuthStore((state) => state.user);
  const { getFacilitiesByTenant } = useFacilitiesStore();
  const objects = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];

  useExpiryNotifications<CatalogObject>({
    source: 'catalog',
    items: objects,
    link: '/catalog',
    criticalFilter: (obj, today) => {
      if (!obj.nextExpertiseDate) return false;
      const expertiseDate = parseISO(obj.nextExpertiseDate);
      return expertiseDate < today;
    },
    warningFilter: (obj, today) => {
      if (!obj.nextExpertiseDate) return false;
      const expertiseDate = parseISO(obj.nextExpertiseDate);
      const daysLeft = differenceInDays(expertiseDate, today);
      return daysLeft > 0 && daysLeft <= 30;
    },
    getCriticalMessage: (obj) => ({
      title: 'Просрочена экспертиза',
      message: `Объект: ${obj.name}. Требуется экспертиза промышленной безопасности`,
    }),
    getWarningMessage: (obj, today) => {
      const expertiseDate = parseISO(obj.nextExpertiseDate!);
      const daysLeft = differenceInDays(expertiseDate, today);
      return {
        title: `Экспертиза через ${daysLeft} дн.`,
        message: `Объект: ${obj.name}. Необходимо провести экспертизу`,
      };
    },
  });
}