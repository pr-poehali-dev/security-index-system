import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { EmployeeStatus } from '../../types/contractors';
import type { Contractor } from '../../types/contractors';

interface EmployeeFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: EmployeeStatus | 'all';
  onStatusChange: (status: EmployeeStatus | 'all') => void;
  contractorFilter: string;
  onContractorChange: (contractorId: string) => void;
  contractors: Contractor[];
}

export default function EmployeeFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  contractorFilter,
  onContractorChange,
  contractors
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Icon
            name="Search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Поиск по ФИО..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={contractorFilter} onValueChange={onContractorChange}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Подрядчик" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все подрядчики</SelectItem>
            {contractors.map((contractor) => (
              <SelectItem key={contractor.id} value={contractor.id}>
                {contractor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('all')}
          >
            Все
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange('active')}
          >
            Активные
          </Button>
        </div>
      </div>
    </div>
  );
}
