import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

export default function NotificationsTab() {
  const user = useAuthStore((state) => state.user);
  const { 
    getNotificationRulesByTenant, 
    getNotificationLogsByTenant,
    updateNotificationRule 
  } = useNotificationStore();
  
  const rules = user?.tenantId ? getNotificationRulesByTenant(user.tenantId) : [];
  const logs = user?.tenantId ? getNotificationLogsByTenant(user.tenantId) : [];
  const [editingRule, setEditingRule] = useState<any>(null);
  const { toast } = useToast();

  const toggleRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      updateNotificationRule(ruleId, { enabled: !rule.enabled });
      toast({ title: 'Правило обновлено' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'pending': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Отправлено';
      case 'failed': return 'Ошибка';
      case 'pending': return 'В очереди';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="rules" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Settings" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Правила<br/>уведомлений</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="History" size={20} />
            <span className="text-xs font-medium text-center leading-tight">История<br/>отправки</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Mail" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Настройки<br/>email</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Правила автоматических уведомлений</CardTitle>
                <Button className="gap-2">
                  <Icon name="Plus" size={18} />
                  Добавить правило
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <Card key={rule.id} className={!rule.enabled ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={() => toggleRule(rule.id)}
                            />
                            <h3 className="font-semibold text-lg">{rule.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              rule.enabled ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 
                              'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
                            }`}>
                              {rule.enabled ? 'Активно' : 'Отключено'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Icon name="Calendar" size={14} />
                              <span>За {rule.daysBeforeExpiry} дней до истечения</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Icon name="RefreshCw" size={14} />
                              <span>Частота: {
                                rule.frequency === 'once' ? 'Однократно' :
                                rule.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'
                              }</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingRule(rule)}
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Получатели уведомлений:</p>
                        <div className="flex flex-wrap gap-2">
                          {rule.notifyEmployee && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              <Icon name="User" size={12} />
                              Сотрудник
                            </span>
                          )}
                          {rule.notifyManager && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              <Icon name="UserCheck" size={12} />
                              Руководитель
                            </span>
                          )}
                          {rule.notifyHR && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              <Icon name="Briefcase" size={12} />
                              Отдел кадров
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Автоматическая отправка
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Система автоматически проверяет истекающие аттестации каждые 24 часа и отправляет 
                        уведомления согласно настроенным правилам. Сотрудники и их руководители получают 
                        письма на корпоративную почту.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>История отправленных уведомлений</CardTitle>
                <Button variant="outline" className="gap-2">
                  <Icon name="Download" size={16} />
                  Экспорт
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input type="date" placeholder="Дата от" />
                  <Input type="date" placeholder="Дата до" />
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="sent">Отправлено</SelectItem>
                      <SelectItem value="failed">Ошибка</SelectItem>
                      <SelectItem value="pending">В очереди</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 font-medium">Дата и время</th>
                      <th className="pb-3 font-medium">Тип уведомления</th>
                      <th className="pb-3 font-medium">Получатель</th>
                      <th className="pb-3 font-medium">Сотрудник</th>
                      <th className="pb-3 font-medium">Аттестация</th>
                      <th className="pb-3 font-medium">Истекает</th>
                      <th className="pb-3 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="py-3 text-sm">{log.date}</td>
                        <td className="py-3 text-sm text-muted-foreground">{log.type}</td>
                        <td className="py-3 text-sm">{log.recipient}</td>
                        <td className="py-3 text-sm">{log.employee}</td>
                        <td className="py-3 text-sm text-muted-foreground">{log.certification}</td>
                        <td className="py-3 text-sm">{new Date(log.expiryDate).toLocaleDateString('ru')}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            <Icon name={log.status === 'sent' ? 'CheckCircle2' : log.status === 'failed' ? 'XCircle' : 'Clock'} size={12} />
                            {getStatusLabel(log.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {logs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>История пуста</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Настройки email уведомлений</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Email отдела кадров (HR)</Label>
                  <Input 
                    type="email" 
                    placeholder="hr@company.ru"
                    defaultValue="hr@company.ru"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    На этот адрес будут приходить все критичные уведомления
                  </p>
                </div>

                <div>
                  <Label>Email отправителя</Label>
                  <Input 
                    type="email" 
                    placeholder="noreply@company.ru"
                    defaultValue="noreply@company.ru"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    От имени этого адреса отправляются уведомления
                  </p>
                </div>

                <div>
                  <Label>Копия администратору</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Switch defaultChecked />
                    <span className="text-sm text-muted-foreground">
                      Отправлять копию всех уведомлений администратору системы
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-4">Шаблоны писем</h4>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">За 90 дней до истечения</h5>
                          <p className="text-sm text-muted-foreground">Первое напоминание о плановой аттестации</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Icon name="Edit" size={14} />
                          Изменить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">За 30 дней до истечения</h5>
                          <p className="text-sm text-muted-foreground">Уведомление для подготовки к аттестации</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Icon name="Edit" size={14} />
                          Изменить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">За 7 дней до истечения</h5>
                          <p className="text-sm text-muted-foreground">Срочное уведомление о скором истечении</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Icon name="Edit" size={14} />
                          Изменить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button className="gap-2">
                  <Icon name="Save" size={16} />
                  Сохранить настройки
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
