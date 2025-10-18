import { memo, useState, useMemo } from 'react';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { AttestationOrder, useAttestationOrdersStore } from '@/stores/attestationOrdersStore';
import { useToast } from '@/hooks/use-toast';
import CreateAttestationOrderDialog from '../orders/CreateAttestationOrderDialog';
import EditAttestationOrderDialog from '../orders/EditAttestationOrderDialog';
import ExportOrderDialog from '../orders/ExportOrderDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';



const AttestationOrdersTab = memo(function AttestationOrdersTab() {
  const user = useAuthStore((state) => state.user);
  const { personnel, organizations } = useSettingsStore();
  const { getOrdersByTenant, getOrderEmployees, deleteOrder } = useAttestationOrdersStore();
  const { toast } = useToast();

  const [selectedOrder, setSelectedOrder] = useState<AttestationOrder | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<AttestationOrder | null>(null);
  const [orderToExport, setOrderToExport] = useState<AttestationOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<AttestationOrder | null>(null);

  const orders = useMemo(() => {
    return user?.tenantId ? getOrdersByTenant(user.tenantId) : [];
  }, [user?.tenantId, getOrdersByTenant]);

  const selectedOrderEmployees = useMemo(() => {
    return selectedOrder ? getOrderEmployees(selectedOrder.id) : [];
  }, [selectedOrder, getOrderEmployees]);

  const getStatusBadge = (status: AttestationOrder['status']) => {
    const config = {
      draft: { label: 'Черновик', variant: 'outline' as const },
      active: { label: 'Активен', variant: 'default' as const },
      completed: { label: 'Завершен', variant: 'default' as const },
      cancelled: { label: 'Отменен', variant: 'destructive' as const },
    };
    const { label, variant } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getAttestationTypeLabel = (type: 'rostechnadzor' | 'company_commission') => {
    return type === 'rostechnadzor' ? 'Ростехнадзор' : 'Комиссия предприятия';
  };

  const handleViewDetails = (order: AttestationOrder) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const handleEdit = (order: AttestationOrder) => {
    setOrderToEdit(order);
    setShowEditDialog(true);
  };

  const handleDelete = (order: AttestationOrder) => {
    setOrderToDelete(order);
  };

  const confirmDelete = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete.id);
      toast({ 
        title: 'Приказ удален', 
        description: `Приказ ${orderToDelete.number} успешно удален` 
      });
      setOrderToDelete(null);
    }
  };

  const handleDownload = (order: AttestationOrder) => {
    setOrderToExport(order);
    setShowExportDialog(true);
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
          <Button onClick={() => setShowCreateDialog(true)}>
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
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Нет приказов на аттестацию. Создайте первый приказ.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const employeeCount = getOrderEmployees(order.id).length;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.number}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell>{getAttestationTypeLabel(order.attestationType)}</TableCell>
                    <TableCell>{employeeCount}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                          title="Просмотреть"
                        >
                          <Icon name="Eye" size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(order)}
                          title="Редактировать"
                        >
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownload(order)}
                          title="Скачать"
                        >
                          <Icon name="Download" size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(order)}
                          title="Удалить"
                        >
                          <Icon name="Trash2" size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
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
                {selectedOrderEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                      Нет сотрудников в приказе
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedOrderEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.organizationName}</TableCell>
                      <TableCell className="font-medium">{employee.fullName}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell className="max-w-xs">{employee.attestationArea}</TableCell>
                      <TableCell>{employee.certificateNumber}</TableCell>
                      <TableCell>
                        {new Date(employee.certificateDate).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" title="Документы">
                          <Icon name="FileText" size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateAttestationOrderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <EditAttestationOrderDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        order={orderToEdit}
      />

      <ExportOrderDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        order={orderToExport}
      />

      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить приказ?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить приказ {orderToDelete?.number}?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

export default AttestationOrdersTab;