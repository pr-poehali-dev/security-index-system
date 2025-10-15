import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { WizardFormData } from './OpoFormWizard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface Step4CompositionProps {
  formData: WizardFormData;
  updateFormData: (data: Partial<WizardFormData>) => void;
}

export default function Step4Composition({ formData, updateFormData }: Step4CompositionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Раздел 4: Состав ОПО</h3>
        
        <Alert>
          <Icon name="Info" className="h-4 w-4" />
          <AlertDescription>
            Раздел находится в разработке. В будущем здесь будет возможность добавления элементов состава ОПО, технических устройств, опасных веществ и трубопроводов.
          </AlertDescription>
        </Alert>

        <div className="p-6 border-2 border-dashed rounded-lg text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-muted">
              <Icon name="Layers" size={48} className="text-muted-foreground" />
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Функционал в разработке</h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              В следующих версиях здесь можно будет:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Элементы состава</p>
                  <p className="text-xs text-muted-foreground">Площадки, цеха, участки</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Технические устройства</p>
                  <p className="text-xs text-muted-foreground">Оборудование, характеристики</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Опасные вещества</p>
                  <p className="text-xs text-muted-foreground">Виды и количества</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Трубопроводы</p>
                  <p className="text-xs text-muted-foreground">Материал, диаметр, давление</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Краткое описание ОПО
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Опишите основные характеристики и назначение ОПО..."
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            Пока функционал состава не реализован, вы можете добавить общее описание объекта.
          </p>
        </div>
      </div>
    </div>
  );
}
