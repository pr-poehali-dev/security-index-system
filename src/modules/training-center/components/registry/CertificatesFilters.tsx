import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { Organization } from '@/types';

interface CertificatesFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  organizationFilter: string;
  setOrganizationFilter: (value: string) => void;
  groupByOrganization: boolean;
  setGroupByOrganization: (value: boolean) => void;
  uniqueOrganizations: (Organization | undefined)[];
}

export default function CertificatesFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  organizationFilter,
  setOrganizationFilter,
  groupByOrganization,
  setGroupByOrganization,
  uniqueOrganizations
}: CertificatesFiltersProps) {
  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Поиск по ФИО, номеру удостоверения или программе..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="issued">Выдано</SelectItem>
          <SelectItem value="delivered">Передано</SelectItem>
          <SelectItem value="synced">Синхронизировано</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Категория" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все категории</SelectItem>
          <SelectItem value="industrial_safety">Промбезопасность</SelectItem>
          <SelectItem value="energy_safety">Энергобезопасность</SelectItem>
          <SelectItem value="labor_safety">Охрана труда</SelectItem>
          <SelectItem value="ecology">Экология</SelectItem>
        </SelectContent>
      </Select>

      <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Организация" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все организации</SelectItem>
          {uniqueOrganizations.map(org => org && (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant={groupByOrganization ? 'default' : 'outline'}
        onClick={() => setGroupByOrganization(!groupByOrganization)}
        className="gap-2"
      >
        <Icon name="Layers" size={16} />
        {groupByOrganization ? 'Без группировки' : 'Группировать'}
      </Button>
    </div>
  );
}
