import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskFiltersProps {
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterPriority: string;
  setFilterPriority: (value: string) => void;
  filterDepartment: string;
  setFilterDepartment: (value: string) => void;
  filterOrderStatus: string;
  setFilterOrderStatus: (value: string) => void;
  departments: string[];
  selectedTasksCount: number;
  onBulkCompleted: () => void;
  onBulkGenerateOrder?: (orderType: string) => void;
}

export default function TaskFilters({
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  filterDepartment,
  setFilterDepartment,
  filterOrderStatus,
  setFilterOrderStatus,
  departments,
  selectedTasksCount,
  onBulkCompleted,
  onBulkGenerateOrder
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

        <Select value={filterOrderStatus} onValueChange={setFilterOrderStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Наличие приказа" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все задачи</SelectItem>
            <SelectItem value="with_order">С приказом</SelectItem>
            <SelectItem value="without_order">Без приказа</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedTasksCount > 0 && (
        <div className="flex items-center justify-between gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Выбрано задач: {selectedTasksCount}
            </span>
          </div>
          <div className="flex gap-2">
            {onBulkGenerateOrder && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                  >
                    <Icon name="PlayCircle" size={14} />
                    Взять в работу
                    <Icon name="ChevronDown" size={12} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[320px]">
                  <DropdownMenuItem onClick={() => onBulkGenerateOrder('sdo')}>
                    <Icon name="Monitor" size={16} className="mr-2" />
                    О подготовке в СДО Интеллектуальная система
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBulkGenerateOrder('training_center')}>
                    <Icon name="School" size={16} className="mr-2" />
                    О подготовке в учебный центр
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBulkGenerateOrder('internal_attestation')}>
                    <Icon name="ClipboardCheck" size={16} className="mr-2" />
                    О аттестации в ЕПТ организации
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBulkGenerateOrder('rostechnadzor')}>
                    <Icon name="Building2" size={16} className="mr-2" />
                    О направлении на аттестацию в Ростехнадзор
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkCompleted}
              className="gap-2 bg-white dark:bg-slate-800"
            >
              <Icon name="CheckCircle2" size={14} />
              Завершить выбранные
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}