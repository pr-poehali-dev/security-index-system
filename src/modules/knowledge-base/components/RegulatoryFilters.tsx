import type { RegulatoryDocumentType } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Icon from '@/components/ui/icon';

interface RegulatoryFiltersProps {
  selectedType: RegulatoryDocumentType | 'all';
  showActive: boolean;
  onTypeChange: (type: RegulatoryDocumentType | 'all') => void;
  onActiveChange: (active: boolean) => void;
  onReset: () => void;
}

export default function RegulatoryFilters({
  selectedType,
  showActive,
  onTypeChange,
  onActiveChange,
  onReset,
}: RegulatoryFiltersProps) {
  const hasActiveFilters = selectedType !== 'all' || !showActive;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[200px]">
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Тип документа" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="federal_law">Федеральный закон</SelectItem>
            <SelectItem value="government_decree">Постановление Правительства РФ</SelectItem>
            <SelectItem value="rostekhnadzor_order">Приказ Ростехнадзора</SelectItem>
            <SelectItem value="minenergo_order">Приказ Минэнерго России</SelectItem>
            <SelectItem value="mchs_order">Приказ МЧС России</SelectItem>
            <SelectItem value="minprirody_order">Приказ Минприроды России</SelectItem>
            <SelectItem value="minstroy_order">Приказ Минстрой России</SelectItem>
            <SelectItem value="mintrans_order">Приказ Минтранс России</SelectItem>
            <SelectItem value="mintrud_order">Приказ Минтруд России</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          variant={showActive ? "default" : "outline"}
          size="sm"
          onClick={() => onActiveChange(true)}
          className="gap-2"
        >
          <Icon name="CheckCircle2" size={16} />
          Действующие
        </Button>
        <Button
          variant={!showActive ? "default" : "outline"}
          size="sm"
          onClick={() => onActiveChange(false)}
          className="gap-2"
        >
          <Icon name="XCircle" size={16} />
          Не действующие
        </Button>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2"
        >
          <Icon name="RotateCcw" size={16} />
          Сбросить
        </Button>
      )}
    </div>
  );
}