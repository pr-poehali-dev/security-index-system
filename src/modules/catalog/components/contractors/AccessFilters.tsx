import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IndustrialObject } from '@/types/catalog';

interface AccessFiltersProps {
  searchQuery: string;
  filterObject: string;
  filterStatus: string;
  catalogObjects: IndustrialObject[];
  onSearchChange: (value: string) => void;
  onObjectFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onGrantAccess: () => void;
}

export default function AccessFilters({
  searchQuery,
  filterObject,
  filterStatus,
  catalogObjects,
  onSearchChange,
  onObjectFilterChange,
  onStatusFilterChange,
  onGrantAccess,
}: AccessFiltersProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Поиск по сотруднику или объекту..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterObject} onValueChange={onObjectFilterChange}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Объект" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все объекты</SelectItem>
            {catalogObjects.map((obj) => (
              <SelectItem key={obj.id} value={obj.id}>
                {obj.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активен</SelectItem>
            <SelectItem value="suspended">Приостановлен</SelectItem>
            <SelectItem value="expired">Истек</SelectItem>
            <SelectItem value="revoked">Отозван</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onGrantAccess}>
          <Icon name="KeyRound" size={16} className="mr-2" />
          Предоставить доступ
        </Button>
      </div>
    </Card>
  );
}
