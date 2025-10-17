import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TrainingRequestsFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
}

export default function TrainingRequestsFilters({
  statusFilter,
  priorityFilter,
  onStatusChange,
  onPriorityChange,
}: TrainingRequestsFiltersProps) {
  return (
    <div className="flex gap-4">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="pending">На рассмотрении</SelectItem>
          <SelectItem value="approved">Согласовано</SelectItem>
          <SelectItem value="rejected">Отклонено</SelectItem>
          <SelectItem value="in_progress">В процессе</SelectItem>
          <SelectItem value="completed">Завершено</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Приоритет" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все приоритеты</SelectItem>
          <SelectItem value="high">Высокий</SelectItem>
          <SelectItem value="medium">Средний</SelectItem>
          <SelectItem value="low">Низкий</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
