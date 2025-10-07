import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useToast } from '@/hooks/use-toast';
import CreateOrderDialog from './CreateOrderDialog';
import CreateTrainingDialog from './CreateTrainingDialog';
import { useAuthStore } from '@/stores/authStore';
import { useAttestationStore } from '@/stores/attestationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';

const OLD_mockOrders = [
  {
    id: '1',
    number: '15-А',
    date: '2025-10-01',
    type: 'attestation',
    title: 'О проведении аттестации по электробезопасности',
    employees: ['Иванов И.И.', 'Петрова А.С.', 'Сидоров К.П.'],
    status: 'active',
    createdBy: 'Смирнов А.В.',
    description: 'Проведение внеочередной аттестации по электробезопасности на 4 группу'
  },
  {
    id: '2',
    number: '14-О',
    date: '2025-09-25',
    type: 'training',
    title: 'О направлении на обучение по промышленной безопасности',
    employees: ['Сидоров П.Н.'],
    status: 'completed',
    createdBy: 'Смирнов А.В.',
    description: 'Направление на обучение в УЦ "Профессионал"'
  },
  {
    id: '3',
    number: '13-С',
    date: '2025-09-20',
    type: 'suspension',
    title: 'Об отстранении от работы',
    employees: ['Морозова Е.П.'],
    status: 'active',
    createdBy: 'Смирнов А.В.',
    description: 'Отстранение до прохождения аттестации'
  },
  {
    id: '4',
    number: '12-А',
    date: '2025-09-15',
    type: 'sdo',
    title: 'О направлении на обучение в СДО',
    employees: ['Кузнецов А.В.', 'Васильев И.И.'],
    status: 'prepared',
    createdBy: 'Смирнов А.В.',
    description: 'Обучение охране труда через систему дистанционного обучения'
  },
  {
    id: '5',
    number: '11-А',
    date: '2025-09-10',
    type: 'internal_attestation',
    title: 'О проведении внутренней аттестации',
    employees: ['Соколов М.А.', 'Павлова Н.В.', 'Федоров Д.С.'],
    status: 'draft',
    createdBy: 'Смирнов А.В.',
    description: 'Аттестация в единой платформе тестирования организации'
  },
];

