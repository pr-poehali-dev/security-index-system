import { useEffect } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useAuthStore } from '@/stores/authStore';
import { differenceInDays, parseISO } from 'date-fns';

export function useCatalogNotifications() {
  const user = useAuthStore((state) => state.user);
  const { objects } = useCatalogStore();
  const { addNotification, notifications } = useNotificationsStore();

  useEffect(() => {
    if (!user?.tenantId) return;

    const tenantObjects = objects.filter(obj => obj.tenantId === user.tenantId);
    const today = new Date();

    const overdueExpertise = tenantObjects.filter(obj => {
      if (!obj.nextExpertiseDate) return false;
      const expertiseDate = parseISO(obj.nextExpertiseDate);
      return expertiseDate < today;
    });

    const soonExpertise = tenantObjects.filter(obj => {
      if (!obj.nextExpertiseDate) return false;
      const expertiseDate = parseISO(obj.nextExpertiseDate);
      const daysLeft = differenceInDays(expertiseDate, today);
      return daysLeft > 0 && daysLeft <= 30;
    });

    const existingNotificationIds = new Set(
      notifications
        .filter(n => n.source === 'catalog')
        .map(n => n.sourceId)
    );

    overdueExpertise.forEach(obj => {
      if (existingNotificationIds.has(obj.id)) return;
      
      addNotification({
        tenantId: user.tenantId!,
        userId: user.id,
        type: 'critical',
        source: 'catalog',
        sourceId: obj.id,
        title: 'Просрочена экспертиза',
        message: `Объект: ${obj.name}. Требуется экспертиза промышленной безопасности`,
        link: '/catalog',
        isRead: false,
      });
    });

    soonExpertise.forEach(obj => {
      if (existingNotificationIds.has(obj.id)) return;
      
      const expertiseDate = parseISO(obj.nextExpertiseDate!);
      const daysLeft = differenceInDays(expertiseDate, today);
      
      addNotification({
        tenantId: user.tenantId!,
        userId: user.id,
        type: 'warning',
        source: 'catalog',
        sourceId: obj.id,
        title: `Экспертиза через ${daysLeft} дн.`,
        message: `Объект: ${obj.name}. Необходимо провести экспертизу`,
        link: '/catalog',
        isRead: false,
      });
    });
  }, [user?.tenantId, user?.id, objects, addNotification]);
}