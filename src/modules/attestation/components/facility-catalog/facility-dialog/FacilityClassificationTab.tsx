import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HazardClass } from '@/types/facilities';
import Icon from '@/components/ui/icon';

interface FacilityClassificationTabProps {
  hazardClass?: HazardClass;
  onChange: (value: HazardClass | undefined) => void;
}

export default function FacilityClassificationTab({
  hazardClass,
  onChange,
}: FacilityClassificationTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="hazardClass">Класс опасности ОПО</Label>
          <Select
            value={hazardClass || ''}
            onValueChange={(value) => onChange(value ? value as HazardClass : undefined)}
          >
            <SelectTrigger id="hazardClass">
              <SelectValue placeholder="Выберите класс опасности" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="I">I класс (чрезвычайно высокая опасность)</SelectItem>
              <SelectItem value="II">II класс (высокая опасность)</SelectItem>
              <SelectItem value="III">III класс (средняя опасность)</SelectItem>
              <SelectItem value="IV">IV класс (умеренная опасность)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/30">
        <div className="flex gap-3">
          <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium">Классификация ОПО по степени опасности:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>I класс</strong> — чрезвычайно высокая опасность (более 10,000 человек в зоне поражения)</li>
              <li><strong>II класс</strong> — высокая опасность (от 1,000 до 10,000 человек)</li>
              <li><strong>III класс</strong> — средняя опасность (от 100 до 1,000 человек)</li>
              <li><strong>IV класс</strong> — умеренная опасность (менее 100 человек)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
