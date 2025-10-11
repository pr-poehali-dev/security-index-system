import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TrainingFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  trainingStatusFilter: string;
  setTrainingStatusFilter: (value: string) => void;
}

export default function TrainingFilters({
  searchQuery,
  setSearchQuery,
  trainingStatusFilter,
  setTrainingStatusFilter
}: TrainingFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию, организации или сотрудникам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={trainingStatusFilter} onValueChange={setTrainingStatusFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="planned">Запланировано</SelectItem>
          <SelectItem value="in_progress">В процессе</SelectItem>
          <SelectItem value="completed">Завершено</SelectItem>
          <SelectItem value="cancelled">Отменено</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
