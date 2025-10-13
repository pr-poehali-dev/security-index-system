import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';

interface PersonnelHeaderProps {
  totalCount: number;
  activeCount: number;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
}

export default function PersonnelHeader({
  totalCount,
  activeCount,
  viewMode,
  onViewModeChange,
  onExport,
  onImport,
  onAdd
}: PersonnelHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex justify-between items-center flex-wrap gap-4">
      <p className="text-sm text-muted-foreground">
        Всего: {totalCount} (активных: {activeCount})
      </p>
      <div className="flex gap-2">
        <ViewModeToggle
          value={viewMode}
          onChange={onViewModeChange}
          modes={['cards', 'table']}
        />
        <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
          <Icon name="Download" size={14} />
          Экспорт
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Icon name="Upload" size={14} />
          Импорт
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={onImport}
          className="hidden"
        />
        <Button onClick={onAdd} size="sm" className="gap-2">
          <Icon name="UserPlus" size={14} />
          Добавить
        </Button>
      </div>
    </div>
  );
}
