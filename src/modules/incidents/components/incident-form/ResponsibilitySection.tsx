import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';
import type { Personnel, Person, Position } from '@/types';

interface ResponsibilitySectionProps {
  responsiblePersonnelId: string;
  plannedDate: string;
  completedDate: string;
  personnel: Personnel[];
  people: Person[];
  positions: Position[];
  onUpdate: (field: string, value: string) => void;
}

export default function ResponsibilitySection({
  responsiblePersonnelId,
  plannedDate,
  completedDate,
  personnel,
  people,
  positions,
  onUpdate
}: ResponsibilitySectionProps) {
  return (
    <>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="responsiblePersonnelId">Ответственный за выполнение *</Label>
        <Select value={responsiblePersonnelId} onValueChange={(v) => onUpdate('responsiblePersonnelId', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите сотрудника" />
          </SelectTrigger>
          <SelectContent>
            {personnel.map((pers) => {
              const info = getPersonnelFullInfo(pers, people, positions);
              return (
                <SelectItem key={pers.id} value={pers.id}>
                  {info.fullName} — {info.position}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="plannedDate">Плановая дата закрытия *</Label>
        <Input
          id="plannedDate"
          type="date"
          value={plannedDate}
          onChange={(e) => onUpdate('plannedDate', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="completedDate">Фактическая дата выполнения</Label>
        <Input
          id="completedDate"
          type="date"
          value={completedDate}
          onChange={(e) => onUpdate('completedDate', e.target.value)}
        />
      </div>
    </>
  );
}
