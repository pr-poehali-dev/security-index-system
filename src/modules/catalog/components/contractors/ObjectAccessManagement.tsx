import { useState, useEffect } from 'react';
import { useContractorsStore } from '../../stores/contractorsStore';
import { useCatalogStore } from '@/stores/catalogStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import type { ContractorEmployeeObject, AccessStatus } from '../../types/contractors';
import type { IndustrialObject, HazardClass } from '@/types/catalog';

const ObjectAccessManagement = () => {
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

  const { objects: catalogObjects } = useCatalogStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterObject, setFilterObject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<ContractorEmployeeObject | null>(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    objectId: '',
    accessStart: new Date().toISOString().split('T')[0],
    accessEnd: '',
    workType: '',
    notes: '',
  });

  const [revokeReason, setRevokeReason] = useState('');

  useEffect(() => {
    fetchObjectAccess();
    fetchEmployees();
    fetchContractors();
  }, [fetchObjectAccess, fetchEmployees, fetchContractors]);

  const handleGrantAccess = async () => {
    if (!formData.employeeId || !formData.objectId) return;

    await grantObjectAccess(formData);
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
      objectId: '',
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
      <Badge variant={config.variant}>
        <Icon name={config.icon} size={12} className="mr-1" />
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
      return { status: 'expired', message: 'Истек', color: 'text-red-600' };
    } else if (daysUntilExpiry <= 7) {
      return {
        status: 'critical',
        message: `${daysUntilExpiry} дн.`,
        color: 'text-red-600',
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: 'warning',
        message: `${daysUntilExpiry} дн.`,
        color: 'text-orange-600',
      };
    }
    return { status: 'ok', message: `${daysUntilExpiry} дн.`, color: 'text-green-600' };
  };

  const getHazardClassLabel = (hazardClass?: HazardClass) => {
    if (!hazardClass) return 'Не указан';
    const labels: Record<HazardClass, string> = {
      'I': 'I (чрезвычайно высокая)',
      'II': 'II (высокая)',
      'III': 'III (средняя)',
      'IV': 'IV (умеренная)',
    };
    return labels[hazardClass];
  };

  const filteredAccess = objectAccess.filter((access) => {
    const employee = employees.find((e) => e.id === access.employeeId);
    const object = catalogObjects.find((o) => o.id === access.objectId);

    const matchesSearch =
      employee?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      object?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      object?.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesObject = filterObject === 'all' || access.objectId === filterObject;
    const matchesStatus = filterStatus === 'all' || access.accessStatus === filterStatus;

    return matchesSearch && matchesObject && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon
                name="Search"
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Поиск по сотруднику или объекту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={filterObject} onValueChange={setFilterObject}>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Объект" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все объекты</SelectItem>
              {catalogObjects.map((obj) => (
                <SelectItem key={obj.id} value={obj.id}>
                  {obj.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активен</SelectItem>
              <SelectItem value="suspended">Приостановлен</SelectItem>
              <SelectItem value="expired">Истек</SelectItem>
              <SelectItem value="revoked">Отозван</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsGrantDialogOpen(true)}>
            <Icon name="KeyRound" size={16} className="mr-2" />
            Предоставить доступ
          </Button>
        </div>
      </Card>

      {filteredAccess.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon
            name="ShieldOff"
            size={48}
            className="mx-auto text-muted-foreground mb-4"
          />
          <h3 className="text-lg font-semibold mb-2">Нет записей о доступе</h3>
          <p className="text-muted-foreground mb-4">
            Назначьте сотрудников на объекты для контроля доступа
          </p>
          <Button onClick={() => setIsGrantDialogOpen(true)}>
            <Icon name="KeyRound" size={16} className="mr-2" />
            Предоставить доступ
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Сотрудник</TableHead>
                <TableHead>Объект</TableHead>
                <TableHead>Вид работ</TableHead>
                <TableHead>Период доступа</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Соответствие</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccess.map((access) => {
                const employee = employees.find((e) => e.id === access.employeeId);
                const object = catalogObjects.find((o) => o.id === access.objectId);
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
                      <div>
                        <div className="font-medium">{object?.name || 'Неизвестно'}</div>
                        <div className="text-xs text-muted-foreground">
                          {object?.type === 'opo' && object?.hazardClass
                            ? `Класс опасности: ${getHazardClassLabel(object.hazardClass)}`
                            : object?.type === 'gts'
                            ? 'ГТС'
                            : 'Здание'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {object?.registrationNumber || '—'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{access.workType || '—'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(access.accessStart).toLocaleDateString('ru-RU')}</div>
                        {access.accessEnd && (
                          <div className={expiryCheck?.color}>
                            {new Date(access.accessEnd).toLocaleDateString('ru-RU')}
                            {expiryCheck && ` (${expiryCheck.message})`}
                          </div>
                        )}
                        {!access.accessEnd && (
                          <div className="text-muted-foreground">Бессрочно</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(access.accessStatus)}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Icon name="CheckCircle2" size={12} className="mr-1" />
                        Соответствует
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedAccess(access);
                            setIsRevokeDialogOpen(true);
                          }}
                          disabled={access.accessStatus === 'revoked'}
                        >
                          <Icon name="Ban" size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Предоставление доступа к объекту</DialogTitle>
            <DialogDescription>
              Назначьте сотрудника подрядчика на объект. Система автоматически проверит
              соответствие требованиям.
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

            <div className="space-y-2">
              <Label htmlFor="object">Объект *</Label>
              <Select
                value={formData.objectId}
                onValueChange={(value) => setFormData({ ...formData, objectId: value })}
              >
                <SelectTrigger id="object">
                  <SelectValue placeholder="Выберите объект" />
                </SelectTrigger>
                <SelectContent>
                  {catalogObjects.map((obj) => (
                    <SelectItem key={obj.id} value={obj.id}>
                      {obj.name}
                      {obj.type === 'opo' && obj.hazardClass
                        ? ` (Класс ${obj.hazardClass})`
                        : obj.type === 'gts'
                        ? ' (ГТС)'
                        : ' (Здание)'}
                    </SelectItem>
                  ))}
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

            {formData.employeeId && formData.objectId && (
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
            <Button
              onClick={handleGrantAccess}
              disabled={!formData.employeeId || !formData.objectId}
            >
              Предоставить доступ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Отозвать доступ к объекту</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите отозвать доступ? Сотрудник больше не сможет посещать
              этот объект.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="revokeReason">Причина отзыва</Label>
            <Input
              id="revokeReason"
              placeholder="Укажите причину..."
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedAccess(null);
                setRevokeReason('');
              }}
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeAccess} className="bg-red-600">
              Отозвать доступ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ObjectAccessManagement;