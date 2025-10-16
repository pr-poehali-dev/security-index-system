import { useIncidentsStore } from '@/stores/incidentsStore';
import GenericDirectory from '@/components/shared/GenericDirectory';
import type { IncidentDirection } from '@/types';

export default function DirectionsDirectory() {
  const directions = useIncidentsStore((state) => state.directions);
  const addDirection = useIncidentsStore((state) => state.addDirection);
  const updateDirection = useIncidentsStore((state) => state.updateDirection);
  const deleteDirection = useIncidentsStore((state) => state.deleteDirection);


  return (
    <GenericDirectory<IncidentDirection>
      title="Направления деятельности"
      description="Области, в рамках которых выявляются несоответствия"
      addButtonLabel="Добавить направление"
      inputPlaceholder="Например: Промышленная безопасность"
      entityNameSingular="Направление"
      items={directions}
      onAdd={addDirection}
      onUpdate={updateDirection}
      onDelete={deleteDirection}
    />
  );
}