import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import PageHeader from '@/components/layout/PageHeader';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'incident' | 'attestation' | 'catalog'>('all');
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotificationsStore();

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(n => n.source === sourceFilter);
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, filter, sourceFilter]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <Icon name="AlertCircle" size={24} className="text-red-500" />;
      case 'warning':
        return <Icon name="AlertTriangle" size={24} className="text-orange-500" />;
      case 'success':
        return <Icon name="CheckCircle" size={24} className="text-green-500" />;
      default:
        return <Icon name="Info" size={24} className="text-blue-500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'incident':
        return 'Инциденты';
      case 'attestation':
        return 'Аттестация';
      case 'catalog':
        return 'Каталог объектов';
      default:
        return 'Система';
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ru,
      });
    } catch {
      return 'недавно';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Уведомления"
        description="Все системные уведомления и оповещения"
        action={
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={16} />
            Назад
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">
              Все ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Непрочитанные ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Прочитанные ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSourceFilter('all')}
            className={sourceFilter === 'all' ? 'bg-primary text-primary-foreground' : ''}
          >
            Все
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSourceFilter('incident')}
            className={sourceFilter === 'incident' ? 'bg-primary text-primary-foreground' : ''}
          >
            <Icon name="AlertTriangle" size={16} className="mr-1" />
            Инциденты
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSourceFilter('attestation')}
            className={sourceFilter === 'attestation' ? 'bg-primary text-primary-foreground' : ''}
          >
            <Icon name="Award" size={16} className="mr-1" />
            Аттестация
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSourceFilter('catalog')}
            className={sourceFilter === 'catalog' ? 'bg-primary text-primary-foreground' : ''}
          >
            <Icon name="Building" size={16} className="mr-1" />
            Каталог
          </Button>
        </div>

        <div className="flex gap-2 ml-auto">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Icon name="CheckCheck" size={16} className="mr-1" />
              Прочитать все
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Icon name="Trash2" size={16} className="mr-1" />
              Очистить все
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Icon name="Bell" size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Нет уведомлений</p>
              <p className="text-sm mt-2">
                {filter === 'unread' 
                  ? 'Все уведомления прочитаны'
                  : sourceFilter !== 'all'
                  ? 'Нет уведомлений для выбранного модуля'
                  : 'У вас пока нет уведомлений'}
              </p>
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 hover:bg-muted/50 transition-colors ${
                !notification.isRead ? 'border-l-4 border-l-primary bg-blue-50/30' : ''
              } ${notification.link ? 'cursor-pointer' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`text-base font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="outline" className="text-xs">
                          {getSourceLabel(notification.source)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <Badge variant="default" className="text-xs">
                            Новое
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}