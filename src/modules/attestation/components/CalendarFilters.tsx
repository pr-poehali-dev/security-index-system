import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalendarFiltersProps {
  filterDepartment: string;
  setFilterDepartment: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  departments: string[];
  categories: string[];
  viewType: 'month' | 'year';
  setViewType: (value: 'month' | 'year') => void;
}

export default function CalendarFilters({
  filterDepartment,
  setFilterDepartment,
  filterCategory,
  setFilterCategory,
  departments,
  categories,
  viewType,
  setViewType
}: CalendarFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filterDepartment} onValueChange={setFilterDepartment}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все подразделения</SelectItem>
          {departments.map(dep => (
            <SelectItem key={dep} value={dep}>{dep}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterCategory} onValueChange={setFilterCategory}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все категории</SelectItem>
          {categories.filter(cat => cat && cat.trim() !== '').map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-1 border rounded-lg p-1">
        <Button
          variant={viewType === 'month' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewType('month')}
          className="gap-1"
        >
          <Icon name="Calendar" size={14} />
          Месяц
        </Button>
        <Button
          variant={viewType === 'year' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewType('year')}
          className="gap-1"
        >
          <Icon name="CalendarDays" size={14} />
          Год
        </Button>
      </div>
    </div>
  );
}