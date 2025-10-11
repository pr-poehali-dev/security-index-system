import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EmployeeFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  organizationFilter: string;
  setOrganizationFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  verificationFilter: string;
  setVerificationFilter: (value: string) => void;
  uniqueOrganizations: string[];
}

export default function EmployeeFilters({
  searchQuery,
  setSearchQuery,
  organizationFilter,
  setOrganizationFilter,
  statusFilter,
  setStatusFilter,
  verificationFilter,
  setVerificationFilter,
  uniqueOrganizations
}: EmployeeFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по ФИО, должности или организации..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Организация" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Icon name="Building2" size={14} />
                Все организации
              </div>
            </SelectItem>
            {uniqueOrganizations.map((org) => (
              <SelectItem key={org} value={org}>
                <div className="flex items-center gap-2">
                  <Icon name="Building2" size={14} />
                  {org}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Статус аттестации" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="valid">Действующие</SelectItem>
            <SelectItem value="expiring_soon">Истекают</SelectItem>
            <SelectItem value="expired">Просрочены</SelectItem>
          </SelectContent>
        </Select>

        <Select value={verificationFilter} onValueChange={setVerificationFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Статус проверки" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                Все проверки
              </div>
            </SelectItem>
            <SelectItem value="verified">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" size={14} className="text-emerald-600" />
                Проверенные
              </div>
            </SelectItem>
            <SelectItem value="unverified">
              <div className="flex items-center gap-2">
                <Icon name="AlertCircle" size={14} className="text-amber-600" />
                Непроверенные
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}