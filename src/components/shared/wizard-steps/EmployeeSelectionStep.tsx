import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  [key: string]: any;
}

interface EmployeeSelectionStepProps {
  employees: Employee[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  renderEmployeeExtra?: (employee: Employee) => React.ReactNode;
}

export default function EmployeeSelectionStep({
  employees,
  selected,
  onSelect,
  renderEmployeeExtra,
}: EmployeeSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;

    const query = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.position.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  const handleToggle = (employeeId: string) => {
    if (selected.includes(employeeId)) {
      onSelect(selected.filter((id) => id !== employeeId));
    } else {
      onSelect([...selected, employeeId]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === filteredEmployees.length) {
      onSelect([]);
    } else {
      onSelect(filteredEmployees.map((emp) => emp.id));
    }
  };

  const isAllSelected = selected.length === filteredEmployees.length && filteredEmployees.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Icon
            name="Search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Поиск по ФИО, должности, подразделению..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button variant="outline" size="sm" onClick={handleSelectAll}>
          {isAllSelected ? 'Снять выбор' : 'Выбрать всех'}
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Найдено: {filteredEmployees.length} | Выбрано: {selected.length}
        </span>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-2">
          {filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icon name="UserX" size={48} className="text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Сотрудники не найдены</p>
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleToggle(employee.id)}
              >
                <Checkbox
                  checked={selected.includes(employee.id)}
                  onCheckedChange={() => handleToggle(employee.id)}
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {employee.department}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {renderEmployeeExtra && renderEmployeeExtra(employee)}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
