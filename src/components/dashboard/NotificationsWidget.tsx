import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ROUTES } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function NotificationsWidget() {
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotificationsStore();

  const recentNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <Icon name="AlertCircle" size={18} className="text-red-500" />;
      case 'warning':
        return <Icon name="AlertTriangle" size={18} className="text-orange-500" />;
      case 'success':
        return <Icon name="CheckCircle" size={18} className="text-green-500" />;
      default:
        return <Icon name="Info" size={18} className="text-blue-500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'incident':
        return 'Инциденты';
      case 'attestation':
        return 'Аттестация';
      case 'catalog':
        return 'Каталог';
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bell" size={20} className="text-blue-600" />
            Уведомления
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          >
            Все уведомления
            <Icon name="ArrowRight" size={14} className="ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Bell" size={48} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Нет уведомлений</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  !notification.isRead 
                    ? 'border-l-4 border-l-primary bg-blue-50/50 dark:bg-blue-900/10 border-gray-200 dark:border-gray-700' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-gray-900 dark:text-white truncate ${!notification.isRead ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {getSourceLabel(notification.source)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </span>
                      {!notification.isRead && (
                        <Badge variant="default" className="text-xs px-1.5 py-0">
                          Новое
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
