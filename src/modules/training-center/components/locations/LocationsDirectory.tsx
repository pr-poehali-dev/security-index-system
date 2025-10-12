import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTrainingCenterStore } from '@/stores/trainingCenterStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LocationDialog from './LocationDialog';
import type { TrainingLocation } from '@/types';

export default function LocationsDirectory() {
  const user = useAuthStore((state) => state.user);
  const { getLocationsByTenant, deleteLocation } = useTrainingCenterStore();

  const [editingLocation, setEditingLocation] = useState<TrainingLocation | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const locations = user?.tenantId ? getLocationsByTenant(user.tenantId) : [];

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить место проведения?')) {
      deleteLocation(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Места проведения занятий</h3>
            <Button onClick={() => setShowAddDialog(true)}>
              <Icon name="Plus" size={16} />
              Добавить место
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">№</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Адрес</TableHead>
                  <TableHead>Вместимость</TableHead>
                  <TableHead>Оборудование</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Нет данных
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((location, index) => (
                    <TableRow key={location.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell className="text-sm">{location.address}</TableCell>
                      <TableCell className="text-center">{location.capacity} чел.</TableCell>
                      <TableCell className="text-sm">
                        {location.equipment && location.equipment.length > 0
                          ? location.equipment.join(', ')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                          {location.status === 'active' ? 'Активно' : 'Неактивно'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingLocation(location)}
                          >
                            <Icon name="Edit" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(location.id)}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {(editingLocation || showAddDialog) && (
        <LocationDialog
          location={editingLocation}
          onClose={() => {
            setEditingLocation(null);
            setShowAddDialog(false);
          }}
        />
      )}
    </div>
  );
}
