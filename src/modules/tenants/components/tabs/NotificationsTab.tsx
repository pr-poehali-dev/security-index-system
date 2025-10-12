import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

export default function NotificationsTab() {
  const [notificationSettings, setNotificationSettings] = useState({
    expiringLicenses: true,
    newTenants: true,
    statusChanges: true,
    systemUpdates: false
  });

  const notifications = [
    {
      id: '1',
      title: 'Истекает лицензия: ООО "Промтех"',
      message: 'Лицензия истекает через 15 дней',
      time: '2 часа назад',
      type: 'warning',
      icon: 'AlertTriangle'
    },
    {
      id: '2',
      title: 'Создан новый тенант',
      message: 'ООО "Стройинвест" успешно зарегистрирован в системе',
      time: '5 часов назад',
      type: 'info',
      icon: 'Building2'
    },
    {
      id: '3',
      title: 'Истекла лицензия: ООО "ТехноСервис"',
      message: 'Доступ к системе приостановлен',
      time: '1 день назад',
      type: 'error',
      icon: 'XCircle'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-600';
      case 'error': return 'bg-red-100 dark:bg-red-900/20 text-red-600';
      case 'info': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Системные уведомления</CardTitle>
              <CardDescription>
                История событий и уведомлений по тенантам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                      <Icon name={notification.icon as any} size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="expiring" className="text-sm">
                  Истекающие лицензии
                </Label>
                <Switch
                  id="expiring"
                  checked={notificationSettings.expiringLicenses}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, expiringLicenses: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="new" className="text-sm">
                  Новые тенанты
                </Label>
                <Switch
                  id="new"
                  checked={notificationSettings.newTenants}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, newTenants: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="status" className="text-sm">
                  Изменения статуса
                </Label>
                <Switch
                  id="status"
                  checked={notificationSettings.statusChanges}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, statusChanges: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="updates" className="text-sm">
                  Системные обновления
                </Label>
                <Switch
                  id="updates"
                  checked={notificationSettings.systemUpdates}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, systemUpdates: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Отправить уведомление</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Текст уведомления для всех тенантов..."
                rows={4}
              />
              <Button className="w-full">
                <Icon name="Send" className="mr-2" size={16} />
                Отправить всем
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
