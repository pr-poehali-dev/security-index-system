import { useEffect, useMemo } from 'react';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useAuthStore } from '@/stores/authStore';

export function useIncidentNotifications() {
  const user = useAuthStore((state) => state.user);
  const allIncidents = useIncidentsStore((state) => state.incidents);
  const { addNotification, notifications } = useNotificationsStore();

  const incidents = useMemo(() => 
    user?.tenantId ? allIncidents.filter(inc => inc.tenantId === user.tenantId) : []
  , [allIncidents, user?.tenantId]);

  useEffect(() => {
    if (!user?.tenantId) return;
    
    const overdue = incidents.filter(inc => inc.status === 'overdue');
    const urgent = incidents.filter(inc => 
      inc.status === 'awaiting' && inc.daysLeft > 0 && inc.daysLeft <= 3
    );

    const existingNotificationIds = new Set(
      notifications
        .filter(n => n.source === 'incident')
        .map(n => n.sourceId)
    );

    overdue.forEach(incident => {
      if (existingNotificationIds.has(incident.id)) return;
      
      addNotification({
        tenantId: user.tenantId!,
        userId: user.id,
        type: 'critical',
        source: 'incident',
        sourceId: incident.id,
        title: 'Просроченный инцидент',
        message: `Инцидент просрочен: ${incident.description.slice(0, 60)}...`,
        link: '/incidents',
        isRead: false,
      });
    });

    urgent.forEach(incident => {
      if (existingNotificationIds.has(incident.id)) return;
      
      addNotification({
        tenantId: user.tenantId!,
        userId: user.id,
        type: 'warning',
        source: 'incident',
        sourceId: incident.id,
        title: `Осталось ${incident.daysLeft} ${incident.daysLeft === 1 ? 'день' : 'дня'}`,
        message: `Срок исполнения истекает: ${incident.description.slice(0, 60)}...`,
        link: '/incidents',
        isRead: false,
      });
    });
  }, [incidents, user?.tenantId, user?.id, addNotification, notifications]);
}