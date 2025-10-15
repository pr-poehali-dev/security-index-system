import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface MassActionSelectionBarProps {
  totalSelected: number;
  employeesSelected: number;
  totalEmployees: number;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export default function MassActionSelectionBar({
  totalSelected,
  employeesSelected,
  totalEmployees,
  onSelectAll,
  onClearAll,
}: MassActionSelectionBarProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Выбрано областей:</span>
          <span className="ml-2 font-semibold">{totalSelected}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Сотрудников:</span>
          <span className="ml-2 font-semibold">{employeesSelected} из {totalEmployees}</span>
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
  );
}
