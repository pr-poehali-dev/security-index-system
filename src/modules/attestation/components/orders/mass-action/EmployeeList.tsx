import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import EmployeeCard from './EmployeeCard';

interface Certification {
  id: string;
  category: string;
  area: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
  verified?: boolean;
  employeeId: string;
  employeeName: string;
  position: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  organization: string;
  certifications: Array<{
    id: string;
    category: string;
    area: string;
    issueDate: string;
    expiryDate: string;
    status: 'valid' | 'expiring_soon' | 'expired';
    daysLeft: number;
    verified?: boolean;
  }>;
}

interface EmployeeListProps {
  employeesGrouped: Map<string, Certification[]>;
  employees: Employee[];
  employeeSelections: Map<string, Set<string>>;
  onToggleEmployee: (employeeId: string, allAreaIds: string[]) => void;
  onToggleArea: (employeeId: string, certId: string) => void;
  isAreaSelected: (employeeId: string, certId: string) => boolean;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export default function EmployeeList({
  employeesGrouped,
  employees,
  employeeSelections,
  onToggleEmployee,
  onToggleArea,
  isAreaSelected,
  getStatusColor,
  getStatusLabel,
}: EmployeeListProps) {
  if (employeesGrouped.size === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">Ничего не найдено</p>
        <p className="text-sm text-muted-foreground">Измените параметры поиска</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-4">
        {Array.from(employeesGrouped.entries()).map(([employeeId, certs]) => {
          const employee = employees.find(e => e.id === employeeId);
          if (!employee) return null;

          const allAreaIds = certs.map(c => c.id);
          const selectedAreas = employeeSelections.get(employeeId) || new Set();
          const allSelected = selectedAreas.size === allAreaIds.length && allAreaIds.length > 0;

          return (
            <EmployeeCard
              key={employeeId}
              employee={employee}
              certs={certs}
              selectedAreas={selectedAreas}
              allSelected={allSelected}
              onToggleEmployee={onToggleEmployee}
              onToggleArea={onToggleArea}
              isAreaSelected={isAreaSelected}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}
