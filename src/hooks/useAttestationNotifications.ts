import { useEffect } from 'react';
import { useAttestationStore } from '@/stores/attestationStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useAuthStore } from '@/stores/authStore';
import { differenceInDays, parseISO } from 'date-fns';

export function useAttestationNotifications() {
  const user = useAuthStore((state) => state.user);
  const { getCertificationsByTenant } = useAttestationStore();
  const { addNotification, notifications } = useNotificationsStore();

  useEffect(() => {
    if (!user?.tenantId) return;

    const certifications = getCertificationsByTenant(user.tenantId);
    const today = new Date();

    const expiredCerts = certifications.filter(cert => {
      const expiryDate = parseISO(cert.expiryDate);
      return expiryDate < today;
    });

    const soonExpiringCerts = certifications.filter(cert => {
      const expiryDate = parseISO(cert.expiryDate);
      const daysLeft = differenceInDays(expiryDate, today);
      return daysLeft > 0 && daysLeft <= 30;
    });

    const existingNotificationIds = new Set(
      notifications
        .filter(n => n.source === 'attestation')
        .map(n => n.sourceId)
    );

    expiredCerts.forEach(cert => {
      if (existingNotificationIds.has(cert.id)) return;
      
      addNotification({
        tenantId: user.tenantId!,
        userId: user.id,
        type: 'critical',
        source: 'attestation',
        sourceId: cert.id,
        title: 'Аттестация просрочена',
        message: `Истек срок действия аттестации по направлению: ${cert.area}`,
        link: '/attestation',
        isRead: false,
      });
    });

    soonExpiringCerts.forEach(cert => {
      if (existingNotificationIds.has(cert.id)) return;
      
      const expiryDate = parseISO(cert.expiryDate);
      const daysLeft = differenceInDays(expiryDate, today);
      
      addNotification({
        tenantId: user.tenantId!,
        userId: user.id,
        type: 'warning',
        source: 'attestation',
        sourceId: cert.id,
        title: `Аттестация истекает через ${daysLeft} дн.`,
        message: `Необходимо продлить аттестацию: ${cert.area}`,
        link: '/attestation',
        isRead: false,
      });
    });
  }, [user?.tenantId, user?.id, getCertificationsByTenant, addNotification, notifications]);
}
