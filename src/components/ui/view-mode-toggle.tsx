// src/components/ui/view-mode-toggle.tsx
// Описание: UI компонент переключателя режимов отображения (сетка/список/таблица)
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
    <div className="inline-flex items-center bg-background border border-border rounded-lg overflow-hidden">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          title={modeConfig[mode].title}
          className={`
            px-3 py-2 transition-all duration-200
            flex items-center justify-center
            hover:bg-muted/50
            ${value === mode 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background text-muted-foreground'
            }
            ${modes.indexOf(mode) !== modes.length - 1 ? 'border-r border-border' : ''}
          `}
        >
          <Icon name={modeConfig[mode].icon} size={18} />
        </button>
      ))}
    </div>
  );
}