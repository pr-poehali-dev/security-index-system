import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Personnel } from '@/types';

interface EditPersonnelDialogProps {
  personnel: Personnel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPersonnelDialog({ personnel, open, onOpenChange }: EditPersonnelDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { updatePersonnel, getOrganizationsByTenant } = useSettingsStore();
  const { toast } = useToast();

  const tenantOrgs = getOrganizationsByTenant(user!.tenantId!);

  const [formData, setFormData] = useState({
    fullName: personnel.fullName,
    position: personnel.position,
    email: personnel.email || '',
    phone: personnel.phone || '',
    organizationId: personnel.organizationId || '',
    role: personnel.role,
    status: personnel.status
  });

  useEffect(() => {
    setFormData({
      fullName: personnel.fullName,
      position: personnel.position,
      email: personnel.email || '',
      phone: personnel.phone || '',
      organizationId: personnel.organizationId || '',
      role: personnel.role,
      status: personnel.status
    });
  }, [personnel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.position || !formData.role) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    updatePersonnel(personnel.id, {
      fullName: formData.fullName,
      position: formData.position,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      organizationId: formData.organizationId || undefined,
      role: formData.role,
      status: formData.status
    });

    toast({
      title: 'Успешно',
      description: 'Данные сотрудника обновлены'
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать сотрудника</DialogTitle>
          <DialogDescription>
            Изменение данных и роли пользователя
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">ФИО *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Иванов Иван Иванович"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Должность *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Инженер по охране труда"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Организация</Label>
            <Select value={formData.organizationId} onValueChange={(value) => setFormData({ ...formData, organizationId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите организацию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Не указана</SelectItem>
                {tenantOrgs.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Роль *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as typeof formData.role })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auditor">Аудитор</SelectItem>
                  <SelectItem value="Manager">Менеджер</SelectItem>
                  <SelectItem value="Director">Директор</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="inactive">Неактивен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ivanov@example.com"
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
