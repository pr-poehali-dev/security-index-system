// src/components/ui/view-mode-toggle.tsx
// Описание: UI компонент переключателя режимов отображения (сетка/список/таблица) с иконками и текстом
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export type ViewMode = 'grid' | 'list' | 'table' | 'cards';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  modes?: ViewMode[];
}

const modeConfig: Record<ViewMode, { icon: string; label: string }> = {
  grid: { icon: 'LayoutGrid', label: 'Сетка' },
  cards: { icon: 'LayoutGrid', label: 'Карточки' },
  list: { icon: 'List', label: 'Список' },
  table: { icon: 'Table', label: 'Таблица' }
};

export function ViewModeToggle({ 
  value, 
  onChange, 
  modes = ['cards', 'table'] 
}: ViewModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-2">
      {modes.map((mode) => (
        <Button
          key={mode}
          variant={value === mode ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(mode)}
          className="gap-2"
        >
          <Icon name={modeConfig[mode].icon} size={16} />
          {modeConfig[mode].label}
        </Button>
      ))}
    </div>
  );
}