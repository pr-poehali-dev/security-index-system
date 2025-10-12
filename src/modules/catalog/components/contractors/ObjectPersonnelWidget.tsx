import { useState, useEffect } from 'react';
import { useContractorsStore } from '../../stores/contractorsStore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { ContractorEmployeeObject, AccessStatus } from '../../types/contractors';

interface ObjectPersonnelWidgetProps {
  objectId: string;
  objectName: string;
  className?: string;
}

const ObjectPersonnelWidget = ({ objectId, objectName, className = '' }: ObjectPersonnelWidgetProps) => {
  const {
    objectAccess,
    employees,
    contractors,
    fetchObjectAccess,
    grantObjectAccess,
    revokeObjectAccess,
    fetchEmployees,
    fetchContractors,
    loading,
  } = useContractorsStore();

  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<ContractorEmployeeObject | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    objectId: objectId,
    accessStart: new Date().toISOString().split('T')[0],
    accessEnd: '',
    workType: '',
    notes: '',
  });

  useEffect(() => {
    fetchObjectAccess(objectId);
    fetchEmployees();
    fetchContractors();
  }, [fetchObjectAccess, fetchEmployees, fetchContractors, objectId]);

  const personnelOnObject = objectAccess.filter((access) => access.objectId === objectId);

  const handleGrantAccess = async () => {
    if (!formData.employeeId) return;

    await grantObjectAccess({ ...formData, objectId });
    setIsGrantDialogOpen(false);
    resetForm();
  };

  const handleRevokeAccess = async () => {
    if (!selectedAccess) return;

    await revokeObjectAccess(selectedAccess.id, revokeReason);
    setIsRevokeDialogOpen(false);
    setSelectedAccess(null);
    setRevokeReason('');
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      objectId: objectId,
      accessStart: new Date().toISOString().split('T')[0],
      accessEnd: '',
      workType: '',
      notes: '',
    });
  };

  const getStatusBadge = (status: AccessStatus) => {
    const variants = {
      active: { variant: 'default' as const, label: 'Активен', icon: 'CheckCircle2' },
      suspended: { variant: 'secondary' as const, label: 'Приостановлен', icon: 'Pause' },
      revoked: { variant: 'destructive' as const, label: 'Отозван', icon: 'XCircle' },
      expired: { variant: 'outline' as const, label: 'Истек', icon: 'Clock' },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon name={config.icon} size={12} />
        {config.label}
      </Badge>
    );
  };

  const checkExpiry = (accessEnd?: string) => {
    if (!accessEnd) return null;

    const endDate = new Date(accessEnd);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { color: 'text-red-600', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 7) {
      return { color: 'text-red-600', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 30) {
      return { color: 'text-orange-600', days: daysUntilExpiry };
    }
    return { color: 'text-green-600', days: daysUntilExpiry };
  };

  if (loading && personnelOnObject.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={18} />
              <h3 className="font-semibold">Персонал подрядчиков</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={18} />
              <h3 className="font-semibold">Персонал подрядчиков</h3>
              <Badge variant="outline">{personnelOnObject.length}</Badge>
            </div>
            <Button size="sm" onClick={() => setIsGrantDialogOpen(true)}>
              <Icon name="UserPlus" size={14} className="mr-2" />
              Назначить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {personnelOnObject.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                Нет персонала с доступом к этому объекту
              </p>
              <Button size="sm" variant="outline" onClick={() => setIsGrantDialogOpen(true)}>
                <Icon name="UserPlus" size={14} className="mr-2" />
                Назначить сотрудника
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Сотрудник</TableHead>
                  <TableHead>Подрядчик</TableHead>
                  <TableHead>Период</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Соответствие</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personnelOnObject.map((access) => {
                  const employee = employees.find((e) => e.id === access.employeeId);
                  const contractor = contractors.find((c) => c.id === employee?.contractorId);
                  const expiryCheck = checkExpiry(access.accessEnd);

                  return (
                    <TableRow key={access.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee?.fullName || 'Неизвестно'}</div>
                          <div className="text-sm text-muted-foreground">
                            {employee?.position || '—'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{contractor?.name || 'Неизвестно'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(access.accessStart).toLocaleDateString('ru-RU')}</div>
                          {access.accessEnd ? (
                            <div className={expiryCheck?.color}>
                              {new Date(access.accessEnd).toLocaleDateString('ru-RU')}
                              {expiryCheck && ` (${expiryCheck.days} дн.)`}
                            </div>
                          ) : (
                            <div className="text-muted-foreground">Бессрочно</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(access.accessStatus)}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800 gap-1">
                          <Icon name="CheckCircle2" size={12} />
                          Соответствует
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedAccess(access);
                            setIsRevokeDialogOpen(true);
                          }}
                          disabled={access.accessStatus === 'revoked'}
                        >
                          <Icon name="Ban" size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Назначить сотрудника на объект</DialogTitle>
            <DialogDescription>
              Назначение персонала подрядчика на объект "{objectName}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Сотрудник *</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Выберите сотрудника" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((e) => e.status === 'active')
                    .map((employee) => {
                      const contractor = contractors.find(
                        (c) => c.id === employee.contractorId
                      );
                      return (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.fullName} ({contractor?.name || 'Неизвестно'})
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accessStart">Доступ с *</Label>
                <Input
                  id="accessStart"
                  type="date"
                  value={formData.accessStart}
                  onChange={(e) =>
                    setFormData({ ...formData, accessStart: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessEnd">Доступ до</Label>
                <Input
                  id="accessEnd"
                  type="date"
                  value={formData.accessEnd}
                  onChange={(e) =>
                    setFormData({ ...formData, accessEnd: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Оставьте пустым для бессрочного доступа
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workType">Вид работ</Label>
              <Input
                id="workType"
                placeholder="Монтаж, Ремонт, Диагностика..."
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Примечания</Label>
              <Input
                id="notes"
                placeholder="Дополнительная информация"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {formData.employeeId && (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={20} className="text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">
                      Сотрудник соответствует требованиям
                    </h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>✓ Аттестация Б.7.1 - Холодильные установки (до 15.01.2028)</li>
                      <li>✓ Медосмотр действителен (до 30.06.2025)</li>
                      <li>✓ Обучение ПБ пройдено (до 15.08.2025)</li>
                      <li>✓ Обучение ОТ пройдено (до 01.09.2025)</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsGrantDialogOpen(false);
                resetForm();
              }}
            >
              Отмена
            </Button>
            <Button onClick={handleGrantAccess} disabled={!formData.employeeId}>
              Назначить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отозвать доступ к объекту</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите отозвать доступ? Сотрудник больше не сможет посещать
              этот объект.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="revokeReason">Причина отзыва</Label>
            <Input
              id="revokeReason"
              placeholder="Укажите причину..."
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRevokeDialogOpen(false);
                setSelectedAccess(null);
                setRevokeReason('');
              }}
            >
              Отмена
            </Button>
            <Button onClick={handleRevokeAccess} variant="destructive">
              Отозвать доступ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ObjectPersonnelWidget;
