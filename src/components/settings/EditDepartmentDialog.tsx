import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Department } from '@/types';

interface EditDepartmentDialogProps {
  department: Department;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDepartmentDialog({ department, open, onOpenChange }: EditDepartmentDialogProps) {
  const { departments, updateDepartment } = useSettingsStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: department.name,
    code: department.code || '',
    head: department.head || '',
    parentId: department.parentId || '',
    status: department.status
  });

  useEffect(() => {
    setFormData({
      name: department.name,
      code: department.code || '',
      head: department.head || '',
      parentId: department.parentId || '',
      status: department.status
    });
  }, [department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    updateDepartment(department.id, {
      name: formData.name,
      code: formData.code || undefined,
      head: formData.head || undefined,
      parentId: formData.parentId || undefined,
      status: formData.status
    });

    toast({
      title: 'Успешно',
      description: 'Подразделение обновлено'
    });

    onOpenChange(false);
  };

  const availableParentDepts = departments.filter(
    d => d.organizationId === department.organizationId && d.id !== department.id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать подразделение</DialogTitle>
          <DialogDescription>
            Изменение данных подразделения
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="parentId">Входит в подразделение</Label>
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

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активно</SelectItem>
                <SelectItem value="inactive">Неактивно</SelectItem>
              </SelectContent>
            </Select>
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
