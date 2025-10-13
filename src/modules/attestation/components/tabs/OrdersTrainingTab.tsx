import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import CreateOrderDialog from '../CreateOrderDialog';
import CreateTrainingDialog from '../CreateTrainingDialog';
import SendToTrainingCenterDialog from '../SendToTrainingCenterDialog';
import AttestationOrdersList from '../AttestationOrdersList';
import { useAuthStore } from '@/stores/authStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { useTrainingsAttestationStore } from '@/stores/trainingsAttestationStore';
import { useAttestationOrdersStore } from '@/stores/attestationOrdersStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { createOrderHandlers } from '../orders/orderHandlers';
import { createTrainingHandlers } from '../orders/trainingHandlers';
import OrdersTab from '../orders/OrdersTab';
import TrainingsTab from '../orders/TrainingsTab';
import type { Order } from '@/stores/ordersStore';

export default function OrdersTrainingTab() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { orders, getOrdersByTenant } = useOrdersStore();
  const { trainings, getTrainingsByTenant } = useTrainingsAttestationStore();
  const { getOrdersByTenant: getAttestationOrders } = useAttestationOrdersStore();
  const { personnel, people, positions, getContractorsByType } = useSettingsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');
  const [trainingStatusFilter, setTrainingStatusFilter] = useState<string>('all');
  const [orderViewMode, setOrderViewMode] = useState<'cards' | 'table'>('cards');
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
  const [showCreateTrainingDialog, setShowCreateTrainingDialog] = useState(false);
  const [showSendToTCDialog, setShowSendToTCDialog] = useState(false);
  const [selectedOrderForTC, setSelectedOrderForTC] = useState<Order | null>(null);
  const [trainingViewMode, setTrainingViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedTrainings, setExpandedTrainings] = useState<Set<string>>(new Set());

  const tenantOrders = user?.tenantId ? getOrdersByTenant(user.tenantId) : [];
  const tenantTrainings = user?.tenantId ? getTrainingsByTenant(user.tenantId) : [];
  const attestationOrders = user?.tenantId ? getAttestationOrders(user.tenantId) : [];
  const trainingOrgs = user?.tenantId ? getContractorsByType(user.tenantId, 'training_center') : [];

  const toggleTrainingExpanded = (trainingId: string) => {
    setExpandedTrainings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trainingId)) {
        newSet.delete(trainingId);
      } else {
        newSet.add(trainingId);
      }
      return newSet;
    });
  };

  const filteredOrders = tenantOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const matchesType = orderTypeFilter === 'all' || order.type === orderTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredTrainings = tenantTrainings.filter(training => {
    const org = trainingOrgs.find(o => o.id === training.organizationId);
    const matchesSearch = training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (org?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = trainingStatusFilter === 'all' || training.status === trainingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderHandlers = createOrderHandlers(
    orders,
    personnel,
    people,
    positions,
    toast,
    user?.tenantId
  );

  const trainingHandlers = createTrainingHandlers(trainings, toast);

  const handleExportOrdersToExcel = async () => {
    const { utils, writeFile } = await import('xlsx');
    
    const exportData = filteredOrders.map(order => ({
      'Номер приказа': order.number,
      'Дата': new Date(order.date).toLocaleDateString('ru'),
      'Тип': order.type,
      'Название': order.title,
      'Статус': order.status,
      'Количество сотрудников': order.employeeIds.length,
      'Создал': order.createdBy,
      'Описание': order.description || ''
    }));

    const ws = utils.json_to_sheet(exportData);
    
    const colWidths = [
      { wch: 15 },
      { wch: 12 },
      { wch: 25 },
      { wch: 50 },
      { wch: 15 },
      { wch: 20 },
      { wch: 40 },
      { wch: 25 },
      { wch: 50 }
    ];
    ws['!cols'] = colWidths;

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Приказы');

    const fileName = `Приказы_${new Date().toLocaleDateString('ru')}.xlsx`;
    writeFile(wb, fileName);
  };

  const handleExportTrainingsToExcel = async () => {
    const { utils, writeFile } = await import('xlsx');
    
    const exportData = filteredTrainings.map(training => {
      const org = trainingOrgs.find(o => o.id === training.organizationId);
      return {
        'Название': training.title,
        'Тип': training.type,
        'Организация': org?.name || '',
        'Дата начала': new Date(training.startDate).toLocaleDateString('ru'),
        'Дата окончания': new Date(training.endDate).toLocaleDateString('ru'),
        'Длительность (дней)': Math.ceil((new Date(training.endDate).getTime() - new Date(training.startDate).getTime()) / (1000 * 60 * 60 * 24)),
        'Статус': training.status,
        'Количество сотрудников': training.employeeIds.length,
        'Стоимость': training.cost,
        'Стоимость на человека': Math.round(training.cost / training.employeeIds.length),
        'Программа': training.program || ''
      };
    });

    const ws = utils.json_to_sheet(exportData);
    
    const colWidths = [
      { wch: 35 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 17 },
      { wch: 18 },
      { wch: 15 },
      { wch: 22 },
      { wch: 35 },
      { wch: 12 },
      { wch: 20 },
      { wch: 50 },
      { wch: 30 }
    ];
    ws['!cols'] = colWidths;

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Обучения');

    const fileName = `Обучения_${new Date().toLocaleDateString('ru')}.xlsx`;
    writeFile(wb, fileName);
  };

  const getOrderActions = (order: Order) => {
    const actions = [];

    if (order.status === 'prepared') {
      actions.push(
        <Button key="approve" variant="outline" size="sm" className="gap-1" onClick={() => orderHandlers.handleChangeOrderStatus(order.id, 'approved')}>
          <Icon name="CheckCircle2" size={14} />
          Согласовать
        </Button>
      );
    }

    if (order.status === 'approved') {
      actions.push(
        <Button key="send-sdo" variant="outline" size="sm" className="gap-1" onClick={() => orderHandlers.handleSendToSDO(order.id)}>
          <Icon name="Monitor" size={14} />
          СДО ИСП
        </Button>,
        <Button key="send-tc" variant="outline" size="sm" className="gap-1" onClick={() => {
          setSelectedOrderForTC(order);
          setShowSendToTCDialog(true);
        }}>
          <Icon name="Building2" size={14} />
          Учебный центр
        </Button>,
        <Button key="send-rostechnadzor" variant="outline" size="sm" className="gap-1" onClick={() => orderHandlers.handleRegisterRostechnadzor(order.id)}>
          <Icon name="Shield" size={14} />
          Ростехнадзор
        </Button>,
        <Button key="send-internal" variant="outline" size="sm" className="gap-1" onClick={() => orderHandlers.handleScheduleAttestation(order.id)}>
          <Icon name="ClipboardCheck" size={14} />
          ЕПТ организации
        </Button>
      );
    }

    return actions;
  };

  const orderStats = {
    total: tenantOrders.length,
    draft: tenantOrders.filter(o => o.status === 'draft').length,
    active: tenantOrders.filter(o => o.status === 'active').length,
    completed: tenantOrders.filter(o => o.status === 'completed').length,
  };

  const trainingStats = {
    total: tenantTrainings.length,
    planned: tenantTrainings.filter(t => t.status === 'planned').length,
    inProgress: tenantTrainings.filter(t => t.status === 'in_progress').length,
    totalCost: tenantTrainings.reduce((sum, t) => sum + t.cost, 0),
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="orders" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FileText" size={20} />
            <span className="text-xs font-medium">Приказы ({orderStats.total})</span>
          </TabsTrigger>
          <TabsTrigger value="attestation-orders" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="ClipboardCheck" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Приказы на<br/>аттестацию ({attestationOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="trainings" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="GraduationCap" size={20} />
            <span className="text-xs font-medium">Обучения ({trainingStats.total})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrdersTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            orderTypeFilter={orderTypeFilter}
            setOrderTypeFilter={setOrderTypeFilter}
            orderStatusFilter={orderStatusFilter}
            setOrderStatusFilter={setOrderStatusFilter}
            orderViewMode={orderViewMode}
            setOrderViewMode={setOrderViewMode}
            filteredOrders={filteredOrders}
            orderStats={orderStats}
            onChangeStatus={orderHandlers.handleChangeOrderStatus}
            onView={orderHandlers.handleViewOrder}
            onEdit={orderHandlers.handleEditOrder}
            onDownloadPDF={orderHandlers.handleDownloadOrderPDF}
            onPrint={orderHandlers.handlePrintOrder}
            onDelete={orderHandlers.handleDeleteOrder}
            onSendToTraining={(orderId) => {
              const order = orders.find(o => o.id === orderId);
              if (order) {
                setSelectedOrderForTC(order);
                setShowSendToTCDialog(true);
              }
            }}
            onSendToSDO={orderHandlers.handleSendToSDO}
            onExportToExcel={handleExportOrdersToExcel}
            onCreateOrder={() => setShowCreateOrderDialog(true)}
            getOrderActions={getOrderActions}
          />
        </TabsContent>

        <TabsContent value="attestation-orders">
          <AttestationOrdersList />
        </TabsContent>

        <TabsContent value="trainings">
          <TrainingsTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            trainingStatusFilter={trainingStatusFilter}
            setTrainingStatusFilter={setTrainingStatusFilter}
            trainingViewMode={trainingViewMode}
            setTrainingViewMode={setTrainingViewMode}
            filteredTrainings={filteredTrainings}
            trainingOrgs={trainingOrgs}
            personnel={personnel}
            people={people}
            positions={positions}
            expandedTrainings={expandedTrainings}
            trainingStats={trainingStats}
            onToggleExpanded={toggleTrainingExpanded}
            onEdit={trainingHandlers.handleEditTraining}
            onView={trainingHandlers.handleViewTraining}
            onViewDocuments={trainingHandlers.handleViewDocuments}
            onViewParticipants={trainingHandlers.handleViewParticipants}
            onDuplicate={trainingHandlers.handleDuplicateTraining}
            onDelete={trainingHandlers.handleDeleteTraining}
            onExportToExcel={handleExportTrainingsToExcel}
            onCreateTraining={() => setShowCreateTrainingDialog(true)}
          />
        </TabsContent>
      </Tabs>

      <CreateOrderDialog
        open={showCreateOrderDialog}
        onOpenChange={setShowCreateOrderDialog}
      />

      <CreateTrainingDialog
        open={showCreateTrainingDialog}
        onOpenChange={setShowCreateTrainingDialog}
      />

      <SendToTrainingCenterDialog
        open={showSendToTCDialog}
        onOpenChange={setShowSendToTCDialog}
        order={selectedOrderForTC}
      />
    </div>
  );
}