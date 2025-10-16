// src/modules/attestation/components/orders/OrdersTableView.tsx
// Описание: Табличное представление приказов с сортировкой и фильтрацией
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { SortableTableHeader, type SortDirection } from '@/components/ui/sortable-table-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Order } from '@/stores/ordersStore';
import { getOrderTypeLabel, getOrderTypeColor } from '@/modules/attestation/utils/typeHelpers';
import { getOrderStatusLabel, getOrderStatusColor } from '@/modules/attestation/utils/statusHelpers';
import { formatDate } from '@/modules/attestation/utils/formatters';

interface OrdersTableViewProps {
  orders: Order[];
  onChangeStatus: (orderId: string, newStatus: string) => void;
  onView: (orderId: string) => void;
  onEdit: (orderId: string) => void;
  onDownloadPDF: (orderId: string) => void;
  onPrint: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  onSendToTraining?: (orderId: string) => void;
  onSendToSDO?: (orderId: string) => void;
}



export default function OrdersTableView({
  orders,
  onView,
  onEdit,
  onDownloadPDF,
  onPrint,
  onDelete,
  onSendToTraining,
  onSendToSDO
}: OrdersTableViewProps) {
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: SortDirection }>({ 
    field: 'date', 
    direction: 'desc' 
  });

  const handleSort = (field: string) => {
    setSortConfig(prev => {
      if (prev.field !== field) {
        return { field, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      if (prev.direction === 'desc') {
        return { field, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  const sortedOrders = useMemo(() => {
    if (!sortConfig.direction) return orders;

    return [...orders].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'number':
          aValue = a.number.toLowerCase();
          bValue = b.number.toLowerCase();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          const statusOrder = { draft: 1, prepared: 2, approved: 3, active: 4, completed: 5, cancelled: 6 };
          aValue = statusOrder[a.status as keyof typeof statusOrder];
          bValue = statusOrder[b.status as keyof typeof statusOrder];
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'employees':
          aValue = a.employeeIds.length;
          bValue = b.employeeIds.length;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, sortConfig]);

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
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <SortableTableHeader
                label="Номер"
                field="number"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Название"
                field="title"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Тип"
                field="type"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Статус"
                field="status"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Дата"
                field="date"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Сотрудников"
                field="employees"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <th className="text-right p-3 font-semibold text-sm">Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order) => (
              <tr 
                key={order.id}
                className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Icon name="FileText" size={16} className="text-blue-600" />
                    <span className="font-medium">{order.number}</span>
                  </div>
                </td>
                <td className="p-3">
                  <p className="font-medium">{order.title}</p>
                  {order.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {order.description}
                    </p>
                  )}
                </td>
                <td className="p-3">
                  <Badge className={getOrderTypeColor(order.type)}>
                    {getOrderTypeLabel(order.type)}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge className={getOrderStatusColor(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </td>
                <td className="p-3">
                  <span className="text-sm">{formatDate(order.date)}</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Icon name="Users" size={14} className="text-muted-foreground" />
                    <span className="text-sm">{order.employeeIds.length}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    {order.type === 'training' && order.status === 'approved' && onSendToTraining && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onSendToTraining(order.id)}
                        title="Отправить в учебный центр"
                      >
                        <Icon name="Send" size={16} />
                      </Button>
                    )}
                    {order.type === 'lms' && order.status === 'approved' && onSendToSDO && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onSendToSDO(order.id)}
                        title="Отправить в СДО"
                      >
                        <Icon name="Monitor" size={16} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(order.id)}
                      title="Просмотр"
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Icon name="MoreVertical" size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}