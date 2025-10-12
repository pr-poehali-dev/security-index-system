import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContractorFormData } from '../../../types/contractors';

interface PermissionsSectionProps {
  formData: ContractorFormData;
  setFormData: (data: ContractorFormData) => void;
  workTypesInput: string;
  setWorkTypesInput: (value: string) => void;
}

const PermissionsSection = ({ 
  formData, 
  setFormData, 
  workTypesInput, 
  setWorkTypesInput 
}: PermissionsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Допуски и разрешения</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="workTypes">Виды работ</Label>
          <Input
            id="workTypes"
            value={workTypesInput}
            onChange={(e) => setWorkTypesInput(e.target.value)}
            placeholder="Монтаж, Ремонт, Диагностика (через запятую)"
          />
          <p className="text-xs text-muted-foreground">
            Укажите виды работ через запятую
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sroNumber">Номер допуска СРО</Label>
          <Input
            id="sroNumber"
            value={formData.sroNumber}
            onChange={(e) => setFormData({ ...formData, sroNumber: e.target.value })}
            placeholder="СРО-С-123-45678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sroExpiry">Срок действия СРО до</Label>
          <Input
            id="sroExpiry"
            type="date"
            value={formData.sroExpiry}
            onChange={(e) => setFormData({ ...formData, sroExpiry: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="insuranceNumber">Номер страхового полиса</Label>
          <Input
            id="insuranceNumber"
            value={formData.insuranceNumber}
            onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
            placeholder="АА 1234567890"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="insuranceExpiry">Страховка действует до</Label>
          <Input
            id="insuranceExpiry"
            type="date"
            value={formData.insuranceExpiry}
            onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default PermissionsSection;
