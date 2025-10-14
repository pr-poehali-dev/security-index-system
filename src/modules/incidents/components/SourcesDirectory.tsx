import { useState, useMemo } from 'react';
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
import type { IncidentSource } from '@/types';

export default function SourcesDirectory() {
  const user = useAuthStore((state) => state.user);
  const allSources = useIncidentsStore((state) => state.sources);
  const addSource = useIncidentsStore((state) => state.addSource);
  const updateSource = useIncidentsStore((state) => state.updateSource);
  const deleteSource = useIncidentsStore((state) => state.deleteSource);
  const { toast } = useToast();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<IncidentSource | null>(null);
  const [formData, setFormData] = useState({ name: '', status: 'active' as const });

  const sources = useMemo(() => 
    user?.tenantId ? allSources.filter(s => s.tenantId === user.tenantId) : []
  , [allSources, user?.tenantId]);

  const handleSubmit = () => {
    if (!formData.name.trim() || !user?.tenantId) {
      toast({ title: 'Ошибка', description: 'Заполните название', variant: 'destructive' });
      return;
    }

    if (editingSource) {
      updateSource(editingSource.id, { name: formData.name, status: formData.status });
      toast({ title: 'Источник обновлен' });
    } else {
      addSource({ tenantId: user.tenantId, name: formData.name, status: formData.status });
      toast({ title: 'Источник добавлен' });
    }

    setFormData({ name: '', status: 'active' });
    setEditingSource(null);
    setShowDialog(false);
  };

  const handleEdit = (source: IncidentSource) => {
    setEditingSource(source);
    setFormData({ name: source.name, status: source.status });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить источник?')) {
      deleteSource(id);
      toast({ title: 'Источник удален' });
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setEditingSource(null);
    setFormData({ name: '', status: 'active' });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Источники сообщений о несоответствиях</h3>
            <p className="text-sm text-muted-foreground">
              Определяет в рамках какого процесса выявлено несоответствие
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Icon name="Plus" size={16} />
            Добавить источник
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
              {sources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Нет данных
                  </TableCell>
                </TableRow>
              ) : (
                sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>{source.name}</TableCell>
                    <TableCell>
                      <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                        {source.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(source)}>
                          <Icon name="Edit" size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(source.id)}>
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
              <DialogTitle>{editingSource ? 'Редактировать источник' : 'Добавить источник'}</DialogTitle>
              <DialogDescription>
                Укажите название источника сообщений о несоответствиях
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Внутренняя проверка"
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
                {editingSource ? 'Сохранить' : 'Добавить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}