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

interface AttestationOrder {
  id: string;
  number: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  employeeCount: number;
  attestationType: string;
}

interface OrderEmployee {
  id: string;
  organization: string;
  fullName: string;
  position: string;
  attestationArea: string;
  certificateNumber: string;
  certificateDate: string;
}

const mockOrders: AttestationOrder[] = [
  {
    id: '1',
    number: 'ПА-015-2024',
    date: '2024-03-10',
    status: 'active',
    employeeCount: 8,
    attestationType: 'Ростехнадзор',
  },
  {
    id: '2',
    number: 'ПА-014-2024',
    date: '2024-02-28',
    status: 'completed',
    employeeCount: 5,
    attestationType: 'Комиссия предприятия',
  },
];

const mockEmployees: OrderEmployee[] = [
  {
    id: '1',
    organization: 'ООО "Энерго"',
    fullName: 'Петров Петр Петрович',
    position: 'Инженер по ТБ',
    attestationArea: 'А.1 Общие требования промышленной безопасности',
    certificateNumber: 'ДПО-2023-001',
    certificateDate: '2023-06-15',
  },
  {
    id: '2',
    organization: 'ООО "Энерго"',
    fullName: 'Сидорова Анна Ивановна',
    position: 'Инженер-энергетик',
    attestationArea: 'Б.3 Эксплуатация электроустановок',
    certificateNumber: 'ДПО-2023-045',
    certificateDate: '2023-08-20',
  },
];

const AttestationOrdersTab = memo(function AttestationOrdersTab() {
  const [selectedOrder, setSelectedOrder] = useState<AttestationOrder | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const getStatusBadge = (status: AttestationOrder['status']) => {
    const config = {
      draft: { label: 'Черновик', variant: 'outline' as const },
      active: { label: 'Активен', variant: 'default' as const },
      completed: { label: 'Завершен', variant: 'success' as const },
      cancelled: { label: 'Отменен', variant: 'destructive' as const },
    };
    const { label, variant } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleViewDetails = (order: AttestationOrder) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Приказы на аттестацию</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Приказы о направлении сотрудников на аттестацию с приложениями
            </p>
          </div>
          <Button>
            <Icon name="Plus" size={16} className="mr-2" />
            Создать приказ
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Номер приказа</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Тип аттестации</TableHead>
              <TableHead>Сотрудников</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.number}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell>{order.attestationType}</TableCell>
                <TableCell>{order.employeeCount}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="Download" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Приложение к приказу {selectedOrder?.number}</DialogTitle>
            <DialogDescription>
              от {selectedOrder?.date && new Date(selectedOrder.date).toLocaleDateString('ru-RU')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Организация</TableHead>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Должность</TableHead>
                  <TableHead>Область аттестации</TableHead>
                  <TableHead>№ удостоверения ДПО</TableHead>
                  <TableHead>Дата ДПО</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.organization}</TableCell>
                    <TableCell className="font-medium">{employee.fullName}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell className="max-w-xs">{employee.attestationArea}</TableCell>
                    <TableCell>{employee.certificateNumber}</TableCell>
                    <TableCell>
                      {new Date(employee.certificateDate).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Icon name="FileText" size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default AttestationOrdersTab;
