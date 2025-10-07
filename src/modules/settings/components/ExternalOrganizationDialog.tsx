import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ExternalOrganization, ExternalOrganizationType } from '@/types';
import Icon from '@/components/ui/icon';

interface ExternalOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: ExternalOrganization;
}

const organizationTypes: { value: ExternalOrganizationType; label: string; icon: string }[] = [
  { value: 'training_center', label: 'Учебный центр', icon: 'GraduationCap' },
  { value: 'contractor', label: 'Подрядчик', icon: 'Wrench' },
  { value: 'supplier', label: 'Поставщик', icon: 'Package' },
  { value: 'regulatory_body', label: 'Надзорный орган', icon: 'Shield' },
  { value: 'certification_body', label: 'Орган сертификации', icon: 'Award' },
  { value: 'other', label: 'Другое', icon: 'Building2' }
];

export default function ExternalOrganizationDialog({ open, onOpenChange, organization }: ExternalOrganizationDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addExternalOrganization, updateExternalOrganization } = useSettingsStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<ExternalOrganization>>({
    type: 'training_center',
    name: '',
    inn: '',
    kpp: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    accreditations: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    if (organization) {
      setFormData(organization);
    } else {
      setFormData({
        type: 'training_center',
        name: '',
        inn: '',
        kpp: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        website: '',
        accreditations: '',
        description: '',
        status: 'active'
      });
    }
  }, [organization, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast({ title: 'Ошибка', description: 'Укажите название организации', variant: 'destructive' });
      return;
    }

    if (!formData.type) {
      toast({ title: 'Ошибка', description: 'Выберите тип организации', variant: 'destructive' });
      return;
    }

    const orgData: ExternalOrganization = {
      id: organization?.id || crypto.randomUUID(),
      tenantId: user?.tenantId || '',
      type: formData.type as ExternalOrganizationType,
      name: formData.name.trim(),
      inn: formData.inn?.trim(),
      kpp: formData.kpp?.trim(),
      contactPerson: formData.contactPerson?.trim(),
      phone: formData.phone?.trim(),
      email: formData.email?.trim(),
      address: formData.address?.trim(),
      website: formData.website?.trim(),
      accreditations: formData.accreditations?.trim(),
      description: formData.description?.trim(),
      status: formData.status as 'active' | 'inactive' || 'active',
      createdAt: organization?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (organization) {
      updateExternalOrganization(orgData);
      toast({ title: 'Успешно', description: 'Организация обновлена' });
    } else {
      addExternalOrganization(orgData);
      toast({ title: 'Успешно', description: 'Организация добавлена' });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{organization ? 'Редактировать организацию' : 'Добавить организацию'}</DialogTitle>
          <DialogDescription>
            {organization ? 'Обновите информацию о сторонней организации' : 'Добавьте новую стороннюю организацию'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="type">Тип организации *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as ExternalOrganizationType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {organizationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon name={type.icon as any} size={16} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="name">Название организации *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ООО «Учебный центр»"
                required
              />
            </div>

            <div>
              <Label htmlFor="inn">ИНН</Label>
              <Input
                id="inn"
                value={formData.inn}
                onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                placeholder="1234567890"
                maxLength={12}
              />
            </div>

            <div>
              <Label htmlFor="kpp">КПП</Label>
              <Input
                id="kpp"
                value={formData.kpp}
                onChange={(e) => setFormData({ ...formData, kpp: e.target.value })}
                placeholder="123456789"
                maxLength={9}
              />
            </div>

            <div>
              <Label htmlFor="contactPerson">Контактное лицо</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Иванов Иван Иванович"
              />
            </div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@example.com"
              />
            </div>

            <div>
              <Label htmlFor="website">Веб-сайт</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="г. Москва, ул. Примерная, д. 1"
              />
            </div>

            {formData.type === 'training_center' && (
              <div className="col-span-2">
                <Label htmlFor="accreditations">Аккредитации</Label>
                <Textarea
                  id="accreditations"
                  value={formData.accreditations}
                  onChange={(e) => setFormData({ ...formData, accreditations: e.target.value })}
                  placeholder="Перечислите аккредитации и лицензии учебного центра"
                  rows={2}
                />
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="description">Примечание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Дополнительная информация об организации"
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Активна
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      Неактивна
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {organization ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}