import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContractorFormData, ContractorStatus } from '../../../types/contractors';

interface AdditionalInfoSectionProps {
  formData: ContractorFormData;
  setFormData: (data: ContractorFormData) => void;
}

const AdditionalInfoSection = ({ formData, setFormData }: AdditionalInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Дополнительно</h3>
      
      <div className="space-y-2">
        <Label htmlFor="status">Статус</Label>
        <Select
          value={formData.status}
          onValueChange={(value: ContractorStatus) =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Активен</SelectItem>
            <SelectItem value="suspended">Приостановлен</SelectItem>
            <SelectItem value="blocked">Заблокирован</SelectItem>
            <SelectItem value="archived">Архив</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Примечания</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Дополнительная информация..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default AdditionalInfoSection;
