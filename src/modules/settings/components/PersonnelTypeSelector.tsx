import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { PersonnelType } from '@/types';

interface PersonnelTypeSelectorProps {
  personnelType: PersonnelType;
  onTypeChange: (type: PersonnelType) => void;
}

export default function PersonnelTypeSelector({
  personnelType,
  onTypeChange
}: PersonnelTypeSelectorProps) {
  return (
    <div className="mb-6">
      <Label className="text-base font-semibold mb-3 block">Тип персонала</Label>
      <RadioGroup value={personnelType} onValueChange={(value: PersonnelType) => onTypeChange(value)}>
        <div className="flex gap-4">
          <div 
            className="flex items-center space-x-2 border rounded-lg p-4 flex-1 cursor-pointer hover:bg-accent" 
            onClick={() => onTypeChange('employee')}
          >
            <RadioGroupItem value="employee" id="employee" />
            <div className="flex-1">
              <Label htmlFor="employee" className="cursor-pointer font-medium">Штатный сотрудник</Label>
              <p className="text-xs text-muted-foreground mt-1">Сотрудник вашей организации</p>
            </div>
          </div>
          <div 
            className="flex items-center space-x-2 border rounded-lg p-4 flex-1 cursor-pointer hover:bg-accent" 
            onClick={() => onTypeChange('contractor')}
          >
            <RadioGroupItem value="contractor" id="contractor" />
            <div className="flex-1">
              <Label htmlFor="contractor" className="cursor-pointer font-medium">Сотрудник подрядчика</Label>
              <p className="text-xs text-muted-foreground mt-1">Работник внешней организации</p>
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
