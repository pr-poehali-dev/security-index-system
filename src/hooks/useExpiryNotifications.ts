import { useEffect, useMemo } from 'react';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useAuthStore } from '@/stores/authStore';

interface ExpiryItem {
  id: string;
  tenantId: string;
}

interface NotificationConfig<T extends ExpiryItem> {
  source: 'incident' | 'catalog' | 'attestation';
  items: T[];
  link: string;
  criticalFilter: (item: T, today: Date) => boolean;
  warningFilter: (item: T, today: Date) => boolean;
  getCriticalMessage: (item: T) => { title: string; message: string };
  getWarningMessage: (item: T, today: Date) => { title: string; message: string };
}

export function useExpiryNotifications<T extends ExpiryItem>(
  config: NotificationConfig<T>
) {
  const user = useAuthStore((state) => state.user);
  const { addNotification, notifications } = useNotificationsStore();

  const filteredItems = useMemo(
    () => (user?.tenantId ? config.items.filter((item) => item.tenantId === user.tenantId) : []),
    [config.items, user?.tenantId]
  );

  useEffect(() => {
    if (!user?.tenantId) return;

    const today = new Date();
    const criticalItems = filteredItems.filter((item) => config.criticalFilter(item, today));
    const warningItems = filteredItems.filter((item) => config.warningFilter(item, today));

    const existingNotificationIds = new Set(
      notifications.filter((n) => n.source === config.source).map((n) => n.sourceId)
    );

    criticalItems.forEach((item) => {
      if (existingNotificationIds.has(item.id)) return;

      const { title, message } = config.getCriticalMessage(item);
      addNotification({
        tenantId: user.tenantId!,
        userId: user.id,
        type: 'critical',
        source: config.source,
        sourceId: item.id,
        title,
        message,
        link: config.link,
        isRead: false,
      });
    });

    warningItems.forEach((item) => {
      if (existingNotificationIds.has(item.id)) return;

      const { title, message } = config.getWarningMessage(item, today);
      addNotification({
        tenantId: user.tenantId!,
        userId: user.id,
        type: 'warning',
        source: config.source,
        sourceId: item.id,
        title,
        message,
        link: config.link,
        isRead: false,
      });
    });
  }, [filteredItems, user?.tenantId, user?.id, addNotification, notifications, config]);
}
