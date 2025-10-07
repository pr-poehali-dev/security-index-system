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

interface Order {
  id: string;
  number: string;
  date: string;
  type: 'attestation' | 'training' | 'suspension' | 'sdo' | 'training_center' | 'internal_attestation' | 'rostechnadzor';
  title: string;
  employees: string[];
  status: 'draft' | 'prepared' | 'approved' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
}

interface Training {
  id: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  employees: string[];
  organization: string;
  cost: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

const mockOrders: Order[] = [
  {
    id: '1',
    number: '15-А',
    date: '2025-10-01',
    type: 'attestation',
    title: 'О проведении аттестации по электробезопасности',
    employees: ['Иванов И.И.', 'Петрова А.С.'],
    status: 'active',
    createdBy: 'Смирнов А.В.'
  },
  {
    id: '2',
    number: '14-О',
    date: '2025-09-25',
    type: 'training',
    title: 'О направлении на обучение по промышленной безопасности',
    employees: ['Сидоров П.Н.'],
    status: 'completed',
    createdBy: 'Смирнов А.В.'
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
    status: 'planned'
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
    status: 'in_progress'
  },
];

export default function OrdersTrainingTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [trainingStatusFilter, setTrainingStatusFilter] = useState<string>('all');
  const [orderViewMode, setOrderViewMode] = useState<'cards' | 'table'>('cards');
  const [trainingViewMode, setTrainingViewMode] = useState<'cards' | 'table'>('cards');

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTrainings = mockTrainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          training.organization.toLowerCase().includes(searchQuery.toLowerCase());
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

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case 'attestation': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'training': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'suspension': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
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
    console.log(`Изменение статуса приказа ${orderId} на ${newStatus}`);
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

    if (order.type === 'sdo') {
      actions.push(
        <Button key="send-sdo" variant="outline" size="sm" className="gap-1">
          <Icon name="Send" size={14} />
          Отправить в СДО
        </Button>
      );
    }

    if (order.type === 'training_center') {
      actions.push(
        <Button key="send-tc" variant="outline" size="sm" className="gap-1">
          <Icon name="Send" size={14} />
          Отправить в УЦ
        </Button>
      );
    }

    if (order.type === 'internal_attestation') {
      actions.push(
        <Button key="schedule" variant="outline" size="sm" className="gap-1">
          <Icon name="Calendar" size={14} />
          Назначить дату
        </Button>
      );
    }

    if (order.type === 'rostechnadzor') {
      actions.push(
        <Button key="register" variant="outline" size="sm" className="gap-1">
          <Icon name="ExternalLink" size={14} />
          Зарегистрировать
        </Button>
      );
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders" className="gap-2">
            <Icon name="FileText" size={16} />
            Приказы
          </TabsTrigger>
          <TabsTrigger value="trainings" className="gap-2">
            <Icon name="GraduationCap" size={16} />
            Обучения
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Приказы</CardTitle>
                <div className="flex items-center gap-2">
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
                  <Button className="gap-2">
                    <Icon name="Plus" size={18} />
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
                    placeholder="Поиск по номеру или названию..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
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
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">Приказ №{order.number}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrderTypeColor(order.type)}`}>
                                {getOrderTypeLabel(order.type)}
                              </span>
                            </div>
                            <h3 className="font-medium mb-2">{order.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                                {order.employees.length} чел.
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Сотрудники:</span>
                            <span>{order.employees.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getOrderActions(order)}
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Icon name="Eye" size={14} />
                              Просмотр
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Icon name="Download" size={14} />
                              PDF
                            </Button>
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
                        <tr key={order.id} className="border-b last:border-0">
                          <td className="py-3 font-medium">№{order.number}</td>
                          <td className="py-3">{order.title}</td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getOrderTypeColor(order.type)}`}>
                              {getOrderTypeLabel(order.type)}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {new Date(order.date).toLocaleDateString('ru')}
                          </td>
                          <td className="py-3 text-center">{order.employees.length}</td>
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
                              {getOrderActions(order)}
                              <Button variant="ghost" size="sm">
                                <Icon name="Eye" size={16} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Icon name="Download" size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Приказы не найдены
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Обучения</CardTitle>
                <div className="flex items-center gap-2">
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
                  <Button className="gap-2">
                    <Icon name="Plus" size={18} />
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
                    placeholder="Поиск по названию или организации..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={trainingStatusFilter} onValueChange={setTrainingStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
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
                  {filteredTrainings.map((training) => (
                    <Card key={training.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{training.title}</h3>
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30">
                                {training.type}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Icon name="Building2" size={14} />
                                {training.organization}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Wallet" size={14} />
                                {training.cost.toLocaleString('ru')} ₽
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Calendar" size={14} />
                                {new Date(training.startDate).toLocaleDateString('ru')} - {new Date(training.endDate).toLocaleDateString('ru')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Users" size={14} />
                                {training.employees.length} чел.
                              </span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(training.status)}`}>
                            {getStatusLabel(training.status)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Сотрудники:</span>
                            <span>{training.employees.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Icon name="Edit" size={14} />
                              Изменить
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Icon name="FileText" size={14} />
                              Документы
                            </Button>
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
                      {filteredTrainings.map((training) => (
                        <tr key={training.id} className="border-b last:border-0">
                          <td className="py-3 font-medium">{training.title}</td>
                          <td className="py-3">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30">
                              {training.type}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">{training.organization}</td>
                          <td className="py-3 text-muted-foreground text-sm">
                            {new Date(training.startDate).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })} - {new Date(training.endDate).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })}
                          </td>
                          <td className="py-3 text-center">{training.employees.length}</td>
                          <td className="py-3 text-muted-foreground">{training.cost.toLocaleString('ru')} ₽</td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(training.status)}`}>
                              {getStatusLabel(training.status)}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Icon name="Edit" size={16} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Icon name="FileText" size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredTrainings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Обучения не найдены
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}