// src/modules/training-center/components/tabs/RequestsTab.tsx
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { OrganizationTrainingRequest } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  in_review: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
  completed: 'Завершена',
};

export default function RequestsTab() {
  const user = useAuthStore((state) => state.user);
  const { getRequestsByTenant } = useTrainingCenterStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<OrganizationTrainingRequest | null>(null);

  const requests = user?.tenantId ? getRequestsByTenant(user.tenantId) : [];

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      new: 'default',
      in_review: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      completed: 'outline',
    };

    return <Badge variant={variants[status]}>{STATUS_LABELS[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Заявки организаций на обучение</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Заявки от организаций, отправленные через модуль аттестации
              </p>
            </div>
          </div>

          <div className="flex gap-4 mb-4 flex-wrap">
            <Input
              placeholder="Поиск по организации, программе, контакту..."
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
                <SelectItem value="new">Новая</SelectItem>
                <SelectItem value="in_review">На рассмотрении</SelectItem>
                <SelectItem value="approved">Одобрена</SelectItem>
                <SelectItem value="rejected">Отклонена</SelectItem>
                <SelectItem value="completed">Завершена</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">№</TableHead>
                  <TableHead>Дата заявки</TableHead>
                  <TableHead>Организация</TableHead>
                  <TableHead>Программа</TableHead>
                  <TableHead>Кол-во обучающихся</TableHead>
                  <TableHead>Контактное лицо</TableHead>
                  <TableHead>Желаемая дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Нет заявок
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request, index) => (
                    <TableRow key={request.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(request.requestDate).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell className="font-medium">{request.organizationName}</TableCell>
                      <TableCell className="text-sm">{request.programName}</TableCell>
                      <TableCell className="text-center">{request.studentsCount}</TableCell>
                      <TableCell className="text-sm">
                        <div>{request.contactPerson}</div>
                        {request.contactPhone && (
                          <div className="text-xs text-muted-foreground">{request.contactPhone}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {request.preferredStartDate
                          ? new Date(request.preferredStartDate).toLocaleDateString('ru-RU')
                          : '—'}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Icon name="Eye" size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Детали заявки #{selectedRequest.id.slice(0, 8)}</DialogTitle>
              <DialogDescription>
                Заявка от {new Date(selectedRequest.requestDate).toLocaleDateString('ru-RU')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Организация</label>
                  <p className="text-sm">{selectedRequest.organizationName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Программа</label>
                  <p className="text-sm">{selectedRequest.programName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Контактное лицо</label>
                  <p className="text-sm">{selectedRequest.contactPerson}</p>
                  {selectedRequest.contactPhone && (
                    <p className="text-xs text-muted-foreground">{selectedRequest.contactPhone}</p>
                  )}
                  {selectedRequest.contactEmail && (
                    <p className="text-xs text-muted-foreground">{selectedRequest.contactEmail}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Статус</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Список обучающихся ({selectedRequest.studentsCount})
                </label>
                <div className="mt-2 border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ФИО</TableHead>
                        <TableHead>Должность</TableHead>
                        <TableHead>Подразделение</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRequest.students.map((student, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{student.fullName}</TableCell>
                          <TableCell className="text-sm">{student.position}</TableCell>
                          <TableCell className="text-sm">{student.department || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Примечания</label>
                  <p className="text-sm mt-1">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}