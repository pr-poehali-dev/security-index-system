import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DescriptionSectionProps {
  directionId: string;
  description: string;
  correctiveAction: string;
  notes: string;
  directions: Array<{ id: string; name: string }>;
  onUpdate: (field: string, value: string) => void;
}

export default function DescriptionSection({
  directionId,
  description,
  correctiveAction,
  notes,
  directions,
  onUpdate
}: DescriptionSectionProps) {
  return (
    <>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="directionId">Направление деятельности *</Label>
        <Select value={directionId} onValueChange={(v) => onUpdate('directionId', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите направление" />
          </SelectTrigger>
          <SelectContent>
            {directions.map((dir) => (
              <SelectItem key={dir.id} value={dir.id}>{dir.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 col-span-2">
        <Label htmlFor="description">Описание несоответствия *</Label>
        <Textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Подробное описание выявленного отклонения"
        />
      </div>

      <div className="space-y-2 col-span-2">
        <Label htmlFor="correctiveAction">Корректирующее действие *</Label>
        <Textarea
          id="correctiveAction"
          rows={3}
          value={correctiveAction}
          onChange={(e) => onUpdate('correctiveAction', e.target.value)}
          placeholder="Описание мероприятий по устранению"
        />
      </div>

      <div className="space-y-2 col-span-2">
        <Label htmlFor="notes">Примечание</Label>
        <Textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => onUpdate('notes', e.target.value)}
          placeholder="Дополнительная информация"
        />
      </div>
    </>
  );
}
