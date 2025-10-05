import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export type ViewMode = 'grid' | 'list' | 'table';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  modes?: ViewMode[];
}

const modeConfig: Record<ViewMode, { icon: string; title: string }> = {
  grid: { icon: 'LayoutGrid', title: 'Сетка' },
  list: { icon: 'List', title: 'Список' },
  table: { icon: 'Table', title: 'Таблица' }
};

export function ViewModeToggle({ 
  value, 
  onChange, 
  modes = ['grid', 'list', 'table'] 
}: ViewModeToggleProps) {
  return (
    <div className="flex gap-1 border rounded-lg p-1">
      {modes.map((mode) => (
        <Button
          key={mode}
          variant={value === mode ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChange(mode)}
          title={modeConfig[mode].title}
        >
          <Icon name={modeConfig[mode].icon} size={16} />
        </Button>
      ))}
    </div>
  );
}
