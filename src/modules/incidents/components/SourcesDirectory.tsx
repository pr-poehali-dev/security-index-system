import { useIncidentsStore } from '@/stores/incidentsStore';
import GenericDirectory from '@/components/shared/GenericDirectory';
import type { IncidentSource } from '@/types';

export default function SourcesDirectory() {
  const sources = useIncidentsStore((state) => state.sources);
  const addSource = useIncidentsStore((state) => state.addSource);
  const updateSource = useIncidentsStore((state) => state.updateSource);
  const deleteSource = useIncidentsStore((state) => state.deleteSource);


  return (
    <GenericDirectory<IncidentSource>
      title="Источники сообщений о несоответствиях"
      description="Определяет в рамках какого процесса выявлено несоответствие"
      addButtonLabel="Добавить источник"
      inputPlaceholder="Например: Внутренняя проверка"
      entityNameSingular="Источник"
      items={sources}
      onAdd={addSource}
      onUpdate={updateSource}
      onDelete={deleteSource}
    />
  );
}