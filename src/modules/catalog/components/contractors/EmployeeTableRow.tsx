import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { ContractorEmployee } from '../../types/contractors';
import DocumentStatusBadge from './DocumentStatusBadge';
import EmployeeStatusBadge from './EmployeeStatusBadge';

interface EmployeeTableRowProps {
  employee: ContractorEmployee;
  contractorName: string;
  onEdit: (employee: ContractorEmployee) => void;
  onViewAttestations: (employee: ContractorEmployee) => void;
  onDelete: (id: string) => void;
}

export default function EmployeeTableRow({
  employee,
  contractorName,
  onEdit,
  onViewAttestations,
  onDelete
}: EmployeeTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium">{employee.fullName}</p>
          {employee.position && (
            <p className="text-sm text-muted-foreground">{employee.position}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <p className="text-sm">{contractorName}</p>
      </TableCell>
      <TableCell>
        <DocumentStatusBadge expiryDate={employee.medicalCheckupExpiry} />
      </TableCell>
      <TableCell>
        <DocumentStatusBadge expiryDate={employee.fireSafetyTrainingExpiry} />
      </TableCell>
      <TableCell>
        <DocumentStatusBadge expiryDate={employee.laborSafetyTrainingExpiry} />
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewAttestations(employee)}
        >
          <Icon name="Award" size={14} className="mr-1" />
          Просмотр
        </Button>
      </TableCell>
      <TableCell>
        <EmployeeStatusBadge status={employee.status} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(employee)}
            title="Редактировать"
          >
            <Icon name="Edit" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(employee.id)}
            title="Удалить"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
