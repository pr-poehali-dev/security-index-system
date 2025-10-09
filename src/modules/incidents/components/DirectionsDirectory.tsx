import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IncidentDirection } from '@/types';

export default function DirectionsDirectory() {
  const user = useAuthStore((state) => state.user);
  const { getDirectionsByTenant, addDirection, updateDirection, deleteDirection } = useIncidentsStore();
  const { toast } = useToast();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingDirection, setEditingDirection] = useState<IncidentDirection | null>(null);
  const [formData, setFormData] = useState({ name: '', status: 'active' as const });

  const directions = user?.tenantId ? getDirectionsByTenant(user.tenantId) : [];

  const handleSubmit = () => {
    if (!formData.name.trim() || !user?.tenantId) {
      toast({ title: 'Ошибка', description: 'Заполните название', variant: 'destructive' });
      return;
    }

    if (editingDirection) {
      updateDirection(editingDirection.id, { name: formData.name, status: formData.status });
      toast({ title: 'Направление обновлено' });
    } else {
      addDirection({ tenantId: user.tenantId, name: formData.name, status: formData.status });
      toast({ title: 'Направление добавлено' });
    }

    setFormData({ name: '', status: 'active' });
    setEditingDirection(null);
    setShowDialog(false);
  };

  const handleEdit = (direction: IncidentDirection) => {
    setEditingDirection(direction);
    setFormData({ name: direction.name, status: direction.status });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить направление?')) {
      deleteDirection(id);
      toast({ title: 'Направление удалено' });
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setEditingDirection(null);
    setFormData({ name: '', status: 'active' });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Направления деятельности</h3>
            <p className="text-sm text-muted-foreground">
              Области, в рамках которых выявляются несоответствия
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Icon name="Plus" size={16} />
            Добавить направление
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-24">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {directions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Нет данных
                  </TableCell>
                </TableRow>
              ) : (
                directions.map((direction) => (
                  <TableRow key={direction.id}>
                    <TableCell>{direction.name}</TableCell>
                    <TableCell>
                      <Badge variant={direction.status === 'active' ? 'default' : 'secondary'}>
                        {direction.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(direction)}>
                          <Icon name="Edit" size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(direction.id)}>
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

        <Dialog open={showDialog} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDirection ? 'Редактировать направление' : 'Добавить направление'}</DialogTitle>
              <DialogDescription>
                Укажите направление деятельности
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Промышленная безопасность"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="inactive">Неактивен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose}>
                Отмена
              </Button>
              <Button onClick={handleSubmit}>
                {editingDirection ? 'Сохранить' : 'Добавить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
