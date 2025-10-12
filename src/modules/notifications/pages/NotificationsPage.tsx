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
  const [activeTab, setActiveTab] = useState<'news' | 'system'>('news');
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotificationsStore();

  const platformNews = useMemo(() => {
    return notifications
      .filter(n => n.source === 'platform_news')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications]);

  const systemNotifications = useMemo(() => {
    return notifications
      .filter(n => n.source !== 'platform_news')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications]);

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
      case 'platform_news':
        return 'Новости платформы';
      case 'incident':
        return 'Инциденты';
      case 'attestation':
        return 'Аттестация';
      case 'catalog':
        return 'Каталог объектов';
      case 'system':
        return 'Система';
      default:
        return source;
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

  const unreadNewsCount = platformNews.filter(n => !n.isRead).length;
  const unreadSystemCount = systemNotifications.filter(n => !n.isRead).length;

  const renderNotifications = (items: typeof notifications) => {
    if (items.length === 0) {
      return (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Icon name="Bell" size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Нет уведомлений</p>
            <p className="text-sm mt-2">
              {activeTab === 'news' 
                ? 'Новостей пока нет' 
                : 'Системных уведомлений пока нет'}
            </p>
          </div>
        </Card>
      );
    }

    return items.map((notification) => (
      <Card
        key={notification.id}
        className={`p-4 hover:bg-muted/50 transition-colors ${
          !notification.isRead ? 'border-l-4 border-l-primary bg-blue-50/30 dark:bg-blue-950/20' : ''
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
    ));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Уведомления"
        description="Новости платформы и системные уведомления"
        action={
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/notifications/create')}
              className="gap-2"
            >
              <Icon name="Plus" size={16} />
              Создать уведомление
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <Icon name="ArrowLeft" size={16} />
              Назад
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'news' | 'system')}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="news" className="gap-2">
              <Icon name="Newspaper" size={16} />
              Новости платформы
              {unreadNewsCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 min-w-5 px-1.5">
                  {unreadNewsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Icon name="Bell" size={16} />
              Системные уведомления
              {unreadSystemCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 min-w-5 px-1.5">
                  {unreadSystemCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 ml-auto">
            {activeTab === 'news' ? (
              <>
                {unreadNewsCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => platformNews.filter(n => !n.isRead).forEach(n => markAsRead(n.id))}
                  >
                    <Icon name="CheckCheck" size={16} className="mr-1" />
                    Прочитать все
                  </Button>
                )}
              </>
            ) : (
              <>
                {unreadSystemCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => systemNotifications.filter(n => !n.isRead).forEach(n => markAsRead(n.id))}
                  >
                    <Icon name="CheckCheck" size={16} className="mr-1" />
                    Прочитать все
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <TabsContent value="news" className="space-y-3 mt-6">
          {renderNotifications(platformNews)}
        </TabsContent>

        <TabsContent value="system" className="space-y-3 mt-6">
          {renderNotifications(systemNotifications)}
        </TabsContent>
      </Tabs>
    </div>
  );
}