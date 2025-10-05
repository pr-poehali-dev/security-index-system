import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { IncidentPriority } from '@/types/incidents';

interface CreateIncidentDialogProps {
  incidentTypes: Array<{ id: string; name: string }>;
  objects: Array<{ id: string; name: string }>;
  onSubmit: (data: {
    title: string;
    description: string;
    typeId: string;
    priority: IncidentPriority;
    objectId: string;
    dueDate: string;
  }) => void;
}

export default function CreateIncidentDialog({ 
  incidentTypes, 
  objects, 
  onSubmit 
}: CreateIncidentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    typeId: '',
    priority: 'medium' as IncidentPriority,
    objectId: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setIsOpen(false);
    setFormData({
      title: '',
      description: '',
      typeId: '',
      priority: 'medium',
      objectId: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Icon name="Plus" size={18} />
          Зарегистрировать инцидент
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Регистрация инцидента</DialogTitle>
            <DialogDescription>
              Заполните данные о нештатной ситуации
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название инцидента *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeId">Тип инцидента *</Label>
                <Select value={formData.typeId} onValueChange={(value) => setFormData({ ...formData, typeId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Приоритет *</Label>
                <Select value={formData.priority} onValueChange={(value: IncidentPriority) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Критический</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="low">Низкий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="objectId">Объект *</Label>
                <Select value={formData.objectId} onValueChange={(value) => setFormData({ ...formData, objectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите объект" />
                  </SelectTrigger>
                  <SelectContent>
                    {objects.map((obj) => (
                      <SelectItem key={obj.id} value={obj.id}>{obj.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Срок устранения *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                <Icon name="Plus" className="mr-2" size={18} />
                Зарегистрировать
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
