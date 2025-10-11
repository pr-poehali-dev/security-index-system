import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Direction, Organization, ProductionSite } from '@/types';

interface IncidentsKanbanFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  directionFilter: string;
  setDirectionFilter: (value: string) => void;
  organizationFilter: string;
  setOrganizationFilter: (value: string) => void;
  siteFilter: string;
  setSiteFilter: (value: string) => void;
  directions: Direction[];
  organizations: Organization[];
  productionSites: ProductionSite[];
}

export default function IncidentsKanbanFilters({
  searchTerm,
  setSearchTerm,
  directionFilter,
  setDirectionFilter,
  organizationFilter,
  setOrganizationFilter,
  siteFilter,
  setSiteFilter,
  directions,
  organizations,
  productionSites
}: IncidentsKanbanFiltersProps) {
  return (
    <div className="flex gap-4 mb-4 flex-wrap">
      <Input
        placeholder="Поиск по описанию..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Select value={directionFilter} onValueChange={setDirectionFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Направление" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все направления</SelectItem>
          {directions.filter(d => d.status === 'active').map((dir) => (
            <SelectItem key={dir.id} value={dir.id}>{dir.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Организация" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все организации</SelectItem>
          {organizations.filter(o => o.status === 'active').map((org) => (
            <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={siteFilter} onValueChange={setSiteFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Площадка" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все площадки</SelectItem>
          {productionSites.filter(s => s.status === 'active').map((site) => (
            <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
