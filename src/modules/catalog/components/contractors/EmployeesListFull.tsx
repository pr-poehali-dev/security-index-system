import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useContractorsStore } from '../../stores/contractorsStore';
import { ContractorEmployee, EmployeeStatus } from '../../types/contractors';
import EmployeeFormDialog from './EmployeeFormDialog';
import AttestationsDialog from './AttestationsDialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const EmployeesListFull = () => {
  const { employees, contractors, loading, fetchEmployees, fetchContractors, deleteEmployee } =
    useContractorsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all');
  const [contractorFilter, setContractorFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<ContractorEmployee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAttestationsDialogOpen, setIsAttestationsDialogOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchContractors();
  }, [fetchEmployees, fetchContractors]);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesContractor =
      contractorFilter === 'all' || employee.contractorId === contractorFilter;
    return matchesSearch && matchesStatus && matchesContractor;
  });

  const getStatusBadge = (status: EmployeeStatus) => {
    const variants: Record<
      EmployeeStatus,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      active: { label: 'Активен', variant: 'default' },
      suspended: { label: 'Приостановлен', variant: 'secondary' },
      blocked: { label: 'Заблокирован', variant: 'destructive' },
      dismissed: { label: 'Уволен', variant: 'outline' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isDocumentExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isDocumentExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getDocumentStatus = (expiryDate?: string) => {
    if (!expiryDate) {
      return <Badge variant="outline">Не указано</Badge>;
    }
    if (isDocumentExpired(expiryDate)) {
      return (
        <Badge variant="destructive">
          <Icon name="XCircle" size={12} className="mr-1" />
          Истек
        </Badge>
      );
    }
    if (isDocumentExpiringSoon(expiryDate)) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          <Icon name="AlertTriangle" size={12} className="mr-1" />
          {format(new Date(expiryDate), 'dd.MM.yyyy', { locale: ru })}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-green-700">
        <Icon name="CheckCircle" size={12} className="mr-1" />
        {format(new Date(expiryDate), 'dd.MM.yyyy', { locale: ru })}
      </Badge>
    );
  };

  const handleEdit = (employee: ContractorEmployee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleViewAttestations = (employee: ContractorEmployee) => {
    setSelectedEmployee(employee);
    setIsAttestationsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      await deleteEmployee(id);
    }
  };

  const getContractorName = (contractorId: string) => {
    const contractor = contractors.find((c) => c.id === contractorId);
    return contractor?.name || 'Неизвестно';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Поиск по ФИО..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={contractorFilter} onValueChange={setContractorFilter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Подрядчик" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все подрядчики</SelectItem>
              {contractors.map((contractor) => (
                <SelectItem key={contractor.id} value={contractor.id}>
                  {contractor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Все
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              Активные
            </Button>
          </div>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || contractorFilter !== 'all'
                ? 'Сотрудники не найдены'
                : 'Нет добавленных сотрудников'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ФИО / Должность</TableHead>
                  <TableHead>Подрядчик</TableHead>
                  <TableHead>Медосмотр</TableHead>
                  <TableHead>Обучение ПБ</TableHead>
                  <TableHead>Обучение ОТ</TableHead>
                  <TableHead>Аттестации</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.fullName}</p>
                        {employee.position && (
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{getContractorName(employee.contractorId)}</p>
                    </TableCell>
                    <TableCell>{getDocumentStatus(employee.medicalCheckupExpiry)}</TableCell>
                    <TableCell>
                      {getDocumentStatus(employee.fireSafetyTrainingExpiry)}
                    </TableCell>
                    <TableCell>
                      {getDocumentStatus(employee.laborSafetyTrainingExpiry)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAttestations(employee)}
                      >
                        <Icon name="Award" size={14} className="mr-1" />
                        Просмотр
                      </Button>
                    </TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(employee)}
                          title="Редактировать"
                        >
                          <Icon name="Edit" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(employee.id)}
                          title="Удалить"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <EmployeeFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        employee={selectedEmployee || undefined}
        onClose={() => setSelectedEmployee(null)}
      />

      <AttestationsDialog
        open={isAttestationsDialogOpen}
        onOpenChange={setIsAttestationsDialogOpen}
        employee={selectedEmployee || undefined}
        onClose={() => setSelectedEmployee(null)}
      />
    </div>
  );
};

export default EmployeesListFull;
