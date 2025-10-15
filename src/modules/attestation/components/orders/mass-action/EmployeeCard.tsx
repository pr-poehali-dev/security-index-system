import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import CertificationItem from './CertificationItem';

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
}

interface EmployeeCardProps {
  employee: Employee;
  certs: Certification[];
  selectedAreas: Set<string>;
  allSelected: boolean;
  onToggleEmployee: (employeeId: string, allAreaIds: string[]) => void;
  onToggleArea: (employeeId: string, certId: string) => void;
  isAreaSelected: (employeeId: string, certId: string) => boolean;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export default function EmployeeCard({
  employee,
  certs,
  selectedAreas,
  allSelected,
  onToggleEmployee,
  onToggleArea,
  isAreaSelected,
  getStatusColor,
  getStatusLabel,
}: EmployeeCardProps) {
  const allAreaIds = certs.map(c => c.id);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-muted/50 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={allSelected}
              onCheckedChange={() => onToggleEmployee(employee.id, allAreaIds)}
            />
            <div className="flex-1">
              <div className="font-medium">{employee.name}</div>
              <div className="text-sm text-muted-foreground">
                {employee.position} • {employee.department}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {employee.organization}
              </div>
            </div>
          </div>
          {selectedAreas.size > 0 && (
            <Badge variant="secondary">
              Выбрано: {selectedAreas.size} из {certs.length}
            </Badge>
          )}
        </div>
      </div>

      <div className="divide-y">
        {certs.map((cert) => (
          <CertificationItem
            key={cert.id}
            cert={cert}
            isSelected={isAreaSelected(employee.id, cert.id)}
            onToggle={() => onToggleArea(employee.id, cert.id)}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />
        ))}
      </div>
    </Card>
  );
}
