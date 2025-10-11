import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Organization, Checklist } from '@/types';

interface AuditFiltersCardProps {
  searchQuery: string;
  statusFilter: string;
  organizationFilter: string;
  checklistFilter: string;
  dateFrom: string;
  dateTo: string;
  filteredCount: number;
  totalCount: number;
  organizations: Organization[];
  checklists: Checklist[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;
  onChecklistChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function AuditFiltersCard({
  searchQuery,
  statusFilter,
  organizationFilter,
  checklistFilter,
  dateFrom,
  dateTo,
  filteredCount,
  totalCount,
  organizations,
  checklists,
  onSearchChange,
  onStatusChange,
  onOrganizationChange,
  onChecklistChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters
}: AuditFiltersCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Поиск по названию чек-листа или объекту..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="scheduled">Запланирован</SelectItem>
                  <SelectItem value="in_progress">В процессе</SelectItem>
                  <SelectItem value="completed">Завершен</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Объект</Label>
              <Select value={organizationFilter} onValueChange={onOrganizationChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все объекты</SelectItem>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Чек-лист</Label>
              <Select value={checklistFilter} onValueChange={onChecklistChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все чек-листы</SelectItem>
                  {checklists.map(checklist => (
                    <SelectItem key={checklist.id} value={checklist.id}>
                      {checklist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Период</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  placeholder="От"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  placeholder="До"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-600">
              Найдено: <span className="font-medium">{filteredCount}</span> из {totalCount}
            </p>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Сбросить фильтры
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
