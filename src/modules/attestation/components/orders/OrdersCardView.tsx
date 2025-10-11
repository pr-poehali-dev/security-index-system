import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Order } from '@/stores/attestationStore';

interface OrdersCardViewProps {
  orders: Order[];
  onChangeStatus: (orderId: string, newStatus: string) => void;
  onView: (orderId: string) => void;
  onEdit: (orderId: string) => void;
  onDownloadPDF: (orderId: string) => void;
  onPrint: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  getOrderActions: (order: Order) => JSX.Element[];
}

const getOrderTypeLabel = (type: Order['type']) => {
  switch (type) {
    case 'attestation': return 'Аттестация';
    case 'training': return 'Обучение';
    case 'suspension': return 'Отстранение';
    case 'lms': return 'СДО';
    case 'internal': return 'Внутренний';
    default: return type;
  }
};

const getOrderTypeColor = (type: Order['type']) => {
  switch (type) {
    case 'attestation': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
    case 'training': return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
    case 'suspension': return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
    case 'lms': return 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400';
    case 'internal': return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';
  }
};

const getStatusLabel = (status: Order['status']) => {
  switch (status) {
    case 'draft': return 'Черновик';
    case 'active': return 'Активен';
    case 'completed': return 'Выполнен';
    case 'cancelled': return 'Отменен';
    default: return status;
  }
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';
    case 'active': return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
    case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function OrdersCardView({
  orders,
  onView,
  onEdit,
  onDownloadPDF,
  onPrint,
  onDelete
}: OrdersCardViewProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Icon name="FileText" className="mx-auto mb-3" size={48} />
        <p className="text-lg font-medium mb-1">Приказы не найдены</p>
        <p className="text-sm">Создайте первый приказ или измените фильтры</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getOrderTypeColor(order.type)}>
                    {getOrderTypeLabel(order.type)}
                  </Badge>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{order.number}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {order.title}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Icon name="MoreVertical" size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(order.id)}>
                    <Icon name="Eye" size={16} className="mr-2" />
                    Просмотр
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(order.id)}>
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownloadPDF(order.id)}>
                    <Icon name="Download" size={16} className="mr-2" />
                    Скачать PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPrint(order.id)}>
                    <Icon name="Printer" size={16} className="mr-2" />
                    Печать
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(order.id)}
                    className="text-red-600"
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="Calendar" size={14} />
                <span>Дата: {formatDate(order.date)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="Users" size={14} />
                <span>Сотрудников: {order.employeeIds.length}</span>
              </div>

              {order.createdBy && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="User" size={14} />
                  <span>{order.createdBy}</span>
                </div>
              )}

              {order.description && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {order.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(order.id)}
                className="flex-1"
              >
                <Icon name="Eye" size={14} className="mr-1" />
                Просмотр
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(order.id)}
                className="flex-1"
              >
                <Icon name="Edit" size={14} className="mr-1" />
                Изменить
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
