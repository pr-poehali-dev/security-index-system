import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TrainingGroup } from '@/types';

interface GroupDialogProps {
  group: TrainingGroup | null;
  onClose: () => void;
}

export default function GroupDialog({ group, onClose }: GroupDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addGroup, updateGroup, getProgramsByTenant, getLocationsByTenant, getInstructorsByTenant } = useTrainingCenterStore();

  const programs = user?.tenantId ? getProgramsByTenant(user.tenantId) : [];
  const locations = user?.tenantId ? getLocationsByTenant(user.tenantId) : [];
  const instructors = user?.tenantId ? getInstructorsByTenant(user.tenantId) : [];

  const [formData, setFormData] = useState({
    name: group?.name || '',
    programId: group?.programId || '',
    startDate: group?.startDate ? group.startDate.split('T')[0] : '',
    endDate: group?.endDate ? group.endDate.split('T')[0] : '',
    schedule: group?.schedule || '',
    instructorId: group?.instructorId || '',
    locationId: group?.locationId || '',
    maxStudents: group?.maxStudents || 20,
    status: group?.status || 'planned',
    notes: group?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.tenantId) return;

    if (group) {
      updateGroup(group.id, {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });
    } else {
      const newGroup: TrainingGroup = {
        id: crypto.randomUUID(),
        tenantId: user.tenantId,
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        enrolledCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addGroup(newGroup);
    }

    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {group ? 'Редактировать группу' : 'Создать группу'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название группы *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Группа ПБ-01/2025"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="programId">Учебная программа *</Label>
            <Select
              value={formData.programId}
              onValueChange={(value) => setFormData({ ...formData, programId: value })}
            >
              <SelectTrigger id="programId">
                <SelectValue placeholder="Выберите программу" />
              </SelectTrigger>
              <SelectContent>
                {programs.filter(p => p.status === 'active').map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name} ({program.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Расписание *</Label>
            <Input
              id="schedule"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="Например: Пн, Ср, Пт 18:00-21:00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instructorId">Преподаватель</Label>
              <Select
                value={formData.instructorId}
                onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
              >
                <SelectTrigger id="instructorId">
                  <SelectValue placeholder="Выберите преподавателя" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.filter(i => i.status === 'active').map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      Преподаватель {instructor.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationId">Место проведения</Label>
              <Select
                value={formData.locationId}
                onValueChange={(value) => setFormData({ ...formData, locationId: value })}
              >
                <SelectTrigger id="locationId">
                  <SelectValue placeholder="Выберите место" />
                </SelectTrigger>
                <SelectContent>
                  {locations.filter(l => l.status === 'active').map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Макс. количество студентов *</Label>
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
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Запланирована</SelectItem>
                  <SelectItem value="in_progress">В процессе</SelectItem>
                  <SelectItem value="completed">Завершена</SelectItem>
                  <SelectItem value="cancelled">Отменена</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">{group ? 'Сохранить' : 'Создать'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
