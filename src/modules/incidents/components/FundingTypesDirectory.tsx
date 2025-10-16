import { useIncidentsStore } from '@/stores/incidentsStore';
import GenericDirectory from '@/components/shared/GenericDirectory';
import type { IncidentFundingType } from '@/types';

export default function FundingTypesDirectory() {
  const fundingTypes = useIncidentsStore((state) => state.fundingTypes);
  const addFundingType = useIncidentsStore((state) => state.addFundingType);
  const updateFundingType = useIncidentsStore((state) => state.updateFundingType);
  const deleteFundingType = useIncidentsStore((state) => state.deleteFundingType);

  return (
    <GenericDirectory<IncidentFundingType>
      title="Обеспечение выполнения работ"
      description="Способы финансирования корректирующих мероприятий"
      addButtonLabel="Добавить тип"
      inputPlaceholder="Например: CAPEX, OPEX, Силами площадки"
      entityNameSingular="Тип обеспечения"
      items={fundingTypes}
      onAdd={addFundingType}
      onUpdate={updateFundingType}
      onDelete={deleteFundingType}
    />
  );
}