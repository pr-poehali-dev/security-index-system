import { useState } from 'react';
import { useIncidentStore } from '@/stores/incidentStore';
import { useCatalogStore } from '@/stores/catalogStore';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/layout/PageHeader';
import IncidentDetailsDialog from '@/components/incidents/IncidentDetailsDialog';
import IncidentCard from '../components/IncidentCard';
import CreateIncidentDialog from '../components/CreateIncidentDialog';
import type { Incident, IncidentPriority } from '@/types/incidents';

export default function IncidentsPage() {
  const { incidents, incidentTypes, addIncident } = useIncidentStore();
  const { objects } = useCatalogStore();
  const user = useAuthStore((state) => state.user);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const handleCreateIncident = (data: {
    title: string;
    description: string;
    typeId: string;
    priority: IncidentPriority;
    objectId: string;
    dueDate: string;
  }) => {
    if (!user) return;
    
    addIncident({
      ...data,
      tenantId: user.tenantId || 'tenant-1',
      status: 'new',
      source: 'manual',
      createdBy: user.id,
      createdByName: user.name,
      dueDate: new Date(data.dueDate).toISOString()
    });
  };

  return (
    <div>
      <PageHeader
        title="Учет инцидентов"
        description="Регистрация и контроль нештатных ситуаций"
        icon="AlertCircle"
        action={
          <CreateIncidentDialog
            incidentTypes={incidentTypes}
            objects={objects}
            onSubmit={handleCreateIncident}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {incidents.map((incident) => {
          const incidentType = incidentTypes.find(t => t.id === incident.typeId);
          const obj = objects.find(o => o.id === incident.objectId);
          
          return (
            <IncidentCard
              key={incident.id}
              incident={incident}
              incidentTypeName={incidentType?.name}
              objectName={obj?.name}
              onViewDetails={setSelectedIncident}
            />
          );
        })}
      </div>

      {selectedIncident && (
        <IncidentDetailsDialog
          incident={selectedIncident}
          open={!!selectedIncident}
          onOpenChange={(open) => !open && setSelectedIncident(null)}
        />
      )}
    </div>
  );
}
