// src/components/ui/sortable-table-header.tsx
// Описание: UI компонент сортируемого заголовка таблицы с индикатором направления
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableTableHeaderProps {
  label: string;
  field: string;
  currentSort: { field: string; direction: SortDirection };
  onSort: (field: string) => void;
  className?: string;
}

export function SortableTableHeader({
  label,
  field,
  currentSort,
  onSort,
  className
}: SortableTableHeaderProps) {
  const isActive = currentSort.field === field;
  const direction = isActive ? currentSort.direction : null;

  return (
    <div
      className={cn(
        'text-left p-3 font-semibold text-sm cursor-pointer hover:bg-muted/80 transition-colors select-none',
        className
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <div className="flex flex-col">
          <Icon
            name="ChevronUp"
            size={12}
            className={cn(
              'transition-colors',
              isActive && direction === 'asc' ? 'text-primary' : 'text-muted-foreground/30'
            )}
          />
          <Icon
            name="ChevronDown"
            size={12}
            className={cn(
              'transition-colors -mt-1',
              isActive && direction === 'desc' ? 'text-primary' : 'text-muted-foreground/30'
            )}
          />
        </div>
      </div>
    </div>
  );
}