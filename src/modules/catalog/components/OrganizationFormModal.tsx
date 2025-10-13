import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCatalogStore } from '@/stores/catalogStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import type { Organization } from '@/types/catalog';

interface OrganizationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: Organization;
  mode: 'create' | 'edit';
}

export default function OrganizationFormModal({
  open,
  onOpenChange,
  organization,
  mode
}: OrganizationFormModalProps) {
  const { addOrganization, updateOrganization, organizations } = useCatalogStore();
  const currentTenant = useAuthStore((state) => state.currentTenant);

  const [formData, setFormData] = useState({
    name: '',
    inn: '',
    type: 'legal_entity' as Organization['type'],
    parentId: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (organization && mode === 'edit') {
      setFormData({
        name: organization.name,
        inn: organization.inn || '',
        type: organization.type,
        parentId: organization.parentId || '',
        contactPerson: organization.contactPerson || '',
        phone: organization.phone || '',
        email: organization.email || '',
        address: organization.address || ''
      });
    } else {
      setFormData({
        name: '',
        inn: '',
        type: 'legal_entity',
        parentId: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: ''
      });
    }
    setErrors({});
  }, [organization, mode, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Укажите название организации';
    }

    if (formData.inn && !/^\d{10}$|^\d{12}$/.test(formData.inn)) {
      newErrors.inn = 'ИНН должен содержать 10 или 12 цифр';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (formData.phone && !/^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/.test(formData.phone)) {
      newErrors.phone = 'Неверный формат телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const parentOrg = formData.parentId 
        ? organizations.find(org => org.id === formData.parentId)
        : null;

      const level = parentOrg ? parentOrg.level + 1 : 0;

      if (mode === 'create') {
        addOrganization({
          tenantId: currentTenant?.id || 'tenant-1',
          name: formData.name.trim(),
          inn: formData.inn.trim() || undefined,
          type: formData.type,
          parentId: formData.parentId || undefined,
          level,
          contactPerson: formData.contactPerson.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          address: formData.address.trim() || undefined
        });
        toast.success('Организация успешно создана');
      } else if (organization) {
        updateOrganization(organization.id, {
          name: formData.name.trim(),
          inn: formData.inn.trim() || undefined,
          type: formData.type,
          parentId: formData.parentId || undefined,
          level,
          contactPerson: formData.contactPerson.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          address: formData.address.trim() || undefined
        });
        toast.success('Организация успешно обновлена');
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(mode === 'create' 
        ? 'Ошибка при создании организации' 
        : 'Ошибка при обновлении организации'
      );
    }
  };

  const availableParentOrgs = organizations.filter(org => 
    org.id !== organization?.id && 
    (org.type === 'holding' || org.type === 'legal_entity')
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Building2" size={20} />
            {mode === 'create' ? 'Добавить организацию' : 'Редактировать организацию'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Заполните данные для создания новой организации в системе' 
              : 'Обновите данные организации'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">
                Название организации <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ООО «Энергопром»"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inn">ИНН</Label>
              <Input
                id="inn"
                value={formData.inn}
                onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                placeholder="7707123456"
                maxLength={12}
                className={errors.inn ? 'border-red-500' : ''}
              />
              {errors.inn && <p className="text-sm text-red-500">{errors.inn}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Тип организации <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as Organization['type'] })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="holding">Холдинг</SelectItem>
                  <SelectItem value="legal_entity">Юридическое лицо</SelectItem>
                  <SelectItem value="branch">Филиал</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {availableParentOrgs.length > 0 && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="parentId">Головная организация</Label>
                <Select
                  value={formData.parentId || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value === 'none' ? '' : value })}
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="Нет (корневая организация)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Нет (корневая организация)</SelectItem>
                    {availableParentOrgs.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Юридический адрес</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="г. Москва, ул. Промышленная, д. 1"
                rows={2}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-base font-semibold">Контактные данные</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Контактное лицо</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Иванов Иван Иванович"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (495) 123-45-67"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@energoprom.ru"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              <Icon name={mode === 'create' ? 'Plus' : 'Save'} size={16} className="mr-2" />
              {mode === 'create' ? 'Создать' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}