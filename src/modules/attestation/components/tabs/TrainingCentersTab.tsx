import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { getConnectionsByTenant, getCenterRequestsByTenant, updateConnection, updateCenterRequest } = useTrainingCentersStore();
  const connections = user?.tenantId ? getConnectionsByTenant(user.tenantId) : [];
  const requests = user?.tenantId ? getCenterRequestsByTenant(user.tenantId) : [];
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRequests = requests.filter((req) => 
    statusFilter === 'all' || req.status === statusFilter
  );

  const toggleConnectionActive = (id: string) => {
    const conn = connections.find(c => c.id === id);
    if (conn) {
      updateConnection(id, { isActive: !conn.isActive });
      toast({ title: conn.isActive ? 'Подключение деактивировано' : 'Подключение активировано' });
    }
  };

  const toggleAutoSend = (id: string) => {
    const conn = connections.find(c => c.id === id);
    if (conn) {
      updateConnection(id, { autoSendRequests: !conn.autoSendRequests });
      toast({ title: 'Настройки обновлены' });
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'received':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'in_training':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getRequestStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Отправлено';
      case 'received':
        return 'Получено УЦ';
      case 'in_training':
        return 'На обучении';
      case 'completed':
        return 'Завершено';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  const stats = {
    total: connections.length,
    active: connections.filter(c => c.isActive).length,
    autoSend: connections.filter(c => c.autoSendRequests).length,
    requests: requests.length
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="connections" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Link" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Подключения к<br/>учебным центрам</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Send" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Отправленные<br/>заявки</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Icon name="Link" size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Всего подключений</p>
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

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Icon name="FileText" size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.requests}</p>
                    <p className="text-xs text-muted-foreground">Заявок отправлено</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Как подключить учебный центр
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Учебные центры — это отдельные тенанты системы. Для подключения введите <strong>Tenant ID</strong> учебного центра. 
                    После подключения заявки будут доступны обеим сторонам, а удостоверения генерируются учебным центром.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Подключенные учебные центры</CardTitle>
                <Button className="gap-2">
                  <Icon name="Plus" size={18} />
                  Подключить УЦ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connections.map((conn) => (
                  <Card key={conn.id} className={!conn.isActive ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Switch
                              checked={conn.isActive}
                              onCheckedChange={() => toggleConnectionActive(conn.id)}
                            />
                            <h3 className="font-semibold text-lg">{conn.trainingCenterName}</h3>
                            {conn.isActive && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">
                                <Icon name="Link" size={12} className="mr-1" />
                                Подключен
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                              Tenant ID: {conn.trainingCenterTenantId}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Icon name="Edit" size={16} />
                        </Button>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium mb-2">Специализации:</p>
                        <div className="flex flex-wrap gap-2">
                          {conn.specializations.map((spec, idx) => (
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
                              checked={conn.autoSendRequests}
                              onCheckedChange={() => toggleAutoSend(conn.id)}
                              disabled={!conn.isActive}
                            />
                            <span className="text-sm">
                              Автоматическая отправка заявок
                            </span>
                          </div>
                          {conn.autoSendRequests && (
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

                {connections.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Link" size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="mb-4">Нет подключенных учебных центров</p>
                    <Button className="gap-2">
                      <Icon name="Plus" size={16} />
                      Подключить первый УЦ
                    </Button>
                  </div>
                )}
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
                      <SelectItem value="received">Получено УЦ</SelectItem>
                      <SelectItem value="in_training">На обучении</SelectItem>
                      <SelectItem value="completed">Завершено</SelectItem>
                      <SelectItem value="rejected">Отклонено</SelectItem>
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
                          <p className="text-sm text-muted-foreground mb-1">{request.programName}</p>
                          <p className="text-xs text-muted-foreground">{request.position}, {request.organizationName}</p>
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

                      {(request.status === 'received' || request.status === 'in_training' || request.status === 'completed') && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md mb-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {request.confirmationNumber && (
                              <div>
                                <span className="text-muted-foreground">Номер подтверждения:</span>{' '}
                                <span className="font-medium">{request.confirmationNumber}</span>
                              </div>
                            )}
                            {request.cost && (
                              <div>
                                <span className="text-muted-foreground">Стоимость:</span>{' '}
                                <span className="font-medium">{request.cost.toLocaleString()} ₽</span>
                              </div>
                            )}
                            {request.scheduledStartDate && (
                              <div>
                                <span className="text-muted-foreground">Начало обучения:</span>{' '}
                                <span className="font-medium">{new Date(request.scheduledStartDate).toLocaleDateString('ru')}</span>
                              </div>
                            )}
                            {request.scheduledEndDate && (
                              <div>
                                <span className="text-muted-foreground">Окончание:</span>{' '}
                                <span className="font-medium">{new Date(request.scheduledEndDate).toLocaleDateString('ru')}</span>
                              </div>
                            )}
                          </div>
                          {request.responseMessage && (
                            <p className="mt-2 text-sm text-purple-700 dark:text-purple-300">
                              <Icon name="Info" size={12} className="inline mr-1" />
                              {request.responseMessage}
                            </p>
                          )}
                        </div>
                      )}

                      {request.status === 'completed' && request.certificateIssued && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md mb-3">
                          <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                            <Icon name="Award" size={14} />
                            Удостоверение выдано учебным центром
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Номер удостоверения:</span>{' '}
                              <span className="font-medium">{request.certificateNumber}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Дата выдачи:</span>{' '}
                              <span className="font-medium">
                                {request.certificateIssueDate && new Date(request.certificateIssueDate).toLocaleDateString('ru')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Действительно до:</span>{' '}
                              <span className="font-medium text-green-600">
                                {request.certificateExpiryDate && new Date(request.certificateExpiryDate).toLocaleDateString('ru')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Срок действия:</span>{' '}
                              <span className="font-medium">{request.certificateValidityYears} лет</span>
                            </div>
                          </div>
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
      </Tabs>

      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-900">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Icon name="Workflow" size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                Как работает подключение к учебным центрам
              </h4>
              <div className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                <p><strong>1.</strong> Учебный центр регистрируется в системе как отдельный тенант</p>
                <p><strong>2.</strong> Вы подключаетесь к учебному центру по его Tenant ID</p>
                <p><strong>3.</strong> При согласовании заявки она автоматически отправляется в учебный центр</p>
                <p><strong>4.</strong> Учебный центр видит заявку в своем интерфейсе и подтверждает</p>
                <p><strong>5.</strong> После завершения обучения УЦ генерирует удостоверение со своими номером и датами</p>
                <p><strong>6.</strong> Удостоверение автоматически попадает в профиль сотрудника вашей организации</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
