import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
}

export default function AddOrganizationDialog({ open, onOpenChange, parentId }: AddOrganizationDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addOrganization, getOrganizationsByTenant } = useSettingsStore();
  const { toast } = useToast();

  const rootOrgs = getOrganizationsByTenant(user!.tenantId!).filter(org => !org.parentId);

  const [formData, setFormData] = useState({
    name: '',
    inn: '',
    kpp: '',
    address: '',
    parentId: parentId || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || (!formData.parentId && !formData.inn)) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    const parentOrg = formData.parentId ? rootOrgs.find(o => o.id === formData.parentId) : null;

    addOrganization({
      tenantId: user!.tenantId!,
      parentId: formData.parentId || undefined,
      name: formData.name,
      inn: formData.parentId && parentOrg ? parentOrg.inn : formData.inn,
      kpp: formData.kpp || undefined,
      address: formData.address || undefined,
      status: 'active'
    });

    toast({
      title: 'Успешно',
      description: formData.parentId ? 'Подразделение добавлено' : 'Организация добавлена'
    });

    setFormData({ name: '', inn: '', kpp: '', address: '', parentId: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{formData.parentId ? 'Добавить подразделение' : 'Добавить организацию'}</DialogTitle>
          <DialogDescription>
            {formData.parentId ? 'Создание подразделения в составе организации' : 'Создание новой организации в рамках тенанта'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parentId">Родительская организация</Label>
            <Select 
              value={formData.parentId} 
              onValueChange={(value) => setFormData({ ...formData, parentId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Без родительской (новая организация)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без родительской (новая организация)</SelectItem>
                {rootOrgs.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Наименование *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={formData.parentId ? 'Отдел охраны труда' : 'ООО «Название»'}
              required
            />
          </div>

          {!formData.parentId && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inn">ИНН *</Label>
                <Input
                  id="inn"
                  value={formData.inn}
                  onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  placeholder="1234567890"
                  maxLength={12}
                  required
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
            </div>
          )}

          {!formData.parentId && (
            <div className="space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="г. Москва, ул. Примерная, д. 1"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Добавить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
