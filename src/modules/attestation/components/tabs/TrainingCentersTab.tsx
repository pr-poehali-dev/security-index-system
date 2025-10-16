import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/stores/authStore';
import { useTrainingCentersStore } from '@/stores/trainingCentersStore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TrainingCentersTab() {
  const user = useAuthStore((state) => state.user);
  const { getCentersByTenant, getCenterRequestsByTenant, updateCenter, updateCenterRequest } = useTrainingCentersStore();
  const centers = user?.tenantId ? getCentersByTenant(user.tenantId) : [];
  const requests = user?.tenantId ? getCenterRequestsByTenant(user.tenantId) : [];
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRequests = requests.filter((req) => 
    statusFilter === 'all' || req.status === statusFilter
  );

  const toggleCenterActive = (id: string) => {
    const center = centers.find(c => c.id === id);
    if (center) {
      updateCenter(id, { isActive: !center.isActive });
      toast({ title: center.isActive ? 'Учебный центр деактивирован' : 'Учебный центр активирован' });
    }
  };

  const toggleAutoSend = (id: string) => {
    const center = centers.find(c => c.id === id);
    if (center) {
      updateCenter(id, { autoSendRequests: !center.autoSendRequests });
      toast({ title: 'Настройки обновлены' });
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'received':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'failed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getRequestStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Отправлено';
      case 'received':
        return 'Получено';
      case 'confirmed':
        return 'Подтверждено';
      case 'rejected':
        return 'Отклонено';
      case 'failed':
        return 'Ошибка';
      default:
        return status;
    }
  };

  const stats = {
    total: centers.length,
    active: centers.filter(c => c.isActive).length,
    withApi: centers.filter(c => c.apiEnabled).length,
    autoSend: centers.filter(c => c.autoSendRequests).length
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="centers" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="centers" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Building2" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Учебные<br/>центры</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Send" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Отправленные<br/>заявки</span>
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Plug" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Интеграция<br/>API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="centers">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Icon name="Building2" size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Всего центров</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Icon name="CheckCircle2" size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.active}</p>
                    <p className="text-xs text-muted-foreground">Активных</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Icon name="Plug" size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.withApi}</p>
                    <p className="text-xs text-muted-foreground">С API</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Icon name="Zap" size={20} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.autoSend}</p>
                    <p className="text-xs text-muted-foreground">Автоотправка</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Список учебных центров</CardTitle>
                <Button className="gap-2">
                  <Icon name="Plus" size={18} />
                  Добавить центр
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {centers.map((center) => (
                  <Card key={center.id} className={!center.isActive ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Switch
                              checked={center.isActive}
                              onCheckedChange={() => toggleCenterActive(center.id)}
                            />
                            <h3 className="font-semibold text-lg">{center.name}</h3>
                            {center.isActive && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">
                                Активен
                              </Badge>
                            )}
                            {center.apiEnabled && (
                              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30">
                                <Icon name="Plug" size={12} className="mr-1" />
                                API
                              </Badge>
                            )}
                          </div>
                          {center.legalName && (
                            <p className="text-sm text-muted-foreground mb-2">{center.legalName}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Icon name="Edit" size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Icon name="User" size={14} className="text-muted-foreground" />
                            <span className="text-muted-foreground">Контакт:</span>
                            <span className="font-medium">{center.contactPerson}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Mail" size={14} className="text-muted-foreground" />
                            <a href={`mailto:${center.email}`} className="text-primary hover:underline">
                              {center.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Phone" size={14} className="text-muted-foreground" />
                            <a href={`tel:${center.phone}`} className="text-primary hover:underline">
                              {center.phone}
                            </a>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          {center.address && (
                            <div className="flex items-start gap-2">
                              <Icon name="MapPin" size={14} className="text-muted-foreground mt-0.5" />
                              <span>{center.address}</span>
                            </div>
                          )}
                          {center.website && (
                            <div className="flex items-center gap-2">
                              <Icon name="Globe" size={14} className="text-muted-foreground" />
                              <a href={center.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {center.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium mb-2">Специализации:</p>
                        <div className="flex flex-wrap gap-2">
                          {center.specializations.map((spec, idx) => (
                            <Badge key={idx} variant="outline">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={center.autoSendRequests}
                              onCheckedChange={() => toggleAutoSend(center.id)}
                              disabled={!center.isActive}
                            />
                            <span className="text-sm">
                              Автоматическая отправка заявок
                            </span>
                          </div>
                          {center.autoSendRequests && (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30">
                              <Icon name="Zap" size={12} className="mr-1" />
                              Автоотправка включена
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle>История отправленных заявок</CardTitle>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="sent">Отправлено</SelectItem>
                      <SelectItem value="received">Получено</SelectItem>
                      <SelectItem value="confirmed">Подтверждено</SelectItem>
                      <SelectItem value="rejected">Отклонено</SelectItem>
                      <SelectItem value="failed">Ошибка</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Icon name="Download" size={16} />
                    Экспорт
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{request.employeeName}</h3>
                            <Badge className={getRequestStatusColor(request.status)}>
                              {getRequestStatusLabel(request.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{request.programName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Учебный центр:</span>{' '}
                          <span className="font-medium">{request.trainingCenterName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Дата отправки:</span>{' '}
                          <span className="font-medium">{new Date(request.sendDate).toLocaleDateString('ru')}</span>
                        </div>
                      </div>

                      {request.status === 'confirmed' && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md mb-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Номер подтверждения:</span>{' '}
                              <span className="font-medium">{request.confirmationNumber}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Стоимость:</span>{' '}
                              <span className="font-medium">{request.cost?.toLocaleString()} ₽</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Начало обучения:</span>{' '}
                              <span className="font-medium">{request.scheduledStartDate && new Date(request.scheduledStartDate).toLocaleDateString('ru')}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Окончание:</span>{' '}
                              <span className="font-medium">{request.scheduledEndDate && new Date(request.scheduledEndDate).toLocaleDateString('ru')}</span>
                            </div>
                          </div>
                          {request.responseMessage && (
                            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                              <Icon name="Info" size={12} className="inline mr-1" />
                              {request.responseMessage}
                            </p>
                          )}
                        </div>
                      )}

                      {request.status === 'rejected' && request.responseMessage && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md text-sm text-red-700 dark:text-red-300">
                          <Icon name="AlertCircle" size={14} className="inline mr-1" />
                          {request.responseMessage}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {filteredRequests.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Заявок не найдено</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Интеграция с API учебных центров</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Как работает интеграция
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Заявки автоматически отправляются в учебные центры с включенной автоотправкой</li>
                        <li>• Система использует REST API для обмена данными</li>
                        <li>• Получение статусов и подтверждений происходит в реальном времени</li>
                        <li>• Все запросы логируются и доступны в истории</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {centers.filter(c => c.apiEnabled).map((center) => (
                    <Card key={center.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon name="Plug" size={20} className="text-purple-600" />
                          <h4 className="font-semibold">{center.name}</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">API Endpoint:</span>
                            <code className="block mt-1 p-2 bg-muted rounded text-xs break-all">
                              {center.apiEndpoint}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">
                              <Icon name="CheckCircle2" size={12} className="mr-1" />
                              Подключено
                            </Badge>
                            {center.autoSendRequests && (
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30">
                                <Icon name="Zap" size={12} className="mr-1" />
                                Автоотправка
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {centers.filter(c => c.apiEnabled).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Plug" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Нет подключенных интеграций</p>
                    <Button className="mt-4 gap-2">
                      <Icon name="Plus" size={16} />
                      Настроить интеграцию
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-900">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Icon name="Workflow" size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                Автоматический процесс обучения
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                <strong>1.</strong> Удостоверение ПК истекает → 
                <strong> 2.</strong> Создается заявка на обучение → 
                <strong> 3.</strong> Автоматически отправляется в учебный центр → 
                <strong> 4.</strong> Получаем подтверждение и дату обучения → 
                <strong> 5.</strong> Сотрудник проходит обучение
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
