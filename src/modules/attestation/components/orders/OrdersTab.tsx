// src/modules/attestation/components/orders/OrdersTab.tsx
// Описание: Вкладка приказов с переключением между табличным и карточным видом
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';
import type { Order } from '@/stores/ordersStore';
import OrdersStats from './OrdersStats';
import OrdersCardView from './OrdersCardView';
import OrdersTableView from './OrdersTableView';
import OrderFilters from './OrderFilters';

interface OrdersTabProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  orderTypeFilter: string;
  setOrderTypeFilter: (value: string) => void;
  orderStatusFilter: string;
  setOrderStatusFilter: (value: string) => void;
  orderViewMode: 'cards' | 'table';
  setOrderViewMode: (mode: 'cards' | 'table') => void;
  filteredOrders: Order[];
  orderStats: {
    total: number;
    draft: number;
    active: number;
    completed: number;
  };
  onChangeStatus: (orderId: string, newStatus: string) => void;
  onView: (orderId: string) => void;
  onEdit: (orderId: string) => void;
  onDownloadPDF: (orderId: string) => void;
  onPrint: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  onSendToTraining?: (orderId: string) => void;
  onSendToSDO?: (orderId: string) => void;
  onExportToExcel: () => void;
  onCreateOrder: () => void;
  getOrderActions: (order: Order) => JSX.Element[];
}

export default function OrdersTab({
  searchQuery,
  setSearchQuery,
  orderTypeFilter,
  setOrderTypeFilter,
  orderStatusFilter,
  setOrderStatusFilter,
  orderViewMode,
  setOrderViewMode,
  filteredOrders,
  orderStats,
  onChangeStatus,
  onView,
  onEdit,
  onDownloadPDF,
  onPrint,
  onDelete,
  onSendToTraining,
  onSendToSDO,
  onExportToExcel,
  onCreateOrder,
  getOrderActions
}: OrdersTabProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Icon name="Construction" size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Раздел находится в разработке
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Функционал создания и управления приказами находится в стадии разработки. 
                В ближайшее время здесь появится возможность автоматического формирования приказов 
                на направление сотрудников на обучение и аттестацию.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <OrdersStats 
        total={orderStats.total}
        draft={orderStats.draft}
        active={orderStats.active}
        completed={orderStats.completed}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Список приказов</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <ViewModeToggle
                value={orderViewMode}
                onChange={setOrderViewMode}
                modes={['cards', 'table']}
              />
              <Button variant="outline" onClick={onExportToExcel} className="gap-2">
                <Icon name="Download" size={16} />
                Экспорт
              </Button>
              <Button onClick={onCreateOrder} className="gap-2">
                <Icon name="Plus" size={16} />
                Создать приказ
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <OrderFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              orderTypeFilter={orderTypeFilter}
              setOrderTypeFilter={setOrderTypeFilter}
              orderStatusFilter={orderStatusFilter}
              setOrderStatusFilter={setOrderStatusFilter}
            />
          </div>

          {orderViewMode === 'cards' ? (
            <OrdersCardView
              orders={filteredOrders}
              onChangeStatus={onChangeStatus}
              onView={onView}
              onEdit={onEdit}
              onDownloadPDF={onDownloadPDF}
              onPrint={onPrint}
              onDelete={onDelete}
              onSendToTraining={onSendToTraining}
              onSendToSDO={onSendToSDO}
              getOrderActions={getOrderActions}
            />
          ) : (
            <OrdersTableView
              orders={filteredOrders}
              onChangeStatus={onChangeStatus}
              onView={onView}
              onEdit={onEdit}
              onDownloadPDF={onDownloadPDF}
              onPrint={onPrint}
              onDelete={onDelete}
              onSendToTraining={onSendToTraining}
              onSendToSDO={onSendToSDO}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}