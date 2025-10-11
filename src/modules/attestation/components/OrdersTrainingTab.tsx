import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import CreateOrderDialog from './CreateOrderDialog';
import CreateTrainingDialog from './CreateTrainingDialog';
import OrdersStats from './OrdersStats';
import TrainingsStats from './TrainingsStats';
import OrdersCardView from './OrdersCardView';
import OrdersTableView from './OrdersTableView';
import TrainingsCardView from './TrainingsCardView';
import TrainingsTableView from './TrainingsTableView';
import { useAuthStore } from '@/stores/authStore';
import { useAttestationStore } from '@/stores/attestationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTrainingCenterStore } from '@/stores/trainingCenterStore';
import type { Order } from '@/types';

export default function OrdersTrainingTab() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { orders, trainings, getOrdersByTenant, getTrainingsByTenant } = useAttestationStore();
  const { personnel, people, positions, getExternalOrganizationsByType } = useSettingsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');
  const [trainingStatusFilter, setTrainingStatusFilter] = useState<string>('all');
  const [orderViewMode, setOrderViewMode] = useState<'cards' | 'table'>('cards');
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
  const [showCreateTrainingDialog, setShowCreateTrainingDialog] = useState(false);
  const [trainingViewMode, setTrainingViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedTrainings, setExpandedTrainings] = useState<Set<string>>(new Set());

  const tenantOrders = user?.tenantId ? getOrdersByTenant(user.tenantId) : [];
  const tenantTrainings = user?.tenantId ? getTrainingsByTenant(user.tenantId) : [];
  const trainingOrgs = user?.tenantId ? getExternalOrganizationsByType(user.tenantId, 'training_center') : [];

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

  const handleChangeOrderStatus = (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Статус изменен",
      description: `Приказ №${order?.number}: ${newStatus}`,
    });
  };

  const handleChangeTrainingStatus = (trainingId: string, newStatus: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Статус изменен",
      description: `Обучение "${training?.title}": ${newStatus}`,
    });
  };

  const handleSendToSDO = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Направление в СДО «Интеллектуальные системы подготовки»",
      description: `Приказ №${order?.number}: ${order?.employeeIds.length} сотрудников направлены на обучение в систему дистанционного обучения`,
    });
  };

  const handleSendToTrainingCenter = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !user?.tenantId) return;

    const { addRequest } = useTrainingCenterStore.getState();
    
    const employeesList = order.employeeIds.map(empId => {
      const emp = personnel.find(p => p.id === empId);
      const person = people.find(p => p.id === emp?.personId);
      const position = positions.find(pos => pos.id === emp?.positionId);
      
      return {
        personnelId: empId,
        fullName: person ? `${person.lastName} ${person.firstName} ${person.middleName || ''}`.trim() : 'Неизвестный',
        position: position?.name || 'Не указана',
        department: undefined
      };
    });

    const request: any = {
      id: `req-${Date.now()}`,
      tenantId: user.tenantId,
      organizationId: order.organizationId || '',
      organizationName: 'Основная организация',
      programId: '',
      programName: order.title,
      requestDate: new Date().toISOString(),
      studentsCount: employeesList.length,
      students: employeesList,
      contactPerson: order.createdBy,
      status: 'new',
      notes: `Заявка создана из приказа №${order.number}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRequest(request);

    toast({
      title: "Заявка отправлена в учебный центр",
      description: `Приказ №${order.number}: ${order.employeeIds.length} сотрудников направлены на подготовку в учебный центр`,
    });
  };

  const handleScheduleAttestation = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Направление на аттестацию в ЕПТ организации",
      description: `Приказ №${order?.number}: ${order?.employeeIds.length} сотрудников направлены на аттестацию в единой платформе тестирования организации`,
    });
  };

  const handleRegisterRostechnadzor = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Направление на аттестацию в Ростехнадзоре",
      description: `Приказ №${order?.number}: ${order?.employeeIds.length} сотрудников направлены на аттестацию в системе Ростехнадзора`,
    });
  };

  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Просмотр приказа",
      description: `Приказ №${order?.number} - ${order?.title}`,
    });
  };

  const handleEditOrder = (orderId: string) => {
    toast({
      title: "Редактирование приказа",
      description: "Откроется форма редактирования приказа",
    });
  };

  const handleDownloadOrderPDF = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Загрузка PDF",
      description: `Приказ №${order?.number} будет загружен в формате PDF`,
    });
  };

  const handlePrintOrder = (orderId: string) => {
    toast({
      title: "Печать приказа",
      description: "Откроется окно печати",
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Удаление приказа",
      description: `Приказ №${order?.number} будет удален`,
      variant: "destructive",
    });
  };

  const handleViewTraining = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Просмотр обучения",
      description: training?.title,
    });
  };

  const handleEditTraining = (trainingId: string) => {
    toast({
      title: "Редактирование обучения",
      description: "Откроется форма редактирования",
    });
  };

  const handleViewDocuments = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Документы обучения",
      description: `Документов: ${training?.documents?.length || 0}`,
    });
  };

  const handleViewParticipants = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Список участников",
      description: `Участников: ${training?.employeeIds.length}`,
    });
  };

  const handleDuplicateTraining = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Дублирование обучения",
      description: `Создана копия: ${training?.title}`,
    });
  };

  const handleDeleteTraining = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Удаление обучения",
      description: `${training?.title} будет удалено`,
      variant: "destructive",
    });
  };

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
        <Button key="approve" variant="outline" size="sm" className="gap-1" onClick={() => handleChangeOrderStatus(order.id, 'approved')}>
          <Icon name="CheckCircle2" size={14} />
          Согласовать
        </Button>
      );
    }

    if (order.status === 'approved') {
      actions.push(
        <Button key="send-sdo" variant="outline" size="sm" className="gap-1" onClick={() => handleSendToSDO(order.id)}>
          <Icon name="Monitor" size={14} />
          СДО ИСП
        </Button>,
        <Button key="send-tc" variant="outline" size="sm" className="gap-1" onClick={() => handleSendToTrainingCenter(order.id)}>
          <Icon name="Building2" size={14} />
          Учебный центр
        </Button>,
        <Button key="send-rostechnadzor" variant="outline" size="sm" className="gap-1" onClick={() => handleRegisterRostechnadzor(order.id)}>
          <Icon name="Shield" size={14} />
          Ростехнадзор
        </Button>,
        <Button key="send-internal" variant="outline" size="sm" className="gap-1" onClick={() => handleScheduleAttestation(order.id)}>
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
          <TabsTrigger value="trainings" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="GraduationCap" size={20} />
            <span className="text-xs font-medium">Обучения ({trainingStats.total})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
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
                  <Button
                    variant={orderViewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrderViewMode('cards')}
                    className="gap-2"
                  >
                    <Icon name="LayoutGrid" size={16} />
                    Карточки
                  </Button>
                  <Button
                    variant={orderViewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrderViewMode('table')}
                    className="gap-2"
                  >
                    <Icon name="Table" size={16} />
                    Таблица
                  </Button>
                  <Button variant="outline" onClick={handleExportOrdersToExcel} className="gap-2">
                    <Icon name="Download" size={16} />
                    Экспорт
                  </Button>
                  <Button onClick={() => setShowCreateOrderDialog(true)} className="gap-2">
                    <Icon name="Plus" size={16} />
                    Создать приказ
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

              {orderViewMode === 'cards' ? (
                <OrdersCardView
                  orders={filteredOrders}
                  onChangeStatus={handleChangeOrderStatus}
                  onView={handleViewOrder}
                  onEdit={handleEditOrder}
                  onDownloadPDF={handleDownloadOrderPDF}
                  onPrint={handlePrintOrder}
                  onDelete={handleDeleteOrder}
                  getOrderActions={getOrderActions}
                />
              ) : (
                <OrdersTableView
                  orders={filteredOrders}
                  onChangeStatus={handleChangeOrderStatus}
                  onView={handleViewOrder}
                  onEdit={handleEditOrder}
                  onDownloadPDF={handleDownloadOrderPDF}
                  onPrint={handlePrintOrder}
                  onDelete={handleDeleteOrder}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainings" className="space-y-4">
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon name="Construction" size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Раздел находится в разработке
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Функционал планирования и управления обучениями находится в стадии разработки. 
                    В ближайшее время здесь появится возможность планировать обучения, отслеживать прогресс 
                    и получать данные из СДО и учебных центров в автоматическом режиме.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <TrainingsStats
            total={trainingStats.total}
            planned={trainingStats.planned}
            inProgress={trainingStats.inProgress}
            totalCost={trainingStats.totalCost}
          />

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Список обучений</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant={trainingViewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrainingViewMode('cards')}
                    className="gap-2"
                  >
                    <Icon name="LayoutGrid" size={16} />
                    Карточки
                  </Button>
                  <Button
                    variant={trainingViewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrainingViewMode('table')}
                    className="gap-2"
                  >
                    <Icon name="Table" size={16} />
                    Таблица
                  </Button>
                  <Button variant="outline" onClick={handleExportTrainingsToExcel} className="gap-2">
                    <Icon name="Download" size={16} />
                    Экспорт
                  </Button>
                  <Button onClick={() => setShowCreateTrainingDialog(true)} className="gap-2">
                    <Icon name="Plus" size={16} />
                    Запланировать обучение
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию, организации или сотрудникам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={trainingStatusFilter} onValueChange={setTrainingStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="planned">Запланировано</SelectItem>
                    <SelectItem value="in_progress">В процессе</SelectItem>
                    <SelectItem value="completed">Завершено</SelectItem>
                    <SelectItem value="cancelled">Отменено</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {trainingViewMode === 'cards' ? (
                <TrainingsCardView
                  trainings={filteredTrainings}
                  trainingOrgs={trainingOrgs}
                  personnel={personnel}
                  people={people}
                  positions={positions}
                  expandedTrainings={expandedTrainings}
                  onToggleExpanded={toggleTrainingExpanded}
                  onEdit={handleEditTraining}
                  onView={handleViewTraining}
                  onViewDocuments={handleViewDocuments}
                  onViewParticipants={handleViewParticipants}
                  onDuplicate={handleDuplicateTraining}
                  onDelete={handleDeleteTraining}
                />
              ) : (
                <TrainingsTableView
                  trainings={filteredTrainings}
                  trainingOrgs={trainingOrgs}
                  onView={handleViewTraining}
                  onEdit={handleEditTraining}
                  onViewDocuments={handleViewDocuments}
                  onViewParticipants={handleViewParticipants}
                  onDuplicate={handleDuplicateTraining}
                  onDelete={handleDeleteTraining}
                />
              )}

              <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Интеграция с СДО и учебными центрами
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        Система автоматически отслеживает прогресс обучения в СДО «Интеллектуальные системы подготовки» 
                        и получает данные об удостоверениях из учебных центров.
                      </p>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4">
                        <li>• Обучения со статусом "В процессе" показывают прогресс в СДО</li>
                        <li>• Завершённые обучения отображают номер и дату выдачи удостоверения</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
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
    </div>
  );
}
