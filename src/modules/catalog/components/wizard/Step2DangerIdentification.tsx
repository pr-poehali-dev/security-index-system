import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { useReferencesStore } from '@/stores/referencesStore';
import type { WizardFormData } from './OpoFormWizard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface Step2DangerIdentificationProps {
  formData: WizardFormData;
  updateFormData: (data: Partial<WizardFormData>) => void;
}

export default function Step2DangerIdentification({ formData, updateFormData }: Step2DangerIdentificationProps) {
  const { dangerSigns } = useReferencesStore();

  const dangerSignOptions = dangerSigns.map((sign) => ({
    value: sign.id,
    label: `${sign.code} - ${sign.name}`,
    description: sign.description
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Раздел 2: Идентификация опасности</h3>
        
        <Alert>
          <Icon name="Info" className="h-4 w-4" />
          <AlertDescription>
            Выберите один или несколько признаков опасности, применимых к данному ОПО в соответствии с ФЗ-116 Ст. 2.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label>
            Признаки опасности <span className="text-red-500">*</span>
          </Label>
          <MultiSelect
            options={dangerSignOptions}
            selected={formData.dangerSigns}
            onChange={(selected) => updateFormData({ dangerSigns: selected })}
            placeholder="Выберите признаки опасности..."
            emptyText="Признаки не найдены"
            searchPlaceholder="Поиск по коду или названию..."
          />
        </div>

        {formData.dangerSigns.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-sm">Выбранные признаки опасности:</h4>
            <div className="space-y-2">
              {formData.dangerSigns.map((signId) => {
                const sign = dangerSigns.find((s) => s.id === signId);
                if (!sign) return null;
                
                return (
                  <div
                    key={sign.id}
                    className="p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {sign.code}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{sign.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{sign.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {formData.dangerSigns.length === 0 && (
          <div className="mt-6 p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            <Icon name="AlertCircle" className="mx-auto mb-2" size={32} />
            <p className="text-sm">Признаки опасности не выбраны</p>
            <p className="text-xs mt-1">Выберите хотя бы один признак для продолжения</p>
          </div>
        )}
      </div>
    </div>
  );
}
