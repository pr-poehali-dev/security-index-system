import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useToast } from '@/hooks/use-toast';

interface OrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string | null;
}

export default function OrganizationDialog({
  open,
  onOpenChange,
  organizationId,
}: OrganizationDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { organizations, addOrganization, updateOrganization } = useFacilitiesStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    shortName: '',
    inn: '',
    kpp: '',
    ogrn: '',
    address: '',
    headPosition: '',
    headFullName: '',
    isActive: true,
  });

  useEffect(() => {
    if (organizationId) {
      const org = organizations.find((o) => o.id === organizationId);
      if (org) {
        setFormData({
          fullName: org.fullName,
          shortName: org.shortName || '',
          inn: org.inn,
          kpp: org.kpp || '',
          ogrn: org.ogrn || '',
          address: org.address,
          headPosition: org.headPosition,
          headFullName: org.headFullName,
          isActive: org.isActive,
        });
      }
    } else {
      setFormData({
        fullName: '',
        shortName: '',
        inn: '',
        kpp: '',
        ogrn: '',
        address: '',
        headPosition: '',
        headFullName: '',
        isActive: true,
      });
    }
  }, [organizationId, organizations]);

  const handleSubmit = () => {
    if (!user?.tenantId) return;
    
    if (!formData.fullName || !formData.inn || !formData.address) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    if (organizationId) {
      updateOrganization(organizationId, formData);
      toast({ title: 'Организация обновлена' });
    } else {
      addOrganization({
        ...formData,
        tenantId: user.tenantId,
      });
      toast({ title: 'Организация добавлена' });
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {organizationId ? 'Редактирование организации' : 'Добавление организации'}
          </DialogTitle>
          <DialogDescription>
            Укажите данные организации тенанта
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Полное наименование *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Общество с ограниченной ответственностью..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortName">Краткое наименование</Label>
            <Input
              id="shortName"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              placeholder="ООО..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inn">ИНН *</Label>
              <Input
                id="inn"
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

            <div className="space-y-2">
              <Label htmlFor="ogrn">ОГРН</Label>
              <Input
                id="ogrn"
                value={formData.ogrn}
                onChange={(e) => setFormData({ ...formData, ogrn: e.target.value })}
                placeholder="1234567890123"
                maxLength={13}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Адрес *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Город, улица, дом..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headPosition">Должность руководителя</Label>
            <Input
              id="headPosition"
              value={formData.headPosition}
              onChange={(e) => setFormData({ ...formData, headPosition: e.target.value })}
              placeholder="Генеральный директор"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headFullName">ФИО руководителя</Label>
            <Input
              id="headFullName"
              value={formData.headFullName}
              onChange={(e) => setFormData({ ...formData, headFullName: e.target.value })}
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Статус организации</Label>
              <p className="text-sm text-muted-foreground">
                Активная организация доступна для выбора
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            <Icon name="Check" size={16} className="mr-2" />
            {organizationId ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
