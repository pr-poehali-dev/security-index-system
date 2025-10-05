import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddDepartmentDialog({ open, onOpenChange }: AddDepartmentDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { getOrganizationsByTenant, getDepartmentsByTenant, addDepartment } = useSettingsStore();
  const { toast } = useToast();

  const tenantOrgs = getOrganizationsByTenant(user!.tenantId!);
  const tenantDepts = getDepartmentsByTenant(user!.tenantId!);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    head: '',
    organizationId: '',
    parentId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.organizationId) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    addDepartment({
      tenantId: user!.tenantId!,
      name: formData.name,
      code: formData.code || undefined,
      head: formData.head || undefined,
      organizationId: formData.organizationId,
      parentId: formData.parentId || undefined,
      status: 'active'
    });

    toast({
      title: 'Успешно',
      description: 'Подразделение добавлено'
    });

    setFormData({ name: '', code: '', head: '', organizationId: '', parentId: '' });
    onOpenChange(false);
  };

  const availableParentDepts = formData.organizationId 
    ? tenantDepts.filter(d => d.organizationId === formData.organizationId)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить подразделение</DialogTitle>
          <DialogDescription>
            Создание нового подразделения в организации
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizationId">Организация *</Label>
            <Select 
              value={formData.organizationId} 
              onValueChange={(value) => setFormData({ ...formData, organizationId: value, parentId: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите организацию" />
              </SelectTrigger>
              <SelectContent>
                {tenantOrgs.map((org) => (
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
              placeholder="Отдел охраны труда"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Код</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="ООТ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="head">Руководитель</Label>
              <Input
                id="head"
                value={formData.head}
                onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                placeholder="Иванов И.И."
              />
            </div>
          </div>

          {availableParentDepts.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="parentId">Входит в подразделение (необязательно)</Label>
              <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Нет родительского подразделения" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Нет</SelectItem>
                  {availableParentDepts.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
