import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface ComplianceSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
}

export default function ComplianceSelectionBar({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onClearSelection,
}: ComplianceSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm font-medium">
            Выбрано сотрудников: {selectedCount}
          </span>
          <span className="text-xs text-muted-foreground">
            (будут добавлены только недостающие области аттестации)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="gap-2"
        >
          <Icon name="X" size={14} />
          Отменить выбор
        </Button>
      </div>
    </div>
  );
}
