import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface BasicInfoData {
  number: string;
  date: string;
  title: string;
  description?: string;
}

interface BasicInfoStepProps {
  data: BasicInfoData;
  onChange: (data: BasicInfoData) => void;
  titleLabel?: string;
  titlePlaceholder?: string;
  showDescription?: boolean;
}

export default function BasicInfoStep({
  data,
  onChange,
  titleLabel = 'Название',
  titlePlaceholder = 'Введите название документа',
  showDescription = true,
}: BasicInfoStepProps) {
  const handleChange = (field: keyof BasicInfoData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number">Номер документа *</Label>
          <Input
            id="number"
            placeholder="№123-ПБ"
            value={data.number}
            onChange={(e) => handleChange('number', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Дата *</Label>
          <Input
            id="date"
            type="date"
            value={data.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">{titleLabel} *</Label>
        <Input
          id="title"
          placeholder={titlePlaceholder}
          value={data.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>

      {showDescription && (
        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            placeholder="Дополнительная информация о документе"
            value={data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
          />
        </div>
      )}
    </div>
  );
}
