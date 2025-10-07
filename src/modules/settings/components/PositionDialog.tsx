import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/hooks/use-toast';
import type { Position } from '@/types';

interface PositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: Position;
}

export default function PositionDialog({ open, onOpenChange, position }: PositionDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addPosition, updatePosition } = useSettingsStore();
  const { toast } = useToast();
  const isEdit = !!position;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'specialist' as Position['category'],
    description: '',
    status: 'active' as Position['status']
  });

  useEffect(() => {
    if (position) {
      setFormData({
        name: position.name,
        code: position.code || '',
        category: position.category,
        description: position.description || '',
        status: position.status
      });
    } else {
      setFormData({
        name: '',
        code: '',
        category: 'specialist',
        description: '',
        status: 'active'
      });
    }
  }, [position, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Укажите название должности',
        variant: 'destructive'
      });
      return;
    }

    if (isEdit) {
      updatePosition(position.id, formData);
      toast({ title: 'Должность обновлена', description: 'Изменения успешно сохранены' });
    } else {
      addPosition({
        ...formData,
        tenantId: user!.tenantId!,
        code: formData.code || undefined,
        description: formData.description || undefined
      });
      toast({ title: 'Должность добавлена', description: 'Новая должность успешно создана' });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактирование должности' : 'Добавление должности'}</DialogTitle>
          <DialogDescription>
            Укажите название, категорию и описание должности
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название должности *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Инженер по охране труда"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Код должности</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Например: OT-ENG"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as Position['category'] })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="management">Руководство</SelectItem>
                  <SelectItem value="specialist">Специалист</SelectItem>
                  <SelectItem value="worker">Рабочий</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Краткое описание должности и обязанностей"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Position['status'] })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активная</SelectItem>
                <SelectItem value="inactive">Неактивная</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {isEdit ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
