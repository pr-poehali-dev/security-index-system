import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductionSite } from '@/types';

interface ProductionSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: ProductionSite;
}

export default function ProductionSiteDialog({ open, onOpenChange, site }: ProductionSiteDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addProductionSite, updateProductionSite, getOrganizationsByTenant } = useSettingsStore();

  const [formData, setFormData] = useState({
    organizationId: '',
    name: '',
    address: '',
    code: '',
    head: '',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });

  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];

  useEffect(() => {
    if (!open) return;
    
    if (site) {
      setFormData({
        organizationId: site.organizationId,
        name: site.name,
        address: site.address,
        code: site.code || '',
        head: site.head || '',
        phone: site.phone || '',
        status: site.status
      });
    } else {
      setFormData({
        organizationId: organizations[0]?.id || '',
        name: '',
        address: '',
        code: '',
        head: '',
        phone: '',
        status: 'active'
      });
    }
  }, [site, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (site) {
      updateProductionSite(site.id, formData);
    } else {
      addProductionSite({
        tenantId: user!.tenantId!,
        ...formData
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {site ? 'Редактировать площадку' : 'Новая производственная площадка'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizationId">
              Организация <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.organizationId}
              onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
              required
            >
              <SelectTrigger id="organizationId">
                <SelectValue placeholder="Выберите организацию" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Название площадки <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Производственная площадка №1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Адрес <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="г. Москва, ул. Промышленная, д. 1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Код площадки</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="ПП-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="head">Руководитель площадки</Label>
            <Input
              id="head"
              value={formData.head}
              onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              placeholder="Иванов И.И."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive') => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активна</SelectItem>
                <SelectItem value="inactive">Неактивна</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {site ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}