import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface TrainingDetailsData {
  startDate: string;
  endDate: string;
  organizationId: string;
  cost: string;
  program?: string;
}

interface TrainingDetailsStepProps {
  data: TrainingDetailsData;
  onChange: (data: TrainingDetailsData) => void;
  organizations: Array<{ id: string; name: string }>;
}

export default function TrainingDetailsStep({
  data,
  onChange,
  organizations,
}: TrainingDetailsStepProps) {
  const handleChange = (field: keyof TrainingDetailsData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Дата начала *</Label>
          <Input
            id="startDate"
            type="date"
            value={data.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Дата окончания *</Label>
          <Input
            id="endDate"
            type="date"
            value={data.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">Учебный центр *</Label>
        <Select value={data.organizationId} onValueChange={(value) => handleChange('organizationId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите учебный центр" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost">Стоимость обучения (₽) *</Label>
        <Input
          id="cost"
          type="number"
          placeholder="15000"
          value={data.cost}
          onChange={(e) => handleChange('cost', e.target.value)}
          min="0"
          step="100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="program">Программа обучения</Label>
        <Textarea
          id="program"
          placeholder="Например: Программа обучения по промышленной безопасности (72 часа)"
          value={data.program || ''}
          onChange={(e) => handleChange('program', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
