import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useContractorsStore } from '../../stores/contractorsStore';
import { ContractorEmployee, EmployeeStatus } from '../../types/contractors';
import EmployeeFormDialog from './EmployeeFormDialog';
import AttestationsDialog from './AttestationsDialog';
import EmployeeFilters from './EmployeeFilters';
import EmployeeTableRow from './EmployeeTableRow';

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
      <EmployeeFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        contractorFilter={contractorFilter}
        onContractorChange={setContractorFilter}
        contractors={contractors}
      />

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
                  <EmployeeTableRow
                    key={employee.id}
                    employee={employee}
                    contractorName={getContractorName(employee.contractorId)}
                    onEdit={handleEdit}
                    onViewAttestations={handleViewAttestations}
                    onDelete={handleDelete}
                  />
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
