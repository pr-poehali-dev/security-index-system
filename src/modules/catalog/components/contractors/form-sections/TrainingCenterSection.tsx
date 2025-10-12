import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContractorFormData } from '../../../types/contractors';

interface TrainingCenterSectionProps {
  formData: ContractorFormData;
  setFormData: (data: ContractorFormData) => void;
  accreditationsInput: string;
  setAccreditationsInput: (value: string) => void;
}

const TrainingCenterSection = ({ 
  formData, 
  setFormData,
  accreditationsInput,
  setAccreditationsInput
}: TrainingCenterSectionProps) => {
  if (formData.type !== 'training_center') {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Данные учебного центра</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="website">Веб-сайт</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://training-center.ru"
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="accreditations">Аккредитации</Label>
          <Input
            id="accreditations"
            value={accreditationsInput}
            onChange={(e) => setAccreditationsInput(e.target.value)}
            placeholder="ISO 9001, РосТехНадзор (через запятую)"
          />
          <p className="text-xs text-muted-foreground">
            Укажите аккредитации через запятую
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Рейтинг (0-5)</Label>
          <Input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating || 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                rating: e.target.value ? parseFloat(e.target.value) : 0,
              })
            }
            placeholder="4.5"
          />
        </div>
      </div>
    </div>
  );
};

export default TrainingCenterSection;
