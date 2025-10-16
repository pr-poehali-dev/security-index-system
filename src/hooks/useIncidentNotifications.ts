import { useIncidentsStore } from '@/stores/incidentsStore';
import { useExpiryNotifications } from './useExpiryNotifications';
import type { Incident } from '@/types';

export function useIncidentNotifications() {
  const incidents = useIncidentsStore((state) => state.incidents);

  useExpiryNotifications<Incident>({
    source: 'incident',
    items: incidents,
    link: '/incidents',
    criticalFilter: (incident) => incident.status === 'overdue',
    warningFilter: (incident) => 
      incident.status === 'awaiting' && incident.daysLeft > 0 && incident.daysLeft <= 3,
    getCriticalMessage: (incident) => ({
      title: 'Просроченный инцидент',
      message: `Инцидент просрочен: ${incident.description.slice(0, 60)}...`,
    }),
    getWarningMessage: (incident) => ({
      title: `Осталось ${incident.daysLeft} ${incident.daysLeft === 1 ? 'день' : 'дня'}`,
      message: `Срок исполнения истекает: ${incident.description.slice(0, 60)}...`,
    }),
  });
}