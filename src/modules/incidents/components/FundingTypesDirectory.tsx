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
import type { IncidentFundingType } from '@/types';

export default function FundingTypesDirectory() {
  const user = useAuthStore((state) => state.user);
  const { getFundingTypesByTenant, addFundingType, updateFundingType, deleteFundingType } = useIncidentsStore();
  const { toast } = useToast();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingFundingType, setEditingFundingType] = useState<IncidentFundingType | null>(null);
  const [formData, setFormData] = useState({ name: '', status: 'active' as const });

  const fundingTypes = user?.tenantId ? getFundingTypesByTenant(user.tenantId) : [];

  const handleSubmit = () => {
    if (!formData.name.trim() || !user?.tenantId) {
      toast({ title: 'Ошибка', description: 'Заполните название', variant: 'destructive' });
      return;
    }

    if (editingFundingType) {
      updateFundingType(editingFundingType.id, { name: formData.name, status: formData.status });
      toast({ title: 'Тип обеспечения обновлен' });
    } else {
      addFundingType({ tenantId: user.tenantId, name: formData.name, status: formData.status });
      toast({ title: 'Тип обеспечения добавлен' });
    }

    setFormData({ name: '', status: 'active' });
    setEditingFundingType(null);
    setShowDialog(false);
  };

  const handleEdit = (fundingType: IncidentFundingType) => {
    setEditingFundingType(fundingType);
    setFormData({ name: fundingType.name, status: fundingType.status });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить тип обеспечения?')) {
      deleteFundingType(id);
      toast({ title: 'Тип обеспечения удален' });
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setEditingFundingType(null);
    setFormData({ name: '', status: 'active' });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Обеспечение выполнения работ</h3>
            <p className="text-sm text-muted-foreground">
              Способы финансирования корректирующих мероприятий
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Icon name="Plus" size={16} />
            Добавить тип
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
              {fundingTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Нет данных
                  </TableCell>
                </TableRow>
              ) : (
                fundingTypes.map((fundingType) => (
                  <TableRow key={fundingType.id}>
                    <TableCell>{fundingType.name}</TableCell>
                    <TableCell>
                      <Badge variant={fundingType.status === 'active' ? 'default' : 'secondary'}>
                        {fundingType.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(fundingType)}>
                          <Icon name="Edit" size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(fundingType.id)}>
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
              <DialogTitle>{editingFundingType ? 'Редактировать тип обеспечения' : 'Добавить тип обеспечения'}</DialogTitle>
              <DialogDescription>
                Укажите способ обеспечения выполнения работ
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: CAPEX, OPEX, Силами площадки"
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
                {editingFundingType ? 'Сохранить' : 'Добавить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
