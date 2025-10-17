import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { FacilityComponent } from '@/types/facilities';

interface ComponentBasicInfoTabProps {
  formData: Partial<FacilityComponent>;
  updateFormField: <K extends keyof FacilityComponent>(field: K, value: FacilityComponent[K]) => void;
}

export default function ComponentBasicInfoTab({
  formData,
  updateFormField,
}: ComponentBasicInfoTabProps) {
  const user = useAuthStore((state) => state.user);
  const { getFacilitiesByTenant } = useFacilitiesStore();
  const facilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];

  return (
    <div className="space-y-4 p-1">
      <div className="space-y-2">
        <Label htmlFor="facilityId">Принадлежность к ОПО/ГТС *</Label>
        <Select
          value={formData.facilityId || ''}
          onValueChange={(value) => {
            const facility = facilities.find(f => f.id === value);
            updateFormField('facilityId', value);
            updateFormField('facilityName', facility?.fullName || '');
          }}
        >
          <SelectTrigger id="facilityId">
            <SelectValue placeholder="Выберите объект" />
          </SelectTrigger>
          <SelectContent>
            {facilities.map((facility) => (
              <SelectItem key={facility.id} value={facility.id}>
                {facility.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Тип компонента *</Label>
        <Select
          value={formData.type}
          onValueChange={(value: 'technical_device' | 'building_structure') => updateFormField('type', value)}
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical_device">Техническое устройство (ТУ)</SelectItem>
            <SelectItem value="building_structure">Здание / Сооружение (ЗС)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Полное наименование *</Label>
        <Input
          id="fullName"
          value={formData.fullName || ''}
          onChange={(e) => updateFormField('fullName', e.target.value)}
          placeholder="Полное наименование компонента..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortName">Краткое наименование</Label>
        <Input
          id="shortName"
          value={formData.shortName || ''}
          onChange={(e) => updateFormField('shortName', e.target.value)}
          placeholder="Краткое наименование..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deviceType">
            {formData.type === 'technical_device' ? 'Тип ТУ' : 'Тип ЗС'}
          </Label>
          <Input
            id="deviceType"
            value={formData.deviceType || ''}
            onChange={(e) => updateFormField('deviceType', e.target.value)}
            placeholder="Котел, насос, компрессор..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Марка</Label>
          <Input
            id="brand"
            value={formData.brand || ''}
            onChange={(e) => updateFormField('brand', e.target.value)}
            placeholder="Марка оборудования..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="manufacturer">Производитель</Label>
        <Input
          id="manufacturer"
          value={formData.manufacturer || ''}
          onChange={(e) => updateFormField('manufacturer', e.target.value)}
          placeholder="Наименование производителя..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="manufactureDate">Дата изготовления</Label>
          <Input
            id="manufactureDate"
            type="date"
            value={formData.manufactureDate || ''}
            onChange={(e) => updateFormField('manufactureDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="installationDate">Дата монтажа</Label>
          <Input
            id="installationDate"
            type="date"
            value={formData.installationDate || ''}
            onChange={(e) => updateFormField('installationDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commissioningDate">Дата ввода в эксплуатацию</Label>
          <Input
            id="commissioningDate"
            type="date"
            value={formData.commissioningDate || ''}
            onChange={(e) => updateFormField('commissioningDate', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="standardOperatingPeriod">Нормативный срок эксплуатации (лет)</Label>
        <Input
          id="standardOperatingPeriod"
          type="number"
          value={formData.standardOperatingPeriod || ''}
          onChange={(e) => updateFormField('standardOperatingPeriod', parseInt(e.target.value) || undefined)}
          placeholder="10"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="technicalStatus">Техническое состояние</Label>
          <Select
            value={formData.technicalStatus}
            onValueChange={(value: any) => updateFormField('technicalStatus', value)}
          >
            <SelectTrigger id="technicalStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operating">Действующее</SelectItem>
              <SelectItem value="needs_repair">Требуется ремонт</SelectItem>
              <SelectItem value="needs_replacement">Требуется замена</SelectItem>
              <SelectItem value="decommissioned">Выведено из эксплуатации</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="equipmentStatus">Статус оборудования</Label>
          <Select
            value={formData.equipmentStatus}
            onValueChange={(value: any) => updateFormField('equipmentStatus', value)}
          >
            <SelectTrigger id="equipmentStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="working">В работе</SelectItem>
              <SelectItem value="in_repair">В ремонте</SelectItem>
              <SelectItem value="decommissioned">Выведено из эксплуатации</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div className="space-y-0.5">
          <Label htmlFor="registeredInRostechnadzor">Регистрация в Ростехнадзоре</Label>
          <p className="text-sm text-muted-foreground">
            Зарегистрирован ли компонент в Ростехнадзоре
          </p>
        </div>
        <Switch
          id="registeredInRostechnadzor"
          checked={formData.registeredInRostechnadzor}
          onCheckedChange={(checked) => updateFormField('registeredInRostechnadzor', checked)}
        />
      </div>
    </div>
  );
}
