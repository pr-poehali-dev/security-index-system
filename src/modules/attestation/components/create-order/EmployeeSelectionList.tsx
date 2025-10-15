import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface Certification {
  id: string;
  category: string;
  area: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  daysLeft: number;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  certifications: Array<{
    id: string;
    category: string;
    area: string;
    issueDate: string;
    expiryDate: string;
    status: string;
    daysLeft: number;
  }>;
}

interface EmployeeSelectionListProps {
  filteredCertifications: Certification[];
  employees: Employee[];
  employeeSelections: Map<string, Set<string>>;
  onToggleEmployee: (employeeId: string, allAreaIds: string[]) => void;
  onToggleArea: (employeeId: string, certId: string) => void;
  isAreaSelected: (employeeId: string, certId: string) => boolean;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export default function EmployeeSelectionList({
  filteredCertifications,
  employees,
  employeeSelections,
  onToggleEmployee,
  onToggleArea,
  isAreaSelected,
  getStatusColor,
  getStatusLabel,
}: EmployeeSelectionListProps) {
  const employeesGrouped = new Map<string, typeof filteredCertifications>();
  filteredCertifications.forEach(cert => {
    const list = employeesGrouped.get(cert.employeeId) || [];
    list.push(cert);
    employeesGrouped.set(cert.employeeId, list);
  });

  return (
    <div className="space-y-4">
      {Array.from(employeesGrouped.entries()).map(([employeeId, certs]) => {
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) return null;

        const allAreaIds = certs.map(c => c.id);
        const selectedAreas = employeeSelections.get(employeeId) || new Set();
        const allSelected = selectedAreas.size === allAreaIds.length && allAreaIds.length > 0;

        return (
          <Card key={employeeId} className="overflow-hidden">
            <div className="p-4 bg-muted/50 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => onToggleEmployee(employeeId, allAreaIds)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {employee.position} • {employee.department}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {selectedAreas.size} / {certs.length}
                </Badge>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {certs.map(cert => (
                <div
                  key={cert.id}
                  className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                  onClick={() => onToggleArea(employeeId, cert.id)}
                >
                  <Checkbox
                    checked={isAreaSelected(employeeId, cert.id)}
                    onCheckedChange={() => onToggleArea(employeeId, cert.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{cert.area}</div>
                    <div className="text-xs text-muted-foreground">{cert.category}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={`text-xs ${getStatusColor(cert.status)}`}>
                      {getStatusLabel(cert.status)}
                    </Badge>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {cert.daysLeft > 0 ? `${cert.daysLeft} дн.` : 'Просрочено'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
