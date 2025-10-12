import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EducationLevel } from '@/types';

interface PersonalDataTabProps {
  personData: {
    lastName: string;
    firstName: string;
    middleName: string;
    birthDate: string;
    snils: string;
    inn: string;
    email: string;
    phone: string;
    address: string;
    educationLevel: EducationLevel;
  };
  onUpdate: (field: string, value: string | EducationLevel) => void;
}

export default function PersonalDataTab({ personData, onUpdate }: PersonalDataTabProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lastName">Фамилия <span className="text-destructive">*</span></Label>
          <Input
            id="lastName"
            value={personData.lastName}
            onChange={(e) => onUpdate('lastName', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">Имя <span className="text-destructive">*</span></Label>
          <Input
            id="firstName"
            value={personData.firstName}
            onChange={(e) => onUpdate('firstName', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Отчество</Label>
          <Input
            id="middleName"
            value={personData.middleName}
            onChange={(e) => onUpdate('middleName', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Дата рождения</Label>
          <Input
            id="birthDate"
            type="date"
            value={personData.birthDate}
            onChange={(e) => onUpdate('birthDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="educationLevel">Образование</Label>
          <Select
            value={personData.educationLevel}
            onValueChange={(value: EducationLevel) => onUpdate('educationLevel', value)}
          >
            <SelectTrigger id="educationLevel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="higher">Высшее</SelectItem>
              <SelectItem value="secondary">Среднее</SelectItem>
              <SelectItem value="no_data">Нет данных</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="snils">СНИЛС</Label>
          <Input
            id="snils"
            value={personData.snils}
            onChange={(e) => onUpdate('snils', e.target.value)}
            placeholder="123-456-789 00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inn">ИНН</Label>
          <Input
            id="inn"
            value={personData.inn}
            onChange={(e) => onUpdate('inn', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={personData.email}
            onChange={(e) => onUpdate('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            value={personData.phone}
            onChange={(e) => onUpdate('phone', e.target.value)}
            placeholder="+7 (999) 123-45-67"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Адрес</Label>
        <Input
          id="address"
          value={personData.address}
          onChange={(e) => onUpdate('address', e.target.value)}
        />
      </div>
    </div>
  );
}
