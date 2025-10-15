import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { useReferencesStore } from '@/stores/referencesStore';
import type { WizardFormData } from './OpoFormWizard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface Step3ClassificationProps {
  formData: WizardFormData;
  updateFormData: (data: Partial<WizardFormData>) => void;
}

export default function Step3Classification({ formData, updateFormData }: Step3ClassificationProps) {
  const { opoClassifications, licensedActivities } = useReferencesStore();

  const classificationOptions = opoClassifications.map((cls) => ({
    value: cls.id,
    label: `${cls.code} - ${cls.name}`,
    description: cls.description
  }));

  const licensedActivityOptions = licensedActivities.map((activity) => ({
    value: activity.id,
    label: `${activity.code} - ${activity.name}`
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Раздел 3: Классификация ОПО</h3>
        
        <Alert>
          <Icon name="Info" className="h-4 w-4" />
          <AlertDescription>
            Укажите классификационные признаки ОПО в соответствии с ФЗ-116 Приложение 2.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label>
            Классификация ОПО <span className="text-red-500">*</span>
          </Label>
          <MultiSelect
            options={classificationOptions}
            selected={formData.classifications}
            onChange={(selected) => updateFormData({ classifications: selected })}
            placeholder="Выберите классификации..."
            emptyText="Классификации не найдены"
            searchPlaceholder="Поиск по коду или названию..."
          />
        </div>

        {formData.classifications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Выбранные классификации:</h4>
            <div className="space-y-2">
              {formData.classifications.map((clsId) => {
                const cls = opoClassifications.find((c) => c.id === clsId);
                if (!cls) return null;
                
                return (
                  <div
                    key={cls.id}
                    className="p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold text-sm">
                        {cls.code}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{cls.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{cls.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-semibold">Класс опасности</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hazardClass">
              Класс опасности ОПО
            </Label>
            <Select
              value={formData.hazardClass}
              onValueChange={(value: any) => updateFormData({ hazardClass: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите класс" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="I">I класс (чрезвычайно высокая опасность)</SelectItem>
                <SelectItem value="II">II класс (высокая опасность)</SelectItem>
                <SelectItem value="III">III класс (средняя опасность)</SelectItem>
                <SelectItem value="IV">IV класс (низкая опасность)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hazardClassJustification">
            Обоснование класса опасности
          </Label>
          <Textarea
            id="hazardClassJustification"
            value={formData.hazardClassJustification}
            onChange={(e) => updateFormData({ hazardClassJustification: e.target.value })}
            placeholder="Например: По количеству природного газа (20 т) - IV класс; По принадлежности к сетям газопотребления (давление 0.6 МПа) - III класс. Установлен наивысший: III класс."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Укажите обоснование присвоения класса опасности в соответствии с расчетами по ФЗ-116 Приложение 2.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-semibold">Лицензирование</h4>
        
        <div className="space-y-2">
          <Label>
            Лицензируемые виды деятельности
          </Label>
          <MultiSelect
            options={licensedActivityOptions}
            selected={formData.licensedActivities}
            onChange={(selected) => updateFormData({ licensedActivities: selected })}
            placeholder="Выберите виды деятельности..."
            emptyText="Виды деятельности не найдены"
            searchPlaceholder="Поиск..."
          />
          <p className="text-xs text-muted-foreground">
            Укажите лицензируемые виды деятельности, если они требуются для эксплуатации ОПО.
          </p>
        </div>
      </div>
    </div>
  );
}
