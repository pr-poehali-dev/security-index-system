import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmployeeSelectionList from './EmployeeSelectionList';

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

interface EmployeeSelectionStepProps {
  searchEmployee: string;
  categoryFilter: string;
  statusFilter: string;
  uniqueCategories: string[];
  filteredCertifications: Certification[];
  employees: Employee[];
  employeeSelections: Map<string, Set<string>>;
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onToggleEmployee: (employeeId: string, allAreaIds: string[]) => void;
  onToggleArea: (employeeId: string, certId: string) => void;
  isAreaSelected: (employeeId: string, certId: string) => boolean;
  getTotalSelected: () => number;
  getEmployeesWithSelections: () => number;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export default function EmployeeSelectionStep({
  searchEmployee,
  categoryFilter,
  statusFilter,
  uniqueCategories,
  filteredCertifications,
  employees,
  employeeSelections,
  onSearchChange,
  onCategoryFilterChange,
  onStatusFilterChange,
  onSelectAll,
  onClearAll,
  onToggleEmployee,
  onToggleArea,
  isAreaSelected,
  getTotalSelected,
  getEmployeesWithSelections,
  getStatusColor,
  getStatusLabel,
}: EmployeeSelectionStepProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <Icon name="Info" size={14} className="inline mr-1" />
          Выберите сотрудников и их области аттестации для включения в приказ. Эти данные будут использованы для формирования приложения к приказу.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по области, категории или ФИО..."
            value={searchEmployee}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {uniqueCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="valid">Действует</SelectItem>
            <SelectItem value="expiring_soon">Истекает</SelectItem>
            <SelectItem value="expired">Просрочен</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Выбрано областей:</span>
            <span className="ml-2 font-semibold">{getTotalSelected()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Сотрудников:</span>
            <span className="ml-2 font-semibold">{getEmployeesWithSelections()} из {employees.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            <Icon name="CheckCheck" size={14} className="mr-1" />
            Выбрать все
          </Button>
          <Button variant="outline" size="sm" onClick={onClearAll}>
            <Icon name="X" size={14} className="mr-1" />
            Очистить
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-[400px] pr-4">
        <EmployeeSelectionList
          filteredCertifications={filteredCertifications}
          employees={employees}
          employeeSelections={employeeSelections}
          onToggleEmployee={onToggleEmployee}
          onToggleArea={onToggleArea}
          isAreaSelected={isAreaSelected}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
        />
      </ScrollArea>

      {filteredCertifications.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="Users" size={32} className="mx-auto mb-2" />
          <p>Сотрудники с областями аттестации не найдены</p>
        </div>
      )}
    </div>
  );
}
