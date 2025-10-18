import { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CreateTrainingDialog from '../training/CreateTrainingDialog';

interface TrainingRequest {
  id: string;
  number: string;
  date: string;
  type: 'external' | 'internal';
  status: 'pending' | 'in_progress' | 'completed';
  employeeCount: number;
  organization?: string;
  courseName?: string;
  employees?: Array<{ id: string; name: string; position: string }>;
  plannedDate?: string;
  notes?: string;
}

const TrainingTab = memo(function TrainingTab() {
  const [requests, setRequests] = useState<TrainingRequest[]>([
    {
      id: '1',
      number: 'ЗТ-001-2024',
      date: '2024-03-15',
      type: 'external',
      status: 'completed',
      employeeCount: 5,
      organization: 'УЦ "Прогресс"',
    },
    {
      id: '2',
      number: 'ЗТ-002-2024',
      date: '2024-03-20',
      type: 'internal',
      status: 'in_progress',
      employeeCount: 3,
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateTraining = (training: TrainingRequest) => {
    setRequests(prev => [training, ...prev]);
  };

  const getStatusBadge = (status: TrainingRequest['status']) => {
    const config = {
      pending: { label: 'Ожидает', variant: 'outline' as const },
      in_progress: { label: 'В процессе', variant: 'default' as const },
      completed: { label: 'Завершено', variant: 'success' as const },
    };
    const { label, variant } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeBadge = (type: TrainingRequest['type']) => {
    return type === 'external' ? (
      <Badge variant="outline">Направление в УЦ</Badge>
    ) : (
      <Badge variant="secondary">Направление в СДО ИСП</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Заявки на тренинг</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Направление на тренинг в учебные центры и СДО ИСП
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Создать заявку
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Номер заявки</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Организация</TableHead>
              <TableHead>Сотрудников</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.number}</TableCell>
                <TableCell>{new Date(request.date).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell>{getTypeBadge(request.type)}</TableCell>
                <TableCell>{request.organization || '—'}</TableCell>
                <TableCell>{request.employeeCount}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Icon name="Eye" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="Pencil" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Результаты тренинга</DialogTitle>
            <DialogDescription>
              Заявка {selectedRequest?.number} от{' '}
              {selectedRequest?.date && new Date(selectedRequest.date).toLocaleDateString('ru-RU')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Данные о завершении тренинга будут отображаться здесь
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <CreateTrainingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateTraining={handleCreateTraining}
      />
    </div>
  );
});

export default TrainingTab;