import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Organization } from '@/types';

interface PersonnelFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterOrg: string;
  onFilterOrgChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  organizations: Organization[];
}

export default function PersonnelFilters({
  searchTerm,
  onSearchChange,
  filterOrg,
  onFilterOrgChange,
  filterStatus,
  onFilterStatusChange,
  filterType,
  onFilterTypeChange,
  organizations
}: PersonnelFiltersProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Input
        placeholder="Поиск по ФИО, должности, email..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-72"
      />
      <Select value={filterOrg} onValueChange={onFilterOrgChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Организация" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все организации</SelectItem>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filterStatus} onValueChange={onFilterStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="active">Активные</SelectItem>
          <SelectItem value="inactive">Неактивные</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterType} onValueChange={onFilterTypeChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Тип" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все типы</SelectItem>
          <SelectItem value="employee">Штатные</SelectItem>
          <SelectItem value="contractor">Подрядчики</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
