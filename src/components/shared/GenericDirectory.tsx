import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
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

interface DirectoryItem {
  id: string;
  tenantId: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface GenericDirectoryProps<T extends DirectoryItem> {
  title: string;
  description: string;
  addButtonLabel?: string;
  inputPlaceholder?: string;
  statusActiveLabel?: string;
  statusInactiveLabel?: string;
  entityNameSingular?: string;
  items: T[];
  onAdd: (item: Omit<T, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<T>) => void;
  onDelete: (id: string) => void;
  validateDelete?: (item: T) => { canDelete: boolean; message?: string };
  renderExtraColumns?: (item: T) => React.ReactNode;
  extraColumnHeaders?: React.ReactNode;
}

export default function GenericDirectory<T extends DirectoryItem>({
  title,
  description,
  addButtonLabel = 'Добавить',
  inputPlaceholder = 'Введите название',
  statusActiveLabel = 'Активен',
  statusInactiveLabel = 'Неактивен',
  entityNameSingular = 'элемент',
  items: allItems,
  onAdd,
  onUpdate,
  onDelete,
  validateDelete,
  renderExtraColumns,
  extraColumnHeaders,
}: GenericDirectoryProps<T>) {
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();

  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState({ name: '', status: 'active' as const });

  const items = useMemo(
    () => (user?.tenantId ? allItems.filter((item) => item.tenantId === user.tenantId) : []),
    [allItems, user?.tenantId]
  );

  const handleSubmit = () => {
    if (!formData.name.trim() || !user?.tenantId) {
      toast({ title: 'Ошибка', description: 'Заполните название', variant: 'destructive' });
      return;
    }

    if (editingItem) {
      onUpdate(editingItem.id, { name: formData.name, status: formData.status } as Partial<T>);
      toast({ title: `${entityNameSingular} обновлен` });
    } else {
      onAdd({ tenantId: user.tenantId, name: formData.name, status: formData.status } as Omit<T, 'id' | 'createdAt'>);
      toast({ title: `${entityNameSingular} добавлен` });
    }

    setFormData({ name: '', status: 'active' });
    setEditingItem(null);
    setShowDialog(false);
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setFormData({ name: item.name, status: item.status });
    setShowDialog(true);
  };

  const handleDelete = (item: T) => {
    if (validateDelete) {
      const validation = validateDelete(item);
      if (!validation.canDelete) {
        toast({
          title: 'Ошибка',
          description: validation.message || `Невозможно удалить ${entityNameSingular}`,
          variant: 'destructive',
        });
        return;
      }
    }

    if (confirm(`Удалить ${entityNameSingular}?`)) {
      onDelete(item.id);
      toast({ title: `${entityNameSingular} удален` });
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setEditingItem(null);
    setFormData({ name: '', status: 'active' });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Icon name="Plus" size={16} />
            {addButtonLabel}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Статус</TableHead>
                {extraColumnHeaders}
                <TableHead className="w-24">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3 + (extraColumnHeaders ? 1 : 0)} className="text-center text-muted-foreground py-8">
                    Нет данных
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status === 'active' ? statusActiveLabel : statusInactiveLabel}
                      </Badge>
                    </TableCell>
                    {renderExtraColumns && renderExtraColumns(item)}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Icon name="Edit" size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
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
              <DialogTitle>{editingItem ? `Редактировать ${entityNameSingular}` : `Добавить ${entityNameSingular}`}</DialogTitle>
              <DialogDescription>Укажите данные {entityNameSingular}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={inputPlaceholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as 'active' | 'inactive' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{statusActiveLabel}</SelectItem>
                    <SelectItem value="inactive">{statusInactiveLabel}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose}>
                Отмена
              </Button>
              <Button onClick={handleSubmit}>{editingItem ? 'Сохранить' : 'Добавить'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
