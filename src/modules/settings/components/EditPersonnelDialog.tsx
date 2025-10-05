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
  const { updatePersonnel, getOrganizationsByTenant, getDepartmentsByOrganization } = useSettingsStore();
  const { toast } = useToast();

  const tenantOrgs = getOrganizationsByTenant(user!.tenantId!);

  const [formData, setFormData] = useState({
    fullName: personnel.fullName,
    position: personnel.position,
    email: personnel.email || '',
    phone: personnel.phone || '',
    organizationId: personnel.organizationId || '',
    departmentId: personnel.departmentId || '',
    role: personnel.role,
    status: personnel.status,
    hireDate: personnel.hireDate ? new Date(personnel.hireDate).toISOString().split('T')[0] : '',
    dismissalDate: personnel.dismissalDate ? new Date(personnel.dismissalDate).toISOString().split('T')[0] : ''
  });

  const departments = formData.organizationId 
    ? getDepartmentsByOrganization(formData.organizationId)
    : [];

  useEffect(() => {
    setFormData({
      fullName: personnel.fullName,
      position: personnel.position,
      email: personnel.email || '',
      phone: personnel.phone || '',
      organizationId: personnel.organizationId || '',
      departmentId: personnel.departmentId || '',
      role: personnel.role,
      status: personnel.status,
      hireDate: personnel.hireDate ? new Date(personnel.hireDate).toISOString().split('T')[0] : '',
      dismissalDate: personnel.dismissalDate ? new Date(personnel.dismissalDate).toISOString().split('T')[0] : ''
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

    if (formData.status === 'dismissed' && !formData.dismissalDate) {
      toast({
        title: 'Ошибка',
        description: 'Укажите дату увольнения',
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
      departmentId: formData.departmentId || undefined,
      role: formData.role,
      status: formData.status,
      hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString() : undefined,
      dismissalDate: formData.dismissalDate ? new Date(formData.dismissalDate).toISOString() : undefined
    });

    toast({
      title: 'Успешно',
      description: 'Данные сотрудника обновлены'
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Организация</Label>
              <Select 
                value={formData.organizationId} 
                onValueChange={(value) => setFormData({ ...formData, organizationId: value, departmentId: '' })}
              >
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

            <div className="space-y-2">
              <Label htmlFor="department">Подразделение</Label>
              <Select 
                value={formData.departmentId} 
                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                disabled={!formData.organizationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите подразделение" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Не указано</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'dismissed' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Действующий</SelectItem>
                  <SelectItem value="dismissed">Уволен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hireDate">Дата приема</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dismissalDate">Дата увольнения</Label>
              <Input
                id="dismissalDate"
                type="date"
                value={formData.dismissalDate}
                onChange={(e) => setFormData({ ...formData, dismissalDate: e.target.value })}
                disabled={formData.status === 'active'}
              />
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
