import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import type { Employee } from '../utils/employeeUtils';
import { getEmployeeStatus, getStatusColor, getStatusLabel, getStatusIcon } from '../utils/employeeUtils';

interface EmployeeTableRowProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onViewDetails: () => void;
}

export default function EmployeeTableRow({
  employee,
  isSelected,
  onSelect,
  onViewDetails
}: EmployeeTableRowProps) {
  const status = getEmployeeStatus(employee);

  return (
    <tr className={`border-b last:border-0 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
      <td className="py-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
        />
      </td>
      <td className="py-3 font-medium">{employee.name}</td>
      <td className="py-3 text-muted-foreground">
        <div className="flex items-center gap-1">
          <Icon name="Building2" size={14} />
          {employee.organization}
        </div>
      </td>
      <td className="py-3 text-muted-foreground">{employee.position}</td>
      <td className="py-3 text-muted-foreground">{employee.department}</td>
      <td className="py-3">{employee.certifications.length}</td>
      <td className="py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          <Icon name={getStatusIcon(status) as any} size={12} />
          {getStatusLabel(status)}
        </span>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewDetails}
          >
            <Icon name="Eye" size={16} />
          </Button>
          <Button variant="ghost" size="sm">
            <Icon name="Edit" size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
