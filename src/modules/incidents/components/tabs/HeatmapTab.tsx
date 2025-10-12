import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import IncidentHeatmap from '../IncidentHeatmap';

export default function HeatmapTab() {
  const user = useAuthStore((state) => state.user);
  const { getIncidentsByTenant } = useIncidentsStore();

  const incidents = user?.tenantId ? getIncidentsByTenant(user.tenantId) : [];

  return (
    <div className="space-y-6">
      <IncidentHeatmap incidents={incidents} />
    </div>
  );
}
