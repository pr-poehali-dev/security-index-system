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
}

export type CertificationStatusFilter = 'all' | 'valid' | 'expiring' | 'expired' | 'missing';

interface EmployeeSelectionStepProps {
  employees: Employee[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  renderEmployeeExtra?: (employee: Employee) => React.ReactNode;
  enableCertificationFilter?: boolean;
  getCertificationStatus?: (employee: Employee) => CertificationStatusFilter;
}

export default function EmployeeSelectionStep({
  employees,
  selected,
  onSelect,
  renderEmployeeExtra,
  enableCertificationFilter = false,
  getCertificationStatus,
}: EmployeeSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [certStatusFilters, setCertStatusFilters] = useState<Set<CertificationStatusFilter>>(new Set());

  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.position.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query)
      );
    }

    if (enableCertificationFilter && certStatusFilters.size > 0 && getCertificationStatus) {
      filtered = filtered.filter((emp) => certStatusFilters.has(getCertificationStatus(emp)));
    }

    return filtered;
  }, [employees, searchQuery, certStatusFilters, enableCertificationFilter, getCertificationStatus]);

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

  const handleSelectByStatus = (status: CertificationStatusFilter) => {
    if (!getCertificationStatus) return;
    
    const employeesWithStatus = employees.filter((emp) => getCertificationStatus(emp) === status);
    const newSelected = [...new Set([...selected, ...employeesWithStatus.map((emp) => emp.id)])];
    onSelect(newSelected);
  };

  const toggleStatusFilter = (status: CertificationStatusFilter) => {
    const newFilters = new Set(certStatusFilters);
    if (newFilters.has(status)) {
      newFilters.delete(status);
    } else {
      newFilters.add(status);
    }
    setCertStatusFilters(newFilters);
  };

  const isAllSelected = selected.length === filteredEmployees.length && filteredEmployees.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
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


        </div>

        {enableCertificationFilter && getCertificationStatus && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Фильтр по статусу аттестации:</div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="filter-expired"
                  checked={certStatusFilters.has('expired')}
                  onCheckedChange={() => toggleStatusFilter('expired')}
                />
                <label htmlFor="filter-expired" className="text-sm cursor-pointer flex items-center gap-1.5">
                  <Icon name="AlertCircle" size={14} className="text-red-600" />
                  Просроченные
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox 
                  id="filter-expiring"
                  checked={certStatusFilters.has('expiring')}
                  onCheckedChange={() => toggleStatusFilter('expiring')}
                />
                <label htmlFor="filter-expiring" className="text-sm cursor-pointer flex items-center gap-1.5">
                  <Icon name="Clock" size={14} className="text-orange-600" />
                  Истекающие
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox 
                  id="filter-missing"
                  checked={certStatusFilters.has('missing')}
                  onCheckedChange={() => toggleStatusFilter('missing')}
                />
                <label htmlFor="filter-missing" className="text-sm cursor-pointer flex items-center gap-1.5">
                  <Icon name="XCircle" size={14} className="text-gray-600" />
                  Отсутствующие
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {isAllSelected ? 'Снять выбор' : 'Выбрать всех'}
          </Button>

          {enableCertificationFilter && getCertificationStatus && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSelectByStatus('expired')}
                className="gap-2"
              >
                <Icon name="AlertCircle" size={14} className="text-red-600" />
                Выбрать с просроченными
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSelectByStatus('expiring')}
                className="gap-2"
              >
                <Icon name="Clock" size={14} className="text-orange-600" />
                Выбрать с истекающими
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSelectByStatus('missing')}
                className="gap-2"
              >
                <Icon name="XCircle" size={14} className="text-gray-600" />
                Выбрать с отсутствующими
              </Button>
            </>
          )}
        </div>
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