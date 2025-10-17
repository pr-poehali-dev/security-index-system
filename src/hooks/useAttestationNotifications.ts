import { useMemo } from 'react';
import { useAttestationStore } from '@/stores/attestationStore';
import { useAuthStore } from '@/stores/authStore';
import { useExpiryNotifications } from './useExpiryNotifications';
import { differenceInDays, parseISO } from 'date-fns';
import type { Certification } from '@/types';

export function useAttestationNotifications() {
  const user = useAuthStore((state) => state.user);
  const { getAttestationsByTenant } = useAttestationStore();

  const certifications = useMemo(
    () => (user?.tenantId ? getAttestationsByTenant(user.tenantId) : []),
    [user?.tenantId, getAttestationsByTenant]
  );

  useExpiryNotifications<Certification>({
    source: 'attestation',
    items: certifications,
    link: '/attestation',
    criticalFilter: (cert, today) => {
      const expiryDate = parseISO(cert.expiryDate);
      return expiryDate < today;
    },
    warningFilter: (cert, today) => {
      const expiryDate = parseISO(cert.expiryDate);
      const daysLeft = differenceInDays(expiryDate, today);
      return daysLeft > 0 && daysLeft <= 30;
    },
    getCriticalMessage: (cert) => ({
      title: 'Аттестация просрочена',
      message: `Истек срок действия аттестации по направлению: ${cert.area}`,
    }),
    getWarningMessage: (cert, today) => {
      const expiryDate = parseISO(cert.expiryDate);
      const daysLeft = differenceInDays(expiryDate, today);
      return {
        title: `Аттестация истекает через ${daysLeft} дн.`,
        message: `Необходимо продлить аттестацию: ${cert.area}`,
      };
    },
  });
}