// src/stores/notificationsStore.ts
// Описание: Zustand store для управления системными уведомлениями
import { create } from 'zustand';
import type { Notification, NotificationType, NotificationSource } from '@/types';

interface NotificationHistoryEntry {
  id: string;
  notification: Omit<Notification, 'id' | 'createdAt'>;
  sentAt: string;
  recipients: {
    type: 'all' | 'tenants' | 'users';
    tenantIds?: string[];
    userIds?: string[];
  };
}

interface NotificationsState {
  notifications: Notification[];
  history: NotificationHistoryEntry[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  addBulkNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'tenantId' | 'userId'>,
    recipients: { type: 'all' } | { type: 'tenants'; tenantIds: string[] } | { type: 'users'; userIds: string[] }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
  getNotificationsBySource: (source: NotificationSource) => Notification[];
  getHistory: () => NotificationHistoryEntry[];
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [
    {
      id: 'notif-training-1',
      tenantId: 'tenant-1',
      type: 'success',
      source: 'training_center',
      title: 'Завершена подготовка сотрудников',
      message: 'Учебный центр "УЦ Профессионал" завершил подготовку 3 сотрудников. Удостоверения прикреплены к персоналу.',
      link: '/attestation',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ],
  history: [
    {
      id: 'hist-1',
      notification: {
        tenantId: 'global',
        type: 'info',
        source: 'platform_news',
        title: 'Обновление платформы v2.0',
        message: 'Добавлены новые функции: история уведомлений, расширенные фильтры и статистика отправок.',
        isRead: false,
      },
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      recipients: { type: 'all' },
    },
    {
      id: 'hist-2',
      notification: {
        tenantId: 'tenant-1',
        type: 'warning',
        source: 'attestation',
        title: 'Истекающие сроки аттестации',
        message: 'У 5 сотрудников истекает срок аттестации в ближайшие 30 дней. Необходимо принять меры.',
        link: '/attestation',
        isRead: false,
      },
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      recipients: { type: 'tenants', tenantIds: ['tenant-1'] },
    },
    {
      id: 'hist-3',
      notification: {
        tenantId: 'global',
        type: 'success',
        source: 'system',
        title: 'Профилактические работы завершены',
        message: 'Плановое обслуживание серверов успешно выполнено. Все системы работают в штатном режиме.',
        isRead: false,
      },
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      recipients: { type: 'all' },
    },
    {
      id: 'hist-4',
      notification: {
        tenantId: 'tenant-1',
        userId: '2',
        type: 'critical',
        source: 'incident',
        title: 'Требуется срочное расследование',
        message: 'Зарегистрирован критический инцидент на объекте. Необходимо провести расследование в течение 24 часов.',
        link: '/incidents',
        isRead: false,
      },
      sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      recipients: { type: 'users', userIds: ['2', '3'] },
    },
  ],

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const historyEntry: NotificationHistoryEntry = {
      id: crypto.randomUUID(),
      notification: {
        tenantId: notification.tenantId,
        userId: notification.userId,
        type: notification.type,
        source: notification.source,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        isRead: notification.isRead,
      },
      sentAt: new Date().toISOString(),
      recipients: {
        type: notification.tenantId === 'global' && !notification.userId 
          ? 'all' 
          : notification.userId 
          ? 'users' 
          : 'tenants',
        tenantIds: notification.tenantId !== 'global' ? [notification.tenantId] : undefined,
        userIds: notification.userId ? [notification.userId] : undefined,
      },
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      history: [historyEntry, ...state.history],
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.isRead).length;
  },

  getNotificationsBySource: (source) => {
    return get().notifications.filter((n) => n.source === source);
  },

  addBulkNotification: (notification, recipients) => {
    const now = new Date().toISOString();
    const newNotifications: Notification[] = [];

    if (recipients.type === 'all') {
      newNotifications.push({
        ...notification,
        id: crypto.randomUUID(),
        tenantId: 'global',
        createdAt: now,
      });
    } else if (recipients.type === 'tenants') {
      recipients.tenantIds.forEach((tenantId) => {
        newNotifications.push({
          ...notification,
          id: crypto.randomUUID(),
          tenantId,
          createdAt: now,
        });
      });
    } else if (recipients.type === 'users') {
      recipients.userIds.forEach((userId) => {
        newNotifications.push({
          ...notification,
          id: crypto.randomUUID(),
          tenantId: 'global',
          userId,
          createdAt: now,
        });
      });
    }

    const historyEntry: NotificationHistoryEntry = {
      id: crypto.randomUUID(),
      notification: {
        tenantId: 'global',
        type: notification.type,
        source: notification.source,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        isRead: false,
      },
      sentAt: now,
      recipients,
    };

    set((state) => ({
      notifications: [...newNotifications, ...state.notifications],
      history: [historyEntry, ...state.history],
    }));
  },

  getHistory: () => {
    return get().history;
  },
  
  addTrainingCompletionNotification: (tenantId: string, trainingCenterName: string, personnelCount: number, certificateIds: string[]) => {
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      tenantId,
      type: 'success',
      source: 'training_center',
      title: 'Завершена подготовка сотрудников',
      message: `Учебный центр "${trainingCenterName}" завершил подготовку ${personnelCount} сотрудников. Удостоверения прикреплены к персоналу.`,
      link: '/attestation',
      isRead: false
    };
    
    get().addNotification(notification);
  }
}));