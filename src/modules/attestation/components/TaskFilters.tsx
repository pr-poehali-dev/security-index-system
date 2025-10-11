import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskFiltersProps {
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterPriority: string;
  setFilterPriority: (value: string) => void;
  filterDepartment: string;
  setFilterDepartment: (value: string) => void;
  departments: string[];
  selectedTasksCount: number;
  onBulkInProgress: () => void;
  onBulkCompleted: () => void;
}

export default function TaskFilters({
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  filterDepartment,
  setFilterDepartment,
  departments,
  selectedTasksCount,
  onBulkInProgress,
  onBulkCompleted
}: TaskFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="pending">Ожидает</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="completed">Выполнено</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Все приоритеты" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
            <SelectItem value="critical">Критический</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Все подразделения" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все подразделения</SelectItem>
            {departments.map(dep => (
              <SelectItem key={dep} value={dep}>{dep}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTasksCount > 0 && (
        <div className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <span className="text-sm font-medium">
            Выбрано: {selectedTasksCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkInProgress}
            className="gap-2"
          >
            <Icon name="PlayCircle" size={14} />
            Взять в работу
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkCompleted}
            className="gap-2"
          >
            <Icon name="CheckCircle2" size={14} />
            Отметить выполненными
          </Button>
        </div>
      )}
    </div>
  );
}
