import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CreateExaminationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateExaminationDialog({ open, onOpenChange }: CreateExaminationDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    objectId: '',
    type: '',
    scheduledDate: '',
    executor: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Диагностирование запланировано',
      description: 'Экспертиза успешно добавлена в план'
    });
    onOpenChange(false);
    setFormData({ objectId: '', type: '', scheduledDate: '', executor: '', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Запланировать диагностирование</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objectId">Объект</Label>
            <Select value={formData.objectId} onValueChange={(value) => setFormData({ ...formData, objectId: value })}>
              <SelectTrigger id="objectId">
                <SelectValue placeholder="Выберите объект" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Котельная №1</SelectItem>
                <SelectItem value="2">ГТС-01</SelectItem>
                <SelectItem value="3">Подстанция А</SelectItem>
                <SelectItem value="4">Насосная №2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Тип диагностирования</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">Экспертиза промышленной безопасности</SelectItem>
                <SelectItem value="diagnostics">Техническое диагностирование</SelectItem>
                <SelectItem value="testing">Испытания оборудования</SelectItem>
                <SelectItem value="inspection">Техническое освидетельствование</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Плановая дата</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="executor">Исполнитель (организация)</Label>
            <Input
              id="executor"
              value={formData.executor}
              onChange={(e) => setFormData({ ...formData, executor: e.target.value })}
              placeholder="ООО &quot;Экспертиза&quot;"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Примечание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Запланировать</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
