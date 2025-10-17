import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FacilityComponent } from '@/types/facilities';

interface ComponentIdentificationTabProps {
  formData: Partial<FacilityComponent>;
  updateFormField: <K extends keyof FacilityComponent>(field: K, value: FacilityComponent[K]) => void;
}

export default function ComponentIdentificationTab({
  formData,
  updateFormField,
}: ComponentIdentificationTabProps) {
  return (
    <div className="space-y-4 p-1">
      <div className="space-y-2">
        <Label htmlFor="internalRegistrationNumber">Регистрационный номер (внутренний)</Label>
        <Input
          id="internalRegistrationNumber"
          value={formData.internalRegistrationNumber || ''}
          onChange={(e) => updateFormField('internalRegistrationNumber', e.target.value)}
          placeholder="Внутренний номер..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rostechnadzorRegistrationNumber">Регистрационный номер (Ростехнадзор)</Label>
        <Input
          id="rostechnadzorRegistrationNumber"
          value={formData.rostechnadzorRegistrationNumber || ''}
          onChange={(e) => updateFormField('rostechnadzorRegistrationNumber', e.target.value)}
          placeholder="Номер регистрации в РТН..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="technologicalNumber">Технологический номер</Label>
        <Input
          id="technologicalNumber"
          value={formData.technologicalNumber || ''}
          onChange={(e) => updateFormField('technologicalNumber', e.target.value)}
          placeholder="Технологический номер..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="factoryNumber">Заводской номер</Label>
        <Input
          id="factoryNumber"
          value={formData.factoryNumber || ''}
          onChange={(e) => updateFormField('factoryNumber', e.target.value)}
          placeholder="Заводской номер..."
        />
      </div>
    </div>
  );
}
