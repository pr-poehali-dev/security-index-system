import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useEmployeesStore } from '@/stores/employeesStore';
import { Facility } from '@/types/facilities';

interface FacilityBasicInfoTabProps {
  formData: Partial<Facility>;
  updateFormField: <K extends keyof Facility>(field: K, value: Facility[K]) => void;
}

export default function FacilityBasicInfoTab({
  formData,
  updateFormField,
}: FacilityBasicInfoTabProps) {
  const user = useAuthStore((state) => state.user);
  const { getOrganizationsByTenant } = useFacilitiesStore();
  const { getEmployeesByTenant } = useEmployeesStore();
  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];
  const employees = user?.tenantId ? getEmployeesByTenant(user.tenantId) : [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Тип объекта *</Label>
        <Select
          value={formData.type}
          onValueChange={(value: 'opo' | 'gts') => updateFormField('type', value)}
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opo">Опасный производственный объект (ОПО)</SelectItem>
            <SelectItem value="gts">Гидротехническое сооружение (ГТС)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Полное наименование *</Label>
        <Textarea
          id="fullName"
          value={formData.fullName || ''}
          onChange={(e) => updateFormField('fullName', e.target.value)}
          placeholder="Полное наименование объекта..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="typicalName">Типовое наименование</Label>
        <Input
          id="typicalName"
          value={formData.typicalName || ''}
          onChange={(e) => updateFormField('typicalName', e.target.value)}
          placeholder="Типовое наименование..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Регистрационный номер</Label>
          <Input
            id="registrationNumber"
            value={formData.registrationNumber || ''}
            onChange={(e) => updateFormField('registrationNumber', e.target.value)}
            placeholder="А00-00000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industryCode">Код отраслевой принадлежности</Label>
          <Input
            id="industryCode"
            value={formData.industryCode || ''}
            onChange={(e) => updateFormField('industryCode', e.target.value)}
            placeholder="00.00.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Адрес местонахождения *</Label>
        <Textarea
          id="address"
          value={formData.address || ''}
          onChange={(e) => updateFormField('address', e.target.value)}
          placeholder="Полный адрес объекта..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizationId">Эксплуатирующая организация *</Label>
        <Select
          value={formData.organizationId || ''}
          onValueChange={(value) => {
            const org = organizations.find(o => o.id === value);
            updateFormField('organizationId', value);
            updateFormField('organizationName', org?.fullName || '');
            updateFormField('operatingOrganizationId', value);
            updateFormField('operatingOrganizationName', org?.fullName || '');
          }}
        >
          <SelectTrigger id="organizationId">
            <SelectValue placeholder="Выберите организацию" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium">Собственник ОПО</h3>
        
        <div className="space-y-2">
          <Label htmlFor="ownerName">Полное наименование ЮЛ</Label>
          <Input
            id="ownerName"
            value={formData.owner?.legalEntityFullName || ''}
            onChange={(e) =>
              updateFormField('owner', {
                ...formData.owner,
                legalEntityFullName: e.target.value,
                inn: formData.owner?.inn || '',
                headPosition: formData.owner?.headPosition || '',
                headFullName: formData.owner?.headFullName || '',
              })
            }
            placeholder="Полное наименование юридического лица..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerInn">ИНН ЮЛ</Label>
          <Input
            id="ownerInn"
            value={formData.owner?.inn || ''}
            onChange={(e) =>
              updateFormField('owner', {
                ...formData.owner,
                legalEntityFullName: formData.owner?.legalEntityFullName || '',
                inn: e.target.value,
                headPosition: formData.owner?.headPosition || '',
                headFullName: formData.owner?.headFullName || '',
              })
            }
            placeholder="1234567890"
            maxLength={12}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ownerHeadPosition">Должность руководителя</Label>
            <Input
              id="ownerHeadPosition"
              value={formData.owner?.headPosition || ''}
              onChange={(e) =>
                updateFormField('owner', {
                  ...formData.owner,
                  legalEntityFullName: formData.owner?.legalEntityFullName || '',
                  inn: formData.owner?.inn || '',
                  headPosition: e.target.value,
                  headFullName: formData.owner?.headFullName || '',
                })
              }
              placeholder="Генеральный директор"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerHeadFullName">ФИО руководителя</Label>
            <Input
              id="ownerHeadFullName"
              value={formData.owner?.headFullName || ''}
              onChange={(e) =>
                updateFormField('owner', {
                  ...formData.owner,
                  legalEntityFullName: formData.owner?.legalEntityFullName || '',
                  inn: formData.owner?.inn || '',
                  headPosition: formData.owner?.headPosition || '',
                  headFullName: e.target.value,
                })
              }
              placeholder="Иванов Иван Иванович"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsiblePersonId">Ответственное лицо</Label>
        <Select
          value={formData.responsiblePersonId || ''}
          onValueChange={(value) => {
            const employee = employees.find(e => e.id === value);
            updateFormField('responsiblePersonId', value);
            updateFormField('responsiblePersonName', employee?.fullName || '');
          }}
        >
          <SelectTrigger id="responsiblePersonId">
            <SelectValue placeholder="Выберите сотрудника" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.fullName} — {emp.position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
