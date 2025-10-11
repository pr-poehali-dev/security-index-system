import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getOrderTypeLabel, getOrderTypeColor, getStatusLabel } from '../utils/orderUtils';
import type { Order } from '@/types';

interface OrdersTableViewProps {
  orders: Order[];
  onChangeStatus: (orderId: string, newStatus: string) => void;
  onView: (orderId: string) => void;
  onEdit: (orderId: string) => void;
  onDownloadPDF: (orderId: string) => void;
  onPrint: (orderId: string) => void;
  onDelete: (orderId: string) => void;
}

export default function OrdersTableView({
  orders,
  onChangeStatus,
  onView,
  onEdit,
  onDownloadPDF,
  onPrint,
  onDelete
}: OrdersTableViewProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">Приказы не найдены</p>
        <p className="text-sm text-muted-foreground">Измените параметры поиска или создайте новый приказ</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left">
            <th className="pb-3 font-medium">Номер</th>
            <th className="pb-3 font-medium">Название</th>
            <th className="pb-3 font-medium">Тип</th>
            <th className="pb-3 font-medium">Дата</th>
            <th className="pb-3 font-medium">Сотрудников</th>
            <th className="pb-3 font-medium">Статус</th>
            <th className="pb-3 font-medium">Действия</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
              <td className="py-3 font-medium">№{order.number}</td>
              <td className="py-3">
                <div>
                  <div className="font-medium">{order.title}</div>
                  {order.description && (
                    <div className="text-xs text-muted-foreground mt-1">{order.description}</div>
                  )}
                </div>
              </td>
              <td className="py-3">
                <Badge className={getOrderTypeColor(order.type)}>
                  {getOrderTypeLabel(order.type)}
                </Badge>
              </td>
              <td className="py-3 text-muted-foreground text-sm">
                {new Date(order.date).toLocaleDateString('ru')}
              </td>
              <td className="py-3 text-center">{order.employeeIds.length}</td>
              <td className="py-3">
                <Select value={order.status} onValueChange={(value) => onChangeStatus(order.id, value)}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="prepared">Подготовлен</SelectItem>
                    <SelectItem value="approved">Согласован</SelectItem>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="completed">Исполнен</SelectItem>
                    <SelectItem value="cancelled">Отменен</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" title="Просмотр" onClick={() => onView(order.id)}>
                    <Icon name="Eye" size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" title="Редактировать" onClick={() => onEdit(order.id)}>
                    <Icon name="Edit" size={16} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Icon name="MoreVertical" size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDownloadPDF(order.id)}>
                        <Icon name="Download" size={14} className="mr-2" />
                        Скачать PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPrint(order.id)}>
                        <Icon name="Printer" size={14} className="mr-2" />
                        Печать
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete(order.id)}>
                        <Icon name="Trash2" size={14} className="mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
