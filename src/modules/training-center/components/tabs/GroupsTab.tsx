import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTrainingCenterStore } from '@/stores/trainingCenterStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GroupDialog from '../groups/GroupDialog';
import type { TrainingGroup } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  planned: 'Запланирована',
  in_progress: 'В процессе',
  completed: 'Завершена',
  cancelled: 'Отменена',
};

export default function GroupsTab() {
  const user = useAuthStore((state) => state.user);
  const { getGroupsByTenant, getProgramsByTenant, deleteGroup } = useTrainingCenterStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingGroup, setEditingGroup] = useState<TrainingGroup | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const groups = user?.tenantId ? getGroupsByTenant(user.tenantId) : [];
  const programs = user?.tenantId ? getProgramsByTenant(user.tenantId) : [];

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || group.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [groups, searchTerm, statusFilter]);

  const getProgramName = (programId: string) => {
    return programs.find((p) => p.id === programId)?.name || '—';
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить группу?')) {
      deleteGroup(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, BadgeVariant> = {
      planned: 'secondary',
      in_progress: 'default',
      completed: 'outline',
      cancelled: 'destructive',
    };

    return <Badge variant={variants[status]}>{STATUS_LABELS[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Учебные группы</h3>
            <Button onClick={() => setShowAddDialog(true)}>
              <Icon name="Plus" size={16} />
              Создать группу
            </Button>
          </div>

          <div className="flex gap-4 mb-4 flex-wrap">
            <Input
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="planned">Запланирована</SelectItem>
                <SelectItem value="in_progress">В процессе</SelectItem>
                <SelectItem value="completed">Завершена</SelectItem>
                <SelectItem value="cancelled">Отменена</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">№</TableHead>
                  <TableHead>Название группы</TableHead>
                  <TableHead>Программа</TableHead>
                  <TableHead>Начало</TableHead>
                  <TableHead>Окончание</TableHead>
                  <TableHead>Расписание</TableHead>
                  <TableHead>Студентов</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Нет данных
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((group, index) => (
                    <TableRow key={group.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell className="text-sm">{getProgramName(group.programId)}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(group.startDate).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(group.endDate).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell className="text-sm">{group.schedule}</TableCell>
                      <TableCell className="text-center">
                        {group.enrolledCount} / {group.maxStudents}
                      </TableCell>
                      <TableCell>{getStatusBadge(group.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingGroup(group)}
                          >
                            <Icon name="Edit" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(group.id)}
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

      {(editingGroup || showAddDialog) && (
        <GroupDialog
          group={editingGroup}
          onClose={() => {
            setEditingGroup(null);
            setShowAddDialog(false);
          }}
        />
      )}
    </div>
  );
}