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
import { TrainingRequest } from '@/types/attestation';

interface TrainingRequestsTableProps {
  requests: TrainingRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewResults: (request: TrainingRequest) => void;
}

const getStatusColor = (status: TrainingRequest['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'approved':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'rejected':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  }
};

const getStatusLabel = (status: TrainingRequest['status']) => {
  switch (status) {
    case 'pending':
      return 'На рассмотрении';
    case 'approved':
      return 'Согласовано';
    case 'rejected':
      return 'Отклонено';
    case 'in_progress':
      return 'В процессе';
    case 'completed':
      return 'Завершено';
  }
};

const getPriorityColor = (priority: TrainingRequest['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'low':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getPriorityLabel = (priority: TrainingRequest['priority']) => {
  switch (priority) {
    case 'high':
      return 'Высокий';
    case 'medium':
      return 'Средний';
    case 'low':
      return 'Низкий';
  }
};

const getReasonLabel = (reason: TrainingRequest['reason']) => {
  switch (reason) {
    case 'expiring_qualification':
      return 'Истекает удостоверение';
    case 'new_position':
      return 'Новая должность';
    case 'mandatory':
      return 'Обязательное обучение';
    case 'personal_development':
      return 'Развитие';
  }
};

export default function TrainingRequestsTable({
  requests,
  onApprove,
  onReject,
  onViewResults,
}: TrainingRequestsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Организация</TableHead>
            <TableHead>Сотрудник</TableHead>
            <TableHead>Должность</TableHead>
            <TableHead>Программа обучения</TableHead>
            <TableHead>Причина</TableHead>
            <TableHead>Приоритет</TableHead>
            <TableHead>Срок</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                Заявки не найдены
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.organizationName}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{request.employeeName}</div>
                    <div className="text-xs text-muted-foreground">
                      Таб. №{request.employeeId}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{request.position}</TableCell>
                <TableCell>
                  <div className="max-w-[250px]">
                    <div className="font-medium">{request.programName}</div>
                    {request.currentCertificate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Удост. {request.currentCertificate.number} до{' '}
                        {new Date(request.currentCertificate.validUntil).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{getReasonLabel(request.reason)}</div>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(request.priority)}>
                    {getPriorityLabel(request.priority)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(request.deadline).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {request.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onApprove(request.id)}
                        >
                          <Icon name="Check" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onReject(request.id)}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </>
                    )}
                    {request.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewResults(request)}
                      >
                        <Icon name="FileText" size={16} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
