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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TrainingLocation } from '@/types';

interface LocationDialogProps {
  location: TrainingLocation | null;
  onClose: () => void;
}

export default function LocationDialog({ location, onClose }: LocationDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addLocation, updateLocation } = useTrainingCenterStore();

  const [formData, setFormData] = useState({
    name: location?.name || '',
    address: location?.address || '',
    capacity: location?.capacity || 20,
    equipment: location?.equipment?.join(', ') || '',
    status: location?.status || 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.tenantId) return;

    const equipmentArray = formData.equipment
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (location) {
      updateLocation(location.id, {
        ...formData,
        equipment: equipmentArray,
      });
    } else {
      const newLocation: TrainingLocation = {
        id: crypto.randomUUID(),
        tenantId: user.tenantId,
        name: formData.name,
        address: formData.address,
        capacity: formData.capacity,
        equipment: equipmentArray,
        status: formData.status as 'active' | 'inactive',
        createdAt: new Date().toISOString(),
      };
      addLocation(newLocation);
    }

    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {location ? 'Редактировать место проведения' : 'Добавить место проведения'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Учебный класс №1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Адрес *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Укажите полный адрес"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Вместимость (человек) *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Оборудование</Label>
            <Input
              id="equipment"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              placeholder="Через запятую: проектор, доска, компьютеры"
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
                <SelectItem value="active">Активно</SelectItem>
                <SelectItem value="inactive">Неактивно</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">{location ? 'Сохранить' : 'Добавить'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
