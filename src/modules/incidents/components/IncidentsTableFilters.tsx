import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Direction } from '@/types';

interface IncidentsTableFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  directionFilter: string;
  setDirectionFilter: (value: string) => void;
  directions: Direction[];
}

export default function IncidentsTableFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  directionFilter,
  setDirectionFilter,
  directions
}: IncidentsTableFiltersProps) {
  return (
    <div className="flex gap-4 mb-4 flex-wrap">
      <Input
        placeholder="Поиск по описанию..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="in_progress">В работе</SelectItem>
          <SelectItem value="awaiting">Ожидает</SelectItem>
          <SelectItem value="overdue">Просрочено</SelectItem>
          <SelectItem value="completed">Исполнено</SelectItem>
        </SelectContent>
      </Select>
      <Select value={directionFilter} onValueChange={setDirectionFilter}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Направление" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все направления</SelectItem>
          {directions.filter(d => d.status === 'active').map((dir) => (
            <SelectItem key={dir.id} value={dir.id}>{dir.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
