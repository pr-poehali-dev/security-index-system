import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTrainingCenterStore } from '@/stores/trainingCenterStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProgramDialog from './ProgramDialog';
import type { TrainingProgram } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  industrial_safety: 'Промышленная безопасность',
  labor_safety: 'Охрана труда',
  energy_safety: 'Энергетическая безопасность',
  ecology: 'Экология',
  professional: 'Профессиональная подготовка',
  other: 'Другое',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Активна',
  inactive: 'Неактивна',
  archived: 'В архиве',
};

export default function ProgramsTab() {
  const user = useAuthStore((state) => state.user);
  const { getProgramsByTenant, deleteProgram } = useTrainingCenterStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const programs = user?.tenantId ? getProgramsByTenant(user.tenantId) : [];

  const filteredPrograms = useMemo(() => {
    return programs.filter((prog) => {
      const matchesSearch =
        prog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prog.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || prog.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || prog.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [programs, searchTerm, categoryFilter, statusFilter]);

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить программу?')) {
      deleteProgram(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      inactive: 'secondary',
      archived: 'outline',
    };

    return <Badge variant={variants[status]}>{STATUS_LABELS[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Перечень курсов Интеллектуальной системы подготовки</h3>
            <Button onClick={() => setShowAddDialog(true)}>
              <Icon name="Plus" size={16} />
              Добавить курс
            </Button>
          </div>

          <div className="flex gap-4 mb-4 flex-wrap">
            <Input
              placeholder="Поиск по названию или коду..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активна</SelectItem>
                <SelectItem value="inactive">Неактивна</SelectItem>
                <SelectItem value="archived">В архиве</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">№</TableHead>
                  <TableHead>Код</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Длительность (ч)</TableHead>
                  <TableHead>Срок действия (мес)</TableHead>
                  <TableHead>Стоимость</TableHead>
                  <TableHead>Мин/Макс студентов</TableHead>
                  <TableHead>Экзамен</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                      Нет данных
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrograms.map((program, index) => (
                    <TableRow key={program.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{program.code}</TableCell>
                      <TableCell className="font-medium">{program.name}</TableCell>
                      <TableCell className="text-sm">
                        {CATEGORY_LABELS[program.category]}
                      </TableCell>
                      <TableCell className="text-center">{program.durationHours}</TableCell>
                      <TableCell className="text-center">{program.validityMonths}</TableCell>
                      <TableCell className="text-right">
                        {program.cost.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell className="text-center">
                        {program.minStudents} / {program.maxStudents}
                      </TableCell>
                      <TableCell className="text-center">
                        {program.requiresExam ? (
                          <Icon name="Check" size={16} className="text-green-600 mx-auto" />
                        ) : (
                          <Icon name="X" size={16} className="text-gray-400 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(program.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingProgram(program)}
                          >
                            <Icon name="Edit" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(program.id)}
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

      {(editingProgram || showAddDialog) && (
        <ProgramDialog
          program={editingProgram}
          onClose={() => {
            setEditingProgram(null);
            setShowAddDialog(false);
          }}
        />
      )}
    </div>
  );
}