import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTrainingCenterStore } from '@/stores/trainingCenterStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TrainingProgram } from '@/types';

interface ProgramDialogProps {
  program: TrainingProgram | null;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'industrial_safety', label: 'Промышленная безопасность' },
  { value: 'labor_safety', label: 'Охрана труда' },
  { value: 'energy_safety', label: 'Энергетическая безопасность' },
  { value: 'ecology', label: 'Экология' },
  { value: 'professional', label: 'Профессиональная подготовка' },
  { value: 'other', label: 'Другое' },
];

export default function ProgramDialog({ program, onClose }: ProgramDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addProgram, updateProgram } = useTrainingCenterStore();

  const [formData, setFormData] = useState({
    name: program?.name || '',
    code: program?.code || '',
    category: program?.category || 'professional',
    durationHours: program?.durationHours || 40,
    validityMonths: program?.validityMonths || 12,
    description: program?.description || '',
    minStudents: program?.minStudents || 5,
    maxStudents: program?.maxStudents || 20,
    cost: program?.cost || 0,
    requiresExam: program?.requiresExam || false,
    status: program?.status || 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.tenantId) return;

    if (program) {
      updateProgram(program.id, formData);
    } else {
      const newProgram: TrainingProgram = {
        id: crypto.randomUUID(),
        tenantId: user.tenantId,
        ...formData,
        competencyIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addProgram(newProgram);
    }

    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {program ? 'Редактировать программу' : 'Добавить программу'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Код программы *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Название программы *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationHours">Длительность (часов) *</Label>
              <Input
                id="durationHours"
                type="number"
                min="1"
                value={formData.durationHours}
                onChange={(e) =>
                  setFormData({ ...formData, durationHours: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validityMonths">Срок действия (месяцев) *</Label>
              <Input
                id="validityMonths"
                type="number"
                min="1"
                value={formData.validityMonths}
                onChange={(e) =>
                  setFormData({ ...formData, validityMonths: parseInt(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minStudents">Мин. студентов *</Label>
              <Input
                id="minStudents"
                type="number"
                min="1"
                value={formData.minStudents}
                onChange={(e) =>
                  setFormData({ ...formData, minStudents: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStudents">Макс. студентов *</Label>
              <Input
                id="maxStudents"
                type="number"
                min="1"
                value={formData.maxStudents}
                onChange={(e) =>
                  setFormData({ ...formData, maxStudents: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Стоимость (₽) *</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="requiresExam"
                checked={formData.requiresExam}
                onCheckedChange={(checked) => setFormData({ ...formData, requiresExam: checked })}
              />
              <Label htmlFor="requiresExam">Требуется экзамен</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активна</SelectItem>
                  <SelectItem value="inactive">Неактивна</SelectItem>
                  <SelectItem value="archived">В архиве</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">{program ? 'Сохранить' : 'Добавить'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
