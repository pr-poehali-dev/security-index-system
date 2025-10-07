import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Personnel } from '@/types';
import { getFullName } from '@/lib/personnelUtils';

export default function PersonnelTab() {
  const { personnel, people, positions, tenants, addPersonnel, updatePersonnel, deletePersonnel } = useSettingsStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | undefined>();
  const [formData, setFormData] = useState({
    tenantId: '',
    personId: '',
    positionId: '',
    hireDate: '',
    fireDate: ''
  });

  const handleAdd = () => {
    setEditingPersonnel(undefined);
    setFormData({
      tenantId: tenants[0]?.id || '',
      personId: '',
      positionId: '',
      hireDate: new Date().toISOString().split('T')[0],
      fireDate: ''
    });
    setDialogOpen(true);
  };

  const handleEdit = (p: Personnel) => {
    setEditingPersonnel(p);
    setFormData({
      tenantId: p.tenantId,
      personId: p.personId,
      positionId: p.positionId,
      hireDate: p.hireDate,
      fireDate: p.fireDate || ''
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.personId || !formData.positionId) return;

    const data = {
      tenantId: formData.tenantId,
      personId: formData.personId,
      positionId: formData.positionId,
      hireDate: formData.hireDate,
      fireDate: formData.fireDate || undefined
    };

    if (editingPersonnel) {
      updatePersonnel(editingPersonnel.id, data);
    } else {
      addPersonnel(data);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить эту запись о персонале?')) {
      deletePersonnel(id);
    }
  };

  const getPersonnelInfo = (p: Personnel) => {
    const person = people?.find(person => person.id === p.personId);
    const position = positions?.find(pos => pos.id === p.positionId);
    const tenant = tenants?.find(t => t.id === p.tenantId);
    return {
      fullName: getFullName(person),
      positionName: position?.name || '—',
      tenantName: tenant?.name || '—'
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Персонал организаций</h2>
          <p className="text-sm text-muted-foreground">
            Управление назначениями сотрудников на должности
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Организация</TableHead>
              <TableHead>Дата приема</TableHead>
              <TableHead>Дата увольнения</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!personnel || personnel.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Нет данных. Добавьте первую запись.
                </TableCell>
              </TableRow>
            ) : (
              personnel.map((p) => {
                const info = getPersonnelInfo(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{info.fullName}</TableCell>
                    <TableCell>{info.positionName}</TableCell>
                    <TableCell>{info.tenantName}</TableCell>
                    <TableCell>{new Date(p.hireDate).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell>
                      {p.fireDate ? new Date(p.fireDate).toLocaleDateString('ru-RU') : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(p)}
                        >
                          <Icon name="Pencil" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPersonnel ? 'Редактировать запись' : 'Добавить сотрудника'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Организация</Label>
              <Select value={formData.tenantId} onValueChange={(v) => setFormData({ ...formData, tenantId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите организацию" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Человек *</Label>
              <Select value={formData.personId} onValueChange={(v) => setFormData({ ...formData, personId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите человека" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {getFullName(person)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Должность *</Label>
              <Select value={formData.positionId} onValueChange={(v) => setFormData({ ...formData, positionId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите должность" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Дата приема *</Label>
              <Input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Дата увольнения</Label>
              <Input
                type="date"
                value={formData.fireDate}
                onChange={(e) => setFormData({ ...formData, fireDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              {editingPersonnel ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}