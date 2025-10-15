import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MassActionFiltersProps {
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
  uniqueCategories: string[];
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export default function MassActionFilters({
  searchQuery,
  categoryFilter,
  statusFilter,
  uniqueCategories,
  onSearchChange,
  onCategoryFilterChange,
  onStatusFilterChange,
}: MassActionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по области, категории или ФИО..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-full sm:w-[250px]">
          <SelectValue placeholder="Категория" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все категории</SelectItem>
          {uniqueCategories.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="valid">Действует</SelectItem>
          <SelectItem value="expiring_soon">Истекает</SelectItem>
          <SelectItem value="expired">Просрочен</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
