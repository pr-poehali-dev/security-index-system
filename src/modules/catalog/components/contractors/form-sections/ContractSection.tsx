import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContractorFormData } from '../../../types/contractors';

interface ContractSectionProps {
  formData: ContractorFormData;
  setFormData: (data: ContractorFormData) => void;
}

const ContractSection = ({ formData, setFormData }: ContractSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Договор</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contractNumber">Номер договора</Label>
          <Input
            id="contractNumber"
            value={formData.contractNumber}
            onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
            placeholder="№ 123/2024"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractAmount">Сумма договора (руб.)</Label>
          <Input
            id="contractAmount"
            type="number"
            value={formData.contractAmount || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                contractAmount: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            placeholder="1000000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractDate">Дата договора</Label>
          <Input
            id="contractDate"
            type="date"
            value={formData.contractDate}
            onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractExpiry">Срок действия до</Label>
          <Input
            id="contractExpiry"
            type="date"
            value={formData.contractExpiry}
            onChange={(e) => setFormData({ ...formData, contractExpiry: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default ContractSection;
