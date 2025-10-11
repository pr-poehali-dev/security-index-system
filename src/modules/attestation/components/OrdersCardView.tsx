import { Card, CardContent } from '@/components/ui/card';
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
import { getOrderTypeLabel, getOrderTypeIcon, getOrderTypeColor, getStatusLabel, getStatusColor } from '../utils/orderUtils';
import type { Order } from '@/types';

interface OrdersCardViewProps {
  orders: Order[];
  onChangeStatus: (orderId: string, newStatus: string) => void;
  onView: (orderId: string) => void;
  onEdit: (orderId: string) => void;
  onDownloadPDF: (orderId: string) => void;
  onPrint: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  getOrderActions: (order: Order) => React.ReactNode[];
}

export default function OrdersCardView({
  orders,
  onChangeStatus,
  onView,
  onEdit,
  onDownloadPDF,
  onPrint,
  onDelete,
  getOrderActions
}: OrdersCardViewProps) {
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
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={getOrderTypeIcon(order.type)} size={18} className="text-muted-foreground" />
                  <span className="font-semibold text-lg">Приказ №{order.number}</span>
                  <Badge className={getOrderTypeColor(order.type)}>
                    {getOrderTypeLabel(order.type)}
                  </Badge>
                </div>
                <h3 className="font-medium mb-2">{order.title}</h3>
                {order.description && (
                  <p className="text-sm text-muted-foreground mb-3">{order.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Icon name="Calendar" size={14} />
                    {new Date(order.date).toLocaleDateString('ru')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="User" size={14} />
                    {order.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Users" size={14} />
                    {order.employeeIds.length} чел.
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
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
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Сотрудников:</span>
                <span className="font-medium">{order.employeeIds.length}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {getOrderActions(order)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Icon name="MoreVertical" size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(order.id)}>
                      <Icon name="Eye" size={14} className="mr-2" />
                      Просмотр
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(order.id)}>
                      <Icon name="Edit" size={14} className="mr-2" />
                      Редактировать
                    </DropdownMenuItem>
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
