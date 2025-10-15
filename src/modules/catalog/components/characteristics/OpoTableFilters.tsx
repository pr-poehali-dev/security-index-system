import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OpoTableFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  organizationFilter: string;
  onOrganizationChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  uniqueOrganizations: string[];
}

export default function OpoTableFilters({
  searchQuery,
  onSearchChange,
  organizationFilter,
  onOrganizationChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  uniqueOrganizations,
}: OpoTableFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию, организации, рег. номеру..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Select value={organizationFilter} onValueChange={onOrganizationChange}>
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Все организации" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все организации</SelectItem>
          {uniqueOrganizations.map((org) => (
            <SelectItem key={org} value={org}>
              {org}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Все типы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все типы</SelectItem>
          <SelectItem value="opo">ОПО</SelectItem>
          <SelectItem value="gts">ГТС</SelectItem>
          <SelectItem value="building">Здание/Сооружение</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="sufficient">Данных достаточно</SelectItem>
          <SelectItem value="insufficient">Данных недостаточно</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