const mockTrainings: Training[] = [
  {
    id: '1',
    title: 'Промышленная безопасность',
    type: 'Повышение квалификации',
    startDate: '2025-10-15',
    endDate: '2025-10-20',
    employees: ['Сидоров П.Н.', 'Кузнецов А.В.'],
    organization: 'УЦ "Профессионал"',
    cost: 15000,
    status: 'planned',
    program: 'А.1 Общие требования промышленной безопасности',
    documents: ['Договор', 'Программа обучения']
  },
  {
    id: '2',
    title: 'Работы на высоте 2 группа',
    type: 'Первичная подготовка',
    startDate: '2025-10-05',
    endDate: '2025-10-10',
    employees: ['Морозова Е.П.'],
    organization: 'Центр ОТ',
    cost: 8000,
    status: 'in_progress',
    program: 'Работы на высоте с применением СИЗ от падения',
    documents: ['Договор', 'Программа обучения', 'Удостоверение']
  },
  {
    id: '3',
    title: 'Электробезопасность 4 группа до 1000В',
    type: 'Повышение квалификации',
    startDate: '2025-09-01',
    endDate: '2025-09-05',
    employees: ['Иванов И.И.', 'Петрова А.С.'],
    organization: 'Энергетический центр',
    cost: 12000,
    status: 'completed',
    program: 'Электробезопасность для электротехнического персонала',
    documents: ['Договор', 'Программа обучения', 'Удостоверение', 'Протокол']
  },
  {
    id: '4',
    title: 'Охрана труда для руководителей',
    type: 'Повышение квалификации',
    startDate: '2025-11-10',
    endDate: '2025-11-15',
    employees: ['Смирнов А.В.', 'Соколов М.А.'],
    organization: 'УЦ "Охрана труда"',
    cost: 18000,
    status: 'planned',
    program: 'Обучение по охране труда руководителей и специалистов',
    documents: ['Заявка']
  },
];

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

  const tenantOrders = user?.tenantId ? getOrdersByTenant(user.tenantId) : [];
  const tenantTrainings = user?.tenantId ? getTrainingsByTenant(user.tenantId) : [];
  const trainingOrgs = user?.tenantId ? getExternalOrganizationsByType(user.tenantId, 'training_center') : [];

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

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'attestation': return 'Аттестация';
      case 'training': return 'Обучение';
      case 'suspension': return 'Отстранение';
      case 'sdo': return 'СДО';
      case 'training_center': return 'Учебный центр';
      case 'internal_attestation': return 'ЕПТ организации';
      case 'rostechnadzor': return 'Ростехнадзор';
      default: return type;
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'attestation': return 'Award';
      case 'training': return 'GraduationCap';
      case 'suspension': return 'Ban';
      case 'sdo': return 'Monitor';
      case 'training_center': return 'Building2';
      case 'internal_attestation': return 'ClipboardCheck';
      case 'rostechnadzor': return 'Shield';
      default: return 'FileText';
    }
  };

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case 'attestation': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'training': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'suspension': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'sdo': return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30';
      case 'training_center': return 'text-violet-600 bg-violet-100 dark:bg-violet-900/30';
      case 'internal_attestation': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30';
      case 'rostechnadzor': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'prepared': return 'Подготовлен';
      case 'approved': return 'Согласован';
      case 'active': return 'Активен';
      case 'completed': return 'Исполнен';
      case 'cancelled': return 'Отменен';
      case 'planned': return 'Запланировано';
      case 'in_progress': return 'В процессе';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
      case 'prepared': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'approved': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
      case 'active': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'completed': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'planned': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'in_progress': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const handleChangeOrderStatus = (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Статус изменен",
      description: `Приказ №${order?.number}: ${getStatusLabel(newStatus)}`,
    });
  };

  const handleChangeTrainingStatus = (trainingId: string, newStatus: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Статус изменен",
      description: `Обучение "${training?.title}": ${getStatusLabel(newStatus)}`,
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
    toast({
      title: "Направление в учебный центр",
      description: `Приказ №${order?.number}: ${order?.employeeIds.length} сотрудников направлены на подготовку в учебный центр`,
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
      'Тип': getOrderTypeLabel(order.type),
      'Название': order.title,
      'Статус': getStatusLabel(order.status),
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
        'Статус': getStatusLabel(training.status),
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
        <TabsList>
          <TabsTrigger value="orders" className="gap-2">
            <Icon name="FileText" size={16} />
            Приказы
            <Badge variant="secondary" className="ml-1">{orderStats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="trainings" className="gap-2">
            <Icon name="GraduationCap" size={16} />
            Обучения
            <Badge variant="secondary" className="ml-1">{trainingStats.total}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Всего приказов</p>
                    <p className="text-2xl font-bold">{orderStats.total}</p>
                  </div>
                  <Icon name="FileText" size={24} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Черновики</p>
                    <p className="text-2xl font-bold">{orderStats.draft}</p>
                  </div>
                  <Icon name="FilePen" size={24} className="text-gray-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Активные</p>
                    <p className="text-2xl font-bold">{orderStats.active}</p>
                  </div>
                  <Icon name="CheckCircle2" size={24} className="text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Исполнено</p>
                    <p className="text-2xl font-bold">{orderStats.completed}</p>
                  </div>
                  <Icon name="CheckCheck" size={24} className="text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

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
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
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
                            <Select value={order.status} onValueChange={(value) => handleChangeOrderStatus(order.id, value)}>
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
                                <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                                  <Icon name="Eye" size={14} className="mr-2" />
                                  Просмотр
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditOrder(order.id)}>
                                  <Icon name="Edit" size={14} className="mr-2" />
                                  Редактировать
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadOrderPDF(order.id)}>
                                  <Icon name="Download" size={14} className="mr-2" />
                                  Скачать PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePrintOrder(order.id)}>
                                  <Icon name="Printer" size={14} className="mr-2" />
                                  Печать
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteOrder(order.id)}>
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
              ) : (
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
                      {filteredOrders.map((order) => (
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
                            <Select value={order.status} onValueChange={(value) => handleChangeOrderStatus(order.id, value)}>
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
                              <Button variant="ghost" size="sm" title="Просмотр" onClick={() => handleViewOrder(order.id)}>
                                <Icon name="Eye" size={16} />
                              </Button>
                              <Button variant="ghost" size="sm" title="Редактировать" onClick={() => handleEditOrder(order.id)}>
                                <Icon name="Edit" size={16} />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Icon name="MoreVertical" size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDownloadOrderPDF(order.id)}>
                                    <Icon name="Download" size={14} className="mr-2" />
                                    Скачать PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePrintOrder(order.id)}>
                                    <Icon name="Printer" size={14} className="mr-2" />
                                    Печать
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteOrder(order.id)}>
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
              )}

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Приказы не найдены</p>
                  <p className="text-sm text-muted-foreground">Измените параметры поиска или создайте новый приказ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainings" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Всего обучений</p>
                    <p className="text-2xl font-bold">{trainingStats.total}</p>
                  </div>
                  <Icon name="GraduationCap" size={24} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Запланировано</p>
                    <p className="text-2xl font-bold">{trainingStats.planned}</p>
                  </div>
                  <Icon name="CalendarClock" size={24} className="text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">В процессе</p>
                    <p className="text-2xl font-bold">{trainingStats.inProgress}</p>
                  </div>
                  <Icon name="Clock" size={24} className="text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Бюджет</p>
                    <p className="text-2xl font-bold">{trainingStats.totalCost.toLocaleString('ru')} ₽</p>
                  </div>
                  <Icon name="Wallet" size={24} className="text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

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
                <div className="space-y-3">
                  {filteredTrainings.map((training) => {
                    const org = trainingOrgs.find(o => o.id === training.organizationId);
                    const duration = Math.ceil((new Date(training.endDate).getTime() - new Date(training.startDate).getTime()) / (1000 * 60 * 60 * 24));
                    const costPerPerson = Math.round(training.cost / training.employeeIds.length);
                    
                    return (
                      <Card key={training.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon name="GraduationCap" size={18} className="text-muted-foreground" />
                                <h3 className="font-semibold text-lg">{training.title}</h3>
                              </div>
                              <Badge className="mb-3 text-purple-600 bg-purple-100 dark:bg-purple-900/30">
                                {training.type}
                              </Badge>
                              {training.program && (
                                <p className="text-sm text-muted-foreground mb-3">{training.program}</p>
                              )}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Icon name="Building2" size={14} />
                                  {org?.name || '—'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="Wallet" size={14} />
                                  {training.cost.toLocaleString('ru')} ₽ ({costPerPerson.toLocaleString('ru')} ₽/чел)
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="Calendar" size={14} />
                                  {new Date(training.startDate).toLocaleDateString('ru')} - {new Date(training.endDate).toLocaleDateString('ru')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="Clock" size={14} />
                                  {duration} {duration === 1 ? 'день' : duration < 5 ? 'дня' : 'дней'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="Users" size={14} />
                                  {training.employeeIds.length} чел.
                                </span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(training.status)}>
                              {getStatusLabel(training.status)}
                            </Badge>
                          </div>

                          {training.status === 'in_progress' && training.sdoProgress !== undefined && (
                            <div className="pt-3 border-t">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Прогресс в СДО ИСП</span>
                                <span className="text-sm font-semibold text-primary">{training.sdoProgress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 mb-2">
                                <div 
                                  className="bg-primary rounded-full h-2 transition-all duration-300" 
                                  style={{ width: `${training.sdoProgress}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Пройдено уроков: {training.sdoCompletedLessons} из {training.sdoTotalLessons}
                              </p>
                            </div>
                          )}

                          {training.status === 'completed' && training.certificateNumber && (
                            <div className="pt-3 border-t bg-emerald-50 dark:bg-emerald-950/20 -mx-4 px-4 pb-3 mt-3">
                              <div className="flex items-start gap-2">
                                <Icon name="Award" size={16} className="text-emerald-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                    Удостоверение о повышении квалификации
                                  </p>
                                  <div className="mt-1 space-y-1">
                                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                      Номер: <span className="font-semibold">{training.certificateNumber}</span>
                                    </p>
                                    {training.certificateIssueDate && (
                                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                        Дата выдачи: {new Date(training.certificateIssueDate).toLocaleDateString('ru')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Сотрудников:</span>
                              <span className="font-medium">{training.employeeIds.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="gap-2" onClick={() => handleEditTraining(training.id)}>
                                <Icon name="Edit" size={14} />
                                Изменить
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Icon name="MoreVertical" size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewTraining(training.id)}>
                                    <Icon name="Eye" size={14} className="mr-2" />
                                    Просмотр
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewDocuments(training.id)}>
                                    <Icon name="FileText" size={14} className="mr-2" />
                                    Документы
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewParticipants(training.id)}>
                                    <Icon name="Users" size={14} className="mr-2" />
                                    Список участников
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDuplicateTraining(training.id)}>
                                    <Icon name="Copy" size={14} className="mr-2" />
                                    Дублировать
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTraining(training.id)}>
                                    <Icon name="Trash2" size={14} className="mr-2" />
                                    Удалить
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-3 font-medium">Название</th>
                        <th className="pb-3 font-medium">Тип</th>
                        <th className="pb-3 font-medium">Организация</th>
                        <th className="pb-3 font-medium">Даты</th>
                        <th className="pb-3 font-medium">Сотрудников</th>
                        <th className="pb-3 font-medium">Стоимость</th>
                        <th className="pb-3 font-medium">Статус</th>
                        <th className="pb-3 font-medium">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrainings.map((training) => {
                        const org = trainingOrgs.find(o => o.id === training.organizationId);
                        const costPerPerson = Math.round(training.cost / training.employeeIds.length);
                        
                        return (
                          <tr key={training.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-3">
                              <div>
                                <div className="font-medium">{training.title}</div>
                                {training.program && (
                                  <div className="text-xs text-muted-foreground mt-1">{training.program}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge className="text-purple-600 bg-purple-100 dark:bg-purple-900/30">
                                {training.type}
                              </Badge>
                            </td>
                            <td className="py-3 text-muted-foreground text-sm">{org?.name || '—'}</td>
                            <td className="py-3 text-muted-foreground text-sm">
                              <div>{new Date(training.startDate).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })}</div>
                              <div>{new Date(training.endDate).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })}</div>
                            </td>
                            <td className="py-3 text-center">{training.employeeIds.length}</td>
                            <td className="py-3 text-muted-foreground text-sm">
                              <div className="font-medium">{training.cost.toLocaleString('ru')} ₽</div>
                              <div className="text-xs">{costPerPerson.toLocaleString('ru')} ₽/чел</div>
                            </td>
                            <td className="py-3">
                              <Badge className={getStatusColor(training.status)}>
                                {getStatusLabel(training.status)}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" title="Просмотр" onClick={() => handleViewTraining(training.id)}>
                                  <Icon name="Eye" size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" title="Редактировать" onClick={() => handleEditTraining(training.id)}>
                                  <Icon name="Edit" size={16} />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Icon name="MoreVertical" size={16} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewDocuments(training.id)}>
                                      <Icon name="FileText" size={14} className="mr-2" />
                                      Документы
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewParticipants(training.id)}>
                                      <Icon name="Users" size={14} className="mr-2" />
                                      Список участников
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDuplicateTraining(training.id)}>
                                      <Icon name="Copy" size={14} className="mr-2" />
                                      Дублировать
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTraining(training.id)}>
                                      <Icon name="Trash2" size={14} className="mr-2" />
                                      Удалить
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredTrainings.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="GraduationCap" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Обучения не найдены</p>
                  <p className="text-sm text-muted-foreground">Измените параметры поиска или запланируйте новое обучение</p>
                </div>
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