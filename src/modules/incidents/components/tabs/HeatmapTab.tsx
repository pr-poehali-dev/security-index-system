import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import IncidentHeatmap from '../IncidentHeatmap';

import { useMemo } from 'react';

export default function HeatmapTab() {
  const user = useAuthStore((state) => state.user);
  const allIncidents = useIncidentsStore((state) => state.incidents);

  const incidents = useMemo(() => 
    user?.tenantId ? allIncidents.filter(inc => inc.tenantId === user.tenantId) : []
  , [allIncidents, user?.tenantId]);

  if (incidents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Icon name="Map" size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Нет данных для тепловой карты
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
            Добавьте инциденты для отображения тепловой карты их распределения.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <IncidentHeatmap incidents={incidents} />
    </div>
  );
}