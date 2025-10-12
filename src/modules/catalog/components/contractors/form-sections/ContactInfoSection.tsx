import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContractorFormData } from '../../../types/contractors';

interface ContactInfoSectionProps {
  formData: ContractorFormData;
  setFormData: (data: ContractorFormData) => void;
}

const ContactInfoSection = ({ formData, setFormData }: ContactInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Контактные данные</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="directorName">ФИО директора</Label>
          <Input
            id="directorName"
            value={formData.directorName}
            onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
            placeholder="Иванов Иван Иванович"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Телефон</Label>
          <Input
            id="contactPhone"
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            placeholder="+7 (999) 123-45-67"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            placeholder="info@contractor.ru"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;
