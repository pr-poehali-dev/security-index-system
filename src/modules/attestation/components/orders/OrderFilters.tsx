import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  orderTypeFilter: string;
  setOrderTypeFilter: (value: string) => void;
  orderStatusFilter: string;
  setOrderStatusFilter: (value: string) => void;
}

export default function OrderFilters({
  searchQuery,
  setSearchQuery,
  orderTypeFilter,
  setOrderTypeFilter,
  orderStatusFilter,
  setOrderStatusFilter
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по номеру, названию или сотрудникам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Тип приказа" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все типы</SelectItem>
          <SelectItem value="attestation">Аттестация</SelectItem>
          <SelectItem value="training">Обучение</SelectItem>
          <SelectItem value="suspension">Отстранение</SelectItem>
          <SelectItem value="sdo">СДО</SelectItem>
          <SelectItem value="training_center">Учебный центр</SelectItem>
          <SelectItem value="internal_attestation">ЕПТ организации</SelectItem>
          <SelectItem value="rostechnadzor">Ростехнадзор</SelectItem>
        </SelectContent>
      </Select>
      <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="draft">Черновик</SelectItem>
          <SelectItem value="prepared">Подготовлен</SelectItem>
          <SelectItem value="approved">Согласован</SelectItem>
          <SelectItem value="active">Активен</SelectItem>
          <SelectItem value="completed">Исполнен</SelectItem>
          <SelectItem value="cancelled">Отменен</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
