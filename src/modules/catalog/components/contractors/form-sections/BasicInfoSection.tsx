import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContractorFormData, ContractorType } from '../../../types/contractors';

interface BasicInfoSectionProps {
  formData: ContractorFormData;
  setFormData: (data: ContractorFormData) => void;
}

const BasicInfoSection = ({ formData, setFormData }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Основная информация</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name">
            Название организации <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ООО 'ГазСервис'"
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="type">
            Тип организации <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.type}
            onValueChange={(value: ContractorType) =>
              setFormData({ ...formData, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contractor">Подрядчик</SelectItem>
              <SelectItem value="training_center">Учебный центр</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inn">
            ИНН <span className="text-red-500">*</span>
          </Label>
          <Input
            id="inn"
            required
            value={formData.inn}
            onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
            placeholder="1234567890"
            maxLength={12}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kpp">КПП</Label>
          <Input
            id="kpp"
            value={formData.kpp}
            onChange={(e) => setFormData({ ...formData, kpp: e.target.value })}
            placeholder="123456789"
            maxLength={9}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="legalAddress">Юридический адрес</Label>
          <Input
            id="legalAddress"
            value={formData.legalAddress}
            onChange={(e) => setFormData({ ...formData, legalAddress: e.target.value })}
            placeholder="г. Москва, ул. Примерная, д. 1"
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="actualAddress">Фактический адрес</Label>
          <Input
            id="actualAddress"
            value={formData.actualAddress}
            onChange={(e) => setFormData({ ...formData, actualAddress: e.target.value })}
            placeholder="г. Москва, ул. Примерная, д. 1"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
