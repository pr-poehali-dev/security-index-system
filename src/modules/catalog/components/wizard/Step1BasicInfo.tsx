import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCatalogStore } from '@/stores/catalogStore';
import { useReferencesStore } from '@/stores/referencesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { WizardFormData } from './OpoFormWizard';

interface Step1BasicInfoProps {
  formData: WizardFormData;
  updateFormData: (data: Partial<WizardFormData>) => void;
}

export default function Step1BasicInfo({ formData, updateFormData }: Step1BasicInfoProps) {
  const { organizations } = useCatalogStore();
  const { typicalOpoNames } = useReferencesStore();
  const { personnel, people, positions } = useSettingsStore();

  const selectedOrgPersonnel = formData.organizationId
    ? personnel.filter(p => p.organizationId === formData.organizationId && p.status === 'active')
    : [];

  const getPersonnelDisplay = (personnelItem: typeof personnel[0]) => {
    const person = people.find(p => p.id === personnelItem.personId);
    const position = positions.find(p => p.id === personnelItem.positionId);
    
    if (!person || !position) return null;
    
    const fullName = `${person.lastName} ${person.firstName} ${person.middleName || ''}`.trim();
    return { fullName, positionName: position.name };
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Раздел 1: Основные сведения</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Полное наименование ОПО <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="Котельная №1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">
              Регистрационный номер <span className="text-red-500">*</span>
            </Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => updateFormData({ registrationNumber: e.target.value })}
              placeholder="A-78-001234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="typicalNameId">
              Типовое наименование <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.typicalNameId}
              onValueChange={(value) => updateFormData({ typicalNameId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите из справочника" />
              </SelectTrigger>
              <SelectContent>
                {typicalOpoNames.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.code} - {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industryCode">
              Код отраслевой принадлежности
            </Label>
            <Input
              id="industryCode"
              value={formData.industryCode}
              onChange={(e) => updateFormData({ industryCode: e.target.value })}
              placeholder="Например: 35.30"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Адрес местонахождения ОПО</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Индекс</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => updateFormData({ postalCode: e.target.value })}
              placeholder="190000"
              maxLength={6}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="region">
              Субъект РФ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) => updateFormData({ region: e.target.value })}
              placeholder="г. Санкт-Петербург"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="city">
              Город/Населенный пункт <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              placeholder="Санкт-Петербург"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="oktmo">ОКТМО</Label>
            <Input
              id="oktmo"
              value={formData.oktmo}
              onChange={(e) => updateFormData({ oktmo: e.target.value })}
              placeholder="40304000"
              maxLength={11}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="street">
              Улица <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => updateFormData({ street: e.target.value })}
              placeholder="ул. Тепловая"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="building">
              Дом, корпус <span className="text-red-500">*</span>
            </Label>
            <Input
              id="building"
              value={formData.building}
              onChange={(e) => updateFormData({ building: e.target.value })}
              placeholder="д. 5, корп. 1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Дополнительные сведения</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="commissioningDate">
              Дата ввода в эксплуатацию <span className="text-red-500">*</span>
            </Label>
            <Input
              id="commissioningDate"
              type="date"
              value={formData.commissioningDate}
              onChange={(e) => updateFormData({ commissioningDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => updateFormData({ status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="conservation">На консервации</SelectItem>
                <SelectItem value="liquidated">Ликвидирован</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationId">
              Эксплуатирующая организация <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.organizationId}
              onValueChange={(value) => {
                updateFormData({ organizationId: value, responsiblePersonId: '' });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите организацию" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {'  '.repeat(org.level)}{org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerId">
              Собственник ОПО
            </Label>
            <Select
              value={formData.ownerId}
              onValueChange={(value) => updateFormData({ ownerId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите организацию" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {'  '.repeat(org.level)}{org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="responsiblePersonId">
              Ответственное лицо <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.responsiblePersonId}
              onValueChange={(value) => updateFormData({ responsiblePersonId: value })}
              disabled={!formData.organizationId}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.organizationId ? "Выберите сотрудника" : "Сначала выберите организацию"} />
              </SelectTrigger>
              <SelectContent>
                {selectedOrgPersonnel.map((personnelItem) => {
                  const display = getPersonnelDisplay(personnelItem);
                  if (!display) return null;
                  
                  return (
                    <SelectItem key={personnelItem.id} value={personnelItem.id}>
                      {display.fullName} — {display.positionName}
                    </SelectItem>
                  );
                })}
                {selectedOrgPersonnel.length === 0 && formData.organizationId && (
                  <SelectItem value="no-personnel" disabled>
                    Нет сотрудников в выбранной организации
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}